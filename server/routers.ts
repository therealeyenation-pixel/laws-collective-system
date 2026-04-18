
import { getSessionCookieOptions } from "./_core/cookies";
import { COOKIE_NAME, ONE_YEAR_MS } from "../shared/const";
import { z } from "zod";
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
import { delegationRouter } from "./routers/delegation";
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
import { streamingEpgRouter } from "./routers/streaming-epg";
import { streamingRecommendationsRouter } from "./routers/streaming-recommendations";
import { streamingSharingRouter } from "./routers/streaming-sharing";
import { weatherApiRouter } from "./routers/weatherApi";
import aiRecommendationsRouter from "./routers/ai-recommendations";
import iptvTheaterRouter from "./routers/iptv-theater";
import { publicSeedRouter } from "./routers/public-seed";
import { streamingSeedRouter } from "./routers/streaming-seed";
import streamingDataSeedRouter from "./routers/streaming-data-seed";
import { streamingContentRouter } from "./routers/streaming-content";
import { streamingFavoritesRouter } from "./routers/streaming-favorites";

import { iptvLiveRouter } from "./routers/iptv-live";
import { brainAutomationRouter } from "./routers/brain-automation";
import { brainEmploymentAutomationRouter } from "./routers/brain-employment-automation";
import { portfolioIncomeRouter } from "./routers/portfolio-income";
import { portfolioManagementRouter } from "./routers/portfolio-management";
import { collectiveInvestmentPoolsRouter } from "./routers/collective-investment-pools";
import { communityFundsRouter } from "./routers/community-funds";
import { heirDistributionRouter } from "./routers/heir-distribution";
// weatherApiRouter already imported from ./routers/weatherApi
import { weatherAlertsRouter } from "./services/weather-alerts";
import { emailDigestRouter } from "./services/email-digest";
import { houseContractsRouter } from "./routers/house-contracts";
import { houseDashboardRouter } from "./routers/house-dashboard";
import { ownerHouseSetupRouter } from "./routers/owner-house-setup";
import { genesisHouseRouter } from "./routers/genesis-house";
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
import { broadcastRouter } from "./routers/broadcast";
import { contactSubmissionsRouter } from "./routers/contactSubmissions";
import { emergencyRouter } from "./routers/emergency";
import { conferenceRouter } from "./routers/conference";
import { mediaRouter } from "./routers/media";
import { stripeCheckoutRouter } from "./routers/stripeCheckout";
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
import { sandboxRouter } from "./routers/sandbox";
import { trademarkSearchRouter } from "./routers/trademark-search";
import { externalBusinessesRouter } from "./routers/external-businesses";
import { changelogRouter } from "./routers/changelog";
import { houseParticipationRouter } from "./routers/house-participation";
import { autoDiagnosticRouter } from "./routers/auto-diagnostic";
import { investorManagementRouter } from "./routers/investor-management";
import { houseDocumentsRouter } from "./routers/house-documents";
import { revenueFlowRouter } from "./routers/revenue-flow";
import { paymentsRouter } from "./routers/payments";
import { serviceBillingRouter } from "./routers/service-billing";
import { hybridServicesRouter } from "./routers/hybrid-services";
import { foundingMemberBonusRouter } from "./routers/founding-member-bonus";
import { donations508Router } from "./routers/donations-508";
import { workerProgressionRouter } from "./routers/worker-progression";
import { closedLoopWealthRouter } from "./routers/closed-loop-wealth";
import { lawsEmploymentRouter } from "./routers/laws-employment";
import { enhancedDonationsRouter } from "./routers/enhanced-donations";
import { stripeDonationsRouter } from "./routers/stripe-donations";
// brainAutomationRouter, brainEmploymentAutomationRouter, portfolioIncomeRouter, portfolioManagementRouter already imported above
import { donationAnalyticsRouter } from "./routers/donation-analytics";
import { trialRouter } from "./routers/trial";
import { contractsRouter } from "./routers/contracts";
import { trustGovernanceRouter } from "./routers/trust-governance";
import { resourceLinksRouter } from "./resource-links";
import { readAndSignRouter } from "./routers/read-and-sign";
import { governmentActionsRouter } from "./government-actions";
import { stockTickerRouter } from "./routers/stock-ticker";
import { officeSuiteRouter } from "./routers/office-suite";
import { employeeGamingRouter } from "./routers/employee-gaming";
import { onboardingJourneyRouter } from "./routers/onboarding-journey";
import { memberCredentialsRouter } from "./routers/member-credentials";
import { virtualLibraryRouter } from "./routers/virtual-library";
import { protectionLayerRouter } from "./routers/protection-layer-documents";
import { readingStreaksRouter } from "./routers/reading-streaks";
import { externalOnboardingRouter } from "./routers/external-onboarding";
import { landPropertyManagementRouter } from "./routers/land-property-management";
import { educationAcademyRouter } from "./routers/education-academy";
import { internshipProgramsRouter } from "./routers/internship-programs";
import { internshipTransitionRouter } from "./routers/internship-transition";
import { unifiedGovernanceRouter } from "./routers/unified-governance";
import { multiplayerRouter } from "./routers/multiplayer";
import { gameAchievementsRouter } from "./routers/game-achievements";
import { tournamentsRouter } from "./routers/tournaments";
import { gameSavesRouter } from "./routers/game-saves";
import { eloRatingRouter } from "./routers/elo-rating";
import { articleAcknowledgmentRouter } from "./routers/article-acknowledgment";
import { signatureAuditRouter } from "./routers/signature-audit";
import { userPreferencesRouter } from "./routers/user-preferences";
import { bulkSignatureRouter } from "./routers/bulk-signature";
import { complianceDashboardRouter } from "./routers/compliance-dashboard";
import { complianceTargetsRouter } from "./routers/compliance-targets";
import { complianceAlertsRouter } from "./routers/compliance-alerts";
import { certificateIssuanceRouter } from "./routers/certificate-issuance";
import { houseOfTonguesRouter } from "./routers/house-of-tongues";
import { learningHousesRouter } from "./routers/learning-houses";
import { masteryScrollsRouter } from "./routers/mastery-scrolls";
import { guardianDashboardRouter } from "./routers/guardian-dashboard";
import { eternalFlameVaultRouter } from "./routers/eternal-flame-vault";
import { businessSetupCourseRouter } from "./routers/business-setup-course";
import { financialManagementCourseRouter } from "./routers/financial-management-course";
import { simulatorCertificatesRouter } from "./routers/simulator-certificates";
import { tokenRegistryRouter } from "./routers/token-registry";
import { foundationLayerBuildRouter } from "./routers/foundation-layer-build";
import { coreAdminLayerRouter } from "./routers/core-admin-layer";
import { programsGovernanceLayerRouter } from "./routers/programs-governance-layer";
import { legalDocumentTemplatesRouter } from "./routers/legal-document-templates";
import { contractFundingTemplatesRouter } from "./routers/contract-funding-templates";
import { pdfLifecycleRouter } from "./routers/pdf-lifecycle";
import { internationalOperationsRouter } from "./routers/international-operations";
import { internationalDocumentTemplatesRouter } from "./routers/international-document-templates";
import { luvledgerAutoLoggingRouter } from "./routers/luvledger-auto-logging";
import { pdfGenerationRouter } from "./routers/pdf-generation";
import { donorEmailRouter } from "./routers/donor-email";
import { memberRegistrationRouter } from "./routers/member-registration";
import { acquisitionFundRouter } from "./routers/acquisition-fund";
import { realPropertyRouter } from "./routers/real-property";
import { expandedAssetManagementRouter } from "./routers/expanded-asset-management";
import { onboardingOffboardingRouter } from "./routers/onboarding-offboarding";
import { investmentPortfolioRouter } from "./routers/investment-portfolio";
import { investmentEducationRouter } from "./routers/investment-education";
import { employmentOpportunitiesRouter } from "./routers/employment-opportunities";
import { complianceRegulatoryRouter } from "./routers/compliance-regulatory";
import { investmentGovernanceRouter } from "./routers/investment-governance";
import { tieredGovernanceRouter } from "./routers/tiered-governance";
import { quarterlyInvestmentReportRouter } from "./routers/quarterly-investment-report";
import { complianceTrackingRouter } from "./routers/compliance-tracking";
import { documentUploadRouter } from "./routers/document-upload";
import { complianceNotificationsRouter } from "./routers/compliance-notifications";
import { notificationHistoryRouter } from "./routers/notification-history";
import { needStatementsRouter } from "./routers/need-statements";
import { grantExportRouter } from "./routers/grant-export";
import { grantDeadlinesRouter } from "./routers/grant-deadlines";
import { needStatementEditorRouter } from "./routers/need-statement-editor";
import { grantApplicationHistoryRouter } from "./routers/grant-application-history";
import { gameCenterCompleteRouter } from "./routers/game-center-complete";
import { articleSignatureRouter } from "./services/article-signature-service";
import { assignmentNotificationsRouter } from "./services/assignment-notifications";
import { foreignEntityFormsRouter } from "./services/foreign-entity-forms";
import { biometricCredentialsRouter } from "./routers/biometric-credentials";
import { workflowTemplatesRouter } from "./routers/workflow-templates";
import { translationContributionsRouter } from "./routers/translation-contributions";
import { sharedWorkflowTemplatesRouter } from "./routers/shared-workflow-templates";
import { adminUsersRouter } from "./routers/admin-users";
import { courseCheckoutRouter } from "./routers/course-checkout";
import { broadcastRadioRouter } from "./routers/broadcast-radio";
import { socketioRouter } from "./routers/socketio";
import { workflowExecutionRouter } from "./routers/workflow-execution";
import { landingAnalyticsRouter } from "./routers/landing-analytics";
import { waitlistRouter } from "./routers/waitlist";
import { onboardingAdminNotificationsRouter } from "./routers/onboarding-admin-notifications";
import { investmentDashboardSimulatorRouter } from "./routers/investment-dashboard-simulator";
import { phase35IntegrationRouter } from "./routers/phase-35-integration";
import { memberDashboardUIRouter } from "./routers/member-dashboard-ui";
import { adminAnalyticsDashboardRouter } from "./routers/admin-analytics-dashboard";
import { stripePaymentIntegrationRouter } from "./routers/stripe-payment-integration";
import { adminDashboardRouter } from "./routers/admin-dashboard";
import { emailCampaignAutomationRouter } from "./routers/email-campaign-automation";
import { emailCampaignDashboardRouter } from "./routers/email-campaign-dashboard";
import { smsNotificationSystemRouter } from "./routers/sms-notification-system";
import { mobileAppRouter } from "./routers/mobile-app";
import { roleBasedAccessControlRouter } from "./routers/role-based-access-control";
import { memberSegmentationEngineRouter } from "./routers/member-segmentation-engine";
import { webhookEventSystemRouter } from "./routers/webhook-event-system";
import { advancedAnalyticsDashboardRouter } from "./routers/advanced-analytics-dashboard";
import { apiDocumentationPortalRouter } from "./routers/api-documentation-portal";
import { dataExportReportingEngineRouter } from "./routers/data-export-reporting-engine";
import { developerPortalApiManagementRouter } from "./routers/developer-portal-api-management";
import { complianceAuditDashboardRouter } from "./routers/compliance-audit-dashboard";
import { memberCommunicationHubRouter } from "./routers/member-communication-hub";
import { advancedSegmentationRulesEngineRouter } from "./routers/advanced-segmentation-rules-engine";
import { financialReconciliationModuleRouter } from "./routers/financial-reconciliation-module";
import { realTimeNotificationsRouter } from "./routers/real-time-notifications";
import { exportSchedulingEngineRouter } from "./routers/export-scheduling-engine";
import { broadcastRadioModule } from "./routers/broadcast-radio-module";
import { vodRouter } from "./routers/vod";
// import { adminSeedRouter } from "./routers/admin-seed"; // Removed - use publicSeed instead
import { investmentManagementModule } from "./routers/investment-management-module";
import { investmentManagementRouter } from "./routers/investment-management";
import { realtimeDashboardUpdatesRouter } from "./routers/realtime-dashboard-updates";
import { mobileNativeFeaturesRouter } from "./routers/mobile-native-features";
import { advancedForecastingEngineRouter } from "./routers/advanced-forecasting-engine";
import { portfolioRebalancingRouter } from "./routers/portfolio-rebalancing";
import { watchlistAlertsRouter } from "./routers/watchlist-alerts";
import { taxOptimizationRouter } from "./routers/tax-optimization";
import { interactiveDashboardBuilderRouter } from "./routers/interactive-dashboard-builder";
import { aiInsightsAssistantRouter } from "./routers/ai-insights-assistant";
import { multiTenantAdminRouter } from "./routers/multi-tenant-admin";
import { realtimeDashboardSyncRouter } from "./routers/realtime-dashboard-sync";
import { customReportSchedulingRouter } from "./routers/custom-report-scheduling";
import { teamCollaborationFeaturesRouter } from "./routers/team-collaboration-features";
import { advancedFeaturesOptimizationRouter } from "./routers/advanced-features-optimization";
import { systemHealthRouter } from "./routers/system-health";
import { pushNotificationsRouter } from "./routers/push-notifications";
import { alertRulesRouter } from "./routers/alert-rules";
import { stripeEnhancementsRouter } from "./routers/stripe-enhancements";
import { advancedAnalyticsRouter } from "./routers/advanced-analytics";
import { automationRouter } from "./routers/automation";
import { monitoringIntegrationsRouter } from "./routers/monitoring-integrations";
import { realtimeCollaborationRouter } from "./routers/realtime-collaboration";
import { mobilePushRouter } from "./routers/mobile-push";
// workflowExecutionRouter already imported above
import { websocketSyncRouter } from "./routers/websocket-sync";
import { systemActivationRouter } from "./routers/system-activation";
import { departmentDashboardRouter } from "./routers/department-dashboard";
import { playlistsRouter } from "./routers/playlists";
import { globalTelecomRouter } from "./routers/global-telecom";
import { sponsorAnalytics } from "./routers/sponsor-analytics";
import { memberJourneyRouter } from "./routers/member-journey";
import { vaultSuccessionRouter } from "./routers/vault-succession";
import { lawsOnboardingRouter } from "./routers/laws-onboarding";
import { supportTicketsRouter } from "./routers/supportTickets";

