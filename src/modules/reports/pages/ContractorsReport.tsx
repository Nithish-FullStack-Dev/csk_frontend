import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterBar } from "../components/FilterBar";
import { MetricCard } from "../components/MetricCard";
import { DataTable } from "../components/DataTable";
import { ExportButton } from "../components/ExportButton";
import { ReportFilters, ContractorReportRow } from "../types";
import { reportColumns } from "../utils/columns";
import { subDays } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const mockData: ContractorReportRow[] = [
  {
    contractorId: "1",
    contractorName: "BuildRight Construction",
    period: "Jan 2025",
    tasksCreated: 85,
    tasksApproved: 72,
    tasksRejected: 8,
    invoicesCount: 12,
    photoEvidenceCount: 145,
    avgProgressPercent: 78.5,
  },
  {
    contractorId: "2",
    contractorName: "ProBuild Services",
    period: "Jan 2025",
    tasksCreated: 68,
    tasksApproved: 58,
    tasksRejected: 6,
    invoicesCount: 10,
    photoEvidenceCount: 112,
    avgProgressPercent: 72.3,
  },
];

export default function ContractorsReport() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: subDays(new Date(), 30),
    dateTo: new Date(),
    groupBy: "month",
  });

  const totalTasks = mockData.reduce((sum, row) => sum + row.tasksCreated, 0);
  const totalApproved = mockData.reduce(
    (sum, row) => sum + row.tasksApproved,
    0
  );
  const totalInvoices = mockData.reduce(
    (sum, row) => sum + row.invoicesCount,
    0
  );
  const avgProgress =
    mockData.reduce((sum, row) => sum + row.avgProgressPercent, 0) /
    mockData.length;

  const metrics = [
    {
      label: "Total Tasks",
      value: totalTasks,
      format: "number" as const,
      trend: { value: 15.2, isPositive: true },
    },
    {
      label: "Tasks Approved",
      value: totalApproved,
      format: "number" as const,
      trend: { value: 18.8, isPositive: true },
    },
    {
      label: "Invoices Created",
      value: totalInvoices,
      format: "number" as const,
      trend: { value: 12.5, isPositive: true },
    },
    {
      label: "Avg Progress",
      value: avgProgress,
      format: "percent" as const,
      trend: { value: 8.3, isPositive: true },
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
            <h1 className="text-3xl font-bold">Contractor Report</h1>
            <p className="text-muted-foreground">
              Tasks, invoices, photo evidence, and work progress tracking
            </p>
          </div>
          <ExportButton
            reportTitle="Contractor Report"
            data={mockData}
            columns={reportColumns.contractors}
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
            <CardTitle>Contractor Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={reportColumns.contractors} data={mockData} />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
