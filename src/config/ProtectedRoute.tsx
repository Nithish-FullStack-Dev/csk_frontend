import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { Navigate } from "react-router-dom";
import { useRBAC } from "./RBAC";

const ProtectedRoute = ({ roleSubmodule, children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-estate-navy" />
      </div>
    );
  }

  if (roleSubmodule === "System Config" || roleSubmodule === "Profile") {
    return children;
  }

  if (user.role === "admin" && roleSubmodule === "Role Management") {
    return children;
  }

  const { userCanViewUser, isRolePermissionsLoading } = useRBAC({
    roleSubmodule,
  });

  if (isRolePermissionsLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-estate-navy" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!userCanViewUser) return <Navigate to="/unauthorized" replace />;
  return children;
};

export default ProtectedRoute;
