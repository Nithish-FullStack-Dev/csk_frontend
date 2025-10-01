import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
import SidebarLink from "./SidebarLink";
import { buildNavigationForRole } from "./navigationConfig";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface SidebarNavigationProps {
  collapsed: boolean;
}

const fetchRolePermissions = async (roleName: string) => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/role/getRole/${roleName}`
  );
  return data?.permissions || [];
};

const SidebarNavigation = ({ collapsed }: SidebarNavigationProps) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const { data: rolePermissions } = useQuery({
    queryKey: ["sidebarPermissions", user.role],
    queryFn: () => fetchRolePermissions(user.role),
    enabled: !!user.role,
  });

  const navigation = buildNavigationForRole(rolePermissions || []);

  return (
    <nav className="flex-1 overflow-y-auto py-4 px-3">
      <div className="space-y-1">
        {navigation.map((item) => (
          <SidebarLink
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            active={location.pathname === item.to}
            collapsed={collapsed}
          />
        ))}
      </div>
    </nav>
  );
};

export default SidebarNavigation;
