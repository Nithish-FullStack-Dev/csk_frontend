import { useState, useEffect } from "react";
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
import PropertySelect from "@/hooks/PropertySelect";

interface AddTaskDialogProps {
  onOpenChange: (open: boolean) => void;
  fetchTasks: () => Promise<void>;
}

interface Project {
  id: string;
  name: string;
  units: { id: string; name: string }[];
}

// Sample projects data (in a real app, this would come from an API)
const sampleProjects: Project[] = [
  {
    id: "p1",
    name: "Riverside Tower",
    units: [
      { id: "u1", name: "Block A" },
      { id: "u2", name: "Block B" },
      { id: "u3", name: "Block C" },
    ],
  },
  {
    id: "p2",
    name: "Valley Heights",
    units: [
      { id: "u4", name: "Unit 1" },
      { id: "u5", name: "Unit 2" },
      { id: "u6", name: "Unit 3" },
    ],
  },
  {
    id: "p3",
    name: "Green Villa",
    units: [
      { id: "u7", name: "Villa 1" },
      { id: "u8", name: "Villa 2" },
    ],
  },
];

const AddTaskDialog = ({ onOpenChange, fetchTasks }: AddTaskDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [unit, setUnit] = useState("");
  const [phase, setPhase] = useState("");
  const [priority, setPriority] = useState("medium");
  const [deadline, setDeadline] = useState<Date | undefined>(new Date());
  const [projects, setProjects] = useState([]);
  const [availableUnits, setAvailableUnits] = useState<
    { id: string; name: string }[]
  >([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [floorUnit, setFloorUnit] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");

  const fetchDropdownData = async () => {
    try {
      const projectsRes = await axios.get(
        `${import.meta.env.VITE_URL}/api/project/projects`,
        { withCredentials: true }
      );

      setProjects(projectsRes.data);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };
  useEffect(() => {
    fetchDropdownData();
  }, []);

  // Update available units when project changes
  useEffect(() => {
    if (projectId) {
      const selectedProject = sampleProjects.find((p) => p.id === projectId);
      if (selectedProject) {
        setAvailableUnits(selectedProject.units);
        setUnit(""); // Reset unit selection
      }
    } else {
      setAvailableUnits([]);
      setUnit("");
    }
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !projectId || !unit || !phase || !deadline) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_URL}/api/project/tasks/create`,
        {
          title,
          description,
          projectId,
          unit,
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

        setTitle("");
        setDescription("");
        setProjectId("");
        setUnit("");
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

        <PropertySelect
          selectedFloorUnit={floorUnit}
          setSelectedFloorUnit={setFloorUnit}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          selectedUnit={unit}
          setSelectedUnit={setUnit}
          useAvailable={false}
        />

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
