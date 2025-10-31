import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import MessagingPage from "./pages/MessagingPage";
// import Properties from "./pages/Properties";
// import PropertyDetails from "./pages/Properties/PropertyDetails";
import NotFound from "./pages/NotFound";
import { AuthProvider, Roles, useAuth } from "./contexts/AuthContext";
import Invoices from "./pages/Invoices";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import axios from "axios";

// Owner specific pages
import BusinessAnalytics from "./pages/BusinessAnalytics";
import UserManagement from "./pages/UserManagement";
import SalesOverview from "./pages/SalesOverview";
import OperationsWorkflow from "./pages/OperationsWorkflow";
import Finances from "./pages/Finances";

// Sales Manager specific pages
import SalesPipeline from "./pages/SalesPipeline";
import TeamManagement from "./pages/TeamManagement";

// Team Lead specific pages
import CarAllocation from "./pages/CarAllocation";
import Approvals from "./pages/Approvals";

// Agent specific pages
import LeadManagement from "./pages/agent/LeadManagement";
import MySchedule from "./pages/agent/MySchedule";
import SiteVisits from "./pages/agent/SiteVisits";
import AgentDocuments from "./pages/agent/AgentDocuments";
import MyCommissions from "./pages/agent/MyCommissions";

// Contractor specific pages
import ContractorProjects from "./pages/contractor/ContractorProjects";
import ContractorTasks from "./pages/contractor/ContractorTasks";
import ContractorTimeline from "./pages/contractor/ContractorTimeline";
import ContractorMaterials from "./pages/contractor/ContractorMaterials";
import ContractorLabor from "./pages/contractor/ContractorLabor";
import ContractorInvoices from "./pages/contractor/ContractorInvoices";
import ContractorPhotoEvidence from "./pages/contractor/ContractorPhotoEvidence";

// Site Incharge specific pages
import TaskVerifications from "./pages/siteincharge/TaskVerifications";
import QualityControl from "./pages/siteincharge/QualityControl";
import SiteInspections from "./pages/siteincharge/SiteInspections";
import ContractorsList from "./pages/siteincharge/ContractorsList";
import ConstructionProgress from "./pages/siteincharge/ConstructionProgress";

// Public pages
import HomePage from "./pages/public/HomePage";
import PublicAboutPage from "./pages/public/AboutPage";
import PublicPropertiesPage from "./pages/public/PropertiesPage";
import CompletedProjectsPage from "./pages/public/CompletedProjectsPage";
import OngoingProjectsPage from "./pages/public/OngoingProjectsPage";
import UpcomingProjectsPage from "./pages/public/UpcomingProjectsPage";
import OpenPlotsPage from "./pages/public/OpenPlotsPage";
import ContactPage from "./pages/public/ContactPage";
import ContentManagement from "./pages/ContentManagement";
import RoleManagement from "./pages/RoleManagement";
import Profile from "./pages/Profile";
import ScrollToTop from "./ScrollToTop";
import BudgetTracking from "./pages/BudgetTracking";
import TaxDocuments from "./pages/TaxDocuments";
import ProjectDetailsPage from "./pages/public/ProjectDetailsPage";
import OpenPlotsDetails from "./pages/public/OpenPlotsDetails";
import Enquiry from "./pages/Enquiry";
import ProtectedRoute from "./config/ProtectedRoute";
import TeamLeadManagement from "./pages/TeamLeadManagement";
import CustomerManagement from "./pages/CustomerManagement";
import ChatInterface from "./components/communication/ChatInterface";
import AuthRedirect from "./config/AuthRedirect";
import AgentSchedule from "./pages/agent/AgentSchedule";
import BuildingDetails from "./pages/BuildingDetails";
import FloorUnits from "./pages/FloorUnits";
import UnitDetails from "./pages/UnitDetails";
import NewProperties from "./pages/NewProperties";
import PropertyDetails from "./pages/Properties/PropertyDetails";
// import  PropertyDetails  from "./pages/Properties/PropertyDetails";
// import { PropertyDetails } from "./pages/Properties/PropertyDetails";

