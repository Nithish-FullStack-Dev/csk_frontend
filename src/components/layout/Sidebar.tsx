import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import SidebarHeader from "./sidebar/SidebarHeader";
import SidebarNavigation from "./sidebar/SidebarNavigation";
import SidebarFooter from "./sidebar/SidebarFooter";
import { Menu, X } from "lucide-react";

const Sidebar = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const toggleCollapsed = () => setCollapsed(!collapsed);
  const toggleMobile = () => setMobileOpen(!mobileOpen);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-estate-blue text-white p-2 rounded-lg shadow-lg"
        onClick={toggleMobile}
      >
        {mobileOpen ? <X color="#fff" /> : <Menu />}
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          "bg-estate-blue text-white border-r border-estate-blue/30 flex flex-col h-full transition-all duration-300 ease-in-out z-40",
          collapsed ? "w-16" : "w-64",
          // Desktop: always visible
          "hidden md:flex",
          // Mobile: slide in/out overlay
          mobileOpen && "fixed inset-y-0 left-0 flex w-64 md:hidden shadow-lg"
        )}
      >
        <SidebarHeader
          collapsed={collapsed}
          toggleCollapsed={toggleCollapsed}
        />
        <SidebarNavigation collapsed={collapsed} />
        <SidebarFooter collapsed={collapsed} />
      </div>

      {/* Mobile overlay background */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={toggleMobile}
        />
      )}
    </>
  );
};

export default Sidebar;
