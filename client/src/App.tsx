import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import DocumentAdmin from "./pages/DocumentAdmin";
import SystemDashboard from "./pages/SystemDashboard";
import AcademyDashboard from "./pages/AcademyDashboard";
import GuardianDashboard from "./pages/GuardianDashboard";
import DocumentVault from "./pages/DocumentVault";
import Agents from "./pages/Agents";
import SocialMedia from "./pages/SocialMedia";
import FoundationDashboard from "./pages/FoundationDashboard";
import FinancialAutomation from "./pages/FinancialAutomation";
import HouseDashboard from "./pages/HouseDashboard";
import OwnerHouseSetup from "./pages/OwnerHouseSetup";
import GenesisCeremony from "./pages/GenesisCeremony";
import Landing from "./pages/Landing";
import Shop from "./pages/Shop";
import MemberOnboarding from "./pages/MemberOnboarding";
import RevenueCycleDashboard from "./pages/RevenueCycleDashboard";
import BankingCredit from "./pages/BankingCredit";
import BusinessFormation from "./pages/BusinessFormation";
import PositionManagement from "./pages/PositionManagement";
import FamilyOnboarding from "./pages/FamilyOnboarding";
import RevenueSharing from "./pages/RevenueSharing";
import BoardMeetings from "./pages/BoardMeetings";
import InternationalBusiness from "./pages/InternationalBusiness";
import InternationalOperationsDashboard from "./pages/InternationalOperationsDashboard";
import BusinessSimulator from "./pages/BusinessSimulator";
import GrantManagement from "./pages/GrantManagement";
import GrantSimulator from "./pages/GrantSimulator";
import GrantExport from "./pages/GrantExport";
import GrantHistory from "./pages/GrantHistory";
import NeedStatementEditor from "./pages/NeedStatementEditor";
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
import PerformanceReviews from "@/pages/PerformanceReviews";
import FinancialLiteracyGame from "@/pages/FinancialLiteracyGame";
import BusinessTycoonGame from "@/pages/BusinessTycoonGame";
import TicTacToe from "@/pages/games/TicTacToe";
import MemoryMatch from "@/pages/games/MemoryMatch";
import ConnectFour from "@/pages/games/ConnectFour";
import Sudoku from "@/pages/games/Sudoku";
import WordSearch from "@/pages/games/WordSearch";
import Hangman from "@/pages/games/Hangman";
import Snake from "@/pages/games/Snake";
import Checkers from "@/pages/games/Checkers";
import Game2048 from "@/pages/games/Game2048";
import Chess from "@/pages/games/Chess";
import Battleship from "@/pages/games/Battleship";
import Solitaire from "@/pages/games/Solitaire";
import LAWSQuest from "@/pages/games/LAWSQuest";
import LAWSQuestUnified from "@/pages/games/LAWSQuestUnified";
import DualPathJourney from "@/pages/games/DualPathJourney";
import SovereigntyJourney from "@/pages/games/SovereigntyJourney";
import RainbowJourney from "@/pages/games/RainbowJourney";
import LogicPuzzles from "@/pages/games/LogicPuzzles";
import SpiderSolitaire from "@/pages/games/SpiderSolitaire";
import WordForge from "@/pages/games/WordForge";
import CrosswordMaster from "@/pages/games/CrosswordMaster";
import ClimbSlide from "@/pages/games/ClimbSlide";
import EscapeRoom from "@/pages/games/EscapeRoom";
import DetectiveAcademy from "@/pages/games/DetectiveAcademy";
import RubiksCube from "@/pages/games/RubiksCube";
import Spades from "@/pages/games/Spades";
import Yahtzee from "@/pages/games/Yahtzee";
import ScrabbleGame from "@/pages/games/ScrabbleGame";
import Dominoes from "@/pages/games/Dominoes";
import Mancala from "@/pages/games/Mancala";
import MahjongSolitaire from "@/pages/games/MahjongSolitaire";
import Backgammon from "@/pages/games/Backgammon";
import Tangram from "@/pages/games/Tangram";
import WordLadder from "@/pages/games/WordLadder";
import TriviaChallenge from "@/pages/games/TriviaChallenge";
import SimonSays from "@/pages/games/SimonSays";
import CommunityBuilder from "@/pages/games/CommunityBuilder";
import FleetCommand from "@/pages/games/FleetCommand";
import Hearts from "@/pages/games/Hearts";
import Achievements from "@/pages/Achievements";
import OperationsDashboard from "@/pages/OperationsDashboard";
import ExecutiveDashboard from "@/pages/ExecutiveDashboard";
import Careers from "@/pages/Careers";
import EmployeeDirectory from "@/pages/EmployeeDirectory";
import HouseContractManagement from "@/pages/HouseContractManagement";
import MyProfile from "@/pages/MyProfile";
import UserPreferences from "@/pages/UserPreferences";
import SignatureAuditReport from "@/pages/SignatureAuditReport";
import BulkSignatureRequest from "@/pages/BulkSignatureRequest";
import ComplianceDashboard from "@/pages/ComplianceDashboard";
import ComplianceCalendar from "@/pages/ComplianceCalendar";
import DocumentUpload from "@/pages/DocumentUpload";
import NotificationHistory from "@/pages/NotificationHistory";
import Onboarding from "@/pages/Onboarding";
import OnboardingChecklist from "@/pages/OnboardingChecklist";
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
import SignatureVerification from "./pages/SignatureVerification";
import BoardGovernance from "./pages/BoardGovernance";
import ContractorNetwork from "./pages/ContractorNetwork";
import TransitionTraining from "./pages/TransitionTraining";
import ContractorInvoices from "@/pages/ContractorInvoices";
import ContractManagement from "@/pages/ContractManagement";
import Donations from "@/pages/Donations";
import GrantTracking from "@/pages/GrantTracking";
import GrantDocuments from "@/pages/GrantDocuments";
import DemographicGrantsPage from "@/pages/DemographicGrantsPage";
import VolunteerPage from "@/pages/VolunteerPage";
import HouseManagement from "./pages/HouseManagement";
import TrustVisualization from "./pages/TrustVisualization";
import EntityStructure from "./pages/EntityStructure";
import FinancialStatements from "./pages/FinancialStatements";
import BoardResolutions from "./pages/BoardResolutions";
import ContingencyOffers from "./pages/ContingencyOffers";
import ResumeBuilder from "./pages/ResumeBuilder";
import ProcurementCatalog from "./pages/ProcurementCatalog";
import CompanyCalendar from "./pages/CompanyCalendar";
import ESignature from "./pages/ESignature";
import SignatureComplianceAdmin from "./pages/SignatureComplianceAdmin";
import SystemJobsAdmin from "./pages/SystemJobsAdmin";
import SpecialistTracks from "./pages/SpecialistTracks";
import Scholarships from "./pages/Scholarships";
import CreativeEnterprise from "./pages/CreativeEnterprise";
import DesignDepartment from "./pages/DesignDepartment";
import DesignServices from "./pages/DesignServices";
import MediaServices from "./pages/MediaServices";
import GameCenter from "./pages/GameCenter";
import EmployeeGamingDashboard from "./pages/EmployeeGamingDashboard";
import Sandbox from "./pages/Sandbox";
import TeamSessionScheduler from "./pages/TeamSessionScheduler";
import SoftwareLicenses from "./pages/SoftwareLicenses";
import GamingComplianceReports from "./pages/GamingComplianceReports";
import PurchaseRequests from "./pages/PurchaseRequests";
import TaxModule from "./pages/TaxModule";
import TimekeepingDashboard from "./pages/TimekeepingDashboard";
import ExternalIntegrations from "./pages/ExternalIntegrations";
import GrantLaborReports from "./pages/GrantLaborReports";
import PayrollDashboard from "./pages/PayrollDashboard";
import HealthSimulator from "./pages/simulators/HealthSimulator";
import EducationSimulator from "./pages/simulators/EducationSimulator";
import DesignSimulator from "./pages/simulators/DesignSimulator";
import MediaSimulator from "./pages/simulators/MediaSimulator";
import FinanceSimulator from "./pages/simulators/FinanceSimulator";
import HRSimulator from "./pages/simulators/HRSimulator";
import OperationsSimulator from "./pages/simulators/OperationsSimulator";
import ProcurementSimulator from "./pages/simulators/ProcurementSimulator";
import ContractsSimulator from "./pages/simulators/ContractsSimulator";
import PurchasingSimulator from "./pages/simulators/PurchasingSimulator";
import PropertySimulator from "./pages/simulators/PropertySimulator";
import RealEstateSimulator from "./pages/simulators/RealEstateSimulator";
import ProjectControlsSimulator from "./pages/simulators/ProjectControlsSimulator";
import QAQCSimulator from "./pages/simulators/QAQCSimulator";
import LegalSimulator from "./pages/simulators/LegalSimulator";
import ITSimulator from "./pages/simulators/ITSimulator";
import PlatformSimulator from "./pages/simulators/PlatformSimulator";
import GrantsSimulator from "./pages/simulators/GrantsSimulator";
import TrainingHub from "./pages/TrainingHub";
import ContractAgent from "./pages/ContractAgent";
import Services from "./pages/Services";
import OfferLetters from "@/pages/OfferLetters";
import BusinessDashboard from "@/pages/BusinessDashboard";
import BusinessLanding from "@/pages/BusinessLanding";
import SystemHealthDashboard from "@/pages/SystemHealthDashboard";
import HealthDashboard from "@/pages/HealthDashboard";
import EducationDashboard from "@/pages/EducationDashboard";
import DesignDashboard from "@/pages/DesignDashboard";
import MediaDashboard from "@/pages/MediaDashboard";
import FinanceDashboard from "@/pages/FinanceDashboard";
import ProcurementDashboard from "@/pages/ProcurementDashboard";
import ContractsDashboard from "@/pages/ContractsDashboard";
import PurchasingDashboard from "@/pages/PurchasingDashboard";
import PropertyDashboard from "@/pages/PropertyDashboard";
import PropertyManagementDashboard from "@/pages/PropertyManagementDashboard";
import RealEstateDashboard from "@/pages/RealEstateDashboard";
import ProjectControlsDashboard from "@/pages/ProjectControlsDashboard";
import QAQCDashboard from "@/pages/QAQCDashboard";
import LegalDashboard from "@/pages/LegalDashboard";
import ITDashboard from "@/pages/ITDashboard";
import GrantsDashboard from "@/pages/dept/GrantsDashboard";
import PlatformAdminDashboard from "@/pages/PlatformAdminDashboard";
import TrustAdminDashboard from "@/pages/TrustAdminDashboard";
import EntityCurriculum from "@/pages/EntityCurriculum";
import GovernanceWorkflows from "@/pages/GovernanceWorkflows";
import AuditTrailViewer from "@/pages/AuditTrailViewer";
import Procedures from "@/pages/Procedures";
import MeetingsDashboard from "@/pages/MeetingsDashboard";
import Downloads from "@/pages/Downloads";
import OwnerActionList from "@/pages/OwnerActionList";
import Chat from "@/pages/Chat";
import SwotAnalysis from "@/pages/SwotAnalysis";
import ResourceLinksAdmin from "@/pages/ResourceLinksAdmin";
import GovernmentActionsAdmin from "@/pages/GovernmentActionsAdmin";
import TokenReportingDashboard from "@/pages/TokenReportingDashboard";
import Changelog from "@/pages/Changelog";
import InvestorOpportunities from "@/pages/InvestorOpportunities";
import DocumentTemplates from "@/pages/DocumentTemplates";
import TrademarkDocuments from "@/pages/TrademarkDocuments";
import MarketingDashboard from "@/pages/MarketingDashboard";
import RevenueFlowDashboard from "@/pages/RevenueFlowDashboard";
import BusinessListings from "@/pages/BusinessListings";
import ServiceDepartments from "@/pages/ServiceDepartments";
import FoundingMemberBonus from "@/pages/FoundingMemberBonus";
import WorkerProgression from "@/pages/WorkerProgression";
import ClosedLoopWealth from "@/pages/ClosedLoopWealth";
import LAWSEmploymentPortal from "@/pages/LAWSEmploymentPortal";
import InternshipPortal from "@/pages/InternshipPortal";
import Donate508 from "@/pages/Donate508";
import PublicDonate from "@/pages/PublicDonate";
import DonateThankYou from "@/pages/DonateThankYou";
import MemberBusinessDashboard from "@/pages/MemberBusinessDashboard";
import MemberBusinessRegistration from "@/pages/MemberBusinessRegistration";
import MemberRegistration from "@/pages/MemberRegistration";
import AcquisitionFundDashboard from "@/pages/AcquisitionFundDashboard";
import TrialLanding from "@/pages/TrialLanding";
import TrialDashboard from "@/pages/TrialDashboard";
import TrialAnalytics from "@/pages/TrialAnalytics";
import OfficeSuite from "@/pages/OfficeSuite";
import Documentary from "@/pages/Documentary";
import Podcast from "@/pages/Podcast";
import JoinJourney from "@/pages/JoinJourney";
import MyCredential from "@/pages/MyCredential";
import VirtualLibrary from "@/pages/VirtualLibrary";
import ReadingDashboard from "@/pages/ReadingDashboard";
import BookReader from "@/pages/BookReader";
import ProgressDashboard from "@/pages/ProgressDashboard";
import ProtectionLayer from "@/pages/ProtectionLayer";
import ExternalOnboarding from "@/pages/ExternalOnboarding";
import AssetManagementDashboard from "@/pages/AssetManagementDashboard";
import WorkforceTransitionsDashboard from "@/pages/WorkforceTransitionsDashboard";
import InvestmentPortfolioDashboard from "@/pages/InvestmentPortfolioDashboard";
import InvestmentGovernanceDashboard from "@/pages/InvestmentGovernanceDashboard";
import TieredGovernanceDashboard from "@/pages/TieredGovernanceDashboard";
import InvestmentReportDashboard from "@/pages/InvestmentReportDashboard";
import ConsolidatedFinancialDashboard from "@/pages/ConsolidatedFinancialDashboard";
import TrademarkChecklist from "@/pages/TrademarkChecklist";
import MemberCredentials from "@/pages/MemberCredentials";
import ArticleAssignment from "@/pages/ArticleAssignment";
import KnowledgeQuest from "@/pages/games/KnowledgeQuest";
import AdvancedEscapeRoom from "@/pages/games/AdvancedEscapeRoom";
import ForeignQualification from "@/pages/ForeignQualification";
import InternationalRegistration from "@/pages/InternationalRegistration";
import TickerAdmin from "@/pages/TickerAdmin";
import MyTasks from "@/pages/MyTasks";
import TeamTaskDashboard from "@/pages/TeamTaskDashboard";
import TaskDelegation from "@/pages/TaskDelegation";
import TeamWorkload from "@/pages/TeamWorkload";
import DelegationAnalytics from "@/pages/DelegationAnalytics";
import DelegationApprovalQueue from "@/pages/DelegationApprovalQueue";
import DelegationHistory from "@/pages/DelegationHistory";
import DelegationEscalation from "@/pages/DelegationEscalation";
import MobileDashboard from "@/pages/MobileDashboard";
import GlobalSearchPage from "@/pages/GlobalSearchPage";
import ReportingCenter from "@/pages/ReportingCenter";
import IntegrationHub from "@/pages/IntegrationHub";
import OnboardingCenter from "@/pages/OnboardingCenter";
import BulkOperations from "@/pages/BulkOperations";
import BackupRestore from "@/pages/BackupRestore";
import ActivityFeed from "@/pages/ActivityFeed";
import CustomDashboard from "@/pages/CustomDashboard";
import TwoFactorSetup from "@/pages/TwoFactorSetup";
import PermissionMatrix from "@/pages/PermissionMatrix";
import DocumentVersionControl from "@/pages/DocumentVersionControl";
import DataRetentionPolicies from "@/pages/DataRetentionPolicies";
import WorkflowBuilder from "@/pages/WorkflowBuilder";
import RealTimeCollaboration from "@/pages/RealTimeCollaboration";
import AuditReports from "@/pages/AuditReports";
import ApiUsageDashboard from "@/pages/ApiUsageDashboard";
import RoleDashboard from "@/pages/RoleDashboard";
import LanguageSettings from "@/pages/LanguageSettings";
import BiometricSettings from "@/pages/BiometricSettings";
import CalendarIntegration from "@/pages/CalendarIntegration";
import AIDocumentAnalysis from "@/pages/AIDocumentAnalysis";
import DocumentImport from "@/pages/DocumentImport";
import MemberPortal from "@/pages/MemberPortal";
import AdvancedReporting from "@/pages/AdvancedReporting";
import PaymentProcessing from "@/pages/PaymentProcessing";
import WorkflowTemplates from "@/pages/WorkflowTemplates";
import TranslationPortal from "@/pages/TranslationPortal";
import AdminTemplateReviews from "@/pages/AdminTemplateReviews";
import ExternalApiIntegrations from "@/pages/ExternalApiIntegrations";
import ComplianceMonitoring from "@/pages/ComplianceMonitoring";
import MultiTenantManagement from "@/pages/MultiTenantManagement";
import DataExport from "@/pages/DataExport";
import DocumentationGenerator from "@/pages/DocumentationGenerator";
import SystemHealth from "@/pages/SystemHealth";
import BackupSettings from "@/pages/BackupSettings";
import OfflineSettings from "@/pages/OfflineSettings";
import {
  BusinessDocuments, HealthDocuments, EducationDocuments, DesignDocuments, MediaDocuments,
  FinanceDocuments, HRDocuments, OperationsDocuments, ProcurementDocuments, ContractsDocuments,
  PurchasingDocuments, PropertyDocuments, RealEstateDocuments, ProjectControlsDocuments,
  QAQCDocuments, LegalDocuments, ITDocuments, PlatformDocuments, GrantsDocuments,
  BusinessTeam, HealthTeam, EducationTeam, DesignTeam, MediaTeam, FinanceTeam, HRTeam,
  OperationsTeam, ProcurementTeam, ContractsTeam, PurchasingTeam, PropertyTeam, RealEstateTeam,
  ProjectControlsTeam, QAQCTeam, LegalTeam, ITTeam, PlatformTeam, GrantsTeam,
  AssetTracking, Audits, BrandAssets, BusinessPlans, Compliance, ContentCalendar, Curriculum,
  Instructors, Inventory, OperatingAgreements, ProgressReporting, Properties,
  QualityStandards, RealEyeDashboard, SecurityCenter, SystemAdmin, SystemSettings,
  UserManagement, VendorManagement, WellnessPrograms
} from "@/pages/placeholders";
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
      <Route path="/join" component={JoinJourney} />
      <Route path="/my-credential" component={MyCredential} />
      <Route path="/contact" component={Contact} />
      <Route path="/services" component={Services} />
      <Route path="/support" component={Support} />
      <Route path="/donate" component={Donations} />
      <Route path="/donate/public" component={PublicDonate} />
      <Route path="/donate/thank-you" component={DonateThankYou} />
      <Route path="/donate/academy" component={Donate508} />
      <Route path="/member-business" component={MemberBusinessDashboard} />
      <Route path="/member-business/register" component={MemberBusinessRegistration} />
      <Route path="/register-business" component={MemberRegistration} />
      <Route path="/treasury/acquisition-fund">{() => <ProtectedRoute component={AcquisitionFundDashboard} minRole="admin" />}</Route>
      <Route path="/asset-management">{() => <ProtectedRoute component={AssetManagementDashboard} minRole="admin" />}</Route>
      <Route path="/workforce-transitions">{() => <ProtectedRoute component={WorkforceTransitionsDashboard} minRole="admin" />}</Route>
      <Route path="/investments">{() => <ProtectedRoute component={InvestmentPortfolioDashboard} minRole="admin" />}</Route>
      <Route path="/investment-governance">{() => <ProtectedRoute component={InvestmentGovernanceDashboard} minRole="admin" />}</Route>
      <Route path="/tiered-governance">{() => <ProtectedRoute component={TieredGovernanceDashboard} minRole="admin" />}</Route>
      <Route path="/investment-reports">{() => <ProtectedRoute component={InvestmentReportDashboard} minRole="admin" />}</Route>
      <Route path="/financial-dashboard">{() => <ProtectedRoute component={ConsolidatedFinancialDashboard} minRole="admin" />}</Route>
      <Route path="/verify-signature" component={SignatureVerification} />
      <Route path="/admin/signature-compliance" component={SignatureComplianceAdmin} />
      <Route path="/admin/system-jobs" component={SystemJobsAdmin} />
      
      {/* Trial routes - separate authentication system */}
      <Route path="/trial" component={TrialLanding} />
      <Route path="/trial/dashboard" component={TrialDashboard} />
      <Route path="/admin/trial-analytics">{() => <ProtectedRoute component={TrialAnalytics} minRole="admin" />}</Route>
      
      {/* Media routes */}
      <Route path="/documentary" component={Documentary} />
      <Route path="/podcast" component={Podcast} />
      
      {/* Member routes - any authenticated user */}
      <Route path="/my-profile">{() => <ProtectedRoute component={MyProfile} minRole="user" />}</Route>
      <Route path="/settings/preferences">{() => <ProtectedRoute component={UserPreferences} minRole="user" />}</Route>
      <Route path="/user-preferences">{() => <ProtectedRoute component={UserPreferences} minRole="user" />}</Route>
      <Route path="/house">{() => <ProtectedRoute component={HouseDashboard} minRole="user" />}</Route>
      <Route path="/house-contracts">{() => <ProtectedRoute component={HouseContractManagement} minRole="user" />}</Route>
      <Route path="/getting-started">{() => <ProtectedRoute component={GettingStarted} minRole="user" />}</Route>
      <Route path="/academy">{() => <ProtectedRoute component={AcademyDashboard} minRole="user" />}</Route>
      <Route path="/guardian-dashboard">{() => <ProtectedRoute component={GuardianDashboard} minRole="user" />}</Route>
      <Route path="/business-simulator">{() => <ProtectedRoute component={BusinessSimulator} minRole="user" />}</Route>
      <Route path="/business-plan-simulator">{() => <ProtectedRoute component={BusinessPlanSimulator} minRole="user" />}</Route>
      <Route path="/grant-simulator">{() => <ProtectedRoute component={GrantSimulator} minRole="user" />}</Route>
      <Route path="/grant-export">{() => <ProtectedRoute component={GrantExport} minRole="user" />}</Route>
      <Route path="/grant-history">{() => <ProtectedRoute component={GrantHistory} minRole="user" />}</Route>
      <Route path="/need-statement-editor">{() => <ProtectedRoute component={NeedStatementEditor} minRole="admin" />}</Route>
      <Route path="/tax-simulator">{() => <ProtectedRoute component={TaxSimulator} minRole="user" />}</Route>
      <Route path="/health-simulator">{() => <ProtectedRoute component={HealthSimulator} minRole="staff" />}</Route>
      <Route path="/education-simulator">{() => <ProtectedRoute component={EducationSimulator} minRole="staff" />}</Route>
      <Route path="/design-simulator">{() => <ProtectedRoute component={DesignSimulator} minRole="staff" />}</Route>
      <Route path="/media-simulator">{() => <ProtectedRoute component={MediaSimulator} minRole="staff" />}</Route>
      <Route path="/finance-simulator">{() => <ProtectedRoute component={FinanceSimulator} minRole="staff" />}</Route>
      <Route path="/hr-simulator">{() => <ProtectedRoute component={HRSimulator} minRole="staff" />}</Route>
      <Route path="/operations-simulator">{() => <ProtectedRoute component={OperationsSimulator} minRole="staff" />}</Route>
      <Route path="/procurement-simulator">{() => <ProtectedRoute component={ProcurementSimulator} minRole="staff" />}</Route>
      <Route path="/contracts-simulator">{() => <ProtectedRoute component={ContractsSimulator} minRole="staff" />}</Route>
      <Route path="/purchasing-simulator">{() => <ProtectedRoute component={PurchasingSimulator} minRole="staff" />}</Route>
      <Route path="/property-simulator">{() => <ProtectedRoute component={PropertySimulator} minRole="staff" />}</Route>
      <Route path="/real-estate-simulator">{() => <ProtectedRoute component={RealEstateSimulator} minRole="staff" />}</Route>
      <Route path="/project-controls-simulator">{() => <ProtectedRoute component={ProjectControlsSimulator} minRole="staff" />}</Route>
      <Route path="/qaqc-simulator">{() => <ProtectedRoute component={QAQCSimulator} minRole="staff" />}</Route>
      <Route path="/legal-simulator">{() => <ProtectedRoute component={LegalSimulator} minRole="staff" />}</Route>
      <Route path="/it-simulator">{() => <ProtectedRoute component={ITSimulator} minRole="staff" />}</Route>
      <Route path="/platform-simulator">{() => <ProtectedRoute component={PlatformSimulator} minRole="admin" />}</Route>
      <Route path="/grants-simulator">{() => <ProtectedRoute component={GrantsSimulator} minRole="staff" />}</Route>
      <Route path="/training-hub">{() => <ProtectedRoute component={TrainingHub} minRole="user" />}</Route>
      <Route path="/entity-curriculum">{() => <ProtectedRoute component={EntityCurriculum} minRole="user" />}</Route>
      <Route path="/governance-workflows">{() => <ProtectedRoute component={GovernanceWorkflows} minRole="admin" />}</Route>
      <Route path="/audit-trail">{() => <ProtectedRoute component={AuditTrailViewer} minRole="admin" />}</Route>
      <Route path="/contract-agent">{() => <ProtectedRoute component={ContractAgent} minRole="user" />}</Route>
      
      {/* Staff routes - management level */}
      <Route path="/dashboard">{() => <ProtectedRoute component={Dashboard} minRole="staff" />}</Route>
      <Route path="/financial-automation">{() => <ProtectedRoute component={FinancialAutomation} minRole="staff" />}</Route>
      <Route path="/banking">{() => <ProtectedRoute component={BankingCredit} minRole="staff" />}</Route>
      <Route path="/hr-management">{() => <ProtectedRoute component={HRManagement} minRole="staff" />}</Route>
      <Route path="/hr-applications">{() => <ProtectedRoute component={HRApplications} minRole="staff" />}</Route>
      <Route path="/hr-dashboard">{() => <ProtectedRoute component={HRDashboard} minRole="staff" />}</Route>
      <Route path="/performance-reviews">{() => <ProtectedRoute component={PerformanceReviews} minRole="staff" />}</Route>
      <Route path="/contractor-transition">{() => <ProtectedRoute component={ContractorTransition} minRole="staff" />}</Route>
      <Route path="/contractor-transitions">{() => <ProtectedRoute component={ContractorTransitions} minRole="staff" />}</Route>
      <Route path="/career-path-planner">{() => <ProtectedRoute component={CareerPathPlanner} minRole="staff" />}</Route>
      <Route path="/worker-progression">{() => <ProtectedRoute component={WorkerProgression} minRole="staff" />}</Route>
      <Route path="/laws-employment">{() => <LAWSEmploymentPortal />}</Route>
      <Route path="/internship-portal">{() => <ProtectedRoute component={InternshipPortal} minRole="user" />}</Route>
      <Route path="/closed-loop-wealth">{() => <ProtectedRoute component={ClosedLoopWealth} minRole="staff" />}</Route>
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
      <Route path="/onboarding-checklist">{() => <ProtectedRoute component={OnboardingChecklist} minRole="staff" />}</Route>
      <Route path="/operations-dashboard">{() => <ProtectedRoute component={OperationsDashboard} minRole="staff" />}</Route>
      <Route path="/executive-dashboard">{() => <ProtectedRoute component={ExecutiveDashboard} minRole="admin" />}</Route>
      <Route path="/positions">{() => <ProtectedRoute component={PositionManagement} minRole="staff" />}</Route>
      <Route path="/requisitions">{() => <ProtectedRoute component={PositionRequisitions} minRole="staff" />}</Route>
      <Route path="/grants">{() => <ProtectedRoute component={GrantManagement} minRole="staff" />}</Route>
      <Route path="/grant-tracking">{() => <ProtectedRoute component={GrantTracking} minRole="staff" />}</Route>
      <Route path="/grant-documents">{() => <ProtectedRoute component={GrantDocuments} minRole="staff" />}</Route>
      <Route path="/demographic-grants">{() => <ProtectedRoute component={DemographicGrantsPage} minRole="user" />}</Route>
      <Route path="/volunteer">{() => <ProtectedRoute component={VolunteerPage} minRole="user" />}</Route>
      <Route path="/financial-statements">{() => <ProtectedRoute component={FinancialStatements} minRole="staff" />}</Route>
      <Route path="/board-resolutions">{() => <ProtectedRoute component={BoardResolutions} minRole="admin" />}</Route>
      <Route path="/admin/documents">{() => <ProtectedRoute component={DocumentAdmin} minRole="admin" />}</Route>
      <Route path="/contingency-offers">{() => <ProtectedRoute component={ContingencyOffers} minRole="admin" />}</Route>
      <Route path="/resume-builder">{() => <ProtectedRoute component={ResumeBuilder} minRole="staff" />}</Route>
      <Route path="/procurement-catalog">{() => <ProtectedRoute component={ProcurementCatalog} minRole="staff" />}</Route>
      <Route path="/calendar">{() => <ProtectedRoute component={CompanyCalendar} minRole="user" />}</Route>
      <Route path="/e-signature">{() => <ProtectedRoute component={ESignature} minRole="staff" />}</Route>
      <Route path="/specialist-tracks">{() => <ProtectedRoute component={SpecialistTracks} minRole="staff" />}</Route>
      <Route path="/scholarships">{() => <ProtectedRoute component={Scholarships} minRole="staff" />}</Route>
      <Route path="/creative-enterprise">{() => <ProtectedRoute component={CreativeEnterprise} minRole="staff" />}</Route>
      <Route path="/design-department">{() => <ProtectedRoute component={DesignDepartment} minRole="staff" />}</Route>
      <Route path="/design-services">{() => <ProtectedRoute component={DesignServices} minRole="staff" />}</Route>
      <Route path="/media-services">{() => <ProtectedRoute component={MediaServices} minRole="staff" />}</Route>
      <Route path="/service-departments">{() => <ProtectedRoute component={ServiceDepartments} minRole="staff" />}</Route>
      <Route path="/founding-member-bonus">{() => <ProtectedRoute component={FoundingMemberBonus} minRole="admin" />}</Route>
      <Route path="/game-center">{() => <ProtectedRoute component={GameCenter} minRole="user" />}</Route>
      <Route path="/library" component={VirtualLibrary} />
              <Route path="/reading-dashboard" component={ReadingDashboard} />
      <Route path="/library/book/:bookId" component={BookReader} />
      <Route path="/protection-layer">{() => <ProtectedRoute component={ProtectionLayer} minRole="user" />}</Route>
      <Route path="/onboarding/business">{() => <ExternalOnboarding />}</Route>
      <Route path="/library/discuss/:bookId" component={BookReader} />
      <Route path="/gaming-dashboard">{() => <ProtectedRoute component={EmployeeGamingDashboard} minRole="user" />}</Route>
      <Route path="/sandbox">{() => <ProtectedRoute component={Sandbox} minRole="user" />}</Route>
      <Route path="/team-sessions">{() => <ProtectedRoute component={TeamSessionScheduler} minRole="staff" />}</Route>
      <Route path="/games/financial-literacy">{() => <ProtectedRoute component={FinancialLiteracyGame} minRole="user" />}</Route>
      <Route path="/gaming-compliance">{() => <ProtectedRoute component={GamingComplianceReports} minRole="staff" />}</Route>
      <Route path="/games/business-tycoon">{() => <ProtectedRoute component={BusinessTycoonGame} minRole="user" />}</Route>
      <Route path="/games/tic-tac-toe">{() => <ProtectedRoute component={TicTacToe} minRole="user" />}</Route>
      <Route path="/games/memory-match">{() => <ProtectedRoute component={MemoryMatch} minRole="user" />}</Route>
      <Route path="/games/connect-four">{() => <ProtectedRoute component={ConnectFour} minRole="user" />}</Route>
      <Route path="/games/sudoku">{() => <ProtectedRoute component={Sudoku} minRole="user" />}</Route>
      <Route path="/games/word-search">{() => <ProtectedRoute component={WordSearch} minRole="user" />}</Route>
      <Route path="/games/hangman">{() => <ProtectedRoute component={Hangman} minRole="user" />}</Route>
      <Route path="/games/snake">{() => <ProtectedRoute component={Snake} minRole="user" />}</Route>
      <Route path="/games/checkers">{() => <ProtectedRoute component={Checkers} minRole="user" />}</Route>
      <Route path="/games/2048">{() => <ProtectedRoute component={Game2048} minRole="user" />}</Route>
          <Route path="/games/chess" component={Chess} />
          <Route path="/games/battleship" component={Battleship} />
          <Route path="/games/solitaire" component={Solitaire} />
          <Route path="/games/laws-quest" component={LAWSQuest} />
          <Route path="/games/sovereignty-journey" component={SovereigntyJourney} />
      <Route path="/games/rainbow-journey">{() => <ProtectedRoute component={RainbowJourney} minRole="user" />}</Route>
      <Route path="/games/logic-puzzles">{() => <ProtectedRoute component={LogicPuzzles} minRole="user" />}</Route>
      <Route path="/games/spider-solitaire">{() => <ProtectedRoute component={SpiderSolitaire} minRole="user" />}</Route>
      <Route path="/games/word-forge">{() => <ProtectedRoute component={WordForge} minRole="user" />}</Route>
      <Route path="/games/crossword-master">{() => <ProtectedRoute component={CrosswordMaster} minRole="user" />}</Route>
      <Route path="/games/climb-slide">{() => <ProtectedRoute component={ClimbSlide} minRole="user" />}</Route>
      <Route path="/games/escape-room">{() => <ProtectedRoute component={EscapeRoom} minRole="user" />}</Route>
      <Route path="/games/detective-academy">{() => <ProtectedRoute component={DetectiveAcademy} minRole="user" />}</Route>
      <Route path="/games/rubiks-cube">{() => <ProtectedRoute component={RubiksCube} minRole="user" />}</Route>
 <Route path="/games/laws-quest">{() => <ProtectedRoute component={LAWSQuest} minRole="user" />}</Route>
      <Route path="/games/dual-path-journey">{() => <ProtectedRoute component={DualPathJourney} minRole="user" />}</Route>     <Route path="/games/yahtzee">{() => <ProtectedRoute component={Yahtzee} minRole="user" />}</Route>
      <Route path="/games/scrabble">{() => <ProtectedRoute component={ScrabbleGame} minRole="user" />}</Route>
      <Route path="/games/dominoes">{() => <ProtectedRoute component={Dominoes} minRole="user" />}</Route>
      <Route path="/games/mancala">{() => <ProtectedRoute component={Mancala} minRole="user" />}</Route>
      <Route path="/games/mahjong-solitaire">{() => <ProtectedRoute component={MahjongSolitaire} minRole="user" />}</Route>
      <Route path="/games/backgammon">{() => <ProtectedRoute component={Backgammon} minRole="user" />}</Route>
      <Route path="/games/tangram">{() => <ProtectedRoute component={Tangram} minRole="user" />}</Route>
      <Route path="/games/word-ladder">{() => <ProtectedRoute component={WordLadder} minRole="user" />}</Route>
      <Route path="/games/trivia-challenge">{() => <ProtectedRoute component={TriviaChallenge} minRole="user" />}</Route>
      <Route path="/games/simon-says">{() => <ProtectedRoute component={SimonSays} minRole="user" />}</Route>
      <Route path="/games/community-builder">{() => <ProtectedRoute component={CommunityBuilder} minRole="user" />}</Route>
      <Route path="/games/laws-quest-unified">{() => <ProtectedRoute component={LAWSQuestUnified} minRole="user" />}</Route>
      <Route path="/achievements">{() => <ProtectedRoute component={Achievements} minRole="user" />}</Route>
      <Route path="/progress">{() => <ProtectedRoute component={ProgressDashboard} minRole="user" />}</Route>
      <Route path="/software-licenses">{() => <ProtectedRoute component={SoftwareLicenses} minRole="staff" />}</Route>
      <Route path="/office-suite">{() => <ProtectedRoute component={OfficeSuite} minRole="staff" />}</Route>
      <Route path="/purchase-requests">{() => <ProtectedRoute component={PurchaseRequests} minRole="staff" />}</Route>
      <Route path="/offer-letters">{() => <ProtectedRoute component={OfferLetters} minRole="staff" />}</Route>
      
      {/* Business Landing */}
      <Route path="/business-landing">{() => <BusinessLanding />}</Route>
      <Route path="/shop">{() => <Shop />}</Route>
      <Route path="/onboard">{() => <ProtectedRoute component={MemberOnboarding} minRole="user" />}</Route>
      <Route path="/revenue-cycle">{() => <ProtectedRoute component={RevenueCycleDashboard} minRole="admin" />}</Route>

      {/* Department Dashboards */}
      <Route path="/dept/business">{() => <ProtectedRoute component={BusinessDashboard} minRole="staff" />}</Route>
      <Route path="/dept/health">{() => <ProtectedRoute component={HealthDashboard} minRole="staff" />}</Route>
      <Route path="/dept/education">{() => <ProtectedRoute component={EducationDashboard} minRole="staff" />}</Route>
      <Route path="/dept/design">{() => <ProtectedRoute component={DesignDashboard} minRole="staff" />}</Route>
      <Route path="/dept/marketing">{() => <ProtectedRoute component={MarketingDashboard} minRole="staff" />}</Route>
          <Route path="/revenue-flow">{() => <ProtectedRoute component={RevenueFlowDashboard} minRole="staff" />}</Route>
      <Route path="/business-listings">{() => <ProtectedRoute component={BusinessListings} minRole="staff" />}</Route>
      <Route path="/dept/media">{() => <ProtectedRoute component={MediaDashboard} minRole="staff" />}</Route>
      <Route path="/dept/finance">{() => <ProtectedRoute component={FinanceDashboard} minRole="staff" />}</Route>
      <Route path="/dept/finance/tax">{() => <ProtectedRoute component={TaxModule} minRole="staff" />}</Route>
      <Route path="/dept/finance/timekeeping">{() => <ProtectedRoute component={TimekeepingDashboard} minRole="staff" />}</Route>
      <Route path="/dept/finance/integrations">{() => <ProtectedRoute component={ExternalIntegrations} minRole="staff" />}</Route>
      <Route path="/dept/finance/grant-labor-reports">{() => <ProtectedRoute component={GrantLaborReports} minRole="staff" />}</Route>
      <Route path="/dept/finance/payroll">{() => <ProtectedRoute component={PayrollDashboard} minRole="staff" />}</Route>
      <Route path="/dept/procurement">{() => <ProtectedRoute component={ProcurementDashboard} minRole="staff" />}</Route>
      <Route path="/dept/contracts">{() => <ProtectedRoute component={ContractsDashboard} minRole="staff" />}</Route>
      <Route path="/dept/purchasing">{() => <ProtectedRoute component={PurchasingDashboard} minRole="staff" />}</Route>
      <Route path="/dept/property">{() => <ProtectedRoute component={PropertyDashboard} minRole="staff" />}</Route>
      <Route path="/dept/property/management">{() => <ProtectedRoute component={PropertyManagementDashboard} minRole="staff" />}</Route>
      <Route path="/dept/real-estate">{() => <ProtectedRoute component={RealEstateDashboard} minRole="staff" />}</Route>
      <Route path="/dept/project-controls">{() => <ProtectedRoute component={ProjectControlsDashboard} minRole="staff" />}</Route>
      <Route path="/dept/qaqc">{() => <ProtectedRoute component={QAQCDashboard} minRole="staff" />}</Route>
      <Route path="/procedures">{() => <ProtectedRoute component={Procedures} minRole="staff" />}</Route>
      <Route path="/dept/hr">{() => <ProtectedRoute component={HRDashboard} minRole="staff" />}</Route>
      <Route path="/dept/operations">{() => <ProtectedRoute component={OperationsDashboard} minRole="staff" />}</Route>
      <Route path="/dept/platform-admin">{() => <ProtectedRoute component={PlatformAdminDashboard} minRole="admin" />}</Route>
      <Route path="/trust-admin">{() => <ProtectedRoute component={TrustAdminDashboard} minRole="admin" />}</Route>
      <Route path="/dept/legal">{() => <ProtectedRoute component={LegalDashboard} minRole="staff" />}</Route>
      <Route path="/dept/it">{() => <ProtectedRoute component={ITDashboard} minRole="staff" />}</Route>
      <Route path="/dept/grants">{() => <ProtectedRoute component={GrantsDashboard} minRole="staff" />}</Route>
      <Route path="/vault">{() => <ProtectedRoute component={DocumentVault} minRole="staff" />}</Route>
      <Route path="/agents">{() => <ProtectedRoute component={Agents} minRole="staff" />}</Route>
      <Route path="/social-media">{() => <ProtectedRoute component={SocialMedia} minRole="staff" />}</Route>
      <Route path="/meetings">{() => <ProtectedRoute component={MeetingsDashboard} minRole="user" />}</Route>
      <Route path="/downloads">{() => <ProtectedRoute component={Downloads} minRole="user" />}</Route>
      <Route path="/owner-actions">{() => <ProtectedRoute component={OwnerActionList} minRole="owner" />}</Route>
      <Route path="/chat">{() => <ProtectedRoute component={Chat} minRole="user" />}</Route>
      <Route path="/proposal-simulator">{() => <ProtectedRoute component={ProposalSimulator} minRole="staff" />}</Route>
      <Route path="/rfp-generator">{() => <ProtectedRoute component={RFPGenerator} minRole="staff" />}</Route>
      
      {/* Admin routes - entity & business operations */}
      <Route path="/admin/signature-audit">{() => <ProtectedRoute component={SignatureAuditReport} minRole="admin" />}</Route>
      <Route path="/admin/bulk-signatures">{() => <ProtectedRoute component={BulkSignatureRequest} minRole="admin" />}</Route>
      <Route path="/admin/compliance-dashboard">{() => <ProtectedRoute component={ComplianceDashboard} minRole="admin" />}</Route>
      <Route path="/compliance-calendar">{() => <ProtectedRoute component={ComplianceCalendar} minRole="staff" />}</Route>
      <Route path="/document-upload">{() => <ProtectedRoute component={DocumentUpload} minRole="staff" />}</Route>
      <Route path="/notification-history">{() => <ProtectedRoute component={NotificationHistory} minRole="staff" />}</Route>
      <Route path="/genesis">{() => <ProtectedRoute component={GenesisCeremony} minRole="admin" />}</Route>
      <Route path="/foundation">{() => <ProtectedRoute component={FoundationDashboard} minRole="admin" />}</Route>
      <Route path="/business-plan-upload">{() => <ProtectedRoute component={BusinessPlanUpload} minRole="admin" />}</Route>
      <Route path="/business-formation">{() => <ProtectedRoute component={BusinessFormation} minRole="admin" />}</Route>
      <Route path="/business-setup">{() => <ProtectedRoute component={BusinessSetupWizard} minRole="admin" />}</Route>
      <Route path="/family-onboarding">{() => <ProtectedRoute component={FamilyOnboarding} minRole="admin" />}</Route>
      <Route path="/revenue-sharing">{() => <ProtectedRoute component={RevenueSharing} minRole="admin" />}</Route>
      <Route path="/board-meetings">{() => <ProtectedRoute component={BoardMeetings} minRole="admin" />}</Route>
      <Route path="/international-business">{() => <ProtectedRoute component={InternationalBusiness} minRole="admin" />}</Route>
      <Route path="/international-operations">{() => <ProtectedRoute component={InternationalOperationsDashboard} minRole="admin" />}</Route>
      <Route path="/pricing">{() => <ProtectedRoute component={Pricing} minRole="admin" />}</Route>
      <Route path="/system">{() => <ProtectedRoute component={SystemDashboard} minRole="admin" />}</Route>
      
      {/* Owner routes - trust & governance */}
      <Route path="/houses">{() => <ProtectedRoute component={HouseManagement} minRole="admin" />}</Route>
      <Route path="/trust-structure">{() => <ProtectedRoute component={TrustVisualization} minRole="admin" />}</Route>
      <Route path="/entity-structure">{() => <ProtectedRoute component={EntityStructure} minRole="admin" />}</Route>
      <Route path="/trademark-documents">{() => <ProtectedRoute component={TrademarkDocuments} minRole="admin" />}</Route>
      <Route path="/trademark-checklist">{() => <ProtectedRoute component={TrademarkChecklist} minRole="user" />}</Route>
      <Route path="/member-credentials">{() => <ProtectedRoute component={MemberCredentials} minRole="admin" />}</Route>
      <Route path="/owner-setup">{() => <ProtectedRoute component={OwnerHouseSetup} minRole="owner" />}</Route>
      <Route path="/system-overview">{() => <ProtectedRoute component={SystemOverview} minRole="owner" />}</Route>
      <Route path="/trust-governance">{() => <ProtectedRoute component={TrustGovernance} minRole="owner" />}</Route>
      <Route path="/investor-opportunities">{() => <ProtectedRoute component={InvestorOpportunities} minRole="owner" />}</Route>
      <Route path="/document-templates">{() => <ProtectedRoute component={DocumentTemplates} minRole="user" />}</Route>
      <Route path="/training-content">{() => <ProtectedRoute component={TrainingContentManager} minRole="admin" />}</Route>
      <Route path="/changelog">{() => <ProtectedRoute component={Changelog} minRole="user" />}</Route>
      
      {/* Placeholder routes - Department Documents */}
      <Route path="/business-documents">{() => <ProtectedRoute component={BusinessDocuments} minRole="staff" />}</Route>
      <Route path="/health-documents">{() => <ProtectedRoute component={HealthDocuments} minRole="staff" />}</Route>
      <Route path="/education-documents">{() => <ProtectedRoute component={EducationDocuments} minRole="staff" />}</Route>
      <Route path="/design-documents">{() => <ProtectedRoute component={DesignDocuments} minRole="staff" />}</Route>
      <Route path="/media-documents">{() => <ProtectedRoute component={MediaDocuments} minRole="staff" />}</Route>
      <Route path="/finance-documents">{() => <ProtectedRoute component={FinanceDocuments} minRole="staff" />}</Route>
      <Route path="/hr-documents">{() => <ProtectedRoute component={HRDocuments} minRole="staff" />}</Route>
      <Route path="/operations-documents">{() => <ProtectedRoute component={OperationsDocuments} minRole="staff" />}</Route>
      <Route path="/procurement-documents">{() => <ProtectedRoute component={ProcurementDocuments} minRole="staff" />}</Route>
      <Route path="/contracts-documents">{() => <ProtectedRoute component={ContractsDocuments} minRole="staff" />}</Route>
      <Route path="/purchasing-documents">{() => <ProtectedRoute component={PurchasingDocuments} minRole="staff" />}</Route>
      <Route path="/property-documents">{() => <ProtectedRoute component={PropertyDocuments} minRole="staff" />}</Route>
      <Route path="/real-estate-documents">{() => <ProtectedRoute component={RealEstateDocuments} minRole="staff" />}</Route>
      <Route path="/project-controls-documents">{() => <ProtectedRoute component={ProjectControlsDocuments} minRole="staff" />}</Route>
      <Route path="/qaqc-documents">{() => <ProtectedRoute component={QAQCDocuments} minRole="staff" />}</Route>
      <Route path="/legal-documents">{() => <ProtectedRoute component={LegalDocuments} minRole="staff" />}</Route>
      <Route path="/it-documents">{() => <ProtectedRoute component={ITDocuments} minRole="staff" />}</Route>
      <Route path="/platform-documents">{() => <ProtectedRoute component={PlatformDocuments} minRole="admin" />}</Route>
      <Route path="/grants-documents">{() => <ProtectedRoute component={GrantsDocuments} minRole="staff" />}</Route>
      
      {/* Placeholder routes - Department Teams */}
      <Route path="/business-team">{() => <ProtectedRoute component={BusinessTeam} minRole="staff" />}</Route>
      <Route path="/health-team">{() => <ProtectedRoute component={HealthTeam} minRole="staff" />}</Route>
      <Route path="/education-team">{() => <ProtectedRoute component={EducationTeam} minRole="staff" />}</Route>
      <Route path="/design-team">{() => <ProtectedRoute component={DesignTeam} minRole="staff" />}</Route>
      <Route path="/media-team">{() => <ProtectedRoute component={MediaTeam} minRole="staff" />}</Route>
      <Route path="/finance-team">{() => <ProtectedRoute component={FinanceTeam} minRole="staff" />}</Route>
      <Route path="/hr-team">{() => <ProtectedRoute component={HRTeam} minRole="staff" />}</Route>
      <Route path="/operations-team">{() => <ProtectedRoute component={OperationsTeam} minRole="staff" />}</Route>
      <Route path="/procurement-team">{() => <ProtectedRoute component={ProcurementTeam} minRole="staff" />}</Route>
      <Route path="/contracts-team">{() => <ProtectedRoute component={ContractsTeam} minRole="staff" />}</Route>
      <Route path="/purchasing-team">{() => <ProtectedRoute component={PurchasingTeam} minRole="staff" />}</Route>
      <Route path="/property-team">{() => <ProtectedRoute component={PropertyTeam} minRole="staff" />}</Route>
      <Route path="/real-estate-team">{() => <ProtectedRoute component={RealEstateTeam} minRole="staff" />}</Route>
      <Route path="/project-controls-team">{() => <ProtectedRoute component={ProjectControlsTeam} minRole="staff" />}</Route>
      <Route path="/qaqc-team">{() => <ProtectedRoute component={QAQCTeam} minRole="staff" />}</Route>
      <Route path="/legal-team">{() => <ProtectedRoute component={LegalTeam} minRole="staff" />}</Route>
      <Route path="/it-team">{() => <ProtectedRoute component={ITTeam} minRole="staff" />}</Route>
      <Route path="/platform-team">{() => <ProtectedRoute component={PlatformTeam} minRole="admin" />}</Route>
      <Route path="/grants-team">{() => <ProtectedRoute component={GrantsTeam} minRole="staff" />}</Route>
      
      {/* Placeholder routes - Feature Pages */}
      <Route path="/asset-tracking">{() => <ProtectedRoute component={AssetTracking} minRole="staff" />}</Route>
      <Route path="/audits">{() => <ProtectedRoute component={Audits} minRole="staff" />}</Route>
      <Route path="/brand-assets">{() => <ProtectedRoute component={BrandAssets} minRole="staff" />}</Route>
      <Route path="/business-plans">{() => <ProtectedRoute component={BusinessPlans} minRole="user" />}</Route>
      <Route path="/compliance">{() => <ProtectedRoute component={Compliance} minRole="staff" />}</Route>
      <Route path="/content-calendar">{() => <ProtectedRoute component={ContentCalendar} minRole="staff" />}</Route>
      <Route path="/curriculum">{() => <ProtectedRoute component={Curriculum} minRole="staff" />}</Route>
      <Route path="/grants-dashboard">{() => <ProtectedRoute component={GrantsDashboard} minRole="staff" />}</Route>
      <Route path="/instructors">{() => <ProtectedRoute component={Instructors} minRole="staff" />}</Route>
      <Route path="/inventory">{() => <ProtectedRoute component={Inventory} minRole="staff" />}</Route>
      <Route path="/operating-agreements">{() => <ProtectedRoute component={OperatingAgreements} minRole="user" />}</Route>
      <Route path="/progress-reporting">{() => <ProtectedRoute component={ProgressReporting} minRole="staff" />}</Route>
      <Route path="/properties">{() => <ProtectedRoute component={Properties} minRole="staff" />}</Route>
      <Route path="/quality-standards">{() => <ProtectedRoute component={QualityStandards} minRole="staff" />}</Route>
      <Route path="/real-eye-dashboard">{() => <ProtectedRoute component={RealEyeDashboard} minRole="staff" />}</Route>
      <Route path="/security-center">{() => <ProtectedRoute component={SecurityCenter} minRole="staff" />}</Route>
      <Route path="/swot-analysis">{() => <ProtectedRoute component={SwotAnalysis} minRole="user" />}</Route>
      <Route path="/resource-links-admin">{() => <ProtectedRoute component={ResourceLinksAdmin} minRole="admin" />}</Route>
      <Route path="/government-actions-admin">{() => <ProtectedRoute component={GovernmentActionsAdmin} minRole="admin" />}</Route>
      <Route path="/token-reporting">{() => <ProtectedRoute component={TokenReportingDashboard} minRole="admin" />}</Route>
      <Route path="/system-admin">{() => <ProtectedRoute component={SystemAdmin} minRole="staff" />}</Route>
      <Route path="/system-health">{() => <ProtectedRoute component={SystemHealthDashboard} minRole="admin" />}</Route>
      <Route path="/system-settings">{() => <ProtectedRoute component={SystemSettings} minRole="admin" />}</Route>
      <Route path="/user-management">{() => <ProtectedRoute component={UserManagement} minRole="admin" />}</Route>
      <Route path="/vendor-management">{() => <ProtectedRoute component={VendorManagement} minRole="staff" />}</Route>
      <Route path="/wellness-programs">{() => <ProtectedRoute component={WellnessPrograms} minRole="staff" />}</Route>
      <Route path="/article-assignment">{() => <ProtectedRoute component={ArticleAssignment} minRole="staff" />}</Route>
      <Route path="/games/knowledge-quest">{() => <ProtectedRoute component={KnowledgeQuest} minRole="user" />}</Route>
      <Route path="/games/advanced-escape-room">{() => <ProtectedRoute component={AdvancedEscapeRoom} minRole="user" />}</Route>
      <Route path="/games/fleet-command">{() => <ProtectedRoute component={FleetCommand} minRole="user" />}</Route>
      <Route path="/games/hearts">{() => <ProtectedRoute component={Hearts} minRole="user" />}</Route>
      <Route path="/foreign-qualification">{() => <ProtectedRoute component={ForeignQualification} minRole="user" />}</Route>
      <Route path="/international-registration">{() => <ProtectedRoute component={InternationalRegistration} minRole="user" />}</Route>
      <Route path="/ticker-admin">{() => <ProtectedRoute component={TickerAdmin} minRole="admin" />}</Route>
      <Route path="/my-tasks">{() => <ProtectedRoute component={MyTasks} minRole="user" />}</Route>
      <Route path="/team-tasks">{() => <ProtectedRoute component={TeamTaskDashboard} minRole="staff" />}</Route>
      <Route path="/task-delegation">{() => <ProtectedRoute component={TaskDelegation} minRole="user" />}</Route>
      <Route path="/team-workload">{() => <ProtectedRoute component={TeamWorkload} minRole="staff" />}</Route>
      <Route path="/delegation-analytics">{() => <ProtectedRoute component={DelegationAnalytics} minRole="staff" />}</Route>
      <Route path="/delegation-approvals">{() => <ProtectedRoute component={DelegationApprovalQueue} minRole="staff" />}</Route>
      <Route path="/delegation-history">{() => <ProtectedRoute component={DelegationHistory} minRole="staff" />}</Route>
      <Route path="/delegation-escalation">{() => <ProtectedRoute component={DelegationEscalation} minRole="staff" />}</Route>
      <Route path="/mobile-dashboard" component={MobileDashboard} />
      <Route path="/global-search">{() => <ProtectedRoute component={GlobalSearchPage} />}</Route>
      <Route path="/reporting-center">{() => <ProtectedRoute component={ReportingCenter} minRole="staff" />}</Route>
      <Route path="/integration-hub">{() => <ProtectedRoute component={IntegrationHub} minRole="admin" />}</Route>
      <Route path="/onboarding-center">{() => <ProtectedRoute component={OnboardingCenter} />}</Route>
      <Route path="/bulk-operations">{() => <ProtectedRoute component={BulkOperations} minRole="staff" />}</Route>
      <Route path="/backup-restore">{() => <ProtectedRoute component={BackupRestore} minRole="admin" />}</Route>
      <Route path="/activity-feed">{() => <ProtectedRoute component={ActivityFeed} minRole="user" />}</Route>
      <Route path="/custom-dashboard">{() => <ProtectedRoute component={CustomDashboard} minRole="user" />}</Route>
      <Route path="/two-factor-setup">{() => <ProtectedRoute component={TwoFactorSetup} minRole="user" />}</Route>
      <Route path="/permission-matrix">{() => <ProtectedRoute component={PermissionMatrix} minRole="admin" />}</Route>
      <Route path="/document-version-control">{() => <ProtectedRoute component={DocumentVersionControl} minRole="staff" />}</Route>
      <Route path="/data-retention-policies">{() => <ProtectedRoute component={DataRetentionPolicies} minRole="admin" />}</Route>
      <Route path="/workflow-builder">{() => <ProtectedRoute component={WorkflowBuilder} minRole="staff" />}</Route>
      <Route path="/real-time-collaboration">{() => <ProtectedRoute component={RealTimeCollaboration} minRole="user" />}</Route>
      <Route path="/audit-reports">{() => <ProtectedRoute component={AuditReports} minRole="admin" />}</Route>
      <Route path="/api-usage-dashboard">{() => <ProtectedRoute component={ApiUsageDashboard} minRole="admin" />}</Route>
      <Route path="/role-dashboard">{() => <ProtectedRoute component={RoleDashboard} minRole="admin" />}</Route>
      <Route path="/language-settings">{() => <ProtectedRoute component={LanguageSettings} minRole="user" />}</Route>
      <Route path="/biometric-settings">{() => <ProtectedRoute component={BiometricSettings} minRole="user" />}</Route>
      <Route path="/calendar-integration">{() => <ProtectedRoute component={CalendarIntegration} minRole="user" />}</Route>
      <Route path="/ai-document-analysis">{() => <ProtectedRoute component={AIDocumentAnalysis} minRole="user" />}</Route>
      <Route path="/document-import">{() => <ProtectedRoute component={DocumentImport} minRole="user" />}</Route>
      <Route path="/member-portal">{() => <ProtectedRoute component={MemberPortal} minRole="user" />}</Route>
      <Route path="/advanced-reporting">{() => <ProtectedRoute component={AdvancedReporting} minRole="staff" />}</Route>
      <Route path="/payment-processing">{() => <ProtectedRoute component={PaymentProcessing} minRole="admin" />}</Route>
      <Route path="/workflow-templates">{() => <ProtectedRoute component={WorkflowTemplates} minRole="staff" />}</Route>
      <Route path="/translation-portal">{() => <ProtectedRoute component={TranslationPortal} minRole="user" />}</Route>
      <Route path="/external-api-integrations">{() => <ProtectedRoute component={ExternalApiIntegrations} minRole="admin" />}</Route>
      <Route path="/compliance-monitoring">{() => <ProtectedRoute component={ComplianceMonitoring} minRole="staff" />}</Route>
      <Route path="/multi-tenant-management">{() => <ProtectedRoute component={MultiTenantManagement} minRole="admin" />}</Route>
      <Route path="/data-export">{() => <ProtectedRoute component={DataExport} minRole="admin" />}</Route>
      <Route path="/documentation-generator">{() => <ProtectedRoute component={DocumentationGenerator} minRole="admin" />}</Route>
      <Route path="/system-health">{() => <ProtectedRoute component={SystemHealth} minRole="admin" />}</Route>
      <Route path="/backup-settings">{() => <ProtectedRoute component={BackupSettings} minRole="admin" />}</Route>
      <Route path="/offline-settings">{() => <ProtectedRoute component={OfflineSettings} />}</Route>
      
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
