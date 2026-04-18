import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { MediaPlayerProvider } from "./contexts/MediaPlayerContext";
import { RadioPlayerProvider } from "./contexts/RadioPlayerContext";
import MiniPlayer from "./components/MiniPlayer";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";




import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "./const";
import { Shield } from "lucide-react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

// Lazy-loaded page components for code-splitting
const NotFound = lazy(() => import("@/pages/NotFound"));
const QRHolding = lazy(() => import("./pages/QRHolding"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DocumentAdmin = lazy(() => import("./pages/DocumentAdmin"));
const SystemDashboard = lazy(() => import("./pages/SystemDashboard"));
const AcademyDashboard = lazy(() => import("./pages/AcademyDashboard"));
const AcademyLanding = lazy(() => import("./pages/AcademyLanding"));
const GuardianDashboard = lazy(() => import("./pages/GuardianDashboard"));
const DocumentVault = lazy(() => import("./pages/DocumentVault"));
const Agents = lazy(() => import("./pages/Agents"));
const SocialMedia = lazy(() => import("./pages/SocialMedia"));
const FoundationDashboard = lazy(() => import("./pages/FoundationDashboard"));
const FinancialAutomation = lazy(() => import("./pages/FinancialAutomation"));
const HouseDashboard = lazy(() => import("./pages/HouseDashboard"));
const AutonomousWealthSystem = lazy(() => import("./pages/AutonomousWealthSystem"));
const OwnerHouseSetup = lazy(() => import("./pages/OwnerHouseSetup"));
const GenesisCeremony = lazy(() => import("./pages/GenesisCeremony"));
const Landing = lazy(() => import("./pages/Landing"));
const ShellDemo = lazy(() => import("./pages/ShellDemo"));
const Donate = lazy(() => import("./pages/Donate"));
const DemoGate = lazy(() => import("./pages/DemoGate"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const ContactInbox = lazy(() => import("./pages/ContactInbox"));
const BrandGuide = lazy(() => import("./pages/BrandGuide"));
const FAQ = lazy(() => import("./pages/FAQ"));
const PurpleHeart = lazy(() => import("@/pages/PurpleHeart"));
const PublicDonate = lazy(() => import("@/pages/PublicDonate"));
const ImpactDashboard = lazy(() => import("@/pages/ImpactDashboard"));
const IndigenousRights = lazy(() => import("./pages/IndigenousRights"));
const DonorDashboard = lazy(() => import("./pages/DonorDashboard"));
const LuvOnboarding = lazy(() => import("./pages/LuvOnboarding"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Shop = lazy(() => import("./pages/Shop"));
const Products = lazy(() => import("./pages/Products"));
const CourseSuccess = lazy(() => import("./pages/CourseSuccess"));
const ConsultingSuccess = lazy(() => import("./pages/ConsultingSuccess"));
const CourseDashboard = lazy(() => import("./pages/CourseDashboard"));
const MemberOnboarding = lazy(() => import("./pages/MemberOnboarding"));
const RevenueCycleDashboard = lazy(() => import("./pages/RevenueCycleDashboard"));
const BankingCredit = lazy(() => import("./pages/BankingCredit"));
const BusinessFormation = lazy(() => import("./pages/BusinessFormation"));
const PositionManagement = lazy(() => import("./pages/PositionManagement"));
const FamilyOnboarding = lazy(() => import("./pages/FamilyOnboarding"));
const RevenueSharing = lazy(() => import("./pages/RevenueSharing"));
const BoardMeetings = lazy(() => import("./pages/BoardMeetings"));
const InternationalBusiness = lazy(() => import("./pages/InternationalBusiness"));
const InternationalOperationsDashboard = lazy(() => import("./pages/InternationalOperationsDashboard"));
const BusinessSimulator = lazy(() => import("./pages/BusinessSimulator"));
const GrantManagement = lazy(() => import("./pages/GrantManagement"));
const GrantSimulator = lazy(() => import("./pages/GrantSimulator"));
const GrantExport = lazy(() => import("./pages/GrantExport"));
const GrantHistory = lazy(() => import("./pages/GrantHistory"));
const NeedStatementEditor = lazy(() => import("./pages/NeedStatementEditor"));
const BusinessPlanSimulator = lazy(() => import("./pages/BusinessPlanSimulator"));
const BusinessPlanUpload = lazy(() => import("./pages/BusinessPlanUpload"));
const TaxSimulator = lazy(() => import("./pages/TaxSimulator"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Checkout = lazy(() => import("./pages/Checkout"));
const ProposalSimulator = lazy(() => import("./pages/ProposalSimulator"));
const RFPGenerator = lazy(() => import("@/pages/RFPGenerator"));
const BusinessSetupWizard = lazy(() => import("@/pages/BusinessSetupWizard"));
const TrustGovernance = lazy(() => import("@/pages/TrustGovernance"));
const TrainingContentManager = lazy(() => import("@/pages/TrainingContentManager"));
const HRManagement = lazy(() => import("@/pages/HRManagement"));
const HRApplications = lazy(() => import("@/pages/HRApplications"));
const HRDashboard = lazy(() => import("@/pages/HRDashboard"));
const HRAdmin = lazy(() => import("@/pages/HRAdmin"));
const PerformanceReviews = lazy(() => import("@/pages/PerformanceReviews"));
const FinancialLiteracyGame = lazy(() => import("@/pages/FinancialLiteracyGame"));
const BusinessTycoonGame = lazy(() => import("@/pages/BusinessTycoonGame"));
const TicTacToe = lazy(() => import("@/pages/games/TicTacToe"));
const MemoryMatch = lazy(() => import("@/pages/games/MemoryMatch"));
const ConnectFour = lazy(() => import("@/pages/games/ConnectFour"));
const Sudoku = lazy(() => import("@/pages/games/Sudoku"));
const WordSearch = lazy(() => import("@/pages/games/WordSearch"));
const Hangman = lazy(() => import("@/pages/games/Hangman"));
const Snake = lazy(() => import("@/pages/games/Snake"));
const Checkers = lazy(() => import("@/pages/games/Checkers"));
const Game2048 = lazy(() => import("@/pages/games/Game2048"));
const Chess = lazy(() => import("@/pages/games/Chess"));
const Battleship = lazy(() => import("@/pages/games/Battleship"));
const Solitaire = lazy(() => import("@/pages/games/Solitaire"));
const LAWSQuest = lazy(() => import("@/pages/games/LAWSQuest"));
const LAWSQuestUnified = lazy(() => import("@/pages/games/LAWSQuestUnified"));
const DualPathJourney = lazy(() => import("@/pages/games/DualPathJourney"));
const SovereigntyJourney = lazy(() => import("@/pages/games/SovereigntyJourney"));
const RainbowJourney = lazy(() => import("@/pages/games/RainbowJourney"));
const LogicPuzzles = lazy(() => import("@/pages/games/LogicPuzzles"));
const SpiderSolitaire = lazy(() => import("@/pages/games/SpiderSolitaire"));
const WordForge = lazy(() => import("@/pages/games/WordForge"));
const CrosswordMaster = lazy(() => import("@/pages/games/CrosswordMaster"));
const ClimbSlide = lazy(() => import("@/pages/games/ClimbSlide"));
const EscapeRoom = lazy(() => import("@/pages/games/EscapeRoom"));
const DetectiveAcademy = lazy(() => import("@/pages/games/DetectiveAcademy"));
const RubiksCube = lazy(() => import("@/pages/games/RubiksCube"));
const MemberCommunicationHub = lazy(() => import("@/pages/MemberCommunicationHub"));
const AdvancedSegmentationUI = lazy(() => import("@/pages/AdvancedSegmentationUI"));
const FinancialReconciliationUI = lazy(() => import("@/pages/FinancialReconciliationUI"));
const Spades = lazy(() => import("@/pages/games/Spades"));
const Yahtzee = lazy(() => import("@/pages/games/Yahtzee"));
const ScrabbleGame = lazy(() => import("@/pages/games/ScrabbleGame"));
const Dominoes = lazy(() => import("@/pages/games/Dominoes"));
const Mancala = lazy(() => import("@/pages/games/Mancala"));
const MahjongSolitaire = lazy(() => import("@/pages/games/MahjongSolitaire"));
const Backgammon = lazy(() => import("@/pages/games/Backgammon"));
const Tangram = lazy(() => import("@/pages/games/Tangram"));
const WordLadder = lazy(() => import("@/pages/games/WordLadder"));
const TriviaChallenge = lazy(() => import("@/pages/games/TriviaChallenge"));
const SimonSays = lazy(() => import("@/pages/games/SimonSays"));
const CommunityBuilder = lazy(() => import("@/pages/games/CommunityBuilder"));
const FleetCommand = lazy(() => import("@/pages/games/FleetCommand"));
const Hearts = lazy(() => import("@/pages/games/Hearts"));
const Achievements = lazy(() => import("@/pages/Achievements"));
const OperationsDashboard = lazy(() => import("@/pages/OperationsDashboard"));
const ExecutiveDashboard = lazy(() => import("@/pages/ExecutiveDashboard"));
const Careers = lazy(() => import("@/pages/Careers"));
const ComingSoon = lazy(() => import("@/pages/ComingSoon"));
const EmployeeDirectory = lazy(() => import("@/pages/EmployeeDirectory"));
const HouseContractManagement = lazy(() => import("@/pages/HouseContractManagement"));
const MyProfile = lazy(() => import("@/pages/MyProfile"));
const UserPreferences = lazy(() => import("@/pages/UserPreferences"));
const SignatureAuditReport = lazy(() => import("@/pages/SignatureAuditReport"));
const BulkSignatureRequest = lazy(() => import("@/pages/BulkSignatureRequest"));
const ComplianceDashboard = lazy(() => import("@/pages/ComplianceDashboard"));
const ComplianceCalendar = lazy(() => import("@/pages/ComplianceCalendar"));
const DocumentUpload = lazy(() => import("@/pages/DocumentUpload"));
const NotificationHistory = lazy(() => import("@/pages/NotificationHistory"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const OnboardingChecklist = lazy(() => import("@/pages/OnboardingChecklist"));
const OperatingProcedures = lazy(() => import("@/pages/OperatingProcedures"));
const ProjectControls = lazy(() => import("@/pages/ProjectControls"));
const PositionRequisitions = lazy(() => import("@/pages/PositionRequisitions"));
const GettingStarted = lazy(() => import("@/pages/GettingStarted"));
const SystemOverview = lazy(() => import("@/pages/SystemOverview"));
const SystemMap = lazy(() => import("@/pages/SystemMap"));
const Contact = lazy(() => import("@/pages/Contact"));
const Support = lazy(() => import("@/pages/Support"));
const ContractorTransition = lazy(() => import("./pages/ContractorTransition"));
const ContractorAgreement = lazy(() => import("./pages/ContractorAgreement"));
const ContractorTransitions = lazy(() => import("./pages/ContractorTransitions"));
const CareerPathPlanner = lazy(() => import("./pages/CareerPathPlanner"));
const BenefitsComparison = lazy(() => import("./pages/BenefitsComparison"));
const SignatureVerification = lazy(() => import("./pages/SignatureVerification"));
const BoardGovernance = lazy(() => import("./pages/BoardGovernance"));
const ContractorNetwork = lazy(() => import("./pages/ContractorNetwork"));
const TransitionTraining = lazy(() => import("./pages/TransitionTraining"));
const TransitionSimulator = lazy(() => import("./pages/TransitionSimulator"));
const HouseOfTongues = lazy(() => import("./pages/HouseOfTongues"));
const LearningHouses = lazy(() => import("./pages/LearningHouses"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const ContractorInvoices = lazy(() => import("@/pages/ContractorInvoices"));
const ContractManagement = lazy(() => import("@/pages/ContractManagement"));
const Donations = lazy(() => import("@/pages/Donations"));
const GrantTracking = lazy(() => import("@/pages/GrantTracking"));
const GrantDocuments = lazy(() => import("@/pages/GrantDocuments"));
const DemographicGrantsPage = lazy(() => import("@/pages/DemographicGrantsPage"));
const VolunteerPage = lazy(() => import("@/pages/VolunteerPage"));
const HouseManagement = lazy(() => import("./pages/HouseManagement"));
const TrustVisualization = lazy(() => import("./pages/TrustVisualization"));
const EntityStructure = lazy(() => import("./pages/EntityStructure"));
const FinancialStatements = lazy(() => import("./pages/FinancialStatements"));
const BoardResolutions = lazy(() => import("./pages/BoardResolutions"));
const ContingencyOffers = lazy(() => import("./pages/ContingencyOffers"));
const ResumeBuilder = lazy(() => import("./pages/ResumeBuilder"));
const ProcurementCatalog = lazy(() => import("./pages/ProcurementCatalog"));
const CompanyCalendar = lazy(() => import("./pages/CompanyCalendar"));
const ESignature = lazy(() => import("./pages/ESignature"));
const SignatureComplianceAdmin = lazy(() => import("./pages/SignatureComplianceAdmin"));
const SystemJobsAdmin = lazy(() => import("./pages/SystemJobsAdmin"));
const SpecialistTracks = lazy(() => import("./pages/SpecialistTracks"));
const Scholarships = lazy(() => import("./pages/Scholarships"));
const CreativeEnterprise = lazy(() => import("./pages/CreativeEnterprise"));
const DesignDepartment = lazy(() => import("./pages/DesignDepartment"));
const DesignServices = lazy(() => import("./pages/DesignServices"));
const MediaServices = lazy(() => import("./pages/MediaServices"));
const GameCenter = lazy(() => import("./pages/GameCenter"));
const EmployeeGamingDashboard = lazy(() => import("./pages/EmployeeGamingDashboard"));
const Sandbox = lazy(() => import("./pages/Sandbox"));
const TeamSessionScheduler = lazy(() => import("./pages/TeamSessionScheduler"));
const SoftwareLicenses = lazy(() => import("./pages/SoftwareLicenses"));
const GamingComplianceReports = lazy(() => import("./pages/GamingComplianceReports"));
const PurchaseRequests = lazy(() => import("./pages/PurchaseRequests"));
const TaxModule = lazy(() => import("./pages/TaxModule"));
const TimekeepingDashboard = lazy(() => import("./pages/TimekeepingDashboard"));
const ExternalIntegrations = lazy(() => import("./pages/ExternalIntegrations"));
const GrantLaborReports = lazy(() => import("./pages/GrantLaborReports"));
const PayrollDashboard = lazy(() => import("./pages/PayrollDashboard"));
const HealthSimulator = lazy(() => import("./pages/simulators/HealthSimulator"));
const EducationSimulator = lazy(() => import("./pages/simulators/EducationSimulator"));
const DesignSimulator = lazy(() => import("./pages/simulators/DesignSimulator"));
const MediaSimulator = lazy(() => import("./pages/simulators/MediaSimulator"));
const FinanceSimulator = lazy(() => import("./pages/simulators/FinanceSimulator"));
const HRSimulator = lazy(() => import("./pages/simulators/HRSimulator"));
const OperationsSimulator = lazy(() => import("./pages/simulators/OperationsSimulator"));
const ProcurementSimulator = lazy(() => import("./pages/simulators/ProcurementSimulator"));
const ContractsSimulator = lazy(() => import("./pages/simulators/ContractsSimulator"));
const PurchasingSimulator = lazy(() => import("./pages/simulators/PurchasingSimulator"));
const PropertySimulator = lazy(() => import("./pages/simulators/PropertySimulator"));
const RealEstateSimulator = lazy(() => import("./pages/simulators/RealEstateSimulator"));
const ProjectControlsSimulator = lazy(() => import("./pages/simulators/ProjectControlsSimulator"));
const QAQCSimulator = lazy(() => import("./pages/simulators/QAQCSimulator"));
const LegalSimulator = lazy(() => import("./pages/simulators/LegalSimulator"));
const ITSimulator = lazy(() => import("./pages/simulators/ITSimulator"));
const PlatformSimulator = lazy(() => import("./pages/simulators/PlatformSimulator"));
const GrantsSimulator = lazy(() => import("./pages/simulators/GrantsSimulator"));
const TrainingHub = lazy(() => import("./pages/TrainingHub"));
const ContractAgent = lazy(() => import("./pages/ContractAgent"));
const Services = lazy(() => import("./pages/Services"));
const OfferLetters = lazy(() => import("@/pages/OfferLetters"));
const BusinessDashboard = lazy(() => import("@/pages/BusinessDashboard"));
const BusinessLanding = lazy(() => import("@/pages/BusinessLanding"));
const SystemHealthDashboard = lazy(() => import("@/pages/SystemHealthDashboard"));
const HealthDashboard = lazy(() => import("@/pages/HealthDashboard"));
const EducationDashboard = lazy(() => import("@/pages/EducationDashboard"));
const DesignDashboard = lazy(() => import("@/pages/DesignDashboard"));
const MediaDashboard = lazy(() => import("@/pages/MediaDashboard"));
const FinanceDashboard = lazy(() => import("@/pages/FinanceDashboard"));
const ProcurementDashboard = lazy(() => import("@/pages/ProcurementDashboard"));
const ContractsDashboard = lazy(() => import("@/pages/ContractsDashboard"));
const PurchasingDashboard = lazy(() => import("@/pages/PurchasingDashboard"));
const PropertyDashboard = lazy(() => import("@/pages/PropertyDashboard"));
const PropertyManagementDashboard = lazy(() => import("@/pages/PropertyManagementDashboard"));
const RealEstateDashboard = lazy(() => import("@/pages/RealEstateDashboard"));
const ProjectControlsDashboard = lazy(() => import("@/pages/ProjectControlsDashboard"));
const QAQCDashboard = lazy(() => import("@/pages/QAQCDashboard"));
const LegalDashboard = lazy(() => import("@/pages/LegalDashboard"));
const ITDashboard = lazy(() => import("@/pages/ITDashboard"));
const GrantsDashboard = lazy(() => import("@/pages/dept/GrantsDashboard"));
const PlatformAdminDashboard = lazy(() => import("@/pages/PlatformAdminDashboard"));
const TrustAdminDashboard = lazy(() => import("@/pages/TrustAdminDashboard"));
const EntityCurriculum = lazy(() => import("@/pages/EntityCurriculum"));
const GovernanceWorkflows = lazy(() => import("@/pages/GovernanceWorkflows"));
const AuditTrailViewer = lazy(() => import("@/pages/AuditTrailViewer"));
const Procedures = lazy(() => import("@/pages/Procedures"));
const MeetingsDashboard = lazy(() => import("@/pages/MeetingsDashboard"));
const Downloads = lazy(() => import("@/pages/Downloads"));
const OwnerActionList = lazy(() => import("@/pages/OwnerActionList"));
const Chat = lazy(() => import("@/pages/Chat"));
const SwotAnalysis = lazy(() => import("@/pages/SwotAnalysis"));
const ResourceLinksAdmin = lazy(() => import("@/pages/ResourceLinksAdmin"));
const GovernmentActionsAdmin = lazy(() => import("@/pages/GovernmentActionsAdmin"));
const TokenReportingDashboard = lazy(() => import("@/pages/TokenReportingDashboard"));
const Changelog = lazy(() => import("@/pages/Changelog"));
const InvestorOpportunities = lazy(() => import("@/pages/InvestorOpportunities"));
const DocumentTemplates = lazy(() => import("@/pages/DocumentTemplates"));
const TrademarkDocuments = lazy(() => import("@/pages/TrademarkDocuments"));
const MarketingDashboard = lazy(() => import("@/pages/MarketingDashboard"));
const RevenueFlowDashboard = lazy(() => import("@/pages/RevenueFlowDashboard"));
const BusinessListings = lazy(() => import("@/pages/BusinessListings"));
const ServiceDepartments = lazy(() => import("@/pages/ServiceDepartments"));
const FoundingMemberBonus = lazy(() => import("@/pages/FoundingMemberBonus"));
const WorkerProgression = lazy(() => import("@/pages/WorkerProgression"));
const ClosedLoopWealth = lazy(() => import("@/pages/ClosedLoopWealth"));
const LAWSEmploymentPortal = lazy(() => import("@/pages/LAWSEmploymentPortal"));
const InternshipPortal = lazy(() => import("@/pages/InternshipPortal"));
const Donate508 = lazy(() => import("@/pages/Donate508"));
const DonateThankYou = lazy(() => import("@/pages/DonateThankYou"));
const MemberBusinessDashboard = lazy(() => import("@/pages/MemberBusinessDashboard"));
const MemberBusinessRegistration = lazy(() => import("@/pages/MemberBusinessRegistration"));
const MemberRegistration = lazy(() => import("@/pages/MemberRegistration"));
const AcquisitionFundDashboard = lazy(() => import("@/pages/AcquisitionFundDashboard"));
const TrialLanding = lazy(() => import("@/pages/TrialLanding"));
const TrialDashboard = lazy(() => import("@/pages/TrialDashboard"));
const TrialAnalytics = lazy(() => import("@/pages/TrialAnalytics"));
const OfficeSuite = lazy(() => import("@/pages/OfficeSuite"));
const Documentary = lazy(() => import("@/pages/Documentary"));
const Podcast = lazy(() => import("@/pages/Podcast"));
const JoinJourney = lazy(() => import("@/pages/JoinJourney"));
const MyCredential = lazy(() => import("@/pages/MyCredential"));
const VirtualLibrary = lazy(() => import("@/pages/VirtualLibrary"));
const ReadingDashboard = lazy(() => import("@/pages/ReadingDashboard"));
const BookReader = lazy(() => import("@/pages/BookReader"));
const ProgressDashboard = lazy(() => import("@/pages/ProgressDashboard"));
const ProtectionLayer = lazy(() => import("@/pages/ProtectionLayer"));
const ExternalOnboarding = lazy(() => import("@/pages/ExternalOnboarding"));
const AssetManagementDashboard = lazy(() => import("@/pages/AssetManagementDashboard"));
const WorkforceTransitionsDashboard = lazy(() => import("@/pages/WorkforceTransitionsDashboard"));
const InvestmentPortfolioDashboard = lazy(() => import("@/pages/InvestmentPortfolioDashboard"));
const InvestmentGovernanceDashboard = lazy(() => import("@/pages/InvestmentGovernanceDashboard"));
const TieredGovernanceDashboard = lazy(() => import("@/pages/TieredGovernanceDashboard"));
const InvestmentReportDashboard = lazy(() => import("@/pages/InvestmentReportDashboard"));
const ConsolidatedFinancialDashboard = lazy(() => import("@/pages/ConsolidatedFinancialDashboard"));
const TrademarkChecklist = lazy(() => import("@/pages/TrademarkChecklist"));
const MemberCredentials = lazy(() => import("@/pages/MemberCredentials"));
const ArticleAssignment = lazy(() => import("@/pages/ArticleAssignment"));
const KnowledgeQuest = lazy(() => import("@/pages/games/KnowledgeQuest"));
const AdvancedEscapeRoom = lazy(() => import("@/pages/games/AdvancedEscapeRoom"));
const ForeignQualification = lazy(() => import("@/pages/ForeignQualification"));
const InternationalRegistration = lazy(() => import("@/pages/InternationalRegistration"));
const TickerAdmin = lazy(() => import("@/pages/TickerAdmin"));
const MyTasks = lazy(() => import("@/pages/MyTasks"));
const TeamTaskDashboard = lazy(() => import("@/pages/TeamTaskDashboard"));
const TaskDelegation = lazy(() => import("@/pages/TaskDelegation"));
const TeamWorkload = lazy(() => import("@/pages/TeamWorkload"));
const DelegationAnalytics = lazy(() => import("@/pages/DelegationAnalytics"));
const DelegationApprovalQueue = lazy(() => import("@/pages/DelegationApprovalQueue"));
const DelegationHistory = lazy(() => import("@/pages/DelegationHistory"));
const DelegationEscalation = lazy(() => import("@/pages/DelegationEscalation"));
const MobileDashboard = lazy(() => import("@/pages/MobileDashboard"));
const GlobalSearchPage = lazy(() => import("@/pages/GlobalSearchPage"));
const ReportingCenter = lazy(() => import("@/pages/ReportingCenter"));
const IntegrationHub = lazy(() => import("@/pages/IntegrationHub"));
const OnboardingCenter = lazy(() => import("@/pages/OnboardingCenter"));
const BulkOperations = lazy(() => import("@/pages/BulkOperations"));
const BackupRestore = lazy(() => import("@/pages/BackupRestore"));
const ActivityFeed = lazy(() => import("@/pages/ActivityFeed"));
const CustomDashboard = lazy(() => import("@/pages/CustomDashboard"));
const TwoFactorSetup = lazy(() => import("@/pages/TwoFactorSetup"));
const PermissionMatrix = lazy(() => import("@/pages/PermissionMatrix"));
const DocumentVersionControl = lazy(() => import("@/pages/DocumentVersionControl"));
const DataRetentionPolicies = lazy(() => import("@/pages/DataRetentionPolicies"));
const WorkflowBuilder = lazy(() => import("@/pages/WorkflowBuilder"));
const RealTimeCollaboration = lazy(() => import("@/pages/RealTimeCollaboration"));
const AuditReports = lazy(() => import("@/pages/AuditReports"));
const ApiUsageDashboard = lazy(() => import("@/pages/ApiUsageDashboard"));
const RoleDashboard = lazy(() => import("@/pages/RoleDashboard"));
const LanguageSettings = lazy(() => import("@/pages/LanguageSettings"));
const BiometricSettings = lazy(() => import("@/pages/BiometricSettings"));
const CalendarIntegration = lazy(() => import("@/pages/CalendarIntegration"));
const AIDocumentAnalysis = lazy(() => import("@/pages/AIDocumentAnalysis"));
const DocumentImport = lazy(() => import("@/pages/DocumentImport"));
const MemberPortal = lazy(() => import("@/pages/MemberPortal"));
const AdvancedReporting = lazy(() => import("@/pages/AdvancedReporting"));
const PaymentProcessing = lazy(() => import("@/pages/PaymentProcessing"));
const WorkflowTemplates = lazy(() => import("@/pages/WorkflowTemplates"));
const TranslationPortal = lazy(() => import("@/pages/TranslationPortal"));
const AdminTemplateReviews = lazy(() => import("@/pages/AdminTemplateReviews"));
const ExternalApiIntegrations = lazy(() => import("@/pages/ExternalApiIntegrations"));
const ComplianceMonitoring = lazy(() => import("@/pages/ComplianceMonitoring"));
const MultiTenantManagement = lazy(() => import("@/pages/MultiTenantManagement"));
const DataExport = lazy(() => import("@/pages/DataExport"));
const DocumentationGenerator = lazy(() => import("@/pages/DocumentationGenerator"));
const SystemHealth = lazy(() => import("@/pages/SystemHealth"));
const BackupSettings = lazy(() => import("@/pages/BackupSettings"));
const OfflineSettings = lazy(() => import("@/pages/OfflineSettings"));
const RealtimeDashboardSync = lazy(() => import("@/pages/RealtimeDashboardSync"));
const CustomReportScheduling = lazy(() => import("@/pages/CustomReportScheduling"));
const TeamCollaboration = lazy(() => import("@/pages/TeamCollaboration"));
const TheaterLive = lazy(() => import("@/pages/TheaterLive"));
const TheaterLiveReal = lazy(() => import("@/pages/TheaterLiveReal"));
const TheaterEnhanced = lazy(() => import("@/pages/TheaterEnhanced"));
const TheaterLiveEnhanced = lazy(() => import("@/pages/TheaterLiveEnhanced"));
const IPTVAdminPanel = lazy(() => import("@/pages/IPTVAdminPanel"));
const TheaterVOD = lazy(() => import("@/pages/TheaterVOD"));
const BroadcastChannels = lazy(() => import("@/pages/BroadcastChannels"));
const BroadcastRadioReal = lazy(() => import("@/pages/BroadcastRadioReal"));
const MyLibrary = lazy(() => import("@/pages/MyLibrary"));
const PlaylistDetail = lazy(() => import("@/pages/PlaylistDetail"));
const NowPlaying = lazy(() => import("@/pages/NowPlaying"));
const PlaybackHistory = lazy(() => import("@/pages/PlaybackHistory"));
const TheaterNowPlaying = lazy(() => import("@/pages/TheaterNowPlaying"));
const TheaterPlaybackHistory = lazy(() => import("@/pages/TheaterPlaybackHistory"));
const EmailCampaignDashboard = lazy(() => import("@/pages/EmailCampaignDashboard"));
const BroadcastEpisodes = lazy(() => import("@/pages/BroadcastEpisodes"));
const LiveBroadcasts = lazy(() => import("@/pages/LiveBroadcasts"));
const Emergency = lazy(() => import("@/pages/Emergency"));
const Conference = lazy(() => import("@/pages/Conference"));
const Music = lazy(() => import("@/pages/Music"));
const MusicPlayerReal = lazy(() => import("@/pages/MusicPlayerReal"));
const AdminSeeding = lazy(() => import("@/pages/AdminSeeding"));
const RealtimeDashboards = lazy(() => import("@/pages/RealtimeDashboards"));
const ComplianceExport = lazy(() => import("@/pages/ComplianceExport"));
const AlertRules = lazy(() => import("@/pages/AlertRules"));
const MobileIntegration = lazy(() => import("@/pages/MobileIntegration"));
const AIInsights = lazy(() => import("@/pages/AIInsights"));
const BusinessDocuments = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.BusinessDocuments })));
const HealthDocuments = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.HealthDocuments })));
const EducationDocuments = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.EducationDocuments })));
const DesignDocuments = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.DesignDocuments })));
const MediaDocuments = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.MediaDocuments })));
const FinanceDocuments = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.FinanceDocuments })));
const HRDocuments = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.HRDocuments })));
const OperationsDocuments = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.OperationsDocuments })));
const ProcurementDocuments = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.ProcurementDocuments })));
const ContractsDocuments = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.ContractsDocuments })));
const PurchasingDocuments = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.PurchasingDocuments })));
const PropertyDocuments = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.PropertyDocuments })));
const RealEstateDocuments = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.RealEstateDocuments })));
const ProjectControlsDocuments = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.ProjectControlsDocuments })));
const QAQCDocuments = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.QAQCDocuments })));
const LegalDocuments = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.LegalDocuments })));
const ITDocuments = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.ITDocuments })));
const PlatformDocuments = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.PlatformDocuments })));
const GrantsDocuments = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.GrantsDocuments })));
const BusinessTeam = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.BusinessTeam })));
const HealthTeam = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.HealthTeam })));
const EducationTeam = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.EducationTeam })));
const DesignTeam = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.DesignTeam })));
const MediaTeam = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.MediaTeam })));
const FinanceTeam = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.FinanceTeam })));
const HRTeam = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.HRTeam })));
const OperationsTeam = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.OperationsTeam })));
const ProcurementTeam = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.ProcurementTeam })));
const ContractsTeam = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.ContractsTeam })));
const PurchasingTeam = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.PurchasingTeam })));
const PropertyTeam = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.PropertyTeam })));
const RealEstateTeam = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.RealEstateTeam })));
const ProjectControlsTeam = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.ProjectControlsTeam })));
const QAQCTeam = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.QAQCTeam })));
const LegalTeam = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.LegalTeam })));
const ITTeam = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.ITTeam })));
const PlatformTeam = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.PlatformTeam })));
const GrantsTeam = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.GrantsTeam })));
const AssetTracking = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.AssetTracking })));
const Audits = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.Audits })));
const BrandAssets = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.BrandAssets })));
const BusinessPlans = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.BusinessPlans })));
const Compliance = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.Compliance })));
const ContentCalendar = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.ContentCalendar })));
const Curriculum = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.Curriculum })));
const Instructors = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.Instructors })));
const Inventory = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.Inventory })));
const OperatingAgreements = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.OperatingAgreements })));
const ProgressReporting = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.ProgressReporting })));
const Properties = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.Properties })));
const QualityStandards = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.QualityStandards })));
const RealEyeDashboard = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.RealEyeDashboard })));
const SecurityCenter = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.SecurityCenter })));
const SystemAdmin = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.SystemAdmin })));
const SystemSettings = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.SystemSettings })));
const UserManagement = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.UserManagement })));
const VendorManagement = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.VendorManagement })));
const WellnessPrograms = lazy(() => import("@/pages/placeholders").then(m => ({ default: m.WellnessPrograms })));
const ActivationProgress = lazy(() => import("@/pages/ActivationProgress"));
const ContentBuilder = lazy(() => import("@/pages/ContentBuilder"));
const AdminActivations = lazy(() => import("@/pages/AdminActivations"));
const IdentityVault = lazy(() => import("@/pages/IdentityVault"));
const SuccessionProtocol = lazy(() => import("@/pages/SuccessionProtocol"));


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
  // Enable keyboard shortcuts for queue control
  useKeyboardShortcuts();
  
  // Public routes: Landing page, Academy, and Dashboard (for viewing courses)
  // Protected routes: Trust System, Document Vault, Agents, Social Media
  return (
    <div className="flex flex-col min-h-screen">
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
      <Switch>
      {/* Public routes - no authentication required */}
      <Route path="/qr-holding" component={QRHolding} />
      <Route path="/login" component={Login} />
      <Route path="/demo" component={ShellDemo} />
      <Route path="/shell-demo" component={ShellDemo} />
      <Route path="/careers" component={ComingSoon} />
      <Route path="/coming-soon" component={ComingSoon} />
      <Route path="/join" component={JoinJourney} />
      <Route path="/my-credential" component={MyCredential} />
      <Route path="/contact" component={Contact} />
      <Route path="/services" component={Services} />
      <Route path="/signup" component={SignUp} />
      <Route path="/support" component={Support} />
      <Route path="/donate" component={PublicDonate} />
      <Route path="/donor-dashboard">{() => <ProtectedRoute component={DonorDashboard} />}</Route>
      <Route path="/onboarding">{() => <ProtectedRoute component={LuvOnboarding} />}</Route>
      <Route path="/contact-us" component={ContactUs} />
      <Route path="/brand-guide" component={BrandGuide} />
      <Route path="/faq" component={FAQ} />
      <Route path="/purple-heart" component={PurpleHeart} />
      <Route path="/impact-dashboard" component={ImpactDashboard} />
      <Route path="/indigenous-rights" component={IndigenousRights} />
      <Route path="/admin/contact-inbox">{() => <ProtectedRoute component={ContactInbox} minRole="admin" />}</Route>
      <Route path="/products" component={Products} />
      <Route path="/course-success" component={CourseSuccess} />
      <Route path="/consulting-success" component={ConsultingSuccess} />
      <Route path="/course-dashboard" component={CourseDashboard} />

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
      <Route path="/autonomous-wealth-system">{() => <ProtectedRoute component={AutonomousWealthSystem} minRole="user" />}</Route>
      <Route path="/house">{() => <ProtectedRoute component={HouseDashboard} minRole="user" />}</Route>
      <Route path="/house-contracts">{() => <ProtectedRoute component={HouseContractManagement} minRole="user" />}</Route>
      <Route path="/getting-started">{() => <ProtectedRoute component={GettingStarted} minRole="user" />}</Route>
      <Route path="/academy">{() => <AcademyLanding />}</Route>
      <Route path="/academy/dashboard">{() => <ProtectedRoute component={AcademyDashboard} minRole="user" />}</Route>
      <Route path="/guardian-dashboard">{() => <ProtectedRoute component={GuardianDashboard} minRole="user" />}</Route>
      <Route path="/activation-progress">{() => <ProtectedRoute component={ActivationProgress} minRole="user" />}</Route>
      <Route path="/content-builder">{() => <ProtectedRoute component={ContentBuilder} minRole="user" />}</Route>
      <Route path="/admin/activations">{() => <ProtectedRoute component={AdminActivations} minRole="admin" />}</Route>
      <Route path="/business-simulator">{() => <ProtectedRoute component={BusinessSimulator} minRole="user" />}</Route>
      <Route path="/business-plan-simulator">{() => <ProtectedRoute component={BusinessPlanSimulator} minRole="user" />}</Route>
      <Route path="/grant-simulator">{() => <ProtectedRoute component={GrantSimulator} minRole="user" />}</Route>
      <Route path="/grant-export">{() => <ProtectedRoute component={GrantExport} minRole="user" />}</Route>
      <Route path="/grant-history">{() => <ProtectedRoute component={GrantHistory} minRole="user" />}</Route>
      <Route path="/need-statement-editor">{() => <ProtectedRoute component={NeedStatementEditor} minRole="admin" />}</Route>
      {/* Dynamic simulator routes for /simulator/:type format */}
      <Route path="/simulator/finance">{() => <ProtectedRoute component={FinanceSimulator} minRole="staff" />}</Route>
      <Route path="/simulator/grant">{() => <ProtectedRoute component={GrantSimulator} minRole="user" />}</Route>
      <Route path="/simulator/business">{() => <ProtectedRoute component={BusinessSimulator} minRole="user" />}</Route>
      <Route path="/simulator/tax">{() => <ProtectedRoute component={TaxSimulator} minRole="user" />}</Route>
      <Route path="/simulator/proposal">{() => <ProtectedRoute component={ProposalSimulator} minRole="staff" />}</Route>
      <Route path="/proposal-simulator">{() => <ProtectedRoute component={ProposalSimulator} minRole="staff" />}</Route>
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
      <Route path="/hr-admin">{() => <ProtectedRoute component={HRAdmin} minRole="admin" />}</Route>
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
      <Route path="/transition-simulator">{() => <ProtectedRoute component={TransitionSimulator} minRole="staff" />}</Route>
      <Route path="/house-of-tongues">{() => <ProtectedRoute component={HouseOfTongues} minRole="user" />}</Route>
      <Route path="/learning-houses">{() => <ProtectedRoute component={LearningHouses} minRole="user" />}</Route>
      <Route path="/leaderboard">{() => <ProtectedRoute component={Leaderboard} minRole="user" />}</Route>
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
      <Route path="/games/spades">{() => <ProtectedRoute component={Spades} minRole="user" />}</Route>
      <Route path="/games/hearts">{() => <ProtectedRoute component={Hearts} minRole="user" />}</Route>
      <Route path="/games/laws-quest">{() => <ProtectedRoute component={LAWSQuest} minRole="user" />}</Route>
      <Route path="/games/dual-path-journey">{() => <ProtectedRoute component={DualPathJourney} minRole="user" />}</Route>
      <Route path="/games/yahtzee">{() => <ProtectedRoute component={Yahtzee} minRole="user" />}</Route>
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
      <Route path="/founder/identity-vault">{() => <ProtectedRoute component={IdentityVault} minRole="admin" />}</Route>
      <Route path="/founder/succession-protocol">{() => <ProtectedRoute component={SuccessionProtocol} minRole="admin" />}</Route>
      <Route path="/foundation">{() => <ProtectedRoute component={FoundationDashboard} minRole="admin" />}</Route>
      <Route path="/business-plan-upload">{() => <ProtectedRoute component={BusinessPlanUpload} minRole="admin" />}</Route>
      <Route path="/business-formation">{() => <ProtectedRoute component={BusinessFormation} minRole="admin" />}</Route>
      <Route path="/business-setup">{() => <ProtectedRoute component={BusinessSetupWizard} minRole="admin" />}</Route>
      <Route path="/family-onboarding">{() => <ProtectedRoute component={FamilyOnboarding} minRole="admin" />}</Route>
      <Route path="/revenue-sharing">{() => <ProtectedRoute component={RevenueSharing} minRole="admin" />}</Route>
      <Route path="/board-meetings">{() => <ProtectedRoute component={BoardMeetings} minRole="admin" />}</Route>
      <Route path="/international-business">{() => <ProtectedRoute component={InternationalBusiness} minRole="admin" />}</Route>
      <Route path="/international-operations">{() => <ProtectedRoute component={InternationalOperationsDashboard} minRole="admin" />}</Route>
      <Route path="/pricing" component={Pricing} />
      <Route path="/checkout">{() => <ProtectedRoute component={Checkout} minRole="user" />}</Route>
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
      <Route path="/system-map">{() => <ProtectedRoute component={SystemMap} minRole="owner" />}</Route>
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
      <Route path="/communication-hub">{() => <ProtectedRoute component={MemberCommunicationHub} />}</Route>
      <Route path="/segmentation-engine">{() => <ProtectedRoute component={AdvancedSegmentationUI} />}</Route>
      <Route path="/financial-reconciliation">{() => <ProtectedRoute component={FinancialReconciliationUI} />}</Route>
      <Route path="/realtime-dashboard-sync">{() => <ProtectedRoute component={RealtimeDashboardSync} />}</Route>
      <Route path="/custom-report-scheduling">{() => <ProtectedRoute component={CustomReportScheduling} />}</Route>
      <Route path="/team-collaboration">{() => <ProtectedRoute component={TeamCollaboration} />}</Route>
      <Route path="/theater-live">{() => <ProtectedRoute component={TheaterLiveReal} />}</Route>
      <Route path="/theater-live-enhanced" component={TheaterEnhanced} />
      <Route path="/theater-vod" component={TheaterVOD} />
      <Route path="/theater-now-playing">{() => <ProtectedRoute component={TheaterNowPlaying} />}</Route>
      <Route path="/theater-playback-history">{() => <ProtectedRoute component={TheaterPlaybackHistory} />}</Route>
      <Route path="/iptv-admin">{() => <ProtectedRoute component={IPTVAdminPanel} />}</Route>
      <Route path="/broadcast-channels" component={BroadcastRadioReal} />
      <Route path="/broadcast-episodes" component={BroadcastEpisodes} />
      <Route path="/live-broadcasts" component={LiveBroadcasts} />
      <Route path="/emergency" component={Emergency} />
      <Route path="/my-library">{() => <ProtectedRoute component={MyLibrary} />}</Route>
      <Route path="/now-playing">{() => <ProtectedRoute component={NowPlaying} />}</Route>
      <Route path="/playback-history">{() => <ProtectedRoute component={PlaybackHistory} />}</Route>
      <Route path="/playlists/new">{() => <ProtectedRoute component={PlaylistDetail} />}</Route>
      <Route path="/playlists/:id">{() => <ProtectedRoute component={PlaylistDetail} />}</Route>
      <Route path="/conference" component={Conference} />
      <Route path="/email-campaigns">{() => <ProtectedRoute component={EmailCampaignDashboard} />}</Route>

      <Route path="/music" component={Music} />
      <Route path="/realtime-dashboards">{() => <ProtectedRoute component={RealtimeDashboards} />}</Route>
      <Route path="/compliance-export">{() => <ProtectedRoute component={ComplianceExport} />}</Route>
      <Route path="/alert-rules">{() => <ProtectedRoute component={AlertRules} />}</Route>
      <Route path="/mobile-integration">{() => <ProtectedRoute component={MobileIntegration} />}</Route>
      <Route path="/ai-insights">{() => <ProtectedRoute component={AIInsights} />}</Route>
      <Route path="/admin/seeding">{() => <ProtectedRoute component={AdminSeeding} minRole="admin" />}</Route>
      {/* 404 */}
      <Route path="/" component={Landing} />
      <Route path="/demo" component={ShellDemo} />
      
      <Route path="/404" component={NotFound} />
      
      <Route component={NotFound} />
    </Switch>
      </Suspense>

    </div>
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
          <RadioPlayerProvider>
            <MediaPlayerProvider>
              <Toaster />
              <Router />
              <MiniPlayer />
            </MediaPlayerProvider>
          </RadioPlayerProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
