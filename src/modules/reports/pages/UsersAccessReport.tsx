import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterBar } from "../components/FilterBar";
import { MetricCard } from "../components/MetricCard";
import { DataTable } from "../components/DataTable";
import { ExportButton } from "../components/ExportButton";
import { ReportFilters, UserAccessReportRow } from "../types";
import { reportColumns } from "../utils/columns";
import { subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockData: UserAccessReportRow[] = [
  {
    userId: "1",
    name: "John Doe",
    role: "admin",
    eventType: "login",
    ip: "192.168.1.1",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    timestamp: new Date().toISOString(),
  },
  {
    userId: "2",
    name: "Sarah Smith",
    role: "sales_manager",
    eventType: "login",
    ip: "192.168.1.5",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    userId: "1",
    name: "John Doe",
    role: "admin",
    eventType: "logout",
    ip: "192.168.1.1",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
];

export default function UsersAccessReport() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: subDays(new Date(), 30),
    dateTo: new Date(),
    groupBy: "day",
  });

  const totalLogins = mockData.filter(
    (row) => row.eventType === "login"
  ).length;
  const uniqueUsers = new Set(mockData.map((row) => row.userId)).size;
  const failedAttempts = mockData.filter(
    (row) => row.eventType === "fail"
  ).length;

  const metrics = [
    { label: "Total Logins", value: totalLogins, format: "number" as const },
    {
      label: "Active Users",
      value: uniqueUsers,
      format: "number" as const,
      trend: { value: 12.5, isPositive: true },
    },
    {
      label: "Failed Attempts",
      value: failedAttempts,
      format: "number" as const,
    },
    {
      label: "Success Rate",
      value: 98.5,
      format: "percent" as const,
      trend: { value: 1.2, isPositive: true },
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/reports")}
              className="mb-4"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to Buildings
            </Button>
            <h1 className="text-3xl font-bold">User Access History</h1>
            <p className="text-muted-foreground">
              System access tracking and security monitoring
            </p>
          </div>
          <ExportButton
            reportTitle="User Access History"
            data={mockData}
            columns={reportColumns["users-access"]}
            filters={filters}
          />
        </div>

        <FilterBar filters={filters} onFiltersChange={setFilters} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Access Log</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={reportColumns["users-access"]}
              data={mockData}
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
