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
import { AuthProvider } from "./contexts/AuthContext";
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

const queryClient = new QueryClient();

const PROPERTIES = [
  "admin",
  "owner",
  "agent",
  "sales_manager",
  "team_lead",
  "customer_purchased",
];
const OWNER_ADMIN = ["admin", "owner"];
const ADMIN_SALES = ["admin", "sales_manager"];
const ADMIN = ["admin"];
const OWNER = ["owner"];
const AGENT = ["agent", "admin"];
const LEAD = ["team_lead", "admin"];
const SALES = ["sales_manager", "admin"];
const SITE = ["site_incharge", "admin"];
const CONTRACTOR = ["contractor", "admin"];
const ACCOUNTANT = ["accountant", "admin"];
const CUSTOMER_PURCHASED = ["customer_purchased"];

const App = () => {
  const [allRoles, setAllRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_URL}/api/role/roles`
        );
        setAllRoles(response.data.map((role) => role.name));
      } catch (error) {
        console.error("Failed to fetch roles:", error);
        // Optionally set a fallback: setAllRoles(["admin", "owner", /* etc. */]);
      } finally {
        setRolesLoading(false);
      }
    };

    fetchRoles();
  }, []);

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
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
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
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <Enquiry />
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
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <NewProperties />
                  </ProtectedRoute>
                }
              />
              {/* <Route
                path="/property/:propertyId"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <PropertyDetails  />
                  </ProtectedRoute>
                }
              /> */}

              <Route
                path="/properties/building/:buildingId"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <BuildingDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/properties/building/:buildingId/floor/:floorId"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <FloorUnits />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/properties/unit/:unitId"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <UnitDetails />
                  </ProtectedRoute>
                }
              />

              {/* CMS Route */}
              <Route
                path="/content"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <ContentManagement />
                  </ProtectedRoute>
                }
              />

              {/* Owner & Admin Routes */}
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <BusinessAnalytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/roles"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <RoleManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sales"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <SalesOverview />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operations"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <OperationsWorkflow />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/finances"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <Finances />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Sales Manager Routes */}
              <Route
                path="/customer"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <CustomerManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/team"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <TeamManagement />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/teamLead"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <TeamLeadManagement />
                  </ProtectedRoute>
                }
              />

              {/* Team Lead Routes */}
              <Route
                path="/vehicles"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <CarAllocation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/approvals"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <Approvals />
                  </ProtectedRoute>
                }
              />

              {/* Agent Routes */}
              <Route
                path="/leads"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    {<LeadManagement />}
                  </ProtectedRoute>
                }
              />
              <Route
                path="/schedule"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <MySchedule />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/myschedule"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <AgentSchedule />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/visits"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <SiteVisits />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/documents"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <AgentDocuments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/commissions"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <MyCommissions />
                  </ProtectedRoute>
                }
              />

              {/* Contractor Routes */}
              <Route
                path="/projects"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <ContractorProjects />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tasks"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <ContractorTasks />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/timeline"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <ContractorTimeline />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/materials"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <ContractorMaterials />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/labor"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <ContractorLabor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/invoices"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <ContractorInvoices />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/evidence"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <ContractorPhotoEvidence />
                  </ProtectedRoute>
                }
              />

              {/* Site Incharge Routes */}
              <Route
                path="/verifications"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <TaskVerifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quality"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <QualityControl />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inspections"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <SiteInspections />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contractors"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <ContractorsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/progress"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <ConstructionProgress />
                  </ProtectedRoute>
                }
              />

              {/* Accountant Routes */}
              <Route
                path="/payments"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <Payments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/budgets"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
                    <BudgetTracking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/taxes"
                element={
                  <ProtectedRoute
                    allowedRoles={allRoles}
                    loading={rolesLoading}
                  >
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