// Reports module
import ReportsHome from "./modules/reports/ReportsHome";
import PropertiesReport from "./modules/reports/pages/PropertiesReport";
import AgentsReport from "./modules/reports/pages/AgentsReport";
import TeamLeadsReport from "./modules/reports/pages/TeamLeadsReport";
import AccountingReport from "./modules/reports/pages/AccountingReport";
import ContractorsReport from "./modules/reports/pages/ContractorsReport";
import SiteInchargeReport from "./modules/reports/pages/SiteInchargeReport";
import UsersAccessReport from "./modules/reports/pages/UsersAccessReport";
import SalesManagersReport from "./modules/reports/pages/SalesManagersReport";
import AdminTeamAgent from "./pages/admin/AdminTeamAgent";
import AdminTeamLead from "./pages/admin/AdminTeamLead";
import AdminLeadManagement from "./pages/admin/AdminLeadManagement";
import AdminMyCommissions from "./pages/admin/AdminMyCommissions";
import { OpenPlotDetails } from "./components/properties/OpenPlotDetails";
import { Permission } from "./types/permission";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnMount: false,
      refetchInterval: false,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const [allRoles, setAllRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  const TeamRouteWrapper = () => {
    const { user } = useAuth();
    const role = String(user?.role || "").toLowerCase();

    if (role === "admin") return <AdminTeamAgent />;
    return <TeamManagement />;
  };
  const TeamLeadRouteWrapper = () => {
    const { user } = useAuth();
    const role = String(user?.role || "").toLowerCase();
    if (role === "admin") return <AdminTeamLead />;
    return <TeamLeadManagement />;
  };
  const LeadManagementWrapper = () => {
    const { user } = useAuth();
    const role = String(user?.role || "").toLowerCase();
    if (role === "admin") return <AdminLeadManagement />;
    return <LeadManagement />;
  };
  const CommissionsWrapper = () => {
    const { user } = useAuth();
    const role = String(user?.role || "").toLowerCase();
    if (role === "admin") return <AdminMyCommissions />;
    return <MyCommissions />;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthRedirect />
            <ScrollToTop />
            <Routes>
              {/* Public Routes */}
              <Route path="/public" element={<HomePage />} />
              <Route path="/public/about" element={<PublicAboutPage />} />
              <Route
                path="/public/properties"
                element={<PublicPropertiesPage />}
              />
              <Route
                path="/public/completed-projects"
                element={<CompletedProjectsPage />}
              />
              <Route
                path="/public/ongoing-projects"
                element={<OngoingProjectsPage />}
              />
              <Route
                path="/public/upcoming-projects"
                element={<UpcomingProjectsPage />}
              />
              <Route path="/public/open-plots" element={<OpenPlotsPage />} />
              <Route path="/public/contact" element={<ContactPage />} />

              {/* Admin Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/" element={<Dashboard />} />
              <Route
                path="/messaging"
                element={
                  <ProtectedRoute roleSubmodule={"Communications"}>
                    <ChatInterface />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/public/project/:id"
                element={<ProjectDetailsPage />}
              />
              <Route
                path="/public/openPlot/:id"
                element={<OpenPlotsDetails />}
              />
              <Route
                path="/enquiry"
                element={
                  <ProtectedRoute roleSubmodule={"Enquiry"}>
                    <Enquiry />
                  </ProtectedRoute>
                }
              />

              {/* Reports Module */}
              <Route
                path="/reports"
                element={
                  <ProtectedRoute roleSubmodule={"Reports"}>
                    <ReportsHome />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports/properties"
                element={
                  <ProtectedRoute roleSubmodule={"Reports"}>
                    <PropertiesReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports/users-access"
                element={
                  <ProtectedRoute roleSubmodule={"Reports"}>
                    <UsersAccessReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports/agents"
                element={
                  <ProtectedRoute roleSubmodule={"Reports"}>
                    <AgentsReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports/team-leads"
                element={
                  <ProtectedRoute roleSubmodule={"Reports"}>
                    <TeamLeadsReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports/sales-managers"
                element={
                  <ProtectedRoute roleSubmodule={"Reports"}>
                    <SalesManagersReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports/accounting"
                element={
                  <ProtectedRoute roleSubmodule={"Reports"}>
                    <AccountingReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports/contractors"
                element={
                  <ProtectedRoute roleSubmodule={"Reports"}>
                    <ContractorsReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports/site-incharge"
                element={
                  <ProtectedRoute roleSubmodule={"Reports"}>
                    <SiteInchargeReport />
                  </ProtectedRoute>
                }
              />

              {/* Public User Route - Redirects to public homepage */}
              <Route
                path="/public-user"
                element={<Navigate to="/public" replace />}
              />

              {/* Property Routes */}
              <Route
                path="/properties"
                element={
                  <ProtectedRoute roleSubmodule={"Properties"}>
                    <NewProperties />
                  </ProtectedRoute>
                }
              />
              {/* <Route
                path="/property/:propertyId"
                element={
                  <ProtectedRoute
                    
                    
                  >
                    <PropertyDetails  />
                  </ProtectedRoute>
                }
              /> */}
              <Route
                path="/properties/openplot/:id"
                element={<OpenPlotsDetails />}
              />
              <Route
                path="/properties/building/:buildingId"
                element={
                  <ProtectedRoute roleSubmodule={"Properties"}>
                    <BuildingDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/properties/building/:buildingId/floor/:floorId"
                element={
                  <ProtectedRoute roleSubmodule={"Properties"}>
                    <FloorUnits />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/properties/building/:buildingId/floor/:floorId/unit/:unitId"
                element={
                  <ProtectedRoute roleSubmodule={"Properties"}>
                    <UnitDetails />
                  </ProtectedRoute>
                }
              />

              {/* CMS Route */}
              <Route
                path="/content"
                element={
                  <ProtectedRoute roleSubmodule={"Content Management"}>
                    <ContentManagement />
                  </ProtectedRoute>
                }
              />

              {/* Owner & Admin Routes */}
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute roleSubmodule={"Business Analytics"}>
                    <BusinessAnalytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute roleSubmodule={"User Management"}>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/roles"
                element={
                  <ProtectedRoute roleSubmodule={"Role Management"}>
                    <RoleManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sales"
                element={
                  <ProtectedRoute roleSubmodule={"Sales Overview"}>
                    <SalesOverview />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operations"
                element={
                  <ProtectedRoute roleSubmodule={"Operations"}>
                    <OperationsWorkflow />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/finances"
                element={
                  <ProtectedRoute roleSubmodule={"Finances"}>
                    <Finances />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute roleSubmodule={"System Config"}>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute roleSubmodule={"Profile"}>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Sales Manager Routes */}
              <Route
                path="/customer"
                element={
                  <ProtectedRoute roleSubmodule={"Customer Management"}>
                    <CustomerManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/team"
                element={
                  <ProtectedRoute roleSubmodule={"My Team"}>
                    <TeamRouteWrapper />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teamLead"
                element={
                  <ProtectedRoute roleSubmodule={"Team Management"}>
                    <TeamLeadRouteWrapper />
                  </ProtectedRoute>
                }
              />

              {/* Team Lead Routes */}
              <Route
                path="/vehicles"
                element={
                  <ProtectedRoute roleSubmodule={"Car Allocation"}>
                    <CarAllocation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/approvals"
                element={
                  <ProtectedRoute roleSubmodule={"Approvals"}>
                    <Approvals />
                  </ProtectedRoute>
                }
              />

              {/* Agent Routes */}
              <Route
                path="/leads"
                element={
                  <ProtectedRoute roleSubmodule={"Lead Management"}>
                    {<LeadManagementWrapper />}
                  </ProtectedRoute>
                }
              />
              <Route
                path="/schedule"
                element={
                  <ProtectedRoute roleSubmodule={"Inspection Schedule"}>
                    <MySchedule />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/myschedule"
                element={
                  <ProtectedRoute roleSubmodule={"My Schedule"}>
                    <AgentSchedule />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/visits"
                element={
                  <ProtectedRoute roleSubmodule={"Site Visits"}>
                    <SiteVisits />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/documents"
                element={
                  <ProtectedRoute roleSubmodule={"Documents"}>
                    <AgentDocuments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/commissions"
                element={
                  <ProtectedRoute roleSubmodule={"Commissions"}>
                    <CommissionsWrapper />
                  </ProtectedRoute>
                }
              />

              {/* Contractor Routes */}
              <Route
                path="/projects"
                element={
                  <ProtectedRoute roleSubmodule={"Projects Overview"}>
                    <ContractorProjects />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tasks"
                element={
                  <ProtectedRoute roleSubmodule={"Task Management"}>
                    <ContractorTasks />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/timeline"
                element={
                  <ProtectedRoute roleSubmodule={"Construction Timeline"}>
                    <ContractorTimeline />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/materials"
                element={
                  <ProtectedRoute roleSubmodule={"Materials"}>
                    <ContractorMaterials />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/labor"
                element={
                  <ProtectedRoute roleSubmodule={"Labor Management"}>
                    <ContractorLabor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/invoices"
                element={
                  <ProtectedRoute roleSubmodule={"Invoices"}>
                    <ContractorInvoices />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/evidence"
                element={
                  <ProtectedRoute roleSubmodule={"Photo Evidence"}>
                    <ContractorPhotoEvidence />
                  </ProtectedRoute>
                }
              />

              {/* Site Incharge Routes */}
              <Route
                path="/verifications"
                element={
                  <ProtectedRoute roleSubmodule={"Task Verifications"}>
                    <TaskVerifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quality"
                element={
                  <ProtectedRoute roleSubmodule={"Quality Control "}>
                    <QualityControl />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inspections"
                element={
                  <ProtectedRoute roleSubmodule={"Site Inspections"}>
                    <SiteInspections />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contractors"
                element={
                  <ProtectedRoute roleSubmodule={"Contractors"}>
                    <ContractorsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/progress"
                element={
                  <ProtectedRoute roleSubmodule={"Construction Progress"}>
                    <ConstructionProgress />
                  </ProtectedRoute>
                }
              />

              {/* Accountant Routes */}
              <Route
                path="/payments"
                element={
                  <ProtectedRoute roleSubmodule={"Payments"}>
                    <Payments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute roleSubmodule={"Reports"}>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/budgets"
                element={
                  <ProtectedRoute roleSubmodule={"Budget Tracking"}>
                    <BudgetTracking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/taxes"
                element={
                  <ProtectedRoute roleSubmodule={"Tax Documents"}>
                    <TaxDocuments />
                  </ProtectedRoute>
                }
              />

              {/* Redirect index to dashboard */}
              <Route path="/index" element={<Navigate to="/" replace />} />

              {/* Catch-all route for 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
