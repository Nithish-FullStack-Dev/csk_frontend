
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, CartesianGrid 
} from "recharts";
import { toast } from "sonner";
import {
  CheckCircle2, Clock, AlertTriangle, XCircle,
  CalendarDays, ClipboardList, Building, TrendingUp,
  BarChart2, ArrowUpRight, ArrowRight, PlusCircle,
  Calendar, Truck, Users, Plus, Workflow, ListChecks
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import AddConstructionTaskDialog from "@/components/operations/AddConstructionTaskDialog";
import ConstructionTaskList from "@/components/operations/ConstructionTaskList";
import ConstructionPhaseViewer from "@/components/operations/ConstructionPhaseViewer";

// Sample data for projects
const constructionProjects = [
  {
    id: "1",
    name: "Skyline Towers",
    location: "Downtown, Metro City",
    progress: 75,
    status: "in-progress",
    startDate: "2024-01-15",
    endDate: "2025-03-30",
    completedMilestones: 9,
    totalMilestones: 12,
    teamSize: 42,
    contractorName: "BuildWell Construction Inc."
  },
  {
    id: "2",
    name: "Parkview Residences",
    location: "East Side, Metro City",
    progress: 30,
    status: "in-progress",
    startDate: "2024-03-10",
    endDate: "2025-06-15",
    completedMilestones: 3,
    totalMilestones: 10,
    teamSize: 28,
    contractorName: "Elite Builders Ltd."
  },
  {
    id: "3",
    name: "Riverside Apartments",
    location: "River District, Metro City",
    progress: 95,
    status: "near-completion",
    startDate: "2023-08-20",
    endDate: "2024-05-05",
    completedMilestones: 14,
    totalMilestones: 15,
    teamSize: 35,
    contractorName: "RiverEdge Contractors"
  },
  {
    id: "4",
    name: "Golden Heights Phase 2",
    location: "North Hills, Metro City",
    progress: 15,
    status: "in-progress",
    startDate: "2024-02-28",
    endDate: "2025-08-10",
    completedMilestones: 2,
    totalMilestones: 14,
    teamSize: 22,
    contractorName: "Summit Construction Group"
  },
  {
    id: "5",
    name: "Evergreen Villas",
    location: "West End, Metro City",
    progress: 0,
    status: "planning",
    startDate: "2024-06-01",
    endDate: "2025-11-30",
    completedMilestones: 0,
    totalMilestones: 12,
    teamSize: 0,
    contractorName: "GreenSpace Developers"
  }
];

// Sample data for charts
const monthlyProgressData = [
  { month: "Jan", planned: 12, actual: 10 },
  { month: "Feb", planned: 25, actual: 22 },
  { month: "Mar", planned: 38, actual: 35 },
  { month: "Apr", planned: 50, actual: 48 },
  { month: "May", planned: 62, actual: 60 },
  { month: "Jun", planned: 75, actual: 73 },
  { month: "Jul", planned: 88, actual: 85 },
  { month: "Aug", planned: 100, actual: 95 },
];

const milestonesData = [
  { milestone: "Foundation", completed: 5, total: 5 },
  { milestone: "Structure", completed: 8, total: 10 },
  { milestone: "Exterior", completed: 6, total: 8 },
  { milestone: "Interior", completed: 4, total: 12 },
  { milestone: "Utilities", completed: 7, total: 10 },
  { milestone: "Finishing", completed: 3, total: 15 },
];

const issuesData = [
  { month: "Jan", resolved: 15, pending: 5 },
  { month: "Feb", resolved: 18, pending: 7 },
  { month: "Mar", resolved: 22, pending: 6 },
  { month: "Apr", resolved: 26, pending: 4 },
  { month: "May", resolved: 30, pending: 8 },
  { month: "Jun", resolved: 28, pending: 10 },
  { month: "Jul", resolved: 34, pending: 7 },
  { month: "Aug", resolved: 32, pending: 5 },
];

const OperationsWorkflow = () => {
  const [projects] = useState(constructionProjects);
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "planning":
        return (
          <Badge className="bg-blue-100 text-blue-800" variant="outline">
            <Clock className="mr-1 h-3 w-3" />
            Planning
          </Badge>
        );
      case "in-progress":
        return (
          <Badge className="bg-amber-100 text-amber-800" variant="outline">
            <TrendingUp className="mr-1 h-3 w-3" />
            In Progress
          </Badge>
        );
      case "near-completion":
        return (
          <Badge className="bg-green-100 text-green-800" variant="outline">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Near Completion
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-purple-100 text-purple-800" variant="outline">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case "delayed":
        return (
          <Badge className="bg-red-100 text-red-800" variant="outline">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Delayed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Clock className="mr-1 h-3 w-3" />
            Unknown
          </Badge>
        );
    }
  };

  const handleScheduleInspection = () => {
    toast.success("Inspection scheduled successfully", {
      description: "The site manager has been notified",
    });
  };

  const handleAddTask = (projectId: string) => {
    setSelectedProject(projectId);
    setShowAddTaskDialog(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold">Operations Workflow</h1>
            <p className="text-muted-foreground">
              Monitor and manage construction projects and workflows
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>
        </div>

        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="tasks">Construction Tasks</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            <div className="grid grid-cols-1 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/30">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                      <div>
                        <CardTitle>{project.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {project.location}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col md:items-end space-y-2 mt-2 md:mt-0">
                        {getStatusBadge(project.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <span className="text-sm text-muted-foreground">Progress</span>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} />
                      </div>

                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground">Timeline</span>
                        <div className="flex items-center mt-1">
                          <CalendarDays className="h-4 w-4 text-muted-foreground mr-1" />
                          <span className="text-sm">{new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground">Milestones</span>
                        <div className="flex items-center mt-1">
                          <ClipboardList className="h-4 w-4 text-muted-foreground mr-1" />
                          <span className="text-sm">{project.completedMilestones} of {project.totalMilestones} completed</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground">Team</span>
                        <div className="flex items-center mt-1">
                          <Users className="h-4 w-4 text-muted-foreground mr-1" />
                          <span className="text-sm">{project.teamSize} members</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <Button 
                        variant="outline" 
                        onClick={() => handleAddTask(project.id)} 
                        className="mr-2"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Construction Task
                      </Button>
                      <Button variant="outline" onClick={handleScheduleInspection} className="mr-2">
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule Inspection
                      </Button>
                      <Button>
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <ConstructionTaskList />
          </TabsContent>

          <TabsContent value="milestones">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-estate-navy" />
                    Project Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={monthlyProgressData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `${value}%`} />
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Line 
                          type="monotone" 
                          dataKey="planned" 
                          stroke="#9ca3af" 
                          strokeDasharray="5 5"
                          strokeWidth={2}
                          name="Planned Progress"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="actual" 
                          stroke="#4338ca" 
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                          name="Actual Progress"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ClipboardList className="mr-2 h-5 w-5 text-estate-teal" />
                    Milestone Completion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={milestonesData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="milestone" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="total" fill="#9ca3af" name="Total Tasks" />
                        <Bar dataKey="completed" fill="#4338ca" name="Completed Tasks" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="issues">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-estate-gold" />
                  Issue Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={issuesData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="resolved" fill="#16a34a" name="Resolved Issues" />
                      <Bar dataKey="pending" fill="#f59e0b" name="Pending Issues" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources">
            <Card>
              <CardHeader>
                <CardTitle>Resource Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Resource allocation and management tools will be available here,
                  including labor, equipment, and materials tracking.
                </p>
                <div className="h-80 bg-muted/30 rounded-md flex items-center justify-center">
                  <Truck className="w-16 h-16 text-muted/50" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog for adding construction tasks */}
      {showAddTaskDialog && (
        <AddConstructionTaskDialog 
          open={showAddTaskDialog}
          onOpenChange={setShowAddTaskDialog}
          projectId={selectedProject}
        />
      )}

      {/* Construction phase viewer */}
      <ConstructionPhaseViewer />
    </MainLayout>
  );
};

export default OperationsWorkflow;
