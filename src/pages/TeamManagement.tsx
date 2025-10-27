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
} from "lucide-react";
import { useState, useEffect } from "react";
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
import { Permission } from "@/types/permission";
import { fetchRolePermissions } from "./UserManagement";

export interface TeamMember {
  _id: string;
  agentId: User;
  teamLeadId: User;
  status: "active" | "training" | "inactive" | "on-leave";
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
    `${import.meta.env.VITE_URL}/api/team/unassigned`,
    { withCredentials: false }
  );
  return data.data || [];
};

const TeamManagement = () => {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState("performance");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const [status, setStatus] = useState<"active" | "training" | "on-leave">(
    "active"
  );
  const [agentId, setAgentId] = useState("");
  const [performance, setPerformance] = useState({
    sales: 0,
    target: 0,
    deals: 0,
    leads: 0,
    conversionRate: 0,
    lastActivity: new Date().toISOString().slice(0, 16),
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (editingMember) {
      setAgentId(editingMember.agentId._id);
      setStatus(editingMember.status as "active" | "training" | "on-leave");
      setPerformance(editingMember.performance);
    } else {
      // Reset form when not editing or dialog is closed
      setAgentId("");
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
  }, [editingMember]);

  const handlePerformanceChange = (field: string, value: string | number) => {
    setPerformance((prev) => {
      let newPerformance = { ...prev, [field]: value };

      if (field === "deals" || field === "leads") {
        const deals =
          field === "deals" ? Number(value) : Number(newPerformance.deals);
        const leads =
          field === "leads" ? Number(value) : Number(newPerformance.leads);
        newPerformance.conversionRate =
          leads > 0 ? Number(((deals / leads) * 100).toFixed(2)) : 0;
      }

      return newPerformance;
    });
  };

  const fetchMyTeam = async (): Promise<TeamMember[]> => {
    const { data } = await axios.get(
      `${import.meta.env.VITE_URL}/api/team/getAllTeam/${user._id}`,
      { withCredentials: true }
    );
    return data || [];
  };

  const {
    data: rolePermissions,
    isLoading: isRolePermissionsLoading,
    error: rolePermissionsError,
    isError: isRolePermissionsError,
  } = useQuery<Permission>({
    queryKey: ["rolePermissions", user?.role],
    queryFn: () => fetchRolePermissions(user?.role as string),
    enabled: !!user?.role,
  });

  const {
    data: teamMembers,
    isLoading,
    isError,
    error,
  } = useQuery<TeamMember[]>({
    queryKey: ["teams", user?._id],
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
      agentId,
      status,
      performance,
      teamLeadId,
    }: {
      agentId: string;
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
        `${import.meta.env.VITE_URL}/api/team/addTeamMember`,
        { agentId, status, performance, teamLeadId },
        { withCredentials: true }
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Team member added successfully!");
      queryClient.invalidateQueries({ queryKey: ["teams", user?._id] });
      queryClient.invalidateQueries({ queryKey: ["unassignedAgents"] });
      setDialogOpen(false);
      setAgentId("");
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
      memberId,
      status,
      performance,
    }: {
      memberId: string;
      status: "active" | "training" | "inactive" | "on-leave";
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
        `${import.meta.env.VITE_URL}/api/team/updateTeam/${memberId}`,
        { status, performance },
        { withCredentials: true }
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Team member updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["teams", user?._id] });
      setDialogOpen(false);
      setIsEditing(false);
      setEditingMember(null);
    },
    onError: (err: any) => {
      const errorMessage =
        err.response?.data?.message || "Failed to update team member.";
      toast.error(errorMessage);
    },
  });

  const deleteTeamMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { data } = await axios.delete(
        `${import.meta.env.VITE_URL}/api/team/deleteTeam/${memberId}`,
        { withCredentials: true }
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Team member removed successfully!");
      queryClient.invalidateQueries({ queryKey: ["teams", user?._id] });
      queryClient.invalidateQueries({ queryKey: ["unassignedAgents"] });
      setDialogOpen(false);
      setIsEditing(false);
      setEditingMember(null);
    },
    onError: (err: any) => {
      const errorMessage =
        err.response?.data?.message || "Failed to remove team member.";
      toast.error(errorMessage);
    },
  });

  if (isRolePermissionsError) {
    console.error("Error fetching role permissions:", rolePermissionsError);
    toast.error("Failed to load role permissions");
  }

  if (isLoading || isTeamMemLoading || isRolePermissionsLoading)
    return <Loader />;
  if (isError) {
    toast.error("Failed to fetch Team");
    console.error("fetch error:", error);
  }
  if (teamMemError) {
    toast.error("Failed to fetch unassigned team members");
    console.error("fetch error:", isTeamMemErr);
  }

  const userCanAddUser = rolePermissions?.permissions.some(
    (per) => per.submodule === "My Team" && per.actions.write
  );

  const userCanEditUser = rolePermissions?.permissions?.some(
    (per) => per.submodule === "My Team" && per?.actions?.edit
  );

  const userCanDeleteUser = rolePermissions?.permissions?.some(
    (per) => per.submodule === "My Team" && per?.actions?.delete
  );

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

  const handleAddOrEditMemberSubmit = () => {
    if (isEditing) {
      if (editingMember) {
        updateTeamMemberMutation.mutate({
          memberId: editingMember._id,
          status,
          performance,
        });
      }
    } else {
      if (!agentId) {
        toast.error("Please select an agent.");
        return;
      }
      if (user?._id) {
        addTeamMemberMutation.mutate({
          agentId,
          status,
          performance,
          teamLeadId: user._id,
        });
      } else {
        toast.error("User not authenticated.");
      }
    }
  };

  const handleRemoveMember = (id: string) => {
    deleteTeamMemberMutation.mutate(id);
  };

  const handleOpenAddDialog = () => {
    setIsEditing(false);
    setEditingMember(null); // Clear any previous editing data
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (member: TeamMember) => {
    setIsEditing(true);
    setEditingMember(member);
    setDialogOpen(true);
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
        return a.agentId.name.localeCompare(b.agentId.name);
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
              Manage your team lead team and track their performance
            </p>
          </div>
          <div className="flex md:items-center items-start space-x-2 mt-4 md:mt-0 md:flex-row flex-col gap-5">
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
              <Button onClick={handleOpenAddDialog}>
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
                  ₹{(totalTeamSales / 1000000).toFixed(1)}M
                </span>
                <DollarSign className="h-6 w-6 text-estate-gold" />
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
                          src={member?.agentId?.avatar}
                          alt={member?.agentId?.name}
                        />
                        <AvatarFallback>
                          {member?.agentId?.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">
                          {member?.agentId?.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {member?.agentId?.role}
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
                        onClick={() => handleOpenEditDialog(member)}
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
                        member.performance.lastActivity
                      ).toLocaleDateString()}{" "}
                      {new Date(
                        member.performance.lastActivity
                      ).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <a href={`tel:${user.phone}`}>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Phone className="mr-2 h-3 w-3" />
                        Call
                      </Button>
                    </a>
                    <a
                      href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                        user.email
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button size="sm" variant="outline" className="flex-1">
                        <Mail className="mr-2 h-3 w-3" />
                        Email
                      </Button>
                    </a>
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
                        a.performance.sales / a.performance.target
                    )
                    .slice(0, 3)
                    .map((member, index) => (
                      <div
                        key={member._id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>
                          {index + 1}. {member.agentId?.name}
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

              <div className="space-y-2">
                <h4 className="font-medium">Quick Actions</h4>
                <div className="space-y-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Calendar className="mr-2 h-3 w-3" />
                    Schedule Team Meeting
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <BarChart3 className="mr-2 h-3 w-3" />
                    Generate Team Report
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Target className="mr-2 h-3 w-3" />
                    Set Team Goals
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="md:w-[600px] w-[90vw] max-h-[80vh] overflow-auto rounded-xl">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Team Member" : "Add New Team Member"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Update the details for this team member."
                  : "Select an agent, assign status, and optionally set performance metrics."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="agent" className="text-right">
                  Agent
                </Label>
                <Select
                  onValueChange={setAgentId}
                  value={agentId}
                  disabled={isEditing}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select an agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAgents?.map((agent) => (
                      <SelectItem key={agent._id} value={agent._id}>
                        {agent?.name} ({agent?.email})
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
                    {isEditing && ( // Allow selecting 'inactive' only when editing
                      <SelectItem value="inactive">Inactive</SelectItem>
                    )}
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
                  <Label htmlFor={key} className="text-right">
                    {label}
                  </Label>
                  <Input
                    type="number"
                    id={key}
                    value={performance[key as keyof typeof performance] ?? 0}
                    onChange={(e) =>
                      handlePerformanceChange(
                        key,
                        Math.max(0, Number(e.target.value))
                      )
                    }
                    className="col-span-3"
                    min={0}
                  />
                </div>
              ))}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="conversionRate" className="text-right">
                  Conversion Rate
                </Label>
                <Input
                  id="conversionRate"
                  className="col-span-3"
                  type="number"
                  value={performance.conversionRate}
                  readOnly
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="lastActivity" className="text-right">
                  Last Activity
                </Label>
                <Input
                  type="datetime-local"
                  id="lastActivity"
                  value={performance.lastActivity.slice(0, 16)} // Ensure format for datetime-local
                  onChange={(e) =>
                    handlePerformanceChange("lastActivity", e.target.value)
                  }
                  className="col-span-3"
                />
              </div>
            </div>

            <DialogFooter>
              {isEditing && userCanDeleteUser && (
                <Button
                  variant="destructive"
                  onClick={() => handleRemoveMember(editingMember?._id!)}
                  disabled={deleteTeamMemberMutation.isPending}
                >
                  {deleteTeamMemberMutation.isPending
                    ? "Removing..."
                    : "Remove Member"}
                </Button>
              )}
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddOrEditMemberSubmit}
                disabled={
                  addTeamMemberMutation.isPending ||
                  updateTeamMemberMutation.isPending ||
                  (!isEditing && !agentId)
                }
              >
                {isEditing
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

export default TeamManagement;
