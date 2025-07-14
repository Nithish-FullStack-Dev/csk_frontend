
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const TaxCalculator = () => {
  const [calculation, setCalculation] = useState({
    section: "",
    amount: "",
    result: 0,
  });

  const tdsRates = {
    "194c": 0.01, // Contractor Payments - 1%
    "194i": 0.10, // Rent Payments - 10%
    "194j": 0.10, // Professional Services - 10%
    "194h": 0.05, // Commission/Brokerage - 5%
  };

  const calculateTDS = () => {
    if (!calculation.section || !calculation.amount) {
      toast({
        title: "Validation Error",
        description: "Please select a section and enter an amount",
        variant: "destructive",
      });
      return;
    }

    const rate = tdsRates[calculation.section as keyof typeof tdsRates];
    const amount = parseFloat(calculation.amount);
    const tdsAmount = amount * rate;

    setCalculation({ ...calculation, result: tdsAmount });
    
    toast({
      title: "TDS Calculated",
      description: `TDS Amount: ₹${tdsAmount.toLocaleString()}`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>TDS Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="section">TDS Section</Label>
            <Select value={calculation.section} onValueChange={(value) => 
              setCalculation({ ...calculation, section: value })
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="194c">194C - Contractor Payments (1%)</SelectItem>
                <SelectItem value="194i">194I - Rent Payments (10%)</SelectItem>
                <SelectItem value="194j">194J - Professional Services (10%)</SelectItem>
                <SelectItem value="194h">194H - Commission/Brokerage (5%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="amount">Payment Amount (₹)</Label>
            <Input 
              id="amount" 
              type="number" 
              placeholder="Enter amount"
              value={calculation.amount}
              onChange={(e) => setCalculation({ ...calculation, amount: e.target.value })}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={calculateTDS}>
              <Calculator className="h-4 w-4 mr-2" />
              Calculate TDS
            </Button>
          </div>
          <div>
            <Label>TDS Amount</Label>
            <div className="text-2xl font-bold text-green-600">
              ₹{calculation.result.toLocaleString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaxCalculator;
