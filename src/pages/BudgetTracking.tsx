import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AddBudgetForm from "./AddBudgetForm";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle, BarChart3, PieChart, FileText } from "lucide-react";
import BudgetOverviewCards from "@/components/budget/BudgetOverviewCards";
import BudgetVarianceChart from "@/components/budget/BudgetVarianceChart";
import ExpenseForm from "@/components/budget/ExpenseForm";
import MainLayout from "@/components/layout/MainLayout";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { Tooltip } from "@radix-ui/react-tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Sample data
const budgetCategories = [
  {
    id: "1",
    name: "Marketing",
    budgeted: 50000,
    spent: 32000,
    variance: -18000,
  },
  {
    id: "2",
    name: "Construction",
    budgeted: 500000,
    spent: 545000,
    variance: 45000,
  },
  {
    id: "3",
    name: "Operations",
    budgeted: 100000,
    spent: 89000,
    variance: -11000,
  },
  { id: "4", name: "Sales", budgeted: 75000, spent: 68000, variance: -7000 },
  {
    id: "5",
    name: "Administration",
    budgeted: 25000,
    spent: 28000,
    variance: 3000,
  },
];

const cashFlowData = [
  { month: "Jan", inflow: 850000, outflow: 720000, net: 130000 },
  { month: "Feb", inflow: 920000, outflow: 780000, net: 140000 },
  { month: "Mar", inflow: 1100000, outflow: 890000, net: 210000 },
  { month: "Apr", inflow: 980000, outflow: 850000, net: 130000 },
  { month: "May", inflow: 1200000, outflow: 950000, net: 250000 },
];

const expenseTransactions = [
  {
    id: "1",
    date: "2024-06-01",
    category: "Construction",
    amount: 125000,
    vendor: "ABC Construction",
    status: "Approved",
  },
  {
    id: "2",
    date: "2024-06-02",
    category: "Marketing",
    amount: 15000,
    vendor: "Digital Solutions",
    status: "Pending",
  },
  {
    id: "3",
    date: "2024-06-03",
    category: "Operations",
    amount: 8500,
    vendor: "Office Supplies Co",
    status: "Approved",
  },
  {
    id: "4",
    date: "2024-06-04",
    category: "Administration",
    amount: 5200,
    vendor: "Legal Services",
    status: "Rejected",
  },
];

type CashFlowItem = {
  month: string;
  inflow: number;
  outflow: number;
  net: number;
};

