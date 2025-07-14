
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PaymentHistory = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { date: "July 1, 2023", amount: "$15,000", property: "Golden Heights, Villa 12", status: "completed" },
            { date: "June 1, 2023", amount: "$15,000", property: "Golden Heights, Villa 12", status: "completed" },
            { date: "May 1, 2023", amount: "$15,000", property: "Golden Heights, Villa 12", status: "completed" },
            { date: "June 15, 2022", amount: "$250,000", property: "Riverside Apartments, Unit 305", status: "completed" },
          ].map((payment, index) => (
            <div key={index} className="flex justify-between items-center border-b pb-2 last:border-b-0">
              <div>
                <p className="font-medium">{payment.date}</p>
                <p className="text-sm text-muted-foreground">{payment.property}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{payment.amount}</p>
                <Badge className="bg-estate-success/20 text-estate-success">
                  {payment.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentHistory;
