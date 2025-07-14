
import { useState } from "react";
import { Link } from "react-router-dom";
import StatCard from "@/components/dashboard/StatCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import { UserPlus, Calendar, MapPin, Clock, PhoneCall, Users, FileText, CreditCard, Car } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

// Sample data
const recentActivities = [
  {
    id: "1",
    user: {
      name: "Robert Wilson",
      avatar: "https://ui-avatars.com/api/?name=Robert+Wilson&background=38A169&color=fff",
    },
    action: "added new lead",
    target: "James Miller",
    timestamp: "30 minutes ago",
    type: "lead" as const,
  },
  {
    id: "2",
    user: {
      name: "Emily Davis",
      avatar: "https://ui-avatars.com/api/?name=Emily+Davis&background=718096&color=fff",
    },
    action: "approved your site visit for",
    target: "Golden Heights Phase 2",
    timestamp: "2 hours ago",
    type: "visit" as const,
  },
  {
    id: "3",
    user: {
      name: "Robert Wilson",
      avatar: "https://ui-avatars.com/api/?name=Robert+Wilson&background=38A169&color=fff",
    },
    action: "uploaded documents for",
    target: "Patricia Garcia",
    timestamp: "yesterday",
    type: "document" as const,
  },
];

const upcomingTasks = [
  {
    id: "1",
    type: "call",
    title: "Follow-up call with James Miller",
    time: "Today, 3:00 PM",
    priority: "high",
  },
  {
    id: "2",
    type: "visit",
    title: "Site visit to Golden Heights with Patricia Garcia",
    time: "Tomorrow, 10:00 AM",
    priority: "medium",
  },
  {
    id: "3",
    type: "document",
    title: "Complete sales agreement for Susan Rodriguez",
    time: "Tomorrow, 2:00 PM",
    priority: "high",
  },
  {
    id: "4",
    type: "call",
    title: "Initial consultation with Michael Johnson",
    time: "Friday, 11:00 AM",
    priority: "low",
  },
];

const leads = [
  {
    name: "James Miller",
    status: "hot",
    property: "Golden Heights Phase 2",
    lastContact: "Today",
    phone: "+1 555-123-4567",
  },
  {
    name: "Patricia Garcia",
    status: "warm",
    property: "Skyline Towers",
    lastContact: "Yesterday",
    phone: "+1 555-234-5678",
  },
  {
    name: "Susan Rodriguez",
    status: "warm",
    property: "Riverside Apartments",
    lastContact: "2 days ago",
    phone: "+1 555-345-6789",
  },
  {
    name: "Michael Johnson",
    status: "cold",
    property: "Parkview Residences",
    lastContact: "1 week ago",
    phone: "+1 555-456-7890",
  },
];

