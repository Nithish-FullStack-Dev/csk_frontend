import { useMutation, useQuery } from "@tanstack/react-query";
import { Building, FloorUnit } from "@/types/building";
import { Property } from "@/types/property";
import axios from "axios";
import { User } from "@/contexts/AuthContext";
import { OpenLand } from "@/types/OpenLand";
import { OpenPlot } from "@/types/OpenPlots";

export interface CustomerPayload {
  user: string;
  unit: string;
  property: string;
  floorUnit: string;
  bookingDate: string;
  finalPrice: number;
  paymentPlan: "Down Payment" | "EMI" | "Full Payment";
  paymentStatus: "Pending" | "In Progress" | "Completed";
  purchasedFrom: string;
}

export interface CustomerPayload {
  user: string;
  unit: string;
  property: string;
  floorUnit: string;
  bookingDate: string;
  finalPrice: number;
  paymentPlan: "Down Payment" | "EMI" | "Full Payment";
  paymentStatus: "Pending" | "In Progress" | "Completed";
  purchasedFrom: string;
}

export interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: "hot" | "warm" | "cold";
  source: string;
  unit: string | Property;
  property: string | Building;
  floorUnit: string | FloorUnit;
  openLand: string | OpenLand;
  openPlot: string | OpenPlot;
  propertyStatus:
  | "New"
  | "Assigned"
  | "Follow up"
  | "In Progress"
  | "Closed"
  | "Rejected";
  addedBy: User;
  lastContact: string;
  notes: string;
  createdAt: string;
}

export interface TeamMember {
  _id: string;
  agentId: User;
  teamLeadId: User;
  status: "active" | "training" | "inactive" | "on-leave";
  performance: {
    sales: number;
    target: number;
    deals: number;
    leads: number;
    conversionRate: number;
    lastActivity: string;
  };
}

export type Populated<T> = string | T | null;

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

//! FETCH
export const fetchLeads = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/leads/getLeadsById`,
    { withCredentials: true }
  );
  return data;
};


export const fetchAllLeads = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/leads/getAllLeads`,
    { withCredentials: true }
  );
  return data.leads;
};


export const fetchAllAgents = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/user/getAllAgents`
  );
  return data;
};

export const fetchAllCustomer_purchased = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/user/getAllcustomer_purchased`
  );
  return data;
};

export const fetchLeadByUnitId = async (unitId: string) => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/leads/getLeadsByUnitId/${unitId}`,
    { withCredentials: true }
  );
  return data?.data || [];
};

export const fetchCompletedTaskVerfication = async (
  projectId: string,
  unit: string
) => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL
    }/api/project/units/${projectId}/${unit}/completed-tasks`,
    { withCredentials: true }
  );
  return data?.data || [];
};

export const fetchUnitProgress = async (
  projectId: string,
  floorUnitId: string,
  unit: string
) => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL
    }/api/project/getProject/${projectId}/${floorUnitId}/${unit}/unit-progress`,
    { withCredentials: true }
  );
  return data?.data || [];
};

export const fetchUnassignedMem = async (): Promise<User[]> => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/team/unassigned`,
    { withCredentials: true }
  );
  return data.data || [];
};

export type AgentDropdownItem = {
  _id: string;
  agentId: User;
};

type UserResponse = ApiResponse<AgentDropdownItem[]>;

export const fetchAgentsForDropDown = async (): Promise<UserResponse> => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/agentlist/getAllAgentsListsForDropDown`,
    { withCredentials: true }
  );
  return data;
};

//! SAVE UPDATE AND DELETE
const saveCustomer = async (payload: CustomerPayload) => {
  const { data } = await axios.post(
    `${import.meta.env.VITE_URL}/api/customer/addCustomer`,
    payload,
    { withCredentials: true }
  );
  return data;
};

const saveLead = async (
  payload: Omit<
    Lead,
    "_id" | "lastContact" | "addedBy" | "propertyStatus" | "createdAt"
  >
) => {
  const dataToSend = {
    ...payload,
    property:
      typeof payload.property === "object"
        ? payload.property._id
        : payload.property,
    unit: typeof payload.unit === "object" ? payload.unit._id : payload.unit,
    floorUnit:
      typeof payload.floorUnit === "object"
        ? payload.floorUnit._id
        : payload.floorUnit,
  };

  const { data } = await axios.post(
    `${import.meta.env.VITE_URL}/api/leads/saveLead`,
    dataToSend,
    { withCredentials: true }
  );
  return data;
};

const updateLead = async (payload: Lead) => {
  const { _id, ...updateData } = payload;
  const dataToSend = {
    ...updateData,
    property:
      typeof updateData.property === "object"
        ? updateData.property._id
        : updateData.property,
    unit:
      typeof updateData.unit === "object"
        ? updateData.unit._id
        : updateData.unit,
    floorUnit:
      typeof updateData.floorUnit === "object"
        ? updateData.floorUnit._id
        : updateData.floorUnit,
  };

  const { data } = await axios.put(
    `${import.meta.env.VITE_URL}/api/leads/updateLead/${_id}`,
    dataToSend,
    { withCredentials: true }
  );
  return data;
};

const deleteLead = async (id: string) => {
  const { data } = await axios.delete(
    `${import.meta.env.VITE_URL}/api/leads/deleteLead/${id}`,
    { withCredentials: true }
  );
  return data;
};

//! CUSTOM HOOKS
export const useSaveLead = () => {
  return useMutation({
    mutationFn: saveLead,
  });
};

export const useSaveCustomer = () => {
  return useMutation({
    mutationFn: saveCustomer,
  });
};

export const useUpdateLead = () => {
  return useMutation({
    mutationFn: updateLead,
  });
};

export const useDeleteLead = () => {
  return useMutation({
    mutationFn: deleteLead,
  });
};

export const useLeadbyUnitId = (unitId: string) => {
  return useQuery({
    queryKey: ["leadByUnitId", unitId],
    queryFn: () => fetchLeadByUnitId(unitId),
    enabled: !!unitId,
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCompletedTaskVerfication = (
  projectId: string,
  unit: string
) => {
  return useQuery({
    queryKey: ["completedTaskVerfication", projectId, unit],
    queryFn: () => fetchCompletedTaskVerfication(projectId, unit),
    enabled: !!projectId && !!unit,
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUnitProgress = (
  projectId: string,
  floorUnitId: string,
  unit: string
) => {
  return useQuery({
    queryKey: ["unitProgress", projectId, floorUnitId, unit],
    queryFn: () => fetchUnitProgress(projectId, floorUnitId, unit),
    enabled: !!projectId && !!floorUnitId && !!unit,
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUnAssignedAgents = () => {
  return useQuery<User[]>({
    queryKey: ["unassignedAgents"],
    queryFn: fetchUnassignedMem,
    staleTime: 0,
  });
};

export const useUnAssignedAgentsDropDown = () => {
  return useQuery<UserResponse>({
    queryKey: ["agent-dropdown"],
    queryFn: fetchAgentsForDropDown,
    staleTime: 0,
  });
};
