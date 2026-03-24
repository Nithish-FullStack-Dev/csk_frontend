import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { Project, statusColors } from "@/utils/project/ProjectConfig";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import EditProjectDialog from "./EditProjectDialog";
import TaskList from "./TaskList";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRBAC } from "@/config/RBAC";
import ViewProjectDialog from "./ViewProjectDialog";

interface ContractorProjectsOverviewProps {
  projects?: Project[];
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  onDeleteProject?: (projectId: string) => void;
}

const ContractorProjectsOverview: React.FC<ContractorProjectsOverviewProps> = ({
  projects,
  isLoading,
  isError,
  error,
  onDeleteProject,
}) => {
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [selectedTabs, setSelectedTabs] = useState<Record<string, string>>({});
  const [viewProject, setViewProject] = useState<Project | null>(null);

  const { userCanEditUser } = useRBAC({
    roleSubmodule: "Projects Overview",
  });

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
        {projects.map((project) => {
          const unitsMap = project.units || {};
          const allTasks = Object.values(unitsMap).flat();

          const pendingTasks = allTasks.filter(
            (t: any) =>
              t.statusForContractor?.toLowerCase() === "pending_review",
          );
          const inProgressTasks = allTasks.filter(
            (t: any) => t.statusForContractor?.toLowerCase() === "in_progress",
          );
          const completedTasks = allTasks.filter(
            (t: any) => t.statusForContractor?.toLowerCase() === "completed",
          );
          const approvedTasks = allTasks.filter(
            (t: any) => t.isApprovedBySiteManager === true,
          );
          const rejectedTasks = allTasks.filter(
            (t: any) =>
              t.statusForSiteIncharge?.toLowerCase() === "rejected" ||
              t.verificationDecision?.toLowerCase() === "rejected",
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
              {/* Menu */}
              <div className="absolute top-4 right-4">
                <DropdownMenu>
                  {userCanEditUser && (
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  )}

                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={() => setEditProject(project)}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit Project
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => setViewProject(project)}>
                      View Details
                    </DropdownMenuItem>

                    {/* <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault(); // prevents dropdown closing before dialog opens
                            setDeleteProjectId(project._id);
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Project
                        </DropdownMenuItem>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Project?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete this project and its tasks.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {deletingId === project._id
                              ? "Deleting..."
                              : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog> */}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Header */}
              <div className="flex items-center justify-between pr-10">
                <h2 className="text-xl font-semibold">
                  {project.projectId && typeof project.projectId === "object"
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
                  Site Incharge Assigned:{" "}
                  {typeof project?.siteIncharge === "object"
                    ? project?.siteIncharge?.name
                    : "N/A"}
                </p>
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
              <div className="my-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span className="text-muted-foreground">
                    {completedTasks.length} of {allTasks.length} tasks
                  </span>
                </div>
                <Progress value={progress} />
              </div>

              {/* Tabs */}
              <Tabs
                value={selectedTabs[project._id] || "all"}
                onValueChange={(value) =>
                  setSelectedTabs((prev) => ({
                    ...prev,
                    [project._id]: value,
                  }))
                }
              >
                {/* Mobile */}
                <div className="md:hidden">
                  <Select
                    value={selectedTabs[project._id] || "all"}
                    onValueChange={(value) =>
                      setSelectedTabs((prev) => ({
                        ...prev,
                        [project._id]: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Tab" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="pending_review">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <TabsList className="hidden md:inline-block">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending_review">Pending</TabsTrigger>
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
                <TabsContent value="pending_review">
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

      {editProject && (
        <EditProjectDialog
          project={editProject}
          open={!!editProject}
          onOpenChange={(open) => !open && setEditProject(null)}
        />
      )}
      {viewProject && (
        <ViewProjectDialog
          project={viewProject}
          open={!!viewProject}
          onOpenChange={(open) => !open && setViewProject(null)}
        />
      )}
    </>
  );
};

export default ContractorProjectsOverview;
