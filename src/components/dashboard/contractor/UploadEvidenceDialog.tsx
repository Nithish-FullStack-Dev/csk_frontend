import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProjectUnitSelection from "./evidence/ProjectUnitSelection";
import TaskPhaseSelection from "./evidence/TaskPhaseSelection";
import PhotoUploader from "./evidence/PhotoUploader";
import StatusSelector from "./evidence/StatusSelector";
import {
  defaultProjects,
  defaultTasks,
  ProjectData,
  TaskData,
  PhotoEvidence,
} from "./evidence/types";
import { CONSTRUCTION_PHASES } from "@/types/construction";
type StatusType = "in_progress" | "completed" | "pending_review";
import { XCircle, Upload, Camera, FileImage } from "lucide-react";
import PropertySelect from "@/hooks/PropertySelect";
import axios from "axios";

interface UploadEvidenceDialogProps {
  onOpenChange: (open: boolean) => void;
  projects?: ProjectData[];
  tasks?: TaskData[];
  onSubmit?: (evidence: PhotoEvidence) => void;
}

const UploadEvidenceDialog = ({
  onOpenChange,
  projects = defaultProjects,
  tasks = defaultTasks,
  onSubmit = () => {},
}: UploadEvidenceDialogProps) => {
  const [title, setTitle] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [notes, setNotes] = useState("");
  const [progressPercent, setProgressPercent] = useState("50");
  const [status, setStatus] = useState<
    "in_progress" | "completed" | "pending_review"
  >("in_progress");
  const [photos, setPhotos] = useState<File[]>([]);
  const [floorUnit, setFloorUnit] = useState("");
  const [availableTasks, setAvailableTasks] = useState<TaskData[]>([]);
  const [selectedPhase, setSelectedPhase] = useState<string>("");
  const [photoCaptions, setPhotoCaptions] = useState<string[]>([]);
  const [availableUnits, setAvailableUnits] = useState<string[]>([]);

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Convert FileList to array and append to existing photos
      const newFiles = Array.from(e.target.files);
      setPhotos([...photos, ...newFiles]);

      // Add empty captions for new photos
      setPhotoCaptions([...photoCaptions, ...newFiles.map(() => "")]);
    }
  };

  // Remove a photo from the list
  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoCaptions(photoCaptions.filter((_, i) => i !== index));
  };

  // Update a photo caption
  const updateCaption = (index: number, caption: string) => {
    setPhotoCaptions(photoCaptions.map((c, i) => (i === index ? caption : c)));
  };
  // Helper: Generate composite key
  const generateKey = (task) =>
    `${task.projectName}::${task.unit}::${task.taskTitle}`;

  // Find task based on the composite key
  const selectedTaskObj = availableTasks.find(
    (t) => generateKey(t) === selectedTask,
  );

  // Update selected phase when selectedTask changes
  useEffect(() => {
    if (selectedTaskObj) {
      setSelectedPhase(selectedTaskObj.phase);
    }
  }, [selectedTask, availableTasks, setSelectedPhase]);

  // Update units when project changes
  useEffect(() => {
    if (selectedProject) {
      const projectData = projects.find((p) => p.name === selectedProject);
      setAvailableUnits(projectData?.units || []);
      setSelectedUnit("");
    } else {
      setAvailableUnits([]);
    }
  }, [selectedProject, projects, setSelectedUnit]);

  // Update available tasks when project and unit change
  useEffect(() => {
    if (selectedProject && selectedUnit) {
      const filteredTasks = tasks.filter(
        (t) => t.project === selectedProject && t.unit === selectedUnit,
      );
      setAvailableTasks(filteredTasks);

      if (filteredTasks.length > 0) {
        // Auto select the first task if there's only one
        if (filteredTasks.length === 1) {
          setSelectedTask(filteredTasks[0].id);
          setSelectedPhase(filteredTasks[0].phase);
        } else {
          setSelectedTask("");
        }
      } else {
        setSelectedTask("");
        setSelectedPhase("");
      }
    } else {
      setAvailableTasks([]);
      setSelectedTask("");
      setSelectedPhase("");
    }
  }, [selectedProject, selectedUnit, tasks]);

  console.log("Project ID:", selectedProject);
  console.log("Task ID:", selectedTask);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProject || !selectedTask || !title || photos.length === 0) {
      toast.error(
        !selectedTask
          ? "Please select a task before uploading evidence"
          : "Please fill all required fields",
      );
      return;
    }

    try {
      const formData = new FormData();

      formData.append("evidenceTitleByContractor", title);
      formData.append("constructionPhase", selectedPhase || "");
      formData.append("status", status);
      formData.append("progressPercentage", progressPercent);
      formData.append("noteBySiteIncharge", notes || "");

      photos.forEach((photo) => {
        formData.append("photos", photo);
      });

      // IMPORTANT: selectedTask must be taskId
      await axios.post(
        `${import.meta.env.VITE_URL}/api/project/contractor/${selectedProject}/${selectedTask}/evidence`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      toast.success("Evidence uploaded successfully");

      onOpenChange(false);
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to upload evidence",
      );
    }
  };

  return (
    <DialogContent className="md:w-[650px] w-[90vw] max-h-[80vh] overflow-scroll rounded-xl">
      <DialogHeader>
        <DialogTitle>Upload Task Evidence</DialogTitle>
        <DialogDescription>
          Upload photos showing task progress or completion. Select the project,
          unit, and provide details.
        </DialogDescription>
      </DialogHeader>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 pt-4 overflow-y-auto max-h-[70vh] px-4 sm:px-6"
      >
        {/* <ProjectUnitSelection
          projects={projects}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          selectedUnit={selectedUnit}
          setSelectedUnit={setSelectedUnit}
        /> */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PropertySelect
            selectedFloorUnit={floorUnit}
            setSelectedFloorUnit={setFloorUnit}
            selectedProject={selectedProject}
            selectedUnit={selectedUnit}
            setSelectedProject={setSelectedProject}
            setSelectedUnit={setSelectedUnit}
            useAvailable={false}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">Evidence Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for this evidence"
            required
          />
        </div>
        // Inside the form, after PropertySelect
        <div className="space-y-2">
          <Label>Task</Label>
          <Select
            value={selectedTask}
            onValueChange={setSelectedTask}
            disabled={
              !selectedProject || !selectedUnit || availableTasks.length === 0
            }
            required
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  availableTasks.length === 0
                    ? "No tasks available for this unit"
                    : "Select task"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {availableTasks.map((task) => (
                <SelectItem key={task.id} value={task.id}>
                  {task.title}
                  {task.phase &&
                    ` (${CONSTRUCTION_PHASES[task.phase]?.title || task.phase})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        // Optional: Show selected phase automatically (read-only)
        {selectedTaskObj && (
          <div className="text-sm text-muted-foreground">
            Phase:{" "}
            {CONSTRUCTION_PHASES[
              selectedTaskObj.phase as keyof typeof CONSTRUCTION_PHASES
            ]?.title || selectedTaskObj.phase}
          </div>
        )}
        {selectedTaskObj ? (
          <div className="bg-muted p-3 rounded-md">
            <p className="font-medium">{selectedTaskObj.title}</p>
            <p className="text-sm text-muted-foreground">
              Phase:{" "}
              {selectedPhase &&
                CONSTRUCTION_PHASES[
                  selectedPhase as keyof typeof CONSTRUCTION_PHASES
                ]?.title}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="phase">Construction Phase</Label>
            <Select
              value={selectedPhase}
              onValueChange={setSelectedPhase}
              required={!selectedTask}
            >
              <SelectTrigger id="phase">
                <SelectValue placeholder="Select construction phase" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CONSTRUCTION_PHASES).map(([key, phase]) => (
                  <SelectItem key={key} value={key}>
                    {phase.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {/* <StatusSelector
          status={status}
          setStatus={setStatus}
          progressPercent={progressPercent}
          setProgressPercent={setProgressPercent}
        /> */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as StatusType)}
            required
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending_review">Pending Review</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {status === "in_progress" && (
          <div className="space-y-2">
            <Label htmlFor="progress">Progress Percentage</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="progress"
                type="range"
                min="0"
                max="100"
                step="5"
                className="w-full"
                value={progressPercent}
                onChange={(e) => setProgressPercent(e.target.value)}
              />
              <span className="w-12 text-center">{progressPercent}%</span>
            </div>
          </div>
        )}
        {/* <PhotoUploader
          photos={photos}
          setPhotos={setPhotos}
          photoCaptions={photoCaptions}
          setPhotoCaptions={setPhotoCaptions}
        /> */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="photos">Upload Photos</Label>
            <span className="text-xs text-muted-foreground">
              {photos.length} photos selected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
            {photos.length === 0 && (
              <div className="col-span-full border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground">
                <FileImage className="h-10 w-10 mb-2" />
                <p className="text-sm text-center">
                  No photos selected. Click below to upload.
                </p>
              </div>
            )}

            {photos.map((photo, index) => (
              <div
                key={index}
                className="relative rounded-md overflow-hidden border border-border flex flex-col"
              >
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`Evidence ${index + 1}`}
                  className="w-full h-32 object-cover"
                />
                <div className="p-2">
                  <Input
                    size={1}
                    placeholder="Add caption"
                    value={photoCaptions[index] || ""}
                    onChange={(e) => updateCaption(index, e.target.value)}
                    className="text-xs"
                  />
                </div>
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
              onClick={() => document.getElementById("photo-upload")?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Photos
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-dashed"
              onClick={() => document.getElementById("camera-capture")?.click()}
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          <Input
            id="photo-upload"
            type="file"
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleFileChange}
          />
          <Input
            id="camera-capture"
            type="file"
            className="hidden"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
          />
          <p className="text-xs text-muted-foreground">
            Please upload clear photos showing the construction progress. GPS
            location will be automatically added.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any relevant details or comments"
            rows={3}
          />
        </div>
        <DialogFooter className="pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            disabled={
              !selectedProject || !selectedTask || !title || photos.length === 0
            }
            type="submit"
          >
            Submit Evidence
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default UploadEvidenceDialog;
