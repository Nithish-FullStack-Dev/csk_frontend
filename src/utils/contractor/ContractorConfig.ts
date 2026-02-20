import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Project } from "../project/ProjectConfig";
import { FloorUnit } from "@/types/building";
import { z } from "zod";
import { User } from "@/contexts/AuthContext";

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
    case "in_progress":
      return "in_progress";
    case "completed":
      return "completed";
    default:
      return "pending_review";
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

export const statusOptions = ["pending_review", "in_progress", "completed"];

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
    | "in_progress"
    | "completed"
    | "approved"
    | "rejected"
    | "pending_review";
  deadline: string;
  priority: "high" | "medium" | "low";
  progress?: number;
  hasEvidence?: boolean;
  evidenceTitle: string;
  contractorUploadedPhotos: string[];
  statusForContractor: string;
  noteBySiteIncharge: string;
}

export interface VerificationTask {
  _id: string;
  taskTitle: string;
  projectName: string;
  unit: string;
  contractorName: string;
  submittedByContractorOn: Date;
  submittedBySiteInchargeOn: Date;
  priority: "high" | "medium" | "low";
  status: "pending verification" | "approved" | "rejected" | "rework";
  contractorUploadedPhotos: string[];
  constructionPhase: string;
  projectId: string;
  plotNo: string;
  floorNumber: string;
  verificationDecision?: string;
  qualityAssessment?: string;
  noteBySiteIncharge?: string;
  siteInchargeUploadedPhotos?: string[];
}

export const statusColors: Record<string, string> = {
  pending_review: "bg-gray-100 text-gray-800",
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
    { withCredentials: true },
  );
  const mapped = response.data.map((task: any, index: number) => ({
    id: index.toString(),
    title: task.taskTitle,
    project: task.projectName,
    unit: task.unit,
    floorNumber: task.floorNumber,
    plotNo: task.plotNo,
    phase: task.constructionPhase,
    status: mapStatus(task.status),
    deadline: task.deadline,
    progress: task.progress,
    priority: mapPriority(task.priority),

    // ✅ ADD THIS
    contractorUploadedPhotos: task.contractorUploadedPhotos || [],

    hasEvidence: task.contractorUploadedPhotos?.length > 0,
    _id: task._id,
    projectId: task.projectId,
  }));
  return mapped;
};

