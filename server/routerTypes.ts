/**
 * Type-only exports for tRPC router.
 * This file is safe to import in client code without pulling in server runtime dependencies.
 * Do NOT import runtime modules here - only type definitions.
 */

import type { appRouter } from "./routers";

export type AppRouter = typeof appRouter;
