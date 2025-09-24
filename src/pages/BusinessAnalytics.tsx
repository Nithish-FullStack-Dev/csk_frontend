import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "recharts";
import {
  TrendingUp,
  PieChart as PieChartIcon,
  BarChartIcon,
  LineChart as LineChartIcon,
  Users,
  Activity,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Property type mapping to match static data
const PROPERTY_TYPE_MAPPING: { [key: string]: string } = {
  Villa: "Residential",
  Apartment: "Residential",
  Plot: "Agricultural",
  "Land Parcel": "Industrial",
};

const BusinessAnalytics = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [salesData, setSalesData] = useState<
    { month: string; sales: number; target: number }[]
  >([]);
  const [propertyData, setPropertyData] = useState<
    { name: string; value: number; color: string }[]
  >([]);
  const [customerData, setCustomerData] = useState<
    { month: string; new: number; returning: number }[]
  >([]);
  const [leadConversionData, setLeadConversionData] = useState<
    { month: string; leads: number; conversions: number }[]
  >([]);
  const [activeTab, setActiveTab] = useState("overview");

  // Colors for property distribution
  const PROPERTY_COLORS = ["#4338ca", "#2563eb", "#3b82f6", "#60a5fa"];

  // Format currency in INR
  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(1)}Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    return `₹${value.toFixed(2)}`;
  };

  // Fetch all data
  const fetchData = async () => {
    try {
      const year = new Date().getFullYear();

      // Fetch customers
      const { data: customers } = await axios.get(
        `${import.meta.env.VITE_URL}/api/customer/getAllCustomers`,
        { withCredentials: true }
      );

      // Initialize sales data
      const monthlySalesData = Array(12)
        .fill(0)
        .map((_, i) => ({
          month: new Date(year, i, 1).toLocaleString("default", {
            month: "short",
          }),
          sales: 0,
          target: 10000000 + i * 1000000, // Mock target in INR (10L to 20L)
        }));

      // Initialize customer data
      const monthlyCustomerData = Array(12)
        .fill(0)
        .map((_, i) => ({
          month: new Date(year, i, 1).toLocaleString("default", {
            month: "short",
          }),
          new: 0,
          returning: 0,
        }));

      // Process sales and customer acquisition
      const customerMap: { [key: string]: boolean } = {}; // Track unique customers
      customers.data.forEach((customer: any) => {
        let isReturning = customer.properties.length > 1;
        customer.properties.forEach((prop: any) => {
          if (
            prop.paymentStatus === "Completed" &&
            new Date(prop.bookingDate).getFullYear() === year
          ) {
            const monthIndex = new Date(prop.bookingDate).getMonth();
            monthlySalesData[monthIndex].sales += prop.finalPrice || 0;
          }
        });

        // Count new and returning customers
        const createdMonth = new Date(customer.createdAt).getMonth();
        if (new Date(customer.createdAt).getFullYear() === year) {
          if (!customerMap[customer._id]) {
            monthlyCustomerData[createdMonth].new += 1;
            customerMap[customer._id] = true;
          }
          if (isReturning) {
            monthlyCustomerData[createdMonth].returning += 1;
          }
        }
      });
      setSalesData(monthlySalesData);
      setCustomerData(monthlyCustomerData);

      // Property Distribution
      const propertyMap: { [key: string]: number } = {};
      let totalSalesForProperties = 0;
      customers.data.forEach((customer: any) => {
        customer.properties.forEach((prop: any) => {
          if (prop.paymentStatus === "Completed") {
            const type = prop.property?.basicInfo?.propertyType || "Other";
            const mappedType = PROPERTY_TYPE_MAPPING[type] || "Other";
            propertyMap[mappedType] =
              (propertyMap[mappedType] || 0) + (prop.finalPrice || 0);
            totalSalesForProperties += prop.finalPrice || 0;
          }
        });
      });
      const properties = Object.entries(propertyMap).map(
        ([name, value], index) => ({
          name,
          value: totalSalesForProperties
            ? (value / totalSalesForProperties) * 100
            : 0,
          color: PROPERTY_COLORS[index % PROPERTY_COLORS.length],
        })
      );
      setPropertyData(
        properties.length
          ? properties
          : [
              { name: "Residential", value: 65, color: "#4338ca" },
              { name: "Commercial", value: 20, color: "#2563eb" },
              { name: "Industrial", value: 10, color: "#3b82f6" },
              { name: "Agricultural", value: 5, color: "#60a5fa" },
            ]
      );

      // Fetch leads for lead conversion
      const { data: leadsData } = await axios.get(
        `${import.meta.env.VITE_URL}/api/leads/getAllLeads`,
        { withCredentials: true }
      );
      const monthlyLeadData = Array(12)
        .fill(0)
        .map((_, i) => ({
          month: new Date(year, i, 1).toLocaleString("default", {
            month: "short",
          }),
          leads: 0,
          conversions: 0,
        }));
      leadsData.leads.forEach((lead: any) => {
        if (new Date(lead.createdAt).getFullYear() === year) {
          const monthIndex = new Date(lead.createdAt).getMonth();
          monthlyLeadData[monthIndex].leads += 1;
          if (lead.propertyStatus === "Closed") {
            monthlyLeadData[monthIndex].conversions += 1;
          }
        }
      });
      setLeadConversionData(
        monthlyLeadData.length
          ? monthlyLeadData
          : [
              { month: "Jan", leads: 80, conversions: 12 },
              { month: "Feb", leads: 75, conversions: 10 },
              { month: "Mar", leads: 95, conversions: 15 },
              { month: "Apr", leads: 110, conversions: 22 },
              { month: "May", leads: 120, conversions: 25 },
              { month: "Jun", leads: 130, conversions: 28 },
              { month: "Jul", leads: 140, conversions: 32 },
              { month: "Aug", leads: 150, conversions: 38 },
              { month: "Sep", leads: 145, conversions: 35 },
              { month: "Oct", leads: 160, conversions: 42 },
              { month: "Nov", leads: 170, conversions: 45 },
              { month: "Dec", leads: 180, conversions: 52 },
            ]
      );
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load analytics data");
      // Fallback to static data (adjusted for INR)
      setSalesData([
        { month: "Jan", sales: 12000000, target: 10000000 },
        { month: "Feb", sales: 9800000, target: 10000000 },
        { month: "Mar", sales: 13500000, target: 11000000 },
        { month: "Apr", sales: 14600000, target: 12000000 },
        { month: "May", sales: 17800000, target: 13000000 },
        { month: "Jun", sales: 15200000, target: 14000000 },
        { month: "Jul", sales: 18900000, target: 15000000 },
        { month: "Aug", sales: 21000000, target: 16000000 },
        { month: "Sep", sales: 19400000, target: 17000000 },
        { month: "Oct", sales: 23000000, target: 18000000 },
        { month: "Nov", sales: 21500000, target: 19000000 },
        { month: "Dec", sales: 24500000, target: 20000000 },
      ]);
      setPropertyData([
        { name: "Residential", value: 65, color: "#4338ca" },
        { name: "Commercial", value: 20, color: "#2563eb" },
        { name: "Industrial", value: 10, color: "#3b82f6" },
        { name: "Agricultural", value: 5, color: "#60a5fa" },
      ]);
      setCustomerData([
        { month: "Jan", new: 42, returning: 28 },
        { month: "Feb", new: 38, returning: 32 },
        { month: "Mar", new: 55, returning: 35 },
        { month: "Apr", new: 61, returning: 42 },
        { month: "May", new: 48, returning: 45 },
        { month: "Jun", new: 55, returning: 50 },
        { month: "Jul", new: 67, returning: 53 },
        { month: "Aug", new: 72, returning: 59 },
        { month: "Sep", new: 65, returning: 61 },
        { month: "Oct", new: 75, returning: 65 },
        { month: "Nov", new: 80, returning: 70 },
        { month: "Dec", new: 90, returning: 75 },
      ]);
      setLeadConversionData([
        { month: "Jan", leads: 80, conversions: 12 },
        { month: "Feb", leads: 75, conversions: 10 },
        { month: "Mar", leads: 95, conversions: 15 },
        { month: "Apr", leads: 110, conversions: 22 },
        { month: "May", leads: 120, conversions: 25 },
        { month: "Jun", leads: 130, conversions: 28 },
        { month: "Jul", leads: 140, conversions: 32 },
        { month: "Aug", leads: 150, conversions: 38 },
        { month: "Sep", leads: 145, conversions: 35 },
        { month: "Oct", leads: 160, conversions: 42 },
        { month: "Nov", leads: 170, conversions: 45 },
        { month: "Dec", leads: 180, conversions: 52 },
      ]);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchData();
      toast.info("Analytics data refreshed", {
        description: "Latest data as of today",
      });
    }
  }, [isAuthenticated, isLoading]);

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
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Business Analytics
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Comprehensive analysis of business performance
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          defaultValue="overview"
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <div className="block md:hidden mb-4">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full rounded-md border px-3 py-2 text-sm">
                <SelectValue placeholder="Select Tab" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="sales">Sales Analysis</SelectItem>
                <SelectItem value="properties">Property Analytics</SelectItem>
                <SelectItem value="customers">Customer Insights</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsList className="hidden md:inline-block md:overflow-x-auto mb-4">
            <TabsTrigger value="overview" className="flex-1 sm:flex-none">
              Overview
            </TabsTrigger>
            <TabsTrigger value="sales" className="flex-1 sm:flex-none">
              Sales Analysis
            </TabsTrigger>
            <TabsTrigger value="properties" className="flex-1 sm:flex-none">
              Property Analytics
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex-1 sm:flex-none">
              Customer Insights
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Sales Performance */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-base md:text-lg">
                    <TrendingUp className="mr-2 h-5 w-5 text-estate-navy" />
                    YTD Sales Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 sm:h-56 md:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis
                          tickFormatter={(value) =>
                            `₹${(value / 10000000).toFixed(1)}Cr`
                          }
                        />
                        <Tooltip
                          formatter={(value) =>
                            `₹${(Number(value) / 10000000).toFixed(2)}Cr`
                          }
                        />
                        <Area
                          type="monotone"
                          dataKey="sales"
                          stroke="#4338ca"
                          fill="#4338ca"
                          fillOpacity={0.2}
                        />
                        <Area
                          type="monotone"
                          dataKey="target"
                          stroke="#9ca3af"
                          strokeDasharray="5 5"
                          fill="none"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Acquisition */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-base md:text-lg">
                    <Users className="mr-2 h-5 w-5 text-estate-teal" />
                    Customer Acquisition
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 sm:h-56 md:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={customerData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar
                          dataKey="new"
                          fill="#2563eb"
                          name="New Customers"
                        />
                        <Bar
                          dataKey="returning"
                          fill="#60a5fa"
                          name="Returning Customers"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Property Distribution */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-base md:text-lg">
                    <PieChartIcon className="mr-2 h-5 w-5 text-estate-gold" />
                    Property Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 sm:h-56 md:h-64 flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-4 w-full">
                      {propertyData.map((item) => (
                        <div key={item.name} className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: item.color }}
                            ></div>
                            <span className="text-sm font-medium">
                              {item.name}
                            </span>
                          </div>
                          <div className="text-lg sm:text-xl md:text-2xl font-bold mt-1">
                            {item.value.toFixed(0)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Annual Sales */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center text-base md:text-lg">
                    <LineChartIcon className="mr-2 h-5 w-5 text-estate-navy" />
                    Annual Sales Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 sm:h-72 md:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis
                          tickFormatter={(value) =>
                            `₹${(value / 10000000).toFixed(1)}Cr`
                          }
                        />
                        <Tooltip
                          formatter={(value) =>
                            `₹${(Number(value) / 10000000).toFixed(2)}Cr`
                          }
                        />
                        <Line
                          type="monotone"
                          dataKey="sales"
                          stroke="#4338ca"
                          strokeWidth="2"
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="target"
                          stroke="#9ca3af"
                          strokeWidth="2"
                          strokeDasharray="5 5"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Lead Conversion */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-base md:text-lg">
                    <Activity className="mr-2 h-5 w-5 text-estate-teal" />
                    Lead Conversion Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 sm:h-72 md:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={leadConversionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis
                          yAxisId="left"
                          orientation="left"
                          stroke="#4338ca"
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          stroke="#10b981"
                        />
                        <Tooltip />
                        <Bar
                          yAxisId="left"
                          dataKey="leads"
                          fill="#4338ca"
                          name="Total Leads"
                        />
                        <Bar
                          yAxisId="right"
                          dataKey="conversions"
                          fill="#10b981"
                          name="Conversions"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-base md:text-lg">
                    <BarChartIcon className="mr-2 h-5 w-5 text-estate-gold" />
                    Monthly Revenue Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 sm:h-72 md:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis
                          tickFormatter={(value) =>
                            `₹${(value / 10000000).toFixed(1)}Cr`
                          }
                        />
                        <Tooltip
                          formatter={(value) =>
                            `₹${(Number(value) / 10000000).toFixed(2)}Cr`
                          }
                        />
                        <Bar dataKey="sales" fill="#4338ca" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">
                    Property Analytics Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm md:text-base text-muted-foreground mb-6">
                    Detailed property analytics will be available here, showing
                    performance metrics, occupancy rates, and market trends.
                  </p>
                  <div className="h-64 sm:h-72 md:h-80 bg-muted/30 rounded-md flex items-center justify-center">
                    <PieChartIcon className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 text-muted/50" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">
                    Customer Insights Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm md:text-base text-muted-foreground mb-6">
                    Comprehensive customer insights will be displayed here,
                    including demographics, preferences, and engagement metrics.
                  </p>
                  <div className="h-64 sm:h-72 md:h-80 bg-muted/30 rounded-md flex items-center justify-center">
                    <Users className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 text-muted/50" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default BusinessAnalytics;
