import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  Users,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Target,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

const SalesOverview = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [timeframe, setTimeframe] = useState("ytd");
  const [activeTab, setActiveTab] = useState("performance");
  const [totalSales, setTotalSales] = useState(0);
  const [unitsSold, setUnitsSold] = useState(0);
  const [averageDealSize, setAverageDealSize] = useState(0);
  const [newClients, setNewClients] = useState(0);
  const [monthlySalesData, setMonthlySalesData] = useState<
    { month: string; sales: number; target: number }[]
  >([]);
  const [salesByCategoryData, setSalesByCategoryData] = useState<
    { name: string; value: number; color: string }[]
  >([]);
  const [salesByLocationData, setSalesByLocationData] = useState<
    { location: string; sales: number }[]
  >([]);
  const [topPerformersData, setTopPerformersData] = useState<
    { name: string; sales: number; deals: number; target: number }[]
  >([]);

  // Colors for PieChart
  const CATEGORY_COLORS = ["#4338ca", "#2563eb", "#10b981", "#f59e0b"];

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

  // Calculate timeframe date range
  const getTimeframeDates = () => {
    const now = new Date();
    let startDate: Date, endDate: Date;

    if (timeframe === "mtd") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );
    } else if (timeframe === "qtd") {
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
      endDate = new Date(
        now.getFullYear(),
        (quarter + 1) * 3,
        0,
        23,
        59,
        59,
        999
      );
    } else {
      // ytd
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    }
    return { startDate, endDate };
  };

  // Fetch all data
  const fetchData = async () => {
    try {
      const { startDate, endDate } = getTimeframeDates();
      const year = new Date().getFullYear();

      // Fetch customers
      const { data: customers } = await axios.get(
        `${import.meta.env.VITE_URL}/api/customer/getAllCustomers`,
        { withCredentials: true }
      );

      // Calculate KPIs
      let total = 0;
      let units = 0;
      const purchases: any[] = [];
      customers.data.forEach((customer: any) => {
        customer.properties.forEach((prop: any) => {
          if (
            prop.paymentStatus === "Completed" &&
            new Date(prop.bookingDate) >= startDate &&
            new Date(prop.bookingDate) <= endDate
          ) {
            total += prop.finalPrice || 0;
            units += 1;
            purchases.push(prop);
          }
        });
      });
      setTotalSales(total);
      setUnitsSold(units);
      setAverageDealSize(units ? total / units : 0);

      // New Clients
      const newClientsCount = customers.data.filter(
        (cust: any) =>
          new Date(cust.createdAt) >= startDate &&
          new Date(cust.createdAt) <= endDate
      ).length;
      setNewClients(newClientsCount);

      // Monthly Sales Performance
      const monthlyData = Array(12)
        .fill(0)
        .map((_, i) => ({
          month: new Date(year, i, 1).toLocaleString("default", {
            month: "short",
          }),
          sales: 0,
          target: 1600000 + i * 200000, // Mock target, adjust as needed
        }));
      customers.data.forEach((customer: any) => {
        customer.properties.forEach((prop: any) => {
          if (
            prop.paymentStatus === "Completed" &&
            new Date(prop.bookingDate).getFullYear() === year
          ) {
            const monthIndex = new Date(prop.bookingDate).getMonth();
            monthlyData[monthIndex].sales += prop.finalPrice || 0;
          }
        });
      });
      setMonthlySalesData(monthlyData);

      // Sales by Property Category
      const categoryMap: { [key: string]: number } = {};
      let totalSalesForCategories = 0;
      purchases.forEach((prop: any) => {
        const type = prop.property?.basicInfo?.propertyType || "Other";
        categoryMap[type] = (categoryMap[type] || 0) + (prop.finalPrice || 0);
        totalSalesForCategories += prop.finalPrice || 0;
      });
      const categories = Object.entries(categoryMap).map(
        ([name, value], index) => ({
          name,
          value: totalSalesForCategories
            ? (value / totalSalesForCategories) * 100
            : 0,
          color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
        })
      );
      setSalesByCategoryData(categories);

      // Sales by Location
      const locationMap: { [key: string]: number } = {};
      purchases.forEach((prop: any) => {
        // Fallback to projectName if googleMapsLocation is not suitable
        const location = prop.property?.basicInfo?.projectName || "Unknown";
        locationMap[location] =
          (locationMap[location] || 0) + (prop.finalPrice || 0);
      });
      const locations = Object.entries(locationMap).map(
        ([location, sales]) => ({
          location,
          sales,
        })
      );
      setSalesByLocationData(locations);

      // Top Performers
      const agentMap: {
        [key: string]: { sales: number; deals: number; name: string };
      } = {};
      customers.data.forEach((customer: any) => {
        customer.properties.forEach((prop: any) => {
          if (
            prop.paymentStatus === "Completed" &&
            new Date(prop.bookingDate) >= startDate &&
            new Date(prop.bookingDate) <= endDate
          ) {
            const agentId = customer.purchasedFrom?._id?.toString();
            const agentName = customer.purchasedFrom?.name || "Unknown Agent";
            if (agentId) {
              if (!agentMap[agentId]) {
                agentMap[agentId] = { sales: 0, deals: 0, name: agentName };
              }
              agentMap[agentId].sales += prop.finalPrice || 0;
              agentMap[agentId].deals += 1;
            }
          }
        });
      });
      const performers = Object.entries(agentMap)
        .map(([agentId, data]) => ({
          name: data.name,
          sales: data.sales,
          deals: data.deals,
          target: data.sales * 0.9, // Mock target (90% of sales)
        }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);
      setTopPerformersData(
        performers.length
          ? performers
          : [
              {
                name: "Robert Wilson",
                sales: 4800000,
                deals: 12,
                target: 4500000,
              },
              {
                name: "Jennifer Martinez",
                sales: 4200000,
                deals: 10,
                target: 4000000,
              },
              {
                name: "Michael Brown",
                sales: 3900000,
                deals: 9,
                target: 3500000,
              },
              {
                name: "Emily Davis",
                sales: 3500000,
                deals: 8,
                target: 3000000,
              },
              {
                name: "David Anderson",
                sales: 3100000,
                deals: 7,
                target: 3000000,
              },
            ]
      );
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load sales data");
    }
  };

  // Fetch data on mount and timeframe change
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchData();
    }
  }, [isAuthenticated, isLoading, timeframe]);

  if (isLoading) {
    return <MainLayout>Loading...</MainLayout>;
  }

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
          <p className="text-muted-foreground">
            Please log in to view this page.
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Sales Overview</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Analyzing sales performance and trends
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xl md:text-2xl font-bold">
                    {formatCurrency(totalSales)}
                  </span>
                  <div className="flex flex-wrap items-center mt-1 text-xs md:text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-500 font-medium">+12%</span>
                    <span className="text-muted-foreground ml-1">
                      vs last year
                    </span>
                  </div>
                </div>
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-primary" />
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
                  <span className="text-xl md:text-2xl font-bold">
                    {unitsSold}
                  </span>
                  <div className="flex flex-wrap items-center mt-1 text-xs md:text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-500 font-medium">+8%</span>
                    <span className="text-muted-foreground ml-1">
                      vs last year
                    </span>
                  </div>
                </div>
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 md:h-6 md:w-6 text-primary" />
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
                  <span className="text-xl md:text-2xl font-bold">
                    {formatCurrency(averageDealSize)}
                  </span>
                  <div className="flex flex-wrap items-center mt-1 text-xs md:text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-500 font-medium">+5%</span>
                    <span className="text-muted-foreground ml-1">
                      vs last year
                    </span>
                  </div>
                </div>
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="h-5 w-5 md:h-6 md:w-6 text-primary" />
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
                  <span className="text-xl md:text-2xl font-bold">
                    {newClients}
                  </span>
                  <div className="flex flex-wrap items-center mt-1 text-xs md:text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-500 font-medium">+15%</span>
                    <span className="text-muted-foreground ml-1">
                      vs last year
                    </span>
                  </div>
                </div>
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs
          defaultValue="performance"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          {/* Mobile Select */}
          <div className="block md:hidden mb-4">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full rounded-md border px-3 py-2 text-sm">
                <SelectValue placeholder="Select Tab" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="breakdown">Sales Breakdown</SelectItem>
                <SelectItem value="team">Team Performance</SelectItem>
                <SelectItem value="forecasts">Forecasts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Desktop Tabs */}
          <TabsList className="hidden md:inline-block md:overflow-x-auto mb-4">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="breakdown">Sales Breakdown</TabsTrigger>
            <TabsTrigger value="team">Team Performance</TabsTrigger>
            <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
          </TabsList>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-estate-navy" />
                  Monthly Sales Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72 md:h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={monthlySalesData}
                      margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis
                        tickFormatter={(value) =>
                          `$${(value / 1000000).toFixed(1)}M`
                        }
                      />
                      <Tooltip
                        formatter={(value) => [
                          `$${(Number(value) / 1000000).toFixed(2)}M`,
                        ]}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="sales"
                        stroke="#4338ca"
                        activeDot={{ r: 6 }}
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

          {/* Breakdown Tab */}
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
                  <div className="h-72 md:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={salesByCategoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
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
                  <div className="h-72 md:h-80 overflow-x-auto">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={salesByLocationData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          type="number"
                          tickFormatter={(value) =>
                            `$${(value / 1000000).toFixed(1)}M`
                          }
                        />
                        <YAxis
                          type="category"
                          dataKey="location"
                          width={100}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                          formatter={(value) => [
                            `$${(Number(value) / 1000000).toFixed(2)}M`,
                            "Sales",
                          ]}
                        />
                        <Bar dataKey="sales" fill="#4338ca" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5 text-estate-navy" />
                  Top Performing Agents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72 md:h-96 overflow-x-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topPerformersData}
                      margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis
                        tickFormatter={(value) =>
                          `$${(value / 1000000).toFixed(1)}M`
                        }
                      />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name === "deals") return [value, "Deals Closed"];
                          return [
                            `$${(Number(value) / 1000000).toFixed(2)}M`,
                            name,
                          ];
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

          {/* Forecasts Tab */}
          <TabsContent value="forecasts">
            <Card>
              <CardHeader>
                <CardTitle>Sales Forecasts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm md:text-base text-muted-foreground mb-6">
                  Detailed sales forecasts and predictive analytics will be
                  available here, showing projected revenue and market trends.
                </p>
                <div className="h-60 md:h-80 bg-muted/30 rounded-md flex items-center justify-center">
                  <TrendingUp className="w-12 h-12 md:w-16 md:h-16 text-muted/50" />
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
