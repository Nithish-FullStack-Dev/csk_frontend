import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import axios from "axios";

const PHASES = [
  "Marketing",
  "Construction",
  "Operations",
  "Sales",
  "Administration",
];

export default function AddBudgetForm({ onClose }) {
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [phaseBudgets, setPhaseBudgets] = useState(
    PHASES.reduce((acc, phase) => ({ ...acc, [phase]: "" }), {})
  );
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const total = Object.values(phaseBudgets).reduce(
      (sum, val) => sum + Number(val || 0),
      0
    );

    if (Number(monthlyBudget) !== total) {
      setError("Sum of all phases must equal the monthly budget.");
      return;
    }

    setError("");

    const budgetData = {
      monthlyBudget: Number(monthlyBudget),
      phases: PHASES.map((name) => ({
        name,
        budget: Number(phaseBudgets[name]),
      })),
    };

    // Replace this with API call
    console.log("Submitting budget:", budgetData);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_URL}/api/budget/add`, // Adjust if needed
        budgetData,
        { withCredentials: true }
      );
      console.log("Budget created:", response.data);
      // Optionally: reset form, show toast, close dialog
    } catch (err) {
      console.error(
        "Error creating budget:",
        err.response?.data || err.message
      );
      setError("Something went wrong while saving the budget.");
    } finally {
      // ✅ Close the dialog
      if (onClose) onClose();

      // ✅ Optionally reset form
      setMonthlyBudget("");
      setPhaseBudgets(
        PHASES.reduce((acc, phase) => ({ ...acc, [phase]: "" }), {})
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Monthly Budget</Label>
        <Input
          type="number"
          min={0}
          value={monthlyBudget}
          onChange={(e) => setMonthlyBudget(e.target.value)}
          placeholder="Enter monthly budget"
          required
        />
      </div>

      <div className="space-y-4">
        {PHASES.map((phase) => (
          <div key={phase} className="space-y-2">
            <Label>{phase} Budget</Label>
            <Input
              min={0}
              type="number"
              value={phaseBudgets[phase]}
              onChange={(e) =>
                setPhaseBudgets({ ...phaseBudgets, [phase]: e.target.value })
              }
              placeholder={`Enter ${phase.toLowerCase()} budget`}
              required
            />
          </div>
        ))}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <Button type="submit" className="w-full">
        Save Budget
      </Button>
    </form>
  );
}
