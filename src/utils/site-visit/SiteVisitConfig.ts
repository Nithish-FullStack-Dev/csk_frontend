import { User } from "@/contexts/AuthContext";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Lead } from "../leads/LeadConfig";

export const createSiteVisit = async (bookDetails: any) => {
  const { data } = await axios.post(
    `${import.meta.env.VITE_URL}/api/siteVisit/bookSite`,
    bookDetails,
    { withCredentials: true },
  );
  return data;
};

export const fetchAllSiteVisits = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/siteVisit/getAllSiteVis`,
    { withCredentials: true },
  );
  return data;
};

export const useBookSiteVisit = () => {
  return useMutation({
    mutationFn: createSiteVisit,
  });
};

export const fetchAllVehicles = async (): Promise<Vehicle[]> => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/cars/getAllCars`,
    { withCredentials: true },
  );
  return data;
};

export const updateVisitStatus = async ({
  visitId,
  visitStatus,
}: {
  visitId: string;
  visitStatus: "completed" | "cancelled";
}) => {
  console.log(visitId);
  const { data } = await axios.patch(
    `${import.meta.env.VITE_URL}/api/siteVisit/updateVisitStatus`,
    {
      visitId,
      visitStatus,
    },
    { withCredentials: true },
  );

  return data;
};

// Interfaces
export interface Vehicle {
  _id: string;
  model: string;
  type: string;
  capacity: number;
  licensePlate: string;
  fuelLevel: string;
  lastService: string;
  status: "available" | "booked" | "assigned";
}

export interface SiteVisitData {
  _id: string;
  clientId: Lead;
  vehicleId: Vehicle;
  date: string;
  time: string;

  approvalStatus: "pending" | "approved" | "rejected";

  visitStatus: "scheduled" | "completed" | "cancelled";

  notes?: string;
  bookedBy: string | User;
  priority: "high" | "medium" | "low";
  createdAt: string;
  updatedAt: string;
}

export interface VisitCardProps {
  visit: SiteVisitData;
  buttonText?: string;
  buttonVariant?: "default" | "outline";
  showNotes?: boolean;
  onEditStatus?: (visit: SiteVisitData) => void;
  onViewDetails?: (visit: SiteVisitData) => void; // Added for detail view
}

export interface ClientSelectionItemProps {
  client: Lead;
  onClick: (client: Lead) => void;
  isSelected: boolean;
}

export interface SiteVisitPayload {
  clientId: string;
  vehicleId?: string;
  priority: string;
  date: string;
  time: string;
  notes?: string;
}
