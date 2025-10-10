import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowUp } from "lucide-react";
import { ReportMetric } from "../types";
import { formatValue } from "../utils/formatters";

interface MetricCardProps {
  metric: ReportMetric;
}

export function MetricCard({ metric }: MetricCardProps) {
  const displayValue =
    typeof metric.value === "number"
      ? formatValue(metric.value, metric.format)
      : metric.value;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{metric.label}</p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold">{displayValue}</p>
            {metric.trend && (
              <div
                className={`flex items-center text-sm ${
                  metric.trend.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {metric.trend.isPositive ? (
                  <ArrowUp className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDown className="h-4 w-4 mr-1" />
                )}
                {metric.trend.value.toFixed(1)}%
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
