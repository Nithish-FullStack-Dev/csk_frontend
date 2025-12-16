import {
  keepPreviousData,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { z } from "zod";

export const CashExpensesSchema = z.object({
  date: z.string().min(1, "Date is required"),

  amount: z
    .number({ invalid_type_error: "Amount is required" })
    .min(0.01, "Amount must be greater than 0"),

  modeOfPayment: z.enum(["CASH", "UPI", "BANK_TRANSFER", "CHEQUE", "CARD"], {
    required_error: "Mode of payment is required",
  }),

  project: z.string().optional(),
  company: z.string().optional(),

  transactionType: z.enum(["DEBIT", "CREDIT"], {
    required_error: "Transaction type is required",
  }),

  description: z.string().optional(),

  partyName: z.string().optional(),

  paymentDetails: z.string().optional(),

  expenseCategory: z.enum(["OFFICE_EXPENSE", "OTHERS"], {
    required_error: "Expense category is required",
  }),

  notes: z.string().optional(),

  proofBill: z.any().optional(),
});

export type CashExpenseFormValues = z.infer<typeof CashExpensesSchema>;

export const fetchRecentInvoices = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/invoices?limit=3&sort=-issueDate`,
    { withCredentials: true }
  );
  return data;
};

export const fetchInvoices = async () => {
  const { data } = await axios.get(`${import.meta.env.VITE_URL}/api/invoices`, {
    withCredentials: true,
  });
  return data;
};
export const fetchPayments = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/payments/accountant`,
    { withCredentials: true }
  );
  return data;
};

const fetchCashFlowData = async () => {
  const res = await axios.get(
    `${import.meta.env.VITE_URL}/api/budget/cashflow`,
    { withCredentials: true }
  );
  return res.data; // array of { month, inflow, outflow, net }
};

export const useCashFlow = () => {
  return useQuery({
    queryKey: ["cashFlow"],
    queryFn: fetchCashFlowData,
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  });
};

export const fetchCashExpenses = async () => {
  const res = await axios.get(
    `${import.meta.env.VITE_URL}/api/cash-expenses/getAllCashExp`,
    {
      withCredentials: true,
    }
  );
  return res.data.data;
};

export const createCashExpense = async (data: FormData) => {
  const res = await axios.post(
    `${import.meta.env.VITE_URL}/api/cash-expenses/addCashExp`,
    data,
    {
      withCredentials: true,
    }
  );
  return res.data;
};

export const updateCashExpense = async ({
  id,
  data,
}: {
  id: string;
  data: FormData;
}) => {
  const res = await axios.put(
    `${import.meta.env.VITE_URL}/api/cash-expenses/updateCashExp/${id}`,
    data,
    { withCredentials: true }
  );
  return res.data;
};

export const deleteCashExpense = async (id: string) => {
  const res = await axios.delete(
    `${import.meta.env.VITE_URL}/api/cash-expenses/deleteCashExp/${id}`,
    { withCredentials: true }
  );
  return res.data;
};

// ! Hooks

export const useCashExpenses = () =>
  useQuery({
    queryKey: ["cash-expenses"],
    queryFn: fetchCashExpenses,
  });
