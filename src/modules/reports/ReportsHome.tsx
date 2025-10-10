import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import {
  Building2,
  Users,
  UserCog,
  Users2,
  TrendingUp,
  HardHat,
  ClipboardCheck,
  Calculator,
} from "lucide-react";
import { ReportConfig, ReportType } from "./types";
import MainLayout from "@/components/layout/MainLayout";

const reportConfigs: ReportConfig[] = [
  {
    id: "properties",
    title: "Properties Report",
    description: "Revenue & availability analysis",
    icon: Building2,
    category: "Business",
    roles: ["admin", "owner", "sales_manager", "team_lead", "accountant"],
    columns: [],
  },
  {
    id: "users-access",
    title: "User Access History",
    description: "System access and login tracking",
    icon: Users,
    category: "Security",
    roles: ["admin", "owner"],
    columns: [],
  },
  {
    id: "agents",
    title: "Agent Performance",
    description: "Leads, enquiries & conversions",
    icon: UserCog,
    category: "Sales",
    roles: ["admin", "owner", "sales_manager", "team_lead"],
    columns: [],
  },
  {
    id: "team-leads",
    title: "Team Lead Report",
    description: "Team performance & incentives",
    icon: Users2,
    category: "Sales",
    roles: ["admin", "owner", "sales_manager", "team_lead"],
    columns: [],
  },
  {
    id: "sales-managers",
    title: "Sales Overview",
    description: "Overall sales & bookings",
    icon: TrendingUp,
    category: "Sales",
    roles: ["admin", "owner", "sales_manager"],
    columns: [],
  },
  {
    id: "contractors",
    title: "Contractor Report",
    description: "Tasks, invoices & progress",
    icon: HardHat,
    category: "Construction",
    roles: ["admin", "owner", "site_incharge", "contractor"],
    columns: [],
  },
  {
    id: "site-incharge",
    title: "Site In-Charge Report",
    description: "QC, inspections & progress",
    icon: ClipboardCheck,
    category: "Construction",
    roles: ["admin", "owner", "site_incharge"],
    columns: [],
  },
  {
    id: "accounting",
    title: "Financial Report",
    description: "Revenue, cash flow & budgets",
    icon: Calculator,
    category: "Finance",
    roles: ["admin", "owner", "accountant"],
    columns: [],
  },
];

export default function ReportsHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Filter reports based on user role
  const availableReports = reportConfigs.filter((report) =>
    report.roles.includes(user?.role || "")
  );

  // Group reports by category
  const reportsByCategory = availableReports.reduce((acc, report) => {
    if (!acc[report.category]) {
      acc[report.category] = [];
    }
    acc[report.category].push(report);
    return acc;
  }, {} as Record<string, ReportConfig[]>);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">
            Comprehensive reporting and analytics across all business functions
          </p>
        </div>

        {Object.entries(reportsByCategory).map(([category, reports]) => (
          <div key={category} className="space-y-4">
            <h2 className="text-xl font-semibold">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.map((report) => {
                const Icon = report.icon;
                return (
                  <Card
                    key={report.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/reports/${report.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {report.title}
                          </CardTitle>
                          <CardDescription>
                            {report.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}

        {availableReports.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No reports available for your role. Contact your administrator
                for access.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
