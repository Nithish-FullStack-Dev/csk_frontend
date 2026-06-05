"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { HelpCircle } from "lucide-react";

import { toast } from "sonner";
import axios from "axios";
import { useNavigate, useNavigation } from "react-router-dom";

interface SidebarFooterProps {
  collapsed: boolean;
}

const SidebarFooter = ({ collapsed }: SidebarFooterProps) => {
  const navigate = useNavigate();

  return (
    <>
      <div
        className={cn(
          "p-3 border-t border-estate-blue/30",
          collapsed ? "text-center" : "",
        )}
      >
        <button
          onClick={() => navigate("/help&support")}
          className="flex items-center gap-2 text-sm text-white hover:text-estate-mustard rounded-md px-2 py-1.5 w-full text-left"
        >
          <HelpCircle className="h-5 w-5" />
          {!collapsed && <span>Help & Support</span>}
        </button>
      </div>
    </>
  );
};

export default SidebarFooter;
