import { useEffect, useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import { Users, Car, Calendar, CheckSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useVehicles } from "../CarAllocation";
import Loader from "@/components/Loader";
import { toast } from "sonner";
import axios from "axios";
import { TeamMember } from "../TeamManagement";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

const TeamLeadDashboard = () => {
  const [noOfVehicles, setNoOfVehicles] = useState(0);
  const [noOfTeamMem, setNoOfTeamMem] = useState(0);
  const { user } = useAuth();

  // Fetch vehicles
  const {
    data: vehicles,
    isLoading: vehicleLoad,
    isError: vehicleErr,
    error: vehicleError,
  } = useVehicles();

  // Fetch team
  const fetchMyTeam = async (): Promise<TeamMember[]> => {
    const { data } = await axios.get(
      `http://localhost:3000/api/team/getAllTeam/${user._id}`,
      { withCredentials: true }
    );
    return data || [];
  };

  const {
    data: teamMembers,
    isLoading: teamLoad,
    isError: teamErr,
    error: teamError,
  } = useQuery<TeamMember[]>({
    queryKey: ["teams", user?._id],
    queryFn: fetchMyTeam,
    enabled: !!user?._id,
  });

  // Fetch site visits by agents
  const fetchPendingSiteVisits = async () => {
    const res = await axios.get(
      "http://localhost:3000/api/siteVisit/getAllSiteVis",
      {
        withCredentials: true,
      }
    );
    return res.data.filter((v) => v.status === "pending");
  };

  const {
    data: pendingVisits,
    isLoading: siteVisitLoad,
    isError: siteVisitErr,
    error: siteVisitError,
  } = useQuery({
    queryKey: ["siteVisitsOfAgents"],
    queryFn: fetchPendingSiteVisits,
    enabled: !!user,
  });

  useEffect(() => {
    if (vehicles) {
      const available = vehicles.filter((v) => v.status === "available");
      setNoOfVehicles(available.length);
    }

    if (teamMembers) {
      setNoOfTeamMem(teamMembers.length);
    }
  }, [vehicles, teamMembers]);

  if (vehicleLoad || teamLoad || siteVisitLoad) return <Loader />;

  if (vehicleErr) {
    toast.error("Failed to fetch Vehicles");
    console.error(vehicleError);
  }

  if (teamErr) {
    toast.error("Failed to fetch Team");
    console.error(teamError);
  }

  if (siteVisitErr) {
    toast.error("Failed to fetch Site Visits");
    console.error(siteVisitError);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Team Lead Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your team and track agent activities
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Team Members"
          value={noOfTeamMem}
          icon={<Users className="h-6 w-6 text-estate-navy" />}
        />
        <StatCard
          title="Vehicles Available"
          value={noOfVehicles}
          icon={<Car className="h-6 w-6 text-estate-teal" />}
        />
        <StatCard
          title="Pending Site Visits"
          value={pendingVisits?.length || 0}
          icon={<Calendar className="h-6 w-6 text-estate-gold" />}
        />
        <StatCard
          title="Approvals Needed"
          value={pendingVisits?.length || 0}
          icon={<CheckSquare className="h-6 w-6 text-estate-error" />}
        />
      </div>

      {/* Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Pending Site Visit Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingVisits?.length === 0 ? (
                <p className="text-muted-foreground">No pending approvals</p>
              ) : (
                pendingVisits.map((visit) => (
                  <div
                    key={visit._id}
                    className="flex justify-between items-center p-4 border-b last:border-b-0"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={visit.bookedBy?.avatar} />
                        <AvatarFallback>
                          {visit.bookedBy?.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{visit.clientId?.name}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{visit.date}</span>
                          <span>•</span>
                          <span>{visit.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Requested by: {visit.bookedBy?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-estate-error"
                      >
                        Deny
                      </Button>
                      <Button
                        size="sm"
                        className="bg-estate-navy hover:bg-estate-navy/90"
                      >
                        Approve
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
        <ActivityFeed activities={[]} />
      </div>

      {/* Team Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {teamMembers?.map((member, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-20 w-20 mb-4">
                      <AvatarImage src={member?.agentId?.avatar} />
                      <AvatarFallback>
                        {member?.agentId?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-lg">
                      {member?.agentId?.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Sales Agent
                    </p>
                    <div className="grid grid-cols-3 gap-2 w-full">
                      <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                        <span className="text-lg font-bold">
                          {member?.performance?.leads || 0}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Leads
                        </span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                        <span className="text-lg font-bold">
                          {member?.performance?.target || 0}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Visits
                        </span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                        <span className="text-lg font-bold">
                          {member?.performance?.deals || 0}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Deals
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamLeadDashboard;
