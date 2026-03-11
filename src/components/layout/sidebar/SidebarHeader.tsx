import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarHeaderProps {
  collapsed: boolean;
  toggleCollapsed: () => void;
}

const SidebarHeader = ({ collapsed, toggleCollapsed }: SidebarHeaderProps) => {
  const holdTimer = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleMouseDown = () => {
    if (user?.role !== "owner" && user?.role !== "accountant") return;
    holdTimer.current = setTimeout(() => {
      navigate("/secure");
    }, 3000);
  };

  const clearTimer = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  };

  return (
    <div
      className={cn(
        "h-16 flex items-center px-3 border-b border-estate-blue/30 transition-all duration-300",
        collapsed ? "justify-center" : "justify-between",
      )}
    >
      {!collapsed ? (
        <Link
          to="/"
          className="flex items-center gap-2 transition-all duration-300 hover:opacity-90"
          onMouseDown={handleMouseDown}
          onMouseUp={clearTimer}
          onMouseLeave={clearTimer}
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
          onMouseDown={handleMouseDown}
          onMouseUp={clearTimer}
          onMouseLeave={clearTimer}
        />
      )}

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
