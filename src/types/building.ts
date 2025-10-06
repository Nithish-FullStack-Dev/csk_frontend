export type PropertyStatus =
  | "Available"
  | "Sold"
  | "Under Construction"
  | "Reserved"
  | "Blocked";

export interface Building {
  id: string;
  projectName: string;
  location: string;
  propertyType:
    | "Villa Complex"
    | "Apartment Complex"
    | "Plot Development"
    | "Land Parcel";
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
  googleMapsLocation?: string;
  brochureUrl?: string | null;
  brochureFileId?: string | null;
}

export interface FloorUnit {
  id: string;
  buildingId: string;
  floorNumber: number;
  unitType: string; // e.g., "1 BHK", "2 BHK", "Villa"
  totalSubUnits: number;
  availableSubUnits: number;
  priceRange?: {
    min: number;
    max: number;
  };
}
