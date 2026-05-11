import React, { useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TaskVerificationList from "@/components/dashboard/siteincharge/TaskVerificationList";
import { ClipboardCheck, CheckCircle2, AlertTriangle } from "lucide-react";
import { fetchTasks } from "@/utils/project/ProjectConfig";
import { useQuery } from "@tanstack/react-query";
import { VerificationTask } from "@/utils/contractor/ContractorConfig";
import { useAuth } from "@/contexts/AuthContext";

const TaskVerifications = () => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("all");

  const {
    data: tasks = [],
    isLoading,
    isError,
  } = useQuery<VerificationTask[]>({
    queryKey: ["taskVerificationList"],
    queryFn: fetchTasks,
  });

  const isSiteIncharge = user?.role === "site_incharge";

  // which status field should be used
  const statusKey = isSiteIncharge ? "siteInchargeStatus" : "contractorStatus";

  // ---------------- FILTERED TASKS ----------------
  const filteredTasks = useMemo(() => {
    if (activeFilter === "all") return tasks;

    return tasks.filter(
      (task: any) =>
        task?.[statusKey]?.toLowerCase() === activeFilter.toLowerCase(),
    );
  }, [tasks, activeFilter, statusKey]);

  // ---------------- COUNTS ----------------

  const pendingCount = useMemo(() => {
    if (isSiteIncharge) {
      return tasks.filter(
        (task: any) => task?.siteInchargeStatus === "pending verification",
      ).length;
    }

    return tasks.filter(
      (task: any) => task?.contractorStatus === "pending_review",
    ).length;
  }, [tasks, isSiteIncharge]);

  const approvedCount = useMemo(() => {
    if (isSiteIncharge) {
      return tasks.filter(
        (task: any) => task?.siteInchargeStatus === "approved",
      ).length;
    }

    return tasks.filter((task: any) => task?.contractorStatus === "completed")
      .length;
  }, [tasks, isSiteIncharge]);

  const reworkCount = useMemo(() => {
    if (isSiteIncharge) {
      return tasks.filter(
        (task: any) =>
          task?.siteInchargeStatus === "rework" ||
          task?.siteInchargeStatus === "rejected",
      ).length;
    }

    return tasks.filter((task: any) => task?.contractorStatus === "in_progress")
      .length;
  }, [tasks, isSiteIncharge]);

  return (
    <MainLayout>
      <div className="space-y-6 md:p-8 p-2">
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Task Verifications
          </h1>

          <p className="text-muted-foreground">
            Verify and approve completed construction tasks from contractors
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* CARD 1 */}
          <Card
            onClick={() =>
              setActiveFilter(
                isSiteIncharge ? "pending verification" : "pending_review",
              )
            }
            className={`cursor-pointer transition-all hover:shadow-md ${
              activeFilter ===
              (isSiteIncharge ? "pending verification" : "pending_review")
                ? "border-amber-500 bg-amber-50"
                : ""
            }`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isSiteIncharge ? "Pending Verifications" : "Pending Review"}
              </CardTitle>

              <ClipboardCheck className="h-4 w-4 text-amber-500" />
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>

              <p className="text-xs text-muted-foreground">
                {isSiteIncharge
                  ? "Requires your inspection"
                  : "Waiting for approval"}
              </p>
            </CardContent>
          </Card>

          {/* CARD 2 */}
          <Card
            onClick={() =>
              setActiveFilter(isSiteIncharge ? "approved" : "completed")
            }
            className={`cursor-pointer transition-all hover:shadow-md ${
              activeFilter === (isSiteIncharge ? "approved" : "completed")
                ? "border-green-500 bg-green-50"
                : ""
            }`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isSiteIncharge ? "Approved Tasks" : "Completed Tasks"}
              </CardTitle>

              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-bold">{approvedCount}</div>

              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          {/* CARD 3 */}
          <Card
            onClick={() =>
              setActiveFilter(isSiteIncharge ? "rework" : "in_progress")
            }
            className={`cursor-pointer transition-all hover:shadow-md ${
              activeFilter === (isSiteIncharge ? "rework" : "in_progress")
                ? "border-red-500 bg-red-50"
                : ""
            }`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isSiteIncharge ? "Tasks Needing Rework" : "In Progress Tasks"}
              </CardTitle>

              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-bold">{reworkCount}</div>

              <p className="text-xs text-muted-foreground">
                {isSiteIncharge
                  ? "Returned to contractors"
                  : "Currently active"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* TASK LIST */}
        <Card>
          <CardHeader>
            <CardTitle>Task Verifications</CardTitle>
          </CardHeader>

          <CardContent>
            <TaskVerificationList
              isError={isError}
              isLoading={isLoading}
              tasks={filteredTasks}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              statusKey={statusKey}
              isSiteIncharge={isSiteIncharge}
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default TaskVerifications;
