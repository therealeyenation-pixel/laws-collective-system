
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

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
