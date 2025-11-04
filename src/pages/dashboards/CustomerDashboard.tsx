import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import StatCard from "@/components/dashboard/StatCard";
import { Home, FileText, CreditCard, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PurchasedCustomerContent from "@/components/dashboard/customer/PurchasedCustomerContent";
import ProspectCustomerContent from "@/components/dashboard/customer/ProspectCustomerContent";
import WelcomeBackBanner from "@/components/dashboard/customer/WelcomeBackBanner";
import MainLayout from "@/components/layout/MainLayout";

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const isPurchasedCustomer = user?.role === "customer_purchased";

  return (
    <MainLayout>
      <div className="space-y-6">
        <WelcomeBackBanner />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
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
    </MainLayout>
  );
};

export default CustomerDashboard;
