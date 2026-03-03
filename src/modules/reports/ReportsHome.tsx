import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import {
  Building2,
  UserCog,
  Users2,
  TrendingUp,
  HardHat,
  ClipboardCheck,
  Calculator,
} from "lucide-react";
import { ReportConfig } from "./types";
import MainLayout from "@/components/layout/MainLayout";
import { motion } from "framer-motion";

const reportConfigs: ReportConfig[] = [
  {
    id: "properties",
    title: "Properties Report",
    description: "Revenue & availability analysis",
    icon: Building2,
    category: "Business",
    roles: ["admin", "owner", "sales_manager", "accountant"],
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

  const availableReports = reportConfigs.filter((report) =>
    report.roles.includes(user?.role || ""),
  );

  const reportsByCategory = availableReports.reduce(
    (acc, report) => {
      if (!acc[report.category]) acc[report.category] = [];
      acc[report.category].push(report);
      return acc;
    },
    {} as Record<string, ReportConfig[]>,
  );

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 space-y-10">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Reports
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Comprehensive reporting and analytics across all business functions
          </p>
        </div>

        {/* Categories */}
        {Object.entries(reportsByCategory).map(([category, reports]) => (
          <div key={category} className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">
                {category}
              </h2>
              <div className="h-px flex-1 bg-border ml-6" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report, index) => {
                const Icon = report.icon;

                return (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      onClick={() => navigate(`/reports/${report.id}`)}
                      className="group cursor-pointer rounded-2xl border bg-background/70 backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>

                          <div className="space-y-1">
                            <CardTitle className="text-lg font-semibold">
                              {report.title}
                            </CardTitle>
                            <CardDescription className="text-sm text-muted-foreground">
                              {report.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                          View detailed analytics →
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}

        {/* No Reports */}
        {availableReports.length === 0 && (
          <Card className="rounded-2xl shadow-md">
            <CardContent className="py-10 text-center text-muted-foreground">
              No reports available for your role.
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
