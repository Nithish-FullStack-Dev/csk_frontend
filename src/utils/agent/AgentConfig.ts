import { User } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Project } from "../project/ProjectConfig";

export type Populated<T> = string | T | null;

export interface AgentList {
  _id?: string;
  agentId: Populated<User>;
  panCard: string;
  aadharCard: string;
  accountHolderName: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
  branchName: string;
  project: Populated<Project>;
  totalAmount: number;
  agreedCommissionPercent: number;
  amountReceived: number;
  commissionPaid?: number;
  paymentDate: string | null;
  notes?: string;
  approvedBy: Populated<User>;
}

export interface AgentListResponse {
  statusCode: number;
  data: AgentList[];
  message: string;
  success: boolean;
}

export const fetchAllAgentList = async (): Promise<AgentListResponse> => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/agentlist/getAllAgentsLists`,
    { withCredentials: true }
  );
  return data;
};

export const useAgentList = () => {
  return useQuery<AgentListResponse>({
    queryKey: ["agent-list"],
    queryFn: fetchAllAgentList,
    staleTime: 2 * 60 * 1000,
  });
};
