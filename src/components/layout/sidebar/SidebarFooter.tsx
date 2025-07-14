
import { cn } from "@/lib/utils";
import { HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface SidebarFooterProps {
  collapsed: boolean;
}

const SidebarFooter = ({ collapsed }: SidebarFooterProps) => {
  return (
    <div className={cn(
      "p-3 border-t border-estate-blue/30",
      collapsed ? "text-center" : ""
    )}>
      <Link
        to="/help"
        className="flex items-center gap-2 text-sm text-white hover:text-estate-mustard rounded-md px-2 py-1.5"
      >
        <HelpCircle className="h-5 w-5" />
        {!collapsed && <span>Help & Support</span>}
      </Link>
    </div>
  );
};

export default SidebarFooter;
