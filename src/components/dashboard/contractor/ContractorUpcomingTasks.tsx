import React from "react";
import { Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useFetchTasks } from "@/utils/project/ProjectConfig";
import CircleLoader from "@/components/CircleLoader";

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-800",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-green-100 text-green-800",
};

const ContractorUpcomingTasks = () => {
  const { data: tasks = [], isLoading, isError, error } = useFetchTasks();

  if (isError) {
    toast.error(`Error fetching tasks: ${error?.message || "Unknown error"}`);
    console.log(error);
    return null;
  }

  return (
    <div className="space-y-4">
      {isLoading ? (
        <CircleLoader />
      ) : tasks.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No upcoming tasks found.
        </p>
      ) : (
        tasks.map((task) => (
          <div key={task.id} className="border rounded-md p-3 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{task.title}</p>
                <p className="text-sm text-muted-foreground">
                  {task.project}- Floor {task.floorNumber}, {task.unitType}
                </p>
              </div>
              <Badge
                variant="outline"
                className={priorityColors[task.priority]}
              >
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{new Date(task.deadline).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span
                  className={
                    task.daysRemaining <= 5 ? "text-red-600 font-medium" : ""
                  }
                >
                  {task.daysRemaining <= 0
                    ? "Due today"
                    : `${task.daysRemaining} ${
                        task.daysRemaining === 1 ? "day" : "days"
                      } left`}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ContractorUpcomingTasks;
