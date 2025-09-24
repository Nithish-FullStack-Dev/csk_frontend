import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import StatCard from "@/components/dashboard/StatCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import {
  FileText,
  CreditCard,
  BarChart3,
  Calculator,
  Receipt,
  ClipboardList,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";
import Loader from "@/components/Loader";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Sample activities data (since /api/activities is unavailable)
const recentActivities = [
  {
    id: "1",
    user: {
      name: "John Smith",
      avatar:
        "https://ui-avatars.com/api/?name=John+Smith&background=1A365D&color=fff",
    },
    action: "approved",
    target: "Invoice #4832",
    timestamp: "1 hour ago",
    type: "approval" as const,
  },
  {
    id: "2",
    user: {
      name: "Sarah Johnson",
      avatar:
        "https://ui-avatars.com/api/?name=Sarah+Johnson&background=2C7A7B&color=fff",
    },
    action: "processed payment for",
    target: "Golden Heights Phase 2",
    timestamp: "3 hours ago",
    type: "document" as const,
  },
  {
    id: "3",
    user: {
      name: "Robert Wilson",
      avatar:
        "https://ui-avatars.com/api/?name=Robert+Wilson&background=38A169&color=fff",
    },
    action: "generated monthly report for",
    target: "Q2 Financials",
    timestamp: "yesterday",
    type: "document" as const,
  },
];

