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

const SiteInchargeDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [projects, setProjects] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qualityIssues, setQualityIssues] = useState([]);
  const [error, setError] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [approvedCount, setApprovedCount] = useState(0);
  const [reworkCount, setReworkCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [appointments, setAppointments] = useState([]);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_URL}/api/project/projects`,
        {
          withCredentials: true,
        }
      );
      setProjects(res.data);
    } catch (err) {
      console.error("Error fetching project data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchQualityIssues = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_URL}/api/quality-issue/issues`,
        { withCredentials: true }
      );
      setQualityIssues(res.data.issues); // Ensure backend sends an array
    } catch (err) {
      setError("Failed to load issues");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQualityIssues();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_URL}/api/project/tasks`,
        {
          withCredentials: true,
        }
      );
      setTasks(res.data);
      const pending = res.data.filter(
        (t) => t.status === "pending verification"
      ).length;
      const approved = res.data.filter((t) => {
        return (
          t.status === "approved" &&
          t.submittedBySiteInchargeOn &&
          new Date(t.submittedBySiteInchargeOn).getMonth() ===
            new Date().getMonth() &&
          new Date(t.submittedBySiteInchargeOn).getFullYear() ===
            new Date().getFullYear()
        );
      }).length;
      const rework = res.data.filter((t) => t.status === "rework").length;

      setPendingCount(pending);
      setApprovedCount(approved);
      setReworkCount(rework);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_URL}/api/user-schedule/schedules`,
        { withCredentials: true }
      );

      const schedules = response.data.schedules || [];

      const processedSchedules = schedules.map((appt) => ({
        ...appt,
        date: new Date(appt.date),
        startTime: new Date(appt.startTime),
        endTime: new Date(appt.endTime),
      }));

      setAppointments(processedSchedules);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div className="space-y-4 p-8">
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
            <CardTitle className="text-sm font-medium">Active Sites</CardTitle>
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
            <p className="text-xs text-muted-foreground">+3 since yesterday</p>
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
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="verification">Task Verification</TabsTrigger>
          <TabsTrigger value="quality">Quality Control</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Projects Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <SiteInchargeProjectsOverview projects={projects} />
              </CardContent>
            </Card>
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Pending Verifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.map((task, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">{task.taskTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          {task.projectName}, {task.unit}
                        </p>
                      </div>
                      {task.priority && (
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            task.priority === "priority"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {task.priority === "priority"
                            ? "Priority"
                            : task.priority.charAt(0).toUpperCase() +
                              task.priority.slice(1)}
                        </span>
                      )}
                    </div>
                  ))}

                  <div className="flex justify-center mt-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/verifications">View All Verifications</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quality Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <SiteInchargeQualityIssues qualityIssues={qualityIssues} />
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
                  {tasks.slice(0, 2).map((task, index) => (
                    <div
                      key={task._id || index}
                      className="flex items-start space-x-2"
                    >
                      <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium">{task.taskTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          {task.projectName}, {task.unit}
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
                  ))}

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
                setApprovedCount={setApprovedCount}
                setReworkCount={setReworkCount}
                setPendingCount={setPendingCount}
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
              <SiteInchargeQualityIssues qualityIssues={qualityIssues} />
              <div className="flex justify-center mt-4">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/quality">Manage Quality Control</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inspection Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <SiteInchargeSchedule inspections={appointments} />
              <div className="flex justify-center mt-4">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/schedule">View Full Schedule</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SiteInchargeDashboard;
