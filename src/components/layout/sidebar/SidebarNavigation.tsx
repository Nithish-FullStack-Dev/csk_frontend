
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { navigationByRole } from "./navigationConfig";
import SidebarLink from "./SidebarLink";

interface SidebarNavigationProps {
  collapsed: boolean;
}

const SidebarNavigation = ({ collapsed }: SidebarNavigationProps) => {
  const { user } = useAuth();
  const location = useLocation();
  
  if (!user) return null;
  
  // Get navigation items for the user's role
  const navigation = navigationByRole[user.role] || [];

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
