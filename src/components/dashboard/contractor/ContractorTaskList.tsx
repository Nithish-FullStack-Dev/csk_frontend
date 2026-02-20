import React, { useState, useEffect, useMemo } from "react";
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
import {
  constructionPhases,
  priorityColors,
  statusColors,
  statusOptions,
  Task,
  useTasks,
} from "@/utils/contractor/ContractorConfig";

const ContractorTaskList = () => {
  // const [tasks, setTasks] = useState<Task[]>();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [uploadEvidenceOpen, setUploadEvidenceOpen] = useState(false);
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
  const [isSelectingFiles, setIsSelectingFiles] = useState(false);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);

  const {
    data: tasks,
    isLoading: taskLoading,
    isError: taskError,
    error: taskErr,
    refetch: fetchTasks,
  } = useTasks();

  useEffect(() => {
    if (selectedTask) {
      setEvidenceTitle(selectedTask.evidenceTitle || "");
      setSelectedPhase(selectedTask.phase || "");
      setProgress(selectedTask.progress || 0);
      setStatus(selectedTask.status ?? "pending_review");
    }
  }, [selectedTask]);

  useEffect(() => {
    if (uploadEvidenceOpen && selectedTask?.contractorUploadedPhotos) {
      setExistingPhotos(selectedTask.contractorUploadedPhotos);
    }
  }, [uploadEvidenceOpen, selectedTask]);

  const previewUrls = useMemo(
    () => photos.map((file) => URL.createObjectURL(file)),
    [photos],
  );
  useEffect(() => {
    return () => previewUrls.forEach(URL.revokeObjectURL);
  }, [previewUrls]);

  if (taskError) {
    console.error("Error fetching tasks:", taskErr);
    toast.error(
      taskErr.message || "Failed to load tasks. Please try again later.",
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isSelectingFiles) return;

    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const availableSlots = 9 - existingPhotos.length - photos.length;
    if (availableSlots <= 0) return;

    setIsSelectingFiles(true);

    const acceptedFiles = files.slice(0, availableSlots);

    // 🔥 IMMEDIATE UI UPDATE (NO ASYNC)
    setPhotos((prev) => [...prev, ...acceptedFiles]);

    // reset input
    e.target.value = "";

    // allow next selection immediately
    requestAnimationFrame(() => setIsSelectingFiles(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Upload photos one-by-one
    const uploadedImageUrls: string[] = [];
    try {
      for (const photo of photos) {
        const formData = new FormData();
        formData.append("file", photo);

        const res = await axios.post(
          `${import.meta.env.VITE_URL}/api/uploads/upload`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );

        const cloudinaryResponse = res.data?.url;
        const imageUrl =
          typeof cloudinaryResponse === "string"
            ? cloudinaryResponse
            : cloudinaryResponse?.secure_url;

        if (!imageUrl) {
          throw new Error("Image upload failed");
        }

        uploadedImageUrls.push(imageUrl);
      }
    } catch {
      toast.error("One or more images failed to upload");
      setIsUpdating(false);
      return;
    }
    const finalPhotos = [...existingPhotos, ...uploadedImageUrls];
    // 2. Create new task object
    const newTask = {
      evidenceTitleByContractor: evidenceTitle,
      status,
      progressPercentage: progress,
      photos: finalPhotos,
      constructionPhase: selectedPhase,
      shouldSubmit,
    };

    // 3. Send inspection data to backend
    try {
      await axios.patch(
        `${import.meta.env.VITE_URL}/api/project/contractor/${
          selectedTask.projectId
        }/${selectedTask._id}/task`,
        newTask,
        { withCredentials: true },
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
        `${import.meta.env.VITE_URL}/api/project/contractor/${
          selectedTask.projectId
        }/${selectedTask._id}/mini/task`,
        {
          phase: selectedPhase,
          progress: progress,
          status: status,
        },
        { withCredentials: true },
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

  const handleUploadEvidence = (task: Task) => {
    console.log("TASK RECEIVED:", task);
    console.log("PHOTOS FIELD:", task.contractorUploadedPhotos);
    setSelectedTask(task);
    setPhotos([]);
    setProgress(task.progress || 0);
    setStatus(task.status ?? "pending_review");
    setUploadEvidenceOpen(true);
  };

  if (!tasks || taskLoading) return <div>Loading tasks...</div>;
  if (tasks.length === 0) return <div>No tasks.</div>;
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-[50%]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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

      <Tabs defaultValue="all" value={filter} onValueChange={setFilter}>
        {/* Desktop Tabs */}
        <div className="hidden lg:block">
          <TabsList>
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="pending_review">Pending</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </div>

        {/* Mobile Select */}
        <div className="block lg:hidden">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="pending_review">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Tabs>

      <div className="border rounded-md overflow-hidden">
        <Table className="w-full border-collapse hidden lg:table">
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Project / Unit</TableHead>
              <TableHead>Phase</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  No tasks found
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task, idx) => {
                return (
                  <TableRow key={task._id || idx}>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>
                      {task?.project}, floorNo: {task?.floorNumber} unit:{" "}
                      {task?.plotNo}
                    </TableCell>
                    <TableCell>{task.phase}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          statusColors[task.status ?? "pending_review"]
                        }
                      >
                        {task.status
                          ?.replace(/_/g, " ")
                          ?.replace(/\b\w/g, (c) => c.toUpperCase())}
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
                              <DropdownMenuItem>
                                Mark as Completed
                              </DropdownMenuItem>
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
                );
              })
            )}
          </TableBody>
        </Table>
        <div className="space-y-4 lg:hidden block">
          {filteredTasks.map((task, idx) => (
            <div
              key={task._id || idx}
              className="border rounded-md p-4 shadow-sm bg-white"
            >
              {/* Task Title */}
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-lg">{task.title}</h3>
                <Badge variant="outline" className={statusColors[task.status]}>
                  {task.status}
                </Badge>
              </div>

              {/* Project / Unit */}
              <p className="text-sm text-gray-500 mt-1">
                {task.project} / {task.unit}
              </p>

              {/* Phase & Priority */}
              <div className="flex justify-between mt-2">
                <span className="text-sm text-gray-600">{task.phase}</span>
                <Badge
                  variant="outline"
                  className={priorityColors[task.priority]}
                >
                  {task.priority.charAt(0).toUpperCase() +
                    task.priority.slice(1)}
                </Badge>
              </div>

              {/* Deadline & Progress */}
              <div className="flex justify-between mt-2 text-sm text-gray-500">
                <span>
                  Deadline: {new Date(task.deadline).toLocaleDateString()}
                </span>
                <span>
                  Progress:{" "}
                  {task.progress !== undefined ? `${task.progress}%` : "-"}
                </span>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 mt-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleUploadEvidence(task)}
                  className={
                    task.hasEvidence ? "text-blue-600 hover:text-blue-800" : ""
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
                      <DropdownMenuItem>Mark as In Progress</DropdownMenuItem>
                    )}
                    {(task.status === "pending" ||
                      task.status === "in_progress") && (
                      <DropdownMenuItem>Mark as Completed</DropdownMenuItem>
                    )}
                    {task.status === "rejected" && (
                      <DropdownMenuItem>Resume Work</DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleUploadEvidence(task)}
                    >
                      Upload Photos
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Dialog open={uploadEvidenceOpen} onOpenChange={setUploadEvidenceOpen}>
        <DialogContent className="sm:max-w-[600px] max-w-[90vw] max-h-[80vh] flex flex-col rounded-xl">
          <DialogHeader>
            <DialogTitle>Upload Evidence</DialogTitle>
            <DialogDescription>
              Submit visual proof of work completed at the site.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 overflow-y-scroll p-2">
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
                {"floorNo: " +
                  selectedTask?.floorNumber +
                  " unit: " +
                  selectedTask?.plotNo || "N/A"}
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
                        ?.replace(/_/g, " ")
                        ?.replace(/\b\w/g, (c) => c.toUpperCase())}
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
                    const value = Number(e.target.value);
                    setProgress(value);

                    if (value === 100) {
                      setShouldSubmit(true);
                      setStatus("completed");
                    } else {
                      setShouldSubmit(false);
                      setStatus(selectedTask?.status ?? "pending_review");
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
                {/* Existing uploaded photos */}
                {existingPhotos.map((url, index) => (
                  <div
                    key={`existing-${index}`}
                    className="relative rounded-md overflow-hidden border h-32"
                  >
                    <img
                      src={url}
                      alt={`Uploaded ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}

                {/* Newly selected photos (instant preview) */}
                {photos.map((file, index) => (
                  <div
                    key={`new-${index}`}
                    className="relative rounded-md overflow-hidden border h-32 group"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`New ${index + 1}`}
                      className="w-full h-full object-cover"
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 rounded-full"
                      onClick={() =>
                        setPhotos((prev) => prev.filter((_, i) => i !== index))
                      }
                    >
                      <XCircle className="h-4 w-4 text-white" />
                    </Button>
                  </div>
                ))}

                {/* Add button */}
                {existingPhotos.length + photos.length < 9 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-32 border-dashed flex flex-col"
                    disabled={isSelectingFiles}
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

              <p className="text-xs text-muted-foreground">
                Upload up to 9 photos. Selected images appear instantly.
              </p>
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
        <DialogContent className="sm:max-w-[700px] max-w-[90vw] max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-blue-500" />
              Task Details
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Detailed information about the selected construction task.
          </DialogDescription>

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
                      : selectedTask.status === "in_progress"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {(selectedTask &&
                    selectedTask?.status
                      ?.replace(/_/g, " ")
                      ?.replace(/\b\w/g, (l) => l.toUpperCase())) ||
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
                  {(selectedTask &&
                    selectedTask?.plotNo + "/" + selectedTask?.floorNumber) ||
                    "-"}
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
                <p>{(selectedTask && selectedTask.status) || "-"}</p>
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
        <DialogContent className="sm:max-w-[600px] max-w-[90vw] max-h-[90vh] overflow-y-auto rounded-xl">
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
                {" Floor no: " +
                  selectedTask?.floorNumber +
                  ", unit: " +
                  selectedTask?.plotNo || "N/A"}
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
                        ?.replace(/_/g, " ")
                        ?.replace(/\b\w/g, (c) => c.toUpperCase())}
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
