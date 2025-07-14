
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign, TrendingUp, Users, BarChart3,
  PieChart as PieChartIcon, Calendar, Target
} from "lucide-react";
import { useState } from "react";

// Sample data for charts
const monthlySalesData = [
  { month: "Jan", sales: 1800000, target: 1600000 },
  { month: "Feb", sales: 1650000, target: 1600000 },
  { month: "Mar", sales: 1950000, target: 1800000 },
  { month: "Apr", sales: 2100000, target: 2000000 },
  { month: "May", sales: 2300000, target: 2200000 },
  { month: "Jun", sales: 2150000, target: 2400000 },
  { month: "Jul", sales: 2400000, target: 2600000 },
  { month: "Aug", sales: 2700000, target: 2800000 },
  { month: "Sep", sales: 2900000, target: 3000000 },
  { month: "Oct", sales: 3200000, target: 3200000 },
  { month: "Nov", sales: 3400000, target: 3400000 },
  { month: "Dec", sales: 3800000, target: 3600000 },
];

const salesByCategoryData = [
  { name: "Apartments", value: 42, color: "#4338ca" },
  { name: "Villas", value: 28, color: "#2563eb" },
  { name: "Commercial", value: 18, color: "#10b981" },
  { name: "Land", value: 12, color: "#f59e0b" },
];

const salesByLocationData = [
  { location: "Downtown", sales: 3500000 },
  { location: "Suburbs", sales: 2800000 },
  { location: "Waterfront", sales: 2100000 },
  { location: "Business District", sales: 1900000 },
  { location: "Residential Area", sales: 1600000 },
];

const topPerformersData = [
  { name: "Robert Wilson", sales: 4800000, deals: 12, target: 4500000 },
  { name: "Jennifer Martinez", sales: 4200000, deals: 10, target: 4000000 },
  { name: "Michael Brown", sales: 3900000, deals: 9, target: 3500000 },
  { name: "Emily Davis", sales: 3500000, deals: 8, target: 3000000 },
  { name: "David Anderson", sales: 3100000, deals: 7, target: 3000000 },
];

const SalesOverview = () => {
  const [timeframe, setTimeframe] = useState("ytd");

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold">Sales Overview</h1>
            <p className="text-muted-foreground">
              Analyzing sales performance and trends
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
                Total Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">$31.5M</span>
                  <div className="flex items-center mt-1 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-500 font-medium">+12%</span>
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
                Units Sold
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">248</span>
                  <div className="flex items-center mt-1 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-500 font-medium">+8%</span>
                    <span className="text-muted-foreground ml-1">vs last year</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Deal Size
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">$127K</span>
                  <div className="flex items-center mt-1 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-500 font-medium">+5%</span>
                    <span className="text-muted-foreground ml-1">vs last year</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                New Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">186</span>
                  <div className="flex items-center mt-1 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-500 font-medium">+15%</span>
                    <span className="text-muted-foreground ml-1">vs last year</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="breakdown">Sales Breakdown</TabsTrigger>
            <TabsTrigger value="team">Team Performance</TabsTrigger>
            <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
          </TabsList>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-estate-navy" />
                  Monthly Sales Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={monthlySalesData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                      <Tooltip formatter={(value) => [`$${(Number(value) / 1000000).toFixed(2)}M`]} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#4338ca" 
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                        name="Actual Sales"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="target" 
                        stroke="#9ca3af" 
                        strokeDasharray="5 5" 
                        strokeWidth={2}
                        name="Sales Target"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="breakdown">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChartIcon className="mr-2 h-5 w-5 text-estate-teal" />
                    Sales by Property Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={salesByCategoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {salesByCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5 text-estate-gold" />
                    Sales by Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={salesByLocationData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          type="number" 
                          tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                        />
                        <YAxis type="category" dataKey="location" />
                        <Tooltip 
                          formatter={(value) => [`$${(Number(value) / 1000000).toFixed(2)}M`, "Sales"]} 
                        />
                        <Bar dataKey="sales" fill="#4338ca" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5 text-estate-navy" />
                  Top Performing Agents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topPerformersData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === "deals") return [value, "Deals Closed"];
                          return [`$${(Number(value) / 1000000).toFixed(2)}M`, name];
                        }}
                      />
                      <Legend />
                      <Bar dataKey="sales" fill="#4338ca" name="Sales Volume" />
                      <Bar dataKey="target" fill="#9ca3af" name="Target" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forecasts">
            <Card>
              <CardHeader>
                <CardTitle>Sales Forecasts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Detailed sales forecasts and predictive analytics will be available here,
                  showing projected revenue and market trends.
                </p>
                <div className="h-80 bg-muted/30 rounded-md flex items-center justify-center">
                  <TrendingUp className="w-16 h-16 text-muted/50" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default SalesOverview;
