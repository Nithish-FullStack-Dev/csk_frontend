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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import Loader from "@/components/Loader";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
    { withCredentials: false },
  );
  return data.data || [];
};

const TeamLeadManagement = () => {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState("performance");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [status, setStatus] = useState<"active" | "training" | "on-leave">(
    "active",
  );
  const [selectedTeam, setSelectedTeam] = useState<TeamMember | null>(null);
  const [selectedTeamLeadId, setSelectedAgentId] = useState("");
  const [performance, setPerformance] = useState({
    sales: 0,
    target: 0,
    deals: 0,
    leads: 0,
    conversionRate: 0,
    lastActivity: new Date().toISOString().slice(0, 16),
  });

  const queryClient = useQueryClient();

  const handlePerformanceChange = (field: string, value: string | number) => {
    setPerformance((prev) => {
      let updated = { ...prev, [field]: value };

      if (field === "deals" || field === "leads") {
        const deals = field === "deals" ? Number(value) : Number(updated.deals);
        const leads = field === "leads" ? Number(value) : Number(updated.leads);
        updated.conversionRate =
          leads > 0 ? Number(((deals / leads) * 100).toFixed(2)) : 0;
      }

      return updated;
    });
  };

  const fetchMyTeam = async (): Promise<TeamMember[]> => {
    const { data } = await axios.get(
      `${import.meta.env.VITE_URL}/api/teamLead/getAllSalesTeam`,
      { withCredentials: true },
    );
    return data || [];
  };

  useEffect(() => {
    if (selectedTeam) {
      setSelectedAgentId(selectedTeam.salesId._id);
      setStatus(selectedTeam.status);
      setPerformance({
        sales: selectedTeam.performance?.sales || 0,
        target: selectedTeam.performance?.target || 0,
        deals: selectedTeam.performance?.deals || 0,
        leads: selectedTeam.performance?.leads || 0,
        conversionRate: selectedTeam.performance?.conversionRate || 0,
        lastActivity: selectedTeam.performance?.lastActivity
          ? new Date(selectedTeam.performance.lastActivity)
              .toISOString()
              .slice(0, 16)
          : new Date().toISOString().slice(0, 16),
      });
    } else {
      // Reset form when dialog opens for adding a new member
      setSelectedAgentId("");
      setStatus("active");
      setPerformance({
        sales: 0,
        target: 0,
        deals: 0,
        leads: 0,
        conversionRate: 0,
        lastActivity: new Date().toISOString().slice(0, 16),
      });
    }
  }, [selectedTeam]);

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
    data: availableAgents,
    isLoading: isTeamMemLoading,
    isError: teamMemError,
    error: isTeamMemErr,
  } = useQuery<User[]>({
    queryKey: ["unassignedAgents"],
    queryFn: fetchUnassignedMem,
    staleTime: 0,
  });

  const addTeamMemberMutation = useMutation({
    mutationFn: async ({
      salesId, // This is the ID of the agent being added to the team
      status,
      performance,
      teamLeadId, // This is the ID of the current logged-in user (the team lead)
    }: {
      salesId: string;
      status: "active" | "training" | "on-leave";
      performance: {
        sales: number;
        target: number;
        deals: number;
        leads: number;
        conversionRate: number;
        lastActivity: string;
      };
      teamLeadId: string;
    }) => {
      const { data } = await axios.post(
        `${import.meta.env.VITE_URL}/api/teamLead/addTeamLead`,
        { salesId, teamLeadId, performance, status },
        { withCredentials: true },
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Team member added successfully!");
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["unassignedAgents"] });
      setDialogOpen(false);
      setSelectedAgentId("");
      setStatus("active");
      setPerformance({
        sales: 0,
        target: 0,
        deals: 0,
        leads: 0,
        conversionRate: 0,
        lastActivity: new Date().toISOString().slice(0, 16),
      });
    },
    onError: (err: any) => {
      const errorMessage =
        err.response?.data?.message || "Failed to add team member.";
      toast.error(errorMessage);
    },
  });

  const updateTeamMemberMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      performance,
    }: {
      id: string;
      status: "active" | "training" | "on-leave";
      performance: {
        sales: number;
        target: number;
        deals: number;
        leads: number;
        conversionRate: number;
        lastActivity: string;
      };
    }) => {
      const { data } = await axios.patch(
        `${import.meta.env.VITE_URL}/api/teamLead/updateTeamLead/${id}`,
        {
          status,
          performance,
        },
        { withCredentials: true },
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Team member updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["unassignedAgents"] });
      setDialogOpen(false);
      setSelectedTeam(null);
    },
    onError: (err: any) => {
      const errorMessage =
        err.response?.data?.message || "Failed to update team member.";
      toast.error(errorMessage);
    },
  });

  const deleteTeamMemberMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete(
        `${import.meta.env.VITE_URL}/api/teamLead/deleteTeamLead/${id}`,
        { withCredentials: true },
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Team member removed successfully!");
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["unassignedAgents"] });
      setDialogOpen(false);
      setSelectedTeam(null);
    },
    onError: (err: any) => {
      const errorMessage =
        err.response?.data?.message || "Failed to remove team member.";
      toast.error(errorMessage);
    },
  });

  const {
    isRolePermissionsLoading,
    userCanAddUser,
    userCanDeleteUser,
    userCanEditUser,
  } = useRBAC({ roleSubmodule: "Team Management" });

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

  if (isLoading || isTeamMemLoading || isRolePermissionsLoading)
    return <Loader />;

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

  const handleAddMemberSubmit = () => {
    if (!selectedTeamLeadId) {
      toast.error("Please select a team member.");
      return;
    }

    const payload = {
      salesId: user?._id || "",
      status,
      performance,
      teamLeadId: selectedTeamLeadId,
    };

    if (selectedTeam?._id) {
      updateTeamMemberMutation.mutate({
        id: selectedTeam._id,
        status,
        performance,
      });
    } else {
      // Add new member
      if (user?._id) {
        addTeamMemberMutation.mutate(payload);
      } else {
        toast.error("User not authenticated.");
      }
    }
  };

  const handleDelete = () => {
    if (!selectedTeam?._id) {
      toast.error("No team member selected for removal.");
      return;
    }

    if (confirm("Are you sure you want to remove this team member?")) {
      deleteTeamMemberMutation.mutate(selectedTeam._id);
    }
  };

  const sortedAndFilteredTeamMembers = teamMembers
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
            {userCanAddUser && (
              <Button
                onClick={() => {
                  setSelectedTeam(null); // Clear selectedTeam for "Add Member"
                  setDialogOpen(true);
                }}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            )}
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
                    {userCanEditUser && (
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
                    )}
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
                      href={`mailto:${member.teamLeadId.email}`}
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-estate-navy" />
              Team Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-medium">Top Performers</h4>
                <div className="space-y-1">
                  {teamMembers
                    ?.sort(
                      (a, b) =>
                        b.performance.sales / b.performance.target -
                        a.performance.sales / a.performance.target,
                    )
                    .slice(0, 3)
                    .map((member, index) => (
                      <div
                        key={member._id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>
                          {index + 1}. {member.teamLeadId?.name}
                        </span>
                        <span className="font-medium">
                          {(
                            (member.performance.sales /
                              member.performance.target) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Recent Activities</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>• Emily closed 2 deals yesterday</p>
                  <p>• Robert scheduled 5 site visits</p>
                  <p>• David added 8 new leads</p>
                  <p>• Lisa completed sales training</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[425px] max-w-[90vw] max-h-[90vh] rounded-xl overflow-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedTeam ? "Edit Team Member" : "Add New Team Member"}
              </DialogTitle>
              <DialogDescription>
                {selectedTeam
                  ? "Update team member details and performance."
                  : "Select a sales agent, assign status, and optionally set performance metrics."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="agent" className="text-right">
                  Team Lead
                </Label>
                <Select
                  onValueChange={setSelectedAgentId}
                  value={selectedTeamLeadId}
                  disabled={!!selectedTeam}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue>
                      {availableAgents?.find(
                        (agent) => agent._id === selectedTeamLeadId,
                      )?.name || "Select a team lead"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {availableAgents?.map((agent) => (
                      <SelectItem key={agent._id} value={agent._id}>
                        {agent.name} ({agent.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={status}
                  onValueChange={(value) =>
                    setStatus(value as "active" | "training" | "on-leave")
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="on-leave">On-Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {[
                { key: "sales", label: "Selling Price" },
                { key: "target", label: "Target Price" },
                { key: "deals", label: "Closed Deals" },
                { key: "leads", label: "Interested Leads" },
              ].map(({ key, label }) => (
                <div className="grid grid-cols-4 items-center gap-4" key={key}>
                  {" "}
                  <Label htmlFor={key} className="text-right capitalize">
                    {label}
                  </Label>{" "}
                  <Input
                    type="number"
                    id={key}
                    value={performance[key as keyof typeof performance]}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (value >= 0 || isNaN(value)) {
                        handlePerformanceChange(key, value);
                        if (key === "deals" || key === "leads") {
                          const updatedDeals =
                            key === "deals" ? value : performance.deals || 0;
                          const updatedLeads =
                            key === "leads" ? value : performance.leads || 0;

                          const newRate =
                            updatedLeads > 0
                              ? (updatedDeals / updatedLeads) * 100
                              : 0;

                          handlePerformanceChange(
                            "conversionRate",
                            parseFloat(newRate.toFixed(2)),
                          );
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      if (["-", "e"].includes(e.key)) e.preventDefault();
                    }}
                    min={0}
                    className="col-span-3"
                  />{" "}
                </div>
              ))}

              {/* Render conversionRate as read-only */}
              <div className="grid grid-cols-4 items-center gap-4">
                {" "}
                <Label htmlFor="conversionRate" className="text-right">
                  Conversion Rate{" "}
                </Label>{" "}
                <Input
                  type="number"
                  id="conversionRate"
                  value={performance.conversionRate}
                  readOnly
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="lastActivity" className="text-right">
                  Last Activity
                </Label>
                <Input
                  type="datetime-local"
                  id="lastActivity"
                  value={performance.lastActivity}
                  onChange={(e) =>
                    handlePerformanceChange("lastActivity", e.target.value)
                  }
                  className="col-span-3"
                />
              </div>
            </div>

            <DialogFooter>
              {userCanDeleteUser && selectedTeam && (
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteTeamMemberMutation.isPending}
                >
                  {deleteTeamMemberMutation.isPending
                    ? "Deleting..."
                    : "Delete Member"}
                </Button>
              )}
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddMemberSubmit}
                disabled={
                  addTeamMemberMutation.isPending || !selectedTeamLeadId
                }
              >
                {selectedTeam
                  ? updateTeamMemberMutation.isPending
                    ? "Updating..."
                    : "Update Member"
                  : addTeamMemberMutation.isPending
                    ? "Adding..."
                    : "Add Member"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default TeamLeadManagement;
