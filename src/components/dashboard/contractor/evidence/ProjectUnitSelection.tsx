import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjectData } from "./types";

interface ProjectUnitSelectionProps {
  projects: ProjectData[];
  selectedProject: string;
  setSelectedProject: (project: string) => void;
  selectedUnit: string;
  setSelectedUnit: (unit: string) => void;
}

const ProjectUnitSelection = ({
  projects,
  selectedProject,
  setSelectedProject,
  selectedUnit,
  setSelectedUnit,
}: ProjectUnitSelectionProps) => {
  const [availableUnits, setAvailableUnits] = useState<string[]>([]);

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="project">Project</Label>
        <Select
          value={selectedProject}
          onValueChange={setSelectedProject}
          required
        >
          <SelectTrigger id="project">
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.name} value={project.name}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="unit">Unit/Block</Label>
        <Select
          value={selectedUnit}
          onValueChange={setSelectedUnit}
          required
          disabled={!selectedProject}
        >
          <SelectTrigger id="unit">
            <SelectValue
              placeholder={
                selectedProject ? "Select unit/block" : "Select a project first"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {availableUnits.map((unit) => (
              <SelectItem key={unit} value={unit}>
                {unit}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ProjectUnitSelection;