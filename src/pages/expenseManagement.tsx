import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";
import { CheckCircle, CreditCard, Edit, Eye, MoreHorizontal, Trash2, XCircle } from "lucide-react";
import { Label } from "recharts";
import { Textarea } from "@/components/ui/textarea";

interface Expense {
  _id: string;
  accountant: string;
  expenseName: string;
  category: string;
  date: string;
  amount: number;
  description?: string;
  isApprovedByOwner: boolean;
  status: "Pending" | "Approved" | "Rejected";
  proof?: string;
}

const ExpenseManagementPage = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all-categories");
  const [statusFilter, setStatusFilter] = useState("all-statuses");
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState("Approved");
  const [ownerNotes, setOwnerNotes] = useState("");

  const fetchExpenses = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/expenses", {
        withCredentials: true,
      });
      setExpenses(res.data || []);
    } catch (err) {
      console.error("Error fetching expenses", err);
    }
  };

  const handleExpenseApproval = async () => {
    try {
      await axios.put(
        `http://localhost:3000/api/expenses/${selectedExpense._id}/owner-approval`,
        { status: approvalStatus, notes: ownerNotes },
        { withCredentials: true }
      );
      //toast.success("Expense updated successfully");
      setApprovalDialogOpen(false);
      fetchExpenses(); // refresh data
    } catch (error) {
      //toast.error("Failed to update expense");
    }
  };

  

  useEffect(() => {
    fetchExpenses();
  }, []);

  const filteredExpenses = expenses.filter((expense) => {
    if (
      searchQuery &&
      !expense.expenseName.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;

    if (
      categoryFilter !== "all-categories" &&
      expense.category !== categoryFilter
    )
      return false;

    if (statusFilter !== "all-statuses" && expense.status !== statusFilter)
      return false;

    return true;
  });

  return (
    <MainLayout>
      <div className="space-y-6 p-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Expense Management
          </h1>
          <p className="text-muted-foreground">
            View and manage all project-related expenses here
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
          <Input
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="md:w-1/3"
          />

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              {categoryFilter === "all-categories"
                ? "All Categories"
                : categoryFilter}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-categories">All Categories</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Construction">Construction</SelectItem>
              <SelectItem value="Operations">Operations</SelectItem>
              <SelectItem value="Sales">Sales</SelectItem>
              <SelectItem value="Administration">Administration</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              {statusFilter === "all-statuses" ? "All Statuses" : statusFilter}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-statuses">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expense Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Accountant</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                  {/* <TableHead className="text-right">Actions</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No expenses found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExpenses.map((expense) => (
                    <TableRow key={expense._id}>
                      <TableCell>{expense.expenseName}</TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell>{expense.accountant.name}</TableCell>
                      <TableCell>
                        {new Date(expense.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>₹{expense.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{expense.status}</Badge>
                      </TableCell>
                      {/* <TableCell>
                        {expense.proof ? (
                          <a
                            href={expense.proof}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline text-xs"
                          >
                            View
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setSelectedExpense(expense);
                            setOpenDialog(true);
                          }}
                        >
                          View
                        </Button>
                      </TableCell> */}

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedExpense(expense);
                                setOpenDialog(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Expenditure
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                                setSelectedExpense(expense);
                                setApprovalDialogOpen(true);
                              }}>
                              <Edit className="mr-2 h-4 w-4" />
                              Update status
                            </DropdownMenuItem>
                            {/* <DropdownMenuItem>
                              <CreditCard className="mr-2 h-4 w-4" />
                              Mark as Paid
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem> */}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Enhanced Dialog View */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Expense: {selectedExpense?.expenseName}</DialogTitle>
            </DialogHeader>

            {selectedExpense && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Category:</p>
                    <p className="font-medium">{selectedExpense.category}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Accountant:</p>
                    <p>{selectedExpense.accountant.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date:</p>
                    <p>{new Date(selectedExpense.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Amount:</p>
                    <p>₹{selectedExpense.amount.toLocaleString()}</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Status:</p>
                    <Badge variant="outline">{selectedExpense.status}</Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Approved by Owner:</p>
                    <p>{selectedExpense.isApprovedByOwner ? "Yes" : "No"}</p>
                  </div>
                </div>

                {selectedExpense.description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Description:
                    </p>
                    <p className="text-sm">{selectedExpense.description}</p>
                  </div>
                )}

                {selectedExpense.proof && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Proof Document:
                    </p>
                    <img
                      src={selectedExpense.proof}
                      alt="Proof"
                      className="w-full max-h-60 object-contain border"
                    />
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOpenDialog(false);
                      setSelectedExpense(null);
                    }}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {selectedExpense && (
          <Dialog
            open={approvalDialogOpen}
            onOpenChange={setApprovalDialogOpen}
          >
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Review & Approve Expenditure</DialogTitle>
                <DialogDescription>
                  Approve or reject the expenditure submitted by the accountant.
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleExpenseApproval(); // implement this function
                }}
                className="space-y-4 pt-4"
              >
                <div className="bg-muted p-4 rounded-md space-y-2 text-sm">
                  <p>
                    <strong>Expense Name:</strong> {selectedExpense.expenseName}
                  </p>
                  <p>
                    <strong>Category:</strong> {selectedExpense.category}
                  </p>
                  <p>
                    <strong>Submitted By:</strong>{" "}
                    {selectedExpense.accountant.name}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(selectedExpense.date).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Amount:</strong> ₹
                    {selectedExpense.amount.toLocaleString()}
                  </p>
                  <p>
                    <strong>Status:</strong>
                    <Badge variant="outline" className="ml-2">
                      {selectedExpense.status}
                    </Badge>
                  </p>
                  <p>
                    <strong>Description:</strong>{" "}
                    {selectedExpense.description || "N/A"}
                  </p>
                  {selectedExpense.proof && (
                    <div>
                      <p className="font-medium">Proof:</p>
                      <img
                        src={selectedExpense.proof}
                        alt="Proof"
                        className="w-full max-h-64 object-contain border rounded mt-2"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={approvalStatus}
                    onValueChange={setApprovalStatus as any}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Approved">
                        <div className="flex items-center">
                          <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                          Approve
                        </div>
                      </SelectItem>
                      <SelectItem value="Rejected">
                        <div className="flex items-center">
                          <XCircle className="mr-2 h-4 w-4 text-red-600" />
                          Reject
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerNotes">Owner Notes</Label>
                  <Textarea
                    id="ownerNotes"
                    value={ownerNotes}
                    onChange={(e) => setOwnerNotes(e.target.value)}
                    placeholder="Optional comments or feedback for the accountant"
                    rows={3}
                  />
                </div>

                <DialogFooter className="pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setApprovalDialogOpen(false);
                      setApprovalStatus("Approved");
                      setOwnerNotes("");
                      setSelectedExpense(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant={
                      approvalStatus === "Approved" ? "default" : "destructive"
                    }
                  >
                    Submit
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  );
};

export default ExpenseManagementPage;
