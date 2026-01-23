
import { getSessionCookieOptions } from "./_core/cookies";
import { COOKIE_NAME } from "../shared/const";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { luvSystemRouter } from "./routers/luv-system";
import { organizationRouter } from "./routers/organization";
import { academyRouter } from "./routers/academy";
import { simulatorsRouter } from "./routers/simulators";
import { luvledgerRouter } from "./routers/luvledger";
import { blockchainRouter } from "./routers/blockchain";
import { autonomousEngineRouter } from "./routers/autonomous-engine";
import { tokenEconomyRouter } from "./routers/token-economy";
import { curriculumGenerationRouter } from "./routers/curriculum-generation";
import { gamifiedSimulatorRouter } from "./routers/gamified-simulator";
import { cryptoWalletRouter } from "./routers/crypto-wallet";
import { offlineSyncRouter } from "./routers/offline-sync";
import { luvLedgerTrackingRouter } from "./routers/luv-ledger-tracking";
import { auditTrailUIRouter } from "./routers/audit-trail-ui";
import { companySetupRouter } from "./routers/company-setup";
import { trustAuthorityRouter } from "./routers/trust-authority";
import { entityCommercialEngineRouter } from "./routers/entity-commercial-engine";
import { entityEducationEngineRouter } from "./routers/entity-education-engine";
import { entityMediaEngineRouter } from "./routers/entity-media-engine";
import { entityPlatformEngineRouter } from "./routers/entity-platform-engine";
import { documentVaultRouter } from "./routers/document-vault";
import { notificationsRouter } from "./routers/notifications";
import { agentsRouter } from "./routers/agents";
import { socialMediaRouter } from "./routers/social-media";
import { emailServiceRouter } from "./routers/email-service";
import { contactRouter } from "./routers/contact";
import { luvLedgerAssetManagerRouter } from "./routers/luvledger-asset-manager";
import { sovereignScrollsRouter } from "./routers/sovereign-scrolls";
import { foundationLayerRouter } from "./routers/foundation-layer";
import { luvledgerAutomationRouter } from "./routers/luvledger-automation";
import { tokenChainRouter } from "./routers/token-chain";
import { giftingSystemRouter } from "./routers/gifting-system";
import { houseActivationRouter } from "./routers/house-activation";
import { crownCompletionRouter } from "./routers/crown-completion";
import { guardianCredentialsRouter } from "./routers/guardian-credentials";
import { houseLedgerRouter } from "./routers/house-ledger";
import { realEstateRouter } from "./routers/real-estate";
import { houseVaultRouter } from "./routers/house-vault";
import { payrollRouter } from "./routers/payroll";
import { taxPrepRouter } from "./routers/tax-prep";
import { restorationRouter } from "./routers/restoration";
import { documentGenerationRouter } from "./routers/document-generation";
import { lifecycleManagerRouter } from "./routers/lifecycle-manager";
import { communityFundsRouter } from "./routers/community-funds";
import { heirDistributionRouter } from "./routers/heir-distribution";
import { houseDashboardRouter } from "./routers/house-dashboard";
import { ownerHouseSetupRouter } from "./routers/owner-house-setup";
import { positionManagementRouter } from "./routers/position-management";
import { b2bContractingRouter } from "./routers/b2b-contracting";
import { employeeTransitionRouter } from "./routers/employee-transition";
import { interCompanyRouter } from "./routers/inter-company";
import { businessFormationRouter } from "./routers/business-formation";
import { bankingCreditRouter } from "./routers/banking-credit";
import { digitalSignaturesRouter } from "./routers/digital-signatures";
import { electronicSignatureRouter } from "./routers/electronicSignature";
import { exchangeRatesRouter } from "./routers/exchange-rates";
import { grantManagementRouter } from "./routers/grant-management";
import { businessPlanRouter } from "./routers/business-plan";
import { businessPlanParserRouter } from "./routers/business-plan-parser";
import { trainingRouter } from "./routers/training";
import { jobApplicationsRouter } from "./routers/job-applications";
import { employeesRouter } from "./routers/employees";
import { onboardingRouter } from "./routers/onboarding";
import { proceduresRouter } from "./routers/procedures";
import { projectControlsRouter } from "./routers/projectControls";
import { requisitionsRouter } from "./routers/requisitions";
import { contractorTransitionRouter } from "./routers/contractor-transition";
import { workforceDevelopmentRouter } from "./routers/workforce-development";
import { boardGovernanceRouter } from "./routers/board-governance";
import { contractorNetworkRouter } from "./routers/contractor-network";
import { trainingTransitionRouter } from "./routers/training-transition";
import { contractorInvoicesRouter } from "./routers/contractor-invoices";
import { contractManagementRouter } from "./routers/contract-management";
import { donationsRouter } from "./routers/donations";
import { grantTrackingRouter } from "./routers/grant-tracking";
import { houseManagementRouter } from "./routers/house-management";
import { financialStatementsRouter } from "./routers/financial-statements";
import { boardResolutionsRouter } from "./routers/board-resolutions";
import { contingencyOffersRouter } from "./routers/contingency-offers";
import { procurementCatalogRouter } from "./routers/procurement-catalog";
import { employmentPoliciesRouter } from "./routers/employment-policies";
import { companyCalendarRouter } from "./routers/company-calendar";
import { eSignatureRouter } from "./routers/e-signature";
import { boardGovernanceExtendedRouter } from "./routers/board-governance-extended";
import { grantDocumentsRouter } from "./routers/grant-documents";
import { offerPackagesRouter } from "./routers/offer-packages";
import { specialistTracksRouter } from "./routers/specialist-tracks";
import { scholarshipsRouter } from "./routers/scholarships";
import { creativeEnterpriseRouter } from "./routers/creative-enterprise";
import { designDepartmentRouter } from "./routers/design-department";
import { softwareLicensesRouter } from "./routers/software-licenses";
import { onlineAcademyRouter } from "./routers/online-academy";
import { gameCenterRouter } from "./routers/game-center";
import { purchaseRequestsRouter } from "./routers/purchase-requests";
import { taxModuleRouter } from "./routers/tax-module";
import { simulatorProgressRouter } from "./routers/simulator-progress";
import { timekeepingRouter } from "./routers/timekeeping";
import { dataExportRouter } from "./routers/data-export";
import { grantLaborReportsRouter } from "./routers/grant-labor-reports";
import { bankAccountsRouter } from "./routers/bankAccounts";
import { achRouter } from "./routers/ach";
import { propertyManagementRouter } from "./routers/propertyManagement";
import { systemJobsRouter } from "./routers/system-jobs";
import { meetingsRouter } from "./routers/meetings";
import { chatRouter } from "./routers/chat";
import { calendarSyncRouter } from "./routers/calendar-sync";
import { swotAnalysisRouter } from "./routers/swot-analysis";
import { performanceReviewsRouter } from "./routers/performance-reviews";
import { peerFeedbackRouter } from "./routers/peer-feedback";
import { leaderboardRouter } from "./routers/leaderboard";
import { achievementsRouter } from "./routers/achievements";
import { challengesRouter } from "./routers/challenges";
import { splitChangeRequestsRouter } from "./routers/split-change-requests";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  luv: luvSystemRouter,
  organization: organizationRouter,
  academy: academyRouter,
  simulators: simulatorsRouter,
  luvledger: luvledgerRouter,
  blockchain: blockchainRouter,
  autonomousEngine: autonomousEngineRouter,
  tokenEconomy: tokenEconomyRouter,
  curriculumGeneration: curriculumGenerationRouter,
  gamifiedSimulator: gamifiedSimulatorRouter,
  cryptoWallet: cryptoWalletRouter,
  offlineSync: offlineSyncRouter,
  luvLedgerTracking: luvLedgerTrackingRouter,
  auditTrailUI: auditTrailUIRouter,
  companySetup: companySetupRouter,
  trustAuthority: trustAuthorityRouter,
  entityCommercial: entityCommercialEngineRouter,
  entityEducation: entityEducationEngineRouter,
  entityMedia: entityMediaEngineRouter,
  entityPlatform: entityPlatformEngineRouter,
  documentVault: documentVaultRouter,
  notifications: notificationsRouter,
  agents: agentsRouter,
  socialMedia: socialMediaRouter,
  emailService: emailServiceRouter,
  contact: contactRouter,
  luvLedgerAssetManager: luvLedgerAssetManagerRouter,
  sovereignScrolls: sovereignScrollsRouter,
  foundationLayer: foundationLayerRouter,
  luvledgerAutomation: luvledgerAutomationRouter,
  tokenChain: tokenChainRouter,
  giftingSystem: giftingSystemRouter,
  houseActivation: houseActivationRouter,
  crownCompletion: crownCompletionRouter,
  guardianCredentials: guardianCredentialsRouter,
  houseLedger: houseLedgerRouter,
  realEstate: realEstateRouter,
  houseVault: houseVaultRouter,
  payroll: payrollRouter,
  taxPrep: taxPrepRouter,
  restoration: restorationRouter,
  documents: documentGenerationRouter,
  lifecycleManager: lifecycleManagerRouter,
  communityFunds: communityFundsRouter,
  heirDistribution: heirDistributionRouter,
  houseDashboard: houseDashboardRouter,
  ownerHouseSetup: ownerHouseSetupRouter,
  positionManagement: positionManagementRouter,
  b2bContracting: b2bContractingRouter,
  employeeTransition: employeeTransitionRouter,
  interCompany: interCompanyRouter,
  businessFormation: businessFormationRouter,
  bankingCredit: bankingCreditRouter,
  digitalSignatures: digitalSignaturesRouter,
  electronicSignature: electronicSignatureRouter,
  exchangeRates: exchangeRatesRouter,
  grantManagement: grantManagementRouter,
  businessPlan: businessPlanRouter,
  businessPlanParser: businessPlanParserRouter,
  training: trainingRouter,
  jobApplications: jobApplicationsRouter,
  employees: employeesRouter,
  onboarding: onboardingRouter,
  procedures: proceduresRouter,
  projectControls: projectControlsRouter,
  requisitions: requisitionsRouter,
  contractorTransition: contractorTransitionRouter,
  workforceDevelopment: workforceDevelopmentRouter,
  boardGovernance: boardGovernanceRouter,
  contractorNetwork: contractorNetworkRouter,
  trainingTransition: trainingTransitionRouter,
  contractorInvoices: contractorInvoicesRouter,
  contractManagement: contractManagementRouter,
  donations: donationsRouter,
  grantTracking: grantTrackingRouter,
  houseManagement: houseManagementRouter,
  financialStatements: financialStatementsRouter,
  boardResolutions: boardResolutionsRouter,
  contingencyOffers: contingencyOffersRouter,
  procurementCatalog: procurementCatalogRouter,
  employmentPolicies: employmentPoliciesRouter,
  companyCalendar: companyCalendarRouter,
  eSignature: eSignatureRouter,
  boardGovernanceExtended: boardGovernanceExtendedRouter,
  grantDocuments: grantDocumentsRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  offerPackages: offerPackagesRouter,
  specialistTracks: specialistTracksRouter,
  scholarships: scholarshipsRouter,
  creativeEnterprise: creativeEnterpriseRouter,
  designDepartment: designDepartmentRouter,
  softwareLicenses: softwareLicensesRouter,
  onlineAcademy: onlineAcademyRouter,
  gameCenter: gameCenterRouter,
  purchaseRequests: purchaseRequestsRouter,
  taxModule: taxModuleRouter,
  simulatorProgress: simulatorProgressRouter,
  timekeeping: timekeepingRouter,
  dataExport: dataExportRouter,
  grantLaborReports: grantLaborReportsRouter,
  bankAccounts: bankAccountsRouter,
  ach: achRouter,
  propertyManagement: propertyManagementRouter,
  systemJobs: systemJobsRouter,
  meetings: meetingsRouter,
  chat: chatRouter,
  calendarSync: calendarSyncRouter,
  swotAnalysis: swotAnalysisRouter,
  performanceReviews: performanceReviewsRouter,
  peerFeedback: peerFeedbackRouter,
  leaderboard: leaderboardRouter,
  achievements: achievementsRouter,
  challenges: challengesRouter,
  splitChangeRequests: splitChangeRequestsRouter,

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
