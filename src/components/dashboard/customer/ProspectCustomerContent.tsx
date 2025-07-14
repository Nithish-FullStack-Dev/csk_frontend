
import { Link } from "react-router-dom";
import CustomerStats from "./CustomerStats";
import FeaturedProperties from "./FeaturedProperties";
import UpcomingSiteVisits from "./UpcomingSiteVisits";
import ApplicationStatus from "./ApplicationStatus";

const ProspectCustomerContent = () => {
  return (
    <>
      <CustomerStats isPurchasedCustomer={false} />
      <Link to="/properties/1">
        <FeaturedProperties />
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UpcomingSiteVisits />
        <ApplicationStatus />
      </div>
    </>
  );
};

export default ProspectCustomerContent;
