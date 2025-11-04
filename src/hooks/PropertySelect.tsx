import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  useAvaliableUnits,
  useFloorUnits,
  useProjects,
  useUnits,
} from "@/utils/buildings/Projects";

interface PropertySelectProps {
  index?: number;
  selectedProject: string;
  setSelectedProject: (value: string) => void;
  selectedFloorUnit: string;
  setSelectedFloorUnit: (value: string) => void;
  selectedUnit: string;
  setSelectedUnit: (value: string) => void;
  useAvailable?: boolean;
}

const PropertySelect = ({
  index,
  selectedProject,
  setSelectedProject,
  selectedFloorUnit,
  setSelectedFloorUnit,
  selectedUnit,
  setSelectedUnit,
  useAvailable = false,
}: PropertySelectProps) => {
  const {
    data: projects,
    isLoading: projectLoading,
    isError: projectError,
    error: projectErrorMessage,
  } = useProjects();

  const {
    data: floorUnits = [],
    isLoading: floorUnitsLoading,
    isError: floorUnitsError,
    error: floorUnitsErrorMessage,
  } = useFloorUnits(selectedProject);

  const {
    data: units = [],
    isLoading: unitsLoading,
    isError: unitsError,
    error: unitsErrorMessage,
  } = useAvailable
    ? useAvaliableUnits(selectedProject, selectedFloorUnit)
    : useUnits(selectedProject, selectedFloorUnit);

  if (projectError)
    toast.error(projectErrorMessage?.message || "Failed to load projects");
  if (floorUnitsError)
    toast.error(
      floorUnitsErrorMessage?.message || "Failed to load floor units"
    );
  if (unitsError)
    toast.error(unitsErrorMessage?.message || "Failed to load units");

  return (
    <>
      {/* Project */}
      <div className="space-y-2">
        <Label htmlFor={`project-${index}`}>Project *</Label>
        <Select
          value={selectedProject}
          onValueChange={(value) => {
            setSelectedProject(value);
            setSelectedFloorUnit("");
            setSelectedUnit("");
          }}
          disabled={projectLoading}
        >
          <SelectTrigger id={`project-${index}`}>
            <SelectValue
              placeholder={
                projectLoading ? "Loading projects..." : "Select project"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {projectLoading ? (
              <SelectItem value="loading" disabled>
                Loading...
              </SelectItem>
            ) : projects?.length ? (
              projects.map((project) => (
                <SelectItem key={project._id} value={project._id}>
                  {project?.projectName} , {project?.propertyType}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="empty" disabled>
                No projects found
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Floor */}
      <div className="space-y-2">
        <Label htmlFor={`floorUnit-${index}`}>Floor Units *</Label>
        <Select
          value={selectedFloorUnit}
          onValueChange={(value) => {
            setSelectedFloorUnit(value);
            setSelectedUnit("");
          }}
          disabled={floorUnitsLoading || !floorUnits.length}
        >
          <SelectTrigger id={`floorUnit-${index}`}>
            <SelectValue
              placeholder={
                floorUnitsLoading
                  ? "Loading floor units..."
                  : !floorUnits.length
                  ? "No floor units available"
                  : "Select floor unit"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {floorUnitsLoading ? (
              <SelectItem value="loading" disabled>
                Loading...
              </SelectItem>
            ) : floorUnits.length ? (
              floorUnits.map((floor) => (
                <SelectItem key={floor._id} value={floor._id}>
                  Floor {floor.floorNumber}, {floor.unitType}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="empty" disabled>
                No floor units available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Units */}
      <div className="space-y-2">
        <Label htmlFor={`unit-${index}`}>
          {useAvailable ? "Available Units *" : "All Units *"}
        </Label>
        <Select
          value={selectedUnit}
          onValueChange={setSelectedUnit}
          disabled={unitsLoading || !units.length}
        >
          <SelectTrigger id={`unit-${index}`}>
            <SelectValue
              placeholder={
                unitsLoading
                  ? "Loading units..."
                  : !units.length
                  ? "No units available"
                  : "Select unit"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {unitsLoading ? (
              <SelectItem value="loading" disabled>
                Loading...
              </SelectItem>
            ) : units.length ? (
              units.map((unit) => (
                <SelectItem key={unit._id} value={unit._id}>
                  Plot {unit.plotNo}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="empty" disabled>
                No units available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default PropertySelect;
