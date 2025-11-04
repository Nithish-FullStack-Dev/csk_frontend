import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CustomerStats from "./CustomerStats";
import PropertyCards from "./PropertyCards";
import PaymentHistory from "./PaymentHistory";
import RecentDocuments from "./RecentDocuments";

const PurchasedCustomerContent = () => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>My Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <PropertyCards />
        </CardContent>
      </Card>
    </>
  );
};

export default PurchasedCustomerContent;
