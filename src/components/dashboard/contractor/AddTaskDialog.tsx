import { useState } from "react";
import axios from "axios";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CONSTRUCTION_PHASES } from "@/types/construction";
import { toast } from "sonner";
import { DatePicker } from "@/components/ui/date-picker";
import { usefetchProjectsForDropdown } from "@/utils/project/ProjectConfig";

interface AddTaskDialogProps {
  onOpenChange: (open: boolean) => void;
  fetchTasks: () => void;
}

const AddTaskDialog = ({ onOpenChange, fetchTasks }: AddTaskDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [phase, setPhase] = useState("");
  const [priority, setPriority] = useState("medium");
  const [deadline, setDeadline] = useState<Date | undefined>(new Date());

  const [selectedProject, setSelectedProject] = useState("");
  const [floorUnit, setFloorUnit] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");

  const {
    data: projects,
    isLoading: projectsLoading,
    isError: projectsError,
    error: projectsErrorDetails,
  } = usefetchProjectsForDropdown();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !selectedProject || !phase || !deadline) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_URL}/api/project/tasks/create`,
        {
          title,
          description,
          projectId: selectedProject,
          phase,
          priority,
          deadline,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Task created successfully", {
          description: `${title} has been added to your task list`,
        });

        fetchTasks();

        // Reset form
        setTitle("");
        setDescription("");
        setSelectedProject("");
        setFloorUnit("");
        setSelectedUnit("");
        setPhase("");
        setPriority("medium");
        setDeadline(new Date());
        onOpenChange(false);
      } else {
        toast.error("Failed to create task");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while creating task");
    }
  };

  if (projectsError) {
    return (
      <div>
        Error loading projects:{" "}
        {projectsErrorDetails instanceof Error
          ? projectsErrorDetails.message
          : "Unknown error"}
      </div>
    );
  }

  return (
    <DialogContent className="md:w-[600px] w-[90vw] max-h-[80vh] overflow-scroll rounded-xl">
      <DialogHeader>
        <DialogTitle>Add New Construction Task</DialogTitle>
        <DialogDescription>
          Create a new task for your construction project. Fill in all the
          details below.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Task Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the task details"
            rows={3}
            required
          />
        </div>

        {/* Project Select */}
        <div className="space-y-2">
          <Label htmlFor="project">Project</Label>
          <Select
            value={selectedProject}
            onValueChange={setSelectedProject}
            required
            disabled={projectsLoading}
          >
            <SelectTrigger id="project">
              <SelectValue
                placeholder={projectsLoading ? "Loading..." : "Select project"}
              />
            </SelectTrigger>
            <SelectContent>
              {projectsLoading ? (
                <SelectItem value="">Loading...</SelectItem>
              ) : (
                projects?.map((p: any) => (
                  <SelectItem key={p?._id} value={p?._id}>
                    {p.projectId?.projectName +
                      " floor no: " +
                      p?.floorUnit?.floorNumber +
                      " unit: " +
                      p?.unit?.plotNo || "Unnamed Project"}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Phase & Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phase">Construction Phase</Label>
            <Select value={phase} onValueChange={setPhase} required>
              <SelectTrigger id="phase">
                <SelectValue placeholder="Select phase" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CONSTRUCTION_PHASES).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger id="priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Deadline */}
        <div className="space-y-2">
          <Label>Deadline</Label>
          <div className="border rounded-md p-2">
            <DatePicker
              date={deadline}
              setDate={setDeadline}
              showMonthYearDropdowns
            />
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit">Create Task</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default AddTaskDialog;
