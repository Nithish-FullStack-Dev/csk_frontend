import { useState, useEffect } from "react";
import axios from "axios";
import { getCsrfToken, useAuth } from "@/contexts/AuthContext";
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
import {
  fetchInvoices,
  fetchPayments,
  fetchRecentInvoices,
} from "@/utils/accountant/AccountantConfig";

const AccountantDashboard = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [pendingInvoices, setPendingInvoices] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [overduePayments, setOverduePayments] = useState(0);
  const [budgetVariance, setBudgetVariance] = useState(0);
  const [monthlyData, setMonthlyData] = useState<
    { month: string; revenue: number }[]
  >([]);

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

  // Fetch data on mount
  useEffect(() => {
    if (isAuthenticated && user?.role === "accountant" && !isLoading) {
      fetchStats();
      fetchRecentInvoices();
    }
  }, [isAuthenticated, user, isLoading]);

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
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Pending Invoices"
                value={pendingInvoices.toString()}
                icon={<FileText className="h-6 w-6 text-estate-navy" />}
                trend={{ value: 5.2, isPositive: false }}
              />
              <StatCard
                title="Monthly Revenue"
                value={formatCurrency(monthlyRevenue.toFixed(1))}
                icon={<CreditCard className="h-6 w-6 text-estate-teal" />}
                trend={{ value: 8.4, isPositive: true }}
              />
              <StatCard
                title="Overdue Payments"
                value={formatCurrency(overduePayments.toFixed(1))}
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
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
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
              {/* <ActivityFeed activities={recentActivities} /> */}
            </div>

            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                              Invoice #{inv.invoiceNumber || inv._id.slice(-4)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Property:{" "}
                              {inv.project?.projectId?.basicInfo?.projectName ||
                                "N/A"}
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
            </div> */}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AccountantDashboard;
