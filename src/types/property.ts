import { User } from "@/contexts/AuthContext";
import { Building, FloorUnit } from "./building";

export interface CustomerPropertyDetail {
  _id?: string;
  property: string | Building;
  floorUnit: string | FloorUnit;
  unit: string | Property;
  bookingDate: string;
  finalPrice: number;
  paymentPlan: "Down Payment" | "EMI" | "Full Payment";
  paymentStatus: "Pending" | "In Progress" | "Completed";
  documents?: string[];
}

export interface Customer {
  _id: string;
  user: User;
  purchasedFrom: User;
  properties: CustomerPropertyDetail[];
  createdAt: string;
  updatedAt: string;
}

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

export interface PropertyDocument {
  _id: string;
  title: string;
  fileUrl: string;
  mimeType: string;
  visibility: "PURCHASER_ONLY" | "PUBLIC_ENQUIRER";
  createdAt?: string;
}

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
  _id: string;
  memNo: string;
  projectName: string;
  plotNo: string;
  villaFacing: VillaFacing;
  extent: number;
  propertyType: PropertyType;
  customerId: Customer;
  customerStatus: CustomerStatus;
  status: PropertyStatus;
  projectStatus: ProjectStatus;
  preBooking?: boolean;
  contractor?: User;
  siteIncharge?: User;
  totalAmount: number;
  workCompleted: number;
  deliveryDate: string;
  emiScheme: boolean;
  contactNo?: string;
  agentId?: User;
  registrationStatus: RegistrationStatus;
  ratePlan?: string;
  amountReceived: number;
  balanceAmount: number;
  remarks?: string;
  municipalPermission: boolean;
  googleMapsLocation?: string;
  thumbnailUrl?: string;
  images?: string[];
  documents?: PropertyDocument[];
  enquiryCustomerName?: string;
  enquiryCustomerContact?: string;
  purchasedCustomerName?: string;
  purchasedCustomerContact?: string;
}
