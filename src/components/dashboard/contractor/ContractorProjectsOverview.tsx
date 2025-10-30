import React from "react";
import { Progress } from "@/components/ui/progress";
import { Project } from "@/utils/project/ProjectConfig";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";

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
    <div className="space-y-5">
      {projects.map((project) => {
        const unitsMap = project.units || {};
        const units = Object.entries(unitsMap);

        // Count total & completed tasks
        let totalTasks = 0;
        let completedTasks = 0;

        units.forEach(([_, tasks]) => {
          totalTasks += tasks.length;
          completedTasks += tasks.filter(
            (t) =>
              t.statusForContractor === "completed" &&
              t.isApprovedBySiteManager === true
          ).length;
        });

        const progress =
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        const taskDeadlines = units
          .flatMap(([_, tasks]) => tasks.map((t) => t.deadline).filter(Boolean))
          .map((d) => new Date(d));

        const latestDeadline =
          taskDeadlines.length > 0
            ? new Date(Math.max(...taskDeadlines.map((d) => d.getTime())))
            : null;

        const deadline = latestDeadline
          ? latestDeadline.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "No deadline";

        // Find highest priority from tasks
        const taskPriorities = units
          .flatMap(([_, tasks]) =>
            tasks.map((t) => (t.priority || "normal").toLowerCase())
          )
          .filter(Boolean);

        const priorityOrder = { high: 3, medium: 2, low: 1, normal: 0 };
        const topPriority =
          taskPriorities.length > 0
            ? taskPriorities.reduce((a, b) =>
                priorityOrder[a] > priorityOrder[b] ? a : b
              )
            : "normal";

        const priorityColor =
          priorityColors[topPriority] || priorityColors.normal;

        return (
          <div
            key={project._id}
            className="border rounded-lg p-5 space-y-3 bg-card hover:shadow-sm transition-shadow"
          >
            {/* Header */}
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg text-foreground">
                {(typeof project.projectId === "object" &&
                  project.projectId?.projectName) ||
                  "Untitled Project"}
              </h3>
              <Badge
                variant="outline"
                className={`text-xs font-medium border ${priorityColor}`}
              >
                {topPriority.charAt(0).toUpperCase() + topPriority.slice(1)}{" "}
                Priority
              </Badge>
            </div>

            {/* Location + Floor/Unit */}
            <div className="text-sm text-muted-foreground space-y-1">
              {typeof project.projectId === "object" &&
                project.projectId?.location && (
                  <p>
                    {typeof project.projectId === "object" &&
                      project.projectId.location}
                  </p>
                )}
              <p>
                {typeof project.floorUnit === "object" &&
                  project.floorUnit?.floorNumber &&
                  `Floor ${project.floorUnit.floorNumber}, ${project.floorUnit.unitType}`}
                {typeof project.unit === "object" &&
                  project.unit?.plotNo &&
                  ` • Plot ${project.unit.plotNo}`}
              </p>
            </div>

            {/* Deadline */}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Deadline:</span>
              <span
                className={
                  latestDeadline && latestDeadline < new Date()
                    ? "text-red-600"
                    : ""
                }
              >
                {deadline}
              </span>
            </div>

            {/* Task Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Task Progress</span>
                <span className="text-muted-foreground">
                  {completedTasks} of {totalTasks} tasks
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">
                {progress}% Complete
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ContractorProjectsOverview;
