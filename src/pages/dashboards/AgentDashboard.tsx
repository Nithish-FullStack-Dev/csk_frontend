import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import StatCard from "@/components/dashboard/StatCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import {
  UserPlus,
  Calendar,
  MapPin,
  Clock,
  PhoneCall,
  Users,
  FileText,
  CreditCard,
  Car,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import axios from "axios";
import { fetchLeads, Lead } from "../agent/LeadManagement";
import { useAuth } from "@/contexts/AuthContext";
// import  from "../agent/SiteVisits";
import Loader from "@/components/Loader";
import { SiteVisitData } from "../agent/SiteVisits";
import MainLayout from "@/components/layout/MainLayout";

const AgentDashboard = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchSiteVisitsOfAgent = async () => {
    const { data } = await axios.get(
      `${import.meta.env.VITE_URL}/api/siteVisit/getSiteVisitById/${user?._id}`,
      { withCredentials: true }
    );
    return data;
  };
  const isAgent = user && user.role === "agent";

  const {
    data: siteVisitOfAgent = [],
    isLoading: agentLoading,
    isError: agentError,
    error: agentErr,
  } = useQuery<SiteVisitData[]>({
    queryKey: ["siteVisitOfAgent", user?._id], // Include user ID in query key
    queryFn: fetchSiteVisitsOfAgent,
    enabled: !!user?._id && isAgent, // Only run if user is agent and user ID exists
    staleTime: 0,
  });

  const { data: leads = [] } = useQuery<Lead[]>({
    queryKey: ["leads"],
    queryFn: fetchLeads,
  });

  const handleBookingSiteVisit = () => {
    toast.success("Site visit booking initiated. Please complete the form.");
    setIsBookingOpen(true);
  };

  if (agentLoading) {
    return <Loader />;
  }

  if (agentError) {
    toast.error("Failed to fetch agent's site visits.");
    console.error("Fetch agent site visits error:", agentErr);
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Agent Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your leads and schedule
            </p>
          </div>
          <Button
            onClick={handleBookingSiteVisit}
            className="bg-estate-gold hover:bg-estate-gold/90 text-white"
            size="lg"
          >
            <MapPin className="mr-2 h-5 w-5" /> Book Site Visit
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {[
            {
              label: "Lead Management",
              description: "Manage prospects",
              icon: <UserPlus className="mr-2 h-5 w-5 text-estate-navy" />,
              link: "/leads",
            },
            {
              label: "My Schedule",
              description: "View appointments",
              icon: <Calendar className="mr-2 h-5 w-5 text-estate-teal" />,
              link: "/schedule",
            },
            {
              label: "Site Visits",
              description: "Car allocation",
              icon: <Car className="mr-2 h-5 w-5 text-estate-gold" />,
              link: "/visits",
            },
            {
              label: "Documents",
              description: "Client records",
              icon: <FileText className="mr-2 h-5 w-5 text-estate-navy" />,
              link: "/documents",
            },
            {
              label: "My Commission",
              description: "Earnings report",
              icon: <CreditCard className="mr-2 h-5 w-5 text-estate-success" />,
              link: "/commissions",
            },
          ].map((item, idx) => (
            <Link to={item.link} key={idx}>
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4"
              >
                {item.icon}
                <div className="text-left">
                  <p className="font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </Button>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Active Leads"
            value={leads.length.toString()}
            icon={<UserPlus className="h-6 w-6 text-estate-navy" />}
          />
          <StatCard
            title="Scheduled Visits"
            value={siteVisitOfAgent.length.toString()}
            icon={<Calendar className="h-6 w-6 text-estate-teal" />}
          />
          <StatCard
            title="Follow-ups Today"
            value="4"
            icon={<PhoneCall className="h-6 w-6 text-estate-success" />}
          />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Active Leads</CardTitle>
            <Link to="/leads">
              <Button variant="outline" size="sm">
                View All Leads
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-2 font-medium">Lead</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Property Interest</th>
                    <th className="pb-2 font-medium">Last Contact</th>
                    <th className="pb-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, index: number) => {
                    const statusColors = {
                      hot: "bg-estate-error/20 text-estate-error",
                      warm: "bg-estate-gold/20 text-estate-gold",
                      cold: "bg-estate-teal/20 text-estate-teal",
                    };
                    return (
                      <tr key={index} className="border-b last:border-b-0">
                        <td className="py-4">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage
                                src={`https://ui-avatars.com/api/?name=${lead.name?.replace(
                                  " ",
                                  "+"
                                )}&background=1A365D&color=fff`}
                              />
                              <AvatarFallback>
                                {lead.name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{lead.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {lead.phone}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge className={statusColors[lead.status]}>
                            {lead.status}
                          </Badge>
                        </td>
                        <td>
                          {lead?.property?.basicInfo?.projectName || "NA"}
                        </td>
                        <td>
                          {lead.lastContact
                            ? new Date(lead.lastContact).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  year: "numeric",
                                  month: "short",
                                }
                              )
                            : "N/A"}
                        </td>
                        <td>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              className="bg-estate-navy hover:bg-estate-navy/90"
                              onClick={() => navigate("/leads")}
                            >
                              <Calendar className="h-4 w-4 mr-1" /> View Details
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
          <DialogContent className="md:w-[600px] w-[90vw] max-h-[80vh] overflow-scroll rounded-xl">
            <DialogHeader>
              <DialogTitle>Book a Site Visit</DialogTitle>
              <DialogDescription>
                Schedule a site visit for your client. Complete the form below
                to book a vehicle and a time slot.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4 py-4">
              <p className="text-sm font-medium">
                This would redirect to the full booking form on the Site Visits
                page.
              </p>
              <p className="text-sm text-muted-foreground">
                For demonstration purposes, click the button below to be
                redirected.
              </p>
            </div>
            <DialogFooter className="flex md:flex-row flex-col items-center md:gap-0 gap-5">
              <Button variant="outline" onClick={() => setIsBookingOpen(false)}>
                Cancel
              </Button>
              <Link to="/visits">
                <Button>Go to Site Visit Booking</Button>
              </Link>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default AgentDashboard;
