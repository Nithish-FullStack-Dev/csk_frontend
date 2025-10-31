// import {
//   BarChart3,
//   Building,
//   Users,
//   Home,
//   FileText,
//   MessageCircle,
//   Calendar,
//   Settings,
//   CreditCard,
//   Map,
//   CheckSquare,
//   UserPlus,
//   ClipboardList,
//   HelpCircle,
//   LayoutDashboard,
//   Hammer,
//   Construction,
//   ListTodo,
//   Receipt,
//   Camera,
//   AlertTriangle,
//   Clock,
//   Gauge,
//   CheckCircle,
//   Car,
//   Shield,
//   User,
//   MessagesSquare,
// } from "lucide-react";
// import { UserRole } from "@/contexts/AuthContext";

// // Define navigation items for each role
// export const navigationByRole: Record<
//   UserRole,
//   Array<{ to: string; icon: React.ElementType; label: string }>
// > = {
//   owner: [
//     { to: "/", icon: LayoutDashboard, label: "Executive Dashboard" },
//     { to: "/analytics", icon: BarChart3, label: "Business Analytics" },
//     { to: "/properties", icon: Building, label: "Properties" },
//     { to: "/users", icon: Users, label: "User Management" },
//     { to: "/roles", icon: Shield, label: "Role Management" },
//     { to: "/sales", icon: CreditCard, label: "Sales Overview" },
//     { to: "/operations", icon: CheckSquare, label: "Operations" },
//     { to: "/finances", icon: CreditCard, label: "Finances" },
//     { to: "/messaging", icon: MessageCircle, label: "Communications" },
//     { to: "/profile", icon: User, label: "Profile" },
//   ],
//   admin: [
//     { to: "/", icon: LayoutDashboard, label: "Admin Dashboard" },
//     { to: "/users", icon: Users, label: "User Management" },
//     { to: "/roles", icon: Shield, label: "Role Management" },
//     { to: "/properties", icon: Building, label: "Properties" },
//     { to: "/content", icon: FileText, label: "CMS" },
//     { to: "/messaging", icon: MessageCircle, label: "Communications" },
//     { to: "/enquiry", icon: MessagesSquare, label: "Enquiry" },
//     { to: "/profile", icon: User, label: "Profile" },
//   ],
//   sales_manager: [
//     { to: "/", icon: LayoutDashboard, label: "Sales Dashboard" },
//     { to: "/leads", icon: UserPlus, label: "Lead Management" },
//     { to: "/teamLead", icon: Users, label: "Team Management" },
//     { to: "/commissions", icon: CreditCard, label: "Commissions" },
//     { to: "/properties", icon: Building, label: "Properties" },
//     { to: "/reports", icon: FileText, label: "Sales Reports" },
//     { to: "/customer", icon: BarChart3, label: "Customer Management" },
//     { to: "/messaging", icon: MessageCircle, label: "Communications" },
//     { to: "/enquiry", icon: MessagesSquare, label: "Enquiry" },
//   ],
//   team_lead: [
//     { to: "/", icon: LayoutDashboard, label: "Team Dashboard" },
//     { to: "/team", icon: Users, label: "My Team" },
//     { to: "/visits", icon: Map, label: "Site Visits" },
//     { to: "/vehicles", icon: Car, label: "Car Allocation" },
//     { to: "/approvals", icon: CheckSquare, label: "Approvals" },
//     { to: "/properties", icon: Building, label: "Properties" },
//     { to: "/messaging", icon: MessageCircle, label: "Communications" },
//     { to: "/settings", icon: Settings, label: "System Config" },
//     { to: "/profile", icon: User, label: "Profile" },
//   ],
//   agent: [
//     { to: "/", icon: LayoutDashboard, label: "Agent Dashboard" },
//     { to: "/leads", icon: UserPlus, label: "Lead Management" },
//     { to: "/schedule", icon: Calendar, label: "My Schedule" },
//     { to: "/visits", icon: Map, label: "Site Visits" },
//     { to: "/documents", icon: FileText, label: "Documents" },
//     { to: "/commissions", icon: CreditCard, label: "My Commissions" },
//     { to: "/properties", icon: Building, label: "Properties" },
//     { to: "/messaging", icon: MessageCircle, label: "Communications" },
//     { to: "/settings", icon: Settings, label: "System Config" },
//     { to: "/profile", icon: User, label: "Profile" },
//   ],
//   site_incharge: [
//     { to: "/", icon: LayoutDashboard, label: "Site Dashboard" },
//     { to: "/projects", icon: Building, label: "Projects Overview" },
//     { to: "/verifications", icon: CheckCircle, label: "Task Verifications" },
//     { to: "/quality", icon: AlertTriangle, label: "Quality Control" },
//     { to: "/inspections", icon: Camera, label: "Site Inspections" },
//     { to: "/schedule", icon: Calendar, label: "Inspection Schedule" },
//     { to: "/contractors", icon: Users, label: "Contractors" },
//     { to: "/progress", icon: Gauge, label: "Construction Progress" },
//     { to: "/messaging", icon: MessageCircle, label: "Communications" },
//   ],
//   contractor: [
//     { to: "/", icon: LayoutDashboard, label: "Contractor Dashboard" },
//     { to: "/projects", icon: Building, label: "My Projects" },
//     { to: "/tasks", icon: ListTodo, label: "Task Management" },
//     { to: "/timeline", icon: Clock, label: "Construction Timeline" },
//     { to: "/materials", icon: Construction, label: "Materials" },
//     { to: "/labor", icon: Hammer, label: "Labor Management" },
//     { to: "/invoices", icon: Receipt, label: "Invoices" },
//     { to: "/evidence", icon: Camera, label: "Photo Evidence" },
//     { to: "/messaging", icon: MessageCircle, label: "Communications" },
//   ],
//   accountant: [
//     { to: "/", icon: LayoutDashboard, label: "Finance Dashboard" },
//     { to: "/invoices", icon: FileText, label: "Invoice Management" },
//     { to: "/payments", icon: CreditCard, label: "Payments" },
//     { to: "/reports", icon: BarChart3, label: "Financial Reports" },
//     { to: "/budgets", icon: ClipboardList, label: "Budget Tracking" },
//     { to: "/taxes", icon: FileText, label: "Tax Documents" },
//     { to: "/messaging", icon: MessageCircle, label: "Communications" },
//     { to: "/settings", icon: Settings, label: "System Config" },
//     { to: "/profile", icon: User, label: "Profile" },
//   ],
//   customer_purchased: [
//     { to: "/", icon: LayoutDashboard, label: "My Dashboard" },
//     { to: "/properties", icon: Home, label: "My Properties" },
//     { to: "/documents", icon: FileText, label: "My Documents" },
//     { to: "/payments", icon: CreditCard, label: "Payment History" },
//     { to: "/progress", icon: Building, label: "Construction Progress" },
//     { to: "/support", icon: HelpCircle, label: "Support" },
//     { to: "/messaging", icon: MessageCircle, label: "Messages" },
//   ],
//   customer_prospect: [
//     { to: "/", icon: LayoutDashboard, label: "Dashboard" },
//     { to: "/browse", icon: Building, label: "Browse Properties" },
//     { to: "/saved", icon: Home, label: "Saved Properties" },
//     { to: "/visits", icon: Calendar, label: "Site Visits" },
//     { to: "/documents", icon: FileText, label: "My Documents" },
//     { to: "/status", icon: ClipboardList, label: "Application Status" },
//     { to: "/support", icon: HelpCircle, label: "Support" },
//   ],
// };

