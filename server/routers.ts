
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
