import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, subMonths } from "date-fns";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/Loader";
import { toast } from "sonner";
import {
  IndianRupee,
  TrendingUp,
  Download,
  Info,
  ArrowUpRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Commission, fetchAllCommission } from "@/utils/leads/CommissionConfig";

const AdminMyCommissions = () => {
  const [activeTab, setActiveTab] = useState("all");

  const {
    data: commissions,
    isLoading: isCommissionLoading,
    isError: isCommError,
    error: commErr,
  } = useQuery<Commission[], Error>({
    queryKey: ["commissions"],
    queryFn: fetchAllCommission,
    staleTime: 0,
  });

  useEffect(() => {
    if (isCommError) {
      toast.error("Failed to fetch commissions.");
    }
  }, [isCommError, commErr]);

  if (isCommissionLoading) {
    return <Loader />;
  }

  const actualCommissions: Commission[] = commissions || [];

  const totalEarned = actualCommissions.reduce((sum, commission) => {
    if (commission.status === "paid") {
      return sum + parseFloat(commission.commissionAmount.replace(/[₹,]/g, ""));
    }
    return sum;
  }, 0);

  const pendingAmount = actualCommissions.reduce((sum, commission) => {
    if (commission.status === "pending") {
      return sum + parseFloat(commission.commissionAmount.replace(/[₹,]/g, ""));
    }
    return sum;
  }, 0);

  const totalSales = actualCommissions.length;

  const currentMonth = format(new Date(), "MMMM");
  const currentYear = format(new Date(), "yyyy");

  const thisMonthEarned = actualCommissions.reduce((sum, commission) => {
    const saleDate = new Date(commission.saleDate);
    if (
      commission.status === "paid" &&
      format(saleDate, "MMMM") === currentMonth &&
      format(saleDate, "yyyy") === currentYear
    ) {
      return sum + parseFloat(commission.commissionAmount.replace(/[₹,]/g, ""));
    }
    return sum;
  }, 0);

  const prevMonth = subMonths(new Date(), 1);
  const lastMonthName = format(prevMonth, "MMMM");
  const lastMonthYear = format(prevMonth, "yyyy");

  const lastMonthEarned = actualCommissions.reduce((sum, commission) => {
    const saleDate = new Date(commission.saleDate);
    if (
      commission.status === "paid" &&
      format(saleDate, "MMMM") === lastMonthName &&
      format(saleDate, "yyyy") === lastMonthYear
    ) {
      return sum + parseFloat(commission.commissionAmount.replace(/[₹,]/g, ""));
    }
    return sum;
  }, 0);

  const commissionSummary = {
    totalEarned: `₹${totalEarned.toLocaleString("en-IN")}`,
    pendingAmount: `₹${pendingAmount.toLocaleString("en-IN")}`,
    thisMonth: `₹${thisMonthEarned.toLocaleString("en-IN")}`,
    lastMonth: `₹${lastMonthEarned.toLocaleString("en-IN")}`,
    totalSales: totalSales,
    pendingTransactions: actualCommissions.filter((c) => c.status === "pending")
      .length,
  };

  const monthlySummaryMap = actualCommissions.reduce((acc, commission) => {
    const saleDate = new Date(commission.saleDate);
    const monthYear = format(saleDate, "MMMMyyyy");
    const monthOnly = format(saleDate, "MMMM");

    if (!acc[monthYear]) {
      acc[monthYear] = {
        month: monthOnly,
        sales: 0,
        amount: 0,
        sortDate: saleDate,
      };
    }
    acc[monthYear].sales += 1;
    acc[monthYear].amount += parseFloat(
      commission.commissionAmount.replace(/[₹,]/g, "")
    );
    return acc;
  }, {} as Record<string, { month: string; sales: number; amount: number; sortDate: Date }>);

  const monthlySummary = Object.values(monthlySummaryMap)
    .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime())
    .slice(-4)
    .map((data) => ({
      ...data,
      amount: `₹${data.amount.toLocaleString("en-IN")}`,
    }));

  const maxAmountForChart = monthlySummary.reduce((max, current) => {
    const amount = parseFloat(current.amount.replace(/[^\d]/g, ""));
    return amount > max ? amount : max;
  }, 0);

  const filteredCommissions = actualCommissions.filter((commission) => {
    if (activeTab === "all") return true;
    return commission.status === activeTab;
  });

  const handleDownloadReport = () => {
    if (!filteredCommissions || filteredCommissions.length === 0) {
      toast.info("No data to download for the current tab.");
      return;
    }

    const headers = [
      "Client Name",
      "Property Name",
      "Unit",
      "Property Value",
      "Commission Amount",
      "Commission Percent",
      "Sale Date",
      "Payment Date",
      "Status",
      "Transaction ID",
    ];

    const csvRows = filteredCommissions.map((commission) => {
      const saleDateFormatted = format(
        new Date(commission.saleDate),
        "yyyy-MM-dd"
      );
      const paymentDateFormatted = commission.paymentDate
        ? format(new Date(commission.paymentDate), "yyyy-MM-dd")
        : "N/A";

      return [
        `"${commission.clientId.addedBy.name}"`,
        `"${commission.clientId.property?.projectName}"`,
        `"${commission.clientId.floorUnit?.floorNumber}"`,
        `"${commission.clientId.unit?.plotNo}"`,
        `"${commission.clientId.unit?.totalAmount.toLocaleString("en-IN")}"`,
        `"${commission.commissionAmount}"`,
        `"${commission.commissionPercent}"`,
        `"${saleDateFormatted}"`,
        `"${paymentDateFormatted}"`,
        `"${commission.status}"`,
        `"CSK-COM-${commission._id}"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `commissions_report_${activeTab}_${format(
        new Date(),
        "yyyyMMdd_HHmmss"
      )}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Commission report downloaded successfully!");
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Commissions</h1>
            <p className="text-muted-foreground">
              Track your earnings and payment history
            </p>
          </div>
          <Button variant="outline" onClick={handleDownloadReport}>
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Commission Earned
              </CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {commissionSummary.totalEarned}
              </div>
              <p className="text-xs text-muted-foreground">
                From {commissionSummary.totalSales} property sales
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {commissionSummary.pendingAmount}
              </div>
              <div className="flex items-center pt-1 text-estate-gold">
                <ArrowUpRight className="mr-1 h-4 w-4" />
                <span className="text-xs">
                  From {commissionSummary.pendingTransactions} pending
                  transactions
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {commissionSummary.thisMonth}
              </div>
              <div className="flex items-center pt-1 text-estate-success">
                <ArrowUpRight className="mr-1 h-4 w-4" />
                <span className="text-xs">
                  {parseFloat(
                    commissionSummary.thisMonth.replace(/[₹,]/g, "")
                  ) >
                  parseFloat(commissionSummary.lastMonth.replace(/[₹,]/g, ""))
                    ? "+ Increased"
                    : "- Decreased"}{" "}
                  from last month
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Earnings by Month</CardTitle>
            <CardDescription>
              Your commission earnings summary for the past{" "}
              {monthlySummary.length} months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <div className="grid grid-cols-4 gap-4 h-full">
                {monthlySummary.map((month, i) => {
                  const normalizedValue =
                    maxAmountForChart > 0
                      ? parseFloat(month.amount.replace(/[^\d]/g, "")) /
                        maxAmountForChart
                      : 0;
                  const barHeight = `${Math.max(normalizedValue * 80, 10)}%`;

                  return (
                    <div
                      key={month.month}
                      className="flex flex-col items-center justify-end h-full"
                    >
                      <div
                        className={`w-full max-w-[60px] bg-estate-navy rounded-t-md`}
                        style={{ height: barHeight }}
                      ></div>
                      <div className="mt-2 text-center">
                        <p className="font-medium">{month.month}</p>
                        <p className="text-xs text-muted-foreground">
                          {month.amount}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {month.sales} {month.sales === 1 ? "sale" : "sales"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Commission History</CardTitle>
            <CardDescription>
              Details of all your commission earnings to date
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {/* Desktop Tabs */}
              <TabsList className="hidden md:grid grid-cols-3 w-full mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
              </TabsList>

              {/* Mobile Tabs as Select */}
              <div className="md:hidden mb-4">
                <Select value={activeTab} onValueChange={setActiveTab}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Sale Date
                      </TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCommissions.length > 0 ? (
                      filteredCommissions.map((commission: Commission, idx) => (
                        <TableRow key={commission._id || idx}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={
                                    commission.clientId.addedBy?.avatar || ""
                                  }
                                />
                                <AvatarFallback>
                                  {commission.clientId.addedBy?.name
                                    ? commission.clientId.addedBy.name[0]
                                    : "N/A"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">
                                {commission.clientId.addedBy?.name || "N/A"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>
                                {commission.clientId.property?.projectName ||
                                  "N/A"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Floor Number:{" "}
                                {commission.clientId.floorUnit?.floorNumber ||
                                  "N/A"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Unit:{" "}
                                {commission.clientId.unit?.plotNo || "N/A"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {commission.commissionAmount}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {commission.commissionPercent} of ₹
                                {(
                                  commission.clientId.unit?.totalAmount || 0
                                ).toLocaleString("en-IN")}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {commission.saleDate
                              ? format(
                                  new Date(commission.saleDate),
                                  "MMM d, yyyy"
                                )
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                commission.status === "paid"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {commission.status === "paid"
                                ? "Paid"
                                : "Pending"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-muted-foreground py-8"
                        >
                          No commissions found for this category.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {filteredCommissions.length > 0 ? (
                  filteredCommissions.map((commission: Commission, idx) => (
                    <div
                      key={commission._id || idx}
                      className="border rounded-lg p-4 bg-white shadow-sm space-y-2"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={commission.clientId.addedBy?.avatar || ""}
                          />
                          <AvatarFallback>
                            {commission.clientId.addedBy?.name
                              ? commission.clientId.addedBy.name[0]
                              : "N/A"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {commission.clientId.addedBy?.name || "N/A"}
                        </span>
                      </div>

                      <div>
                        <span className="font-medium">Property:</span>{" "}
                        {commission.clientId.property?.projectName || "N/A"}
                        <p className="text-xs text-muted-foreground">
                          Unit: {commission.clientId.unit?.plotNo || "N/A"}
                        </p>
                      </div>

                      <div>
                        <span className="font-medium">Commission:</span>{" "}
                        {commission.commissionAmount} (
                        {commission.commissionPercent} of ₹
                        {(
                          commission.clientId.unit?.totalAmount || 0
                        ).toLocaleString("en-IN")}
                        )
                      </div>

                      <div>
                        <span className="font-medium">Sale Date:</span>{" "}
                        {commission.saleDate
                          ? format(new Date(commission.saleDate), "MMM d, yyyy")
                          : "N/A"}
                      </div>

                      <div>
                        <span className="font-medium">Status:</span>{" "}
                        <Badge
                          className={
                            commission.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {commission.status === "paid" ? "Paid" : "Pending"}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No commissions found for this category.
                  </div>
                )}
              </div>
            </Tabs>
          </CardContent>

          <CardFooter>
            <div className="text-sm text-muted-foreground">
              Showing {filteredCommissions.length} of {actualCommissions.length}{" "}
              transactions
            </div>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminMyCommissions;
