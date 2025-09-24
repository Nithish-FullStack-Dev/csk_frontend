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

// Static fallback data
const fallbackActivities = [
  {
    id: "1",
    user: {
      name: "Sarah Johnson",
      avatar:
        "https://ui-avatars.com/api/?name=Rakshit+Agarwal&background=2C7A7B&color=fff",
    },
    action: "approved",
    target: "Golden Heights Phase 2",
    timestamp: "2 hours ago",
    type: "approval" as const,
  },
  {
    id: "2",
    user: {
      name: "Michael Brown",
      avatar:
        "https://ui-avatars.com/api/?name=Michael+Brown&background=ECC94B&color=1A365D",
    },
    action: "added a new lead for",
    target: "Riverside Apartments",
    timestamp: "4 hours ago",
    type: "lead" as const,
  },
  {
    id: "3",
    user: {
      name: "Emily Davis",
      avatar:
        "https://ui-avatars.com/api/?name=Emily+Davis&background=718096&color=fff",
    },
    action: "scheduled a site visit for",
    target: "Evergreen Villas",
    timestamp: "6 hours ago",
    type: "visit" as const,
  },
  {
    id: "4",
    user: {
      name: "Robert Wilson",
      avatar:
        "https://ui-avatars.com/api/?name=Robert+Wilson&background=38A169&color=fff",
    },
    action: "uploaded documents for",
    target: "Skyline Towers",
    timestamp: "yesterday",
    type: "document" as const,
  },
  {
    id: "5",
    user: {
      name: "Jennifer Martinez",
      avatar:
        "https://ui-avatars.com/api/?name=Jennifer+Martinez&background=4299E1&color=fff",
    },
    action: "completed milestone inspection for",
    target: "Parkview Residences",
    timestamp: "yesterday",
    type: "approval" as const,
  },
];

const fallbackProperties: PropertyCardProps[] = [
  {
    id: "1",
    name: "Skyline Towers",
    location: "Downtown, Metro City",
    type: "Apartment Complex",
    units: 120,
    availableUnits: 45,
    price: "₹25L - ₹45L",
    status: "listed",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "2",
    name: "Parkview Residences",
    location: "East Side, Metro City",
    type: "Condominiums",
    units: 80,
    availableUnits: 12,
    price: "₹32L - ₹55L",
    status: "under-construction",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1564013434775-f71db0030976?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "3",
    name: "Riverside Apartments",
    location: "River District, Metro City",
    type: "Luxury Apartments",
    units: 60,
    availableUnits: 20,
    price: "₹40L - ₹75L",
    status: "listed",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "4",
    name: "Golden Heights Phase 2",
    location: "North Hills, Metro City",
    type: "Villas",
    units: 40,
    availableUnits: 28,
    price: "₹60L - ₹120L",
    status: "under-construction",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
  },
];

