"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CashExpenseFormValues,
  CashExpensesSchema,
  createCashExpense,
  updateCashExpense,
} from "@/utils/accountant/AccountantConfig";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function CashExpenseDialog({ open, onClose, editData }: any) {
  const isEdit = Boolean(editData);
  const qc = useQueryClient();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<CashExpenseFormValues>({
    resolver: zodResolver(CashExpensesSchema),
    defaultValues: editData || {
      date: "",
      amount: 0,
      modeOfPayment: "CASH",
      transactionType: "DEBIT",
      expenseCategory: "OFFICE_EXPENSE",
    },
  });
  const watchedFile = form.watch("proofBill");

  useEffect(() => {
    console.log("file", watchedFile);
    if (watchedFile && watchedFile.length > 0) {
      const file = watchedFile[0];
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    }

    // EDIT MODE + EXISTING FILE
    if (isEdit && editData?.proofBillUrl) {
      setPreviewUrl(editData.proofBillUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [watchedFile, isEdit, editData]);

  useEffect(() => {
    if (editData) {
      form.reset({
        date: editData.date?.split("T")[0],
        amount: editData.amount,
        modeOfPayment: editData.modeOfPayment,
        transactionType: editData.transactionType,
        expenseCategory: editData.expenseCategory,
        partyName: editData.partyName || "",
        description: editData.description || "",
        paymentDetails: editData.paymentDetails || "",
        notes: editData.notes || "",
      });
    } else {
      form.reset({
        date: "",
        amount: 0,
        modeOfPayment: "CASH",
        transactionType: "DEBIT",
        expenseCategory: "OFFICE_EXPENSE",
        partyName: "",
        description: "",
        paymentDetails: "",
        notes: "",
      });
    }
  }, [editData, form]);

  const createMutation = useMutation({
    mutationFn: createCashExpense,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["cash-expenses"] });
      onClose();
      form.reset();
      toast.success(data?.message || "Expense added successfully");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to add expense");
    },
  });
  const updateMutation = useMutation({
    mutationFn: updateCashExpense,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["cash-expenses"] });
      onClose();
      form.reset();
      toast.success(data?.message || "Expense updated successfully");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update expense");
    },
  });

  const onSubmit = (values: CashExpenseFormValues) => {
    const fd = new FormData();

    Object.entries(values).forEach(([key, value]: any) => {
      if (key === "proofBill" && value?.[0]) {
        fd.append("proofBill", value[0]);
      } else if (value !== undefined && value !== null) {
        fd.append(key, value);
      }
    });

    isEdit
      ? updateMutation.mutate({ id: editData._id, data: fd })
      : createMutation.mutate(fd);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Expense" : "Add Expense"}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-4 overflow-y-auto "
        >
          <div className="px-6 py-4 max-h-[80vh] overflow-y-auto grid gap-4">
            {/* Date */}
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...form.register("date")} />
              <p className="text-red-500 text-sm">
                {form.formState.errors.date?.message}
              </p>
            </div>

            {/* Amount */}
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                {...form.register("amount", { valueAsNumber: true })}
              />
              <p className="text-red-500 text-sm">
                {form.formState.errors.amount?.message}
              </p>
            </div>

            {/* Mode of Payment */}
            <div>
              <Label>Mode of Payment</Label>
              <Select
                value={form.watch("modeOfPayment")}
                onValueChange={(v) => form.setValue("modeOfPayment", v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["CASH", "UPI", "BANK_TRANSFER", "CHEQUE", "CARD"].map(
                    (v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Transaction Type */}
            <div>
              <Label>Debit / Credit</Label>
              <Select
                value={form.watch("transactionType")}
                onValueChange={(v) =>
                  form.setValue("transactionType", v as any)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEBIT">Debit</SelectItem>
                  <SelectItem value="CREDIT">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Expense Category */}
            <div>
              <Label>Expense Category</Label>
              <Select
                value={form.watch("expenseCategory")}
                onValueChange={(v) =>
                  form.setValue("expenseCategory", v as any)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OFFICE_EXPENSE">Office Expense</SelectItem>
                  <SelectItem value="OTHERS">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Party Name */}
            <div>
              <Label htmlFor="partyName">Party Name</Label>
              <Input id="partyName" {...form.register("partyName")} />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...form.register("description")} />
            </div>

            {/* Payment Details */}
            <div>
              <Label htmlFor="paymentDetails">Payment Details</Label>
              <Textarea
                id="paymentDetails"
                {...form.register("paymentDetails")}
              />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" {...form.register("notes")} />
            </div>

            {/* Proof Bill */}
            <div>
              <Label htmlFor="proofBill">Proof Bill</Label>
              <Input
                id="proofBill"
                type="file"
                accept="image/*,application/pdf"
                {...form.register("proofBill")}
              />
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="mt-2 border rounded-md p-2">
                {previewUrl.endsWith(".pdf") ? (
                  <iframe
                    src={previewUrl}
                    className="w-full h-64"
                    title="PDF Preview"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Proof Preview"
                    className="max-h-64 object-contain rounded"
                  />
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {isEdit
                  ? updateMutation.isPending
                    ? "Updating..."
                    : "Update"
                  : createMutation.isPending
                  ? "Saving..."
                  : "Save"}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