const BudgetTracking = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [addBudgetopen, setAddBudgetOpen] = useState(false);
  const [budgetCategories, setBudgetCategories] = useState([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [cashFlowData, setCashFlowData] = useState([]);
  const [netCashFlow, setNetCashFlow] = useState(0);
  const [changePercent, setChangePercent] = useState(null);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [expenseTransactions, setExpenseTransactions] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_URL}/api/budget/expenses/all`,
        {
          withCredentials: true,
        }
      );

      return res.data; // array of expenses
    } catch (err) {
      console.error(
        "Error fetching expenses:",
        err.response?.data || err.message
      );
      return [];
    }
  };

  const fetchBudgetData = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_URL}/api/budget`,
        {
          withCredentials: true, // required for cookies/JWT auth
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching budget data:",
        error.response?.data || error.message
      );
      throw error;
    }
  };

  const getBudget = async () => {
    try {
      const budgets = await fetchBudgetData();
      console.log("BUDGETS : ", budgets);
      if (budgets.length > 0) {
        const latest = budgets[budgets.length - 1];

        // Map backend data to your UI format
        const formattedCategories = latest.phases.map((phase, index) => ({
          id: phase._id,
          name: phase.name,
          budgeted: phase.budget,
          spent: phase.actualSpend || 0,
          variance: phase.budget - (phase.actualSpend || 0),
        }));

        const totalSpentVal = formattedCategories.reduce(
          (sum, p) => sum + p.spent,
          0
        );
        const totalBudgetVal = formattedCategories.reduce(
          (sum, p) => sum + p.budgeted,
          0
        );

        setBudgetCategories(formattedCategories);
        setTotalSpent(totalSpentVal);
        setTotalBudget(totalBudgetVal);
        console.log("Budget : ", budgetCategories);
      }
    } catch (error) {
      console.error("Failed to load budget info.");
    }
  };

  const fetchCashFlowData = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_URL}/api/budget/cashflow`,
        {
          withCredentials: true,
        }
      );
      return res.data; // array of { month, inflow, outflow, net }
    } catch (err) {
      console.error(
        "Cash flow fetch failed:",
        err.response?.data || err.message
      );
      return [];
    }
  };

  const getCashFlow = async () => {
    const flow = await fetchCashFlowData();
    setCashFlowData(flow);
  };

  const handleAddExpense = async (expense: any) => {
    try {
      let proofUrl = "";

      // Step 1: Upload file to Cloudinary (if selected)
      if (expense.proof) {
        const formData = new FormData();
        formData.append("file", expense.proof);

        try {
          const uploadRes = await axios.post(
            `${import.meta.env.VITE_URL}/api/uploads/upload`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
              withCredentials: true,
            }
          );
          proofUrl = uploadRes.data.url;
        } catch (err) {
          console.error(
            "Proof upload failed:",
            err.response?.data || err.message
          );
          alert("Failed to upload proof. Please try again.");
          return;
        }
      }
      const response = await axios.post(
        `${import.meta.env.VITE_URL}/api/budget/expense`,
        {
          category: expense.category,
          amount: expense.amount,
          expenseName: expense.vendor,
          date: expense.date,
          description: expense.description,
          proof: proofUrl, // <-- Cloudinary link
        },
        { withCredentials: true }
      );
      await getBudget();
      const cashFlow: CashFlowItem[] = await fetchCashFlowData(); // assuming this returns the data
      setCashFlowData(cashFlow);
      if (cashFlow.length > 0) {
        const latest = cashFlow[cashFlow.length - 1];
        const previous =
          cashFlow.length > 1 ? cashFlow[cashFlow.length - 2] : null;

        setNetCashFlow(latest.net);

        if (previous) {
          const percentChange =
            ((latest.net - previous.net) / previous.net) * 100;
          setChangePercent(percentChange.toFixed(2));
        } else {
          setChangePercent(null);
        }
      }

      fetchExpenses();

      toast("Expense recorded and budget updated.");
    } catch (err) {
      console.error(err);
      toast("Failed to add expense.");
    } finally {
      setAddExpenseOpen(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await getBudget();
      const cashFlow: CashFlowItem[] = await fetchCashFlowData(); // assuming this returns the data
      setCashFlowData(cashFlow);
      if (cashFlow.length > 0) {
        const latest = cashFlow[cashFlow.length - 1];
        const previous =
          cashFlow.length > 1 ? cashFlow[cashFlow.length - 2] : null;

        setNetCashFlow(latest.net);

        if (previous) {
          const percentChange =
            ((latest.net - previous.net) / previous.net) * 100;
          setChangePercent(percentChange.toFixed(2));
        } else {
          setChangePercent(null);
        }
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const loadExpenses = async () => {
      const data = await fetchExpenses();
      setExpenseTransactions(data);
      const pending = data.filter(
        (expense) => expense.status === "Pending"
      ).length;
      setPendingCount(pending);
    };
    loadExpenses();
  }, []);

  return (
    <MainLayout>
      <div className="md:p-6 p-2 space-y-6">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center md:flex-row flex-col md:gap-0 gap-5">
            {/* Left side: Title & Subtitle */}
            <div>
              <h1 className="text-3xl font-bold">
                Budget Tracking & Cash Flow
              </h1>
              <p className="text-muted-foreground">
                Monitor budgets, track expenses, and manage cash flow
              </p>
            </div>

            {/* Right side: Buttons with spacing */}
            <div className="flex space-x-4">
              {/* Add Budget Dialog */}
              <Dialog open={addBudgetopen} onOpenChange={setAddBudgetOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Budget
                  </Button>
                </DialogTrigger>
                <DialogContent className="md:w-[600px] w-[90vw] max-h-[80vh] overflow-scroll rounded-xl">
                  <DialogHeader>
                    <DialogTitle>Add New Budget</DialogTitle>
                  </DialogHeader>
                  <AddBudgetForm onClose={() => setAddBudgetOpen(false)} />
                </DialogContent>
              </Dialog>

              {/* Add Expense Dialog */}
              <Dialog open={addExpenseOpen} onOpenChange={setAddExpenseOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Expense
                  </Button>
                </DialogTrigger>
                <DialogContent className="md:w-[600px] w-[90vw] max-h-[80vh] overflow-scroll rounded-xl">
                  <DialogHeader>
                    <DialogTitle>Add New Expense</DialogTitle>
                  </DialogHeader>
                  <ExpenseForm onSubmit={handleAddExpense} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          {/* Tabs for desktop */}
          <TabsList className="hidden md:grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="budget">Budget Analysis</TabsTrigger>
            <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
            <TabsTrigger value="expenses">Expense Management</TabsTrigger>
          </TabsList>

          {/* Select for mobile */}
          <div className="block md:hidden">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="budget">Budget Analysis</SelectItem>
                <SelectItem value="cashflow">Cash Flow</SelectItem>
                <SelectItem value="expenses">Expense Management</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="overview">
            <BudgetOverviewCards
              totalBudget={totalBudget}
              totalSpent={totalSpent}
              netCashFlow={netCashFlow}
              changePercent={changePercent}
              pendingApprovals={pendingCount}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BudgetVarianceChart categories={budgetCategories} />

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Cash Flow Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart
                      data={cashFlowData}
                      margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="inflow"
                        stackId="a"
                        fill="#34d399"
                        name="Inflow"
                      />
                      <Bar
                        dataKey="outflow"
                        stackId="a"
                        fill="#f87171"
                        name="Outflow"
                      />
                      <Bar dataKey="net" fill="#60a5fa" name="Net" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="budget">
            <Card>
              <CardHeader>
                <CardTitle>Budget vs Actual Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table className="min-w-[700px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Budgeted Amount</TableHead>
                        <TableHead>Actual Spent</TableHead>
                        <TableHead>Variance</TableHead>
                        <TableHead>Utilization</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {budgetCategories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">
                            {category.name}
                          </TableCell>
                          <TableCell>
                            ₹{category.budgeted.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            ₹{category.spent.toLocaleString()}
                          </TableCell>
                          <TableCell
                            className={
                              category.variance < 0
                                ? "text-red-500"
                                : "text-green-500"
                            }
                          >
                            ₹{Math.abs(category.variance).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Progress
                                value={
                                  (category.spent / category.budgeted) * 100
                                }
                                className="w-16 h-2"
                              />
                              <span className="text-sm">
                                {Math.round(
                                  (category.spent / category.budgeted) * 100
                                )}
                                %
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                category.variance < 0
                                  ? "destructive"
                                  : "default"
                              }
                            >
                              {category.variance < 0
                                ? "Over Budget"
                                : "Within Budget"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="block md:hidden space-y-4">
                  {budgetCategories.map((category) => (
                    <div
                      key={category.id}
                      className="rounded-lg border p-4 shadow-sm bg-white"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold">{category.name}</h3>
                        <Badge
                          variant={
                            category.variance < 0 ? "destructive" : "default"
                          }
                        >
                          {category.variance < 0
                            ? "Over Budget"
                            : "Within Budget"}
                        </Badge>
                      </div>

                      <div className="mt-2 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">Budgeted:</span>
                          <span>₹{category.budgeted.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Spent:</span>
                          <span>₹{category.spent.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Variance:</span>
                          <span
                            className={
                              category.variance < 0
                                ? "text-red-500"
                                : "text-green-500"
                            }
                          >
                            ₹{Math.abs(category.variance).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Utilization:</span>
                          <div className="flex items-center space-x-2 mt-1">
                            <Progress
                              value={(category.spent / category.budgeted) * 100}
                              className="w-24 h-2"
                            />
                            <span className="text-sm">
                              {Math.round(
                                (category.spent / category.budgeted) * 100
                              )}
                              %
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cashflow">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cash Flow Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead>Inflow</TableHead>
                        <TableHead>Outflow</TableHead>
                        <TableHead>Net Flow</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cashFlowData.map((data) => (
                        <TableRow key={data.month}>
                          <TableCell>{data.month}</TableCell>
                          <TableCell className="text-green-600">
                            ₹{data.inflow.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-red-600">
                            ₹{data.outflow.toLocaleString()}
                          </TableCell>
                          <TableCell
                            className={
                              data.net > 0 ? "text-green-600" : "text-red-600"
                            }
                          >
                            ₹{data.net.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cash Flow Projection</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={budgetCategories.map((c) => ({
                          name: c.name,
                          value: c.spent,
                        }))}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {budgetCategories.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              [
                                "#0ea5e9",
                                "#6366f1",
                                "#10b981",
                                "#f59e0b",
                                "#ef4444",
                              ][index % 5]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="expenses">
            <Card>
              <CardHeader>
                <CardTitle>Recent Expense Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table className="min-w-[700px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Expense Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenseTransactions.map((transaction) => (
                        <TableRow key={transaction._id}>
                          <TableCell>
                            {new Date(transaction.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{transaction.category}</TableCell>
                          <TableCell>
                            ₹{Number(transaction.amount).toLocaleString()}
                          </TableCell>
                          <TableCell>{transaction.expenseName}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                transaction.status === "Approved"
                                  ? "default"
                                  : transaction.status === "Pending"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {transaction.proof ? (
                              <a
                                href={transaction.proof}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button variant="ghost" size="sm">
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </a>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="block md:hidden space-y-4">
                  {expenseTransactions.map((transaction) => (
                    <div
                      key={transaction._id}
                      className="rounded-lg border p-4 shadow-sm bg-white"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold">
                          {transaction.expenseName}
                        </h3>
                        <Badge
                          variant={
                            transaction.status === "Approved"
                              ? "default"
                              : transaction.status === "Pending"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </div>

                      <div className="mt-2 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">Date:</span>
                          <span>
                            {new Date(transaction.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Category:</span>
                          <span>{transaction.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Amount:</span>
                          <span>
                            ₹{Number(transaction.amount).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-3">
                        {transaction.proof ? (
                          <a
                            href={transaction.proof}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <FileText className="h-4 w-4" />
                              View Proof
                            </Button>
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            No Proof
                          </span>
                        )}
                      </div>
                    </div>
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

export default BudgetTracking;
