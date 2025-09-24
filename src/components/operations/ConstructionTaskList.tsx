import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Check,
  Clock,
  AlertTriangle,
  XCircle,
  Eye,
  Pencil,
} from "lucide-react";
import { CONSTRUCTION_PHASES } from "@/types/construction";
import { Progress } from "@/components/ui/progress";

const ConstructionTaskList = ({ tasks }) => {
  const [phase, setPhase] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  // Map backend status to frontend status for consistency with original UI
  const mapStatus = (backendStatus) => {
    switch (backendStatus.toLowerCase()) {
      case "in progress":
        return "in_progress";
      case "completed":
        return "completed";
      case "pending verification":
        return "pending";
      case "approved":
        return "completed";
      case "rework":
      case "rejected":
        return "on_hold";
      default:
        return "pending";
    }
  };

  const getStatusBadge = (status) => {
    const mappedStatus = mapStatus(status);
    switch (mappedStatus) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            <Clock className="mr-1 h-3 w-3" />
            In Progress
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            <Check className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case "delayed":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Delayed
          </Badge>
        );
      case "on_hold":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            <XCircle className="mr-1 h-3 w-3" />
            On Hold
          </Badge>
        );
      default:
        return null;
    }
  };

  // Filter tasks based on phase, status, and search
  const filteredTasks = tasks.filter((task) => {
    const matchesPhase =
      phase === "all" ? true : task.constructionPhase === phase;
    const matchesStatus =
      status === "all" ? true : mapStatus(task.status) === status;
    const matchesSearch = search
      ? task.taskTitle.toLowerCase().includes(search.toLowerCase()) ||
        (task.projectName || "").toLowerCase().includes(search.toLowerCase())
      : true;

    return matchesPhase && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Construction Tasks</CardTitle>
            {/* Skipped "Add New Task" button as per instructions */}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label>Search</Label>
              <Input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Filter by Phase</Label>
              <Select value={phase} onValueChange={setPhase}>
                <SelectTrigger>
                  <SelectValue placeholder="All Phases" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Phases</SelectItem>
                  {Object.entries(CONSTRUCTION_PHASES).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Filter by Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No tasks match your filters
              </p>
            ) : (
              filteredTasks.map((task) => (
                <Card key={task._id} className="overflow-hidden">
                  <div className="border-l-4 border-blue-500 pl-4 py-4">
                    <div className="flex flex-col md:flex-row md:justify-between">
                      <div>
                        <h3 className="font-medium text-lg">
                          {task.taskTitle}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 mb-2">
                          {task.projectName} - {task.unit}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge
                            variant="outline"
                            className="bg-indigo-100 text-indigo-800"
                          >
                            {CONSTRUCTION_PHASES[task.constructionPhase]
                              ?.title || task.constructionPhase}
                          </Badge>
                          {getStatusBadge(task.status)}
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 md:ml-4 md:text-right">
                        <p className="text-sm text-muted-foreground">
                          {task.deadline
                            ? new Date(task.deadline).toLocaleDateString()
                            : "No Deadline"}
                        </p>
                        <div className="mt-2">
                          <div className="flex items-center justify-end gap-1 mb-1">
                            <span className="text-xs text-muted-foreground">
                              Progress:
                            </span>
                            <span className="text-xs font-medium">
                              {task.progress || 0}%
                            </span>
                          </div>
                          <Progress
                            value={task.progress || 0}
                            className="h-2"
                          />
                        </div>
                        <div className="flex justify-end gap-2 mt-3">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConstructionTaskList;
