
import { cn } from "@/lib/utils";
import React from "react";
import { Link } from "react-router-dom";

interface SidebarLinkProps {
  to: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
  collapsed?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ 
  to, 
  icon: Icon, 
  label, 
  active = false,
  collapsed = false
}) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        active 
          ? "bg-estate-mustard text-estate-blue font-medium" 
          : "text-white hover:bg-white/10 hover:text-estate-mustard"
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
};

export default SidebarLink;
