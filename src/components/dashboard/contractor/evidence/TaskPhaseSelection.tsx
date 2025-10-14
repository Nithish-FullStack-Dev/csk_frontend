import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CONSTRUCTION_PHASES } from "@/types/construction";

interface TaskPhaseSelectionProps {
  availableTasks;
  selectedTask: string;
  setSelectedTask: (task: string) => void;
  selectedPhase: string;
  setSelectedPhase: (phase: string) => void;
  disabled: boolean;
}

const TaskPhaseSelection = ({
  availableTasks,
  selectedTask,
  setSelectedTask,
  selectedPhase,
  setSelectedPhase,
  disabled,
}: TaskPhaseSelectionProps) => {
  // Helper: Generate composite key
  const generateKey = (task) =>
    `${task.projectName}::${task.unit}::${task.taskTitle}`;

  // Find task based on the composite key
  const selectedTaskObj = availableTasks.find(
    (t) => generateKey(t) === selectedTask
  );

  // Update selected phase when selectedTask changes
  useEffect(() => {
    if (selectedTaskObj) {
      setSelectedPhase(selectedTaskObj.phase);
    }
  }, [selectedTask, availableTasks, setSelectedPhase]);

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="task">Related Task (Optional)</Label>
        <Select
          value={selectedTask}
          onValueChange={setSelectedTask}
          disabled={disabled}
        >
          <SelectTrigger id="task">
            <SelectValue
              placeholder={
                availableTasks.length > 0
                  ? "Select related task"
                  : "No tasks available"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {availableTasks.map((task) => (
              <SelectItem key={generateKey(task)} value={generateKey(task)}>
                {task.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
    </>
  );
};

export default TaskPhaseSelection;
