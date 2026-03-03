import { useState, useMemo } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterBar } from "../components/FilterBar";
import { MetricCard } from "../components/MetricCard";
import { DataTable } from "../components/DataTable";
import { ExportButton } from "../components/ExportButton";
import { ReportFilters, AgentReportRow, ReportMetric } from "../types";
import { reportColumns } from "../utils/columns";
import { subDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/Loader";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AgentsReport() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: subDays(new Date(), 30),
    dateTo: new Date(),
    groupBy: "month",
    search: "",
  });
  const { data, isLoading, isError } = useQuery({
    queryKey: ["agents-report", filters],
    queryFn: async () => {
      const res = await axios.get(
        `${import.meta.env.VITE_URL}/api/reports/agents`,
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

  const reportData: AgentReportRow[] = Array.isArray(data) ? data : [];

  const filteredData = useMemo(() => {
    if (!filters.search) return reportData;

    return reportData.filter((row) =>
      row.agentName?.toLowerCase().includes(filters.search.toLowerCase()),
    );
  }, [reportData, filters.search]);
  const metrics: ReportMetric[] = useMemo(() => {
    const totalLeads = filteredData.reduce(
      (sum, row) => sum + (row.leadsAdded || 0),
      0,
    );

    const totalClosed = filteredData.reduce(
      (sum, row) => sum + (row.leadsClosed || 0),
      0,
    );

    const totalBookings = filteredData.reduce(
      (sum, row) => sum + (row.siteBookings || 0),
      0,
    );

    const avgConversion =
      filteredData.reduce((sum, row) => sum + (row.conversionRate || 0), 0) /
      (filteredData.length || 1);

    return [
      { label: "Total Leads", value: totalLeads, format: "number" },
      { label: "Leads Closed", value: totalClosed, format: "number" },
      { label: "Site Bookings", value: totalBookings, format: "number" },
      { label: "Avg Conversion", value: avgConversion, format: "percent" },
    ];
  }, [filteredData]);

  if (isLoading) return <Loader />;

  if (isError) {
    return (
      <MainLayout>
        <div className="p-6 text-red-500 font-medium">
          Failed to load agent report
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

            <h1 className="text-3xl font-bold">Agent Performance Report</h1>
            <p className="text-muted-foreground">
              Track leads and conversion metrics
            </p>
          </div>

          <ExportButton
            reportTitle="Agent Performance Report"
            data={filteredData}
            columns={reportColumns.agents}
            filters={filters}
          />
        </div>

        <FilterBar filters={filters} onFiltersChange={setFilters} showSearch />

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
            <DataTable columns={reportColumns.agents} data={filteredData} />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
