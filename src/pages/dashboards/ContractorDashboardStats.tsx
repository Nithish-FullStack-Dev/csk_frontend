import { useMemo } from "react";
import { Calendar, ClipboardList, Building, CheckSquare } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const ContractorDashboardStats = ({
  tasks,
  projects,
}: {
  tasks: any[];
  projects: any[];
}) => {
  const today = new Date();

  const stats = useMemo(() => {
    const activeProjects = projects.filter(
      (proj) =>
        proj.status.toLowerCase() !== "completed" &&
        proj.status.toLowerCase() !== "archived"
    );

    const tasksInProgress = tasks.filter((task) => {
      const deadline = new Date(task.deadline);
      return deadline > today;
    });

    const totalCompletedTasks = projects.reduce(
      (sum, proj) => sum + (proj.tasksCompleted || 0),
      0
    );

    const upcomingDeadlines = tasks.filter((task) => {
      const deadline = new Date(task.deadline);
      const daysLeft =
        (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return daysLeft >= 0 && daysLeft <= 7;
    });

    const highPriorityCount = upcomingDeadlines.filter(
      (task) => task.priority?.toLowerCase() === "high"
    ).length;

    return {
      activeProjects: activeProjects.length,
      tasksInProgress: tasksInProgress.length,
      completedTasks: totalCompletedTasks,
      upcomingDeadlines: upcomingDeadlines.length,
      highPriority: highPriorityCount,
    };
  }, [tasks, projects]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          <Building className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeProjects}</div>
          <p className="text-xs text-muted-foreground">
            Based on current status
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Tasks in Progress
          </CardTitle>
          <ClipboardList className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.tasksInProgress}</div>
          <p className="text-xs text-muted-foreground">
            {stats.tasksInProgress > 0
              ? `${stats.tasksInProgress} pending`
              : "All caught up"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
          <CheckSquare className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completedTasks}</div>
          <p className="text-xs text-muted-foreground">Across all projects</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Upcoming Deadlines
          </CardTitle>
          <Calendar className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.upcomingDeadlines}</div>
          <p className="text-xs text-muted-foreground">
            {stats.highPriority} high priority
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractorDashboardStats;
