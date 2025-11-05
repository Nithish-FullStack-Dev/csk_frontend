export type PropertyStatus =
  | "Available"
  | "Sold"
  | "Under Construction"
  | "Reserved"
  | "Blocked";

export interface Amenity {
  name: string;
  icon: string; // Icon name (e.g., "Car")
}

export interface Building {
  _id?: string;
  projectName: string;
  location: string;
  propertyType:
    | "Villa Complex"
    | "Apartment Complex"
    | "Plot Development"
    | "Land Parcel"
    | "Commercial";
  totalUnits: number;
  availableUnits: number;
  soldUnits: number;
  constructionStatus: "Completed" | "Under Construction" | "Planned";
  completionDate: string;
  priceRange?: {
    min: number;
    max: number;
  };
  thumbnailUrl?: string;
  images?: string[];
  description?: string;
  municipalPermission: boolean;
  reraApproved?: boolean;
  reraNumber?: string;
  amenities?: Amenity[];
  googleMapsLocation?: string;
  brochureUrl?: string | null;
  brochureFileId?: string | null;
  createdAt?: string;
}

export interface FloorUnit {
  _id?: string;
  buildingId: string;
  floorNumber: number;
  unitType: string; // e.g., "1 BHK", "2 BHK", "Villa"
  totalSubUnits: number;
  availableSubUnits: number;
}