export const appRouter = router({
  socketio: socketioRouter,
  workflowExecution: workflowExecutionRouter,
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  memberJourney: memberJourneyRouter,
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
  delegation: delegationRouter,
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
  houseContracts: houseContractsRouter,
  payroll: payrollRouter,
  taxPrep: taxPrepRouter,
  restoration: restorationRouter,
  documents: documentGenerationRouter,
  lifecycleManager: lifecycleManagerRouter,
  weatherApi: weatherApiRouter,
  aiRecommendations: aiRecommendationsRouter,
  iptvTheater: iptvLiveRouter,
  vod: vodRouter,
  publicSeed: publicSeedRouter,
  streamingSeed: streamingSeedRouter,
  streamingDataSeed: streamingDataSeedRouter,
  streamingContent: streamingContentRouter,
  streamingFavorites: streamingFavoritesRouter,
  streamingEpg: streamingEpgRouter,
  streamingRecommendations: streamingRecommendationsRouter,
  streamingSharing: streamingSharingRouter,
  communityFunds: communityFundsRouter,
  heirDistribution: heirDistributionRouter,
  weatherApi: weatherApiRouter,
  weatherAlerts: weatherAlertsRouter,
  emailDigest: emailDigestRouter,
  houseDashboard: houseDashboardRouter,
  ownerHouseSetup: ownerHouseSetupRouter,
  genesisHouse: genesisHouseRouter,
  vaultSuccession: vaultSuccessionRouter,
  lawsOnboarding: lawsOnboardingRouter,
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
  broadcast: broadcastRouter,
  contactSubmissions: contactSubmissionsRouter,
  emergency: emergencyRouter,
  conference: conferenceRouter,
  media: mediaRouter,
  stripeCheckout: stripeCheckoutRouter,
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
  programsGovernance: programsGovernanceLayerRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
      }))
      .mutation(async ({ input, ctx }) => {
        const { standaloneAuth } = await import("./_core/standaloneAuth");
        const user = await standaloneAuth.loginUser(input.email, input.password);
        const sessionToken = await standaloneAuth.createSessionToken(user.openId, {
          name: user.name || "",
          expiresInMs: ONE_YEAR_MS,
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        return { success: true, user };
      }),
    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { standaloneAuth } = await import("./_core/standaloneAuth");
        const user = await standaloneAuth.registerUser(input.email, input.password, input.name);
        const sessionToken = await standaloneAuth.createSessionToken(user.openId, {
          name: user.name || "",
          expiresInMs: ONE_YEAR_MS,
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        return { success: true, user };
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
  sandbox: sandboxRouter,
  trademarkSearch: trademarkSearchRouter,
  externalBusinesses: externalBusinessesRouter,
  changelog: changelogRouter,
  houseParticipation: houseParticipationRouter,
  autoDiagnostic: autoDiagnosticRouter,
  investorManagement: investorManagementRouter,
  houseDocuments: houseDocumentsRouter,
  revenueFlow: revenueFlowRouter,
  payments: paymentsRouter,
  serviceBilling: serviceBillingRouter,
  hybridServices: hybridServicesRouter,
  foundingMemberBonus: foundingMemberBonusRouter,
  donations508: donations508Router,
  workerProgression: workerProgressionRouter,
  closedLoopWealth: closedLoopWealthRouter,
  lawsEmployment: lawsEmploymentRouter,
  enhancedDonations: enhancedDonationsRouter,
  stripeDonations: stripeDonationsRouter,
  brainAutomation: brainAutomationRouter,
  brainEmploymentAutomation: brainEmploymentAutomationRouter,
  portfolioIncome: portfolioIncomeRouter,
  portfolioManagement: portfolioManagementRouter,
  collectiveInvestmentPools: collectiveInvestmentPoolsRouter,
  donationAnalytics: donationAnalyticsRouter,
  trial: trialRouter,
  contracts: contractsRouter,
  trustGovernance: trustGovernanceRouter,
  resourceLinks: resourceLinksRouter,
  readAndSign: readAndSignRouter,
  governmentActions: governmentActionsRouter,
  stockTicker: stockTickerRouter,
  officeSuite: officeSuiteRouter,
  employeeGaming: employeeGamingRouter,
  onboardingJourney: onboardingJourneyRouter,
  memberCredentials: memberCredentialsRouter,
  virtualLibrary: virtualLibraryRouter,
  protectionLayer: protectionLayerRouter,
  readingStreaks: readingStreaksRouter,
  externalOnboarding: externalOnboardingRouter,
  landPropertyManagement: landPropertyManagementRouter,
  educationAcademy: educationAcademyRouter,
  internshipPrograms: internshipProgramsRouter,
  internshipTransition: internshipTransitionRouter,
  unifiedGovernance: unifiedGovernanceRouter,
  multiplayer: multiplayerRouter,
  gameAchievements: gameAchievementsRouter,
  tournaments: tournamentsRouter,
  gameSaves: gameSavesRouter,
  eloRating: eloRatingRouter,
  articleAcknowledgment: articleAcknowledgmentRouter,
  signatureAudit: signatureAuditRouter,
  userPreferences: userPreferencesRouter,
  bulkSignature: bulkSignatureRouter,
  complianceDashboard: complianceDashboardRouter,
  complianceTargets: complianceTargetsRouter,
  complianceAlerts: complianceAlertsRouter,
  certificateIssuance: certificateIssuanceRouter,
  houseOfTongues: houseOfTonguesRouter,
  learningHouses: learningHousesRouter,
  masteryScrolls: masteryScrollsRouter,
  guardianDashboard: guardianDashboardRouter,
  eternalFlameVault: eternalFlameVaultRouter,
  businessSetupCourse: businessSetupCourseRouter,
  financialManagementCourse: financialManagementCourseRouter,
  simulatorCertificates: simulatorCertificatesRouter,
  tokenRegistry: tokenRegistryRouter,
  foundationLayerBuild: foundationLayerBuildRouter,
  coreAdminLayer: coreAdminLayerRouter,
  programsGovernanceLayer: programsGovernanceLayerRouter,
  legalDocumentTemplates: legalDocumentTemplatesRouter,
  contractFundingTemplates: contractFundingTemplatesRouter,
  pdfLifecycle: pdfLifecycleRouter,
  internationalOperations: internationalOperationsRouter,
  internationalDocumentTemplates: internationalDocumentTemplatesRouter,
  luvledgerAutoLogging: luvledgerAutoLoggingRouter,
  pdfGeneration: pdfGenerationRouter,
  donorEmail: donorEmailRouter,
  memberRegistration: memberRegistrationRouter,
  acquisitionFund: acquisitionFundRouter,
  realProperty: realPropertyRouter,
  expandedAssetManagement: expandedAssetManagementRouter,
  onboardingOffboarding: onboardingOffboardingRouter,
  investmentPortfolio: investmentPortfolioRouter,
  investmentGovernance: investmentGovernanceRouter,
  tieredGovernance: tieredGovernanceRouter,
  quarterlyInvestmentReport: quarterlyInvestmentReportRouter,
  complianceTracking: complianceTrackingRouter,
  documentUpload: documentUploadRouter,
  complianceNotifications: complianceNotificationsRouter,
  notificationHistory: notificationHistoryRouter,
  needStatements: needStatementsRouter,
  grantExport: grantExportRouter,
  grantDeadlines: grantDeadlinesRouter,
  needStatementEditor: needStatementEditorRouter,
  grantApplicationHistory: grantApplicationHistoryRouter,
  gameCenterComplete: gameCenterCompleteRouter,
  articleSignature: articleSignatureRouter,
  assignmentNotifications: assignmentNotificationsRouter,
  foreignEntityForms: foreignEntityFormsRouter,
  biometricCredentials: biometricCredentialsRouter,
  workflowTemplates: workflowTemplatesRouter,
  translationContributions: translationContributionsRouter,
  sharedWorkflowTemplates: sharedWorkflowTemplatesRouter,
  adminUsers: adminUsersRouter,
  courseCheckout: courseCheckoutRouter,
  broadcastRadio: broadcastRadioRouter,
   landingAnalytics: landingAnalyticsRouter,
  waitlist: waitlistRouter,
  investmentEducation: investmentEducationRouter,
  employmentOpportunities: employmentOpportunitiesRouter,
  complianceRegulatory: complianceRegulatoryRouter,
  onboardingAdminNotifications: onboardingAdminNotificationsRouter,
  investmentDashboardSimulator: investmentDashboardSimulatorRouter,
  phase35Integration: phase35IntegrationRouter,
  memberDashboardUI: memberDashboardUIRouter,
  adminAnalyticsDashboard: adminAnalyticsDashboardRouter,
  stripePaymentIntegration: stripePaymentIntegrationRouter,
  adminDashboard: adminDashboardRouter,
  emailCampaignAutomation: emailCampaignAutomationRouter,
  emailCampaignDashboard: emailCampaignDashboardRouter,
  smsNotificationSystem: smsNotificationSystemRouter,
  mobileApp: mobileAppRouter,
  roleBasedAccessControl: roleBasedAccessControlRouter,
  memberSegmentationEngine: memberSegmentationEngineRouter,
  webhookEventSystem: webhookEventSystemRouter,
  advancedAnalyticsDashboard: advancedAnalyticsDashboardRouter,
  apiDocumentationPortal: apiDocumentationPortalRouter,
  dataExportReportingEngine: dataExportReportingEngineRouter,
  developerPortalApiManagement: developerPortalApiManagementRouter,
  complianceAuditDashboard: complianceAuditDashboardRouter,
  memberCommunicationHub: memberCommunicationHubRouter,
  advancedSegmentationRulesEngine: advancedSegmentationRulesEngineRouter,
  financialReconciliationModule: financialReconciliationModuleRouter,
  realTimeNotifications: realTimeNotificationsRouter,
  exportScheduling: exportSchedulingEngineRouter,
  broadcastRadio: broadcastRadioModule,
  investmentManagement: investmentManagementModule,
  investmentMgmt: investmentManagementRouter,
  realtimeDashboardUpdates: realtimeDashboardUpdatesRouter,
  mobileNativeFeatures: mobileNativeFeaturesRouter,
  advancedForecasting: advancedForecastingEngineRouter,
  interactiveDashboardBuilder: interactiveDashboardBuilderRouter,
  aiInsightsAssistant: aiInsightsAssistantRouter,
  multiTenantAdmin: multiTenantAdminRouter,
  realtimeDashboardSync: realtimeDashboardSyncRouter,
  customReportScheduling: customReportSchedulingRouter,
  teamCollaborationFeatures: teamCollaborationFeaturesRouter,
  advancedFeaturesOptimization: advancedFeaturesOptimizationRouter,
  portfolioRebalancing: portfolioRebalancingRouter,
  watchlistAlerts: watchlistAlertsRouter,
  taxOptimization: taxOptimizationRouter,
  systemHealth: systemHealthRouter,
  pushNotifications: pushNotificationsRouter,
  alertRules: alertRulesRouter,
  stripeEnhancements: stripeEnhancementsRouter,
  advancedAnalytics: advancedAnalyticsRouter,
  automation: automationRouter,
  monitoringIntegrations: monitoringIntegrationsRouter,
  realtimeCollaboration: realtimeCollaborationRouter,
  mobilePush: mobilePushRouter,
  workflowExecution: workflowExecutionRouter,
  websocketSync: websocketSyncRouter,
  systemActivation: systemActivationRouter,
  departmentDashboard: departmentDashboardRouter,
  playlists: playlistsRouter,
  globalTelecom: globalTelecomRouter,
  sponsorAnalytics: sponsorAnalytics,
  supportTickets: supportTicketsRouter,
  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