import {
  Home,
  Building,
  Users,
  FileText,
  Calendar,
  Briefcase,
  Settings,
  MessageCircle,
  Shield,
  User,
  BarChart3,
  Car,
  CheckSquare,
  IndianRupee,
  AlertTriangle,
  Camera,
  Construction,
  Hammer,
  Receipt,
  CheckCircle,
  ReceiptIndianRupee,
  Gauge,
  ListTodo,
} from "lucide-react";

export const moduleToNavItem: Record<string, any> = {
  // Common modules
  Dashboard: { to: "/", icon: Home, label: "Dashboard" },
  Profile: { to: "/profile", icon: User, label: "Profile" },
  "System Settings": {
    to: "/settings",
    icon: Settings,
    label: "System Settings",
  },
  Communications: {
    to: "/messaging",
    icon: MessageCircle,
    label: "Communications",
  },

  // Admin-only
  "Role Management": { to: "/roles", icon: Shield, label: "Role Management" },
  "User Management": { to: "/users", icon: Users, label: "User Management" },
  "Content Management": { to: "/content", icon: FileText, label: "CMS" },

  // Other modules
  Properties: { to: "/properties", icon: Building, label: "Properties" },
  Enquiry: { to: "/enquiry", icon: FileText, label: "Enquiry" },
  "Team Management": { to: "/teamLead", icon: Users, label: "Team Management" },
  "My Team": { to: "/team", icon: Users, label: "My Team" },
  "Site Visits": { to: "/visits", icon: Calendar, label: "Site Visits" },
  "Car Allocation": { to: "/vehicles", icon: Car, label: "Car Allocation" },
  Approvals: { to: "/approvals", icon: CheckSquare, label: "Approvals" },
  "My Schedule": { to: "/myschedule", icon: Calendar, label: "My Schedule" },
  "Inspection Schedule": {
    to: "/myschedule",
    icon: Calendar,
    label: "Inspection Schedule",
  },
  "My Commissions": {
    to: "/commissions",
    icon: IndianRupee,
    label: "My Commissions",
  },
  "My Documents": { to: "/documents", icon: FileText, label: "My Documents" },
  "Construction Progress": {
    to: "/progress",
    icon: Gauge,
    label: "Construction Progress",
  },
  // "My Projects": { to: "/projects", icon: Briefcase, label: "My Projects" },
  "Task Management": { to: "/tasks", icon: ListTodo, label: "Task Management" },
  "Invoice Management": {
    to: "/invoices",
    icon: FileText,
    label: "Invoice Management",
  },
  "Payment Processing": {
    to: "/payments",
    icon: IndianRupee,
    label: "Payment Processing",
  },
  "Budget Management": {
    to: "/budget",
    icon: FileText,
    label: "Budget Management",
  },
  "Financial Reports": {
    to: "/reports",
    icon: FileText,
    label: "Financial Reports",
  },
  "Lead Management": { to: "/leads", icon: Users, label: "Lead Management" },
  Commissions: { to: "/commissions", icon: IndianRupee, label: "Commissions" },
  "Projects Overview": {
    to: "/projects",
    icon: Building,
    label: "Projects Overview",
  },
  "Construction Timeline": {
    to: "/timeline",
    icon: Calendar,
    label: "Construction Timeline",
  },
  "Quality Control": {
    to: "/quality",
    icon: AlertTriangle,
    label: "Quality Control",
  },
  "Site Inspections": {
    to: "/inspections",
    icon: Camera,
    label: "Site Inspections",
  },
  Contractors: { to: "/contractors", icon: Users, label: "Contractors" },
  Materials: { to: "/materials", icon: Construction, label: "Materials" },
  "Labor Management": { to: "/labor", icon: Hammer, label: "Labor Management" },
  Invoices: { to: "/invoices", icon: ReceiptIndianRupee, label: "Invoices" },
  "Task Verifications": {
    to: "/verifications",
    icon: CheckCircle,
    label: "Task Verifications",
  },
  Payments: { to: "/payments", icon: IndianRupee, label: "Payments" },
  "Business Analytics": {
    to: "/analytics",
    icon: BarChart3,
    label: "Business Analytics",
  },
  "Sales Overview": { to: "/sales", icon: BarChart3, label: "Sales Overview" },
  Operations: { to: "/operations", icon: Settings, label: "Operations" },
  Finances: { to: "/finances", icon: IndianRupee, label: "Finances" },
  "Budget Tracking": {
    to: "/budgets",
    icon: FileText,
    label: "Budget Tracking",
  },
  "Tax Documents": { to: "/taxes", icon: FileText, label: "Tax Documents" },
  Reports: { to: "/reports", icon: BarChart3, label: "Reports" },
  "Customer Management": {
    to: "/customer",
    icon: BarChart3,
    label: "Customer Management",
  },
  "Photo Evidence": {
    to: "/evidence",
    icon: Camera,
    label: "Photo Evidence",
  },
};

// Build dynamic navigation based on role + permissions
export const buildNavigationForRole = (
  rolePermissions: any[],
  roleName: string
): any[] => {
  // const topDefaults = [moduleToNavItem["Dashboard"]];
  const bottomDefaults = [
    moduleToNavItem["System Settings"],
    moduleToNavItem["Profile"],
  ];
  let middle: any[] = [];

  // Add modules based on permissions
  if (rolePermissions && Array.isArray(rolePermissions)) {
    rolePermissions.forEach((perm) => {
      const hasAnyPermission = Object.values(perm.actions).some((val) => val);
      if (!hasAnyPermission) return;

      const navItem = moduleToNavItem[perm.submodule];
      if (navItem && !middle.find((n) => n.label === navItem.label)) {
        middle.push(navItem);
      }
    });
    // Admin always sees Role Management (in middle flow)
    if (roleName === "admin") {
      middle.push(moduleToNavItem["Role Management"]);
    }
  }

  // Remove System Settings and Profile if present in middle
  middle = middle.filter((item) => item.label !== "System Settings");
  // Final structure: Dashboard → middle → Profile → Communications
  return [...middle, ...bottomDefaults];
};