const AccountantDashboard = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [pendingInvoices, setPendingInvoices] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [overduePayments, setOverduePayments] = useState(0);
  const [budgetVariance, setBudgetVariance] = useState(0);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reports, setReports] = useState([]);
  const [monthlyData, setMonthlyData] = useState<
    { month: string; revenue: number }[]
  >([]);

  // Fetch CSRF token
  const getCsrfToken = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_URL}/api/csrf-token`,
        { withCredentials: true }
      );
      return response.data.csrfToken;
    } catch (error) {
      console.error("Failed to fetch CSRF token:", error);
      toast.error("Failed to fetch CSRF token");
      return null;
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(1)}Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K`;
    }
    return `₹${value}`;
  };

  // Fetch stats for overview
  const fetchStats = async () => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      // Fetch all invoices to calculate stats
      const { data: allInvoices } = await axios.get(
        `${import.meta.env.VITE_URL}/api/invoices`,
        { withCredentials: true }
      );

      // Pending invoices count
      const pending = allInvoices.filter(
        (inv: any) => inv.status === "pending"
      ).length;
      setPendingInvoices(pending);

      // Monthly revenue (client-side aggregation)
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
      const monthlyRev = allInvoices
        .filter(
          (inv: any) =>
            inv.status === "paid" &&
            new Date(inv.paymentDate) >= startOfMonth &&
            new Date(inv.paymentDate) <= endOfMonth
        )
        .reduce((sum: number, inv: any) => sum + (inv.total || 0), 0);
      setMonthlyRevenue(monthlyRev);

      // Overdue payments
      const overdueTotal = allInvoices
        .filter(
          (inv: any) => inv.status !== "paid" && new Date(inv.dueDate) < now
        )
        .reduce((sum: number, inv: any) => sum + (inv.total || 0), 0);
      setOverduePayments(overdueTotal);

      // Budget variance (using cashflow)
      const cashFlowRes = await axios.get(
        `${import.meta.env.VITE_URL}/api/budget/cashflow`,
        { withCredentials: true }
      );
      const variance =
        cashFlowRes.data[0]?.net && cashFlowRes.data[0]?.inflow
          ? (cashFlowRes.data[0].net / cashFlowRes.data[0].inflow) * 100
          : 0;
      setBudgetVariance(variance);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      toast.error("Failed to fetch dashboard stats");
    }
  };

  // Fetch recent invoices
  const fetchRecentInvoices = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_URL}/api/invoices?limit=3&sort=-issueDate`,
        { withCredentials: true }
      );
      setRecentInvoices(data);
    } catch (error) {
      console.error("Failed to fetch recent invoices:", error);
      toast.error("Failed to fetch recent invoices");
    }
  };

  // Fetch all invoices
  const fetchInvoices = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_URL}/api/invoices`,
        { withCredentials: true }
      );
      setInvoices(data);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      toast.error("Failed to fetch invoices");
    }
  };

  // Fetch payments
  const fetchPayments = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_URL}/api/payments/accountant`,
        { withCredentials: true }
      );
      setPayments(data);
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      toast.error("Failed to fetch payments");
    }
  };

  // Fetch reports (placeholder, as endpoint is not defined)
  const fetchReports = async () => {
    setReports([]); // No /api/reports endpoint, so set empty
  };

  // Update invoice status (verify or mark paid)
  const updateInvoiceStatus = async (
    id: string,
    status: string,
    notes: string = ""
  ) => {
    try {
      const csrfToken = await getCsrfToken();
      if (!csrfToken) return;

      if (status === "approved" || status === "rejected") {
        await axios.put(
          `${import.meta.env.VITE_URL}/api/invoices/${id}/accountant-verify`,
          { status, notes },
          {
            headers: {
              "Content-Type": "application/json",
              "CSRF-Token": csrfToken,
            },
            withCredentials: true,
          }
        );
      } else if (status === "paid") {
        await axios.put(
          `${import.meta.env.VITE_URL}/api/invoices/${id}/mark-paid`,
          { paymentMethod: "Manual", reconcile: false },
          {
            headers: {
              "Content-Type": "application/json",
              "CSRF-Token": csrfToken,
            },
            withCredentials: true,
          }
        );
      }
      fetchInvoices();
      fetchStats();
      fetchRecentInvoices();
      toast.success(`Invoice ${status} successfully`);
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast.error("Failed to update invoice status");
    }
  };

  // Generate new report (placeholder, as endpoint is not defined)
  const generateReport = async () => {
    toast.error("Report generation is not available");
  };

  // Fetch data on mount
  useEffect(() => {
    if (isAuthenticated && user?.role === "accountant" && !isLoading) {
      fetchStats();
      fetchRecentInvoices();
    }
  }, [isAuthenticated, user, isLoading]);

  // Fetch tab-specific data
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "accountant" || isLoading) return;

    switch (activeTab) {
      case "invoices":
        fetchInvoices();
        break;
      case "payments":
        fetchPayments();
        break;
      case "reports":
        fetchReports();
        break;
      default:
        break;
    }
  }, [activeTab, isAuthenticated, user, isLoading]);

  // Fetch and aggregate monthly revenue data
  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        const year = new Date().getFullYear();
        const { data: invoices } = await axios.get(
          `${import.meta.env.VITE_URL}/api/invoices`,
          { withCredentials: true }
        );

        // Aggregate revenue by month for the current year
        const monthlyRevenues = Array(12)
          .fill(0)
          .map((_, i) => ({
            month: new Date(year, i, 1).toLocaleString("default", {
              month: "short",
            }),
            revenue: 0,
          }));

        invoices.forEach((inv: any) => {
          if (
            inv.status === "paid" &&
            new Date(inv.paymentDate).getFullYear() === year
          ) {
            const monthIndex = new Date(inv.paymentDate).getMonth();
            monthlyRevenues[monthIndex].revenue += inv.total || 0;
          }
        });

        setMonthlyData(monthlyRevenues);
      } catch (error) {
        console.error("Failed to fetch chart data:", error);
        toast.error("Failed to load financial chart data");
      }
    };

    if (isAuthenticated && user?.role === "accountant" && !isLoading) {
      fetchMonthlyData();
    }
  }, [isAuthenticated, user, isLoading]);

  if (isLoading) {
    return <Loader />;
  }

  if (!isAuthenticated || user?.role !== "accountant") {
    return (
      <MainLayout>
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
          <p className="text-muted-foreground">
            Only accountants can access this dashboard.
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between ">
          <div>
            <h1 className="text-3xl font-bold">Finance Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome to CSK - Real Manager financial overview
            </p>
          </div>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full md:w-auto mt-4 md:mt-0"
          >
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              {/* <TabsTrigger value="reports">Reports</TabsTrigger> */}
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Pending Invoices"
                  value={pendingInvoices.toString()}
                  icon={<FileText className="h-6 w-6 text-estate-navy" />}
                  trend={{ value: 5.2, isPositive: false }}
                />
                <StatCard
                  title="Monthly Revenue"
                  value={formatCurrency(monthlyRevenue)}
                  icon={<CreditCard className="h-6 w-6 text-estate-teal" />}
                  trend={{ value: 8.4, isPositive: true }}
                />
                <StatCard
                  title="Overdue Payments"
                  value={formatCurrency(overduePayments)}
                  icon={<Receipt className="h-6 w-6 text-estate-error" />}
                  trend={{ value: 2.1, isPositive: false }}
                />
                <StatCard
                  title="Budget Variance"
                  value={
                    budgetVariance >= 0
                      ? `+${budgetVariance.toFixed(1)}%`
                      : `${budgetVariance.toFixed(1)}%`
                  }
                  icon={<Calculator className="h-6 w-6 text-estate-gold" />}
                  trend={{ value: 1.8, isPositive: budgetVariance >= 0 }}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Financial Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="90%" height={260}>
                        <BarChart
                          data={monthlyData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e5e7eb"
                          />
                          <XAxis dataKey="month" stroke="#6b7280" />
                          <YAxis stroke="#6b7280" />
                          <Tooltip
                            formatter={(value: number) => [
                              `₹${value.toLocaleString()}`,
                              "Revenue",
                            ]}
                            contentStyle={{
                              backgroundColor: "#fff",
                              border: "1px solid #e5e7eb",
                            }}
                          />
                          <Bar
                            dataKey="revenue"
                            fill="#1A365D"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
                <ActivityFeed activities={recentActivities} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Invoices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-60 flex flex-col gap-2 overflow-y-auto">
                      {recentInvoices.map((inv: any) => (
                        <div
                          key={inv._id}
                          className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <Receipt className="h-5 w-5 text-estate-navy" />
                            <div>
                              <p className="text-sm font-medium">
                                Invoice #
                                {inv.invoiceNumber || inv._id.slice(-4)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Property:{" "}
                                {inv.project?.projectId?.basicInfo
                                  ?.projectName || "N/A"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {formatCurrency(inv.total || 0)}
                            </p>
                            <p
                              className={`text-xs ${
                                inv.status === "Pending"
                                  ? "text-estate-teal"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {inv.status || "Pending"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Budget Tracking</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-60 flex items-center justify-center bg-muted/50 rounded-md">
                      <ClipboardList className="h-12 w-12 text-estate-navy/20" />
                      <p className="text-muted-foreground ml-2">
                        Budget tracking details
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Invoices Tab */}
            <TabsContent value="invoices">
              <Card>
                <CardHeader>
                  <CardTitle>Invoices Management</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Desktop Table */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice #</TableHead>
                          <TableHead>Property</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoices.map((inv: any) => (
                          <TableRow key={inv._id}>
                            <TableCell>
                              {inv.invoiceNumber || inv._id.slice(-4)}
                            </TableCell>
                            <TableCell>
                              {inv.project?.projectId?.basicInfo?.projectName ||
                                "N/A"}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(inv.total || 0)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  inv.status === "paid"
                                    ? "success"
                                    : inv.status === "rejected"
                                    ? "destructive"
                                    : inv.status === "approved"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {inv.status || "pending"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(inv.dueDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                {inv.status === "pending" &&
                                  !inv.isApprovedByAccountant && (
                                    <>
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          updateInvoiceStatus(
                                            inv._id,
                                            "approved",
                                            "Approved by accountant"
                                          )
                                        }
                                      >
                                        Approve
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() =>
                                          updateInvoiceStatus(
                                            inv._id,
                                            "rejected",
                                            "Rejected by accountant"
                                          )
                                        }
                                      >
                                        Reject
                                      </Button>
                                    </>
                                  )}
                                {inv.status === "approved" && (
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      updateInvoiceStatus(inv._id, "paid")
                                    }
                                  >
                                    Mark Paid
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {/* Mobile Cards */}
                  <div className="block md:hidden space-y-4">
                    {invoices.map((inv: any) => (
                      <Card key={inv._id} className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                              Invoice #
                            </span>
                            <span className="text-sm">
                              {inv.invoiceNumber || inv._id.slice(-4)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                              Property
                            </span>
                            <span className="text-sm">
                              {inv.project?.projectId?.basicInfo?.projectName ||
                                "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                              Amount
                            </span>
                            <span className="text-sm">
                              {formatCurrency(inv.total || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                              Status
                            </span>
                            <Badge
                              variant={
                                inv.status === "paid"
                                  ? "success"
                                  : inv.status === "rejected"
                                  ? "destructive"
                                  : inv.status === "approved"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {inv.status || "pending"}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                              Due Date
                            </span>
                            <span className="text-sm">
                              {new Date(inv.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-end space-x-2 pt-2">
                            {inv.status === "pending" &&
                              !inv.isApprovedByAccountant && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      updateInvoiceStatus(
                                        inv._id,
                                        "approved",
                                        "Approved by accountant"
                                      )
                                    }
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      updateInvoiceStatus(
                                        inv._id,
                                        "rejected",
                                        "Rejected by accountant"
                                      )
                                    }
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                            {inv.status === "approved" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateInvoiceStatus(inv._id, "paid")
                                }
                              >
                                Mark Paid
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <CardTitle>Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Desktop Table */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Payment ID</TableHead>
                          <TableHead>Invoice #</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Accountant</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((pay: any) => (
                          <TableRow key={pay._id}>
                            <TableCell>
                              {pay.paymentNumber || pay._id.slice(-4)}
                            </TableCell>
                            <TableCell>
                              {pay.invoice?.invoiceNumber || "N/A"}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(pay.invoice?.total || 0)}
                            </TableCell>
                            <TableCell>
                              {new Date(pay.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {pay.accountant?.name || "N/A"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {/* Mobile Cards */}
                  <div className="block md:hidden space-y-4">
                    {payments.map((pay: any) => (
                      <Card key={pay._id} className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                              Payment ID
                            </span>
                            <span className="text-sm">
                              {pay.paymentNumber || pay._id.slice(-4)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                              Invoice #
                            </span>
                            <span className="text-sm">
                              {pay.invoice?.invoiceNumber || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                              Amount
                            </span>
                            <span className="text-sm">
                              {formatCurrency(pay.invoice?.total || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                              Date
                            </span>
                            <span className="text-sm">
                              {new Date(pay.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                              Accountant
                            </span>
                            <span className="text-sm">
                              {pay.accountant?.name || "N/A"}
                            </span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports Tab */}
            {/* <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">No reports available.</p>
              <Button disabled onClick={generateReport}>
                Generate New Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent> */}
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default AccountantDashboard;
