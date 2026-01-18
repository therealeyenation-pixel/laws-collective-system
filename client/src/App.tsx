import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import SystemDashboard from "./pages/SystemDashboard";
import AcademyDashboard from "./pages/AcademyDashboard";
import DocumentVault from "./pages/DocumentVault";
import Agents from "./pages/Agents";
import SocialMedia from "./pages/SocialMedia";
import FoundationDashboard from "./pages/FoundationDashboard";
import FinancialAutomation from "./pages/FinancialAutomation";
import HouseDashboard from "./pages/HouseDashboard";
import OwnerHouseSetup from "./pages/OwnerHouseSetup";
import GenesisCeremony from "./pages/GenesisCeremony";
import Landing from "./pages/Landing";
import BankingCredit from "./pages/BankingCredit";
import BusinessFormation from "./pages/BusinessFormation";
import PositionManagement from "./pages/PositionManagement";
import FamilyOnboarding from "./pages/FamilyOnboarding";
import RevenueSharing from "./pages/RevenueSharing";
import BoardMeetings from "./pages/BoardMeetings";
import InternationalBusiness from "./pages/InternationalBusiness";
import BusinessSimulator from "./pages/BusinessSimulator";
import GrantManagement from "./pages/GrantManagement";
import GrantSimulator from "./pages/GrantSimulator";
import BusinessPlanSimulator from "./pages/BusinessPlanSimulator";
import BusinessPlanUpload from "./pages/BusinessPlanUpload";
import TaxSimulator from "./pages/TaxSimulator";
import Pricing from "./pages/Pricing";
import ProposalSimulator from "./pages/ProposalSimulator";
import RFPGenerator from "@/pages/RFPGenerator";
import BusinessSetupWizard from "@/pages/BusinessSetupWizard";
import TrustGovernance from "@/pages/TrustGovernance";
import TrainingContentManager from "@/pages/TrainingContentManager";
import HRManagement from "@/pages/HRManagement";
import HRApplications from "@/pages/HRApplications";
import HRDashboard from "@/pages/HRDashboard";
import OperationsDashboard from "@/pages/OperationsDashboard";
import ExecutiveDashboard from "@/pages/ExecutiveDashboard";
import Careers from "@/pages/Careers";
import EmployeeDirectory from "@/pages/EmployeeDirectory";
import MyProfile from "@/pages/MyProfile";
import Onboarding from "@/pages/Onboarding";
import OperatingProcedures from "@/pages/OperatingProcedures";
import ProjectControls from "@/pages/ProjectControls";
import PositionRequisitions from "@/pages/PositionRequisitions";
import GettingStarted from "@/pages/GettingStarted";
import SystemOverview from "@/pages/SystemOverview";
import Contact from "@/pages/Contact";
import Support from "@/pages/Support";
import ContractorTransition from "./pages/ContractorTransition";
import ContractorAgreement from "./pages/ContractorAgreement";
import ContractorTransitions from "./pages/ContractorTransitions";
import CareerPathPlanner from "./pages/CareerPathPlanner";
import BenefitsComparison from "./pages/BenefitsComparison";
import BoardGovernance from "./pages/BoardGovernance";
import ContractorNetwork from "./pages/ContractorNetwork";
import TransitionTraining from "./pages/TransitionTraining";
import ContractorInvoices from "@/pages/ContractorInvoices";
import ContractManagement from "@/pages/ContractManagement";
import Donations from "@/pages/Donations";
import GrantTracking from "@/pages/GrantTracking";
import HouseManagement from "./pages/HouseManagement";
import TrustVisualization from "./pages/TrustVisualization";
import FinancialStatements from "./pages/FinancialStatements";
import BoardResolutions from "./pages/BoardResolutions";
import ContingencyOffers from "./pages/ContingencyOffers";
import ProcurementCatalog from "./pages/ProcurementCatalog";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "./const";
import { Shield } from "lucide-react";

// Access levels: user (member), staff, admin, owner
type AccessLevel = "user" | "staff" | "admin" | "owner";

const roleHierarchy: Record<AccessLevel, number> = {
  user: 1,
  staff: 2,
  admin: 3,
  owner: 4,
};

