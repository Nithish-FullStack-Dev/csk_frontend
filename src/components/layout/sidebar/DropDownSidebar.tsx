"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import {
  ChevronDown,
  ChevronRight,
  FolderKanban,
  Users,
  IndianRupee,
  Globe,
  Shield,
  HelpCircle,
  CheckSquare,
  FileText,
} from "lucide-react";

import SidebarLink from "./SidebarLink";
import { buildNavigationForRole } from "./navigationConfig";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type NavItem = {
  label: string;
  to: string;
  icon: React.ElementType;
};

type NavGroup = {
  key: string;
  label: string;
  icon: React.ElementType;
  modules: string[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    key: "admin",
    label: "Admin",
    icon: Shield,
    modules: ["Dashboard", "User Management", "Role Management", "Department"],
  },
  {
    key: "projects",
    label: "Projects",
    icon: FolderKanban,
    modules: [
      "Properties",
      "Projects Overview",
      "Construction Timeline",
      // "Trash – Buildings",
      "Approvals",
    ],
  },
  {
    key: "sales",
    label: "Sales",
    icon: IndianRupee,
    modules: [
      "My Team",
      "Site Visits",
      "Lead Management",
      "Car Allocation",
      "Enquiry",
      "My Commissions",
      "Sales Overview",
      "My Schedule",
      "Team Management",
    ],
  },
  {
    key: "project_management",
    label: "Project Management",
    icon: Users,
    modules: [
      "Site Inspections",
      "Quality Control",
      "Project Task Verifications",
      "Project Task Management",
      "Contractors",
      "Materials",
      "Labor Management",
    ],
  },
  {
    key: "finance",
    label: "Finance",
    icon: IndianRupee,
    modules: [
      "Invoices",
      "Invoice Management",
      // "Payments",
      // "Payment Processing",
      "Budget Management",
      "Financial Reports",
      "Reports",
      "Tax Documents",
    ],
  },
  {
    key: "website",
    label: "Website",
    icon: Globe,
    modules: [
      "CMS",
      "Content Management",
      "Profile",
      "Communications",
      "Careers Management",
    ],
  },
  {
    key: "task_tracker",
    label: "Task Tracker",
    icon: CheckSquare,
    modules: ["Task Tracker"],
  },
  {
    key: "audit_logs",
    label: "Audit Logs",
    icon: FileText,
    modules: ["Audit Logs"],
  },
  {
    key: "support",
    label: "Support",
    icon: HelpCircle,
    modules: ["Help & Support"],
  },
  {
    key: "secure",
    label: "Secure",
    icon: Shield,
    modules: ["Secure", "Payments", "Customer Purchased"],
  },
];

const fetchRolePermissions = async (roleName: string) => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/role/getRole/${roleName}`,
    { withCredentials: true },
  );
  return data?.permissions || [];
};

interface DropDownSidebarProps {
  collapsed: boolean;
}

const DropDownSidebar: React.FC<DropDownSidebarProps> = ({ collapsed }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const { data: rolePermissions } = useQuery({
    queryKey: ["sidebarPermissions", user?.role],
    queryFn: () => fetchRolePermissions(user!.role),
    enabled: !!user?.role,
  });

  const navigation: NavItem[] = useMemo(() => {
    if (!user) return [];
    return buildNavigationForRole(rolePermissions || [], user.role);
  }, [rolePermissions, user]);

  const groupedNavigation = useMemo(() => {
    const map: Record<string, NavItem[]> = {};
    NAV_GROUPS.forEach((group) => {
      const filtered = navigation.filter((item) =>
        group.modules.includes(item.label),
      );
      map[group.key] = filtered.sort(
        (a, b) =>
          group.modules.indexOf(a.label) - group.modules.indexOf(b.label),
      );
    });
    return map;
  }, [navigation]);

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!user) return null;

  return (
    <nav className="flex-1 overflow-y-auto py-2 px-2 custom-scrollbar">
      <div className="space-y-1">
        {NAV_GROUPS.map((group) => {
          const items = groupedNavigation[group.key];
          if (!items?.length) return null;

          const active = items.some((item) => location.pathname === item.to);
          const isOpen = openGroups[group.key] ?? active;
          const GroupIcon = group.icon;

          return (
            <div key={group.key} className="mb-1">
              {/* GROUP HEADER */}
              <button
                onClick={() => toggleGroup(group.key)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200",
                  "hover:bg-white/10 text-white/70 hover:text-white",
                  (isOpen || active) && "bg-white/5 text-white",
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <GroupIcon size={18} className="flex-shrink-0" />
                  {!collapsed && (
                    <span className="text-[16px] font-medium truncate tracking-tight">
                      {group.label}
                    </span>
                  )}
                </div>

                {!collapsed && (
                  <div
                    className={cn(
                      "transition-transform duration-200",
                      isOpen && "rotate-180",
                    )}
                  >
                    <ChevronDown size={14} className="opacity-50" />
                  </div>
                )}
              </button>

              {/* NESTED ITEMS */}
              {!collapsed && (
                <div
                  className={cn(
                    "transition-all duration-300 ease-in-out overflow-hidden",
                    isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0",
                  )}
                >
                  <div className="mt-1 ml-4 border-l border-white/10 pl-2 space-y-0.5">
                    {items.map((item) => (
                      <SidebarLink
                        key={item.to}
                        to={item.to}
                        icon={item.icon}
                        label={item.label}
                        active={location.pathname === item.to}
                        collapsed={collapsed}
                        // Ensure SidebarLink uses: text-[12px], whitespace-nowrap, and truncate
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
};

export default React.memo(DropDownSidebar);
