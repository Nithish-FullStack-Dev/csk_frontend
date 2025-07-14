
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface BudgetCategory {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  variance: number;
}

interface BudgetVarianceChartProps {
  categories: BudgetCategory[];
}

const BudgetVarianceChart = ({ categories }: BudgetVarianceChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Variance by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.id} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{category.name}</span>
                <span className={category.variance < 0 ? "text-red-500" : "text-green-500"}>
                  ₹{Math.abs(category.variance).toLocaleString()}
                  {category.variance > 0 ? " over" : " under"}
                </span>
              </div>
              <Progress 
                value={(category.spent / category.budgeted) * 100} 
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>₹{category.spent.toLocaleString()} spent</span>
                <span>₹{category.budgeted.toLocaleString()} budgeted</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetVarianceChart;
