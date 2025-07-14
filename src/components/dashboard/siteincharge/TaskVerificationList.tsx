import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  RefreshCw,
  Camera,
  CheckCircle,
  XCircle,
  AlertCircle,
  Upload,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import TaskVerificationDialog from "./TaskVerificationDialog";
import { toast } from "sonner";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TabsContent } from "@/components/ui/tabs";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface VerificationTask {
  _id: string;
  taskTitle: string;
  projectName: string;
  unit: string;
  contractorName: string;
  phase: string;
  submittedDate: string;
  priority: "high" | "medium" | "low";
  status: "pending verification" | "approved" | "rejected" | "rework";
  contractorUploadedPhotos: [string];
  submittedByContractorOn: Date;
  submittedBySiteInchargeOn: Date;
  constructionPhase: string;
  projectId: string;
}

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-800",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-green-100 text-green-800",
};

const statusColors: Record<string, string> = {
  pending_verification: "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  rework: "bg-amber-100 text-amber-800",
};

const TaskVerificationList = ({
  setApprovedCount,
  setReworkCount,
  setPendingCount
}) => {
  const [tasks, setTasks] = useState<VerificationTask[]>([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating,setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<
    "approved" | "rejected" | "rework" 
  >("approved");
  const [notes, setNotes] = useState("");
  const [quality, setQuality] = useState<
    "excellent" | "good" | "acceptable" | "poor"
  >("good");
  const [photos, setPhotos] = useState<File[]>([]);
  const [selectedTask, setSelectedTask] = useState<VerificationTask>();

  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/project/tasks", {
        withCredentials: true,
      }); // Update this to your actual API endpoint
      const formattedTasks: VerificationTask[] = res.data.map(
        (task: any, index: number) => ({
          _id: task._id,
          taskTitle: task.taskTitle,
          projectName: task.projectName,
          unit: task.unit,
          contractorName: task.contractorName,
          submittedByContractorOn: task.submittedByContractorOn,
          status: task.status,
          priority: mapPriority(task.priority),
          contractorUploadedPhotos: task.contractorUploadedPhotos,
          constructionPhase: task.constructionPhase,
          projectId: task.projectId,
        })
      );
      setTasks(formattedTasks);
      const pending = tasks.filter(t => t.status === "pending verification").length;
  const approved = tasks.filter(t => {
    return (
      t.status === "approved" &&
      t.submittedBySiteInchargeOn &&
      new Date(t.submittedBySiteInchargeOn).getMonth() === new Date().getMonth() &&
      new Date(t.submittedBySiteInchargeOn).getFullYear() === new Date().getFullYear()
    );
  }).length;
  const rework = tasks.filter(t => t.status === "rework").length;

  setPendingCount(pending);
  setApprovedCount(approved);
  setReworkCount(rework);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks.");
    } finally {
      setLoading(false);
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
      noteBySiteIncharge: notes,
      qualityAssessment: quality,
      verificationDecision: verificationStatus,
      photos: uploadedImageUrls,
    };

    // 3. Send task data to backend
    try {
      await axios.patch(
        `http://localhost:3000/api/project/site-incharge/${selectedTask.projectId}/${selectedTask._id}/task`,
        newTask,
        { withCredentials: true }
      );
      toast.success("Task Updated successfully!");
      fetchTasks();
    } catch (error) {
      toast.error("Failed to update task.");
      console.error("Updation error:", error);
    } finally {
      setVerificationDialogOpen(false);
      setNotes("");
      setPhotos([]);
      setQuality("good");
      setVerificationStatus("approved");
      setIsUpdating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setPhotos((prevPhotos) => [...prevPhotos, ...newFiles]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
  };

  // const mapStatus = (status: string): VerificationTask["status"] => {
  //   switch (status.toLowerCase()) {
  //     case "pending verification":
  //       return "pending_verification";
  //     case "rejected":
  //     case "rework":
  //       return status.toLowerCase() as VerificationTask["status"];
  //     default:
  //       return "pending_verification";
  //   }
  // };

  const mapPriority = (priority: string): VerificationTask["priority"] => {
    const lower = priority.toLowerCase();
    if (["low", "medium", "high"].includes(lower)) return lower as any;
    if (["good", "excellent"].includes(lower)) return lower as any;
    return "medium"; // default fallback
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter((task) => {
    // Apply status filter
    if (filter !== "all" && task.status !== filter) {
      return false;
    }

    // Apply project filter
    if (projectFilter && task.projectName !== projectFilter) {
      return false;
    }

    // Apply search query
    if (
      searchQuery &&
      !task.taskTitle.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  const handleVerify = (taskId: string) => {
    setSelectedTaskId(taskId);
    setVerificationDialogOpen(true);
  };

  const handleQuickAction = (
    taskId: string,
    action: "approve" | "reject" | "rework"
  ) => {
    // Update task status
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === taskId
          ? {
              ...task,
              status:
                action === "approve"
                  ? "approved"
                  : action === "reject"
                  ? "rejected"
                  : "rework",
            }
          : task
      )
    );

    // Show notification
    const task = tasks.find((t) => t._id === taskId);

    if (action === "approve") {
      toast.success(`Task approved`, {
        description: `${task?.taskTitle} has been approved and sent for payment processing`,
      });
    } else if (action === "reject") {
      toast.error(`Task rejected`, {
        description: `${task?.taskTitle} has been rejected. Contractor has been notified.`,
      });
    } else {
      toast.warning(`Task requires rework`, {
        description: `${task?.taskTitle} has been sent back for rework. Contractor has been notified.`,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-projects">All Projects</SelectItem>
            <SelectItem value="Riverside Tower">Riverside Tower</SelectItem>
            <SelectItem value="Valley Heights">Valley Heights</SelectItem>
            <SelectItem value="Green Villa">Green Villa</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="all" onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending_verification">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rework">Rework</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Project / Unit</TableHead>
              <TableHead>Contractor</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-6 text-muted-foreground"
                >
                  Loading tasks...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-6 text-red-500"
                >
                  {error}
                </TableCell>
              </TableRow>
            ) : filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-6 text-muted-foreground"
                >
                  No tasks found matching your filters
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => (
                <TableRow key={task._id}>
                  <TableCell className="font-medium">
                    {task.taskTitle}
                  </TableCell>
                  <TableCell>
                    {task.projectName} / {task.unit}
                  </TableCell>
                  <TableCell>{task.contractorName}</TableCell>
                  <TableCell>
                    {new Date(
                      task.submittedByContractorOn
                    ).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusColors[task.status]}
                    >
                      {task.status === "pending verification"
                        ? "Pending Verification"
                        : task.status.charAt(0).toUpperCase() +
                          task.status.slice(1)}
                    </Badge>
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
                    <div className="flex justify-end space-x-1">
                      {task.status === "pending verification" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-600 hover:text-green-800 hover:bg-green-100"
                            title="Approve"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-amber-600 hover:text-amber-800 hover:bg-amber-100"
                            title="Request Rework"
                          >
                            <AlertCircle className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-800 hover:bg-red-100"
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTask(task);
                          console.log("SELECTED TASK : ", task);
                          setVerificationDialogOpen(true);
                        }}
                      >
                        <Camera className="h-4 w-4 mr-1" />
                        {task.status === "pending verification"
                          ? "Verify"
                          : "View"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={verificationDialogOpen}
        onOpenChange={setVerificationDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Verify Task Completion</DialogTitle>
            <DialogDescription>
              Review the contractor's work and verify task completion.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="bg-muted p-3 rounded-md">
              <p className="font-medium">
                {selectedTask && selectedTask.taskTitle}
              </p>
              <p className="text-sm text-muted-foreground">
                {(selectedTask && selectedTask?.projectName) || "Untitled"} /{" "}
                {selectedTask && selectedTask.unit}
              </p>
              <p className="text-sm text-muted-foreground">
                Phase: {selectedTask && selectedTask.constructionPhase}
              </p>
              <p className="text-sm text-muted-foreground">
                Contractor: {selectedTask && selectedTask.contractorName}
              </p>
              <p className="text-sm text-muted-foreground">
                Completed on:{" "}
                {selectedTask &&
                  new Date(
                    selectedTask.submittedByContractorOn
                  ).toLocaleDateString()}
              </p>
            </div>

            <Tabs defaultValue="contractor" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="contractor" className="flex-1">
                  Contractor Photos
                </TabsTrigger>
                <TabsTrigger value="verification" className="flex-1">
                  Your Verification
                </TabsTrigger>
              </TabsList>
              <TabsContent value="contractor" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  {selectedTask &&
                    selectedTask.contractorUploadedPhotos?.map(
                      (photo, index) => (
                        <div
                          key={index}
                          className="relative rounded-md overflow-hidden border border-border"
                        >
                          <img
                            src={photo}
                            alt={`Contractor Evidence ${index + 1}`}
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      )
                    )}
                </div>
              </TabsContent>
              <TabsContent value="verification" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Upload Verification Photos</Label>
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    {photos.map((photo, index) => (
                      <div
                        key={index}
                        className="relative rounded-md overflow-hidden border border-border"
                      >
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Verification ${index + 1}`}
                          className="w-full h-48 object-cover"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-1 right-1 bg-black bg-opacity-60 hover:bg-opacity-80 rounded-full"
                          onClick={() => removePhoto(index)}
                        >
                          <XCircle className="h-4 w-4 text-white" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 border-dashed"
                      onClick={() =>
                        document
                          .getElementById("verification-photo-upload")
                          ?.click()
                      }
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Photos
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-dashed"
                      onClick={() =>
                        document
                          .getElementById("verification-camera-capture")
                          ?.click()
                      }
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    id="verification-photo-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                  />
                  <Input
                    id="verification-camera-capture"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <Label>Quality Assessment</Label>
              <RadioGroup
                value={quality}
                onValueChange={setQuality as any}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="excellent" id="excellent" />
                  <Label htmlFor="excellent">Excellent</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="good" id="good" />
                  <Label htmlFor="good">Good</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="acceptable" id="acceptable" />
                  <Label htmlFor="acceptable">Acceptable</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="poor" id="poor" />
                  <Label htmlFor="poor">Poor</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Verification Decision</Label>
              <Select
                value={verificationStatus}
                onValueChange={setVerificationStatus as any}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">
                    <div className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                      <span>Approved - Work meets requirements</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="rework">
                    <div className="flex items-center">
                      <AlertCircle className="mr-2 h-4 w-4 text-amber-600" />
                      <span>Needs Rework - Specific corrections required</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="rejected">
                    <div className="flex items-center">
                      <XCircle className="mr-2 h-4 w-4 text-red-600" />
                      <span>Rejected - Work fails to meet standards</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes & Feedback</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  verificationStatus !== "approved"
                    ? "Please describe the issues that need to be addressed"
                    : "Add any comments or feedback (optional)"
                }
                rows={3}
                required={verificationStatus !== "approved"}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setVerificationDialogOpen(false);
                  setNotes("");
                  setPhotos([]);
                  setQuality("good");
                  setVerificationStatus("approved");
                  setIsUpdating(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant={
                  verificationStatus === "approved"
                    ? "default"
                    : verificationStatus === "rework"
                    ? "secondary"
                    : "destructive"
                }
              >
                {isUpdating?"Updating...":"Submit Verification"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskVerificationList;
