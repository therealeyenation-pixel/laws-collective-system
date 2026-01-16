
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
import { botsRouter } from "./routers/bots";
import { socialMediaRouter } from "./routers/social-media";
import { emailServiceRouter } from "./routers/email-service";
import { contactRouter } from "./routers/contact";
import { luvLedgerAssetManagerRouter } from "./routers/luvledger-asset-manager";
import { sovereignScrollsRouter } from "./routers/sovereign-scrolls";
import { foundationLayerRouter } from "./routers/foundation-layer";
import { luvledgerAutomationRouter } from "./routers/luvledger-automation";

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
  bots: botsRouter,
  socialMedia: socialMediaRouter,
  emailService: emailServiceRouter,
  contact: contactRouter,
  luvLedgerAssetManager: luvLedgerAssetManagerRouter,
  sovereignScrolls: sovereignScrollsRouter,
  foundationLayer: foundationLayerRouter,
  luvledgerAutomation: luvledgerAutomationRouter,
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
