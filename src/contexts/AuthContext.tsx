import axios from "axios";
import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";

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
  role: UserRole;
  phone: string;
  address: string;
  department: string;
  avatar?: string;
  updatedAt: Date;
  createdAt: Date;
  lastLogin: Date;
}

// Define the context structure
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const getCsrfToken = async () => {
  const response = await axios.get("http://localhost:3000/api/csrf-token", {
    withCredentials: true,
  });
  return response.data.csrfToken;
};

// Create the context
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
});

// Create the provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      console.log(storedUser);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Login function

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      console.log(email, password);
      const { data } = await axios.post(
        "http://localhost:3000/api/user/login",
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      localStorage.setItem("token", data.token); // ⬅️ store JWT
      localStorage.setItem("user", JSON.stringify(data.user));
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

  // const login = async (email: string, password: string) => {
  //   setIsLoading(true);

  //   try {
  //     const { data } = await axios.post(
  //       "http://localhost:3000/api/user/login",
  //       { email, password },
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     // Assuming backend already strips password
  //     setUser(data);
  //     console.log(data);
  //     localStorage.setItem("user", JSON.stringify(data));
  //     toast.success(`Welcome back, ${data.name}`);
  //   } catch (error: any) {
  //     console.error("Login error:", error);

  //     if (error.response && error.response.status === 401) {
  //       toast.error("Invalid email or password");
  //     } else {
  //       toast.error("An error occurred during login");
  //     }
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // Logout function

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    toast.info("You have been logged out");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Create a hook for using the auth context
export const useAuth = () => useContext(AuthContext);
