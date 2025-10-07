import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterBar } from "../components/FilterBar";
import { MetricCard } from "../components/MetricCard";
import { DataTable } from "../components/DataTable";
import { ExportButton } from "../components/ExportButton";
import { ReportFilters, AgentReportRow } from "../types";
import { reportColumns } from "../utils/columns";
import { subDays } from "date-fns";

// Mock data
const mockData: AgentReportRow[] = [
  {
    agentId: "1",
    agentName: "John Doe",
    period: "Jan 2025",
    leadsAdded: 45,
    enquiries: 32,
    siteBookings: 18,
    leadsClosed: 12,
    conversionRate: 26.7,
  },
  {
    agentId: "2",
    agentName: "Sarah Smith",
    period: "Jan 2025",
    leadsAdded: 38,
    enquiries: 28,
    siteBookings: 15,
    leadsClosed: 10,
    conversionRate: 26.3,
  },
  {
    agentId: "1",
    agentName: "John Doe",
    period: "Feb 2025",
    leadsAdded: 52,
    enquiries: 40,
    siteBookings: 22,
    leadsClosed: 15,
    conversionRate: 28.8,
  },
];

export default function AgentsReport() {
  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: subDays(new Date(), 30),
    dateTo: new Date(),
    groupBy: "month",
  });

  const totalLeads = mockData.reduce((sum, row) => sum + row.leadsAdded, 0);
  const totalClosed = mockData.reduce((sum, row) => sum + row.leadsClosed, 0);
  const totalBookings = mockData.reduce((sum, row) => sum + row.siteBookings, 0);
  const avgConversion = mockData.reduce((sum, row) => sum + row.conversionRate, 0) / mockData.length;

  const metrics = [
    { label: "Total Leads", value: totalLeads, format: "number" as const, trend: { value: 18.2, isPositive: true } },
    { label: "Leads Closed", value: totalClosed, format: "number" as const, trend: { value: 22.1, isPositive: true } },
    { label: "Site Bookings", value: totalBookings, format: "number" as const, trend: { value: 14.5, isPositive: true } },
    { label: "Avg Conversion", value: avgConversion, format: "percent" as const, trend: { value: 5.3, isPositive: true } },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Agent Performance Report</h1>
            <p className="text-muted-foreground">
              Track leads, enquiries, and conversion metrics for all agents
            </p>
          </div>
          <ExportButton
            reportTitle="Agent Performance Report"
            data={mockData}
            columns={reportColumns.agents}
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
            <CardTitle>Agent Performance Details</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={reportColumns.agents} data={mockData} />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
