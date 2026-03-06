import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Target,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  UserPlus,
  Settings,
  BarChart3,
  Award,
  IndianRupee,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import Loader from "@/components/Loader";
import { toast } from "sonner";
import { useRBAC } from "@/config/RBAC";

export interface TeamMember {
  _id: string;
  salesId: User; // This is the sales agent user
  teamLeadId: User; // This is the actual team lead user (the manager)
  status: "active" | "training" | "on-leave";
  performance: {
    sales: number;
    target: number;
    deals: number;
    leads: number;
    conversionRate: number;
    lastActivity: string;
  };
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

const fetchUnassignedMem = async (): Promise<User[]> => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/teamLead/unassigned`,
    { withCredentials: true },
  );
  return data.data || [];
};

const AdminTeamLead = () => {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState("performance");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchMyTeam = async (): Promise<TeamMember[]> => {
    const { data } = await axios.get(
      `${import.meta.env.VITE_URL}/api/teamLead/getAllTeamLeads`,
      { withCredentials: true },
    );
    return data || [];
  };

  const {
    data: teamMembers,
    isLoading,
    isError,
    error,
  } = useQuery<TeamMember[]>({
    queryKey: ["teams"],
    queryFn: fetchMyTeam,
    staleTime: 0,
    enabled: !!user?._id,
  });

  const {
    data: availableAgentsRaw,
    isLoading: isTeamMemLoading,
    isError: teamMemError,
    error: isTeamMemErr,
  } = useQuery<User[]>({
    queryKey: ["unassignedAgents"],
    queryFn: fetchUnassignedMem,
    staleTime: 0,
  });

  const safeTeamMembers = (teamMembers ?? []).filter(
    (member): member is TeamMember =>
      !!member &&
      !!member._id &&
      !!member.teamLeadId &&
      !!member.teamLeadId.email &&
      !!member.performance,
  );

  if (isError) {
    toast.error("Failed to fetch Team");
    console.error("fetch error:", error);
    return null;
  }
  if (teamMemError) {
    toast.error("Failed to fetch unassigned team members");
    console.error("fetch error:", isTeamMemErr);
    return null;
  }

  if (isLoading || isTeamMemLoading) return <Loader />;

  const getStatusColor = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      training: "bg-yellow-100 text-yellow-800",
      inactive: "bg-red-100 text-red-800",
      "on-leave": "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 90)
      return { level: "Excellent", color: "text-green-600" };
    if (percentage >= 75) return { level: "Good", color: "text-blue-600" };
    if (percentage >= 60) return { level: "Average", color: "text-yellow-600" };
    return { level: "Needs Improvement", color: "text-red-600" };
  };

  const totalTeamSales =
    teamMembers?.reduce((sum, member) => sum + member.performance.sales, 0) ||
    0;
  const totalTeamTarget =
    teamMembers?.reduce((sum, member) => sum + member.performance.target, 0) ||
    0;
  const teamPerformance =
    totalTeamTarget > 0 ? (totalTeamSales / totalTeamTarget) * 100 : 0;

  const sortedAndFilteredTeamMembers = safeTeamMembers
    ?.filter((member) => {
      if (filterStatus === "all") return true;
      return member.status === filterStatus;
    })
    .sort((a, b) => {
      if (sortBy === "performance") {
        const perfA = (a.performance.sales / a.performance.target) * 100 || 0;
        const perfB = (b.performance.sales / b.performance.target) * 100 || 0;
        return perfB - perfA;
      }
      if (sortBy === "sales") {
        return b.performance.sales - a.performance.sales;
      }
      if (sortBy === "deals") {
        return b.performance.deals - a.performance.deals;
      }
      if (sortBy === "name") {
        return a.salesId.name.localeCompare(b.salesId.name);
      }
      return 0;
    });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold">Team Management</h1>
            <p className="text-muted-foreground">
              Manage your sales team and track their performance
            </p>
          </div>
          <div className="flex md:items-center space-x-2 mt-4 md:mt-0 md:flex-row flex-col items-start gap-5">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="sales">Sales Volume</SelectItem>
                <SelectItem value="deals">Deals Closed</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Team Size
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {teamMembers?.length}
                </span>
                <Users className="h-6 w-6 text-estate-navy" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Team Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {teamPerformance.toFixed(1)}%
                </span>
                <Target className="h-6 w-6 text-estate-teal" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  ₹
                  {totalTeamSales.toLocaleString("en-IN", {
                    maximumFractionDigits: 0,
                  })}
                </span>
                <IndianRupee className="h-6 w-6 text-estate-gold" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {teamMembers?.filter((m) => m.status === "active").length}
                </span>
                <Award className="h-6 w-6 text-estate-success" />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedAndFilteredTeamMembers?.map((member) => {
            const performancePercentage =
              (member.performance.sales / member.performance.target) * 100;
            const performanceLevel = getPerformanceLevel(performancePercentage);

            return (
              <Card key={member._id}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={member?.teamLeadId?.avatar}
                          alt={member?.teamLeadId?.name}
                        />
                        <AvatarFallback>
                          {member?.teamLeadId?.name
                            ? member.teamLeadId.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                            : "UN"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">
                          {member?.teamLeadId?.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {member?.teamLeadId?.role}
                        </p>
                        <Badge className={getStatusColor(member?.status)}>
                          {member?.status}
                        </Badge>
                      </div>
                    </div>
                    {/* {userCanEditUser && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedTeam(member);
                          setDialogOpen(true);
                        }}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    )} */}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Sales</p>
                      <p className="font-semibold">
                        ₹
                        {member.performance.sales.toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Target</p>
                      <p className="font-semibold">
                        ₹
                        {member.performance.target.toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Deals</p>
                      <p className="font-semibold">
                        {member.performance.deals}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Conversion</p>
                      <p className="font-semibold">
                        {member.performance.conversionRate}%
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Target Achievement</span>
                      <span className={performanceLevel.color}>
                        {performanceLevel.level}
                      </span>
                    </div>
                    <Progress value={performancePercentage} className="h-2" />
                    <p className="text-xs text-muted-foreground text-right">
                      {performancePercentage.toFixed(1)}% of target
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Last activity:{" "}
                      {new Date(
                        member.performance.lastActivity,
                      ).toLocaleDateString()}{" "}
                      {new Date(
                        member.performance.lastActivity,
                      ).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="flex md:flex-row flex-col gap-2 w-full">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Phone className="mr-2 h-3 w-3" /> Call
                    </Button>
                    <a
                      href={`mailto:${member?.teamLeadId?.email}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button size="sm" variant="outline" className="w-full">
                        <Mail className="mr-2 h-3 w-3" />
                        Email
                      </Button>
                    </a>
                    {/* <div className="flex-1">
                      <Button size="sm" variant="outline" className="w-full">
                        <BarChart3 className="mr-2 h-3 w-3" />
                        Report
                      </Button>
                    </div> */}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminTeamLead;
