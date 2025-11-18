import { User } from "@/contexts/AuthContext";

export type LandType =
    | "Agricultural"
    | "Commercial"
    | "Residential"
    | "Industrial"
    | "Farm Land"
    | "Open Land";

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

/** Interested customer entry structure */
export interface InterestedCustomerEntry {
    customer: {
        _id: string;
        name: string;
        phone?: string;
        email?: string;
    };
    agent: {
        _id: string;
        name: string;
        email?: string;
    };
    addedAt?: string;
}

export interface OpenLand {
    _id?: string;

    projectName: string;
    plotNo: string;
    location: string;
    city?: string;
    state?: string;
    country?: string;

    facing?: string;

    landType: LandType;
    landApproval: LandApproval;
    availabilityStatus: LandAvailabilityStatus;

    landArea: number;
    areaUnit: "Sqft" | "Sqyd" | "Acre" | "Hectare";

    pricePerUnit?: number;
    totalPrice?: number;

    googleMapsLocation?: string;

    brochureUrl?: string;
    thumbnailUrl?: string;
    images?: string[];

    description?: string;
    features?: string[];

    // Legal approvals
    reraApproved?: boolean;
    reraNumber?: string;
    municipalPermission?: boolean;

    // NEW CUSTOMER RELATIONS (Matches backend)
    ownerCustomer?: {
        _id: string;
        name: string;
        phone?: string;
        email?: string;
    } | null;

    interestedCustomers?: InterestedCustomerEntry[];

    soldToCustomer?: {
        _id: string;
        name: string;
        phone?: string;
        email?: string;
    } | null;

    soldDate?: string | null;

    // Agent who listed this property
    agentId?: {
        _id: string;
        name: string;
        email?: string;
    };

    createdAt?: string;
    updatedAt?: string;
    availableDate?: string;
}

export const sampleOpenLands: OpenLand[] = [];
