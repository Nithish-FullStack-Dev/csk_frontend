import { User } from "@/contexts/AuthContext";

export type VillaFacing =
  | "North"
  | "East"
  | "West"
  | "South"
  | "North-East"
  | "North-West"
  | "South-East"
  | "South-West";

export type CustomerStatus = "Purchased" | "Inquiry" | "Blocked" | "Open";
export type ProjectStatus = "ongoing" | "upcoming" | "completed";

export type PropertyStatus =
  | "Available"
  | "Sold"
  | "Under Construction"
  | "Reserved"
  | "Blocked";

export type RegistrationStatus =
  | "Completed"
  | "In Progress"
  | "Pending"
  | "Not Started";

export type PropertyType = "Villa" | "Apartment" | "Plot" | "Land Parcel";

export interface Property {
  id: string;
  memNo: string;
  projectName: string;
  plotNo: string;
  villaFacing: VillaFacing;
  extent: number;
  propertyType: PropertyType;
  customerName: string;
  customerStatus: CustomerStatus;
  status: PropertyStatus;
  projectStatus: ProjectStatus;
  preBooking?: boolean;
  contractor?: string;
  siteIncharge?: string;
  totalAmount: number;
  workCompleted: number;
  deliveryDate: string;
  emiScheme: boolean;
  contactNo?: string;
  agentName?: string;
  registrationStatus: RegistrationStatus;
  ratePlan?: string;
  amountReceived: number;
  balanceAmount: number;
  remarks?: string;
  municipalPermission: boolean;
  googleMapsLocation?: string;
  thumbnailUrl?: string;
  images?: string[];
}
