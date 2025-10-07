import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterBar } from "../components/FilterBar";
import { MetricCard } from "../components/MetricCard";
import { DataTable } from "../components/DataTable";
import { ExportButton } from "../components/ExportButton";
import { ReportFilters, SalesManagerReportRow } from "../types";
import { reportColumns } from "../utils/columns";
import { subDays } from "date-fns";

const mockData: SalesManagerReportRow[] = [
  {
    managerId: "1",
    managerName: "David Chen",
    period: "Jan 2025",
    bookings: 145,
    dealsWon: 98,
    revenue: 425000000,
    avgDealSize: 4336735,
  },
  {
    managerId: "2",
    managerName: "Emma Wilson",
    period: "Jan 2025",
    bookings: 132,
    dealsWon: 85,
    revenue: 378000000,
    avgDealSize: 4447059,
  },
  {
    managerId: "1",
    managerName: "David Chen",
    period: "Feb 2025",
    bookings: 158,
    dealsWon: 105,
    revenue: 468000000,
    avgDealSize: 4457143,
  },
];

export default function SalesManagersReport() {
  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: subDays(new Date(), 30),
    dateTo: new Date(),
    groupBy: "month",
  });

  const totalBookings = mockData.reduce((sum, row) => sum + row.bookings, 0);
  const totalDeals = mockData.reduce((sum, row) => sum + row.dealsWon, 0);
  const totalRevenue = mockData.reduce((sum, row) => sum + row.revenue, 0);
  const avgDealSize = totalRevenue / totalDeals;

  const metrics = [
    { label: "Total Bookings", value: totalBookings, format: "number" as const, trend: { value: 15.8, isPositive: true } },
    { label: "Deals Won", value: totalDeals, format: "number" as const, trend: { value: 18.2, isPositive: true } },
    { label: "Total Revenue", value: totalRevenue, format: "currency" as const, trend: { value: 22.5, isPositive: true } },
    { label: "Avg Deal Size", value: avgDealSize, format: "currency" as const, trend: { value: 5.3, isPositive: true } },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Sales Manager Report</h1>
            <p className="text-muted-foreground">
              Overall sales performance, bookings, and revenue tracking
            </p>
          </div>
          <ExportButton
            reportTitle="Sales Manager Report"
            data={mockData}
            columns={reportColumns["sales-managers"]}
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
            <CardTitle>Sales Manager Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={reportColumns["sales-managers"]} data={mockData} />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
