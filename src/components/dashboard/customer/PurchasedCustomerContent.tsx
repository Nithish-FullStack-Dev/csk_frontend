
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CustomerStats from "./CustomerStats";
import PropertyCards from "./PropertyCards";
import PaymentHistory from "./PaymentHistory";
import RecentDocuments from "./RecentDocuments";

const PurchasedCustomerContent = () => {
  return (
    <>
      <CustomerStats isPurchasedCustomer={true} />
      
      <Card>
        <CardHeader>
          <CardTitle>My Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <PropertyCards />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PaymentHistory />
        <RecentDocuments />
      </div>
    </>
  );
};

export default PurchasedCustomerContent;
