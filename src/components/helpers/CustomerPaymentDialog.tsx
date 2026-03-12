import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";
import { addCustomerPayment } from "@/utils/accountant/CustomerPaymentConfig";
import axios from "axios";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  customerId: string;
};

export default function CustomerPaymentDialog({
  open,
  onOpenChange,
  customerId,
}: Props) {
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("PAYMENT");
  const [mode, setMode] = useState("");
  const [ref, setRef] = useState("");
  const [remarks, setRemarks] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      addCustomerPayment({
        customerId,
        payload: {
          amount: Number(amount),
          date,
          type,
          paymentMode: mode,
          referenceNumber: ref,
          remarks,
        },
      }),

    onSuccess: (data) => {
      toast.success(data.message||"Payment added");

      queryClient.invalidateQueries({
        queryKey: ["customerPayments", customerId],
      });

      queryClient.invalidateQueries({
        queryKey: ["customers"],
      });

      onOpenChange(false);
    },onError:(err)=>{
        toast.error(axios.isAxiosError(err)?err.response.data.message:err.message)
        console.log("error",err)
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* amount */}
          <Input
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          {/* date */}
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          {/* type enum */}
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="PAYMENT">Payment</SelectItem>
              <SelectItem value="ADVANCE">Advance</SelectItem>
              <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
            </SelectContent>
          </Select>

          {/* payment mode */}
          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger>
              <SelectValue placeholder="Payment Mode" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="BANK">Bank</SelectItem>
              <SelectItem value="UPI">UPI</SelectItem>
              <SelectItem value="CHEQUE">Cheque</SelectItem>
              <SelectItem value="ONLINE">Online</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Reference Number"
            value={ref}
            onChange={(e) => setRef(e.target.value)}
          />

          <Input
            placeholder="Remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Adding Payment..." : "Add Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
