import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building,
  CheckCircle2,
  ClipboardCheck,
  AlertOctagon,
  Calendar,
} from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";

import SiteInchargeProjectsOverview from "@/components/dashboard/siteincharge/SiteInchargeProjectsOverview";
import TaskVerificationList from "@/components/dashboard/siteincharge/TaskVerificationList";
import SiteInchargeQualityIssues from "@/components/dashboard/siteincharge/SiteInchargeQualityIssues";
import SiteInchargeSchedule from "@/components/dashboard/siteincharge/SiteInchargeSchedule";
import MainLayout from "@/components/layout/MainLayout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchTasks,
  usefetchProjects,
  useQualityIssues,
  useTasks,
} from "@/utils/project/ProjectConfig";
import { useSchedules } from "@/utils/buildings/Projects";
import { VerificationTask } from "@/utils/contractor/ContractorConfig";
import { useQuery } from "@tanstack/react-query";

const SiteInchargeDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("overview");

  const {
    data: projects,
    isLoading: projectsLoading,
    isError: projectsError,
    error: projectsErrorDetails,
  } = usefetchProjects();

  const {
    data: qualityIssues,
    isLoading: qualityIssuesLoading,
    isError: qualityIssuesError,
    error: qualityIssuesErrorDetails,
  } = useQualityIssues();

  const {
    data: tasks,
    isLoading: tasksLoading,
    isError: tasksError,
    error: tasksErrorDetails,
  } = useQuery<VerificationTask[]>({
    queryKey: ["taskVerificationList"],
    queryFn: fetchTasks,
  });

  const {
    data: appointments,
    isLoading: schedulesLoading,
    isError: schedulesError,
    error: schedulesErrorDetails,
  } = useSchedules();

  return (
    <MainLayout>
      <div className="space-y-4 md:p-8 p-2">
        <div className="flex flex-col space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Site In-charge Dashboard
          </h2>
          <p className="text-muted-foreground">
            Monitor projects, verify tasks, and manage quality control
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Sites
              </CardTitle>
              <Building className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Total projects: 5</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Verifications
              </CardTitle>
              <ClipboardCheck className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                +3 since yesterday
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Approved Tasks
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">32</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Quality Issues
              </CardTitle>
              <AlertOctagon className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">2 critical</p>
            </CardContent>
          </Card>
        </div>

        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="space-y-4"
        >
          {/* Mobile: Select */}
          <div className="md:hidden">
            <Select value={selectedTab} onValueChange={setSelectedTab}>
              <SelectTrigger>
                <SelectValue placeholder="Select Tab" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="verification">Task Verification</SelectItem>
                <SelectItem value="quality">Quality Control</SelectItem>
                <SelectItem value="schedule">Schedule</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Desktop: TabsList */}
          <TabsList className="hidden md:inline-block">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="verification">Task Verification</TabsTrigger>
            <TabsTrigger value="quality">Quality Control</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div>
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Projects Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <SiteInchargeProjectsOverview
                    projects={projects}
                    isLoading={projectsLoading}
                    isError={projectsError}
                    error={projectsErrorDetails}
                  />
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-1">
              <Card>
                <CardHeader>
                  <CardTitle>Quality Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <SiteInchargeQualityIssues
                    qualityIssues={qualityIssues}
                    isLoading={qualityIssuesLoading}
                    isError={qualityIssuesError}
                    error={qualityIssuesErrorDetails}
                  />
                  <div className="flex justify-center mt-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/quality">View All Quality Issues</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Inspections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tasksLoading ? (
                      <p>Loading tasks...</p>
                    ) : tasksError ? (
                      <p>Error loading tasks: {tasksErrorDetails?.message}</p>
                    ) : (
                      tasks?.slice(0, 2).map((task, index) => (
                        <div
                          key={task._id || index}
                          className="flex items-start space-x-2"
                        >
                          <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div>
                            <p className="font-medium">{task?.taskTitle}</p>
                            <p className="text-sm text-muted-foreground">
                              {task?.projectName} / {task?.floorNumber} /{" "}
                              {task?.plotNo}
                            </p>
                            <p className="text-xs">
                              {task.submittedByContractorOn
                                ? new Date(
                                    task.submittedByContractorOn
                                  ).toLocaleString("en-IN", {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                  })
                                : "Date not available"}
                            </p>
                          </div>
                        </div>
                      ))
                    )}

                    <div className="flex justify-center mt-4">
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/inspections">View All Inspections</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="verification" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Task Verification Queue</CardTitle>
              </CardHeader>
              <CardContent>
                <TaskVerificationList
                  isError={tasksError}
                  isLoading={tasksLoading}
                  tasks={tasks}
                />
                <div className="flex justify-center mt-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/verifications">View All Verifications</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quality" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quality Control</CardTitle>
              </CardHeader>
              <CardContent>
                <SiteInchargeQualityIssues
                  qualityIssues={qualityIssues}
                  isLoading={qualityIssuesLoading}
                  isError={qualityIssuesError}
                  error={qualityIssuesErrorDetails}
                />
                <div className="flex justify-center mt-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/quality">Manage Quality Control</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default SiteInchargeDashboard;
