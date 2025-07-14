import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  Users,
  Target,
  TrendingUp,
  Clock,
  Calendar,
  Phone,
  Mail,
  Eye,
  Edit,
} from "lucide-react";
import { useState } from "react";

const pipelineData = [
  {
    stage: "Prospecting",
    deals: [
      {
        id: "1",
        client: "John Smith",
        property: "Skyline Towers",
        value: 450000,
        probability: 20,
        lastContact: "2 days ago",
        agent: "Robert Wilson",
      },
      {
        id: "2",
        client: "Sarah Johnson",
        property: "Riverside Apartments",
        value: 320000,
        probability: 15,
        lastContact: "1 week ago",
        agent: "Emily Davis",
      },
    ],
  },
  {
    stage: "Qualification",
    deals: [
      {
        id: "3",
        client: "Michael Brown",
        property: "Golden Heights",
        value: 780000,
        probability: 40,
        lastContact: "Yesterday",
        agent: "David Thompson",
      },
      {
        id: "4",
        client: "Lisa Anderson",
        property: "Parkview Residences",
        value: 520000,
        probability: 35,
        lastContact: "3 days ago",
        agent: "Robert Wilson",
      },
    ],
  },
  {
    stage: "Proposal",
    deals: [
      {
        id: "5",
        client: "David Wilson",
        property: "Riverside Apartments",
        value: 690000,
        probability: 70,
        lastContact: "Today",
        agent: "Emily Davis",
      },
      {
        id: "6",
        client: "Jennifer Martinez",
        property: "Skyline Towers",
        value: 410000,
        probability: 65,
        lastContact: "Yesterday",
        agent: "Lisa Anderson",
      },
    ],
  },
  {
    stage: "Negotiation",
    deals: [
      {
        id: "7",
        client: "Robert Taylor",
        property: "Golden Heights",
        value: 850000,
        probability: 85,
        lastContact: "Today",
        agent: "David Thompson",
      },
    ],
  },
  {
    stage: "Closing",
    deals: [
      {
        id: "8",
        client: "Mary Johnson",
        property: "Parkview Residences",
        value: 720000,
        probability: 95,
        lastContact: "Today",
        agent: "Robert Wilson",
      },
    ],
  },
];

const SalesPipeline = () => {
  const [timeFilter, setTimeFilter] = useState("all");
  const [agentFilter, setAgentFilter] = useState("all");

  const getTotalValue = (stage: string) => {
    const stageData = pipelineData.find((s) => s.stage === stage);
    return stageData?.deals.reduce((sum, deal) => sum + deal.value, 0) || 0;
  };

  const getStageColor = (stage: string) => {
    const colors = {
      Prospecting: "bg-slate-100 text-slate-800",
      Qualification: "bg-blue-100 text-blue-800",
      Proposal: "bg-yellow-100 text-yellow-800",
      Negotiation: "bg-orange-100 text-orange-800",
      Closing: "bg-green-100 text-green-800",
    };
    return colors[stage as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold">Sales Pipeline</h1>
            <p className="text-muted-foreground">
              Track and manage your sales opportunities
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Time Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
              </SelectContent>
            </Select>
            <Select value={agentFilter} onValueChange={setAgentFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Agents" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                <SelectItem value="robert">Robert Wilson</SelectItem>
                <SelectItem value="emily">Emily Davis</SelectItem>
                <SelectItem value="david">David Thompson</SelectItem>
                <SelectItem value="lisa">Lisa Anderson</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {pipelineData.map((stage) => (
            <Card key={stage.stage} className="h-fit">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge className={getStageColor(stage.stage)}>
                    {stage.stage}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {stage.deals.length} deals
                  </span>
                </div>
                <p className="text-lg font-semibold">
                  ${(getTotalValue(stage.stage) / 1000).toFixed(0)}k
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {stage.deals.map((deal) => (
                  <Card
                    key={deal.id}
                    className="p-3 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{deal.client}</h4>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {deal.property}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">
                          ${(deal.value / 1000).toFixed(0)}k
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {deal.probability}%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{deal.agent}</span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {deal.lastContact}
                        </span>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs flex-1"
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          Call
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs flex-1"
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          Email
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-estate-navy" />
                Pipeline Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-estate-navy">$3.2M</p>
                  <p className="text-sm text-muted-foreground">
                    Total Pipeline
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-estate-teal">18</p>
                  <p className="text-sm text-muted-foreground">Active Deals</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-estate-gold">62%</p>
                  <p className="text-sm text-muted-foreground">
                    Avg. Probability
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-estate-success">
                    28 days
                  </p>
                  <p className="text-sm text-muted-foreground">Avg. Cycle</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2 h-5 w-5 text-estate-navy" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start">
                <DollarSign className="mr-2 h-4 w-4" />
                Add New Deal
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Import Leads
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Follow-up
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default SalesPipeline;
