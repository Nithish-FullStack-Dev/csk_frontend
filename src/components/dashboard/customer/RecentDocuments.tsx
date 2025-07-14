
import { FileText, Building, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const RecentDocuments = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { name: "Purchase Agreement - Riverside Apt", date: "June 15, 2022", type: "legal" },
            { name: "Floor Plan - Golden Heights", date: "April 10, 2023", type: "blueprint" },
            { name: "Property Tax Receipt 2023", date: "March 15, 2023", type: "financial" },
            { name: "Insurance Policy", date: "February 1, 2023", type: "legal" },
          ].map((doc, index) => {
            const typeIcons = {
              legal: <FileText className="h-4 w-4 text-estate-navy" />,
              blueprint: <Building className="h-4 w-4 text-estate-teal" />,
              financial: <CreditCard className="h-4 w-4 text-estate-gold" />,
            };

            return (
              <div key={index} className="flex justify-between items-center hover:bg-muted/50 p-2 rounded-md transition-colors">
                <div className="flex items-center">
                  <div className="p-2 bg-muted rounded-full mr-3">
                    {typeIcons[doc.type as keyof typeof typeIcons]}
                  </div>
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.date}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">View</Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentDocuments;
