
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import OwnerDashboard from "./dashboards/OwnerDashboard";
import AdminDashboard from "./dashboards/AdminDashboard";
import SalesManagerDashboard from "./dashboards/SalesManagerDashboard";
import TeamLeadDashboard from "./dashboards/TeamLeadDashboard";
import AgentDashboard from "./dashboards/AgentDashboard";
import SiteInchargeDashboard from "./dashboards/SiteInchargeDashboard";
import CustomerDashboard from "./dashboards/CustomerDashboard";
import AccountantDashboard from "./dashboards/AccountantDashboard";
import ContractorDashboard from "./dashboards/ContractorDashboard";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-estate-navy" />
      </div>
    );
  }

  const renderDashboard = () => {
    if (!user) return null;

    switch (user.role) {
      case "owner":
        return <OwnerDashboard />;
      case "admin":
        return <AdminDashboard />;
      case "sales_manager":
        return <SalesManagerDashboard />;
      case "team_lead":
        return <TeamLeadDashboard />;
      case "agent":
        return <AgentDashboard />;
      case "site_incharge":
        return <SiteInchargeDashboard />;
      case "contractor":
        return <ContractorDashboard />;
      case "accountant":
        return <AccountantDashboard />;
      case "customer_purchased":
      case "customer_prospect":
        return <CustomerDashboard />;
      default:
        return <p>Unknown role</p>;
    }
  };

  return <MainLayout>{renderDashboard()}</MainLayout>;
};

export default Dashboard;
