import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { createContext, useState, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";

export interface Roles {
  _id: string;
  name: string;
  color: string;
  description: string;
}

// Define user roles
export type UserRole =
  | "owner"
  | "admin"
  | "sales_manager"
  | "team_lead"
  | "agent"
  | "site_incharge"
  | "contractor"
  | "accountant"
  | "customer_purchased"
  | "customer_prospect"
  | "public_user";

// Define the user structure
export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
  department?: string;
  avatar?: string;
  specialization?: string;
  updatedAt?: Date;
  createdAt?: Date;
  lastLogin?: Date;
  isDeleted?: boolean;
}

// Define the context structure
interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isUnauthorized: boolean;
  setIsUnauthorized: React.Dispatch<React.SetStateAction<Boolean>>;
}

export const getCsrfToken = async () => {
  const response = await axios.get(
    `${import.meta.env.VITE_URL}/api/csrf-token`,
    {
      withCredentials: true,
    },
  );
  return response.data.csrfToken;
};

// Create the context
export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isLoading: false,
  login: async () => {},
  logout: async () => {}, // Make async
  isAuthenticated: false,
  isUnauthorized: false,
  setIsUnauthorized: () => {},
});

// Create the provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const queryClient = useQueryClient();
  const location = useLocation();

  // gets the logged in user
  const fetchLoggedInUser = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_URL}/api/user/getLoggedInUser`,
        { withCredentials: true },
      );
      setUser(data);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error(
          axios.isAxiosError(error)
            ? error.response.data.message
            : "Session invalidated, please login again",
        );
        setUser(null);
        setIsUnauthorized(true);
        console.log("failed to load logged in user ", error);
      } else {
        console.log("failed to load logged in user ", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const path = location.pathname;

    const isPublicRoute = path === "/" || path.startsWith("/public");

    // ✅ Only fetch user if NOT public route
    if (!isPublicRoute) {
      fetchLoggedInUser();
    } else {
      setIsLoading(false);
    }
  }, [location.pathname]);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_URL}/api/user/login`,
        { email, password },
        { withCredentials: true },
      );
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.name}`);
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error("Invalid email or password");
      } else {
        toast.error("An error occurred during login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_URL}/api/user/logout`,
        {},
        { withCredentials: true },
      );

      queryClient.clear(); // 🔥 clears all React Query cached data
      setUser(null);

      toast.info("You have been logged out");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
        isUnauthorized,
        setIsUnauthorized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Create a hook for using the auth context
export const useAuth = () => useContext(AuthContext);
