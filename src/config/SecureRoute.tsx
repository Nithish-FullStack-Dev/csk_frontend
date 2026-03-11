import { useAuth } from "@/contexts/AuthContext";
import { getCookie } from "@/utils/getCookie";
import { Loader2 } from "lucide-react";
import React from "react";
import { Navigate } from "react-router-dom";

const SecureRoute = ({ children }: any) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-estate-navy" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const token = getCookie("secure_access");
  if (!user || (user?.role !== "owner" && user?.role !== "accountant")) {
    return <Navigate to="/" />;
  }

  if (!token) {
    return <Navigate to="/secure" />;
  }

  return children;
};

export default SecureRoute;
