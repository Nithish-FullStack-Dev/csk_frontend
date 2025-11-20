import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock } from "lucide-react";
import { Project } from "@/utils/project/ProjectConfig";

interface ContractorProjectsOverviewProps {
  projects?: Project[];
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
}

const priorityColors: Record<string, string> = {
  high: "text-red-600 bg-red-50 border-red-200",
  medium: "text-amber-600 bg-amber-50 border-amber-200",
  low: "text-green-600 bg-green-50 border-green-200",
  normal: "text-gray-600 bg-gray-50 border-gray-200",
};

const ContractorProjectsOverview: React.FC<ContractorProjectsOverviewProps> = ({
  projects,
  isLoading,
  isError,
  error,
}) => {
  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <Clock className="h-4 w-4 animate-spin" />
        Loading project details...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-sm text-red-500">
        Failed to load projects: {error?.message || "Please try again"}
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        No projects assigned yet.
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {projects.map((project) => {
        const unitsMap = project.units || {};
        const allTasks = Object.values(unitsMap).flat();

        /** Group tasks */
        const pendingTasks = allTasks.filter(
          (t: any) => t.statusForContractor?.toLowerCase() === "pending"
        );

        const inProgressTasks = allTasks.filter(
          (t: any) => t.statusForContractor?.toLowerCase() === "in progress"
        );

        const completedTasks = allTasks.filter(
          (t: any) => t.statusForContractor?.toLowerCase() === "completed"
        );

        const approvedTasks = allTasks.filter(
          (t: any) => t.isApprovedBySiteManager === true
        );

        const rejectedTasks = allTasks.filter(
          (t: any) =>
            t.statusForSiteIncharge?.toLowerCase() === "rejected" ||
            t.verificationDecision?.toLowerCase() === "rejected"
        );

        /** Project Progress % */
        const progress =
          allTasks.length > 0
            ? Math.round((completedTasks.length / allTasks.length) * 100)
            : 0;

        /** Highest priority for badge */
        const priorities = allTasks.map((t: any) =>
          (t.priority || "normal").toLowerCase()
        );

        const priorityOrder = { high: 3, medium: 2, low: 1, normal: 0 };
        const topPriority =
          priorities.length > 0
            ? priorities.reduce((a, b) =>
                priorityOrder[a] > priorityOrder[b] ? a : b
              )
            : "normal";

        const priorityColor = priorityColors[topPriority];

        return (
          <div
            key={project._id}
            className="border rounded-xl p-6 bg-card shadow-sm"
          >
            {/* Project Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {typeof project.projectId === "object"
                  ? project.projectId.projectName
                  : "Untitled Project"}
              </h2>

              <Badge variant="outline" className={priorityColor}>
                {topPriority.toUpperCase()} PRIORITY
              </Badge>
            </div>

            {/* Location */}
            <p className="text-sm text-muted-foreground mt-1">
              {typeof project.projectId === "object" &&
                project.projectId?.location}
            </p>

            {/* Floor + Unit */}
            <p className="text-sm text-muted-foreground">
              {project.floorUnit &&
                `Floor ${
                  typeof project.floorUnit === "object" &&
                  project.floorUnit.floorNumber
                }, ${
                  typeof project.floorUnit === "object" &&
                  project.floorUnit.unitType
                }`}
              {project.unit &&
                ` • Plot ${
                  typeof project.unit === "object" && project.unit.plotNo
                }`}
            </p>

            {/* Project Progress */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span className="text-muted-foreground">
                  {completedTasks.length} of {allTasks.length} tasks
                </span>
              </div>
              <Progress value={progress} />
              <p className="text-right text-xs text-muted-foreground">
                {progress}% Complete
              </p>
            </div>

            {/* ===================== TABS START ===================== */}
            <Tabs defaultValue="all" className="mt-6">
              <TabsList className="flex flex-wrap gap-2">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>

              {/* ALL TASKS */}
              <TabsContent value="all">
                <TaskList tasks={allTasks} contractors={project.contractors} />
              </TabsContent>

              {/* Pending */}
              <TabsContent value="pending">
                <TaskList
                  tasks={pendingTasks}
                  contractors={project.contractors}
                  emptyMessage="No pending tasks."
                />
              </TabsContent>

              {/* In Progress */}
              <TabsContent value="in_progress">
                <TaskList
                  tasks={inProgressTasks}
                  contractors={project.contractors}
                  emptyMessage="No tasks in progress."
                />
              </TabsContent>

              {/* Completed */}
              <TabsContent value="completed">
                <TaskList
                  tasks={completedTasks}
                  contractors={project.contractors}
                  emptyMessage="No completed tasks."
                />
              </TabsContent>

              {/* Approved */}
              <TabsContent value="approved">
                <TaskList
                  tasks={approvedTasks}
                  contractors={project.contractors}
                  emptyMessage="No approved tasks."
                />
              </TabsContent>

              {/* Rejected */}
              <TabsContent value="rejected">
                <TaskList
                  tasks={rejectedTasks}
                  contractors={project.contractors}
                  emptyMessage="No rejected tasks."
                />
              </TabsContent>
            </Tabs>
            {/* ===================== TABS END ===================== */}
          </div>
        );
      })}
    </div>
  );
};

/* ------------------ TASK LIST WRAPPER ------------------ */
const TaskList = ({
  tasks,
  contractors,
  emptyMessage = "No tasks found.",
}: any) => {
  if (!tasks || tasks.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-4 pt-3">
      {tasks.map((t: any) => (
        <TaskCard key={t._id} task={t} contractors={contractors} />
      ))}
    </div>
  );
};

/* ------------------ TASK CARD ------------------ */
const TaskCard = ({ task, contractors }: any) => {
  const contractorName =
    contractors?.find((c: any) => c._id === task.contractor)?.name ||
    "Unknown Contractor";

  const deadline = task.deadline
    ? new Date(task.deadline).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "No deadline";

  const progressVal = task.progressPercentage || 0;

  return (
    <div className="border rounded-lg p-4 space-y-2 shadow-sm bg-white">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-sm">{task.title}</h4>
        {task.priority && (
          <Badge variant="outline" className="text-xs">
            {task.priority}
          </Badge>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Contractor:{" "}
        <span className="font-medium text-foreground">{contractorName}</span>
      </p>

      <div className="flex items-center gap-2 text-sm">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">Deadline:</span> {deadline}
      </div>

      <div className="space-y-1">
        <Progress value={progressVal} />
        <p className="text-xs text-right text-muted-foreground">
          {progressVal}%
        </p>
      </div>
    </div>
  );
};

export default ContractorProjectsOverview;
