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
  to: string;
  project: Building;
  issueDate: string;
  dueDate: string;
  amount: number;
  sgst: number;
  cgst: number;
  total: number;
  status: string;
  subtotal: number;
  paymentDate: string | null;
  notes?: string;
  task?: string;
  unit: Property;
  floorUnit: FloorUnit;
  invoiceNumber?: string;
  items: InvoiceItem[];
}

export const fetchInvoices = async () => {
  const response = await axios.get(`${import.meta.env.VITE_URL}/api/invoices`, {
    withCredentials: true,
  });
  return response.data;
};

export const fetchCompletedTasks = async () => {
  const res = await axios.get(
    `${import.meta.env.VITE_URL}/api/invoices/completed/tasks`,
    { withCredentials: true }
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
