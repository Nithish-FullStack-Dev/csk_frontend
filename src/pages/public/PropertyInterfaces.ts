export interface BasicInfo {
  membershipNumber: string;
  projectName: string;
  plotNumber: string;
  propertyType: "Villa" | "Apartment" | "Plot" | "Land Parcel";
  Extent: number;
  facingDirection?:
    | "East"
    | "West"
    | "North"
    | "South"
    | "North-East"
    | "North-West"
    | "South-East"
    | "South-West";
  projectStatus: "ongoing" | "upcoming" | "completed";
  preBooking: boolean;
}

export interface CustomerInfo {
  customerName?: string;
  customerStatus?: "Open" | "Purchased" | "Inquiry" | "Blocked";
  propertyStatus?:
    | "Available"
    | "Sold"
    | "Under Construction"
    | "Reserved"
    | "Blocked";
  contactNumber?: number;
  agentName?: string;
}

export interface ConstructionDetails {
  contractor?: string;
  siteIncharge?: string;
  workCompleted?: number;
  deliveryDate: string; // ISO string from Date
  municipalPermission?: boolean;
}

export interface FinancialDetails {
  totalAmount: number;
  amountReceived?: number;
  balanceAmount?: number;
  eMIScheme?: boolean;
  registrationStatus?: "Completed" | "In Progress" | "Pending" | "Not Started";
  ratePlan?: string;
}

export interface LocationInfo {
  mainPropertyImage?: string;
  googleMapsLocation?: string;
  additionalPropertyImages?: string[];
  remarks?: string;
}

export interface Property {
  _id?: string; // MongoDB ID
  basicInfo: BasicInfo;
  customerInfo?: CustomerInfo;
  constructionDetails?: ConstructionDetails;
  financialDetails: FinancialDetails;
  locationInfo?: LocationInfo;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
}