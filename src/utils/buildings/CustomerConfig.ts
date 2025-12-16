import { User } from "@/contexts/AuthContext";
import { Building, FloorUnit } from "@/types/building";
import { Populated } from "@/types/contractor";
import { Property } from "@/types/property";
import axios from "axios";
import { string, z } from "zod";
import { ApiResponse } from "../leads/LeadConfig";
import { useQuery } from "@tanstack/react-query";

//! interface
export interface PaymentDetail {
  amount: number;
  date?: string;
  paymentMode?: string;
  referenceNumber?: string;
  remarks?: string;
}

export interface Customer {
  _id: string;

  customerId: Populated<User>;
  purchasedFrom: Populated<User>;

  projectCompany?: string;

  property: Populated<Building>;
  floorUnit: Populated<FloorUnit>;
  unit: Populated<Property>;

  referralName?: string;
  referralContact?: string;

  registrationStatus: "Booked" | "Registered" | "Cancelled" | "Completed";

  bookingDate?: string;

  totalAmount: number;
  advanceReceived?: number;
  balancePayment: number;

  lastPaymentDate?: string;

  paymentPlan?:
    | "Down Payment"
    | "Monthly EMI"
    | "Construction Linked Plan"
    | "Custom Plan";

  paymentDetails?: PaymentDetail[];

  notes?: string;

  contractorId?: Populated<User>;
  siteInchargeId?: Populated<User>;

  constructionStage?: string;

  expectedDeliveryDate?: string;
  deliveryDate?: string;

  status: "Active" | "Completed" | "Delayed" | "Cancelled";

  finalPrice?: number;
  paymentStatus?: "Pending" | "In Progress" | "Completed";
  pdfDocument?: string;

  images?: string[];

  createdAt: string;
  updatedAt: string;
}

export type CustomerData = ApiResponse<Customer[]>;

//! ZOD
export const paymentDetailSchema = z.object({
  amount: z
    .number({ required_error: "Payment amount is required" })
    .min(0, "Payment amount cannot be negative"),

  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "payment date is invalid",
    })
    .optional(),

  paymentMode: z.string().trim().optional(),
  referenceNumber: z.string().trim().optional(),
  remarks: z.string().trim().optional(),
});

export const CustomerValidationSchema = z.object({
  customerId: z
    .string({ required_error: "Customer ID is required" })
    .min(1, "Customer ID is required"),

  purchasedFrom: z
    .string({ required_error: "Purchased From (Agent Id) is required" })
    .min(1, "Agent ID is required"),

  projectCompany: z.string().trim().optional(),

  property: z
    .string({ required_error: "Property ID is required" })
    .min(1, "Property ID is required"),

  floorUnit: z
    .string({ required_error: "Floor Unit ID is required" })
    .min(1, "Floor Unit ID is required"),

  unit: z
    .string({ required_error: "Unit ID is required" })
    .min(1, "Unit ID is required"),

  referralName: z.string().trim().optional(),

  referralContact: z
    .string()
    .trim()
    .min(10, "Referral contact must be at least 10 digits")
    .optional(),

  registrationStatus: z.enum(
    ["Booked", "Registered", "Cancelled", "Completed"],
    {
      required_error: "Registration status is required",
    }
  ),

  bookingDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Booking date is invalid",
    })
    .optional(),

  totalAmount: z.coerce
    .number({ required_error: "Total amount is required" })
    .min(0, "Total amount cannot be negative"),

  advanceReceived: z.coerce
    .number()
    .min(0, "Advance amount cannot be negative")
    .optional(),

  lastPaymentDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Last payment date is invalid",
    })
    .optional(),

  paymentPlan: z
    .enum([
      "Down Payment",
      "Monthly EMI",
      "Construction Linked Plan",
      "Custom Plan",
    ])
    .optional(),

  paymentDetails: z.array(paymentDetailSchema).optional(),

  notes: z
    .string()
    .trim()
    .max(1000, "Notes cannot exceed 1000 characters")
    .optional(),

  contractorId: z
    .string({ required_error: "Contractor ID is required" })
    .min(1, "Contractor ID is required"),

  siteInchargeId: z
    .string({ required_error: "Site Incharge ID is required" })
    .min(1, "Site Incharge ID is required"),

  constructionStage: z.string().trim().optional(),

  expectedDeliveryDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Expected delivery date is invalid",
    })
    .optional(),

  deliveryDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Delivery date is invalid",
    })
    .optional(),

  status: z.enum(["Active", "Completed", "Delayed", "Cancelled"], {
    required_error: "Status is required",
  }),

  finalPrice: z.coerce
    .number()
    .min(0, "Final price cannot be negative")
    .optional(),

  paymentStatus: z
    .enum(["Pending", "In Progress", "Completed"], {
      required_error: "Payment status is required",
    })
    .optional(),
  documents: z.any().optional(),
  pdfFile: z.any().optional(),
});

// ! Functions
export const fetchCustomers = async (): Promise<ApiResponse<Customer[]>> => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/customer/getAllCustomers`,
    {
      withCredentials: true,
    }
  );
  return data;
};

export const fetchAgents = async (): Promise<User[]> => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/user/getAllAgents`,
    {
      withCredentials: true,
    }
  );
  return data || [];
};

export const fetchAllCustomer_purchased = async (): Promise<User[]> => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/user/getAllcustomer_purchased`,
    {
      withCredentials: true,
    }
  );
  return data || [];
};

export const useGetCustomers = (user: User) => {
  return useQuery<CustomerData>({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
    staleTime: 0,
    enabled: !!user?._id,
  });
};
