import { User } from "@/contexts/AuthContext";
import { Building, FloorUnit } from "@/types/building";
import { Property } from "@/types/property";
import { useQuery } from "@tanstack/react-query";
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
  deadline?: string | Date;
  priority?: string;
  type?: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  teamSize?: number | null;
  estimatedBudget?: number;
  description?: string;
  budget?: number;
  status?: string;
  assignedContractors?: {
    [unitName: string]: (User | string)[];
  };
}

export const fetchProjects = async () => {
  const projectsRes = await axios.get(
    `${import.meta.env.VITE_URL}/api/project/projects`,
    { withCredentials: true }
  );
  return projectsRes.data;
};

export const usefetchProjects = () => {
  return useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    staleTime: 2 * 60 * 1000,
    placeholderData: [],
  });
};