export const useTasks = () => {
  return useQuery({
    queryKey: ["contractorTasks"],
    queryFn: fetchTasks,
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

export const fetchTasksForPhotoEvidenceList = async () => {
  const res = await axios.get(`${import.meta.env.VITE_URL}/api/project/tasks`, {
    withCredentials: true,
  });
  const tasks = res.data || [];

  const transformed = tasks
    .filter((task: any) => (task.contractorUploadedPhotos || []).length > 0)
    .map((task: any) => ({
      _id: task._id || task._id,
      title: task.evidenceTitleByContractor || "Photo Submission",
      task: task.taskTitle || "Untitled Task",
      project: task.projectName,
      projectId: task.projectId || task.projectId,
      floorNumber: task.floorNumber || "",
      plotNo: task.plotNo || "",
      unit: task.unit,
      category: task.constructionPhase || "",
      date: task.submittedByContractorOn || task.deadline || new Date(),
      status:
        (task.status &&
          String(task.status).toLowerCase().replace(/\s/g, "_")) ||
        (task.status === undefined &&
          (task.statusForContractor || task.statusForSiteIncharge)) ||
        "In progress",
      images: (task.contractorUploadedPhotos || []).map((url: string) => ({
        url,
        caption: "",
      })),
      notes: task.noteBySiteIncharge || "",
    }));
  return transformed;
};

export const useTasksForPhotoEvidence = () => {
  return useQuery<PhotoEvidence[]>({
    queryKey: ["photoEvidenceTasks"],
    queryFn: fetchTasksForPhotoEvidence,
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
};

export const useTasksForPhotoEvidenceList = () => {
  return useQuery<PhotoEvidence[]>({
    queryKey: ["photoEvidenceTasksList"],
    queryFn: fetchTasksForPhotoEvidenceList,
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
};

export const fetchContractors = async () => {
  const res = await axios.get(
    `${import.meta.env.VITE_URL}/api/user/contractors`,
  );
  return res.data.data;
};

export const fetchContractorsForDropDown = async (): Promise<User[]> => {
  const res = await axios.get(
    `${import.meta.env.VITE_URL}/api/user/getControctorsForDropDown`,
  );
  return res.data;
};

export const assignContractor = async ({ projectId, unit, contractorId }) => {
  return axios.post(
    `${import.meta.env.VITE_URL}/api/project/assign-contractor`,
    { projectId, unit, contractorId },
    { withCredentials: true },
  );
};

export const fetchSiteInchargesForDropDown = async (): Promise<User[]> => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/user/site-incharges`,
  );
  return data;
};

export const useContractors = () => {
  return useQuery({
    queryKey: ["contractors"],
    queryFn: fetchContractors,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useContractorsFroDropDown = () => {
  return useQuery<User[]>({
    queryKey: ["contractors-dropdown"],
    queryFn: fetchContractorsForDropDown,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSiteInchargeFroDropDown = () => {
  return useQuery<User[]>({
    queryKey: ["siteincharge-dropdown"],
    queryFn: fetchSiteInchargesForDropDown,
    staleTime: 5 * 60 * 1000,
  });
};

//! Contactor List

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const ACCOUNT_NUMBER_REGEX = /^[0-9]{9,18}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const contractorSchema = z.object({
  userId: z.string().min(1, { message: "Please select a contractor" }),

  companyName: z.string().min(1, { message: "Company name is required" }),

  gstNumber: z
    .string()
    .min(1, { message: "GST number is required" })
    .regex(GST_REGEX, {
      message: "Invalid GST format (e.g. 22ABCDE1234F1Z5)",
    }),

  panCardNumber: z
    .string()
    .min(1, { message: "PAN number is required" })
    .regex(PAN_REGEX, {
      message: "Invalid PAN format (e.g. ABCDE1234F)",
    }),

  contractorType: z
    .string()
    .min(1, { message: "Please select contractor type" }),

  accountsIncharge: z.string().optional(),

  amount: z.coerce.number().min(0, { message: "Amount must be at least 0" }),

  advancePaid: z.coerce
    .number()
    .min(0, { message: "Advance must be at least 0" }),

  balancePaid: z.coerce.number().min(0),

  billInvoiceNumber: z.string().optional(),

  contractStartDate: z
    .string()
    .regex(DATE_REGEX, { message: "Invalid date format (YYYY-MM-DD)" })
    .optional(),

  contractEndDate: z
    .string()
    .regex(DATE_REGEX, { message: "Invalid date format (YYYY-MM-DD)" })
    .optional(),

  billedDate: z
    .string()
    .regex(DATE_REGEX, { message: "Invalid date format (YYYY-MM-DD)" })
    .optional(),

  finalPaymentDate: z
    .string()
    .regex(DATE_REGEX, { message: "Invalid date format (YYYY-MM-DD)" })
    .optional(),

  workDetails: z.string().optional(),

  billApprovedBySiteIncharge: z.boolean(),
  billProcessedByAccountant: z.boolean(),
  isActive: z.boolean(),

  bankName: z.string().min(1, { message: "Bank Name is required" }),

  accountNumber: z
    .string()
    .min(1, { message: "Account number is required" })
    .regex(ACCOUNT_NUMBER_REGEX, {
      message: "Account number must be 9–18 digits",
    }),

  ifscCode: z
    .string()
    .min(1, { message: "ifsc code is required" })
    .regex(IFSC_REGEX, {
      message: "Invalid IFSC format (e.g. SBIN0001234)",
    }),

  branchName: z.string().min(1, { message: "Branch Name is required" }),

  projectsAssigned: z.array(z.string()),

  paymentDetails: z
    .array(
      z.object({
        modeOfPayment: z
          .string()
          .min(1, { message: "Please select payment mode" }),

        paymentDate: z.string().regex(DATE_REGEX, {
          message: "Invalid date format (YYYY-MM-DD)",
        }),

        lastPaymentDate: z
          .string()
          .regex(DATE_REGEX, {
            message: "Invalid date format (YYYY-MM-DD)",
          })
          .optional(),
      }),
    )
    .min(1, {
      message: "At least one complete payment record is required",
    }),
});

export type FormValues = z.infer<typeof contractorSchema>;
