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
import { formatDistanceToNow } from "date-fns";
import { get, onValue, ref } from "firebase/database";
import { db } from "@/config/firebaseConfig";
import { toast } from "react-toastify";
import io from "socket.io-client";

const socket = io("http://localhost:3000"); // Replace with your backend URL

const TopBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [aggregatedLatestMessages, setAggregatedLatestMessages] = useState<
    Record<string, any>
  >({});
  const [totalUnreadMessageCount, setTotalUnreadMessageCount] = useState(0);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  const userId = user?._id;
  if (!userId) return null;

  // --- Real-time socket logic ---
  useEffect(() => {
    if (!userId) return;
    socket.emit("register", userId);

    socket.on("newNotification", (data) => {
      toast(`${data.title}: ${data.message}`, {
        type: "info",
        position: "bottom-right",
        autoClose: 4000,
      });

      setNotifications((prev) => [data.notification, ...prev]);
      setUnreadNotificationCount((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  const fetchUnreadNotificationCount = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/notifications/${userId}/unread-count`
      );
      setUnreadNotificationCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error("Error fetching unread notification count:", err);
    }
  };

  const fetchUnreadNotifications = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/notifications/${userId}/unread`
      );
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error("Error fetching unread notifications:", err);
    }
  };

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/user/getUsers", { withCredentials: true })
      .then((res) => setAllUsers(res.data.users))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!userId || allUsers.length === 0) return;

    const chatsRootRef = ref(db, `chats`);
    const unreadsRootRef = ref(db, `unreads`);
    let currentUnreadCounts: Record<string, number> = {};

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
                timestamp:
                  typeof msgVal.timestamp === "object" &&
                  msgVal.timestamp !== null &&
                  "seconds" in msgVal.timestamp
                    ? msgVal.timestamp.seconds * 1000 +
                      (msgVal.timestamp.nanoseconds || 0) / 1000000
                    : msgVal.timestamp,
              }))
              .sort((a, b) => a.timestamp - b.timestamp);

            if (messagesArray.length > 0) {
              const lastMessage = messagesArray[messagesArray.length - 1];
              const otherUser = usersList.find((u) => u._id === otherUserId);

              if (otherUser) {
                newAggregatedLatestMessages[otherUserId] = {
                  content: lastMessage.content,
                  timestamp: lastMessage.timestamp,
                  senderId: lastMessage.senderId,
                  otherUserId: otherUserId,
                  otherUserName: otherUser.name,
                  otherUserAvatar:
                    otherUser.avatar ||
                    `https://ui-avatars.com/api/?name=${otherUser.name}&background=random&color=fff`,
                  unreadCount: unreadCountsMap[otherUserId] || 0,
                };
              }
            }
          }
        }
      );

      setLatestFn(newAggregatedLatestMessages);
    };

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

      currentUnreadCounts = newAggregatedUnreads;
      setTotalUnreadMessageCount(totalUnreads);

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
    });

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

    return () => {
      unsubUnreads();
      unsubChats();
    };
  }, [userId, allUsers]);

  useEffect(() => {
    fetchUnreadNotificationCount();
    fetchUnreadNotifications();
  }, [userId]);

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

  const sortedRecentChats = Object.values(aggregatedLatestMessages).sort(
    (a: any, b: any) => b.timestamp - a.timestamp
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
                {sortedRecentChats.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent messages
                  </p>
                ) : (
                  sortedRecentChats.map((msgSummary: any) => (
                    <DropdownMenuItem
                      key={msgSummary.otherUserId}
                      className="cursor-pointer py-3 flex items-start gap-3"
                      onClick={() =>
                        navigate("/messaging", {
                          state: {
                            selectedChatUser: {
                              _id: msgSummary.otherUserId,
                              name: msgSummary.otherUserName,
                              avatar: msgSummary.otherUserAvatar,
                            },
                          },
                        })
                      }
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
                          {msgSummary.senderId === userId ? "You: " : ""}
                          {msgSummary.content}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatMessageTimestamp(msgSummary.timestamp)}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  ))
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

          {/* User menu */}
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
