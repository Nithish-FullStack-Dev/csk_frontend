import { User } from "@/contexts/AuthContext";

export type LandType =
    | "Agricultural"
    | "Commercial"
    | "Residential"
    | "Industrial"
    | "Farm Land"
    | "Open Plot";

export type LandApproval =
    | "DTCP"
    | "HMDA"
    | "Panchayat"
    | "Municipality"
    | "Unapproved"
    | "NA"
    | "Other";

export type LandAvailabilityStatus =
    | "Available"
    | "Sold"
    | "Blocked"
    | "Reserved"
    | "Under Discussion";

export interface OpenLand {
    _id?: string;

    projectName: string;         // Name of the land project
    plotNo: string;              // Plot number / survey number / parcel identifier
    location: string;            // Location / address
    city?: string;
    state?: string;
    country?: string;

    landArea: number;            // Total land area (sqft / sq-yd / acres)
    areaUnit: "sqft" | "sq-yd" | "acre"; // Unit of land measurement

    pricePerUnit?: number;       // Price per unit (optional)
    totalPrice?: number;         // Total land price (optional)
    googleMapsLink?: string;

    brochureUrl?: string;        // Brochure file path
    thumbnailUrl?: string;       // Thumbnail image

    description?: string;        // Short description
    features?: string[];         // Key highlights / features

    // Legal approvals
    reraApproved?: boolean;
    reraNumber?: string;
    municipalPermission?: boolean;

    // Timestamps
    createdAt?: string;
    updatedAt?: string;
    availableDate?: string;
}


export const sampleOpenLands: OpenLand[] = [];
