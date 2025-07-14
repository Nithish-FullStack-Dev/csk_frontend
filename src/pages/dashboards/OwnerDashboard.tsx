
import { useState } from "react";
import { Link } from "react-router-dom";
import StatCard from "@/components/dashboard/StatCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import PropertyCard, { PropertyCardProps } from "@/components/dashboard/PropertyCard";
import { BarChart3, Building, DollarSign, Users, Calendar, BarChart, FileText, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";

// Sample data
const recentActivities = [
  {
    id: "1",
    user: {
      name: "Sarah Johnson",
      avatar: "https://ui-avatars.com/api/?name=Rakshit+Agarwal&background=2C7A7B&color=fff",
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
      avatar: "https://ui-avatars.com/api/?name=Michael+Brown&background=ECC94B&color=1A365D",
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
      avatar: "https://ui-avatars.com/api/?name=Emily+Davis&background=718096&color=fff",
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
      avatar: "https://ui-avatars.com/api/?name=Robert+Wilson&background=38A169&color=fff",
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
      avatar: "https://ui-avatars.com/api/?name=Jennifer+Martinez&background=4299E1&color=fff",
    },
    action: "completed milestone inspection for",
    target: "Parkview Residences",
    timestamp: "yesterday",
    type: "approval" as const,
  },
];

const properties: PropertyCardProps[] = [
  {
    id: "1",
    name: "Skyline Towers",
    location: "Downtown, Metro City",
    type: "Apartment Complex",
    units: 120,
    availableUnits: 45,
    price: "₹250,000 - ₹450,000",
    status: "listed",
    thumbnailUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "2",
    name: "Parkview Residences",
    location: "East Side, Metro City",
    type: "Condominiums",
    units: 80,
    availableUnits: 12,
    price: "₹320,000 - ₹550,000",
    status: "under-construction",
    thumbnailUrl: "https://images.unsplash.com/photo-1564013434775-f71db0030976?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "3",
    name: "Riverside Apartments",
    location: "River District, Metro City",
    type: "Luxury Apartments",
    units: 60,
    availableUnits: 20,
    price: "₹400,000 - ₹750,000",
    status: "listed",
    thumbnailUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "4",
    name: "Golden Heights Phase 2",
    location: "North Hills, Metro City",
    type: "Villas",
    units: 40,
    availableUnits: 28,
    price: "₹600,000 - $₹,200,000",
    status: "under-construction",
    thumbnailUrl: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
  },
];

const OwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Executive Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your business summary
          </p>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto mt-4 md:mt-0">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/analytics" className="block">
          <StatCard
            title="Total Properties"
            value="24"
            icon={<Building className="h-6 w-6 text-estate-navy" />}
            trend={{ value: 12.5, isPositive: true }}
          />
        </Link>
        <Link to="/sales" className="block">
          <StatCard
            title="Total Sales Value"
            value="₹214.3M"
            icon={<DollarSign className="h-6 w-6 text-estate-teal" />}
            trend={{ value: 8.2, isPositive: true }}
          />
        </Link>
        <Link to="/users" className="block">
          <StatCard
            title="Active Leads"
            value="147"
            icon={<Users className="h-6 w-6 text-estate-gold" />}
            trend={{ value: 4.1, isPositive: true }}
          />
        </Link>
        <Link to="/operations" className="block">
          <StatCard
            title="Site Visits"
            value="38"
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
                  <Button asChild variant="outline" className="h-auto py-4 flex flex-col">
                    <Link to="/analytics">
                      <BarChart className="h-6 w-6 mb-2 text-estate-navy" />
                      <span>Business Analytics</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto py-4 flex flex-col">
                    <Link to="/users">
                      <Users className="h-6 w-6 mb-2 text-estate-teal" />
                      <span>User Management</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto py-4 flex flex-col">
                    <Link to="/sales">
                      <DollarSign className="h-6 w-6 mb-2 text-estate-gold" />
                      <span>Sales Overview</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto py-4 flex flex-col">
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
        <ActivityFeed activities={recentActivities} />
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
  );
};

export default OwnerDashboard;
