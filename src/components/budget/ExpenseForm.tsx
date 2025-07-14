import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface ExpenseFormProps {
  onSubmit: (expense: any) => void;
}

const ExpenseForm = ({ onSubmit }: ExpenseFormProps) => {
  const [expense, setExpense] = useState({
    category: "",
    amount: "",
    vendor: "",
    description: "",
    date: "",
    proof: null,
  });

  const handleSubmit = async () => {
    if (
      !expense.category ||
      !expense.amount ||
      !expense.vendor ||
      !expense.date
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    await onSubmit(expense);
    setExpense({
      category: "",
      amount: "",
      vendor: "",
      description: "",
      date: "",
      proof: null,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="category">Category *</Label>
        <Select
          value={expense.category}
          onValueChange={(value) => setExpense({ ...expense, category: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Marketing">Marketing</SelectItem>
            <SelectItem value="Construction">Construction</SelectItem>
            <SelectItem value="Operations">Operations</SelectItem>
            <SelectItem value="Sales">Sales</SelectItem>
            <SelectItem value="Administration">Administration</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="amount">Amount (₹) *</Label>
        <Input
          id="amount"
          type="number"
          value={expense.amount}
          min={0}
          onChange={(e) => setExpense({ ...expense, amount: e.target.value })}
          placeholder="Enter amount"
        />
      </div>
      <div>
        <Label htmlFor="vendor">Expense Name *</Label>
        <Input
          id="vendor"
          min={0}
          value={expense.vendor}
          onChange={(e) => setExpense({ ...expense, vendor: e.target.value })}
          placeholder="Vendor name"
        />
      </div>
      <div>
        <Label htmlFor="date">Date *</Label>
        <Input
          id="date"
          type="date"
          value={expense.date}
          onChange={(e) => setExpense({ ...expense, date: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Proof (optional)</Label>
        <div className="relative flex items-center">
          <input
            type="file"
            id="proof"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setExpense({ ...expense, proof: e.target.files[0] });
              }
            }}
            className="hidden"
          />
          <label
            htmlFor="proof"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md cursor-pointer hover:bg-blue-700 transition"
          >
            Choose File
          </label>
          <span className="ml-4 text-sm text-gray-600 truncate">
            {expense.proof ? expense.proof.name : "No file selected"}
          </span>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={expense.description}
          onChange={(e) =>
            setExpense({ ...expense, description: e.target.value })
          }
          placeholder="Expense description"
        />
      </div>
      <Button onClick={handleSubmit} className="w-full">
        Add Expense
      </Button>
    </div>
  );
};

export default ExpenseForm;
