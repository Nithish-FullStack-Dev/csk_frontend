import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TaskVerificationList from "@/components/dashboard/siteincharge/TaskVerificationList";
import { ClipboardCheck, CheckCircle2, AlertTriangle } from "lucide-react";
import { fetchTasks } from "@/utils/project/ProjectConfig";
import { useQuery } from "@tanstack/react-query";
import { VerificationTask } from "@/utils/contractor/ContractorConfig";

const TaskVerifications = () => {
  const {
    data: tasks = [],
    isLoading,
    isError,
  } = useQuery<VerificationTask[]>({
    queryKey: ["taskVerificationList"],
    queryFn: fetchTasks,
  });

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
              {/* <div className="text-2xl font-bold">{pendingCount}</div> */}
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
              {/* <div className="text-2xl font-bold">{approvedCount}</div> */}
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
              {/* <div className="text-2xl font-bold">{reworkCount}</div> */}
              <p className="text-xs text-muted-foreground">
                Returned to contractors
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Task Verifications</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskVerificationList
              isError={isError}
              isLoading={isLoading}
              tasks={tasks}
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default TaskVerifications;
