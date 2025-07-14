
import React, { useState } from 'react';
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar
} from 'recharts';
import { 
  Building, Gauge, Clock, Calendar, ArrowUpDown, AlertTriangle, 
  CheckCircle, Hammer, Construction, MoreHorizontal
} from "lucide-react";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface ProjectProgress {
  id: string;
  name: string;
  phase: string;
  progress: number;
  expectedCompletion: string;
  status: 'on_track' | 'at_risk' | 'delayed';
  contractor: string;
}

interface PhaseProgress {
  phase: string;
  planned: number;
  actual: number;
}

const projectsProgress: ProjectProgress[] = [
  {
    id: "p1",
    name: "Riverside Tower Block A",
    phase: "Foundation",
    progress: 85,
    expectedCompletion: "2025-05-15",
    status: "on_track",
    contractor: "ABC Construction Ltd."
  },
  {
    id: "p2",
    name: "Riverside Tower Block B",
    phase: "Structural Framework",
    progress: 45,
    expectedCompletion: "2025-06-30",
    status: "at_risk",
    contractor: "ABC Construction Ltd."
  },
  {
    id: "p3",
    name: "Valley Heights Unit 3",
    phase: "Electrical Works",
    progress: 30,
    expectedCompletion: "2025-07-10",
    status: "delayed",
    contractor: "PowerTech Systems"
  },
  {
    id: "p4",
    name: "Valley Heights Unit 7",
    phase: "Roofing",
    progress: 20,
    expectedCompletion: "2025-08-05",
    status: "on_track",
    contractor: "Top Shelter Inc."
  },
  {
    id: "p5",
    name: "Green Villa Villa 2",
    phase: "Interior Finishing",
    progress: 60,
    expectedCompletion: "2025-06-15",
    status: "on_track",
    contractor: "XYZ Builders"
  }
];

const riversideTowerProgress: PhaseProgress[] = [
  { phase: "Foundation", planned: 100, actual: 85 },
  { phase: "Structural Framework", planned: 70, actual: 45 },
  { phase: "MEP Rough-in", planned: 40, actual: 25 },
  { phase: "Interior Walls", planned: 20, actual: 10 },
  { phase: "Finishing", planned: 0, actual: 0 }
];

const valleyHeightsProgress: PhaseProgress[] = [
  { phase: "Foundation", planned: 100, actual: 100 },
  { phase: "Structural Framework", planned: 100, actual: 90 },
  { phase: "Roofing", planned: 80, actual: 50 },
  { phase: "MEP Rough-in", planned: 60, actual: 40 },
  { phase: "Interior Walls", planned: 40, actual: 30 },
  { phase: "Finishing", planned: 20, actual: 10 }
];

const greenVillaProgress: PhaseProgress[] = [
  { phase: "Foundation", planned: 100, actual: 100 },
  { phase: "Structural Framework", planned: 100, actual: 100 },
  { phase: "MEP Rough-in", planned: 100, actual: 95 },
  { phase: "Interior Walls", planned: 90, actual: 85 },
  { phase: "Finishing", planned: 70, actual: 60 }
];

const statusColors: Record<string, string> = {
  on_track: 'bg-green-100 text-green-800',
  at_risk: 'bg-amber-100 text-amber-800',
  delayed: 'bg-red-100 text-red-800'
};

const progressColorClass = (progress: number) => {
  if (progress >= 75) return 'bg-green-500';
  if (progress >= 40) return 'bg-amber-500';
  return 'bg-blue-500';
};

