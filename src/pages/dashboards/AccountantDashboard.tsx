import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import Loader from "@/components/Loader";
import StatCard from "@/components/dashboard/StatCard";
import { toast } from "sonner";

import {
  FileText,
  CreditCard,
  Receipt,
  Wallet,
  TrendingUp,
} from "lucide-react";

import {
  BarChart,
  Bar,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const API = import.meta.env.VITE_URL;

const AccountantDashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  const [pendingInvoices, setPendingInvoices] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalCash, setTotalCash] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);

  const [chartData, setChartData] = useState([]);

  const formatCurrency = (value: number) => {
    if (!value) return "₹0";

    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;

    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;

    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;

    return `₹${value}`;
  };

  // =============================
  // FETCH DASHBOARD DATA
  // =============================

  const fetchDashboard = async () => {
    try {
      const year = new Date().getFullYear();

      const [invoiceRes, paymentRes, cashRes, expenseRes] = await Promise.all([
        axios.get(`${API}/api/invoices`, { withCredentials: true }),
        axios.get(`${API}/api/payments/accountant`, {
          withCredentials: true,
        }),
        axios.get(`${API}/api/cash-expenses/getAllCashExp`, {
          withCredentials: true,
        }),
        axios.get(`${API}/api/expenses`, {
          withCredentials: true,
        }),
      ]);

      const invoices = invoiceRes.data || [];
      const payments = paymentRes.data || [];
      const cash = cashRes.data?.data || [];
      const expenses = expenseRes.data || [];

      // ====================
      // STATS
      // ====================

      const pending = invoices.filter(
        (i: any) => i.status === "pending",
      ).length;

      const revenue = invoices
        .filter((i: any) => i.status === "paid")
        .reduce((sum: number, i: any) => sum + i.total, 0);

      const remaining = invoices.reduce(
        (sum: number, i: any) => sum + (i.remainingAmount || 0),
        0,
      );

      const expenseTotal = expenses.reduce(
        (sum: number, e: any) => sum + e.amount,
        0,
      );

      const cashTotal = cash.reduce((sum: number, c: any) => sum + c.amount, 0);

      setPendingInvoices(pending);
      setTotalRevenue(revenue);
      setRemainingAmount(remaining);
      setTotalExpenses(expenseTotal);
      setTotalCash(cashTotal);

      // ====================
      // CHART DATA
      // ====================

      const months = Array(12)
        .fill(0)
        .map((_, i) => ({
          month: new Date(year, i, 1).toLocaleString("default", {
            month: "short",
          }),
          revenue: 0,
          expense: 0,
          payment: 0,
        }));

      invoices.forEach((inv: any) => {
        if (
          inv.paymentDate &&
          new Date(inv.paymentDate).getFullYear() === year
        ) {
          const m = new Date(inv.paymentDate).getMonth();

          if (inv.status === "paid") months[m].revenue += inv.total;
        }
      });

      expenses.forEach((e: any) => {
        if (new Date(e.date).getFullYear() === year) {
          const m = new Date(e.date).getMonth();
          months[m].expense += e.amount;
        }
      });

      payments.forEach((p: any) => {
        if (new Date(p.paymentDate).getFullYear() === year) {
          const m = new Date(p.paymentDate).getMonth();
          months[m].payment += p.amount;
        }
      });

      setChartData(months);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard");
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === "accountant" && !isLoading) {
      fetchDashboard();
    }
  }, [isAuthenticated, user, isLoading]);

  if (isLoading) return <Loader />;

  if (!isAuthenticated || user?.role !== "accountant") {
    return (
      <MainLayout>
        <div className="text-center py-10">Access denied</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* ================= STATS ================= */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="Pending Invoices"
            value={pendingInvoices}
            icon={<FileText />}
          />

          <StatCard
            title="Revenue"
            value={formatCurrency(totalRevenue)}
            icon={<TrendingUp />}
          />

          <StatCard
            title="Remaining"
            value={formatCurrency(remainingAmount)}
            icon={<Receipt />}
          />

          <StatCard
            title="Expenses"
            value={formatCurrency(totalExpenses)}
            icon={<Wallet />}
          />

          <StatCard
            title="Cash Flow"
            value={formatCurrency(totalCash)}
            icon={<CreditCard />}
          />
        </div>

        {/* ================= CHART ================= */}

        <Card>
          <CardHeader>
            <CardTitle>Financial Performance</CardTitle>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

                <XAxis dataKey="month" stroke="#6b7280" />

                <YAxis stroke="#6b7280" />

                <Tooltip
                  formatter={(value) => [
                    `₹${value.toLocaleString()}`,
                    "Amount",
                  ]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                  }}
                />

                <Legend />

                {/* Revenue */}
                <Bar
                  dataKey="revenue"
                  fill="#1A365D"
                  radius={[4, 4, 0, 0]}
                  name="Revenue"
                />

                {/* Expense */}
                <Bar
                  dataKey="expense"
                  fill="#0F766E"
                  radius={[4, 4, 0, 0]}
                  name="Expense"
                />

                {/* Payments */}
                <Bar
                  dataKey="payment"
                  fill="#F59E0B"
                  radius={[4, 4, 0, 0]}
                  name="Payments"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AccountantDashboard;
