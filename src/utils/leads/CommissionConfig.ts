import axios from "axios";
import { Lead } from "@/utils/leads/LeadConfig";
import { Building, FloorUnit } from "@/types/building";
import { Property } from "@/types/property";
import { User } from "@/contexts/AuthContext";

export interface PopulatedLead extends Omit<Lead, "property" | "addedBy"> {
  unit: Property;
  property: Building;
  floorUnit: FloorUnit;
  addedBy: User;
}

export interface Commission {
  _id: string;
  clientId: PopulatedLead;
  commissionAmount: string;
  commissionPercent: string;
  saleDate: Date;
  paymentDate?: Date;
  status: "pending" | "paid";
}

export interface CommissionEligibleLead extends Lead {
  property: Building;
  unit: Property;
  floorUnit: FloorUnit;
}

export const fetchAllCommission = async (): Promise<Commission[]> => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/commission/getAllCommissions`,
    { withCredentials: true }
  );
  return Array.isArray(data) ? data : [];
};

export const fetchCommissionEligibleLeads = async (): Promise<
  CommissionEligibleLead[]
> => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/leads/getClosedLeads`,
    { withCredentials: true }
  );
  return data.data || [];
};
