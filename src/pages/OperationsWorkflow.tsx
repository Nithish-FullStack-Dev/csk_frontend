import { useState, useEffect } from "react";
import axios from "axios";
import MainLayout from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  CalendarDays,
  ClipboardList,
  TrendingUp,
  ArrowRight,
  Truck,
  Users,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import ConstructionTaskList from "@/components/operations/ConstructionTaskList";
import ConstructionPhaseViewer from "@/components/operations/ConstructionPhaseViewer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ErrorBoundary from "@/ErrorBoundary";

// Sample data for charts (kept static as no corresponding API)
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
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("projects");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_URL}/api/project/projects`,
          { withCredentials: true }
        );
        const fetchedProjects = response.data;

        // Extract tasks from projects
        const extractedTasks = [];
        fetchedProjects.forEach((project) => {
          const projectName = project.projectTitle || "Unnamed Project";
          const units = project.units || {};
          Object.entries(units).forEach(([unitName, unitTasks]) => {
            unitTasks.forEach((task) => {
              extractedTasks.push({
                _id: task._id,
                taskTitle: task.title || "Untitled Task",
                projectName,
                unit: unitName,
                constructionPhase: task.constructionPhase || "",
                status: task.statusForContractor || "In progress",
                deadline: task.deadline,
                progress: task.progressPercentage || 0,
                contractorId: task.contractor,
                contractorName: task.contractorName || "Unknown Contractor", // Note: contractorName may need population
              });
            });
          });
        });

        setProjects(fetchedProjects);
        setTasks(extractedTasks);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, []);

  const getStatusBadge = (status, progress) => {
    let computedStatus = status.toLowerCase();
    if (progress === 0) {
      computedStatus = "planning";
    } else if (progress >= 95) {
      computedStatus = "near-completion";
    } else if (progress > 0) {
      computedStatus = "in-progress";
    }

    switch (computedStatus) {
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
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Desktop Tabs */}
          <TabsList className="mb-4 hidden md:block">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="tasks">Construction Tasks</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
          </TabsList>

          {/* Mobile Select */}
          <div className="md:hidden mb-4">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="projects">Projects</SelectItem>
                <SelectItem value="tasks">Construction Tasks</SelectItem>
                <SelectItem value="milestones">Milestones</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* --- Tab Contents --- */}
          <TabsContent value="projects">
            <div className="grid grid-cols-1 gap-6">
              {projects.map((project) => {
                const totalTasks = project.totalTasks || 0;
                const tasksCompleted = project.tasksCompleted || 0;
                const progress =
                  totalTasks > 0
                    ? Math.round((tasksCompleted / totalTasks) * 100)
                    : 0;
                return (
                  <Card key={project._id} className="overflow-hidden">
                    <CardHeader className="bg-muted/30">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                        <div>
                          <CardTitle>{project.projectTitle}</CardTitle>
                          <CardDescription className="mt-1">
                            Metro City {/* Static location as no API field */}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col md:items-end space-y-2 mt-2 md:mt-0">
                          {getStatusBadge(project.status, progress)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                          <span className="text-sm text-muted-foreground">
                            Progress
                          </span>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">
                              {progress}%
                            </span>
                          </div>
                          <Progress value={progress} />
                        </div>

                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">
                            Timeline
                          </span>
                          <div className="flex items-center mt-1">
                            <CalendarDays className="h-4 w-4 text-muted-foreground mr-1" />
                            <span className="text-sm">
                              {project.startDate
                                ? new Date(
                                    project.startDate
                                  ).toLocaleDateString()
                                : "N/A"}{" "}
                              -{" "}
                              {project.endDate
                                ? new Date(project.endDate).toLocaleDateString()
                                : "N/A"}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">
                            Milestones
                          </span>
                          <div className="flex items-center mt-1">
                            <ClipboardList className="h-4 w-4 text-muted-foreground mr-1" />
                            <span className="text-sm">
                              {tasksCompleted} of {totalTasks} completed
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">
                            Team
                          </span>
                          <div className="flex items-center mt-1">
                            <Users className="h-4 w-4 text-muted-foreground mr-1" />
                            <span className="text-sm">
                              {project.teamSize || 0} members
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-col sm:flex-row justify-end gap-2">
                        <Button>
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <ErrorBoundary>
              <ConstructionTaskList tasks={tasks} />
            </ErrorBoundary>
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
                        <Bar
                          dataKey="total"
                          fill="#9ca3af"
                          name="Total Tasks"
                        />
                        <Bar
                          dataKey="completed"
                          fill="#4338ca"
                          name="Completed Tasks"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ConstructionPhaseViewer />
    </MainLayout>
  );
};

export default OperationsWorkflow;
