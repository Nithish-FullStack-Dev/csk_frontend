import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterBar } from "../components/FilterBar";
import { MetricCard } from "../components/MetricCard";
import { DataTable } from "../components/DataTable";
import { ExportButton } from "../components/ExportButton";
import { ReportFilters, TeamLeadReportRow } from "../types";
import { reportColumns } from "../utils/columns";
import { subDays } from "date-fns";

const mockData: TeamLeadReportRow[] = [
  {
    teamLeadId: "1",
    teamLeadName: "Mike Johnson",
    period: "Jan 2025",
    teamMembers: 8,
    leadsClosed: 45,
    siteBookingsApproved: 32,
    siteBookingsRejected: 5,
    incentivesToDate: 1250000,
    trips: 18,
    kms: 420,
  },
  {
    teamLeadId: "2",
    teamLeadName: "Lisa Anderson",
    period: "Jan 2025",
    teamMembers: 6,
    leadsClosed: 38,
    siteBookingsApproved: 28,
    siteBookingsRejected: 3,
    incentivesToDate: 980000,
    trips: 15,
    kms: 360,
  },
];

export default function TeamLeadsReport() {
  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: subDays(new Date(), 30),
    dateTo: new Date(),
    groupBy: "month",
  });

  const totalClosed = mockData.reduce((sum, row) => sum + row.leadsClosed, 0);
  const totalIncentives = mockData.reduce(
    (sum, row) => sum + row.incentivesToDate,
    0
  );
  const totalApproved = mockData.reduce(
    (sum, row) => sum + row.siteBookingsApproved,
    0
  );
  const totalKms = mockData.reduce((sum, row) => sum + row.kms, 0);

  const metrics = [
    {
      label: "Total Leads Closed",
      value: totalClosed,
      format: "number" as const,
      trend: { value: 18.5, isPositive: true },
    },
    {
      label: "Total Incentives",
      value: totalIncentives,
      format: "currency" as const,
      trend: { value: 22.3, isPositive: true },
    },
    {
      label: "Bookings Approved",
      value: totalApproved,
      format: "number" as const,
      trend: { value: 12.8, isPositive: true },
    },
    { label: "Total KMs", value: totalKms, format: "number" as const },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Team Lead Report</h1>
            <p className="text-muted-foreground">
              Team performance, incentives, and vehicle tracking
            </p>
          </div>
          <ExportButton
            reportTitle="Team Lead Report"
            data={mockData}
            columns={reportColumns["team-leads"]}
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
            <CardTitle>Team Lead Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={reportColumns["team-leads"]} data={mockData} />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
