// ---------------- LAND ENUMS ----------------

export type LandType =
    | "Agriculture"
    | "Non-Agriculture"
    | "Residential Land"
    | "Commercial Land"
    | "Industrial Land"
    | "Farm Land"
    | "Other";

export type LandStatus = "Available" | "Sold" | "Reserved" | "Blocked";

export type LandApproval =
    | "DTCP"
    | "HMDA"
    | "Panchayat"
    | "Municipality"
    | "Unapproved"
    | "NA"
    | "Other";
export interface InterestedCustomerEntry {
    _id?: string;
    lead: {
        _id: string;
        name?: string;
        phone?: string;
        email?: string;
    } | null;

    agent: {
        _id: string;
        name?: string;
        email?: string;
    } | null;

    createdAt?: string;
}
export interface OpenLand {
    _id?: string;
    projectName: string;
    location: string;
    landType: LandType;
    landStatus: LandStatus;
    landSize?: string;
    landArea?: number;
    areaUnit?: "Sqft" | "Sqyd" | "Acre" | "Hectare";
    facing?:
    | "North"
    | "East"
    | "West"
    | "South"
    | "North-East"
    | "North-West"
    | "South-East"
    | "South-West"
    | "Not Applicable";
    roadAccessWidth?: string;
    fencingAvailable?: boolean;
    waterFacility?: boolean;
    electricity?: boolean;
    description?: string;
    municipalPermission?: boolean;
    reraApproved?: boolean;
    reraNumber?: string;
    LandApproval: LandApproval;
    availableDate?: string;
    thumbnailUrl?: string;
    images?: string[];
    surveyNumber?: string;
    brochureUrl?: string;
    googleMapsLocation?: string;
    ownerName?: string;
    ownerCustomer?: {
        _id: string;
        name?: string;
        phone?: string;
        email?: string;
    } | null;
    interestedCustomers?: InterestedCustomerEntry[];
    soldToCustomer?: {
        _id: string;
        name?: string;
        phone?: string;
        email?: string;
    } | null;

    soldDate?: string | null;
    agentId?: {
        _id: string;
        name?: string;
        email?: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

export const sampleOpenLands: OpenLand[] = [];
