import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterBar } from "../components/FilterBar";
import { MetricCard } from "../components/MetricCard";
import { DataTable } from "../components/DataTable";
import { ExportButton } from "../components/ExportButton";
import { ReportFilters, PropertiesReportRow } from "../types";
import { reportColumns } from "../utils/columns";
import { subDays } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

// Mock data - replace with actual API call
const mockData: PropertiesReportRow[] = [
  {
    period: "Jan 2025",
    propertyId: "1",
    propertyName: "Skyline Towers",
    totalUnits: 120,
    soldUnits: 85,
    availableUnits: 35,
    sellThroughPercent: 70.8,
    bookings: 12,
    revenue: 48500000,
    avgDealSize: 4041667,
  },
  {
    period: "Feb 2025",
    propertyId: "1",
    propertyName: "Skyline Towers",
    totalUnits: 120,
    soldUnits: 95,
    availableUnits: 25,
    sellThroughPercent: 79.2,
    bookings: 10,
    revenue: 42000000,
    avgDealSize: 4200000,
  },
  {
    period: "Jan 2025",
    propertyId: "2",
    propertyName: "Green Valley",
    totalUnits: 80,
    soldUnits: 45,
    availableUnits: 35,
    sellThroughPercent: 56.3,
    bookings: 8,
    revenue: 28000000,
    avgDealSize: 3500000,
  },
];

export default function PropertiesReport() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: subDays(new Date(), 30),
    dateTo: new Date(),
    groupBy: "month",
  });

  // Calculate metrics
  const totalRevenue = mockData.reduce((sum, row) => sum + row.revenue, 0);
  const totalBookings = mockData.reduce((sum, row) => sum + row.bookings, 0);
  const totalSold = mockData.reduce((sum, row) => sum + row.soldUnits, 0);
  const avgSellThrough =
    mockData.reduce((sum, row) => sum + row.sellThroughPercent, 0) /
    mockData.length;

  const metrics = [
    {
      label: "Total Revenue",
      value: totalRevenue,
      format: "currency" as const,
      trend: { value: 12.5, isPositive: true },
    },
    {
      label: "Total Bookings",
      value: totalBookings,
      format: "number" as const,
      trend: { value: 8.3, isPositive: true },
    },
    {
      label: "Units Sold",
      value: totalSold,
      format: "number" as const,
      trend: { value: 15.2, isPositive: true },
    },
    {
      label: "Avg Sell-Through",
      value: avgSellThrough,
      format: "percent" as const,
      trend: { value: 3.4, isPositive: true },
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
            <h1 className="text-3xl font-bold">Properties Report</h1>
            <p className="text-muted-foreground">
              Revenue and availability analysis across all properties
            </p>
          </div>
          <ExportButton
            reportTitle="Properties Report"
            data={mockData}
            columns={reportColumns.properties}
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
            <CardTitle>Detailed Report</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={reportColumns.properties} data={mockData} />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
