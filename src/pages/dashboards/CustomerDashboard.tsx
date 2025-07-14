
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import StatCard from "@/components/dashboard/StatCard";
import { Home, FileText, CreditCard, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PurchasedCustomerContent from "@/components/dashboard/customer/PurchasedCustomerContent";
import ProspectCustomerContent from "@/components/dashboard/customer/ProspectCustomerContent";
import WelcomeBackBanner from "@/components/dashboard/customer/WelcomeBackBanner";

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  const isPurchasedCustomer = user?.role === "customer_purchased";

  return (
    <div className="space-y-6">
      <WelcomeBackBanner />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground">
            {isPurchasedCustomer 
              ? "Track your property and payments" 
              : "Find your dream property"}
          </p>
        </div>
       <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full space-y-6"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold">My Dashboard</h1>
            <p className="text-muted-foreground">
              {isPurchasedCustomer
                ? "Track your property and payments"
                : "Find your dream property"}
            </p>
          </div>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="properties">
              {isPurchasedCustomer ? "My Properties" : "Saved Properties"}
            </TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isPurchasedCustomer ? (
            <>
              <StatCard
                title="My Properties"
                value="2"
                icon={<Home className="h-6 w-6 text-estate-navy" />}
              />
              <StatCard
                title="Total Investment"
                value="$620,000"
                icon={<CreditCard className="h-6 w-6 text-estate-teal" />}
              />
              <StatCard
                title="Documents"
                value="12"
                icon={<FileText className="h-6 w-6 text-estate-gold" />}
              />
              <StatCard
                title="Next Payment"
                value="18 Days"
                icon={<Calendar className="h-6 w-6 text-estate-navy" />}
              />
            </>
          ) : (
            <>
              <StatCard
                title="Saved Properties"
                value="4"
                icon={<Home className="h-6 w-6 text-estate-navy" />}
              />
              <StatCard
                title="Scheduled Visits"
                value="2"
                icon={<Calendar className="h-6 w-6 text-estate-teal" />}
              />
              <StatCard
                title="Applications"
                value="1"
                icon={<FileText className="h-6 w-6 text-estate-gold" />}
              />
              <StatCard
                title="Documents"
                value="3"
                icon={<FileText className="h-6 w-6 text-estate-navy" />}
              />
            </>
          )}
        </div>

        <TabsContent value="overview" className="mt-0 pt-0 border-none">
          {isPurchasedCustomer ? (
            <PurchasedCustomerContent />
          ) : (
            <ProspectCustomerContent />
          )}
        </TabsContent>

        <TabsContent value="properties" className="mt-0 pt-0 border-none">
          {/* Properties content will go here */}
        </TabsContent>

        <TabsContent value="documents" className="mt-0 pt-0 border-none">
          {/* Documents content will go here */}
        </TabsContent>
      </Tabs>
      </div>

      </div>
  );
};

export default CustomerDashboard;
