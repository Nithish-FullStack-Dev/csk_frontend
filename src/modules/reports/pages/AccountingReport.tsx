import { useState } from "react";
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

// Mock data
const mockData: AccountingReportRow[] = [
  {
    period: "Jan 2025",
    revenueTotal: 78500000,
    invoicesReceived: 145,
    invoicesApproved: 128,
    invoicesRejected: 17,
    cashIn: 85000000,
    cashOut: 42000000,
    netCashFlow: 43000000,
    taxUploads: 12,
    taxClaims: 8,
    budgetAllocated: 100000000,
    budgetUsed: 68000000,
    budgetUtilizedPercent: 68,
  },
  {
    period: "Feb 2025",
    revenueTotal: 82000000,
    invoicesReceived: 158,
    invoicesApproved: 142,
    invoicesRejected: 16,
    cashIn: 88000000,
    cashOut: 45000000,
    netCashFlow: 43000000,
    taxUploads: 10,
    taxClaims: 7,
    budgetAllocated: 100000000,
    budgetUsed: 72000000,
    budgetUtilizedPercent: 72,
  },
];

export default function AccountingReport() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: subDays(new Date(), 30),
    dateTo: new Date(),
    groupBy: "month",
  });

  const totalRevenue = mockData.reduce((sum, row) => sum + row.revenueTotal, 0);
  const totalCashFlow = mockData.reduce((sum, row) => sum + row.netCashFlow, 0);
  const totalInvoices = mockData.reduce(
    (sum, row) => sum + row.invoicesReceived,
    0
  );
  const avgBudgetUtil =
    mockData.reduce((sum, row) => sum + row.budgetUtilizedPercent, 0) /
    mockData.length;

  const metrics = [
    {
      label: "Total Revenue",
      value: totalRevenue,
      format: "currency" as const,
      trend: { value: 12.8, isPositive: true },
    },
    {
      label: "Net Cash Flow",
      value: totalCashFlow,
      format: "currency" as const,
      trend: { value: 8.5, isPositive: true },
    },
    {
      label: "Invoices Received",
      value: totalInvoices,
      format: "number" as const,
      trend: { value: 15.2, isPositive: true },
    },
    {
      label: "Budget Utilized",
      value: avgBudgetUtil,
      format: "percent" as const,
      trend: { value: 4.2, isPositive: false },
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
            <h1 className="text-3xl font-bold">Financial Report</h1>
            <p className="text-muted-foreground">
              Comprehensive financial analysis including revenue, cash flow, and
              budget tracking
            </p>
          </div>
          <ExportButton
            reportTitle="Financial Report"
            data={mockData}
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
            <DataTable columns={reportColumns.accounting} data={mockData} />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
