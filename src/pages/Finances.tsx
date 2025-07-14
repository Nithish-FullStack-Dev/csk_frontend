
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
  DollarSign, TrendingUp, TrendingDown, 
  BarChart as BarChartIcon, PieChart, Calendar,
  ArrowUpRight, ArrowDownRight, Receipt, FileText
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

// Sample data for charts
const revenueData = [
  { month: "Jan", revenue: 1850000, expenses: 950000 },
  { month: "Feb", revenue: 1720000, expenses: 880000 },
  { month: "Mar", revenue: 1950000, expenses: 920000 },
  { month: "Apr", revenue: 2100000, expenses: 980000 },
  { month: "May", revenue: 2300000, expenses: 1050000 },
  { month: "Jun", revenue: 2150000, expenses: 1010000 },
  { month: "Jul", revenue: 2400000, expenses: 1100000 },
  { month: "Aug", revenue: 2650000, expenses: 1180000 },
  { month: "Sep", revenue: 2800000, expenses: 1220000 },
  { month: "Oct", revenue: 3050000, expenses: 1320000 },
  { month: "Nov", revenue: 3200000, expenses: 1350000 },
  { month: "Dec", revenue: 3450000, expenses: 1450000 },
];

const cashFlowData = [
  { month: "Jan", cashFlow: 900000 },
  { month: "Feb", cashFlow: 840000 },
  { month: "Mar", cashFlow: 1030000 },
  { month: "Apr", cashFlow: 1120000 },
  { month: "May", cashFlow: 1250000 },
  { month: "Jun", cashFlow: 1140000 },
  { month: "Jul", cashFlow: 1300000 },
  { month: "Aug", cashFlow: 1470000 },
  { month: "Sep", cashFlow: 1580000 },
  { month: "Oct", cashFlow: 1730000 },
  { month: "Nov", cashFlow: 1850000 },
  { month: "Dec", cashFlow: 2000000 },
];

const expensesByCategory = [
  { name: "Construction", value: 45 },
  { name: "Marketing", value: 18 },
  { name: "Operations", value: 21 },
  { name: "Administrative", value: 16 },
];

const quarterlyRevenueData = [
  { quarter: "Q1", revenue: 5520000, target: 5200000 },
  { quarter: "Q2", revenue: 6550000, target: 6300000 },
  { quarter: "Q3", revenue: 7850000, target: 7500000 },
  { quarter: "Q4", revenue: 9700000, target: 9000000 },
];

const Finances = () => {
  const [timeframe, setTimeframe] = useState("ytd");

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold">Financial Overview</h1>
            <p className="text-muted-foreground">
              Comprehensive financial performance and analysis
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Badge variant={timeframe === "mtd" ? "default" : "outline"} 
              className="cursor-pointer" onClick={() => setTimeframe("mtd")}>
              Month to Date
            </Badge>
            <Badge variant={timeframe === "qtd" ? "default" : "outline"}
              className="cursor-pointer" onClick={() => setTimeframe("qtd")}>
              Quarter to Date
            </Badge>
            <Badge variant={timeframe === "ytd" ? "default" : "outline"}
              className="cursor-pointer" onClick={() => setTimeframe("ytd")}>
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
                  <span className="text-2xl font-bold">$29.6M</span>
                  <div className="flex items-center mt-1 text-sm">
                    <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-500 font-medium">+18%</span>
                    <span className="text-muted-foreground ml-1">vs last year</span>
                  </div>
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
                  <span className="text-2xl font-bold">$12.4M</span>
                  <div className="flex items-center mt-1 text-sm">
                    <ArrowUpRight className="h-4 w-4 text-amber-500 mr-1" />
                    <span className="text-amber-500 font-medium">+11%</span>
                    <span className="text-muted-foreground ml-1">vs last year</span>
                  </div>
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
                  <span className="text-2xl font-bold">$17.2M</span>
                  <div className="flex items-center mt-1 text-sm">
                    <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-500 font-medium">+23%</span>
                    <span className="text-muted-foreground ml-1">vs last year</span>
                  </div>
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
                  <span className="text-2xl font-bold">$15.2M</span>
                  <div className="flex items-center mt-1 text-sm">
                    <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-500 font-medium">+16%</span>
                    <span className="text-muted-foreground ml-1">vs last year</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <BarChartIcon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="revenue" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="revenue">Revenue & Expenses</TabsTrigger>
            <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
            <TabsTrigger value="profitability">Profitability</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
          </TabsList>

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
                        <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                        <Tooltip formatter={(value) => [`$${(Number(value) / 1000000).toFixed(2)}M`]} />
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
                    <PieChart className="mr-2 h-5 w-5 text-estate-teal" />
                    Expenses by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {expensesByCategory.map((category) => (
                      <div key={category.name} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{category.name}</span>
                          <span className="text-sm text-muted-foreground">{category.value}%</span>
                        </div>
                        <Progress value={category.value} />
                      </div>
                    ))}
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
                        <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                        <Tooltip formatter={(value) => [`$${(Number(value) / 1000000).toFixed(2)}M`]} />
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
                      <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                      <Tooltip formatter={(value) => [`$${(Number(value) / 1000000).toFixed(2)}M`]} />
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
                  including profit margins, ROI, and performance metrics by project.
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
                  Budget management tools will be available here,
                  including expense tracking, budget allocation, and variance analysis.
                </p>
                <div className="h-80 bg-muted/30 rounded-md flex items-center justify-center">
                  <FileText className="w-16 h-16 text-muted/50" />
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
