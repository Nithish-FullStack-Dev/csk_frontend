import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Bar,
} from "recharts";
import {
  Gauge,
  Clock,
  Calendar,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle,
  Hammer,
  Construction,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Project, Task, usefetchProjects } from "@/utils/project/ProjectConfig";
import Loader from "@/components/Loader";

interface ProjectProgress {
  id: string;
  name: string;
  phase: string;
  progress: number;
  expectedCompletion: string;
  status: "on_track" | "at_risk" | "delayed";
  contractor: string;
  clientName: string;
}

interface PhaseProgress {
  phase: string;
  planned: number;
  actual: number;
}

const calculateStatus = (
  progress: number,
  deadline: string
): "on_track" | "at_risk" | "delayed" => {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const daysUntilDeadline =
    (deadlineDate.getTime() - today.getTime()) / (1000 * 3600 * 24);

  if (progress >= 75 && daysUntilDeadline > 7) return "on_track";
  if (progress >= 40 && daysUntilDeadline <= 7) return "at_risk";
  return "delayed";
};

const aggregatePhaseProgress = (
  tasks: Task[],
  projectName: string
): PhaseProgress[] => {
  const phaseMap: Record<
    string,
    { planned: number; actual: number; count: number }
  > = {};

  tasks
    .filter((task) => task.statusForContractor !== "completed")
    .forEach((task) => {
      const phase = task.constructionPhase || "Other";
      if (!phaseMap[phase]) {
        phaseMap[phase] = { planned: 100, actual: 0, count: 0 };
      }
      phaseMap[phase].actual += task.progressPercentage;
      phaseMap[phase].count += 1;
    });

  return Object.entries(phaseMap).map(([phase, data]) => ({
    phase,
    planned: data.planned,
    actual: data.count > 0 ? Math.round(data.actual / data.count) : 0,
  }));
};

const statusColors: Record<string, string> = {
  on_track: "bg-green-100 text-green-800",
  at_risk: "bg-amber-100 text-amber-800",
  delayed: "bg-red-100 text-red-800",
};

const progressColorClass = (progress: number) => {
  if (progress >= 75) return "bg-green-500";
  if (progress >= 40) return "bg-amber-500";
  return "bg-blue-500";
};

