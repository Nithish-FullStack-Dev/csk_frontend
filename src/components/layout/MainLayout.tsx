import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { Navigate } from "react-router-dom";
import Loader from "../Loader";

interface MainLayoutProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  requiredRoles = [],
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Show loading spinner while auth state is being determined
  if (isLoading) {
    return <Loader />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role if specified
  if (requiredRoles.length > 0 && user && !requiredRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navigation bar */}
        <TopBar />

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
