import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-estate-navy" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role))
    return <Navigate to="/unauthorized" replace />;
  return children;
};

export default ProtectedRoute;
