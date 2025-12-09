import { User } from "@/contexts/AuthContext";
import { Project } from "@/utils/project/ProjectConfig";

export type ObjectId = string;

export interface PaymentRecord {
  modeOfPayment?: "Cash" | "Cheque" | "NEFT" | "RTGS" | "UPI";
  paymentDate: string;
  lastPaymentDate: string;
}

export type Populated<T> = ObjectId | T;

export interface ContractorList {
  _id: ObjectId;

  userId: Populated<User>;

  companyName: string;
  gstNumber?: string;
  panCardNumber?: string;

  contractorType: "Individual" | "Firm" | "Private Ltd" | "LLP" | "Other";

  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;

  contractStartDate?: string;
  contractEndDate?: string;

  projectsAssigned?: Populated<Project>[];

  siteIncharge?: Populated<User>;
  accountsIncharge?: Populated<User>;

  amount: number;
  advancePaid: number;
  balancePaid: number;

  paymentDetails?: PaymentRecord[];

  billInvoiceNumber?: string;
  billCopy?: string;

  workDetails?: string;
  billedDate?: string;

  billApprovedBySiteIncharge: boolean;
  billProcessedByAccountant: boolean;

  finalPaymentDate?: string;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface ContractorResponse {
  statusCode: string;
  data: ContractorList[];
  message: string;
  success: boolean;
}
