import { useMemo, useState } from "react";
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
import { Input } from "../ui/input";
import * as XLSX from "xlsx";
import DetailItem from "../helpers/DetailItem";

export default function CashExpensesPage() {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useCashExpenses();
  const [viewData, setViewData] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState("");

  const deleteMutation = useMutation({
    mutationFn: deleteCashExpense,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["cash-expenses"] });
      toast.success(data?.message || "Expense deleted");
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Failed to delete expense"),
  });

  const filteredExpenses = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];

    const query = (search ?? "").trim().toLowerCase();
    if (!query) return data;

    return data.filter((item: any) => {
      if (!item || typeof item !== "object") return false;

      const partyName = String(item.partyName ?? "").toLowerCase();
      const category = String(item.expenseCategory ?? "").toLowerCase();
      const description = String(item.description ?? "").toLowerCase();
      const mode = String(item.modeOfPayment ?? "").toLowerCase();
      const type = String(item.transactionType ?? "").toLowerCase();
      const amount = String(item.amount ?? "").toLowerCase();
      const date = String(item.date ?? "").toLowerCase();

      return (
        partyName.includes(query) ||
        category.includes(query) ||
        description.includes(query) ||
        mode.includes(query) ||
        type.includes(query) ||
        amount.includes(query) ||
        date.includes(query)
      );
    });
  }, [data, search]);

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

  const handleExportExcel = () => {
    if (!filteredExpenses || filteredExpenses.length === 0) {
      toast.error("No data to export");
      return;
    }

    const exportData = filteredExpenses.map((e: any, i: number) => ({
      S_No: i + 1,
      Date: e.date?.split("T")[0] ?? "N/A",
      Amount: e.amount ?? 0,
      "Mode of Payment": e.modeOfPayment ?? "N/A",
      "Transaction Type": e.transactionType ?? "N/A",
      Category: e.expenseCategory ?? "N/A",
      Party: e.partyName ?? "N/A",
      Description: e.description ?? "N/A",
      PaymentDetails: e.paymentDetails ?? "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Cash Expenses");
    XLSX.writeFile(workbook, "cash-expenses.xlsx");
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="flex gap-2 justify-end w-full flex-col md:flex-row">
          <Button
            variant="outline"
            onClick={handleExportExcel}
            disabled={filteredExpenses.length === 0}
          >
            Export to Excel
          </Button>
          <Input
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-64"
          />
          <Button onClick={() => setOpen(true)}>Add Expense</Button>
        </div>
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
            {filteredExpenses.length === 0 ? (
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
              filteredExpenses.map((item: any) => (
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
        <DialogContent className="max-w-lg rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Expense Details
            </DialogTitle>
          </DialogHeader>

          {viewData && (
            <div className="mt-4 space-y-4 text-sm">
              {/* BASIC INFO */}
              <div className="grid grid-cols-2 gap-4 border rounded-lg p-4 bg-muted/10">
                <DetailItem
                  label="Date"
                  value={viewData.date?.split("T")[0] || "—"}
                />
                <DetailItem
                  label="Amount"
                  value={`₹${viewData.amount}`}
                  highlight
                />
                <DetailItem
                  label="Payment Mode"
                  value={viewData.modeOfPayment || "—"}
                />
                <DetailItem
                  label="Transaction Type"
                  value={viewData.transactionType || "—"}
                />
                <DetailItem
                  label="Category"
                  value={viewData.expenseCategory || "—"}
                />
                <DetailItem
                  label="Party Name"
                  value={viewData.partyName || "—"}
                />
              </div>

              {/* DESCRIPTION */}
              <div className="border rounded-lg p-4 bg-muted/10">
                <p className="text-muted-foreground mb-1">Description</p>
                <p className="font-medium whitespace-pre-wrap">
                  {viewData.description || "—"}
                </p>
              </div>

              {/* PAYMENT DETAILS */}
              {viewData.paymentDetails && (
                <div className="border rounded-lg p-4 bg-muted/10">
                  <p className="text-muted-foreground mb-1">Payment Details</p>
                  <p className="font-medium whitespace-pre-wrap">
                    {viewData.paymentDetails}
                  </p>
                </div>
              )}

              {/* PROOF DOCUMENT */}
              {viewData.proofBillUrl && (
                <div className="border rounded-lg p-4 bg-muted/10 flex items-center justify-between">
                  <div>
                    <p className="font-medium">Proof Document</p>
                    <p className="text-xs text-muted-foreground">
                      Click to view attached bill
                    </p>
                  </div>

                  <a
                    href={viewData.proofBillUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 font-medium hover:underline"
                  >
                    View File
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
