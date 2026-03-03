import { useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterBar } from "../components/FilterBar";
import { MetricCard } from "../components/MetricCard";
import { DataTable } from "../components/DataTable";
import { ExportButton } from "../components/ExportButton";
import { ReportFilters, PropertiesReportRow } from "../types";
import { reportColumns } from "../utils/columns";
import { subDays, format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function PropertiesReport() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: subDays(new Date(), 30),
    dateTo: new Date(),
    groupBy: "month",
  });

  const {
    data = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["properties-report", filters],
    queryFn: async () => {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

      const res = await axios.get(`${API_BASE}/api/reports/properties`, {
        params: {
          dateFrom: filters.dateFrom.toISOString(),
          dateTo: filters.dateTo.toISOString(),
          groupBy: filters.groupBy,
        },
        withCredentials: true,
      });
      return res.data.data as PropertiesReportRow[];
    },
  });
  const metrics = useMemo(() => {
    if (!data?.length) return [];

    const totalBookings = data.reduce(
      (sum, row) => sum + (row?.enquiries || 0),
      0,
    );

    const totalSold = data.reduce((sum, row) => sum + (row.soldUnits || 0), 0);

    return [
      {
        label: "Total Enquiries",
        value: totalBookings,
        format: "number" as const,
      },
      {
        label: "Units Sold",
        value: totalSold,
        format: "number" as const,
      },
      {
        label: "Total properties",
        value: data?.length || 0,
        format: "number" as const,
      },
    ];
  }, [data]);

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
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to Reports
            </Button>
            <h1 className="text-3xl font-bold">Properties Report</h1>
            <p className="text-muted-foreground">
              Properties and availability analysis across all properties
            </p>
          </div>

          <ExportButton
            reportTitle="Properties Report"
            data={data}
            columns={reportColumns.properties}
            filters={filters}
          />
        </div>

        <FilterBar filters={filters} onFiltersChange={setFilters} />

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : isError ? (
          <div className="text-red-500 text-center py-10">
            Failed to load report
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {metrics.map((metric, index) => (
                <MetricCard key={index} metric={metric} />
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Detailed Report</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable columns={reportColumns.properties} data={data} />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  );
}
