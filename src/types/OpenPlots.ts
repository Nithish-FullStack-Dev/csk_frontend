import { User } from "@/contexts/AuthContext";
import { Customer } from "@/pages/CustomerManagement";

export type PlotFacing =
  | "North"
  | "East"
  | "West"
  | "South"
  | "North-East"
  | "North-West"
  | "South-East"
  | "South-West";
export type PlotApproval =
  | "DTCP"
  | "HMDA"
  | "Panchayat"
  | "Municipality"
  | "Unapproved"
  | "Other";
export type PlotStatus =
  | "Available"
  | "Sold"
  | "Reserved"
  | "Blocked"
  | "Under Dispute";
export type PlotType =
  | "Residential"
  | "Commercial"
  | "Agricultural"
  | "Industrial";
export type RegistrationStatus =
  | "Not Started"
  | "In Progress"
  | "Pending Documents"
  | "Pending Payment"
  | "Scheduled"
  | "Completed"
  | "Delayed"
  | "Cancelled";

export interface OpenPlot {
  _id: string;
  memNo: string;
  projectName: string;
  plotNo: string;
  facing: PlotFacing;
  extentSqYards: number;
  plotType: PlotType;
  pricePerSqYard: number;
  totalAmount: number;
  bookingAmount: number;
  amountReceived: number;
  balanceAmount: number;
  googleMapsLink?: string;
  approval: PlotApproval;
  isCornerPlot: boolean;
  isGatedCommunity: boolean;
  availabilityStatus: PlotStatus;
  customerId?: Customer;
  customerContact?: string;
  agentId?: User;
  registrationStatus: RegistrationStatus;
  emiScheme: boolean;
  remarks?: string;
  thumbnailUrl?: string;
  images?: string[];
  listedDate: string;
  availableFrom: string;
  brochureUrl?: string | null;
}

const sampleOpenPlots: OpenPlot[] = [];
