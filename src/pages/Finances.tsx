import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  BarChart as BarChartIcon,
  PieChart as LucidePieChart,
  Calendar,
  Receipt,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const Finances = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [timeframe, setTimeframe] = useState("ytd");
  const [activeTab, setActiveTab] = useState("revenue");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [expenses, setExpenses] = useState([]);
  const [monthlyRevenues, setMonthlyRevenues] = useState(Array(12).fill(0));
  const [quarterlyTargets, setQuarterlyTargets] = useState([0, 0, 0, 0]);
  const [revenueData, setRevenueData] = useState([]);
  const [cashFlowData, setCashFlowData] = useState([]);
  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [quarterlyRevenueData, setQuarterlyRevenueData] = useState([]);
  const [kpiData, setKpiData] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    cashFlow: 0,
  });

  // Fetch CSRF token
  const getCsrfToken = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_URL}/api/csrf-token`,
        {
          withCredentials: true,
        }
      );
      return response.data.csrfToken;
    } catch (error) {
      console.error("Failed to fetch CSRF token:", error);
      toast.error("Failed to fetch CSRF token");
      return null;
    }
  };

  // Fetch expenses from backend
  const fetchExpenses = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_URL}/api/expenses`,
        {
          withCredentials: true,
        }
      );
      setExpenses(data);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
      toast.error("Failed to fetch expenses");
    }
  };

  // Fetch monthly revenues from invoices
  const fetchMonthlyRevenues = async () => {
    const year = selectedYear || new Date().getFullYear();
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_URL}/api/invoices/revenues?year=${year}`,
        {
          withCredentials: true,
        }
      );
      setMonthlyRevenues(data);
    } catch (error) {
      console.error(`Failed to fetch revenues for ${year}:`, error);
      toast.error(`Failed to fetch revenue data for ${year}`);
      setMonthlyRevenues(Array(12).fill(0));
    }
  };

  // Fetch quarterly targets
  const fetchQuarterlyTargets = async () => {
    const year = selectedYear || new Date().getFullYear();
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_URL}/api/budget/targets?year=${year}`,
        {
          withCredentials: true,
        }
      );
      setQuarterlyTargets(data);
    } catch (error) {
      console.error(`Failed to fetch targets for ${year}:`, error);
      toast.error(`Failed to fetch budget targets for ${year}`);
      setQuarterlyTargets([0, 0, 0, 0]);
    }
  };

  // Fetch all data on mount if user is authenticated and has owner role
  useEffect(() => {
    if (isAuthenticated && user?.role === "owner" && !isLoading) {
      fetchExpenses();
      fetchMonthlyRevenues();
      fetchQuarterlyTargets();
    }
  }, [isAuthenticated, user, isLoading, selectedYear]);

  // Process data when expenses, revenues, or timeframe change
  useEffect(() => {
    if (expenses.length === 0) return;

    const currentDate = new Date();
    const currentYear = selectedYear || currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentQuarter = Math.floor(currentMonth / 3);

    const monthlyExpenses = Array(12).fill(0);
    const categorySums = {};
    let totalExpenses = 0;

    expenses.forEach((exp) => {
      if (exp.status === "Approved") {
        const expDate = new Date(exp.date);
        if (expDate.getFullYear() === currentYear) {
          const monthIndex = expDate.getMonth();
          monthlyExpenses[monthIndex] += exp.amount;
          categorySums[exp.category] =
            (categorySums[exp.category] || 0) + exp.amount;
          totalExpenses += exp.amount;
        }
      }
    });

    // Compute expenses by category percentages for pie chart
    const computedExpensesByCategory = Object.keys(categorySums).map((cat) => ({
      name: cat,
      value: categorySums[cat],
    }));

    // Compute revenueData
    const computedRevenueData = months.map((month, i) => ({
      month,
      revenue: monthlyRevenues[i] || 0,
      expenses: monthlyExpenses[i] || 0,
    }));

    // Compute cashFlowData
    const computedCashFlowData = months.map((month, i) => ({
      month,
      cashFlow: (monthlyRevenues[i] || 0) - (monthlyExpenses[i] || 0),
    }));

    // Compute quarterlyRevenueData
    const quarterlyRevenues = [];
    for (let q = 0; q < 4; q++) {
      const start = q * 3;
      const end = start + 3;
      quarterlyRevenues.push(
        monthlyRevenues.slice(start, end).reduce((a, b) => a + b, 0)
      );
    }
    const computedQuarterlyData = [
      {
        quarter: "Q1",
        revenue: quarterlyRevenues[0],
        target: quarterlyTargets[0] || 0,
      },
      {
        quarter: "Q2",
        revenue: quarterlyRevenues[1],
        target: quarterlyTargets[1] || 0,
      },
      {
        quarter: "Q3",
        revenue: quarterlyRevenues[2],
        target: quarterlyTargets[2] || 0,
      },
      {
        quarter: "Q4",
        revenue: quarterlyRevenues[3],
        target: quarterlyTargets[3] || 0,
      },
    ];

    setExpensesByCategory(computedExpensesByCategory);
    setRevenueData(computedRevenueData);
    setCashFlowData(computedCashFlowData);
    setQuarterlyRevenueData(computedQuarterlyData);

    // Compute KPI data based on timeframe
    let startMonth = 0;
    let endMonth = 11;
    if (timeframe === "ytd") {
      endMonth = currentMonth;
    } else if (timeframe === "qtd") {
      startMonth = currentQuarter * 3;
      endMonth = currentMonth;
    } else if (timeframe === "mtd") {
      startMonth = currentMonth;
      endMonth = currentMonth;
    }

    const periodRevenue = monthlyRevenues
      .slice(startMonth, endMonth + 1)
      .reduce((a, b) => a + b, 0);
    const periodExpenses = monthlyExpenses
      .slice(startMonth, endMonth + 1)
      .reduce((a, b) => a + b, 0);
    const periodProfit = periodRevenue - periodExpenses;
    const periodCashFlow = periodProfit;

    setKpiData({
      totalRevenue: periodRevenue,
      totalExpenses: periodExpenses,
      netProfit: periodProfit,
      cashFlow: periodCashFlow,
    });
  }, [expenses, monthlyRevenues, quarterlyTargets, timeframe, selectedYear]);

  // Update expense status
  const updateExpenseStatus = async (id, status) => {
    try {
      const csrfToken = await getCsrfToken();
      if (!csrfToken) return;

      await axios.put(
        `${import.meta.env.VITE_URL}/api/expenses/${id}/owner-approval`,
        { status },
        {
          headers: {
            "Content-Type": "application/json",
            "CSRF-Token": csrfToken,
          },
          withCredentials: true,
        }
      );
      fetchExpenses();
      toast.success(`Expense ${status.toLowerCase()} successfully`);
    } catch (error) {
      console.error("Error updating expense:", error);
      toast.error("Failed to update expense status");
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

  // Render loading or unauthorized state
  if (isLoading) {
    return <Loader />;
  }

  if (!isAuthenticated || user?.role !== "owner") {
    return (
      <MainLayout>
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
          <p className="text-muted-foreground">
            Only owners can access this page.
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-md font-vidaloka">
              Financial Overview
            </h1>
            <p className="text-muted-foreground">
              Comprehensive financial performance and analysis
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(Number(value))}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {[2023, 2024, 2025, 2026, 2027].map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge
              variant={timeframe === "mtd" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setTimeframe("mtd")}
            >
              Month to Date
            </Badge>
            <Badge
              variant={timeframe === "qtd" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setTimeframe("qtd")}
            >
              Quarter to Date
            </Badge>
            <Badge
              variant={timeframe === "ytd" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setTimeframe("ytd")}
            >
              Year to Date
            </Badge>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">
                    {formatCurrency(kpiData.totalRevenue)}
                  </span>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">
                    {formatCurrency(kpiData.totalExpenses)}
                  </span>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Receipt className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Net Profit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">
                    {formatCurrency(kpiData.netProfit)}
                  </span>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Cash Flow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">
                    {formatCurrency(kpiData.cashFlow)}
                  </span>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <BarChartIcon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 hidden md:inline-block">
            <TabsTrigger value="revenue">Revenue & Expenses</TabsTrigger>
            <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
            <TabsTrigger value="profitability">Profitability</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
          </TabsList>

          <div className="md:hidden mb-4">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Revenue & Expenses</SelectItem>
                <SelectItem value="cashflow">Cash Flow</SelectItem>
                <SelectItem value="profitability">Profitability</SelectItem>
                <SelectItem value="budgets">Budgets</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="revenue">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="mr-2 h-5 w-5 text-estate-navy" />
                    Revenue vs Expenses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={revenueData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis
                          tickFormatter={(value) =>
                            `₹${(value / 1000000).toFixed(1)}M`
                          }
                        />
                        <Tooltip
                          formatter={(value) => [
                            `₹${(Number(value) / 1000000).toFixed(2)}M`,
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#4338ca"
                          fill="#4338ca"
                          fillOpacity={0.2}
                          name="Revenue"
                        />
                        <Area
                          type="monotone"
                          dataKey="expenses"
                          stroke="#ef4444"
                          fill="#ef4444"
                          fillOpacity={0.2}
                          name="Expenses"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LucidePieChart className="mr-2 h-5 w-5 text-estate-teal" />
                    Expenses by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          dataKey="value"
                          data={expensesByCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {expensesByCategory.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={`COLORS[index % COLORS.length]`}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-estate-gold" />
                    Quarterly Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={quarterlyRevenueData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="quarter" />
                        <YAxis
                          tickFormatter={(value) =>
                            `₹${(value / 1000000).toFixed(1)}M`
                          }
                        />
                        <Tooltip
                          formatter={(value) => [
                            `₹${(Number(value) / 1000000).toFixed(2)}M`,
                          ]}
                        />
                        <Bar dataKey="revenue" fill="#4338ca" name="Revenue" />
                        <Bar dataKey="target" fill="#9ca3af" name="Target" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cashflow">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChartIcon className="mr-2 h-5 w-5 text-estate-navy" />
                  Cash Flow Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={cashFlowData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis
                        tickFormatter={(value) =>
                          `₹${(value / 1000000).toFixed(1)}M`
                        }
                      />
                      <Tooltip
                        formatter={(value) => [
                          `₹${(Number(value) / 1000000).toFixed(2)}M`,
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="cashFlow"
                        stroke="#4338ca"
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                        name="Cash Flow"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profitability">
            <Card>
              <CardHeader>
                <CardTitle>Profitability Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Detailed profitability analysis tools will be available here,
                  including profit margins, ROI, and performance metrics by
                  project.
                </p>
                <div className="h-80 bg-muted/30 rounded-md flex items-center justify-center">
                  <TrendingUp className="w-16 h-16 text-muted/50" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budgets">
            <Card>
              <CardHeader>
                <CardTitle>Budget Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Expense tracking and approval.
                </p>
                {/* Desktop Table Layout */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Accountant</TableHead>
                        <TableHead>Expense Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Proof</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.map((exp) => (
                        <TableRow key={exp._id}>
                          <TableCell>
                            {new Date(exp.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{exp.accountant?.name || "N/A"}</TableCell>
                          <TableCell>{exp.expenseName}</TableCell>
                          <TableCell>{exp.category}</TableCell>
                          <TableCell>{formatCurrency(exp.amount)}</TableCell>
                          <TableCell>{exp.description || "N/A"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                exp.status === "Approved"
                                  ? "success"
                                  : exp.status === "Rejected"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {exp.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {exp.proof ? (
                              <a
                                href={exp.proof}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500"
                              >
                                View Proof
                              </a>
                            ) : (
                              "N/A"
                            )}
                          </TableCell>
                          <TableCell>
                            {exp.status === "Pending" && (
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    updateExpenseStatus(exp._id, "Approved")
                                  }
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    updateExpenseStatus(exp._id, "Rejected")
                                  }
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {/* Mobile Card Layout */}
                <div className="block md:hidden space-y-4">
                  {expenses.map((exp) => (
                    <Card key={exp._id} className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-muted-foreground">
                            Date
                          </span>
                          <span className="text-sm">
                            {new Date(exp.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-muted-foreground">
                            Accountant
                          </span>
                          <span className="text-sm">
                            {exp.accountant?.name || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-muted-foreground">
                            Expense Name
                          </span>
                          <span className="text-sm">{exp.expenseName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-muted-foreground">
                            Category
                          </span>
                          <span className="text-sm">{exp.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-muted-foreground">
                            Amount
                          </span>
                          <span className="text-sm">
                            {formatCurrency(exp.amount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-muted-foreground">
                            Description
                          </span>
                          <span className="text-sm">
                            {exp.description || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-muted-foreground">
                            Status
                          </span>
                          <Badge
                            variant={
                              exp.status === "Approved"
                                ? "success"
                                : exp.status === "Rejected"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {exp.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-muted-foreground">
                            Proof
                          </span>
                          <span className="text-sm">
                            {exp.proof ? (
                              <a
                                href={exp.proof}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500"
                              >
                                View Proof
                              </a>
                            ) : (
                              "N/A"
                            )}
                          </span>
                        </div>
                        {exp.status === "Pending" && (
                          <div className="flex justify-end space-x-2 pt-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                updateExpenseStatus(exp._id, "Approved")
                              }
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                updateExpenseStatus(exp._id, "Rejected")
                              }
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Finances;
