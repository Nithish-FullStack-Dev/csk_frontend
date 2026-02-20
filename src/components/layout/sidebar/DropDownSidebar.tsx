"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  FolderKanban,
  Users,
  IndianRupee,
  Globe,
  Shield,
  HelpCircle,
} from "lucide-react";

import SidebarLink from "./SidebarLink";
import { buildNavigationForRole } from "./navigationConfig";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                  TYPES                                     */
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

/* -------------------------------------------------------------------------- */
/*                               GROUP CONFIG                                 */
/* -------------------------------------------------------------------------- */

const NAV_GROUPS: NavGroup[] = [
  {
    key: "admin",
    label: "Admin",
    icon: Shield,
    modules: [
      "Dashboard",
      "User Management",
      "Role Management",
      "System Settings",
      "Communications",
      "Profile",
      "Department",
    ],
  },
  {
    key: "projects",
    label: "Projects",
    icon: FolderKanban,
    modules: [
      "Properties",
      "Projects Overview",
      "Project Manager",
      "Site Visits",
      "Construction Timeline",
      "Quality Control",
      "Site Inspections",
      "Trash – Buildings",
    ],
  },
  {
    key: "sales",
    label: "Sales",
    icon: IndianRupee,
    modules: [
      "Lead Management",
      "Customer Management",
      "Enquiry",
      "Commissions",
      "My Commissions",
      "Sales Overview",
    ],
  },
  {
    key: "team",
    label: "Team",
    icon: Users,
    modules: [
      "Team Management",
      "My Team",
      "Car Allocation",
      "Task Management",
      "Task Verifications",
      "Labor Management",
      "Contractors",
    ],
  },
  {
    key: "finance",
    label: "Finance",
    icon: IndianRupee,
    modules: [
      "Invoices",
      "Invoice Management",
      "Payments",
      "Payment Processing",
      "Budget Management",
      "Financial Reports",
      "Reports",
      "Tax Documents",
      "Budget Tracking",
    ],
  },
  {
    key: "website",
    label: "Website",
    icon: Globe,
    modules: ["CMS", "Content Management"],
  },
  {
    key: "support",
    label: "Support",
    icon: HelpCircle,
    modules: ["Help & Support"],
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
      map[group.key] = navigation.filter((item) =>
        group.modules.includes(item.label),
      );
    });

    return map;
  }, [navigation]);

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!user) return null;
  const isGroupActive = (items: NavItem[]) => {
    return items.some((item) => location.pathname === item.to);
  };
  return (
    <nav className="flex-1 overflow-y-auto py-4 px-0 ">
      <div className="space-y-3">
        {NAV_GROUPS.map((group) => {
          const items = groupedNavigation[group.key];
          if (!items?.length) return null;

          const isOpen = openGroups[group.key] ?? isGroupActive(items);
          const GroupIcon = group.icon;

          return (
            <div key={group.key} className="rounded-2xl">
              {/* GROUP HEADER */}
              <button
                onClick={() => toggleGroup(group.key)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-xl transition",
                  "text-lg font-semibold tracking-wide",
                  "hover:bg-white/10",
                  (isOpen || isGroupActive(items)) && "bg-white/10 text-white",
                )}
              >
                <div className="flex items-center gap-2">
                  <GroupIcon size={16} className="opacity-80" />
                  {!collapsed && <span>{group.label}</span>}
                </div>

                {!collapsed && (
                  <div>
                    {isOpen ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </div>
                )}
              </button>

              {/* ITEMS */}
              <div
                className={cn(
                  "transition-all duration-300 overflow-hidden",
                  isOpen ? "max-h-[600px] mt-2" : "max-h-0",
                )}
              >
                <div className="space-y-1 pl-2">
                  {items.map((item) => (
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
              </div>
            </div>
          );
        })}
      </div>
    </nav>
  );
};

export default React.memo(DropDownSidebar);
