
import { useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import { Users, Car, Calendar, CheckSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Sample data
const recentActivities = [
  {
    id: "1",
    user: {
      name: "Robert Wilson",
      avatar: "https://ui-avatars.com/api/?name=Robert+Wilson&background=38A169&color=fff",
    },
    action: "requested site visit approval for",
    target: "Golden Heights Phase 2",
    timestamp: "30 minutes ago",
    type: "visit" as const,
  },
  {
    id: "2",
    user: {
      name: "Lisa Anderson",
      avatar: "https://ui-avatars.com/api/?name=Lisa+Anderson&background=E53E3E&color=fff",
    },
    action: "submitted sales agreement for",
    target: "Riverside Apartments, Unit 207",
    timestamp: "2 hours ago",
    type: "document" as const,
  },
  {
    id: "3",
    user: {
      name: "David Thompson",
      avatar: "https://ui-avatars.com/api/?name=David+Thompson&background=1A365D&color=fff",
    },
    action: "completed follow-up with lead",
    target: "John Buyer",
    timestamp: "yesterday",
    type: "lead" as const,
  },
];

const pendingSiteVisits = [
  {
    id: "1",
    agent: {
      name: "Robert Wilson",
      avatar: "https://ui-avatars.com/api/?name=Robert+Wilson&background=38A169&color=fff",
    },
    client: "James Miller",
    property: "Golden Heights Phase 2",
    date: "Today, 2:00 PM",
  },
  {
    id: "2",
    agent: {
      name: "Lisa Anderson",
      avatar: "https://ui-avatars.com/api/?name=Lisa+Anderson&background=E53E3E&color=fff",
    },
    client: "Patricia Garcia",
    property: "Skyline Towers",
    date: "Tomorrow, 10:00 AM",
  },
  {
    id: "3",
    agent: {
      name: "David Thompson",
      avatar: "https://ui-avatars.com/api/?name=David+Thompson&background=1A365D&color=fff",
    },
    client: "Susan Rodriguez",
    property: "Riverside Apartments",
    date: "Tomorrow, 3:30 PM",
  },
];

const teamMembers = [
  {
    name: "Robert Wilson",
    avatar: "https://ui-avatars.com/api/?name=Robert+Wilson&background=38A169&color=fff",
    leads: 12,
    visits: 5,
    deals: 2,
  },
  {
    name: "Lisa Anderson",
    avatar: "https://ui-avatars.com/api/?name=Lisa+Anderson&background=E53E3E&color=fff",
    leads: 9,
    visits: 3,
    deals: 1,
  },
  {
    name: "David Thompson",
    avatar: "https://ui-avatars.com/api/?name=David+Thompson&background=1A365D&color=fff",
    leads: 15,
    visits: 7,
    deals: 0,
  },
];

const TeamLeadDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Team Lead Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your team and track agent activities
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Team Members"
          value="3"
          icon={<Users className="h-6 w-6 text-estate-navy" />}
        />
        <StatCard
          title="Vehicles Available"
          value="2"
          icon={<Car className="h-6 w-6 text-estate-teal" />}
        />
        <StatCard
          title="Pending Site Visits"
          value="3"
          icon={<Calendar className="h-6 w-6 text-estate-gold" />}
        />
        <StatCard
          title="Approvals Needed"
          value="2"
          icon={<CheckSquare className="h-6 w-6 text-estate-error" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Pending Site Visit Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingSiteVisits.map((visit) => (
                <div 
                  key={visit.id} 
                  className="flex justify-between items-center p-4 border-b last:border-b-0"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={visit.agent.avatar} />
                      <AvatarFallback>{visit.agent.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{visit.client}</p>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{visit.property}</span>
                        <span>•</span>
                        <span>{visit.date}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Requested by: {visit.agent.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="text-estate-error">
                      Deny
                    </Button>
                    <Button size="sm" className="bg-estate-navy hover:bg-estate-navy/90">
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <ActivityFeed activities={recentActivities} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {teamMembers.map((member, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-20 w-20 mb-4">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-lg">{member.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">Sales Agent</p>
                    <div className="grid grid-cols-3 gap-2 w-full">
                      <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                        <span className="text-lg font-bold">{member.leads}</span>
                        <span className="text-xs text-muted-foreground">Leads</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                        <span className="text-lg font-bold">{member.visits}</span>
                        <span className="text-xs text-muted-foreground">Visits</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                        <span className="text-lg font-bold">{member.deals}</span>
                        <span className="text-xs text-muted-foreground">Deals</span>
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
