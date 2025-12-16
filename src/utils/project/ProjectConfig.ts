import { User } from "@/contexts/AuthContext";
import { Building, FloorUnit } from "@/types/building";
import { ContractorResponse } from "@/types/contractor";
import { Property } from "@/types/property";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";

export const mapPriority = (priority: string): "high" | "medium" | "low" => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "high";
    case "medium":
      return "medium";
    default:
      return "low";
  }
};

export const statusColors: Record<string, string> = {
  "in progress": "text-blue-600 bg-blue-50 border-blue-200",
  completed: "text-green-600 bg-green-50 border-green-200",
  "Not Started": "text-gray-600 bg-gray-50 border-gray-200",
  planning: "text-indigo-600 bg-indigo-50 border-indigo-200",
  "on hold": "text-yellow-600 bg-yellow-50 border-yellow-200",
  delayed: "text-red-600 bg-red-50 border-red-200",
  "under inspection": "text-purple-600 bg-purple-50 border-purple-200",
};

export interface Task {
  _id?: string;
  contractor: User | string;
  title: string;
  statusForContractor: "In progress" | "completed" | "pending review";
  statusForSiteIncharge:
    | "pending verification"
    | "approved"
    | "rework"
    | "rejected";
  deadline: string | Date;
  progressPercentage: number;
  isApprovedByContractor: boolean;
  isApprovedBySiteManager: boolean;
  constructionPhase?: string;
  contractorUploadedPhotos?: string[];
  siteInchargeUploadedPhotos?: string[];
  qualityAssessment?: "" | "excellent" | "good" | "acceptable" | "poor";
  verificationDecision?: "approved" | "Approve" | "rework" | "rejected" | "";
  submittedByContractorOn?: Date;
  submittedBySiteInchargeOn?: Date;
  evidenceTitleByContractor?: string;
  noteBySiteIncharge?: string;
  priority?: string;
  description?: string;
  status?:
    | "pending verification"
    | "approved"
    | "completed"
    | "rejected"
    | "in progress";
}

export interface Project {
  _id?: string;

  projectId: Building | string;
  clientName: string;
  floorUnit: FloorUnit | string;
  unit: Property | string;

  contractors?: (User | string)[];
  siteIncharge: User | string;
  units?: {
    [unitName: string]: Task[];
  };
  deadline?: Date;
  priority?: string;
  type?: string;
  startDate?: Date;
  endDate?: Date;
  teamSize?: number;
  estimatedBudget?: number;
  description?: string;
  budget?: number;
  status?: string;
  assignedContractors?: {
    [unitName: string]: (User | string)[];
  };
}

export interface Contractor {
  _id: string;
  name: string;
  company: string;
  specialization: string;
  projects: {
    _id: string;
    projectName: string;
    floorNumber: string;
    unitType: string;
  }[];

  contactPerson: string;
  phone: string;
  email: string;
  status: "active" | "on_hold" | "inactive";
  completedTasks: number;
  totalTasks: number;
  rating: 1 | 2 | 3 | 4 | 5;
}

interface UpcomingTask {
  id: string;
  title: string;
  project: string;
  unit: string;
  deadline: string;
  daysRemaining: number;
  priority: "high" | "medium" | "low";
  unitType?: string;
  floorNumber?: string;
}

export interface QualityIssue {
  _id: string;
  title: string;
  project: Project;
  contractor: User;
  severity: "critical" | "major" | "minor";
  status: "open" | "under_review" | "resolved";
  reported_date: string;
  taskId?: string;
  description: string;
  evidenceImages: string[];
}

export const fetchProjects = async () => {
  const projectsRes = await axios.get(
    `${import.meta.env.VITE_URL}/api/project/projects`,
    { withCredentials: true }
  );
  return projectsRes.data;
};

export const fetchProjectsForDropdown = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/project/projectsDropdown`,
    { withCredentials: true }
  );
  return data.data;
};

export const fetchContractors = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/project/site-incharge/myContractors`,
    {
      withCredentials: true,
    }
  );
  return data;
};

export const fetchContractorProjects = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/project/contractorDropdown`,
    {
      withCredentials: true,
    }
  );
  return data;
};

export const fetchContractorListProjects = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/contractor/getContractorsForDropDown`,
    {
      withCredentials: true,
    }
  );
  return data;
};

export const fetchFormattedTasks = async () => {
  const response = await axios.get(
    `${import.meta.env.VITE_URL}/api/project/tasks`,
    { withCredentials: true }
  );

  const today = new Date();
  return response.data
    .filter((task: any) => task.status !== "completed")
    .map((task: any, index: number) => {
      const deadline = new Date(task.deadline);
      const daysRemaining = Math.ceil(
        (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        id: task._id || index.toString(),
        title: task.taskTitle,
        project: task.projectName,
        unit: task.unit,
        deadline: task.deadline,
        daysRemaining,
        priority: mapPriority(task.priority),
        unitType: task.unitType,
        floorNumber: task.floorNumber,
      };
    })
    .sort((a, b) => a.daysRemaining - b.daysRemaining);
};

export const fetchTasks = async () => {
  const response = await axios.get(
    `${import.meta.env.VITE_URL}/api/project/tasks`,
    { withCredentials: true }
  );
  return response.data;
};

export const usefetchProjects = () => {
  return useQuery({
    queryKey: ["fetchProjects"],
    queryFn: fetchProjects,
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
};

export const fetchQualityIssues = async (): Promise<QualityIssue[]> => {
  const res = await axios.get(
    `${import.meta.env.VITE_URL}/api/quality-issue/issues`,
    {
      withCredentials: true,
    }
  );
  return res.data.issues;
};

export const fetchContractorList = async () => {
  const res = await axios.get(
    `${import.meta.env.VITE_URL}/api/contractor/getAllContractorList`,
    {
      withCredentials: true,
    }
  );

  return res.data;
};

export const usefetchProjectsForDropdown = () => {
  return useQuery<Project[]>({
    queryKey: ["ProjectsForDropdown"],
    queryFn: fetchProjectsForDropdown,
    staleTime: 5 * 60 * 1000,
  });
};

export const usefetchContractors = () => {
  return useQuery<Contractor[]>({
    queryKey: ["fetchContractors"],
    queryFn: fetchContractors,
    staleTime: 5 * 60 * 1000,
  });
};

export const usefetchContractorDropDown = () => {
  return useQuery({
    queryKey: ["ContractorProjects"],
    queryFn: fetchContractorProjects,
    staleTime: 5 * 60 * 1000,
  });
};

export const usefetchContractorListDropDown = () => {
  return useQuery({
    queryKey: ["contractor-list-dropdown"],
    queryFn: fetchContractorListProjects,
    staleTime: 5 * 60 * 1000,
  });
};

export const useFetchTasks = () => {
  return useQuery<UpcomingTask[]>({
    queryKey: ["formattedTasks"],
    queryFn: fetchFormattedTasks,
    staleTime: 5 * 60 * 1000,
  });
};
export const useTasks = () => {
  return useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
    staleTime: 5 * 60 * 1000,
  });
};

export const useQualityIssues = () => {
  return useQuery({
    queryKey: ["qualityIssues"],
    queryFn: fetchQualityIssues,
    staleTime: 5 * 60 * 1000,
  });
};

export const useContractorList = () => {
  return useQuery<ContractorResponse>({
    queryKey: ["contractors-list"],
    queryFn: fetchContractorList,
    staleTime: 5 * 60 * 1000,
  });
};
