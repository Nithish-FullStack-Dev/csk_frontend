
import { ReactNode } from "react";
import { Home, FileText, CreditCard, Building, MessageCircle, HelpCircle, MapPin, Calendar } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";

interface CustomerStatsProps {
  isPurchasedCustomer: boolean;
}

const CustomerStats = ({ isPurchasedCustomer }: CustomerStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {isPurchasedCustomer ? (
        <>
          <StatCard
            title="My Properties"
            value="2"
            icon={<Home className="h-6 w-6 text-estate-navy" />}
          />
          <StatCard
            title="Documents"
            value="12"
            icon={<FileText className="h-6 w-6 text-estate-teal" />}
          />
          <StatCard
            title="Payments Made"
            value="5"
            icon={<CreditCard className="h-6 w-6 text-estate-gold" />}
          />
          <StatCard
            title="Support Tickets"
            value="1"
            icon={<HelpCircle className="h-6 w-6 text-estate-error" />}
          />
        </>
      ) : (
        <>
          <StatCard
            title="Saved Properties"
            value="3"
            icon={<Home className="h-6 w-6 text-estate-navy" />}
          />
          <StatCard
            title="Scheduled Visits"
            value="1"
            icon={<Calendar className="h-6 w-6 text-estate-teal" />}
          />
          <StatCard
            title="Applications"
            value="2"
            icon={<FileText className="h-6 w-6 text-estate-gold" />}
          />
          <StatCard
            title="Inquiries"
            value="4"
            icon={<MessageCircle className="h-6 w-6 text-estate-error" />}
          />
        </>
      )}
    </div>
  );
};

export default CustomerStats;
