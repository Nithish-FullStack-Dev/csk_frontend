import React from 'react';
import { Progress } from "@/components/ui/progress";

interface ContractorProjectsOverviewProps {
  projects?: {
    projectTitle: string;
    deadline: string;
    priority: "high" | "medium" | "low";
    totalUnits: number;
    unitsCompleted: number;
    totalTasks: number;
    tasksCompleted: number;
  }[];
}

const priorityColors = {
  high: 'text-red-500 bg-red-50',
  medium: 'text-amber-500 bg-amber-50',
  low: 'text-green-500 bg-green-50'
};

const ContractorProjectsOverview: React.FC<ContractorProjectsOverviewProps> = ({ projects }) => {
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
        const progress = Math.round(
          ((project.unitsCompleted + project.tasksCompleted) /
            (project.totalUnits + project.totalTasks || 1)) * 100
        );

        return (
          <div key={i} className="border rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">{project.projectTitle || "Untitled Project"}</h3>
              <span
                className={`text-xs px-2 py-1 rounded-full ${priorityColors[project.priority]}`}
              >
                {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)} Priority
              </span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString() : "N/A"}</span>
              <span>{progress}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="grid grid-cols-2 gap-4 text-sm pt-2">
              <div>
                <p className="text-muted-foreground">Units</p>
                <p>{project.unitsCompleted} of {project.totalUnits} completed</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tasks</p>
                <p>{project.tasksCompleted} of {project.totalTasks} completed</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ContractorProjectsOverview;
