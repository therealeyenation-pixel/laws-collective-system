import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import { 
  stockWatchlist, 
  stockAlerts, 
  stockPriceHistory,
  stockEvents 
} from "../../drizzle/schema";
import { eq, desc, asc, and, or, gte, lte, sql } from "drizzle-orm";

export const stockTickerRouter = router({
  // ============================================================================
  // WATCHLIST / PORTFOLIO
  // ============================================================================
  
  listWatchlist: publicProcedure
    .input(z.object({
      entityId: z.number().optional(),
      holdingsOnly: z.boolean().optional(),
      watchlistOnly: z.boolean().optional(),
    }).optional())
    .query(async ({ input }) => {
      const conditions = [];
      
      if (input?.entityId) {
        conditions.push(eq(stockWatchlist.entityId, input.entityId));
      }
      if (input?.holdingsOnly) {
        conditions.push(eq(stockWatchlist.isHolding, true));
      }
      if (input?.watchlistOnly) {
        conditions.push(eq(stockWatchlist.isHolding, false));
      }
      
      const items = await db
        .select()
        .from(stockWatchlist)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(stockWatchlist.isHolding), asc(stockWatchlist.symbol));
      
      // Calculate portfolio value and gains
      const portfolio = items.filter(i => i.isHolding);
      const totalValue = portfolio.reduce((sum, item) => {
        const shares = Number(item.shares) || 0;
        const price = Number(item.lastPrice) || 0;
        return sum + (shares * price);
      }, 0);
      
      const totalCost = portfolio.reduce((sum, item) => {
        const cost = Number(item.costBasis) || 0;
        return sum + cost;
      }, 0);
      
      const totalGain = totalValue - totalCost;
      const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
      
      return {
        items,
        summary: {
          totalValue,
          totalCost,
          totalGain,
          totalGainPercent,
          holdingsCount: portfolio.length,
          watchlistCount: items.length - portfolio.length,
        },
      };
    }),
  
  addToWatchlist: protectedProcedure
    .input(z.object({
      symbol: z.string().min(1).max(10).transform(s => s.toUpperCase()),
      companyName: z.string().min(1).max(255),
      exchange: z.string().max(50).optional(),
      entityId: z.number().optional(),
      isHolding: z.boolean().default(false),
      shares: z.number().optional(),
      costBasis: z.number().optional(),
      purchaseDate: z.date().optional(),
      sector: z.string().max(100).optional(),
      industry: z.string().max(100).optional(),
      notes: z.string().optional(),
      alertOnPriceChange: z.boolean().default(true),
      priceChangeThreshold: z.number().default(5),
      alertOnEarnings: z.boolean().default(true),
      alertOnDividends: z.boolean().default(true),
      alertOnFilings: z.boolean().default(true),
    }))
    .mutation(async ({ input, ctx }) => {
      const [result] = await db.insert(stockWatchlist).values({
        ...input,
        shares: input.shares?.toString(),
        costBasis: input.costBasis?.toString(),
        priceChangeThreshold: input.priceChangeThreshold.toString(),
        createdBy: ctx.user?.id,
      });
      
      return { id: result.insertId };
    }),
  
  updateWatchlistItem: protectedProcedure
    .input(z.object({
      id: z.number(),
      companyName: z.string().min(1).max(255).optional(),
      isHolding: z.boolean().optional(),
      shares: z.number().optional(),
      costBasis: z.number().optional(),
      purchaseDate: z.date().optional(),
      notes: z.string().optional(),
      alertOnPriceChange: z.boolean().optional(),
      priceChangeThreshold: z.number().optional(),
      alertOnEarnings: z.boolean().optional(),
      alertOnDividends: z.boolean().optional(),
      alertOnFilings: z.boolean().optional(),
      alertOnNews: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, shares, costBasis, priceChangeThreshold, ...rest } = input;
      
      const updateData: any = { ...rest, updatedAt: new Date() };
      if (shares !== undefined) updateData.shares = shares.toString();
      if (costBasis !== undefined) updateData.costBasis = costBasis.toString();
      if (priceChangeThreshold !== undefined) updateData.priceChangeThreshold = priceChangeThreshold.toString();
      
      await db
        .update(stockWatchlist)
        .set(updateData)
        .where(eq(stockWatchlist.id, id));
      
      return { success: true };
    }),
  
  removeFromWatchlist: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(stockWatchlist).where(eq(stockWatchlist.id, input.id));
      return { success: true };
    }),
  
  // ============================================================================
  // ALERTS
  // ============================================================================
  
  listAlerts: publicProcedure
    .input(z.object({
      symbol: z.string().optional(),
      alertType: z.enum([
        "price_up", "price_down", "earnings_upcoming", "earnings_released",
        "dividend_announced", "dividend_ex_date", "sec_filing",
        "analyst_upgrade", "analyst_downgrade", "insider_buy", "insider_sell",
        "news_major", "52_week_high", "52_week_low"
      ]).optional(),
      unreadOnly: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(50),
    }).optional())
    .query(async ({ input }) => {
      const conditions = [eq(stockAlerts.isDismissed, false)];
      
      if (input?.symbol) {
        conditions.push(eq(stockAlerts.symbol, input.symbol.toUpperCase()));
      }
      if (input?.alertType) {
        conditions.push(eq(stockAlerts.alertType, input.alertType));
      }
      if (input?.unreadOnly) {
        conditions.push(eq(stockAlerts.isRead, false));
      }
      
      const alerts = await db
        .select()
        .from(stockAlerts)
        .where(and(...conditions))
        .orderBy(desc(stockAlerts.createdAt))
        .limit(input?.limit || 50);
      
      return alerts;
    }),
  
  markAlertRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db
        .update(stockAlerts)
        .set({ isRead: true })
        .where(eq(stockAlerts.id, input.id));
      return { success: true };
    }),
  
  dismissAlert: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db
        .update(stockAlerts)
        .set({ isDismissed: true })
        .where(eq(stockAlerts.id, input.id));
      return { success: true };
    }),
  
  // ============================================================================
  // TICKER DISPLAY
  // ============================================================================
  
  getTickerData: publicProcedure
    .input(z.object({
      entityId: z.number().optional(),
      includeAlerts: z.boolean().default(true),
    }).optional())
    .query(async ({ input }) => {
      // Get portfolio holdings
      const conditions = [eq(stockWatchlist.isHolding, true)];
      if (input?.entityId) {
        conditions.push(eq(stockWatchlist.entityId, input.entityId));
      }
      
      const holdings = await db
        .select()
        .from(stockWatchlist)
        .where(and(...conditions))
        .orderBy(asc(stockWatchlist.symbol));
      
      // Get recent alerts if requested
      let alerts: any[] = [];
      if (input?.includeAlerts) {
        alerts = await db
          .select()
          .from(stockAlerts)
          .where(and(
            eq(stockAlerts.isDismissed, false),
            eq(stockAlerts.showInTicker, true)
          ))
          .orderBy(desc(stockAlerts.createdAt))
          .limit(10);
      }
      
      // Format for ticker display
      const tickerItems = holdings.map(h => ({
        symbol: h.symbol,
        companyName: h.companyName,
        price: Number(h.lastPrice) || 0,
        change: Number(h.dayChange) || 0,
        changePercent: Number(h.dayChangePercent) || 0,
        shares: Number(h.shares) || 0,
        value: (Number(h.shares) || 0) * (Number(h.lastPrice) || 0),
        costBasis: Number(h.costBasis) || 0,
        gain: ((Number(h.shares) || 0) * (Number(h.lastPrice) || 0)) - (Number(h.costBasis) || 0),
      }));
      
      return {
        holdings: tickerItems,
        alerts,
        lastUpdated: holdings[0]?.lastPriceUpdated || null,
      };
    }),
  
  // ============================================================================
  // EVENTS
  // ============================================================================
  
  listUpcomingEvents: publicProcedure
    .input(z.object({
      symbol: z.string().optional(),
      eventType: z.enum([
        "earnings", "dividend_ex_date", "dividend_pay_date",
        "split", "sec_filing", "shareholder_meeting", "analyst_day"
      ]).optional(),
      daysAhead: z.number().min(1).max(90).default(30),
    }).optional())
    .query(async ({ input }) => {
      const now = new Date();
      const futureDate = new Date(now.getTime() + (input?.daysAhead || 30) * 24 * 60 * 60 * 1000);
      
      const conditions = [
        gte(stockEvents.eventDate, now),
        lte(stockEvents.eventDate, futureDate),
      ];
      
      if (input?.symbol) {
        conditions.push(eq(stockEvents.symbol, input.symbol.toUpperCase()));
      }
      if (input?.eventType) {
        conditions.push(eq(stockEvents.eventType, input.eventType));
      }
      
      const events = await db
        .select()
        .from(stockEvents)
        .where(and(...conditions))
        .orderBy(asc(stockEvents.eventDate));
      
      return events;
    }),
  
  // ============================================================================
  // STATISTICS
  // ============================================================================
  
  getPortfolioStats: publicProcedure
    .input(z.object({ entityId: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const conditions = [eq(stockWatchlist.isHolding, true)];
      if (input?.entityId) {
        conditions.push(eq(stockWatchlist.entityId, input.entityId));
      }
      
      const holdings = await db
        .select()
        .from(stockWatchlist)
        .where(and(...conditions));
      
      // Calculate statistics
      const totalValue = holdings.reduce((sum, h) => {
        return sum + (Number(h.shares) || 0) * (Number(h.lastPrice) || 0);
      }, 0);
      
      const totalCost = holdings.reduce((sum, h) => sum + (Number(h.costBasis) || 0), 0);
      const totalGain = totalValue - totalCost;
      const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
      
      const dayChange = holdings.reduce((sum, h) => {
        return sum + (Number(h.shares) || 0) * (Number(h.dayChange) || 0);
      }, 0);
      
      const dayChangePercent = totalValue > 0 ? (dayChange / (totalValue - dayChange)) * 100 : 0;
      
      // Sector breakdown
      const bySector: Record<string, number> = {};
      holdings.forEach(h => {
        const sector = h.sector || "Unknown";
        const value = (Number(h.shares) || 0) * (Number(h.lastPrice) || 0);
        bySector[sector] = (bySector[sector] || 0) + value;
      });
      
      // Top gainers/losers
      const withGains = holdings.map(h => ({
        symbol: h.symbol,
        companyName: h.companyName,
        gainPercent: Number(h.dayChangePercent) || 0,
        value: (Number(h.shares) || 0) * (Number(h.lastPrice) || 0),
      }));
      
      const topGainers = [...withGains].sort((a, b) => b.gainPercent - a.gainPercent).slice(0, 5);
      const topLosers = [...withGains].sort((a, b) => a.gainPercent - b.gainPercent).slice(0, 5);
      
      // Unread alerts count
      const [alertCount] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(stockAlerts)
        .where(and(
          eq(stockAlerts.isRead, false),
          eq(stockAlerts.isDismissed, false)
        ));
      
      return {
        totalValue,
        totalCost,
        totalGain,
        totalGainPercent,
        dayChange,
        dayChangePercent,
        holdingsCount: holdings.length,
        bySector,
        topGainers,
        topLosers,
        unreadAlerts: alertCount?.count || 0,
      };
    }),
});

export type StockTickerRouter = typeof stockTickerRouter;
