import { ConstructionPhase } from "@/types/construction";

export interface PhotoEvidence {
  id: string;
  title: string;
  project: string;
  unit: string;
  task: string;
  date: string;
  category: string;
  status: 'completed' | 'in_progress' | 'pending_review';
  images: { url: string; caption: string }[];
}

export interface ProjectData {
  name: string;
  units: string[];
}

export interface TaskData {
  id: string;
  title: string;
  project: string;
  unit: string;
  phase: string;
}

// Default data
export const defaultProjects: ProjectData[] = [
  {
    name: "Riverside Tower",
    units: ["Block A", "Block B", "Block C", "Block D"]
  },
  {
    name: "Valley Heights",
    units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"]
  },
  {
    name: "Green Villa",
    units: ["Villa 1", "Villa 2", "Villa 3"]
  }
];

export const defaultTasks: TaskData[] = [
  {
    id: "task1",
    title: "Foundation concrete pouring",
    project: "Riverside Tower",
    unit: "Block A",
    phase: "groundwork_foundation"
  },
  {
    id: "task2",
    title: "Wall framing",
    project: "Valley Heights",
    unit: "Unit 3",
    phase: "structural_framework"
  },
  {
    id: "task3",
    title: "Electrical installation",
    project: "Green Villa",
    unit: "Villa 2",
    phase: "electrical_works"
  }
];