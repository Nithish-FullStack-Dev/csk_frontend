import { User } from "@/contexts/AuthContext";
import { Building, FloorUnit } from "@/types/building";
import { Property } from "@/types/property";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface InvoiceItem {
  _id?: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  taxRate: number;
}

export interface Invoice {
  _id: string;
  invoiceNumber?: string;
  project: Building;
  unit: Property;
  floorUnit: FloorUnit;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  total: number;
  paidAmount: number;
  remainingAmount: number;
  sgst: number;
  cgst: number;
  status:
    | "draft"
    | "pending"
    | "approved"
    | "partially_paid"
    | "paid"
    | "rejected";
  paymentDate: string | null;
  notes?: string;
  task?: string | null;
  items: InvoiceItem[];
  user?: User | null;
  approvedByAccountant?: User | null;
  createdRole?: "contractor" | "accountant";
}

export const fetchInvoices = async () => {
  const response = await axios.get(`${import.meta.env.VITE_URL}/api/invoices`, {
    withCredentials: true,
  });
  return response.data as Invoice[];
};

export const fetchCompletedTasks = async () => {
  const res = await axios.get(
    `${import.meta.env.VITE_URL}/api/invoices/completed/tasks`,
    { withCredentials: true },
  );
  return res.data.tasks;
};

export const useFetchInvoices = () => {
  return useQuery<Invoice[]>({
    queryKey: ["invoice"],
    queryFn: fetchInvoices,
    staleTime: 2 * 60 * 1000,
  });
};
