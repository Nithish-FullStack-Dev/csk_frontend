import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TaskVerificationList from "@/components/dashboard/siteincharge/TaskVerificationList";
import { ClipboardCheck, CheckCircle2, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

const TaskVerifications = () => {
  const [tasks, setTasks] = useState([]);
  const [approvedCount, setApprovedCount] = useState(0);
  const [reworkCount, setReworkCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

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

  return (
    <MainLayout>
      <div className="space-y-6 md:p-8 p-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Task Verifications
          </h1>
          <p className="text-muted-foreground">
            Verify and approve completed construction tasks from contractors
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Verifications
              </CardTitle>
              <ClipboardCheck className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">
                Requires your inspection
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Approved Tasks
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedCount}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tasks Needing Rework
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reworkCount}</div>
              <p className="text-xs text-muted-foreground">
                Returned to contractors
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="rework">Rework</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Task Verifications</CardTitle>
              </CardHeader>
              <CardContent>
                <TaskVerificationList
                  setApprovedCount={setApprovedCount}
                  setReworkCount={setReworkCount}
                  setPendingCount={setPendingCount}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Completed Task Verifications</CardTitle>
              </CardHeader>
              <CardContent>
                <TaskVerificationList
                  setApprovedCount={setApprovedCount}
                  setReworkCount={setReworkCount}
                  setPendingCount={setPendingCount}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rework" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tasks Sent For Rework</CardTitle>
              </CardHeader>
              <CardContent>
                <TaskVerificationList
                  setApprovedCount={setApprovedCount}
                  setReworkCount={setReworkCount}
                  setPendingCount={setPendingCount}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default TaskVerifications;
