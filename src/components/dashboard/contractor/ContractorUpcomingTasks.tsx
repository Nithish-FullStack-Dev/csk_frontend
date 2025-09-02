import React from "react";
import { Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

interface UpcomingTask {
  id: string;
  title: string;
  project: string;
  unit: string;
  deadline: string;
  priority: "high" | "medium" | "low";
  daysRemaining: number;
}

const upcomingTasks: UpcomingTask[] = [
  {
    id: "ut1",
    title: "Structural column formwork",
    project: "Riverside Tower",
    unit: "Block B",
    deadline: "2025-04-20",
    priority: "high",
    daysRemaining: 9,
  },
  {
    id: "ut2",
    title: "Electrical conduiting - Ground Floor",
    project: "Valley Heights",
    unit: "Unit 3",
    deadline: "2025-04-25",
    priority: "medium",
    daysRemaining: 14,
  },
  {
    id: "ut3",
    title: "Internal wall plastering",
    project: "Green Villa",
    unit: "Villa 3",
    deadline: "2025-04-18",
    priority: "medium",
    daysRemaining: 7,
  },
  {
    id: "ut4",
    title: "Site mobilization",
    project: "Urban Square",
    unit: "Phase 1",
    deadline: "2025-04-15",
    priority: "high",
    daysRemaining: 4,
  },
  {
    id: "ut5",
    title: "Plumbing rough-in",
    project: "Riverside Tower",
    unit: "Block A",
    deadline: "2025-04-28",
    priority: "low",
    daysRemaining: 17,
  },
];

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-800",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-green-100 text-green-800",
};

interface Task {
  id: string;
  title: string;
  project: string;
  unit: string;
  deadline: string;
  daysRemaining: number;
  priority: "high" | "medium" | "low";
}

const mapPriority = (priority: string): Task["priority"] => {
  switch (priority.toLowerCase()) {
    case "high":
    case "excellent":
      return "high";
    case "medium":
    case "good":
      return "medium";
    case "low":
    case "unspecified":
    default:
      return "low";
  }
};

const ContractorUpcomingTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_URL}/api/project/tasks`,
        {
          withCredentials: true,
        }
      );

      const today = new Date();

      const mappedTasks: Task[] = response.data
        .filter((task: any) => task.status !== "completed") // Only show upcoming
        .map((task: any, index: number) => {
          const deadline = new Date(task.deadline);
          const timeDiff = deadline.getTime() - today.getTime();
          const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

          return {
            id: task._id || index.toString(),
            title: task.taskTitle,
            project: task.projectName,
            unit: task.unit,
            deadline: task.deadline,
            daysRemaining,
            priority: mapPriority(task.priority),
          };
        })
        .sort((a, b) => a.daysRemaining - b.daysRemaining); // sort by soonest

      setTasks(mappedTasks);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
      toast.error("Failed to load tasks");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="space-y-4">
      {tasks.length === 0 ? (
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
                  {task.project}, {task.unit}
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
