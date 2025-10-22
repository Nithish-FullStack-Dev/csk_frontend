import { useFloorUnits, useProjects } from "@/utils/buildings/Projects";

export function usePropertyOptions(selectedProject?: string) {
  const projectsQuery = useProjects();
  const floorUnitsQuery = useFloorUnits(selectedProject);

  return {
    projectsQuery,
    floorUnitsQuery,
  };
}
