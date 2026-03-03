import { useState, useMemo } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterBar } from "../components/FilterBar";
import { MetricCard } from "../components/MetricCard";
import { DataTable } from "../components/DataTable";
import { ExportButton } from "../components/ExportButton";
import { ReportFilters, TeamLeadReportRow } from "../types";
import { reportColumns } from "../utils/columns";
import { subDays } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Loader from "@/components/Loader";

export default function TeamLeadsReport() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: subDays(new Date(), 30),
    dateTo: new Date(),
    groupBy: "month",
    search: "",
  });
  const { data, isLoading, isError } = useQuery({
    queryKey: ["team-leads-report", filters],
    queryFn: async () => {
      const res = await axios.get(
        `${import.meta.env.VITE_URL}/api/reports/team-leads`,
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

  const reportData: TeamLeadReportRow[] = Array.isArray(data) ? data : [];
  const filteredData = useMemo(() => {
    if (!filters.search) return reportData;

    return reportData.filter((row) =>
      row.teamLeadName?.toLowerCase().includes(filters.search!.toLowerCase()),
    );
  }, [reportData, filters.search]);

  const metrics = useMemo(() => {
    const totalClosed = filteredData.reduce(
      (sum, row) => sum + (row.leadsClosed || 0),
      0,
    );

    const totalLeads = filteredData.reduce(
      (sum, row) => sum + (row?.totalLeads || 0),
      0,
    );
    const avgConversion =
      totalLeads > 0
        ? Number(((totalClosed / totalLeads) * 100).toFixed(1))
        : 0;

    return [
      {
        label: "Total Leads Closed",
        value: totalClosed,
        format: "number" as const,
      },
      {
        label: "Total Leads	",
        value: totalLeads,
        format: "number" as const,
      },
      {
        label: "Avg Conversion",
        value: avgConversion,
        format: "percent" as const,
      },
    ];
  }, [filteredData]);

  if (isLoading) return <Loader />;

  if (isError) {
    return (
      <MainLayout>
        <div className="p-6 text-red-500 font-medium">
          Failed to load Team Lead report
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
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

            <h1 className="text-3xl font-bold">Team Lead Report</h1>
            <p className="text-muted-foreground">
              Team performance and aggregated metrics
            </p>
          </div>

          <ExportButton
            reportTitle="Team Lead Report"
            data={filteredData}
            columns={reportColumns["team-leads"]}
            filters={filters}
          />
        </div>

        <FilterBar filters={filters} onFiltersChange={setFilters} showSearch />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Team Lead Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={reportColumns["team-leads"]}
              data={filteredData}
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
