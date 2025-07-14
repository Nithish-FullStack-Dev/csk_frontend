export interface OpenPlot {
  // MongoDB automatically adds _id and timestamps
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;

  // Basic Plot Information
  memNo: string;
  projectName: string;
  plotNo: string;
  facing:
    | "North"
    | "East"
    | "West"
    | "South"
    | "North-East"
    | "North-West"
    | "South-East"
    | "South-West";
  extentSqYards: number;
  plotType: "Residential" | "Commercial" | "Agricultural" | "Industrial";
  approval:
    | "DTCP"
    | "HMDA"
    | "Panchayat"
    | "Municipality"
    | "Unapproved"
    | "Other";
  isCornerPlot?: boolean;
  isGatedCommunity?: boolean;

  // Financial Details
  pricePerSqYard: number;
  totalAmount: number;
  bookingAmount?: number;
  amountReceived?: number;
  balanceAmount?: number;
  emiScheme?: boolean;
  registrationStatus:
    | "Not Started"
    | "In Progress"
    | "Pending Documents"
    | "Pending Payment"
    | "Scheduled"
    | "Completed"
    | "Delayed"
    | "Cancelled";
  listedDate: Date;
  availableFrom: Date;

  // Availability & Customer Details
  availabilityStatus:
    | "Available"
    | "Sold"
    | "Reserved"
    | "Blocked"
    | "Under Dispute";
  customerName?: string;
  customerContact?: string;
  agentName?: string;

  // Location & Images
  googleMapsLink?: string;
  thumbnailUrl?: string;
  images?: string[];

  // Additional Details
  remarks?: string;
  roadWidthFt?: number;
  landmarkNearby?: string;
}