const AgentDashboard = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const handleBookingSiteVisit = () => {
    toast.success("Site visit booking initiated. Please complete the form.");
    setIsBookingOpen(true);
  };

  return (
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
          <MapPin className="mr-2 h-5 w-5" />
          Book Site Visit
        </Button>
      </div>

      {/* Quick Access Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
        <Link to="/leads">
          <Button variant="outline" className="w-full justify-start h-auto py-4">
            <UserPlus className="mr-2 h-5 w-5 text-estate-navy" />
            <div className="text-left">
              <p className="font-medium">Lead Management</p>
              <p className="text-xs text-muted-foreground">Manage prospects</p>
            </div>
          </Button>
        </Link>
        <Link to="/schedule">
          <Button variant="outline" className="w-full justify-start h-auto py-4">
            <Calendar className="mr-2 h-5 w-5 text-estate-teal" />
            <div className="text-left">
              <p className="font-medium">My Schedule</p>
              <p className="text-xs text-muted-foreground">View appointments</p>
            </div>
          </Button>
        </Link>
        <Link to="/visits">
          <Button variant="outline" className="w-full justify-start h-auto py-4">
            <Car className="mr-2 h-5 w-5 text-estate-gold" />
            <div className="text-left">
              <p className="font-medium">Site Visits</p>
              <p className="text-xs text-muted-foreground">Car allocation</p>
            </div>
          </Button>
        </Link>
        <Link to="/documents">
          <Button variant="outline" className="w-full justify-start h-auto py-4">
            <FileText className="mr-2 h-5 w-5 text-estate-navy" />
            <div className="text-left">
              <p className="font-medium">Documents</p>
              <p className="text-xs text-muted-foreground">Client records</p>
            </div>
          </Button>
        </Link>
        <Link to="/commissions">
          <Button variant="outline" className="w-full justify-start h-auto py-4">
            <CreditCard className="mr-2 h-5 w-5 text-estate-success" />
            <div className="text-left">
              <p className="font-medium">My Commission</p>
              <p className="text-xs text-muted-foreground">Earnings report</p>
            </div>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Leads"
          value="8"
          icon={<UserPlus className="h-6 w-6 text-estate-navy" />}
        />
        <StatCard
          title="Scheduled Visits"
          value="3"
          icon={<Calendar className="h-6 w-6 text-estate-teal" />}
        />
        <StatCard
          title="Pending Tasks"
          value="12"
          icon={<Clock className="h-6 w-6 text-estate-gold" />}
        />
        <StatCard
          title="Follow-ups Today"
          value="4"
          icon={<PhoneCall className="h-6 w-6 text-estate-success" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingTasks.map((task) => {
                const taskIcons = {
                  call: <PhoneCall className="h-4 w-4" />,
                  visit: <MapPin className="h-4 w-4" />,
                  document: <FileText className="h-4 w-4" />,
                };
                
                const priorityColors = {
                  high: "bg-estate-error/20 text-estate-error",
                  medium: "bg-estate-gold/20 text-estate-gold",
                  low: "bg-estate-success/20 text-estate-success",
                };

                return (
                  <div 
                    key={task.id} 
                    className="flex justify-between items-center p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors rounded-md"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-muted rounded-full">
                        {taskIcons[task.type as keyof typeof taskIcons]}
                      </div>
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground">{task.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={priorityColors[task.priority as keyof typeof priorityColors]}>
                        {task.priority}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        Complete
                      </Button>
                    </div>
                  </div>
                );
              })}
              <div className="flex justify-center pt-4">
                <Link to="/schedule">
                  <Button variant="outline">View All Tasks</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        <ActivityFeed activities={recentActivities} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active Leads</CardTitle>
          <Link to="/leads">
            <Button variant="outline" size="sm">View All Leads</Button>
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
                {leads.map((lead, index) => {
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
                            <AvatarImage src={`https://ui-avatars.com/api/?name=${lead.name.replace(' ', '+')}&background=1A365D&color=fff`} />
                            <AvatarFallback>{lead.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{lead.name}</p>
                            <p className="text-sm text-muted-foreground">{lead.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge className={statusColors[lead.status as keyof typeof statusColors]}>
                          {lead.status}
                        </Badge>
                      </td>
                      <td>{lead.property}</td>
                      <td>{lead.lastContact}</td>
                      <td>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <PhoneCall className="h-4 w-4 mr-1" />
                            Call
                          </Button>
                          <Button size="sm" className="bg-estate-navy hover:bg-estate-navy/90">
                            <Calendar className="h-4 w-4 mr-1" />
                            Schedule
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

      {/* Site Visit Booking Dialog */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Book a Site Visit</DialogTitle>
            <DialogDescription>
              Schedule a site visit for your client. Complete the form below to book a vehicle and a time slot.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4">
            <p className="text-sm font-medium">This would redirect to the full booking form on the Site Visits page.</p>
            <p className="text-sm text-muted-foreground">For demonstration purposes, click the button below to be redirected.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookingOpen(false)}>Cancel</Button>
            <Link to="/visits">
              <Button>Go to Site Visit Booking</Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentDashboard;
