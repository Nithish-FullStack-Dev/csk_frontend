import React, { useState } from "react";
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
import { Search, Camera } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { toast } from "sonner";
import axios from "axios";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { VerificationTask } from "@/utils/contractor/ContractorConfig";

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

const TaskVerificationList = ({ tasks, isLoading, isError }) => {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("approved");
  const [notes, setNotes] = useState("");
  const [quality, setQuality] = useState("good");
  const [photos, setPhotos] = useState<File[]>([]);
  const [selectedTask, setSelectedTask] = useState<VerificationTask | null>(
    null
  );
  const [isUploading, setIsUploading] = useState(false);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (updatedTaskData: any) => {
      return axios.patch(
        `${import.meta.env.VITE_URL}/api/project/site-incharge/${
          selectedTask?.projectId
        }/${selectedTask?._id}/task`,
        updatedTaskData,
        { withCredentials: true }
      );
    },
    onSuccess: () => {
      toast.success("Task Updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["taskVerificationList"] });
      queryClient.invalidateQueries({ queryKey: ["completedTaskVerfication"] });
    },
    onError: () => {
      toast.error("Failed to update task.");
    },
    onSettled: () => {
      setVerificationDialogOpen(false);
      setNotes("");
      setPhotos([]);
      setQuality("good");
      setVerificationStatus("approved");
    },
  });

  const mapPriority = (priority: string): any => {
    const lower = priority?.toLowerCase();
    if (["low", "medium", "high"].includes(lower)) return lower;
    return "medium";
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const uploadedImageUrls: string[] = [];
    setIsUploading(true);
    try {
      for (const photo of photos) {
        const formData = new FormData();
        formData.append("file", photo);
        const res = await axios.post(
          `${import.meta.env.VITE_URL}/api/uploads/upload`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        if (res.data.url) uploadedImageUrls.push(res.data.url);
      }
      mutation.mutate({
        noteBySiteIncharge: notes,
        qualityAssessment: quality,
        verificationDecision: verificationStatus,
        siteInchargeUploadedPhotos: uploadedImageUrls,
      });
    } catch (error) {
      toast.error("failed while uploading the image");
    } finally {
      setIsUploading(false);
    }
  };

  const filteredTasks = tasks.filter((task: any) => {
    if (filter !== "all" && task.status?.toLowerCase() !== filter.toLowerCase())
      return false;
    if (
      searchQuery &&
      !task.taskTitle.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  if (isError) {
    console.log(tasks);
    return <div className="text-red-500">Error loading tasks.</div>;
  }

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
      </div>

      <Tabs defaultValue="all" onValueChange={setFilter}>
        <TabsList className="hidden md:block">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending verification">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rework">Rework</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="border rounded-md">
        <div>
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    Loading tasks...
                  </TableCell>
                </TableRow>
              ) : filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    No tasks found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks.map((task: any) => (
                  <TableRow key={task?._id}>
                    <TableCell>{task?.taskTitle}</TableCell>
                    <TableCell>
                      {task?.projectName} / {task?.floorNumber} - {task?.plotNo}
                    </TableCell>
                    <TableCell>{task?.contractorName}</TableCell>
                    <TableCell>
                      {new Date(
                        task?.submittedByContractorOn
                      ).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusColors[task?.status]}
                      >
                        {task?.status === "pending_verification"
                          ? "Pending Verification"
                          : task?.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={priorityColors[task?.priority]}
                      >
                        {task?.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTask(task);
                          setVerificationStatus(
                            task?.verificationDecision || "approved"
                          );
                          setQuality(task?.qualityAssessment || "good");
                          setNotes(task?.noteBySiteIncharge || "");
                          setVerificationDialogOpen(true);
                        }}
                      >
                        <Camera className="h-4 w-4 mr-1" />
                        {task?.status === "pending_verification"
                          ? "Verify"
                          : "View"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog
        open={verificationDialogOpen}
        onOpenChange={setVerificationDialogOpen}
      >
        <DialogContent className="md:w-[600px] w-[95vw] max-h-[85vh] overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle>Verify Task Completion</DialogTitle>
            <DialogDescription />
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="bg-muted p-3 rounded-md">
              <p className="font-medium">{selectedTask?.taskTitle}</p>
              <p className="text-sm text-muted-foreground">
                {selectedTask?.projectName} / {selectedTask?.floorNumber} -{" "}
                {selectedTask?.plotNo}
              </p>
            </div>

            <Tabs defaultValue="contractor" className="w-full">
              <TabsList className="w-full flex sm:flex-row">
                <TabsTrigger value="contractor" className="flex-1">
                  Contractor Photos
                </TabsTrigger>
                <TabsTrigger value="verification" className="flex-1">
                  Your Verification
                </TabsTrigger>
              </TabsList>

              <TabsContent value="contractor" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedTask?.contractorUploadedPhotos?.map(
                    (photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        className="w-full h-48 object-cover rounded-md"
                      />
                    )
                  )}
                </div>
              </TabsContent>

              <TabsContent value="verification" className="space-y-4 pt-4">
                <div>
                  <Label>Previous Verification Photos</Label>
                  {selectedTask?.siteInchargeUploadedPhotos?.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No verification photos uploaded yet.
                    </p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedTask?.siteInchargeUploadedPhotos?.map(
                      (photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          className="w-full h-48 object-cover rounded-md"
                        />
                      )
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Upload New Verification Photos</Label>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                      setPhotos((prev) => [
                        ...prev,
                        ...Array.from(e.target.files || []),
                      ])
                    }
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <Label>Quality Assessment</Label>
              <RadioGroup
                value={quality}
                onValueChange={setQuality}
                className="flex flex-col sm:flex-row sm:space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="excellent" />
                  <Label>Excellent</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="good" />
                  <Label>Good</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="acceptable" />
                  <Label>Acceptable</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="poor" />
                  <Label>Poor</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Verification Decision</Label>
              <Select
                value={verificationStatus}
                onValueChange={setVerificationStatus}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rework">Rework</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setVerificationDialogOpen(false);
                  setNotes("");
                  setPhotos([]);
                  setQuality("good");
                  setVerificationStatus("approved");
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending || isUploading}
              >
                {mutation.isPending ? "Updating..." : "Submit Verification"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskVerificationList;
