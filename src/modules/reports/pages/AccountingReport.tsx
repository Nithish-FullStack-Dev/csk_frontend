import { useState, useMemo } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterBar } from "../components/FilterBar";
import { MetricCard } from "../components/MetricCard";
import { DataTable } from "../components/DataTable";
import { ExportButton } from "../components/ExportButton";
import { ReportFilters, AccountingReportRow } from "../types";
import { reportColumns } from "../utils/columns";
import { subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Loader from "@/components/Loader";

export default function AccountingReport() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: subDays(new Date(), 30),
    dateTo: new Date(),
    groupBy: "month",
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["accounting-report", filters],
    queryFn: async () => {
      const res = await axios.get(
        `${import.meta.env.VITE_URL}/api/reports/accounting`,
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

  const reportData: AccountingReportRow[] = Array.isArray(data) ? data : [];


  const metrics = useMemo(() => {
    if (!reportData.length) return [];

    const totalInvoices = reportData.reduce(
      (sum, row) => sum + row.invoicesReceived,
      0,
    );

    const totalApproved = reportData.reduce(
      (sum, row) => sum + row.invoicesApproved,
      0,
    );

    const totalRejected = reportData.reduce(
      (sum, row) => sum + row.invoicesRejected,
      0,
    );

    const avgBudgetUtil =
      reportData.reduce((sum, row) => sum + row.budgetUtilizedPercent, 0) /
      reportData.length;

    return [
      {
        label: "Invoices Received",
        value: totalInvoices,
        format: "number" as const,
      },
      {
        label: "Invoices Approved",
        value: totalApproved,
        format: "number" as const,
      },
      {
        label: "Invoices Rejected",
        value: totalRejected,
        format: "number" as const,
      },
      {
        label: "Avg Budget Utilized",
        value: avgBudgetUtil,
        format: "percent" as const,
      },
    ];
  }, [reportData]);

  if (isLoading) return <Loader />;

  if (isError) {
    return (
      <MainLayout>
        <div className="p-6 text-red-500 font-medium">
          Failed to load Financial Report
        </div>
      </MainLayout>
    );
  }

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
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Reports
            </Button>

            <h1 className="text-3xl font-bold">Financial Report</h1>
            <p className="text-muted-foreground">
              Invoice tracking and budget performance overview
            </p>
          </div>

          <ExportButton
            reportTitle="Financial Report"
            data={reportData}
            columns={reportColumns.accounting}
            filters={filters}
          />
        </div>

        <FilterBar
          filters={filters}
          onFiltersChange={setFilters}
          showSearch={false}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Financial Details</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={reportColumns.accounting} data={reportData} />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
