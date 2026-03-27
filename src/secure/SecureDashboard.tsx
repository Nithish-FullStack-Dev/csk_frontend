import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const SecureDashboard = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  const fetchData = async () => {
    const c = await axios.get(
      `${import.meta.env.VITE_URL}/api/customer/getAllCustomers`,
      { withCredentials: true },
    );

    const p = await axios.get(
      `${import.meta.env.VITE_URL}/api/purchases/getAllPurchase`,
      { withCredentials: true },
    );

    const e = await axios.get(
      `${import.meta.env.VITE_URL}/api/cash-expenses/getAllCashExp`,
      {
        withCredentials: true,
      },
    );

    const pay = await axios.get(
      `${import.meta.env.VITE_URL}/api/payments/accountant`,
      { withCredentials: true },
    );

    setCustomers(c.data.data || []);
    setPurchases(p.data.data || []);
    setExpenses(e.data.data || []);
    setPayments(pay.data || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalPurchase = purchases.reduce(
    (sum, p) => sum + (p.totalSaleConsideration || 0),
    0,
  );

  const totalExpense = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const totalPayment = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const chartData = [
    {
      name: "Purchase",
      value: totalPurchase,
    },
    {
      name: "Expense",
      value: totalExpense,
    },
    {
      name: "Payment",
      value: totalPayment,
    },
  ];

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Customers</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {customers.length}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Purchases</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              ₹ {totalPurchase.toLocaleString()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Expenses</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              ₹ {totalExpense.toLocaleString()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Payments</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              ₹ {totalPayment.toLocaleString()}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Finance Overview</CardTitle>
          </CardHeader>

          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
            </CardHeader>

            <CardContent className="space-y-2">
              {payments.slice(0, 5).map((p) => (
                <div key={p._id} className="flex justify-between border-b pb-1">
                  <span>{p.paymentNumber}</span>
                  <span>₹ {p.amount}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
            </CardHeader>

            <CardContent className="space-y-2">
              {expenses.slice(0, 5).map((e) => (
                <div key={e._id} className="flex justify-between border-b pb-1">
                  <span>{e.partyName}</span>
                  <span>₹ {e.amount}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default SecureDashboard;
