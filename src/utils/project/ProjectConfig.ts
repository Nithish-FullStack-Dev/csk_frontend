import { User } from "@/contexts/AuthContext";
import { Building, FloorUnit } from "@/types/building";
import { Property } from "@/types/property";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";

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
  projects: string[];
  contactPerson: string;
  phone: string;
  email: string;
  status: "active" | "on_hold" | "inactive";
  completedTasks: number;
  totalTasks: number;
  rating: 1 | 2 | 3 | 4 | 5;
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

export const usefetchProjects = () => {
  return useQuery<Project[]>({
    queryKey: ["fetchProjects"],
    queryFn: fetchProjects,
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
};

export const usefetchProjectsForDropdown = () => {
  return useQuery<Project[]>({
    queryKey: ["ProjectsForDropdown"],
    queryFn: fetchProjectsForDropdown,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
};

export const usefetchContractors = () => {
  return useQuery<Contractor[]>({
    queryKey: ["fetchContractors"],
    queryFn: fetchContractors,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
};

export const usefetchContractorDropDown = () => {
  return useQuery({
    queryKey: ["ContractorProjects"],
    queryFn: fetchContractorProjects,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
};
