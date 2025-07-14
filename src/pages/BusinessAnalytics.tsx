
import { useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { toast } from "sonner";
import { 
  TrendingUp, TrendingDown, PieChart, BarChartIcon, 
  LineChart as LineChartIcon, Users, Activity 
} from "lucide-react";

// Sample data for charts
const salesData = [
  { month: "Jan", sales: 1200000, target: 1000000 },
  { month: "Feb", sales: 980000, target: 1000000 },
  { month: "Mar", sales: 1350000, target: 1100000 },
  { month: "Apr", sales: 1460000, target: 1200000 },
  { month: "May", sales: 1780000, target: 1300000 },
  { month: "Jun", sales: 1520000, target: 1400000 },
  { month: "Jul", sales: 1890000, target: 1500000 },
  { month: "Aug", sales: 2100000, target: 1600000 },
  { month: "Sep", sales: 1940000, target: 1700000 },
  { month: "Oct", sales: 2300000, target: 1800000 },
  { month: "Nov", sales: 2150000, target: 1900000 },
  { month: "Dec", sales: 2450000, target: 2000000 },
];

const propertyData = [
  { name: "Residential", value: 65, color: "#4338ca" },
  { name: "Commercial", value: 20, color: "#2563eb" },
  { name: "Industrial", value: 10, color: "#3b82f6" },
  { name: "Agricultural", value: 5, color: "#60a5fa" },
];

const customerData = [
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
];

const leadConversionData = [
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
];

const BusinessAnalytics = () => {
  useEffect(() => {
    toast.info("Analytics data refreshed", {
      description: "Latest data as of today",
    });
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold">Business Analytics</h1>
            <p className="text-muted-foreground">
              Comprehensive analysis of business performance
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sales">Sales Analysis</TabsTrigger>
            <TabsTrigger value="properties">Property Analytics</TabsTrigger>
            <TabsTrigger value="customers">Customer Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <TrendingUp className="mr-2 h-5 w-5 text-estate-navy" />
                    YTD Sales Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis 
                          tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} 
                        />
                        <Tooltip 
                          formatter={(value) => `$${(Number(value) / 1000000).toFixed(2)}M`} 
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

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <Users className="mr-2 h-5 w-5 text-estate-teal" />
                    Customer Acquisition
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={customerData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="new" fill="#2563eb" name="New Customers" />
                        <Bar dataKey="returning" fill="#60a5fa" name="Returning Customers" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <PieChart className="mr-2 h-5 w-5 text-estate-gold" />
                    Property Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-56 flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-4 w-full">
                      {propertyData.map((item) => (
                        <div key={item.name} className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: item.color }}
                            ></div>
                            <span className="text-sm font-medium">{item.name}</span>
                          </div>
                          <div className="text-2xl font-bold mt-1">{item.value}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sales">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LineChartIcon className="mr-2 h-5 w-5 text-estate-navy" />
                    Annual Sales Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis 
                          tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} 
                        />
                        <Tooltip 
                          formatter={(value) => `$${(Number(value) / 1000000).toFixed(2)}M`} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="sales" 
                          stroke="#4338ca" 
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="target" 
                          stroke="#9ca3af" 
                          strokeWidth={2}
                          strokeDasharray="5 5" 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="mr-2 h-5 w-5 text-estate-teal" />
                    Lead Conversion Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={leadConversionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" orientation="left" stroke="#4338ca" />
                        <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                        <Tooltip />
                        <Bar yAxisId="left" dataKey="leads" fill="#4338ca" name="Total Leads" />
                        <Bar yAxisId="right" dataKey="conversions" fill="#10b981" name="Conversions" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChartIcon className="mr-2 h-5 w-5 text-estate-gold" />
                    Monthly Revenue Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis 
                          tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} 
                        />
                        <Tooltip 
                          formatter={(value) => `$${(Number(value) / 1000000).toFixed(2)}M`} 
                        />
                        <Bar dataKey="sales" fill="#4338ca" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="properties">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Property Analytics Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    Detailed property analytics will be available here, showing performance
                    metrics, occupancy rates, and market trends.
                  </p>
                  <div className="h-80 bg-muted/30 rounded-md flex items-center justify-center">
                    <PieChart className="w-16 h-16 text-muted/50" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="customers">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Insights Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    Comprehensive customer insights will be displayed here, including
                    demographics, preferences, and engagement metrics.
                  </p>
                  <div className="h-80 bg-muted/30 rounded-md flex items-center justify-center">
                    <Users className="w-16 h-16 text-muted/50" />
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
