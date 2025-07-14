
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const StatCard = ({ title, value, icon, trend, className }: StatCardProps) => {
  return (
    <Card className={cn("overflow-hidden border-estate-blue/10", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-estate-blue">{value}</h3>
            {trend && (
              <p className={cn(
                "text-xs font-medium flex items-center mt-1",
                trend.isPositive ? "text-estate-lime" : "text-estate-tomato"
              )}>
                <span className="mr-1">
                  {trend.isPositive ? "↑" : "↓"}
                </span>
                {trend.value}% from last month
              </p>
            )}
          </div>
          <div className="rounded-full p-2 bg-estate-mustard/20 text-estate-blue">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
