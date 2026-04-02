import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!user?._id) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            return;
        }

        const socketUrl = import.meta.env.SOCKET_URL || "http://localhost:3000";
        const newSocket = io(socketUrl, {
            withCredentials: true,
            transports: ["websocket", "polling"],
        });

        newSocket.on("connect", () => {
            // console.log("✅ Socket connected:", newSocket.id);
            setIsConnected(true);
            // Register user with the backend
            newSocket.emit("register", user._id);
        });

        newSocket.on("disconnect", () => {
            // console.log("❌ Socket disconnected");
            setIsConnected(false);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user?._id]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
