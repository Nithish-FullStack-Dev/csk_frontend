
import { useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import { LineChart, BarChart, DollarSign, Users, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Sample data
const recentActivities = [
  {
    id: "1",
    user: {
      name: "Robert Wilson",
      avatar: "https://ui-avatars.com/api/?name=Robert+Wilson&background=38A169&color=fff",
    },
    action: "closed a deal for",
    target: "Riverside Apartments, Unit 305",
    timestamp: "1 hour ago",
    type: "property" as const,
  },
  {
    id: "2",
    user: {
      name: "Emily Davis",
      avatar: "https://ui-avatars.com/api/?name=Emily+Davis&background=718096&color=fff",
    },
    action: "approved site visit for",
    target: "Golden Heights Phase 2",
    timestamp: "3 hours ago",
    type: "visit" as const,
  },
  {
    id: "3",
    user: {
      name: "David Thompson",
      avatar: "https://ui-avatars.com/api/?name=David+Thompson&background=1A365D&color=fff",
    },
    action: "uploaded sales contract for",
    target: "Skyline Towers, Unit 1204",
    timestamp: "yesterday",
    type: "document" as const,
  },
];

const teamPerformance = [
  { name: "Emily Davis", position: "Team Lead", sales: 840000, target: 1000000, deals: 4 },
  { name: "Robert Wilson", position: "Agent", sales: 620000, target: 750000, deals: 3 },
  { name: "David Thompson", position: "Agent", sales: 520000, target: 750000, deals: 2 },
  { name: "Lisa Anderson", position: "Agent", sales: 350000, target: 750000, deals: 1 },
];

const SalesManagerDashboard = () => {
  const [timeframe, setTimeframe] = useState("month");

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Sales Dashboard</h1>
          <p className="text-muted-foreground">
            Track your sales team performance and pipeline
          </p>
        </div>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px] mt-4 md:mt-0">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Sales"
          value="$2.34M"
          trend={{ value: 12.5, isPositive: true }}
          icon={<DollarSign className="h-6 w-6 text-estate-navy" />}
        />
        <StatCard
          title="Deals Closed"
          value="12"
          trend={{ value: 8.2, isPositive: true }}
          icon={<Target className="h-6 w-6 text-estate-success" />}
        />
        <StatCard
          title="Active Leads"
          value="147"
          trend={{ value: 4.1, isPositive: true }}
          icon={<Users className="h-6 w-6 text-estate-gold" />}
        />
        <StatCard
          title="Conversion Rate"
          value="8.2%"
          trend={{ value: 1.5, isPositive: true }}
          icon={<LineChart className="h-6 w-6 text-estate-teal" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Sales Pipeline</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-80 flex items-center justify-center bg-muted/50 rounded-md">
                <BarChart className="h-16 w-16 text-estate-navy/20" />
              </div>
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
          <div className="space-y-6">
            {teamPerformance.map((member, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.position}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${(member.sales / 1000).toFixed(0)}k</p>
                    <p className="text-sm text-muted-foreground">
                      {((member.sales / member.target) * 100).toFixed(0)}% of target
                    </p>
                  </div>
                </div>
                <Progress value={(member.sales / member.target) * 100} />
                <p className="text-xs text-muted-foreground text-right">
                  {member.deals} deals closed
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesManagerDashboard;
