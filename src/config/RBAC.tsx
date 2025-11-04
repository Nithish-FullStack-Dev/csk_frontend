import { useAuth } from "@/contexts/AuthContext";
import { fetchRolePermissions } from "@/pages/UserManagement";
import { Permission } from "@/types/permission";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

type Prop = {
  roleSubmodule: string;
};

export const useRBAC = ({ roleSubmodule }: Prop) => {
  const { user } = useAuth();
  const {
    data: rolePermissions,
    isLoading: isRolePermissionsLoading,
    error: rolePermissionsError,
    isError: isRolePermissionsError,
  } = useQuery<Permission>({
    queryKey: ["rolePermissions", user?.role],
    queryFn: () => fetchRolePermissions(user?.role as string),
    enabled: !!user?.role,
  });

  if (isRolePermissionsError) {
    console.error("Error fetching role permissions:", rolePermissionsError);
    toast.error("Failed to load role permissions");
    return null;
  }

  const userCanAddUser = rolePermissions?.permissions.some(
    (per) => per.submodule === roleSubmodule && per.actions.write
  );
  const userCanEditUser = rolePermissions?.permissions.some(
    (per) => per.submodule === roleSubmodule && per.actions.edit
  );
  const userCanDeleteUser = rolePermissions?.permissions.some(
    (per) => per.submodule === roleSubmodule && per.actions.delete
  );
  const userCanViewUser = rolePermissions?.permissions.some(
    (per) => per.submodule === roleSubmodule && per.actions.read
  );
  return {
    userCanAddUser,
    userCanEditUser,
    userCanDeleteUser,
    userCanViewUser,
    isRolePermissionsLoading,
  };
};
