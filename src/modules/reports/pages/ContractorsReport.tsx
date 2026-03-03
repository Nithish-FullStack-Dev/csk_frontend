import { useState, useMemo } from "react";
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
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Loader from "@/components/Loader";

export default function ContractorsReport() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: subDays(new Date(), 30),
    dateTo: new Date(),
    groupBy: "month",
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["contractor-report", filters],
    queryFn: async () => {
      const res = await axios.get(
        `${import.meta.env.VITE_URL}/api/reports/contractors`,
        {
          params: {
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo,
            groupBy: filters.groupBy,
          },
          withCredentials: true,
        },
      );

      return res.data?.data || [];
    },
  });

  const reportData: ContractorReportRow[] = Array.isArray(data) ? data : [];

  const metrics = useMemo(() => {
    const totalTasks = reportData.reduce(
      (sum, row) => sum + row.tasksCreated,
      0,
    );

    const totalApproved = reportData.reduce(
      (sum, row) => sum + row.tasksApproved,
      0,
    );

    const totalInvoices = reportData.reduce(
      (sum, row) => sum + (row.invoicesCreated || 0),
      0,
    );
    const avgProgress =
      reportData.length > 0
        ? reportData.reduce((sum, row) => sum + row.avgProgressPercent, 0) /
          reportData.length
        : 0;

    return [
      { label: "Total Tasks", value: totalTasks, format: "number" as const },
      {
        label: "Tasks Approved",
        value: totalApproved,
        format: "number" as const,
      },
      {
        label: "Invoices Created",
        value: totalInvoices,
        format: "number" as const,
      },
      { label: "Avg Progress", value: avgProgress, format: "percent" as const },
    ];
  }, [reportData]);

  if (isLoading) return <Loader />;

  if (isError) {
    return (
      <MainLayout>
        <div className="p-6 text-red-500 font-medium">
          Failed to load Contractor report
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between gap-4">
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/reports")}
              className="mb-4"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Reports
            </Button>
            <h1 className="text-3xl font-bold">Contractor Report</h1>
            <p className="text-muted-foreground">
              Tasks, approvals, evidence and progress tracking
            </p>
          </div>

          <ExportButton
            reportTitle="Contractor Report"
            data={reportData}
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
            <DataTable columns={reportColumns.contractors} data={reportData} />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
