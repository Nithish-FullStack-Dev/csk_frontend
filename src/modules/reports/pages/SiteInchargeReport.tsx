import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterBar } from "../components/FilterBar";
import { MetricCard } from "../components/MetricCard";
import { DataTable } from "../components/DataTable";
import { ExportButton } from "../components/ExportButton";
import { ReportFilters, SiteInchargeReportRow } from "../types";
import { reportColumns } from "../utils/columns";
import { subDays } from "date-fns";

const mockData: SiteInchargeReportRow[] = [
  {
    siteInchargeId: "1",
    name: "Raj Kumar",
    period: "Jan 2025",
    projectsActive: 3,
    qcTasksCreated: 45,
    tasksVerified: 128,
    inspections: 22,
    avgProgressPercent: 75.8,
  },
  {
    siteInchargeId: "2",
    name: "Priya Sharma",
    period: "Jan 2025",
    projectsActive: 2,
    qcTasksCreated: 38,
    tasksVerified: 95,
    inspections: 18,
    avgProgressPercent: 68.5,
  },
];

export default function SiteInchargeReport() {
  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: subDays(new Date(), 30),
    dateTo: new Date(),
    groupBy: "month",
  });

  const totalProjects = mockData.reduce((sum, row) => sum + row.projectsActive, 0);
  const totalVerified = mockData.reduce((sum, row) => sum + row.tasksVerified, 0);
  const totalInspections = mockData.reduce((sum, row) => sum + row.inspections, 0);
  const avgProgress = mockData.reduce((sum, row) => sum + row.avgProgressPercent, 0) / mockData.length;

  const metrics = [
    { label: "Active Projects", value: totalProjects, format: "number" as const },
    { label: "Tasks Verified", value: totalVerified, format: "number" as const, trend: { value: 18.2, isPositive: true } },
    { label: "Inspections Done", value: totalInspections, format: "number" as const, trend: { value: 12.5, isPositive: true } },
    { label: "Avg Progress", value: avgProgress, format: "percent" as const, trend: { value: 8.7, isPositive: true } },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Site In-Charge Report</h1>
            <p className="text-muted-foreground">
              Project oversight, QC tasks, inspections, and construction progress
            </p>
          </div>
          <ExportButton
            reportTitle="Site In-Charge Report"
            data={mockData}
            columns={reportColumns["site-incharge"]}
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
            <CardTitle>Site In-Charge Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={reportColumns["site-incharge"]} data={mockData} />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
