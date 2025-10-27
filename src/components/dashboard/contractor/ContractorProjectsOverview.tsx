import React from "react";
import { Progress } from "@/components/ui/progress";
import { Project } from "@/utils/project/ProjectConfig";

interface ContractorProjectsOverviewProps {
  projects?: Project[];
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
}

const priorityColors = {
  high: "text-red-500 bg-red-50",
  medium: "text-amber-500 bg-amber-50",
  low: "text-green-500 bg-green-50",
  normal: "text-gray-500 bg-gray-50", // Fallback for non-standard priorities
};

const ContractorProjectsOverview: React.FC<ContractorProjectsOverviewProps> = ({
  projects,
  isLoading,
  isError,
  error,
}) => {
  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">Loading projects...</div>
    );
  }

  if (isError) {
    return (
      <div className="text-sm text-red-500">
        Error fetching projects: {error?.message || "Unknown error"}
      </div>
    );
  }

  if (!Array.isArray(projects) || projects.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No projects available.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {projects.map((project, i) => {
        // Convert units Map (object) to array of [unitName, tasks]
        const units = Object.entries(project.units || {});

        // Calculate total units and completed units
        const totalUnits = units.length;
        const unitsCompleted = units.filter(([_, tasks]) =>
          tasks.every(
            (task) =>
              task.statusForContractor === "completed" &&
              task.isApprovedBySiteManager
          )
        ).length;

        // Calculate total tasks and completed tasks
        const totalTasks = units.reduce(
          (sum, [_, tasks]) => sum + tasks.length,
          0
        );
        const tasksCompleted = units.reduce(
          (sum, [_, tasks]) =>
            sum +
            tasks.filter(
              (task) =>
                task.statusForContractor === "completed" &&
                task.isApprovedBySiteManager
            ).length,
          0
        );

        // Calculate progress
        const progress = Math.round(
          ((unitsCompleted + tasksCompleted) / (totalUnits + totalTasks || 1)) *
            100
        );

        // Normalize priority for display
        const priority = project.priority?.toLowerCase() || "normal";
        const priorityColor = priorityColors[priority] || priorityColors.normal;

        return (
          <div key={i} className="border rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">
                {(typeof project.projectId === "object" &&
                  project.projectId?.projectName) ||
                  "Untitled Project"}
              </h3>
              <span
                className={`text-xs px-2 py-1 rounded-full ${priorityColor}`}
              >
                {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
              </span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                Deadline:{" "}
                {project.deadline
                  ? new Date(project.deadline).toLocaleDateString()
                  : "N/A"}
              </span>
              <span>{progress}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="grid grid-cols-2 gap-4 text-sm pt-2">
              <div>
                <p className="text-muted-foreground">Units</p>
                <p>
                  {unitsCompleted} of {totalUnits} completed
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Tasks</p>
                <p>
                  {tasksCompleted} of {totalTasks} completed
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ContractorProjectsOverview;