const ConstructionProgress = () => {
  const [selectedProject, setSelectedProject] = useState("riverside_tower");
  
  const getProgressData = () => {
    switch(selectedProject) {
      case "riverside_tower": 
        return riversideTowerProgress;
      case "valley_heights": 
        return valleyHeightsProgress;
      case "green_villa": 
        return greenVillaProgress;
      default: 
        return riversideTowerProgress;
    }
  };

  const getProjectName = () => {
    switch(selectedProject) {
      case "riverside_tower": 
        return "Riverside Tower";
      case "valley_heights": 
        return "Valley Heights";
      case "green_villa": 
        return "Green Villa";
      default: 
        return "Riverside Tower";
    }
  };
  
  const progressData = getProgressData();
  const overallProgress = projectsProgress.reduce((sum, project) => sum + project.progress, 0) / projectsProgress.length;

  return (
    <MainLayout>
      <div className="space-y-6 p-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Construction Progress</h1>
          <p className="text-muted-foreground">
            Track and manage construction progress across all projects
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
              <Gauge className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{Math.round(overallProgress)}%</div>
                  <div className="text-xs text-muted-foreground">Across all projects</div>
                </div>
                <Progress value={overallProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">At Risk Projects</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projectsProgress.filter(p => p.status === 'at_risk').length}
              </div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delayed Projects</CardTitle>
              <Clock className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projectsProgress.filter(p => p.status === 'delayed').length}
              </div>
              <p className="text-xs text-muted-foreground">Behind schedule</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <CardTitle>Project Progress Chart</CardTitle>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-[200px] mt-2 md:mt-0">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="riverside_tower">Riverside Tower</SelectItem>
                  <SelectItem value="valley_heights">Valley Heights</SelectItem>
                  <SelectItem value="green_villa">Green Villa</SelectItem>
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <div className="flex items-center">
                          Project
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
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
                        <TableCell>{project.phase}</TableCell>
                        <TableCell>{project.contractor}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            {new Date(project.expectedCompletion).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-xs">{project.progress}% Complete</div>
                            <Progress 
                              value={project.progress} 
                              className={`h-2 ${progressColorClass(project.progress)}`} 
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[project.status]}>
                            {project.status === 'on_track' 
                              ? 'On Track' 
                              : project.status === 'at_risk'
                              ? 'At Risk'
                              : 'Delayed'}
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
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Update Progress</DropdownMenuItem>
                              <DropdownMenuItem>Schedule Inspection</DropdownMenuItem>
                              <DropdownMenuItem>Contact Contractor</DropdownMenuItem>
                              <DropdownMenuItem>Generate Report</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="on-track" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Projects On Track</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Phase</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Expected Completion</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectsProgress
                      .filter(project => project.status === 'on_track')
                      .map(project => (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">{project.name}</TableCell>
                          <TableCell>{project.phase}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-xs">{project.progress}% Complete</div>
                              <Progress 
                                value={project.progress} 
                                className={`h-2 ${progressColorClass(project.progress)}`} 
                              />
                            </div>
                          </TableCell>
                          <TableCell>{new Date(project.expectedCompletion).toLocaleDateString()}</TableCell>
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
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="at-risk" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Projects At Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Phase</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Expected Completion</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectsProgress
                      .filter(project => project.status === 'at_risk')
                      .map(project => (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">{project.name}</TableCell>
                          <TableCell>{project.phase}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-xs">{project.progress}% Complete</div>
                              <Progress 
                                value={project.progress} 
                                className={`h-2 ${progressColorClass(project.progress)}`} 
                              />
                            </div>
                          </TableCell>
                          <TableCell>{new Date(project.expectedCompletion).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" className="mr-2">
                              <Construction className="h-4 w-4 mr-2" />
                              Schedule Inspection
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="delayed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Delayed Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Phase</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Expected Completion</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectsProgress
                      .filter(project => project.status === 'delayed')
                      .map(project => (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">{project.name}</TableCell>
                          <TableCell>{project.phase}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-xs">{project.progress}% Complete</div>
                              <Progress 
                                value={project.progress} 
                                className={`h-2 ${progressColorClass(project.progress)}`}
                              />
                            </div>
                          </TableCell>
                          <TableCell>{new Date(project.expectedCompletion).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" className="mr-2">
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ConstructionProgress;
