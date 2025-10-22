import React, { useEffect, useState, useRef, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, MoreVertical } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import {
  db,
  ref,
  onValue,
  push,
  remove,
  serverTimestamp,
  set,
  onDisconnect,
  get,
} from "@/config/firebaseConfig";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import MainLayout from "../layout/MainLayout";

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  timestamp: number;
  edited: boolean;
}

const ChatInterface = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("direct");
  const [messageInput, setMessageInput] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [latestMessages, setLatestMessages] = useState<Record<string, Message>>(
    {}
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getChatId = useCallback((userAId: string, userBId: string) => {
    if (!userAId || !userBId) return null;
    return userAId < userBId
      ? `${userAId}_${userBId}`
      : `${userBId}_${userAId}`;
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!user?._id) return;

    axios
      .get(`${import.meta.env.VITE_URL}/api/user/getUsers`, {
        withCredentials: true,
      })
      .then((res) => setUsers(res.data.users))
      .catch((err) => console.error("Failed to fetch users:", err));

    const presenceRef = ref(db, `connectionStatus/${user._id}`);
    set(presenceRef, true);
    onDisconnect(presenceRef).set(false);

    return () => {
      set(presenceRef, false);
    };
  }, [user?._id]);

  useEffect(() => {
    if (!user?._id) return;

    const unreadsRoot = ref(db, `unreads`);
    const chatsRoot = ref(db, `chats`);

    const unsubUnreads = onValue(unreadsRoot, (snap) => {
      const unreadsData = snap.val() || {};
      const aggregated: Record<string, number> = {};
      Object.entries(unreadsData).forEach(([chatId, recObj]: any) => {
        const [userA, userB] = chatId.split("_");
        const otherId = userA === user._id ? userB : userB;
        if (recObj?.[user._id]) {
          aggregated[otherId] = recObj[user._id];
        }
      });
      setUnreadCounts(aggregated);
    });

    const unsubChats = onValue(chatsRoot, (snap) => {
      const chats = snap.val() || {};
      const latestMsgs: Record<string, Message> = {};
      Object.entries(chats).forEach(([chatId, chatMsgs]: any) => {
        if (!chatId.includes(user._id)) return;
        const [userA, userB] = chatId.split("_");
        const other = userA === user._id ? userB : userA;
        const msgsArr = Object.entries(chatMsgs)
          .map(([id, val]: any) => ({
            id,
            ...val,
            timestamp: val.timestamp?.seconds
              ? val.timestamp.seconds * 1000
              : val.timestamp,
          }))
          .sort((a, b) => a.timestamp - b.timestamp);

        const last = msgsArr[msgsArr.length - 1];
        if (last) {
          latestMsgs[other] = last;
        }
      });
      setLatestMessages(latestMsgs);
    });

    return () => {
      unsubUnreads();
      unsubChats();
    };
  }, [user?._id]);

  useEffect(() => {
    if (!selectedUser || !user?._id) return;

    const chatId = getChatId(user._id, selectedUser._id);
    if (!chatId) return;

    const chatRef = ref(db, `chats/${chatId}`);
    const unreadsRef = ref(db, `unreads/${chatId}/${user._id}`);

    const unsubChat = onValue(chatRef, (snap) => {
      const data = snap.val() || {};
      const loadedMessages = Object.entries(data)
        .map(([id, val]: any) => ({
          id,
          ...val,
          timestamp: val.timestamp?.seconds
            ? val.timestamp.seconds * 1000
            : val.timestamp,
        }))
        .sort((a, b) => a.timestamp - b.timestamp);

      setMessages(loadedMessages);
      set(unreadsRef, 0);
    });

    const scrollTimeout = setTimeout(scrollToBottom, 100);

    return () => {
      unsubChat();
      clearTimeout(scrollTimeout);
    };
  }, [selectedUser, user?._id, scrollToBottom, getChatId]);

  const handleSendMessage = async () => {
    if (!selectedUser || !messageInput.trim() || !user?._id) return;

    const chatId = getChatId(user._id, selectedUser._id);
    if (!chatId) return;

    const messagePayload = {
      senderId: user._id,
      senderName: user.name,
      receiverId: selectedUser._id,
      content: messageInput.trim(),
      timestamp: serverTimestamp(),
      edited: false,
    };

    try {
      if (editingMessage) {
        const msgRef = ref(db, `chats/${chatId}/${editingMessage.id}`);
        await set(msgRef, {
          ...editingMessage,
          content: messageInput.trim(),
          edited: true,
          timestamp: serverTimestamp(),
        });
      } else {
        await push(ref(db, `chats/${chatId}`), messagePayload);
        const snapshot = await get(
          ref(db, `unreads/${chatId}/${selectedUser._id}`)
        );
        const currentCount = snapshot.val() || 0;
        await set(
          ref(db, `unreads/${chatId}/${selectedUser._id}`),
          currentCount + 1
        );
      }
      setMessageInput("");
      setEditingMessage(null);
      scrollToBottom();
    } catch (error) {
      console.error("Failed to send/edit message:", error);
    }
  };

  const handleEditMsg = (msg: Message) => {
    if (msg.senderId !== user?._id) return;
    setEditingMessage(msg);
    setMessageInput(msg.content);
  };

  const handleDeleteMsg = async (msg: Message) => {
    if (msg.senderId !== user?._id || !selectedUser || !user?._id) return;
    const chatId = getChatId(user._id, selectedUser._id);
    if (!chatId) return;
    try {
      await remove(ref(db, `chats/${chatId}/${msg.id}`));
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setMessageInput("");
  };

  const sortedUsers = [...users]
    .filter((u) => u._id !== user?._id)
    .sort((a, b) => {
      const latestA = latestMessages[a._id];
      const latestB = latestMessages[b._id];
      if (latestA && !latestB) return -1;
      if (!latestA && latestB) return 1;
      if (latestA && latestB) return latestB.timestamp - latestA.timestamp;
      return a.name.localeCompare(b.name);
    });

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

  const formatDateDivider = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
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

  return (
    <MainLayout>
      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 h-[calc(100vh-80px)] gap-4">
          <Card className="lg:col-span-1 flex flex-col">
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-lg">Direct Messages</CardTitle>
            </CardHeader>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex flex-col flex-1"
            >
              <CardContent className="p-0 border-b">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="direct">Direct</TabsTrigger>
                  {/* <TabsTrigger value="groups">Groups</TabsTrigger> */}
                </TabsList>
              </CardContent>
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
              {/* <TabsContent value="groups" className="h-full mt-0">
                <div className="p-4 text-muted-foreground text-center">
                  Group chat functionality not yet implemented.
                </div>
              </TabsContent> */}
            </Tabs>
          </Card>

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
                      index > 0
                        ? new Date(messages[index - 1].timestamp)
                        : null;
                    const showDateDivider =
                      !prevMessageDate ||
                      messageDate.toDateString() !==
                        prevMessageDate.toDateString();

                    const isMyMessage = msg.senderId === user?._id;

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
                            isMyMessage ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs p-2 rounded-lg text-sm relative pr-8 ${
                              isMyMessage
                                ? "bg-estate-navy text-white"
                                : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            <div>
                              {msg.content}{" "}
                              {msg.edited && (
                                <em
                                  className={`text-xs ${
                                    isMyMessage
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
                                isMyMessage
                                  ? "text-blue-200"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                            {isMyMessage && (
                              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-5 w-5 p-0 text-white"
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
                  <div ref={messagesEndRef} />
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
    </MainLayout>
  );
};

export default ChatInterface;
