import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import AuthRedirect from "./config/AuthRedirect";
import ScrollToTop from "./ScrollToTop";
import ProtectedRoute from "./config/ProtectedRoute";

// Owner specific pages
const BusinessAnalytics = lazy(() => import("./pages/BusinessAnalytics"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const SalesOverview = lazy(() => import("./pages/SalesOverview"));
const OperationsWorkflow = lazy(() => import("./pages/OperationsWorkflow"));
const Finances = lazy(() => import("./pages/Finances"));

// Sales Manager specific pages
const TeamManagement = lazy(() => import("./pages/TeamManagement"));

// Team Lead specific pages
const CarAllocation = lazy(() => import("./pages/CarAllocation"));
const Approvals = lazy(() => import("./pages/Approvals"));

// Agent specific pages
const LeadManagement = lazy(() => import("./pages/agent/LeadManagement"));
const MySchedule = lazy(() => import("./pages/agent/MySchedule"));
const SiteVisits = lazy(() => import("./pages/agent/SiteVisits"));
const AgentDocuments = lazy(() => import("./pages/agent/AgentDocuments"));
const MyCommissions = lazy(() => import("./pages/agent/MyCommissions"));
const AgentSchedule = lazy(() => import("./pages/agent/AgentSchedule"));

// Contractor specific pages
const ContractorProjects = lazy(
  () => import("./pages/contractor/ContractorProjects")
);
const ContractorTasks = lazy(
  () => import("./pages/contractor/ContractorTasks")
);
const ContractorTimeline = lazy(
  () => import("./pages/contractor/ContractorTimeline")
);
const ContractorMaterials = lazy(
  () => import("./pages/contractor/ContractorMaterials")
);
const ContractorLabor = lazy(
  () => import("./pages/contractor/ContractorLabor")
);
const ContractorInvoices = lazy(
  () => import("./pages/contractor/ContractorInvoices")
);
const ContractorPhotoEvidence = lazy(
  () => import("./pages/contractor/ContractorPhotoEvidence")
);

// Site Incharge specific pages
const TaskVerifications = lazy(
  () => import("./pages/siteincharge/TaskVerifications")
);
const QualityControl = lazy(
  () => import("./pages/siteincharge/QualityControl")
);
const SiteInspections = lazy(
  () => import("./pages/siteincharge/SiteInspections")
);
const ContractorsList = lazy(
  () => import("./pages/siteincharge/ContractorsList")
);
const ConstructionProgress = lazy(
  () => import("./pages/siteincharge/ConstructionProgress")
);

// Public pages
const HomePage = lazy(() => import("./pages/public/HomePage"));
const PublicAboutPage = lazy(() => import("./pages/public/AboutPage"));
const PublicPropertiesPage = lazy(
  () => import("./pages/public/PropertiesPage")
);
const CompletedProjectsPage = lazy(
  () => import("./pages/public/CompletedProjectsPage")
);
const OngoingProjectsPage = lazy(
  () => import("./pages/public/OngoingProjectsPage")
);
const UpcomingProjectsPage = lazy(
  () => import("./pages/public/UpcomingProjectsPage")
);
const OpenPlotsPage = lazy(() => import("./pages/public/OpenPlotsPage"));

const ContactPage = lazy(() => import("./pages/public/ContactPage"));
const ProjectDetailsPage = lazy(
  () => import("./pages/public/ProjectDetailsPage")
);
const OpenPlotsDetails = lazy(() => import("./pages/public/OpenPlotsDetails"));

// Shared/Owner pages
const ContentManagement = lazy(() => import("./pages/ContentManagement"));
const RoleManagement = lazy(() => import("./pages/RoleManagement"));
const Profile = lazy(() => import("./pages/Profile"));
const BudgetTracking = lazy(() => import("./pages/BudgetTracking"));
const TaxDocuments = lazy(() => import("./pages/TaxDocuments"));
const Enquiry = lazy(() => import("./pages/Enquiry"));
const TeamLeadManagement = lazy(() => import("./pages/TeamLeadManagement"));
const CustomerManagement = lazy(() => import("./pages/CustomerManagement"));
const BuildingDetails = lazy(() => import("./pages/BuildingDetails"));
const FloorUnits = lazy(() => import("./pages/FloorUnits"));
const UnitDetails = lazy(() => import("./pages/UnitDetails"));

import ChatInterface from "./components/communication/ChatInterface";

const NewProperties = lazy(() => import("./pages/NewProperties"));

// Reports module
const ReportsHome = lazy(() => import("./modules/reports/ReportsHome"));
const PropertiesReport = lazy(
  () => import("./modules/reports/pages/PropertiesReport")
);
const AgentsReport = lazy(() => import("./modules/reports/pages/AgentsReport"));
const TeamLeadsReport = lazy(
  () => import("./modules/reports/pages/TeamLeadsReport")
);
const AccountingReport = lazy(
  () => import("./modules/reports/pages/AccountingReport")
);
const ContractorsReport = lazy(
  () => import("./modules/reports/pages/ContractorsReport")
);
const SiteInchargeReport = lazy(
  () => import("./modules/reports/pages/SiteInchargeReport")
);
const UsersAccessReport = lazy(
  () => import("./modules/reports/pages/UsersAccessReport")
);
const SalesManagersReport = lazy(
  () => import("./modules/reports/pages/SalesManagersReport")
);
import AdminTeamAgent from "./pages/admin/AdminTeamAgent";
import AdminTeamLead from "./pages/admin/AdminTeamLead";
import AdminLeadManagement from "./pages/admin/AdminLeadManagement";
import AdminMyCommissions from "./pages/admin/AdminMyCommissions";

import OpenLandsPage from "./pages/public/OpenLandPage";
import PublicSkeleton from "./pages/public/PublicSkeleton";
import Loader from "./components/Loader";
import OpenLandDetails from "./pages/public/OpenLandDetails";
const OpenLandProperties = lazy(() => import("./pages/OpenLandProperties"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnMount: false,
      refetchInterval: false,
      refetchOnWindowFocus: false,
    },
  },
});

const PublicSuspenseWrapper = () => (
  <Suspense fallback={<PublicSkeleton />}>
    <Outlet />
  </Suspense>
);

const PrivateSuspenseWrapper = () => (
  <Suspense fallback={<Loader />}>
    <Outlet />
  </Suspense>
);

const App = () => {
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
              <Route element={<PublicSuspenseWrapper />}>
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
                <Route path="/public/open-lands" element={<OpenLandsPage />} />
                {/* <Route path= "/public/open-land" element={<OpenLandProperties />}/> */}
                {/* <Route path="/public/open-land" element={<OpenLandProperties />} /> */}
                <Route path="/public/contact" element={<ContactPage />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<PrivateSuspenseWrapper />}>
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
                  path="/public/openLand/:id"
                  element={<OpenLandDetails />}
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
                    <ProtectedRoute roleSubmodule={"Quality Control"}>
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
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
