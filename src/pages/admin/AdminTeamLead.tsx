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
import { Users, Target, Phone, Mail, Award, IndianRupee } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import Loader from "@/components/Loader";
import { toast } from "sonner";

export interface TeamMember {
  _id: string;
  salesId?: User | null;
  teamLeadId?: User | null;
  status: "active" | "training" | "on-leave" | "inactive";
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

const AdminTeamLead = () => {
  const { user } = useAuth();

  const [sortBy, setSortBy] = useState("performance");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchMyTeam = async (): Promise<TeamMember[]> => {
    const { data } = await axios.get(
      `${import.meta.env.VITE_URL}/api/teamLead/getAllTeamLeads`,
      { withCredentials: true },
    );

    return Array.isArray(data) ? data : [];
  };

  const {
    data: teamMembers = [],
    isLoading,
    isError,
    error,
  } = useQuery<TeamMember[]>({
    queryKey: ["teams"],
    queryFn: fetchMyTeam,
    enabled: !!user?._id,
    staleTime: 0,
  });

  if (isError) {
    toast.error("Failed to fetch team data");
    console.error(error);
    return null;
  }

  if (isLoading) return <Loader />;

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

  const totalTeamSales = teamMembers.reduce(
    (sum, member) => sum + (member?.performance?.sales || 0),
    0,
  );

  const totalTeamTarget = teamMembers.reduce(
    (sum, member) => sum + (member?.performance?.target || 0),
    0,
  );

  const teamPerformance =
    totalTeamTarget > 0 ? (totalTeamSales / totalTeamTarget) * 100 : 0;

  const filteredMembers = teamMembers
    .filter((member) => {
      if (filterStatus === "all") return true;
      return member.status === filterStatus;
    })
    .sort((a, b) => {
      if (sortBy === "performance") {
        const aVal =
          ((a.performance?.sales || 0) / (a.performance?.target || 1)) * 100;
        const bVal =
          ((b.performance?.sales || 0) / (b.performance?.target || 1)) * 100;
        return bVal - aVal;
      }

      if (sortBy === "sales") {
        return (b.performance?.sales || 0) - (a.performance?.sales || 0);
      }

      if (sortBy === "deals") {
        return (b.performance?.deals || 0) - (a.performance?.deals || 0);
      }

      if (sortBy === "name") {
        const nameA = a.teamLeadId?.name || a.salesId?.name || "Unknown";

        const nameB = b.teamLeadId?.name || b.salesId?.name || "Unknown";

        return nameA.localeCompare(nameB);
      }

      return 0;
    });

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Team Management</h1>
            <p className="text-muted-foreground">
              Manage your sales team and track performance
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="deals">Deals</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card>
            <CardContent className="p-5 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Team Size</p>
                <h2 className="text-2xl font-bold">{teamMembers.length}</h2>
              </div>
              <Users />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Performance</p>
                <h2 className="text-2xl font-bold">
                  {teamPerformance.toFixed(1)}%
                </h2>
              </div>
              <Target />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Sales</p>
                <h2 className="text-2xl font-bold">
                  ₹{totalTeamSales.toLocaleString("en-IN")}
                </h2>
              </div>
              <IndianRupee />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <h2 className="text-2xl font-bold">
                  {teamMembers.filter((m) => m.status === "active").length}
                </h2>
              </div>
              <Award />
            </CardContent>
          </Card>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredMembers.map((member) => {
            const name =
              member.teamLeadId?.name || member.salesId?.name || "Unknown User";

            const email =
              member.teamLeadId?.email || member.salesId?.email || "No Email";

            const avatar =
              member.teamLeadId?.avatar || member.salesId?.avatar || "";

            const role =
              member.teamLeadId?.role || member.salesId?.role || "User";

            const performance =
              ((member.performance?.sales || 0) /
                (member.performance?.target || 1)) *
              100;

            const level = getPerformanceLevel(performance);

            return (
              <Card key={member._id}>
                <CardHeader>
                  <div className="flex justify-between">
                    <div className="flex gap-3 items-center">
                      <Avatar>
                        <AvatarImage src={avatar} />
                        <AvatarFallback>
                          {name?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <CardTitle className="text-lg">{name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{role}</p>
                        <Badge className={getStatusColor(member.status)}>
                          {member.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Sales</p>
                      <p className="font-semibold">
                        ₹{member.performance.sales.toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div>
                      <p className="text-muted-foreground">Target</p>
                      <p className="font-semibold">
                        ₹{member.performance.target.toLocaleString("en-IN")}
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

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Achievement</span>
                      <span className={level.color}>{level.level}</span>
                    </div>

                    <Progress value={performance} className="h-2" />

                    <p className="text-xs text-right mt-1 text-muted-foreground">
                      {performance.toFixed(1)}%
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Last Activity:{" "}
                    {member.performance.lastActivity
                      ? new Date(
                          member.performance.lastActivity,
                        ).toLocaleString()
                      : "N/A"}
                  </p>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>

                    <a href={`mailto:${email}`} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full">
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </Button>
                    </a>
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
