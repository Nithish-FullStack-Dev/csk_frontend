import {
  Home,
  Building,
  Users,
  FileText,
  Calendar,
  DollarSign,
  Briefcase,
  Settings,
  MessageCircle,
} from "lucide-react";

export const moduleToNavItem: Record<string, any> = {
  Dashboard: { to: "/", icon: Home, label: "Dashboard" },
  Properties: { to: "/properties", icon: Building, label: "Properties" },
  "User Management": { to: "/users", icon: Users, label: "User Management" },
  "Content Management": { to: "/content", icon: FileText, label: "Content Management" },
  "System Settings": { to: "/settings", icon: Settings, label: "System Settings" },
  "Sales Pipeline": { to: "/sales/pipeline", icon: Briefcase, label: "Sales Pipeline" },
  "Team Management": { to: "/sales/team", icon: Users, label: "Team Management" },
  "Lead Management": { to: "/sales/leads", icon: Users, label: "Lead Management" },
  Commissions: { to: "/sales/commissions", icon: DollarSign, label: "Commissions" },
  Projects: { to: "/operations/projects", icon: Briefcase, label: "Projects" },
  "Task Management": { to: "/operations/tasks", icon: Calendar, label: "Task Management" },
  "Quality Control": { to: "/operations/quality", icon: FileText, label: "Quality Control" },
  "Site Inspections": { to: "/operations/inspections", icon: FileText, label: "Site Inspections" },
  Contractors: { to: "/operations/contractors", icon: Users, label: "Contractors" },
  Materials: { to: "/operations/materials", icon: FileText, label: "Materials" },
  "Labor Management": { to: "/operations/labor", icon: Users, label: "Labor Management" },
  Invoices: { to: "/finance/invoices", icon: FileText, label: "Invoices" },
  Payments: { to: "/finance/payments", icon: DollarSign, label: "Payments" },
  "Budget Tracking": { to: "/finance/budget", icon: FileText, label: "Budget Tracking" },
  "Tax Documents": { to: "/finance/tax", icon: FileText, label: "Tax Documents" },
  Reports: { to: "/finance/reports", icon: FileText, label: "Reports" },
  Communications: { to: "/communications", icon: MessageCircle, label: "Communications" },
};

export const buildNavigationForRole = (rolePermissions: any[]): any[] => {
  if (!rolePermissions || !Array.isArray(rolePermissions)) return [];
  const navItems: any[] = [];

  rolePermissions.forEach((perm) => {
    const hasAnyPermission = Object.values(perm.actions).some((val) => val);
    if (!hasAnyPermission) return;
    const navItem = moduleToNavItem[perm.submodule];
    if (navItem) navItems.push(navItem);
  });

  return navItems;
};
