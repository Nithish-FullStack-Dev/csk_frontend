import React, { useEffect, useState, useRef, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaperclipIcon, Send, Smile, MoreVertical } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext"; // Assuming your AuthContext
import axios from "axios"; // For user fetching
import { db } from "@/config/firebaseConfig"; // Your Firebase DB instance
import {
  onValue,
  push,
  ref,
  remove,
  serverTimestamp,
  set,
  onDisconnect,
  get,
} from "firebase/database";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

// --- Interfaces ---
interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  // Add other user properties you might have
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  timestamp: number; // Storing as number (milliseconds) for easier sorting/comparison
  edited: boolean;
}

const ChatInterface = () => {
  const { user } = useAuth(); // Get current user from AuthContext
  const [activeTab, setActiveTab] = useState("direct");
  const [messageInput, setMessageInput] = useState("");
  const [users, setUsers] = useState<User[]>([]); // All users fetched from backend
  const [selectedUser, setSelectedUser] = useState<User | null>(null); // Currently selected chat partner
  const [messages, setMessages] = useState<Message[]>([]); // Messages for the active chat
  const [editingMessage, setEditingMessage] = useState<Message | null>(null); // Message being edited
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({}); // Unread message counts per user
  const [latestMessages, setLatestMessages] = useState<Record<string, Message>>(
    {}
  ); // Latest message snippet per user
  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for auto-scrolling to bottom of chat

  // Function to scroll to the latest message in the chat window
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // --- Data Fetching: Users & Presence ---
  useEffect(() => {
    // Ensure user._id is available before proceeding
    if (!user?._id) {
      console.warn("User ID not available for initial setup.");
      return;
    }

    // Fetch all users from your backend API
    axios
      .get("http://localhost:3000/api/user/getUsers", { withCredentials: true })
      .then((res) => setUsers(res.data.users))
      .catch((err) => console.error("Failed to fetch users:", err));

    // Set user's online presence in Firebase Realtime Database
    const presenceRef = ref(db, `connectionStatus/${user._id}`);
    set(presenceRef, true) // Set online status to true
      .catch((err) => console.error("Failed to set presence:", err));

    // When the user disconnects, set their status to false
    onDisconnect(presenceRef)
      .set(false)
      .catch((err) => console.error("Failed to set onDisconnect:", err));

    // Cleanup function: This runs when the component unmounts
    // to ensure presence is properly marked offline if not already handled by onDisconnect
    return () => {
      set(presenceRef, false) // Explicitly set offline on component unmount
        .catch((err) =>
          console.error("Failed to clear presence on unmount:", err)
        );
    };
  }, [user?._id]); // Re-run if user ID changes (e.g., after login)

  // --- Real-time Listeners: Unreads & Latest Messages ---
  useEffect(() => {
    if (!user?._id) return;

    const unreadsRoot = ref(db, `unreads`);
    const chatsRoot = ref(db, `chats`);

    // Listener for unread counts
    const unsubUnreads = onValue(unreadsRoot, (snap) => {
      const unreadsData = snap.val() || {};
      const aggregated: Record<string, number> = {};

      Object.entries(unreadsData).forEach(([chatId, recObj]: [string, any]) => {
        Object.entries(recObj).forEach(([recId, count]: [string, any]) => {
          const [userA, userB] = chatId.split("_");
          // Determine the 'other' user ID in this specific chat relative to the current user
          const otherId =
            userA === user._id ? userB : userB === user._id ? userA : null;

          // Only aggregate for messages intended for the current user
          if (otherId && recId === user._id) {
            aggregated[otherId] = (aggregated[otherId] || 0) + (count || 0);
          }
        });
      });
      setUnreadCounts(aggregated);
    });

    // Listener for latest messages across all chats (for sidebar display and sorting)
    const unsubChats = onValue(chatsRoot, (snap2) => {
      const chats = snap2.val() || {};
      const latestMsgs: Record<string, Message> = {};

      Object.entries(chats).forEach(([chatId, chatMsgs]: [string, any]) => {
        const [userA, userB] = chatId.split("_");
        // Determine the 'other' user ID in this specific chat relative to the current user
        const other =
          userA === user._id ? userB : userB === user._id ? userA : null;
        if (!other) return; // Skip if chat doesn't involve current user

        // Convert chat messages object to an array and sort by timestamp to get the last message
        const msgsArr: Message[] = Object.entries(chatMsgs)
          .map(([id, val]: any) => ({
            id,
            ...val,
            // Convert Firebase ServerTimestamp object to a number (milliseconds since epoch)
            timestamp:
              typeof val.timestamp === "object" &&
              val.timestamp !== null &&
              "seconds" in val.timestamp
                ? val.timestamp.seconds * 1000 +
                  (val.timestamp.nanoseconds || 0) / 1000000
                : val.timestamp, // If already a number, use it directly
          }))
          .sort((a, b) => a.timestamp - b.timestamp); // Sort ascending by timestamp

        const last = msgsArr[msgsArr.length - 1]; // Get the last message
        if (last) {
          latestMsgs[other] = last;
        }
      });
      setLatestMessages({ ...latestMsgs });
    });

    // Cleanup function: Detach Firebase listeners when component unmounts or user changes
    return () => {
      unsubUnreads();
      unsubChats();
    };
  }, [user?._id]); // Re-run if user ID changes

  // --- Load Chat with Selected User & Mark as Read ---
  useEffect(() => {
    if (!selectedUser || !user?._id) return;

    // Determine chat ID consistently (lexicographical order)
    const chatId =
      user._id < selectedUser._id
        ? `${user._id}_${selectedUser._id}`
        : `${selectedUser._id}_${user._id}`;

    const chatRef = ref(db, `chats/${chatId}`);
    const unreadsRef = ref(db, `unreads/${chatId}/${user._id}`);

    // Listener for messages in the selected chat
    const unsubChat = onValue(chatRef, (snap) => {
      const data = snap.val() || {};
      // Map and sort messages by timestamp
      const loadedMessages: Message[] = Object.entries(data)
        .map(([id, val]: any) => ({
          id,
          ...val,
          timestamp:
            typeof val.timestamp === "object" &&
            val.timestamp !== null &&
            "seconds" in val.timestamp
              ? val.timestamp.seconds * 1000 +
                (val.timestamp.nanoseconds || 0) / 1000000
              : val.timestamp,
        }))
        .sort((a, b) => a.timestamp - b.timestamp); // Sort ascending

      setMessages(loadedMessages);

      // Mark unread messages in this chat as read for the current user
      set(unreadsRef, 0).catch((err) =>
        console.error("Failed to mark unreads as read:", err)
      );
    });

    // Scroll to bottom after messages are loaded/updated (with a slight delay for DOM render)
    const scrollTimeout = setTimeout(scrollToBottom, 100);

    // Cleanup: Detach chat listener and clear timeout
    return () => {
      unsubChat();
      clearTimeout(scrollTimeout);
    };
  }, [selectedUser, user?._id, scrollToBottom]); // Re-run if selectedUser or user ID changes

  // --- Message Actions: Send, Edit, Delete ---
  const handleSendMessage = async () => {
    if (!selectedUser || !messageInput.trim() || !user?._id || !user.name) {
      console.warn(
        "Cannot send message: Missing user, selected user, or message content."
      );
      return;
    }

    const chatId =
      user._id < selectedUser._id
        ? `${user._id}_${selectedUser._id}`
        : `${selectedUser._id}_${user._id}`;
    const chatRef = ref(db, `chats/${chatId}`);
    const unreadsRef = ref(db, `unreads/${chatId}/${selectedUser._id}`);

    const messagePayload = {
      senderId: user._id,
      senderName: user.name,
      receiverId: selectedUser._id,
      content: messageInput.trim(),
      timestamp: serverTimestamp(), // Firebase serverTimestamp
      edited: false,
    };

    try {
      if (editingMessage) {
        // Update existing message if in edit mode
        const msgRef = ref(db, `chats/${chatId}/${editingMessage.id}`);
        await set(msgRef, {
          ...editingMessage, // Keep original ID, sender, receiver
          content: messageInput.trim(),
          edited: true,
          timestamp: serverTimestamp(), // Update timestamp to bring edited message to the bottom
        });
      } else {
        // Push new message
        await push(chatRef, messagePayload);

        // Increment unread count for the receiver
        const snapshot = await get(unreadsRef);
        const currentCount = snapshot.val() || 0;
        await set(unreadsRef, currentCount + 1);
      }
      setMessageInput(""); // Clear input
      setEditingMessage(null); // Exit edit mode
      scrollToBottom(); // Scroll to new message
    } catch (error) {
      console.error("Failed to send/edit message:", error);
      // Optionally show a toast error to the user
    }
  };

  const handleEditMsg = (msg: Message) => {
    if (msg.senderId !== user._id) return; // Only allow sender to edit their own message
    setEditingMessage(msg);
    setMessageInput(msg.content);
  };

  const handleDeleteMsg = async (msg: Message) => {
    if (!selectedUser || !user?._id) return;
    if (msg.senderId !== user._id) {
      // Only allow sender to delete their own message
      console.warn("Attempted to delete a message not sent by current user.");
      return;
    }
    const chatId =
      user._id < selectedUser._id
        ? `${user._id}_${selectedUser._id}`
        : `${selectedUser._id}_${user._id}`;
    try {
      await remove(ref(db, `chats/${chatId}/${msg.id}`));
    } catch (error) {
      console.error("Failed to delete message:", error);
      // Optionally show a toast error
    }
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setMessageInput("");
  };

  // --- Helper Functions for UI Logic ---

  // Sort users based on the latest message timestamp
  const sortedUsers = [...users]
    .filter((u) => u._id !== user?._id) // Filter out the current user from the list
    .sort((a, b) => {
      const latestA = latestMessages[a._id];
      const latestB = latestMessages[b._id];

      // Prioritize users with messages over those without
      if (latestA && !latestB) return -1; // A has message, B doesn't -> A comes first
      if (!latestA && latestB) return 1; // B has message, A doesn't -> B comes first

      // If both have messages, sort by timestamp (newest first)
      if (latestA && latestB) {
        return latestB.timestamp - latestA.timestamp;
      }

      // If neither has messages, sort alphabetically by name as a fallback
      return a.name.localeCompare(b.name);
    });

  // Helper function to format timestamp for sidebar (e.g., "10:30 AM", "Yesterday", "May 15")
  const formatTimestamp = (timestamp: number) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    if (messageDay.getTime() === today.getTime()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (messageDay.getTime() === today.getTime() - 24 * 60 * 60 * 1000) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  // Helper function to format date for the middle divider
  const formatDateDivider = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();

    // Reset dates to midnight for accurate day comparison
    const todayMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const yesterdayMidnight = new Date(
      todayMidnight.getTime() - 24 * 60 * 60 * 1000
    );
    const messageDayMidnight = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    if (messageDayMidnight.getTime() === todayMidnight.getTime()) {
      return "Today";
    } else if (messageDayMidnight.getTime() === yesterdayMidnight.getTime()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  // --- Render Logic ---
  return (
    <div className="p-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 h-[calc(100vh-80px)] gap-4">
        {/* Sidebar (User List) */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-lg">Direct Messages</CardTitle>
          </CardHeader>
          {/* Moved Tabs component to wrap both TabsList and TabsContent */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col flex-1"
          >
            <CardContent className="p-0 border-b">
              {" "}
              {/* Added border-b back here for the list underneath header */}
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="direct">Direct</TabsTrigger>
                <TabsTrigger value="groups">Groups</TabsTrigger>
              </TabsList>
            </CardContent>
            {/* TabsContent components are now direct children of Tabs */}
            <TabsContent value="direct" className="h-full mt-0">
              <ScrollArea className="h-[calc(100vh-220px)]">
                {sortedUsers.length === 0 && (
                  <div className="p-4 text-center text-muted-foreground">
                    No other users available.
                  </div>
                )}
                {sortedUsers.map((u) => (
                  <div
                    key={u._id}
                    className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted transition-colors ${
                      selectedUser?._id === u._id ? "bg-muted" : ""
                    }`}
                    onClick={() => setSelectedUser(u)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={
                          u.avatar ||
                          `https://ui-avatars.com/api/?name=${u.name}&background=random&color=fff`
                        }
                        alt={u.name}
                      />
                      <AvatarFallback>
                        {u.name ? u.name[0] : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-sm font-medium relative pr-8">
                      {u.name}
                      {/* Display latest message content and timestamp */}
                      {latestMessages[u._id] ? (
                        <div className="text-xs text-muted-foreground mt-1 flex justify-between items-center">
                          <span className="truncate max-w-[calc(100%-60px)]">
                            {latestMessages[u._id].senderId === user?._id
                              ? "You: "
                              : ""}
                            {latestMessages[u._id].content}
                          </span>
                          <span className="ml-2 text-right flex-shrink-0">
                            {formatTimestamp(latestMessages[u._id].timestamp)}
                          </span>
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground mt-1">
                          No messages yet.
                        </div>
                      )}
                      {/* Unread count badge */}
                      {unreadCounts[u._id] > 0 && (
                        <span className="absolute right-0 top-1 inline-flex items-center justify-center bg-red-500 text-white rounded-full h-5 w-5 text-xs">
                          {unreadCounts[u._id]}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="groups" className="h-full mt-0">
              <div className="p-4 text-muted-foreground text-center">
                Group chat functionality not yet implemented.
              </div>
            </TabsContent>
          </Tabs>{" "}
          {/* Tabs component closes here */}
        </Card>

        {/* Chat Conversation Section */}
        <Card className="lg:col-span-3 flex flex-col">
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-lg">
              {selectedUser
                ? `Chat with ${selectedUser.name}`
                : "Select a user to chat"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-2 p-4 pt-0">
            {!selectedUser ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <h1 className="text-center text-lg font-medium">
                  Select a user to start chatting
                </h1>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <h1 className="text-center text-lg font-medium">
                  Start a conversation with {selectedUser.name}!
                </h1>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => {
                  const messageDate = new Date(msg.timestamp);
                  const prevMessageDate =
                    index > 0 ? new Date(messages[index - 1].timestamp) : null;

                  // Check if a date divider is needed
                  const showDateDivider =
                    !prevMessageDate || // First message
                    messageDate.toDateString() !==
                      prevMessageDate.toDateString(); // Date changed

                  return (
                    <div key={msg.id}>
                      {showDateDivider && (
                        <div className="relative my-4 text-center">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-300" />
                          </div>
                          <div className="relative inline-flex px-3 text-sm text-gray-600 bg-white rounded-full shadow-sm">
                            {formatDateDivider(msg.timestamp)}
                          </div>
                        </div>
                      )}
                      <div
                        className={`group relative flex items-start ${
                          msg.senderId === user?._id
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs p-2 rounded-lg text-sm relative pr-8 ${
                            msg.senderId === user?._id
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <div>
                            {msg.content}{" "}
                            {msg.edited && (
                              <em
                                className={`text-xs ${
                                  msg.senderId === user?._id
                                    ? "text-blue-200"
                                    : "text-gray-500"
                                }`}
                              >
                                (edited)
                              </em>
                            )}
                          </div>
                          <div
                            className={`text-xs text-right mt-1 ${
                              msg.senderId === user?._id
                                ? "text-blue-200"
                                : "text-muted-foreground"
                            }`}
                          >
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          {msg.senderId === user?._id && (
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 p-0 text-white hover:bg-white/20"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent side="left">
                                  <DropdownMenuItem
                                    onClick={() => handleEditMsg(msg)}
                                  >
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteMsg(msg)}
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} /> {/* Element to scroll to */}
              </>
            )}
          </CardContent>
          {selectedUser && (
            <div className="flex items-center gap-2 p-4 border-t bg-white shadow-sm">
              <Input
                className="flex-1 rounded-full px-4 py-2 border-gray-300 focus:ring-2 focus:ring-blue-500"
                placeholder="Type your message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              {editingMessage && (
                <Button
                  variant="outline"
                  className="text-sm px-3"
                  onClick={cancelEdit}
                >
                  Cancel
                </Button>
              )}
              <Button
                onClick={handleSendMessage}
                className="flex gap-1 px-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send className="h-4 w-4" />
                {editingMessage ? "Update" : "Send"}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ChatInterface;