import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, MoreVertical, Edit2 } from "lucide-react";
import { Project } from "@/utils/project/ProjectConfig";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import EditProjectDialog from "./EditProjectDialog";

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

const statusColors: Record<string, string> = {
  "in progress": "text-blue-600 bg-blue-50 border-blue-200",
  completed: "text-green-600 bg-green-50 border-green-200",
  "Not Started": "text-gray-600 bg-gray-50 border-gray-200",
  planning: "text-indigo-600 bg-indigo-50 border-indigo-200",
  "on hold": "text-yellow-600 bg-yellow-50 border-yellow-200",
  delayed: "text-red-600 bg-red-50 border-red-200",
  "under inspection": "text-purple-600 bg-purple-50 border-purple-200",
};

const ContractorProjectsOverview: React.FC<ContractorProjectsOverviewProps> = ({
  projects,
  isLoading,
  isError,
  error,
}) => {
  const [editProject, setEditProject] = useState<Project | null>(null);

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
    <>
      <div className="space-y-7">
        {projects?.map((project) => {
          const unitsMap = project.units || {};
          const allTasks = Object.values(unitsMap).flat();

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

          const progress =
            allTasks.length > 0
              ? Math.round((completedTasks.length / allTasks.length) * 100)
              : 0;

          return (
            <div
              key={project._id}
              className="border rounded-xl p-6 bg-card shadow-sm relative"
            >
              {/* Three-dot menu */}
              <div className="absolute top-4 right-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setEditProject(project)}
                      className="cursor-pointer"
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit Project
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Project Header */}
              <div className="flex items-center justify-between pr-10">
                <h2 className="text-xl font-semibold">
                  {typeof project.projectId === "object"
                    ? project.projectId.projectName
                    : "Untitled Project"}
                </h2>

                <Badge
                  variant="outline"
                  className={`text-sm ${
                    statusColors[
                      (project.status || "not started").toLowerCase()
                    ] || statusColors["not started"]
                  }`}
                >
                  {project?.status || "Status Unknown"}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground mt-1">
                {typeof project.projectId === "object" &&
                  project.projectId?.location}
              </p>

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

              <div>
                <p className="text-sm text-muted-foreground mt-2">
                  Client: {project.clientName || "N/A"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Estimated Budget: ₹
                  {project.estimatedBudget
                    ? project.estimatedBudget.toLocaleString("en-IN")
                    : "N/A"}
                </p>
              </div>

              {/* Progress */}
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

              {/* Tabs */}
              <Tabs defaultValue="all" className="mt-6">
                <TabsList className="flex flex-wrap gap-2">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  <TaskList
                    tasks={allTasks}
                    contractors={project.contractors}
                  />
                </TabsContent>
                <TabsContent value="pending">
                  <TaskList
                    tasks={pendingTasks}
                    contractors={project.contractors}
                  />
                </TabsContent>
                <TabsContent value="in_progress">
                  <TaskList
                    tasks={inProgressTasks}
                    contractors={project.contractors}
                  />
                </TabsContent>
                <TabsContent value="completed">
                  <TaskList
                    tasks={completedTasks}
                    contractors={project.contractors}
                  />
                </TabsContent>
                <TabsContent value="approved">
                  <TaskList
                    tasks={approvedTasks}
                    contractors={project.contractors}
                  />
                </TabsContent>
                <TabsContent value="rejected">
                  <TaskList
                    tasks={rejectedTasks}
                    contractors={project.contractors}
                  />
                </TabsContent>
              </Tabs>
            </div>
          );
        })}
      </div>

      {/* Edit Dialog */}
      {editProject && (
        <EditProjectDialog
          project={editProject}
          open={!!editProject}
          onOpenChange={(open) => !open && setEditProject(null)}
        />
      )}
    </>
  );
};

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
          <Badge
            variant="outline"
            className={`text-xs ${
              priorityColors[task.priority] || priorityColors.normal
            }`}
          >
            {task?.priority}
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
