import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface SidebarHeaderProps {
  collapsed: boolean;
  toggleCollapsed: () => void;
}

const SidebarHeader = ({ collapsed, toggleCollapsed }: SidebarHeaderProps) => {
  return (
    <div
      className={cn(
        "h-16 flex items-center px-3 border-b border-estate-blue/30 transition-all duration-300",
        collapsed ? "justify-center" : "justify-between"
      )}
    >
      {!collapsed ? (
        <Link
          to="/"
          className="flex items-center gap-2 transition-all duration-300 hover:opacity-90"
        >
          <img
            src="/assets/images/logo.png"
            alt="CSK Realtors Logo"
            className="h-10 w-auto transition-all duration-300"
          />
          <span className="font-semibold text-base text-estate-mustard transition-all duration-300">
            CSK REALTORS
          </span>
        </Link>
      ) : (
        <img
          src="/assets/images/logo.png"
          alt="CSK Realtors Logo"
          className="h-10 w-auto transition-all duration-300"
        />
      )}

      {/* Collapse button hidden on mobile (sm:) */}
      <button
        onClick={toggleCollapsed}
        className="hidden sm:block p-1 rounded-md hover:bg-white/10 text-white transition-all duration-300"
      >
        {collapsed ? (
          <ChevronRight className="h-5 w-5" />
        ) : (
          <ChevronLeft className="h-5 w-5" />
        )}
      </button>
    </div>
  );
};

export default SidebarHeader;
