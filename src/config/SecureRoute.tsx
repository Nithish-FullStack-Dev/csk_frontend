import { useAuth } from "@/contexts/AuthContext";
import { getCookie } from "@/utils/getCookie";
import { Loader2 } from "lucide-react";
import React from "react";
import { Navigate } from "react-router-dom";

type SecureRouteProps = {
  children: React.ReactNode;
  requireToken?: boolean;
};

const SecureRoute = ({ children, requireToken = true }: SecureRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-estate-navy" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (user?.role !== "owner" && user?.role !== "accountant") {
    return <Navigate to="/" />;
  }

  if (requireToken) {
    const token = getCookie("secure_access");

    if (!token || token === "undefined" || token === "null") {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default SecureRoute;