const ConstructionProgress = () => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const {
    data: projects = [],
    isLoading: isProjectsLoading,
    error: projectsError,
  } = usefetchProjects();

  const projectsProgress: ProjectProgress[] = projects.map(
    (project: Project) => {
      const projectTasks = project.units
        ? Object.values(project.units).flat()
        : [];
      const totalProgress = projectTasks.reduce(
        (sum, task) => sum + task.progressPercentage,
        0
      );
      const avgProgress =
        projectTasks.length > 0
          ? Math.round(totalProgress / projectTasks.length)
          : 0;
      const latestDeadline =
        projectTasks
          .map((task) => new Date(task.deadline))
          .sort((a, b) => b.getTime() - a.getTime())[0]
          ?.toISOString() || new Date().toISOString();
      const mainContractor =
        typeof project.contractors?.[0] === "object" &&
        project.contractors?.[0]?.name
          ? project.contractors[0].name
          : typeof projectTasks[0]?.contractor === "object" &&
            projectTasks[0]?.contractor?.name
          ? projectTasks[0].contractor.name
          : "N/A";
      const mainPhase = projectTasks[0]?.constructionPhase || "N/A";
      const projectName =
        typeof project.projectId === "object"
          ? project.projectId.projectName
          : "";
      const clientName = project.clientName || "N/A";

      return {
        id: project._id || "",
        name: projectName,
        phase: mainPhase,
        progress: avgProgress,
        expectedCompletion: latestDeadline,
        status: calculateStatus(avgProgress, latestDeadline),
        contractor: mainContractor,
        clientName,
      };
    }
  );

  const projectNames: string[] = Array.from(
    new Set(
      projects.map((p: Project) =>
        typeof p.projectId === "object" ? p.projectId.projectName : ""
      )
    )
  ).filter((name): name is string => name !== "");

  React.useEffect(() => {
    if (projectNames.length > 0 && !selectedProject) {
      setSelectedProject(projectNames[0]);
    }
  }, [projectNames, selectedProject]);

  const getProgressData = () => {
    if (!selectedProject) return [];
    const selectedProjectData = projects.find(
      (p: Project) =>
        typeof p.projectId === "object" &&
        p.projectId.projectName === selectedProject
    );
    const tasks = selectedProjectData?.units
      ? Object.values(selectedProjectData.units).flat()
      : [];
    return aggregatePhaseProgress(tasks, selectedProject);
  };

  const progressData = getProgressData();
  const overallProgress =
    projectsProgress.reduce((sum, project) => sum + project.progress, 0) /
    (projectsProgress.length || 1);

  if (isProjectsLoading) {
    return <Loader />;
  }

  if (projectsError) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <p className="text-red-500">
            Error: {projectsError?.message || "Failed to load data"}
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 md:p-8 p-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Construction Progress
          </h1>
          <p className="text-muted-foreground">
            Track and manage construction progress across all projects
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Overall Progress
              </CardTitle>
              <Gauge className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {Math.round(overallProgress)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Across all projects
                  </div>
                </div>
                <Progress value={overallProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                At Risk Projects
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projectsProgress.filter((p) => p.status === "at_risk").length}
              </div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Delayed Projects
              </CardTitle>
              <Clock className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projectsProgress.filter((p) => p.status === "delayed").length}
              </div>
              <p className="text-xs text-muted-foreground">Behind schedule</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <CardTitle>Project Progress Chart</CardTitle>
              <Select
                value={selectedProject || ""}
                onValueChange={setSelectedProject}
              >
                <SelectTrigger className="w-[200px] mt-2 md:mt-0">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projectNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={progressData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="phase" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar name="Planned %" dataKey="planned" fill="#8884d8" />
                  <Bar name="Actual %" dataKey="actual" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="all-projects" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all-projects">All Projects</TabsTrigger>
            <TabsTrigger value="on-track">On Track</TabsTrigger>
            <TabsTrigger value="at-risk">At Risk</TabsTrigger>
            <TabsTrigger value="delayed">Delayed</TabsTrigger>
          </TabsList>
          <TabsContent value="all-projects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Status</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* Desktop Table */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <div className="flex items-center">
                            Project
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Phase</TableHead>
                        <TableHead>Contractor</TableHead>
                        <TableHead>Expected Completion</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projectsProgress.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">
                            {project.name}
                          </TableCell>
                          <TableCell>{project.clientName}</TableCell>
                          <TableCell>{project.phase}</TableCell>
                          <TableCell>{project.contractor}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                              {new Date(
                                project.expectedCompletion
                              ).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-xs">
                                {project.progress}% Complete
                              </div>
                              <Progress
                                value={project.progress}
                                className={`h-2 ${progressColorClass(
                                  project.progress
                                )}`}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={statusColors[project.status]}
                            >
                              {project.status === "on_track"
                                ? "On Track"
                                : project.status === "at_risk"
                                ? "At Risk"
                                : "Delayed"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Update Progress
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Schedule Inspection
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Contact Contractor
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Generate Report
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="block md:hidden">
                  <div className="grid gap-4 p-2">
                    {projectsProgress.map((project) => (
                      <Card
                        key={project.id}
                        className="rounded-xl border shadow-sm p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{project.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Client: {project.clientName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Contractor: {project.contractor}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>
                                Update Progress
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                Schedule Inspection
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                Contact Contractor
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                Generate Report
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="mt-3 text-sm">
                          <p>
                            <span className="font-semibold">Phase: </span>
                            {project.phase}
                          </p>
                          <p className="mt-1 flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span className="font-semibold mr-1">
                              Expected:{" "}
                            </span>
                            {new Date(
                              project.expectedCompletion
                            ).toLocaleDateString()}
                          </p>
                          <div className="mt-2">
                            <span className="font-semibold">Progress: </span>
                            <div className="text-xs">
                              {project.progress}% Complete
                            </div>
                            <Progress
                              value={project.progress}
                              className={`h-2 mt-1 ${progressColorClass(
                                project.progress
                              )}`}
                            />
                          </div>
                          <div className="mt-2">
                            <span className="font-semibold">Status: </span>
                            <Badge
                              variant="outline"
                              className={statusColors[project.status]}
                            >
                              {project.status === "on_track"
                                ? "On Track"
                                : project.status === "at_risk"
                                ? "At Risk"
                                : "Delayed"}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="on-track" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Projects On Track</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Desktop Table */}
                <Table className="hidden md:table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Phase</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Expected Completion</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectsProgress
                      .filter((project) => project.status === "on_track")
                      .map((project) => (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">
                            {project.name}
                          </TableCell>
                          <TableCell>{project.clientName}</TableCell>
                          <TableCell>{project.phase}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-xs">
                                {project.progress}% Complete
                              </div>
                              <Progress
                                value={project.progress}
                                className={`h-2 ${progressColorClass(
                                  project.progress
                                )}`}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(
                              project.expectedCompletion
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Gauge className="h-4 w-4 mr-2" />
                              Update Progress
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>

                {/* Mobile Card Layout */}
                <div className="grid gap-4 md:hidden">
                  {projectsProgress
                    .filter((project) => project.status === "on_track")
                    .map((project) => (
                      <Card
                        key={project.id}
                        className="p-4 shadow-md rounded-xl"
                      >
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {project.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Client: {project.clientName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Phase: {project.phase}
                            </p>
                          </div>
                          <div>
                            <div className="text-xs mb-1">
                              {project.progress}% Complete
                            </div>
                            <Progress
                              value={project.progress}
                              className={`h-2 ${progressColorClass(
                                project.progress
                              )}`}
                            />
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-2" />
                            {new Date(
                              project.expectedCompletion
                            ).toLocaleDateString()}
                          </div>
                          <div className="pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              <Gauge className="h-4 w-4 mr-2" />
                              Update Progress
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="at-risk" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Projects At Risk</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Desktop Table */}
                <Table className="hidden md:table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Phase</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Expected Completion</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectsProgress
                      .filter((project) => project.status === "at_risk")
                      .map((project) => (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">
                            {project.name}
                          </TableCell>
                          <TableCell>{project.clientName}</TableCell>
                          <TableCell>{project.phase}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-xs">
                                {project.progress}% Complete
                              </div>
                              <Progress
                                value={project.progress}
                                className={`h-2 ${progressColorClass(
                                  project.progress
                                )}`}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(
                              project.expectedCompletion
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mr-2"
                            >
                              <Construction className="h-4 w-4 mr-2" />
                              Schedule Inspection
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>

                {/* Mobile Card Layout */}
                <div className="grid gap-4 md:hidden">
                  {projectsProgress
                    .filter((project) => project.status === "at_risk")
                    .map((project) => (
                      <Card
                        key={project.id}
                        className="p-4 shadow-md rounded-xl"
                      >
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {project.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Client: {project.clientName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Phase: {project.phase}
                            </p>
                          </div>
                          <div>
                            <div className="text-xs mb-1">
                              {project.progress}% Complete
                            </div>
                            <Progress
                              value={project.progress}
                              className={`h-2 ${progressColorClass(
                                project.progress
                              )}`}
                            />
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-2" />
                            {new Date(
                              project.expectedCompletion
                            ).toLocaleDateString()}
                          </div>
                          <div className="pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              <Construction className="h-4 w-4 mr-2" />
                              Schedule Inspection
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delayed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Delayed Projects</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Desktop Table */}
                <Table className="hidden md:table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Phase</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Expected Completion</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectsProgress
                      .filter((project) => project.status === "delayed")
                      .map((project) => (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">
                            {project.name}
                          </TableCell>
                          <TableCell>{project.clientName}</TableCell>
                          <TableCell>{project.phase}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-xs">
                                {project.progress}% Complete
                              </div>
                              <Progress
                                value={project.progress}
                                className={`h-2 ${progressColorClass(
                                  project.progress
                                )}`}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(
                              project.expectedCompletion
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mr-2"
                            >
                              <Hammer className="h-4 w-4 mr-2" />
                              Issue Notice
                            </Button>
                            <Button variant="outline" size="sm">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Revise Schedule
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>

                {/* Mobile Card Layout */}
                <div className="grid gap-4 md:hidden">
                  {projectsProgress
                    .filter((project) => project.status === "delayed")
                    .map((project) => (
                      <Card
                        key={project.id}
                        className="p-4 shadow-md rounded-xl"
                      >
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {project.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Client: {project.clientName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Phase: {project.phase}
                            </p>
                          </div>
                          <div>
                            <div className="text-xs mb-1">
                              {project.progress}% Complete
                            </div>
                            <Progress
                              value={project.progress}
                              className={`h-2 ${progressColorClass(
                                project.progress
                              )}`}
                            />
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-2" />
                            {new Date(
                              project.expectedCompletion
                            ).toLocaleDateString()}
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto"
                            >
                              <Hammer className="h-4 w-4 mr-2" />
                              Issue Notice
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Revise Schedule
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ConstructionProgress;
