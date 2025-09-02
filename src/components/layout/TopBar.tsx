import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, MessageSquare, Settings, User, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns"; // For notifications and older messages
import { get, onValue, ref } from "firebase/database";
import { db } from "@/config/firebaseConfig";

const TopBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0); // Renamed for clarity

  // --- NEW STATES FOR MESSAGES ---
  const [aggregatedLatestMessages, setAggregatedLatestMessages] = useState<
    Record<string, any>
  >({});
  const [totalUnreadMessageCount, setTotalUnreadMessageCount] = useState(0);
  const [allUsers, setAllUsers] = useState<any[]>([]); // To get names/avatars for message previews

  const userId = user?._id;

  // Render null if user is not available (e.g., still loading auth)
  if (!userId) return null;

  // --- Notification Fetching (Your existing logic - unchanged) ---
  const fetchUnreadNotificationCount = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_URL}/api/notifications/${userId}/unread-count`
      );
      setUnreadNotificationCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error("Error fetching unread notification count:", err);
    }
  };

  const fetchUnreadNotifications = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_URL}/api/notifications/${userId}/unread`
      );
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error("Error fetching unread notifications:", err);
    }
  };

  // --- NEW: Fetch all users for message previews (names/avatars) ---
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_URL}/api/user/getUsers`, {
        withCredentials: true,
      })
      .then((res) => setAllUsers(res.data.users))
      .catch(console.error);
  }, []); // Fetch once on mount

  // --- NEW: Real-time listener for ALL chats and unreads to build summary for TopBar ---
  useEffect(() => {
    if (!userId || allUsers.length === 0) return; // Wait for users to be loaded

    const chatsRootRef = ref(db, `chats`);
    const unreadsRootRef = ref(db, `unreads`);

    let currentUnreadCounts: Record<string, number> = {}; // Local variable for current unread counts

    // Listener for unread counts across all chats
    const unsubUnreads = onValue(unreadsRootRef, (snapshot) => {
      const unreadsData = snapshot.val() || {};
      let totalUnreads = 0;
      const newAggregatedUnreads: Record<string, number> = {};

      Object.entries(unreadsData).forEach(
        ([chatId, receivers]: [string, any]) => {
          const [userA, userB] = chatId.split("_");
          const otherUserId =
            userA === userId ? userB : userB === userId ? userA : null;

          if (otherUserId && receivers[userId] !== undefined) {
            const count = receivers[userId] || 0;
            newAggregatedUnreads[otherUserId] = count;
            totalUnreads += count;
          }
        }
      );
      currentUnreadCounts = newAggregatedUnreads; // Update local unread counts
      setTotalUnreadMessageCount(totalUnreads);

      // Re-process latest messages with updated unread counts
      // This is important because `currentUnreadCounts` might update independently of `chatsData`
      if (chatsRootRef) {
        // Ensure chatsRef is valid before trying to get data
        get(chatsRootRef)
          .then((chatSnapshot) => {
            if (chatSnapshot.exists()) {
              const chatsData = chatSnapshot.val() || {};
              processChatData(
                chatsData,
                currentUnreadCounts,
                allUsers,
                userId,
                setAggregatedLatestMessages
              );
            }
          })
          .catch((err) =>
            console.error("Error re-processing chats for unreads:", err)
          );
      }
    });

    const processChatData = (
      chatsData: any,
      unreadCountsMap: Record<string, number>,
      usersList: any[],
      currentUserId: string,
      setLatestFn: React.Dispatch<React.SetStateAction<Record<string, any>>>
    ) => {
      const newAggregatedLatestMessages: Record<string, any> = {};

      Object.entries(chatsData).forEach(
        ([chatId, messagesInChat]: [string, any]) => {
          const [userA, userB] = chatId.split("_");
          const otherUserId =
            userA === currentUserId
              ? userB
              : userB === currentUserId
              ? userA
              : null;

          if (otherUserId) {
            const messagesArray = Object.entries(messagesInChat || {})
              .map(([msgId, msgVal]: [string, any]) => ({
                id: msgId,
                ...msgVal,
                // Convert Firebase ServerTimestamp object to a number (milliseconds)
                timestamp:
                  typeof msgVal.timestamp === "object" &&
                  msgVal.timestamp !== null &&
                  "seconds" in msgVal.timestamp
                    ? msgVal.timestamp.seconds * 1000 +
                      (msgVal.timestamp.nanoseconds || 0) / 1000000
                    : msgVal.timestamp,
              }))
              .sort((a, b) => a.timestamp - b.timestamp); // Sort to get the actual latest

            if (messagesArray.length > 0) {
              const lastMessage = messagesArray[messagesArray.length - 1];
              const otherUser = usersList.find((u) => u._id === otherUserId);

              if (otherUser) {
                // Ensure the other user's data is available
                newAggregatedLatestMessages[otherUserId] = {
                  content: lastMessage.content,
                  timestamp: lastMessage.timestamp,
                  senderId: lastMessage.senderId, // Who sent the last message
                  otherUserId: otherUserId, // The ID of the other chat participant
                  otherUserName: otherUser.name,
                  otherUserAvatar:
                    otherUser.avatar ||
                    `https://ui-avatars.com/api/?name=${otherUser.name}&background=random&color=fff`,
                  unreadCount: unreadCountsMap[otherUserId] || 0, // Get unread count from the map
                };
              }
            }
          }
        }
      );
      setLatestFn(newAggregatedLatestMessages);
    };

    // Listener for all chat messages
    const unsubChats = onValue(chatsRootRef, (snapshot) => {
      const chatsData = snapshot.val() || {};
      processChatData(
        chatsData,
        currentUnreadCounts,
        allUsers,
        userId,
        setAggregatedLatestMessages
      );
    });

    // Helper function to process chat data and update state

    return () => {
      unsubUnreads();
      unsubChats();
    };
  }, [userId, allUsers]); // Re-run if userId or allUsers changes

  // --- Other useEffects (Your existing logic - unchanged) ---
  useEffect(() => {
    fetchUnreadNotificationCount();
    fetchUnreadNotifications();
  }, [userId]);

  // --- Helper Functions ---
  const formatMessageTimestamp = (timestamp: number) => {
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
      return formatDistanceToNow(date, { addSuffix: true });
    }
  };

  // Sort latest chat summaries by timestamp (newest first) for dropdown display
  const sortedRecentChats = Object.values(aggregatedLatestMessages).sort(
    (a: any, b: any) => {
      return b.timestamp - a.timestamp; // Descending order
    }
  );

  return (
    <header className="border-b bg-white shadow-sm z-10">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center" />

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadNotificationCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-estate-error text-white">
                    {unreadNotificationCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-auto">
                {notifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No new notifications
                  </p>
                ) : (
                  notifications.map((n) => (
                    <DropdownMenuItem
                      key={n._id}
                      className="cursor-pointer py-3"
                    >
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium">{n.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {n.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(n.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer justify-center text-estate-navy">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Messages */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <MessageSquare className="h-5 w-5" />
                {/* Use the new totalUnreadMessageCount state */}
                {totalUnreadMessageCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-estate-teal text-white">
                    {totalUnreadMessageCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Recent Messages</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-auto">
                {sortedRecentChats.length === 0 ? ( // Use sortedRecentChats here
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent messages
                  </p>
                ) : (
                  sortedRecentChats.map(
                    (
                      msgSummary: any // Iterate over sorted data
                    ) => (
                      <DropdownMenuItem
                        key={msgSummary.otherUserId} // Key by the other user's ID
                        className="cursor-pointer py-3 flex items-start gap-3"
                        onClick={() => {
                          // Navigate to chat and potentially pre-select the user
                          // You'll need to update your /messaging route or ChatInterface
                          // to accept state or query params for pre-selection.
                          navigate("/messaging", {
                            state: {
                              selectedChatUser: {
                                _id: msgSummary.otherUserId,
                                name: msgSummary.otherUserName,
                                avatar: msgSummary.otherUserAvatar,
                              },
                            },
                          });
                        }}
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarImage
                            src={msgSummary.otherUserAvatar}
                            alt={msgSummary.otherUserName}
                          />
                          <AvatarFallback>
                            {msgSummary.otherUserName?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-1 flex-1">
                          <div className="flex justify-between items-center">
                            <p className="text-sm font-medium">
                              {msgSummary.otherUserName}
                            </p>
                            {msgSummary.unreadCount > 0 && (
                              <Badge className="bg-estate-navy text-white text-xs px-2 py-0.5 rounded-full">
                                {msgSummary.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate max-w-[90%]">
                            {/* Show "You:" if the current user sent the last message */}
                            {msgSummary.senderId === userId ? "You: " : ""}
                            {msgSummary.content}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatMessageTimestamp(msgSummary.timestamp)}
                          </p>
                        </div>
                      </DropdownMenuItem>
                    )
                  )
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer justify-center text-estate-navy"
                onClick={() => navigate("/messaging")}
              >
                View all messages
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu (unchanged) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 pl-2 pr-4 hover:bg-muted"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-sm">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-xs capitalize text-muted-foreground">
                    {user.role?.replace("_", " ")}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-estate-error">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