const OwnerDashboard = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [totalProperties, setTotalProperties] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [activeLeads, setActiveLeads] = useState(0);
  const [siteVisits, setSiteVisits] = useState(0);
  const [activities, setActivities] = useState(fallbackActivities);
  const [properties, setProperties] =
    useState<PropertyCardProps[]>(fallbackProperties);

  // Format currency in INR
  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(1)}Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    return `₹${value.toFixed(2)}`;
  };

  // Format timestamp
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = (now.getTime() - new Date(date).getTime()) / 1000 / 60 / 60;
    if (diff < 1) return `${Math.round(diff * 60)} minutes ago`;
    if (diff < 24) return `${Math.round(diff)} hours ago`;
    if (diff < 48) return "yesterday";
    return new Date(date).toLocaleDateString();
  };

  // Fetch all data
  const fetchData = async () => {
    try {
      // Fetch properties
      const { data: propertiesData } = await axios.get(
        `${import.meta.env.VITE_URL}/api/properties/getProperties`,
        { withCredentials: true }
      );

      // Total Properties
      setTotalProperties(propertiesData.length || 0);

      // Featured Properties
      const featuredProperties = propertiesData
        .filter((prop: any) =>
          ["Available", "Under Construction"].includes(
            prop.customerInfo?.propertyStatus
          )
        )
        .slice(0, 4) // Limit to 4 like static data
        .map((prop: any) => ({
          id: prop._id,
          name: prop.basicInfo?.projectName || "Unknown Property",
          location: prop.basicInfo?.projectName || "Unknown Location", // Fallback, add city field if available
          type: prop.basicInfo?.propertyType || "Unknown",
          units: prop.basicInfo?.totalUnits || 0,
          availableUnits:
            prop.customerInfo?.propertyStatus === "Available"
              ? prop.basicInfo?.totalUnits || 0
              : 0,
          price: `${formatCurrency(
            prop.basicInfo?.plotCost || 0
          )} - ${formatCurrency((prop.basicInfo?.plotCost || 0) * 1.5)}`,
          status: prop.customerInfo?.propertyStatus?.toLowerCase() || "listed",
          thumbnailUrl:
            prop.photos?.[0]?.secure_url ||
            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        }));
      setProperties(
        featuredProperties.length ? featuredProperties : fallbackProperties
      );

      // Fetch customers for sales
      const { data: customers } = await axios.get(
        `${import.meta.env.VITE_URL}/api/customer/getAllCustomers`,
        { withCredentials: true }
      );

      // Total Sales Value
      const totalSalesValue = customers.data.reduce(
        (sum: number, customer: any) => {
          return (
            sum +
            customer.properties.reduce((propSum: number, prop: any) => {
              if (prop.paymentStatus === "Completed") {
                return propSum + (prop.finalPrice || 0);
              }
              return propSum;
            }, 0)
          );
        },
        0
      );
      setTotalSales(totalSalesValue);

      // Fetch leads for active leads and activities
      const { data: leadsData } = await axios.get(
        `${import.meta.env.VITE_URL}/api/leads/getAllLeads`,
        { withCredentials: true }
      );

      // Active Leads
      const activeLeadCount = leadsData.leads.filter(
        (lead: any) => !["Closed", "Rejected"].includes(lead.propertyStatus)
      ).length;
      setActiveLeads(activeLeadCount);

      // Site Visits (assuming "Follow up" or notes containing "site visit")
      const siteVisitCount = leadsData.leads.filter(
        (lead: any) =>
          lead.propertyStatus === "Follow up" ||
          (lead.notes && lead.notes.toLowerCase().includes("site visit"))
      ).length;
      setSiteVisits(siteVisitCount);

      // Recent Activities
      const recentActivities = leadsData.leads
        .sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5) // Limit to 5 like static data
        .map((lead: any) => {
          const status = lead.propertyStatus;
          let action = "added a new lead for";
          let type: "approval" | "lead" | "visit" | "document" = "lead";
          if (status === "Closed") {
            action = "approved";
            type = "approval";
          } else if (
            status === "Follow up" ||
            lead.notes.toLowerCase().includes("site visit")
          ) {
            action = "scheduled a site visit for";
            type = "visit";
          } else if (status === "In Progress") {
            action = "updated progress for";
            type = "document";
          }
          return {
            id: lead._id,
            user: {
              name: lead.addedBy?.name || "Unknown User",
              avatar:
                lead.addedBy?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  lead.addedBy?.name || "Unknown"
                )}&background=4299E1&color=fff`,
            },
            action,
            target: lead.property?.basicInfo?.projectName || "Unknown Property",
            timestamp: formatTimestamp(lead.createdAt || new Date()),
            type,
          };
        });
      setActivities(
        recentActivities.length ? recentActivities : fallbackActivities
      );
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to load dashboard data");
      // Fallback to static data
      setTotalProperties(24);
      setTotalSales(214300000); // ₹21.43Cr
      setActiveLeads(147);
      setSiteVisits(38);
      setActivities(fallbackActivities);
      setProperties(fallbackProperties);
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
          <Link to="/sales" className="block">
            <StatCard
              title="Total Sales Value"
              value={formatCurrency(totalSales)}
              icon={<DollarSign className="h-6 w-6 text-estate-teal" />}
              trend={{ value: 8.2, isPositive: true }}
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
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <BarChart className="mr-2 h-5 w-5 text-estate-navy" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="flex flex-col space-y-4">
                  <div className="h-64 flex items-center justify-center bg-muted/50 rounded-md">
                    <BarChart3 className="h-16 w-16 text-estate-navy/20" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button
                      asChild
                      variant="outline"
                      className="h-auto py-4 flex flex-col"
                    >
                      <Link to="/analytics">
                        <BarChart className="h-6 w-6 mb-2 text-estate-navy" />
                        <span>Business Analytics</span>
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="h-auto py-4 flex flex-col"
                    >
                      <Link to="/users">
                        <Users className="h-6 w-6 mb-2 text-estate-teal" />
                        <span>User Management</span>
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="h-auto py-4 flex flex-col"
                    >
                      <Link to="/sales">
                        <DollarSign className="h-6 w-6 mb-2 text-estate-gold" />
                        <span>Sales Overview</span>
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="h-auto py-4 flex flex-col"
                    >
                      <Link to="/operations">
                        <Briefcase className="h-6 w-6 mb-2 text-estate-navy" />
                        <span>Operations</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <ActivityFeed activities={activities} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Featured Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} {...property} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default OwnerDashboard;
