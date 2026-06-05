import { useState } from "react";
import {
  Search,
  Building2,
  Users,
  HardHat,
  TrendingUp,
  UserCheck,
  CreditCard,
  MessageSquare,
  Globe,
  ChevronDown,
  ChevronRight,
  Play,
  BookOpen,
  Shield,
  Zap,
  LifeBuoy,
  Home,
  Layers,
  ClipboardList,
  Car,
  Eye,
  Lock,
  ArrowRight,
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import axios from "axios";

const modules = [
  {
    id: "admin",
    icon: Shield,
    label: "Admin & Owner",
    color: "#1e293b",
    lightColor: "#f1f5f9",
    accentColor: "#475569",
    badge: "Core",
    overview:
      "The Admin and Owner module provides complete system control including property creation, role management, user administration, internal communications, and website content management.",
    sections: [
      {
        title: "Property Management",
        icon: Building2,
        content:
          "Admins can create and manage the full property hierarchy. This includes Buildings broken down into Floors and Units, Open Plots subdivided into Inner Plots, and standalone Open Land entries. All properties can be updated or deleted, and every activity across the platform is mapped back to a specific property.",
        bullets: [
          "Create Buildings → Floors → Units",
          "Create Open Plots → Inner Plots",
          "Create and manage Open Land entries",
          "Update or delete any property structure",
          "Map all platform activities to properties",
        ],
      },
      {
        title: "Role Management (RBAC)",
        icon: Lock,
        content:
          "The system uses Role-Based Access Control (RBAC) to ensure every user sees only what they're authorized to see. Admins can define custom roles and assign granular permissions at the module level.",
        bullets: [
          "Create custom roles for your organization",
          "Assign Read, Write, Edit, and Delete permissions",
          "Control access at the module level",
          "Enforce least-privilege access across the platform",
        ],
      },
      {
        title: "User Management",
        icon: Users,
        content:
          "Admins and Owners manage all user accounts in the system. Users are created with a role, email credentials, and can be enabled or disabled at any time.",
        bullets: [
          "Create user accounts for all roles",
          "Assign roles and set login credentials",
          "Enable or disable user accounts instantly",
        ],
      },
      {
        title: "Communication Module",
        icon: MessageSquare,
        content:
          "An internal messaging system allows role-to-role communication directly within the CRM, eliminating the need for external messaging tools.",
        bullets: [
          "Internal messaging between any roles",
          "Structured role-to-role communication",
        ],
      },
      {
        title: "CMS Module",
        icon: Globe,
        content:
          "Admins can manage the public-facing website content directly from the CRM dashboard, keeping property listings and company information up to date.",
        bullets: [
          "Manage Hero section content",
          "Edit About page information",
          "Upload and organize Gallery images",
          "Update Contact details",
        ],
      },
      {
        title: "Profile Management",
        icon: UserCheck,
        content:
          "All users, including Admins and Owners, can update their personal information and change their login credentials from their profile settings.",
        bullets: [
          "Update personal information",
          "Change email and password credentials",
        ],
      },
    ],
  },
  {
    id: "construction",
    icon: HardHat,
    label: "Construction",
    color: "#92400e",
    lightColor: "#fffbeb",
    accentColor: "#d97706",
    badge: "Workflow",
    overview:
      "The Construction module manages the complete lifecycle of a construction project — from project creation and contractor assignment through task execution, verification, quality control, material requests, and invoice processing.",
    sections: [
      {
        title: "Project Creation",
        icon: ClipboardList,
        content:
          "Site Incharges initiate construction projects and link them precisely to a property, floor, and unit within the system.",
        bullets: [
          "Site Incharge creates new projects",
          "Projects are linked to Property → Floor → Unit",
        ],
      },
      {
        title: "Contractor Management",
        icon: HardHat,
        content:
          "Contractors are added to the system and assigned to specific projects by the Site Incharge.",
        bullets: [
          "Add contractors to the system",
          "Assign contractors to specific projects",
        ],
      },
      {
        title: "Task Management",
        icon: ClipboardList,
        content:
          "Contractors manage their daily work through tasks. Each task can include photo evidence and a completion percentage, giving the Site Incharge full visibility into on-ground progress.",
        bullets: [
          "Contractors create tasks under their project",
          "Upload images as progress evidence",
          "Update task progress percentage (0–100%)",
        ],
      },
      {
        title: "Task Submission & Verification",
        icon: Eye,
        content:
          "When a task reaches 100% completion, the contractor submits it to the Site Incharge for review. The Site Incharge can approve it as complete or reject it and mark it for rework.",
        bullets: [
          "Submit button activates at 100% progress",
          "Site Incharge reviews all submitted tasks",
          "Approve → marks task as completed",
          "Reject → marks task as rework",
        ],
      },
      {
        title: "Quality Control",
        icon: Shield,
        content:
          "Site Incharges can raise quality issues at any point, attaching evidence and assigning issues directly to the responsible contractor.",
        bullets: [
          "Report quality issues with evidence",
          "Attach photos or documents as proof",
          "Assign issues to specific contractors",
        ],
      },
      {
        title: "Material & Invoice Module",
        icon: CreditCard,
        content:
          "Contractors can request materials needed for their work. Once work is complete, they submit invoices that are verified and processed for payment by the Accountant.",
        bullets: [
          "Contractor raises material requests",
          "Contractor submits invoices after task completion",
          "Accountant verifies and processes payments",
        ],
      },
    ],
  },
  {
    id: "sales",
    icon: TrendingUp,
    label: "Sales",
    color: "#14532d",
    lightColor: "#f0fdf4",
    accentColor: "#16a34a",
    badge: "Revenue",
    overview:
      "The Sales module covers the full customer acquisition pipeline — from capturing leads through website enquiries or manual entry, through assignment, follow-ups, site visits, and final sale closure.",
    sections: [
      {
        title: "Lead Management",
        icon: Users,
        content:
          "Leads enter the system either from website enquiries submitted by potential customers or through manual entry by agents. All leads are tracked centrally.",
        bullets: [
          "Capture leads from website enquiry forms",
          "Manual lead entry by sales agents",
          "Centralized lead tracking across the team",
        ],
      },
      {
        title: "Lead Assignment",
        icon: ChevronRight,
        content:
          "Admins assign leads to the Sales Manager, who then distributes them down the team hierarchy to Team Leads and Agents.",
        bullets: [
          "Admin assigns leads to Sales Manager",
          "Sales Manager distributes to Team Leads or Agents",
          "Team structure: Sales Manager → Team Lead → Agent",
        ],
      },
      {
        title: "Target Management",
        icon: TrendingUp,
        content:
          "Revenue and lead targets can be set for the sales team, enabling performance tracking and accountability.",
        bullets: [
          "Set revenue targets for the team",
          "Set lead conversion targets",
          "Monitor progress against targets",
        ],
      },
      {
        title: "Lead Tracking",
        icon: ClipboardList,
        content:
          "Agents maintain each lead's lifecycle through structured status updates, ensuring no opportunity is lost.",
        bullets: [
          "Add, edit, or delete leads",
          "Track status: New → Follow-up → Converted / Lost",
        ],
      },
      {
        title: "Site Visit Management",
        icon: Car,
        content:
          "Agents request site visits which Team Leads approve or reject. Team Leads also allocate vehicles for visits. Agents update the visit outcome once complete.",
        bullets: [
          "Agent requests a site visit",
          "Team Lead approves or rejects the request",
          "Team Lead assigns a vehicle for the visit",
          "Agent marks visit as Cancelled or Completed",
        ],
      },
      {
        title: "Sales Closure",
        icon: Building2,
        content:
          "Once a deal is finalized, the Sales Manager marks the property as Closed (Sold), updating its status across the entire platform.",
        bullets: [
          "Sales Manager marks property as Sold",
          "Property status updated system-wide",
        ],
      },
    ],
  },
  {
    id: "customer",
    icon: UserCheck,
    label: "Customer Management",
    color: "#3b0764",
    lightColor: "#faf5ff",
    accentColor: "#7c3aed",
    badge: "Portal",
    overview:
      "The Customer Management module handles post-sale operations — creating customer accounts, securely managing payment records, and giving customers a dedicated portal to view their purchased property and payment history.",
    sections: [
      {
        title: "Customer Creation",
        icon: UserCheck,
        content:
          "Once a property is sold, the Admin creates a customer login account, granting them access to the customer portal.",
        bullets: [
          "Admin creates customer account after purchase",
          "Customer receives login credentials",
        ],
      },
      // {
      //   title: "Secure Access System",
      //   icon: Lock,
      //   content:
      //     "Sensitive financial modules are protected by a secondary authentication layer. Access is triggered by pressing and holding the logo for 3 seconds, followed by email and OTP verification. Only Owners and Accountants can access these modules.",
      //   bullets: [
      //     "Press & hold logo for 3 seconds to trigger secure access",
      //     "Email + OTP verification required",
      //     "Only Owner and Accountant roles have access",
      //   ],
      // },
      {
        title: "Customer Data Management",
        icon: Users,
        content:
          "All customer data is stored securely and linked to their purchased property, providing a complete record.",
        bullets: [
          "Store personal details",
          "Link purchased property details",
          "Maintain full payment history",
        ],
      },
      {
        title: "Payment Management",
        icon: CreditCard,
        content:
          "Payment entries can be added manually with full details. The system tracks total cost, amount paid, and pending balance at all times.",
        bullets: [
          "Add payment entries (amount, mode, date)",
          "Track Total, Paid, and Pending amounts",
          "Full payment history per customer",
        ],
      },
      {
        title: "Property Linking",
        icon: Home,
        content:
          "Each sold unit is linked to the purchasing customer, displaying their name and contact email on the property record.",
        bullets: [
          "Purchased unit shows customer name",
          "Customer email linked to property record",
        ],
      },
      {
        title: "Customer Portal",
        icon: Eye,
        content:
          "Customers log in to their own portal to view everything related to their purchase — property details, payment status, and construction progress.",
        bullets: [
          "View purchased property details",
          "View payment records and pending dues",
          "Track property/construction status",
        ],
      },
    ],
  },
];

const systemFlow = [
  { step: 1, label: "Admin creates property" },
  { step: 2, label: "Site Incharge starts construction project" },
  { step: 3, label: "Contractor performs tasks" },
  { step: 4, label: "Site Incharge verifies tasks" },
  { step: 5, label: "Sales team manages leads" },
  { step: 6, label: "Customer visits property" },
  { step: 7, label: "Property sold" },
  { step: 8, label: "Customer account created" },
  { step: 9, label: "Payments managed securely" },
  { step: 10, label: "Customer views details in portal" },
];

const roles = [
  { role: "Admin", desc: "Full system control", icon: "A" },
  { role: "Owner", desc: "Similar privileges to Admin", icon: "O" },
  { role: "Site Incharge", desc: "Manages construction", icon: "SI" },
  { role: "Contractor", desc: "Executes construction tasks", icon: "C" },
  { role: "Accountant", desc: "Handles finance & payments", icon: "AC" },
  { role: "Sales Manager", desc: "Oversees sales", icon: "SM" },
  { role: "Team Lead", desc: "Manages agents", icon: "TL" },
  { role: "Agent", desc: "Handles leads & visits", icon: "AG" },
  { role: "Customer", desc: "Views purchased property", icon: "CU" },
];

const videos = [
  {
    title: "Property Workflow",
    desc: "Complete walkthrough of creating and managing Buildings, Plots, and Land within CSK Realtors CRM.",
    tag: "Foundation",
    src: "/assets/Kt-videos/properties.mp4",
  },
  {
    title: "Sales Module",
    desc: "End-to-end guide covering lead capture, assignment, site visits, and closing a sale.",
    tag: "Revenue",
    src: "/assets/Kt-videos/sales.mp4",
  },
  {
    title: "Construction Module",
    desc: "How to manage projects, contractors, tasks, quality control, and invoices.",
    tag: "Operations",
    src: "/assets/Kt-videos/construction.mp4",
  },
];

function VideoCard({ video }) {
  return (
    <div className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-300">
      <div className="relative h-52 border-b border-gray-100 overflow-hidden bg-black">
        <video
          className="w-full h-full object-cover"
          controls
          preload="metadata"
        >
          <source src={video.src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <div className="absolute top-3 right-3">
          <span className="text-[10px] bg-black/70 text-white px-2 py-1 rounded-full backdrop-blur-sm">
            KT Video
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-gray-900 font-semibold text-sm">{video.title}</h3>

          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
            style={{ background: "#f1f5f9", color: "#475569" }}
          >
            {video.tag}
          </span>
        </div>

        <p className="text-gray-500 text-xs leading-relaxed">{video.desc}</p>
      </div>
    </div>
  );
}

function SectionAccordion({ section }) {
  const [open, setOpen] = useState(false);
  const Icon = section.icon;
  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all duration-200 ${
        open
          ? "border-gray-300 shadow-sm"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
          <Icon className="w-3.5 h-3.5 text-gray-500" />
        </div>
        <span className="flex-1 text-gray-800 font-medium text-sm">
          {section.title}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-gray-100 bg-white">
          <p className="text-gray-500 text-sm leading-relaxed mb-4 mt-3">
            {section.content}
          </p>
          <ul className="space-y-2.5">
            {section.bullets.map((b, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm text-gray-700"
              >
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ModuleTab({ module, isActive, onClick }) {
  const Icon = module.icon;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        isActive
          ? "bg-gray-900 text-white shadow-sm"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      }`}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{
          background: isActive ? "rgba(255,255,255,0.15)" : module.lightColor,
        }}
      >
        <Icon
          className="w-4 h-4"
          style={{ color: isActive ? "white" : module.accentColor }}
        />
      </div>
      <span className="text-sm font-medium">{module.label}</span>
      {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
    </button>
  );
}

export default function HelpPage() {
  const [activeModule, setActiveModule] = useState(modules[0].id);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const current = modules.find((m) => m.id === activeModule);
  const ModuleIcon = current.icon;

  const filtered = search.trim()
    ? modules
        .map((m) => ({
          ...m,
          sections: m.sections.filter(
            (s) =>
              s.title.toLowerCase().includes(search.toLowerCase()) ||
              s.content.toLowerCase().includes(search.toLowerCase()) ||
              s.bullets.some((b) =>
                b.toLowerCase().includes(search.toLowerCase()),
              ),
          ),
        }))
        .filter(
          (m) =>
            m.sections.length > 0 ||
            m.label.toLowerCase().includes(search.toLowerCase()),
        )
    : null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement)?.value;
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value;
    const issue = (form.elements.namedItem("issue") as HTMLTextAreaElement)
      ?.value;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_URL}/api/contact/send-email`,
        {
          name,
          email,
          subject: "Help & Support",
          message: issue,
        },
        { withCredentials: true },
      );

      if (res.status === 200) {
        toast.success("Your request has been submitted!");
        setOpen(false);
      } else {
        toast.error(res.data?.message || "Failed to send email");
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(
        error.response?.data?.message || "Something went wrong while sending",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div
        className="min-h-screen bg-gray-50"
        style={{ fontFamily: "'Geist', 'DM Sans', sans-serif" }}
      >
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap"
          rel="stylesheet"
        />

        <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold text-gray-900 text-sm">
                CSK Realtors
              </span>
              <span className="text-gray-300 text-sm">/</span>
              <span className="text-gray-500 text-sm">Help & Support</span>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search documentation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-4 py-2 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>

        {!search.trim() ? (
          <>
            <div className="bg-white border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-6 py-14">
                <div className="max-w-xl">
                  <div className="inline-flex items-center gap-2 border border-gray-200 rounded-full px-3 py-1.5 text-xs text-gray-500 mb-5 bg-gray-50">
                    <LifeBuoy className="w-3 h-3" />
                    Documentation & Knowledge Base
                  </div>
                  <h1
                    className="text-4xl font-bold text-gray-900 mb-3 leading-tight tracking-tight"
                    style={{ letterSpacing: "-0.02em" }}
                  >
                    Help & Support
                  </h1>
                  <p className="text-gray-500 text-base leading-relaxed">
                    Complete documentation for every module in the CSK Realtors
                    CRM platform. Learn how each part of the system works and
                    how roles interact across the entire workflow.
                  </p>
                  <div className="mt-6">
                    <Button onClick={() => setOpen(true)} variant="secondary">
                      Contact Support
                    </Button>
                  </div>
                  <div className="flex items-center gap-5 mt-7">
                    {[
                      { icon: Layers, label: "4 Core Modules" },
                      { icon: Users, label: "9 User Roles" },
                      { icon: Zap, label: "10-Step System Flow" },
                    ].map(({ icon: I, label }) => (
                      <div
                        key={label}
                        className="flex items-center gap-1.5 text-xs text-gray-500"
                      >
                        <I className="w-3.5 h-3.5 text-gray-400" />
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10">
              <div className="flex gap-7">
                <div className="w-56 shrink-0">
                  <div className="sticky top-20 space-y-0.5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-4 mb-3">
                      Modules
                    </p>
                    {modules.map((m) => (
                      <ModuleTab
                        key={m.id}
                        module={m}
                        isActive={activeModule === m.id}
                        onClick={() => {
                          setActiveModule(m.id);

                          const element =
                            document.getElementById("module-content");

                          if (element) {
                            element.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                          }
                        }}
                      />
                    ))}

                    <div className="mt-7 pt-6 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-4 mb-3">
                        Quick Links
                      </p>
                      {[
                        {
                          label: "System Flow",
                          icon: Zap,
                          href: "#system-flow",
                        },
                        {
                          label: "User Roles",
                          icon: Users,
                          href: "#user-roles",
                        },
                        { label: "KT Videos", icon: Play, href: "#kt-videos" },
                      ].map(({ label, icon: I, href }) => (
                        <a
                          key={label}
                          href={href}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                        >
                          <I className="w-3.5 h-3.5" />
                          {label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-10">
                  <div id="module-content">
                    <div className="flex items-center gap-4 mb-6">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center"
                        style={{ background: current.lightColor }}
                      >
                        <ModuleIcon
                          className="w-5 h-5"
                          style={{ color: current.accentColor }}
                        />
                      </div>
                      <div className="flex items-center gap-2.5">
                        <h2
                          className="text-xl font-bold text-gray-900"
                          style={{ letterSpacing: "-0.02em" }}
                        >
                          {current.label} Module
                        </h2>
                        <span className="text-xs border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full bg-white">
                          {current.badge}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5 shadow-sm">
                      <div className="flex items-start gap-3">
                        <BookOpen className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {current.overview}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {current.sections.map((s, i) => (
                        <SectionAccordion key={i} section={s} />
                      ))}
                    </div>
                  </div>

                  <div
                    id="system-flow"
                    className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-gray-600" />
                      </div>
                      <h2
                        className="text-lg font-bold text-gray-900"
                        style={{ letterSpacing: "-0.01em" }}
                      >
                        End-to-End System Flow
                      </h2>
                    </div>
                    <div className="relative">
                      <div className="absolute left-5 top-5 bottom-5 w-px bg-gray-100" />
                      <div className="space-y-1">
                        {systemFlow.map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-5 py-2.5 group"
                          >
                            <div className="relative z-10 w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 group-hover:border-gray-400 group-hover:shadow-sm transition-all">
                              <span className="text-xs font-bold text-gray-500 font-mono">
                                {String(item.step).padStart(2, "0")}
                              </span>
                            </div>
                            <span className="text-gray-600 text-sm group-hover:text-gray-900 transition-colors">
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div id="user-roles">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
                        <Users className="w-4 h-4 text-gray-600" />
                      </div>
                      <h2
                        className="text-lg font-bold text-gray-900"
                        style={{ letterSpacing: "-0.01em" }}
                      >
                        User Roles
                      </h2>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {roles.map((r, i) => (
                        <div
                          key={i}
                          className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-gray-300 transition-all"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                              <span className="text-xs font-bold text-gray-600">
                                {r.icon}
                              </span>
                            </div>
                            <span className="font-semibold text-gray-900 text-sm">
                              {r.role}
                            </span>
                          </div>
                          <p className="text-gray-500 text-xs leading-relaxed">
                            {r.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div id="kt-videos">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
                        <Play className="w-4 h-4 text-gray-600" />
                      </div>
                      <h2
                        className="text-lg font-bold text-gray-900"
                        style={{ letterSpacing: "-0.01em" }}
                      >
                        KT Videos
                      </h2>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {videos.map((v, i) => (
                        <VideoCard key={i} video={v} />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {[
                      {
                        icon: Zap,
                        label: "Response Time",
                        val: "< 2s",
                        sub: "Performance target",
                      },
                      {
                        icon: Shield,
                        label: "Authentication",
                        val: "JWT + OTP",
                        sub: "Security standard",
                      },
                      {
                        icon: Layers,
                        label: "Architecture",
                        val: "Modular",
                        sub: "Scalable by design",
                      },
                    ].map(({ icon: I, label, val, sub }) => (
                      <div
                        key={label}
                        className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                          <I className="w-4 h-4 text-gray-600" />
                        </div>
                        <div
                          className="text-gray-900 font-bold text-xl mb-0.5"
                          style={{ letterSpacing: "-0.02em" }}
                        >
                          {val}
                        </div>
                        <div className="text-gray-700 text-xs font-medium">
                          {label}
                        </div>
                        <div className="text-gray-400 text-xs mt-0.5">
                          {sub}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="max-w-7xl mx-auto px-6 py-10">
            <p className="text-gray-500 text-sm mb-6">
              Results for{" "}
              <span className="text-gray-900 font-semibold">"{search}"</span>
            </p>
            {filtered.length === 0 ? (
              <div className="text-center py-24 text-gray-400 text-sm">
                No results found.
              </div>
            ) : (
              <div className="space-y-8">
                {filtered.map((m) => (
                  <div key={m.id}>
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: m.lightColor }}
                      >
                        <m.icon
                          className="w-4 h-4"
                          style={{ color: m.accentColor }}
                        />
                      </div>
                      <h2 className="text-gray-900 font-semibold text-sm">
                        {m.label} Module
                      </h2>
                    </div>
                    <div className="space-y-2.5">
                      {m.sections.map((s, i) => (
                        <SectionAccordion key={i} section={s} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="border-t border-gray-200 bg-white mt-8">
          <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Building2 className="w-3.5 h-3.5" />
              CSK Realtors CRM — Help & Support
            </div>
            <p className="text-xs text-gray-400">
              Software Requirement Specification v1.0
            </p>
          </div>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-estate-navy">
              Help & Support
            </DialogTitle>
            <DialogDescription>
              Please fill out the form below and we’ll get back to you shortly.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="issue">Issue</Label>
              <Textarea
                id="issue"
                name="issue"
                placeholder="Describe your issue"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Submit"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
