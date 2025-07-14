import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MoreHorizontal,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Camera,
  AlertCircle,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import AddTaskDialog from "./AddTaskDialog";
import { DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, XCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ClipboardCheck } from "lucide-react";

const constructionPhases = [
  "site_mobilization",
  "groundwork_foundation",
  "structural_framework",
  "slab_construction",
  "masonry_work",
  "roofing",
  "internal_finishing",
  "external_finishing",
  "electrical_works",
  "plumbing_works",
  "hvac_works",
  "fire_safety",
  "project_management",
  "snagging_rectification",
];

const statusOptions = ["pending review", "In progress", "completed"];

interface Task {
  id: string;
  title: string;
  project: string;
  projectId: string;
  _id: string;
  unit: string;
  phase: string;
  status:
    | "pending verification"
    | "In progress"
    | "completed"
    | "approved"
    | "rejected";
  deadline: string;
  priority: "high" | "medium" | "low";
  progress?: number;
  hasEvidence?: boolean;
  evidenceTitle: string;
  contractorUploadedPhotos: [string];
  statusForContractor: string;
  noteBySiteIncharge: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-800",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-green-100 text-green-800",
};

const ContractorTaskList = () => {
  const [tasks, setTasks] = useState<Task[]>();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [uploadEvidenceOpen, setUploadEvidenceOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [evidenceTitle, setEvidenceTitle] = useState("");
  const [selectedPhase, setSelectedPhase] = useState("");
  const [status, setStatus] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task>();
  const [progress, setProgress] = useState(0);
  const [shouldSubmit, setShouldSubmit] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [photoLocations, setPhotoLocations] = useState<
    { latitude: number; longitude: number }[]
  >([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPhotos: File[] = [];
    const newLocations: { latitude: number; longitude: number }[] = [];

    for (const file of files) {
      newPhotos.push(file);

      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject)
        );
        newLocations.push({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        console.log(newLocations)
      } catch (err) {
        console.warn("GPS access denied or unavailable");
        newLocations.push({ latitude: 0, longitude: 0 }); // fallback or null
      }
    }

    setPhotos((prev) => [...prev, ...newPhotos]);
    setPhotoLocations((prev) => [...prev, ...newLocations]);
  };

  const removePhoto = (indexToRemove: number) => {
  setPhotos((prev) => prev.filter((_, i) => i !== indexToRemove));
  setPhotoLocations((prev) => prev.filter((_, i) => i !== indexToRemove));
};


  const mapStatus = (status: string): Task["status"] => {
    switch (status.toLowerCase()) {
      case "pending verification":
        return "pending verification";
      case "approved":
        return "approved";
      case "rejected":
        return "rejected";
      case "in progress":
        return "In progress";
      case "completed":
        return "completed";
    }
  };

  const mapPriority = (priority: string): Task["priority"] => {
    switch (priority.toLowerCase()) {
      case "excellent":
        return "high";
      case "good":
        return "medium";
      case "unspecified":
        return "low";
      default:
        return "medium";
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/project/tasks",
        { withCredentials: true }
      );
      const mapped = response.data.map((task: any, index: number) => ({
        id: index.toString(), // Replace with real id if available
        title: task.taskTitle,
        project: task.projectName,
        unit: task.unit,
        phase: task.constructionPhase,
        status: mapStatus(task.status), // normalize status if needed
        deadline: task.deadline,
        progress: task.progress,
        priority: mapPriority(task.priority),
        hasEvidence: task.contractorUploadedPhotos.length > 0,
        _id: task._id,
        projectId: task.projectId,
      }));
      setTasks(mapped);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Upload photos one-by-one
    const uploadedImageUrls: string[] = [];
    for (const photo of photos) {
      const formData = new FormData();
      formData.append("file", photo);

      try {
        const res = await axios.post(
          "http://localhost:3000/api/uploads/upload",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        if (res.data.url) uploadedImageUrls.push(res.data.url);
      } catch (err) {
        console.error("Upload failed", err);
      }
    }

    // 2. Create new task object
    const newTask = {
      evidenceTitleByContractor: evidenceTitle,
      status,
      progressPercentage: progress,
      photos: uploadedImageUrls,
      constructionPhase: selectedPhase,
      shouldSubmit,
    };

    // 3. Send inspection data to backend
    try {
      await axios.patch(
        `http://localhost:3000/api/project/contractor/${selectedTask.projectId}/${selectedTask._id}/task`,
        newTask,
        { withCredentials: true }
      );
      toast.success("Task Updated successfully!");
      fetchTasks();
    } catch (error) {
      toast.error("Failed to update task.");
      console.error("Updation error:", error);
    } finally {
      setUploadEvidenceOpen(false);
      setIsUpdating(false);
      setStatus("");
      setEvidenceTitle("");
      setPhotos([]);
      setProgress(0);
      setSelectedPhase("");
    }
  };

  const handleEditTask = async () => {
    try {
      const res = await axios.put(
        `http://localhost:3000/api/project/contractor/${selectedTask.projectId}/${selectedTask._id}/mini/task`,
        {
          phase: selectedPhase,
          progress: progress,
          status: status,
        },
        { withCredentials: true }
      );

      if (res?.data?.success) {
        toast.success("Task updated successfully");
        setEditTaskOpen(false);
        fetchTasks();
      } else {
        toast.error("Failed to update task");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating task");
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchTasks()
  }, []);

  let filteredTasks = [];
  if (tasks) {
    filteredTasks = tasks.filter((task) => {
      if (filter !== "all" && task.status !== filter) {
        return false;
      }

      if (
        searchQuery &&
        !task.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }

  const handleStatusChange = (taskId: string, newStatus: Task["status"]) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );

    const task = tasks.find((t) => t.id === taskId);

    if (newStatus === "completed") {
      toast.success(`Task marked as completed`, {
        description: `${task?.title} has been sent for verification by Site In-charge`,
      });
    } else {
      toast.success(`Task status updated`, {
        description: `${task?.title} is now ${newStatus.replace("_", " ")}`,
      });
    }
  };

  const handleUploadEvidence = (task) => {
    setSelectedTask(task);
    setSelectedTaskId(task.id);
    setUploadEvidenceOpen(true);
  };

  if (!tasks) return <div>Loading tasks...</div>;
  if (tasks.length === 0) return <div>No tasks.</div>;
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filter by Project</DropdownMenuLabel>
              <DropdownMenuItem>Riverside Tower</DropdownMenuItem>
              <DropdownMenuItem>Valley Heights</DropdownMenuItem>
              <DropdownMenuItem>Green Villa</DropdownMenuItem>
              <DropdownMenuItem>Urban Square</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Dialog open={addTaskOpen} onOpenChange={setAddTaskOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <AddTaskDialog
            onOpenChange={setAddTaskOpen}
            fetchTasks={fetchTasks}
          />
        </Dialog>
      </div>

      <Tabs defaultValue="all" onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Project / Unit</TableHead>
              <TableHead>Phase</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell>
                  {task.project} / {task.unit}
                </TableCell>
                <TableCell>{task.phase}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={statusColors[task.status]}
                  >
                    {task.status
                      .replace("_", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(task.deadline).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {task.progress !== undefined ? `${task.progress}%` : "-"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={priorityColors[task.priority]}
                  >
                    {task.priority.charAt(0).toUpperCase() +
                      task.priority.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setProgress(task.progress);
                        //setStatus(task.status);
                        handleUploadEvidence(task);
                      }}
                      className={
                        task.hasEvidence
                          ? "text-blue-600 hover:text-blue-800"
                          : ""
                      }
                    >
                      <Camera className="h-4 w-4" />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="max-h-[250px]"
                        sideOffset={8}
                      >
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedTask(task);
                            setViewDetailsOpen(true);
                          }}
                        >
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedTask(task);
                            setProgress(task.progress);
                            setSelectedPhase(task.phase);
                            setEditTaskOpen(true);
                          }}
                        >
                          Edit Task
                        </DropdownMenuItem>
                        {task.status === "pending" && (
                          <DropdownMenuItem>
                            Mark as In Progress
                          </DropdownMenuItem>
                        )}
                        {(task.status === "pending" ||
                          task.status === "in_progress") && (
                          <DropdownMenuItem>Mark as Completed</DropdownMenuItem>
                        )}
                        {task.status === "rejected" && (
                          <DropdownMenuItem>Resume Work</DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => {
                            handleUploadEvidence(task);
                          }}
                        >
                          Upload Photos
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* <Dialog open={uploadEvidenceOpen} onOpenChange={setUploadEvidenceOpen}>
        <UploadEvidenceDialog
          onOpenChange={setUploadEvidenceOpen}
          projects={projectsData}
          tasks={taskForEvidence}
          onSubmit={handleEvidenceSubmit}
        />
      </Dialog> */}

      <Dialog open={uploadEvidenceOpen} onOpenChange={setUploadEvidenceOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Evidence</DialogTitle>
            <DialogDescription>
              Submit visual proof of work completed at the site.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-4 px-1">
            {/* Static display of project & unit */}
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">Project</p>
              <p className="font-medium text-base">
                {selectedTask?.project || "Untitled"}
              </p>
            </div>

            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">Unit / Block</p>
              <p className="font-medium text-base">
                {selectedTask?.unit || "N/A"}
              </p>
            </div>

            {/* Evidence Title */}
            <div className="space-y-1.5">
              <Label htmlFor="evidence-title">Evidence Title</Label>
              <Input
                id="evidence-title"
                value={evidenceTitle}
                onChange={(e) => setEvidenceTitle(e.target.value)}
              />
            </div>

            {/* Construction Phase Dropdown */}
            <div className="space-y-1.5">
              <Label htmlFor="phase">Construction Phase</Label>
              <Select value={selectedPhase} onValueChange={setSelectedPhase}>
                <SelectTrigger id="phase">
                  <SelectValue placeholder="Select phase" />
                </SelectTrigger>
                <SelectContent>
                  {constructionPhases.map((phase) => (
                    <SelectItem key={phase} value={phase}>
                      {phase
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Progress Percentage Slider */}
            <div className="space-y-1.5">
              <Label htmlFor="progress">Progress Percentage</Label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  id="progress"
                  min={0}
                  max={100}
                  step={1}
                  value={progress}
                  onChange={(e) => {
                    setProgress(Number(e.target.value));
                    if (e.target.value == "100") {
                      setShouldSubmit(true);
                      setStatus("completed");
                    } else {
                      setShouldSubmit(false);
                      setStatus("");
                    }
                  }}
                  className="w-full accent-blue-600"
                />
                <span className="text-sm font-medium w-12 text-right tabular-nums">
                  {progress}%
                </span>
              </div>
            </div>

            {/* Status Dropdown */}
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(value) => {
                  setStatus(value);
                  setShouldSubmit(value === "completed");
                  if (value === "completed") {
                    setProgress(100);
                  }
                }}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Upload Photos</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-2">
                {photos.map((photo, index) => (
                  <div
                    key={index}
                    className="relative rounded-md overflow-hidden border border-border h-32 group"
                  >
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Inspection ${index + 1}`}
                      className="w-full h-full object-cover"
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 bg-black bg-opacity-60 hover:bg-opacity-80 rounded-full"
                      onClick={() => {
                        removePhoto(index);
                      }}
                    >
                      <XCircle className="h-4 w-4 text-white" />
                    </Button>

                    {photoLocations[index]?.latitude !== 0 && (
                      <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-[10px] px-2 py-0.5 rounded">
                        {photoLocations[index].latitude.toFixed(3)},{" "}
                        {photoLocations[index].longitude.toFixed(3)}
                      </div>
                    )}
                  </div>
                ))}

                {photos.length < 9 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-32 border-dashed flex flex-col"
                    onClick={() =>
                      document
                        .getElementById("inspection-photo-upload")
                        ?.click()
                    }
                  >
                    <Upload className="mb-2 h-6 w-6" />
                    <span>Add Photos</span>
                  </Button>
                )}
              </div>
              <Input
                id="inspection-photo-upload"
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setUploadEvidenceOpen(false);
                setIsUpdating(false);
                setStatus("");
                setEvidenceTitle("");
                setPhotos([]);
                setProgress(0);
                setSelectedPhase("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdating}
              onClick={(e) => {
                handleSubmit(e);
                setIsUpdating(true);
              }}
            >
              {shouldSubmit
                ? "Submit to Site Incharge"
                : isUpdating
                ? "Updating...."
                : "Update task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-blue-500" />
              Task Details
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold">
                  {selectedTask && selectedTask.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedTask && selectedTask.phase}
                </p>
              </div>
              {selectedTask && (
                <Badge
                  className={`${
                    selectedTask.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : selectedTask.status === "In progress"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {(selectedTask &&
                    selectedTask?.status
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())) ||
                    "-"}
                </Badge>
              )}
            </div>

            <Separator />

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Project / Unit:</p>
                <p>
                  {(selectedTask && selectedTask.project) || "-"} /{" "}
                  {(selectedTask && selectedTask.unit) || "-"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Deadline:</p>
                {selectedTask && (
                  <p>{new Date(selectedTask.deadline).toLocaleDateString()}</p>
                )}
              </div>
              <div>
                <p className="text-muted-foreground">Priority:</p>
                {selectedTask && (
                  <Badge
                    className={`${
                      selectedTask.priority === "high"
                        ? "bg-red-100 text-red-800"
                        : selectedTask.priority === "medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {selectedTask.priority?.charAt(0).toUpperCase() +
                      selectedTask.priority?.slice(1)}
                  </Badge>
                )}
              </div>
              <div>
                <p className="text-muted-foreground">Progress:</p>
                <p>{(selectedTask && selectedTask.progress) || 0}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phase:</p>
                <p>{(selectedTask && selectedTask.phase) || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Construction Status:</p>
                <p>
                  {(selectedTask && selectedTask.statusForContractor) || "-"}
                </p>
              </div>
            </div>

            {selectedTask && selectedTask.noteBySiteIncharge && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Note by Site Incharge:
                  </p>
                  <p className="mt-1">{selectedTask.noteBySiteIncharge}</p>
                </div>
              </>
            )}

            <DialogFooter className="pt-4">
              <Button
                variant="outline"
                onClick={() => setViewDetailsOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editTaskOpen} onOpenChange={setEditTaskOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Your Task</DialogTitle>
            <DialogDescription>
              Change the details you want to edit
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-4 px-1">
            {/* Static display of project & unit */}
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">Project</p>
              <p className="font-medium text-base">
                {selectedTask?.project || "Untitled"}
              </p>
            </div>

            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">Unit / Block</p>
              <p className="font-medium text-base">
                {selectedTask?.unit || "N/A"}
              </p>
            </div>

            {/* Construction Phase Dropdown */}
            <div className="space-y-1.5">
              <Label htmlFor="phase">Construction Phase</Label>
              <Select value={selectedPhase} onValueChange={setSelectedPhase}>
                <SelectTrigger id="phase">
                  <SelectValue placeholder="Select phase" />
                </SelectTrigger>
                <SelectContent>
                  {constructionPhases.map((phase) => (
                    <SelectItem key={phase} value={phase}>
                      {phase
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Progress Percentage Slider */}
            <div className="space-y-1.5">
              <Label htmlFor="progress">Progress Percentage</Label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  id="progress"
                  min={0}
                  max={100}
                  step={1}
                  value={progress}
                  onChange={(e) => {
                    setProgress(Number(e.target.value));
                    if (e.target.value == "100") {
                      setShouldSubmit(true);
                      setStatus("completed");
                    } else {
                      setShouldSubmit(false);
                      setStatus("");
                    }
                  }}
                  className="w-full accent-blue-600"
                />
                <span className="text-sm font-medium w-12 text-right tabular-nums">
                  {progress}%
                </span>
              </div>
            </div>

            {/* Status Dropdown */}
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(value) => {
                  setStatus(value);
                  setShouldSubmit(value === "completed");
                  if (value === "completed") {
                    setProgress(100);
                  }
                }}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditTaskOpen(false);
                setIsUpdating(false);
                setStatus("");
                setEvidenceTitle("");
                setPhotos([]);
                setProgress(0);
                setSelectedPhase("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdating}
              onClick={(e) => {
                setIsUpdating(true);
                handleEditTask();
              }}
            >
              {shouldSubmit
                ? "Submit to Site Incharge"
                : isUpdating
                ? "Updating...."
                : "Update task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContractorTaskList;
