import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import StatCard from "@/components/dashboard/StatCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import PropertyCard, {
  PropertyCardProps,
} from "@/components/dashboard/PropertyCard";
import {
  BarChart3,
  Building,
  DollarSign,
  Users,
  Calendar,
  BarChart,
  FileText,
  Briefcase,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import Loader from "@/components/Loader";
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
interface Building {
  _id: string;
  projectName: string;
  location: string;
  totalUnits: number;
  soldUnits: number;
  constructionStatus: string;
  thumbnailUrl: string;
}

interface OpenPlot {
  _id: string;
  projectName: string;
  location: string;
  status: string;
  thumbnailUrl: string;
}

interface OpenLand {
  _id: string;
  projectName: string;
  location: string;
  landStatus: string;
  thumbnailUrl: string;
}
interface FeaturedItem {
  id: string;
  title: string;
  location: string;
  image: string;
  status: string;
  type: "Building" | "Open Plot" | "Open Land";
  progress?: number;
  redirectUrl: string;
}
const OwnerDashboard = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [totalProperties, setTotalProperties] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [activeLeads, setActiveLeads] = useState(0);
  const [siteVisits, setSiteVisits] = useState(0);
  // const [activities, setActivities] = useState(fallbackActivities);
  // const [properties, setProperties] =
  //   useState<PropertyCardProps[]>(fallbackProperties);
  const [activities, setActivities] = useState<any[]>([]);
  const [properties, setProperties] = useState<PropertyCardProps[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [chartType, setChartType] = useState<
    "sales" | "leads" | "visits" | "properties"
  >("sales");
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [openPlots, setOpenPlots] = useState<OpenPlot[]>([]);
  const [openLands, setOpenLands] = useState<OpenLand[]>([]);
  // Fetch all data
  const fetchData = async () => {
    try {
      const baseURL = import.meta.env.VITE_URL;

      const [propertiesRes, customersRes, leadsRes] = await Promise.all([
        axios.get(`${baseURL}/api/properties/getProperties`, {
          withCredentials: true,
        }),
        axios.get(`${baseURL}/api/customer/getAllCustomers`, {
          withCredentials: true,
        }),
        axios.get(`${baseURL}/api/leads/getAllLeads`, {
          withCredentials: true,
        }),
      ]);
      const [buildingRes, plotRes, landRes] = await Promise.all([
        axios.get<{ data: Building[] }>(
          `${baseURL}/api/building/getAllBuildings`,
          { withCredentials: true },
        ),
        axios.get<{ data: OpenPlot[] }>(
          `${baseURL}/api/openPlot/getAllOpenPlot`,
          { withCredentials: true },
        ),
        axios.get<{ data: OpenLand[] }>(
          `${baseURL}/api/openLand/getAllOpenLand`,
          { withCredentials: true },
        ),
      ]);

      setBuildings(buildingRes.data.data ?? []);
      setOpenPlots(plotRes.data.data ?? []);
      setOpenLands(landRes.data.data ?? []);
      const propertiesData =
        propertiesRes.data?.data || propertiesRes.data || [];

      const customersData = customersRes.data?.data || customersRes.data || [];

      const leadsData = leadsRes.data?.data || leadsRes.data?.leads || [];

      /* ===============================
       TOTAL PROPERTIES
    =============================== */
      setTotalProperties(propertiesData.length);

      /* ===============================
       TOTAL SALES VALUE
    =============================== */
      const totalSalesValue = customersData.reduce(
        (sum: number, customer: any) =>
          customer.paymentStatus === "Completed"
            ? sum + (customer.finalPrice || 0)
            : sum,
        0,
      );

      setTotalSales(totalSalesValue);
      setCustomers(customersData);
      /* ===============================
       ACTIVE LEADS
    =============================== */
      const activeLeadCount = leadsData.filter(
        (lead: any) => !["Closed", "Rejected"].includes(lead.propertyStatus),
      ).length;

      setActiveLeads(activeLeadCount);

      /* ===============================
       SITE VISITS
    =============================== */
      const siteVisitCount = leadsData.filter(
        (lead: any) =>
          lead.propertyStatus === "Follow up" ||
          lead.notes?.toLowerCase().includes("site visit"),
      ).length;

      setSiteVisits(siteVisitCount);

      /* ===============================
       FEATURED PROPERTIES (Dynamic)
    =============================== */
      const featured = propertiesData.slice(0, 4).map((prop: any) => ({
        id: prop._id,
        name: prop.basicInfo?.projectName,
        location: prop.locationInfo?.googleMapsLocation
          ? "Hyderabad"
          : "Hyderabad",
        type: prop.basicInfo?.propertyType,
        units: 1,
        availableUnits:
          prop.customerInfo?.propertyStatus === "Available" ? 1 : 0,
        price: `₹${prop.financialDetails?.totalAmount?.toLocaleString()}`,
        status:
          prop.customerInfo?.propertyStatus?.toLowerCase()?.replace(" ", "-") ||
          "listed",
        thumbnailUrl:
          prop.locationInfo?.mainPropertyImage ||
          "https://via.placeholder.com/400x300",
      }));

      setProperties(featured);

      /* ===============================
       RECENT ACTIVITIES (Dynamic)
    =============================== */
      const recentActivities = leadsData
        .sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5)
        .map((lead: any) => {
          let action = "added a new lead for";
          let type: "approval" | "lead" | "visit" | "document" = "lead";

          if (lead.propertyStatus === "Closed") {
            action = "approved";
            type = "approval";
          } else if (lead.propertyStatus === "Follow up") {
            action = "scheduled a site visit for";
            type = "visit";
          }

          return {
            id: lead._id,
            user: {
              name: lead.addedBy?.name || "User",
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                lead.addedBy?.name || "User",
              )}&background=4299E1&color=fff`,
            },
            action,
            target:
              lead.property?.projectName ||
              lead.openPlot?.projectName ||
              lead.openLand?.projectName ||
              "Unknown Property",
            timestamp: new Date(lead.createdAt).toLocaleDateString(),
            type,
          };
        });

      setActivities(recentActivities);
    } catch (error: any) {
      console.error("Dashboard Error:", error?.response?.data || error.message);
      toast.error("Failed to load dashboard data");
    }
  };

  // Fetch data on mount
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchData();
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return <Loader />;
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
  const getLast6Months = () => {
    const months: { key: string; label: string }[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);

      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const label = d.toLocaleString("default", { month: "short" });

      months.push({ key, label });
    }

    return months;
  };
  const chartData = customers.reduce(
    (acc: { month: string; sales: number }[], customer: any) => {
      if (!customer.createdAt) return acc;

      const date = new Date(customer.createdAt);
      const month = date.toLocaleString("default", { month: "short" });

      const existing = acc.find((item) => item.month === month);

      if (existing) {
        existing.sales += customer.finalPrice || 0;
      } else {
        acc.push({
          month,
          sales: customer.finalPrice || 0,
        });
      }

      return acc;
    },
    [],
  );
  const featuredItems: FeaturedItem[] = [
    ...buildings.slice(0, 3).map((b) => ({
      id: b._id,
      title: b.projectName,
      location: b.location,
      image: b.thumbnailUrl,
      status: b.constructionStatus,
      type: "Building" as const,
      progress:
        b.constructionStatus === "Under Construction" && b.totalUnits > 0
          ? Math.round((b.soldUnits / b.totalUnits) * 100)
          : undefined,
      redirectUrl: `/properties/building/${b._id}`,
    })),

    ...openPlots.slice(0, 2).map((p) => ({
      id: p._id,
      title: p.projectName,
      location: p.location,
      image: p.thumbnailUrl,
      status: p.status,
      type: "Open Plot" as const,
      redirectUrl: `/properties/openplot/${p._id}`,
    })),

    ...openLands.slice(0, 2).map((l) => ({
      id: l._id,
      title: l.projectName,
      location: l.location,
      image: l.thumbnailUrl,
      status: l.landStatus,
      type: "Open Land" as const,
      redirectUrl: `/properties/openland/${l._id}`,
    })),
  ];
  // SALES (Monthly Revenue)
  const last6Months = getLast6Months();

  const salesChartData = last6Months.map(({ key, label }) => {
    const total = customers
      .filter((customer: any) => {
        if (!customer.createdAt) return false;
        const date = new Date(customer.createdAt);
        const customerKey = `${date.getFullYear()}-${date.getMonth()}`;
        return customerKey === key;
      })
      .reduce(
        (sum: number, customer: any) =>
          customer.paymentStatus === "Completed"
            ? sum + (customer.finalPrice || 0)
            : sum,
        0,
      );

    return {
      month: label,
      value: total,
    };
  });

  // LEADS (Monthly Leads Count)
  const leadsChartData = last6Months.map(({ key, label }) => {
    const count = activities.filter((activity: any) => {
      if (!activity.timestamp) return false;
      const date = new Date(activity.timestamp);
      const activityKey = `${date.getFullYear()}-${date.getMonth()}`;
      return activityKey === key;
    }).length;

    return {
      month: label,
      value: count,
    };
  });

  // VISITS (Single Metric)
  const visitsChartData = [{ month: "Site Visits", value: siteVisits }];

  // PROPERTIES (Single Metric)
  const propertiesChartData = [
    { month: "Total Properties", value: totalProperties },
  ];

  const getChartData = () => {
    switch (chartType) {
      case "leads":
        return leadsChartData;
      case "visits":
        return visitsChartData;
      case "properties":
        return propertiesChartData;
      default:
        return salesChartData;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold">Executive Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's your business summary
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/analytics" className="block">
            <StatCard
              title="Total Properties"
              value={totalProperties.toString()}
              icon={<Building className="h-6 w-6 text-estate-navy" />}
              trend={{ value: 12.5, isPositive: true }}
            />
          </Link>

          <Link to="/users" className="block">
            <StatCard
              title="Active Leads"
              value={activeLeads.toString()}
              icon={<Users className="h-6 w-6 text-estate-gold" />}
              trend={{ value: 4.1, isPositive: true }}
            />
          </Link>
          <Link to="/operations" className="block">
            <StatCard
              title="Site Visits"
              value={siteVisits.toString()}
              icon={<Calendar className="h-6 w-6 text-estate-navy" />}
              trend={{ value: 2.3, isPositive: false }}
            />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="rounded-2xl shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                  <BarChart className="h-5 w-5 text-estate-navy" />
                  Performance Overview
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Chart */}
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart data={getChartData()}>
                      <XAxis dataKey="month" stroke="#64748b" />
                      <YAxis
                        stroke="#64748b"
                        tickFormatter={(value) =>
                          value >= 1000000
                            ? `₹${(value / 1000000).toFixed(1)}M`
                            : `₹${(value / 1000).toFixed(0)}K`
                        }
                      />
                      <Tooltip />
                      <Bar
                        dataKey="value"
                        fill="#1e3a8a"
                        radius={[8, 8, 0, 0]}
                      />
                    </ReBarChart>
                  </ResponsiveContainer>
                </div>

                {/* Filter Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {[
                    {
                      key: "sales",
                      label: "Revenue",
                      value: `₹${totalSales.toLocaleString()}`,
                      icon: DollarSign,
                      color: "text-blue-600",
                    },
                    {
                      key: "leads",
                      label: "Leads",
                      value: activeLeads,
                      icon: Users,
                      color: "text-amber-600",
                    },
                    {
                      key: "visits",
                      label: "Visits",
                      value: siteVisits,
                      icon: Calendar,
                      color: "text-emerald-600",
                    },
                    {
                      key: "properties",
                      label: "Properties",
                      value: totalProperties,
                      icon: Building,
                      color: "text-purple-600",
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = chartType === item.key;

                    return (
                      <button
                        key={item.key}
                        onClick={() => setChartType(item.key as any)}
                        className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all duration-300 ${
                          isActive
                            ? "bg-estate-navy border-estate-navy shadow-lg transform scale-[1.02]"
                            : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-2">
                          <div
                            className={`p-2 rounded-lg ${isActive ? "bg-white/20" : "bg-slate-100"}`}
                          >
                            <Icon
                              className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-600"}`}
                            />
                          </div>
                          {isActive && (
                            <div className="h-2 w-2 rounded-full bg-estate-gold animate-pulse" />
                          )}
                        </div>

                        <p
                          className={`text-xs font-semibold uppercase tracking-wider ${isActive ? "text-slate-300" : "text-slate-500"}`}
                        >
                          {item.label}
                        </p>
                        <p
                          className={`text-lg font-bold ${isActive ? "text-white" : "text-slate-900"}`}
                        >
                          {item.value}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
          <ActivityFeed activities={activities} />
        </div>

        <Card className="rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle>Featured Properties</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {featuredItems.map((item) => (
                <Link key={item.id} to={item.redirectUrl}>
                  <div className="group bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer">
                    {/* Image Section */}
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* LEFT - Property Type */}
                      <span
                        className={`absolute top-3 left-3 text-xs font-medium px-3 py-1 rounded-full text-white ${
                          item.type === "Building"
                            ? "bg-indigo-600"
                            : item.type === "Open Plot"
                              ? "bg-emerald-600"
                              : "bg-blue-600"
                        }`}
                      >
                        {item.type}
                      </span>

                      {/* RIGHT - Status */}
                      <span
                        className={`absolute top-3 right-3 text-xs font-medium px-3 py-1 rounded-full text-white ${
                          item.status === "Completed"
                            ? "bg-green-600"
                            : item.status === "Under Construction"
                              ? "bg-amber-500"
                              : "bg-slate-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <h3 className="text-lg font-semibold">{item.title}</h3>

                      <p className="text-sm text-muted-foreground">
                        {item.location}
                      </p>

                      {/* Construction Progress */}
                      {item.progress !== undefined && (
                        <div className="space-y-2 pt-2">
                          <div className="flex justify-between text-xs font-medium">
                            <span>Construction Progress</span>
                            <span>{item.progress}%</span>
                          </div>

                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-estate-navy rounded-full transition-all duration-700"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default OwnerDashboard;