const hasAccess = (userRole: AccessLevel | undefined, requiredRole: AccessLevel): boolean => {
  if (!userRole) return false;
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

function ProtectedRoute({ component: Component, minRole = "user" }: { component: React.ComponentType; minRole?: AccessLevel }) {
  const { isAuthenticated, loading, user } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated after loading completes, show sign-in prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-6 max-w-md">
          <Shield className="w-16 h-16 mx-auto text-amber-500" />
          <h1 className="text-2xl font-bold">Sign In Required</h1>
          <p className="text-muted-foreground">
            Please sign in to access this page and manage your business.
          </p>
          <button
            onClick={() => window.location.href = getLoginUrl()}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Sign In to Continue
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="block mx-auto text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Check role-based access
  const userRole = (user?.role as AccessLevel) || "user";
  if (!hasAccess(userRole, minRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-6 max-w-md">
          <Shield className="w-16 h-16 mx-auto text-red-500" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this page. Contact an administrator if you believe this is an error.
          </p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <Component />;
}

function Router() {
  // Public routes: Landing page, Academy, and Dashboard (for viewing courses)
  // Protected routes: Trust System, Document Vault, Agents, Social Media
  return (
    <Switch>
      {/* Public routes - no authentication required */}
      <Route path="/" component={Home} />
      <Route path="/careers" component={Careers} />
      <Route path="/contact" component={Contact} />
      <Route path="/support" component={Support} />
      <Route path="/donate" component={Donations} />
      
      {/* Member routes - any authenticated user */}
      <Route path="/my-profile">{() => <ProtectedRoute component={MyProfile} minRole="user" />}</Route>
      <Route path="/house">{() => <ProtectedRoute component={HouseDashboard} minRole="user" />}</Route>
      <Route path="/getting-started">{() => <ProtectedRoute component={GettingStarted} minRole="user" />}</Route>
      <Route path="/academy">{() => <ProtectedRoute component={AcademyDashboard} minRole="user" />}</Route>
      <Route path="/business-simulator">{() => <ProtectedRoute component={BusinessSimulator} minRole="user" />}</Route>
      <Route path="/business-plan-simulator">{() => <ProtectedRoute component={BusinessPlanSimulator} minRole="user" />}</Route>
      <Route path="/grant-simulator">{() => <ProtectedRoute component={GrantSimulator} minRole="user" />}</Route>
      <Route path="/tax-simulator">{() => <ProtectedRoute component={TaxSimulator} minRole="user" />}</Route>
      
      {/* Staff routes - management level */}
      <Route path="/dashboard">{() => <ProtectedRoute component={Dashboard} minRole="staff" />}</Route>
      <Route path="/financial-automation">{() => <ProtectedRoute component={FinancialAutomation} minRole="staff" />}</Route>
      <Route path="/banking">{() => <ProtectedRoute component={BankingCredit} minRole="staff" />}</Route>
      <Route path="/hr-management">{() => <ProtectedRoute component={HRManagement} minRole="staff" />}</Route>
      <Route path="/hr-applications">{() => <ProtectedRoute component={HRApplications} minRole="staff" />}</Route>
      <Route path="/hr-dashboard">{() => <ProtectedRoute component={HRDashboard} minRole="staff" />}</Route>
      <Route path="/contractor-transition">{() => <ProtectedRoute component={ContractorTransition} minRole="staff" />}</Route>
      <Route path="/contractor-transitions">{() => <ProtectedRoute component={ContractorTransitions} minRole="staff" />}</Route>
      <Route path="/career-path-planner">{() => <ProtectedRoute component={CareerPathPlanner} minRole="staff" />}</Route>
      <Route path="/benefits-comparison">{() => <ProtectedRoute component={BenefitsComparison} minRole="user" />}</Route>
      <Route path="/transition-training">{() => <ProtectedRoute component={TransitionTraining} minRole="staff" />}</Route>
      <Route path="/board-governance">{() => <ProtectedRoute component={BoardGovernance} minRole="admin" />}</Route>
      <Route path="/contractor-network">{() => <ProtectedRoute component={ContractorNetwork} minRole="admin" />}</Route>
      <Route path="/contractor-invoices">{() => <ProtectedRoute component={ContractorInvoices} minRole="staff" />}</Route>
      <Route path="/contract-management">{() => <ProtectedRoute component={ContractManagement} minRole="staff" />}</Route>
      <Route path="/contractor-agreements">{() => <ProtectedRoute component={ContractorAgreement} minRole="staff" />}</Route>
      <Route path="/onboarding">{() => <ProtectedRoute component={Onboarding} />}</Route>
      <Route path="/procedures">{() => <ProtectedRoute component={OperatingProcedures} />}</Route>
      <Route path="/project-controls">{() => <ProtectedRoute component={ProjectControls} minRole="staff" />}</Route>
      <Route path="/employees">{() => <ProtectedRoute component={EmployeeDirectory} minRole="staff" />}</Route>
      <Route path="/operations-dashboard">{() => <ProtectedRoute component={OperationsDashboard} minRole="staff" />}</Route>
      <Route path="/executive-dashboard">{() => <ProtectedRoute component={ExecutiveDashboard} minRole="admin" />}</Route>
      <Route path="/positions">{() => <ProtectedRoute component={PositionManagement} minRole="staff" />}</Route>
      <Route path="/requisitions">{() => <ProtectedRoute component={PositionRequisitions} minRole="staff" />}</Route>
      <Route path="/grants">{() => <ProtectedRoute component={GrantManagement} minRole="staff" />}</Route>
      <Route path="/grant-tracking">{() => <ProtectedRoute component={GrantTracking} minRole="staff" />}</Route>
      <Route path="/financial-statements">{() => <ProtectedRoute component={FinancialStatements} minRole="staff" />}</Route>
      <Route path="/board-resolutions">{() => <ProtectedRoute component={BoardResolutions} minRole="admin" />}</Route>
      <Route path="/contingency-offers">{() => <ProtectedRoute component={ContingencyOffers} minRole="admin" />}</Route>
      <Route path="/procurement-catalog">{() => <ProtectedRoute component={ProcurementCatalog} minRole="staff" />}</Route>
      <Route path="/vault">{() => <ProtectedRoute component={DocumentVault} minRole="staff" />}</Route>
      <Route path="/agents">{() => <ProtectedRoute component={Agents} minRole="staff" />}</Route>
      <Route path="/social-media">{() => <ProtectedRoute component={SocialMedia} minRole="staff" />}</Route>
      <Route path="/proposal-simulator">{() => <ProtectedRoute component={ProposalSimulator} minRole="staff" />}</Route>
      <Route path="/rfp-generator">{() => <ProtectedRoute component={RFPGenerator} minRole="staff" />}</Route>
      
      {/* Admin routes - entity & business operations */}
      <Route path="/genesis">{() => <ProtectedRoute component={GenesisCeremony} minRole="admin" />}</Route>
      <Route path="/foundation">{() => <ProtectedRoute component={FoundationDashboard} minRole="admin" />}</Route>
      <Route path="/business-plan-upload">{() => <ProtectedRoute component={BusinessPlanUpload} minRole="admin" />}</Route>
      <Route path="/business-formation">{() => <ProtectedRoute component={BusinessFormation} minRole="admin" />}</Route>
      <Route path="/business-setup">{() => <ProtectedRoute component={BusinessSetupWizard} minRole="admin" />}</Route>
      <Route path="/family-onboarding">{() => <ProtectedRoute component={FamilyOnboarding} minRole="admin" />}</Route>
      <Route path="/revenue-sharing">{() => <ProtectedRoute component={RevenueSharing} minRole="admin" />}</Route>
      <Route path="/board-meetings">{() => <ProtectedRoute component={BoardMeetings} minRole="admin" />}</Route>
      <Route path="/international-business">{() => <ProtectedRoute component={InternationalBusiness} minRole="admin" />}</Route>
      <Route path="/pricing">{() => <ProtectedRoute component={Pricing} minRole="admin" />}</Route>
      <Route path="/system">{() => <ProtectedRoute component={SystemDashboard} minRole="admin" />}</Route>
      
      {/* Owner routes - trust & governance */}
      <Route path="/houses">{() => <ProtectedRoute component={HouseManagement} minRole="admin" />}</Route>
      <Route path="/trust-structure">{() => <ProtectedRoute component={TrustVisualization} minRole="admin" />}</Route>
      <Route path="/owner-setup">{() => <ProtectedRoute component={OwnerHouseSetup} minRole="owner" />}</Route>
      <Route path="/system-overview">{() => <ProtectedRoute component={SystemOverview} minRole="owner" />}</Route>
      <Route path="/trust-governance">{() => <ProtectedRoute component={TrustGovernance} minRole="owner" />}</Route>
      <Route path="/training-content">{() => <ProtectedRoute component={TrainingContentManager} minRole="admin" />}</Route>
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
