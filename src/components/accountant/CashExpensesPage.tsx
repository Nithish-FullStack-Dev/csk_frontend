import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableHeader,
  TableBody,
} from "@/components/ui/table";
import { Loader2, Pencil, Trash, MoreHorizontal, Eye } from "lucide-react";
import {
  deleteCashExpense,
  useCashExpenses,
} from "@/utils/accountant/AccountantConfig";
import CashExpenseDialog from "./CashExpenseDialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DeleteConfirmDialog } from "../properties/DeleteConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

export default function CashExpensesPage() {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useCashExpenses();
  const [viewData, setViewData] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const deleteMutation = useMutation({
    mutationFn: deleteCashExpense,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["cash-expenses"] });
      toast.success(data?.message || "Expense deleted");
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Failed to delete expense"),
  });

  if (isLoading) {
    return <Loader2 className="animate-spin" />;
  }

  if (isError) {
    return <p className="text-red-500">Failed to load expenses</p>;
  }

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId);
  };

  return (
    <>
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Cash Expenses</h2>
        <Button onClick={() => setOpen(true)}>Add Expense</Button>
      </div>
      <div className="rounded-lg border bg-background overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <span className="text-sm font-medium">
                      No cash / expense records found
                    </span>
                    <span className="text-xs">
                      Start by adding a new expense using the button above
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((item: any) => (
                <TableRow key={item._id}>
                  <TableCell>{item.date?.split("T")[0]}</TableCell>
                  <TableCell>{item.amount}</TableCell>
                  <TableCell>{item.modeOfPayment}</TableCell>
                  <TableCell>{item.transactionType}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-40">
                        {/* View Details */}
                        <DropdownMenuItem
                          onClick={() => {
                            setViewData(item);
                            setViewDialogOpen(true);
                          }}
                          className="cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View details
                        </DropdownMenuItem>

                        {/* Edit */}
                        <DropdownMenuItem
                          onClick={() => {
                            setEditData(item);
                            setOpen(true);
                          }}
                          className="cursor-pointer"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {/* Delete */}
                        <DropdownMenuItem
                          onClick={() => {
                            setDeleteId(item._id);
                            setDeleteDialogOpen(true);
                          }}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <CashExpenseDialog
        open={open}
        onClose={() => {
          setOpen(false);
          setEditData(null);
        }}
        editData={editData}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Expenses"
        description="Are you sure you want to delete this purchase? This action cannot be undone."
      />

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Expense Details</DialogTitle>
          </DialogHeader>

          {viewData && (
            <div className="space-y-2 text-sm">
              <div>
                <strong>Date:</strong> {viewData.date?.split("T")[0]}
              </div>
              <div>
                <strong>Amount:</strong> ₹{viewData.amount}
              </div>
              <div>
                <strong>Mode:</strong> {viewData.modeOfPayment}
              </div>
              <div>
                <strong>Type:</strong> {viewData.transactionType}
              </div>
              <div>
                <strong>Category:</strong> {viewData.expenseCategory}
              </div>
              <div>
                <strong>Party:</strong> {viewData.partyName}
              </div>
              <div>
                <strong>Description:</strong> {viewData.description}
              </div>

              {viewData.proofBillUrl && (
                <a
                  href={viewData.proofBillUrl}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  View proof document
                </a>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
