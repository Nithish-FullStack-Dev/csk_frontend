import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Project } from "../project/ProjectConfig";
import { FloorUnit } from "@/types/building";

//! Task List
export const constructionPhases = [
  "site_mobilization",
  "groundwork_foundation",
  "structural_framework",
  "slab_construction",
  "masonry_work",
  "roofing",
  "internal_finishing",
  "external_finishing",
  "electrical_works",
  "plumbing_works",
  "hvac_works",
  "fire_safety",
  "project_management",
  "snagging_rectification",
];

export const mapStatus = (status: string): Task["status"] => {
  switch (status.toLowerCase()) {
    case "pending verification":
      return "pending verification";
    case "approved":
      return "approved";
    case "rejected":
      return "rejected";
    case "in progress":
      return "In progress";
    case "completed":
      return "completed";
  }
};

export const mapPriority = (priority: string): Task["priority"] => {
  switch (priority.toLowerCase()) {
    case "excellent":
      return "high";
    case "good":
      return "medium";
    case "unspecified":
      return "low";
    default:
      return "medium";
  }
};

export const statusOptions = ["pending review", "In progress", "completed"];

export interface Task {
  id: string;
  title: string;
  project: string;
  projectId: string;
  _id: string;
  unit: string;
  phase: string;
  floorNumber: string;
  plotNo: string;
  status:
    | "pending verification"
    | "In progress"
    | "completed"
    | "approved"
    | "rejected";
  deadline: string;
  priority: "high" | "medium" | "low";
  progress?: number;
  hasEvidence?: boolean;
  evidenceTitle: string;
  contractorUploadedPhotos: [string];
  statusForContractor: string;
  noteBySiteIncharge: string;
}

export const statusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

export const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-800",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-green-100 text-green-800",
};

export const fetchTasks = async () => {
  const response = await axios.get(
    `${import.meta.env.VITE_URL}/api/project/tasks`,
    { withCredentials: true }
  );
  const mapped = response.data.map((task: any, index: number) => ({
    id: index.toString(), // Replace with real id if available
    title: task.taskTitle,
    project: task.projectName,
    unit: task.unit,
    floorNumber: task.floorNumber,
    plotNo: task.plotNo,
    phase: task.constructionPhase,
    status: mapStatus(task.status), // normalize status if needed
    deadline: task.deadline,
    progress: task.progress,
    priority: mapPriority(task.priority),
    hasEvidence: task.contractorUploadedPhotos.length > 0,
    _id: task._id,
    projectId: task.projectId,
  }));
  return mapped;
};

export const useTasks = () => {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: keepPreviousData,
  });
};

//! Materials

export interface Material {
  _id: string;
  name: string;
  type: string;
  quantity: number;
  unit: string;
  supplier: string;
  rate: number;
  totalCost: number;
  deliveryDate: string;
  project: Project;
  status: string;
  poNumber: string;
  invoiceNumber: string;
  remarks?: string;
}

export const fetchMaterials = async () => {
  const res = await axios.get(`${import.meta.env.VITE_URL}/api/materials`, {
    withCredentials: true,
  });
  return res.data;
};

export const useMaterials = () => {
  return useQuery<Material[]>({
    queryKey: ["materials"],
    queryFn: fetchMaterials,
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: keepPreviousData,
  });
};

//! Labor

export interface AttendenceRecord {
  _id: string;
  present: number;
  absent: number;
  date: Date;
}

// Define interface for labor team
export interface LaborTeam {
  _id: string;
  name: string;
  supervisor: string;
  type: string;
  members: number;
  wage: number;
  project: string | Project;
  attendance: number;
  contact: string;
  status: string;
  remarks?: string;
  attendancePercentage: number;
  attendanceRecords: [AttendenceRecord];
}

export const fetchTeams = async () => {
  const response = await axios.get(`${import.meta.env.VITE_URL}/api/labor  `, {
    withCredentials: true,
  });
  return response.data;
};

export const useLaborTeams = () => {
  return useQuery<LaborTeam[]>({
    queryKey: ["laborTeams"],
    queryFn: fetchTeams,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
};

//! Photo Evidence

export type PhotoStatus = "completed" | "in_progress" | "pending_review";

export interface PhotoEvidence {
  _id?: string;
  title: string;
  task: string;
  project?: string;
  floorNumber?: string;
  plotNo?: string;
  floorUnit?: string | FloorUnit;
  projectId: string;
  unit?: string;
  category?: string;
  date?: string;
  status?: PhotoStatus;
  images?: { url: string; caption: string }[];
  notes?: string;
  rawTask?: any;
}

export interface PhotoDetailsDialogProps {
  onOpenChange: (open: boolean) => void;
  photoEvidence: {
    _id: string;
    title: string;
    project: string;
    unit?: string;
    floorNumber: string;
    plotNo: string;
    task: string;
    date: string;
    category: string;
    status: PhotoStatus;
    images: { url: string; caption: string }[];
  } | null;
}

export const fetchTasksForPhotoEvidence = async () => {
  const res = await axios.get(`${import.meta.env.VITE_URL}/api/project/tasks`, {
    withCredentials: true,
  });
  return res.data || [];
};

export const useTasksForPhotoEvidence = () => {
  return useQuery<PhotoEvidence[]>({
    queryKey: ["photoEvidenceTasks"],
    queryFn: fetchTasksForPhotoEvidence,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
};
