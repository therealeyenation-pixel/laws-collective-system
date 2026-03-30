import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

/**
 * Phase 34: Investment Dashboard, Simulator & Global Market Intelligence
 * 
 * Comprehensive system combining:
 * 1. Investment Dashboard - Unified portfolio view with tickets and market monitoring
 * 2. Interactive Simulator - Virtual trading with strategy testing
 * 3. Global Market Intelligence - Real-time international market data
 * 
 * All systems share consistent functionality and intuitive UI patterns
 */

// ============================================================================
// MARKET DATA TYPES
// ============================================================================

type MarketType = "stocks" | "crypto" | "commodities" | "forex" | "etf";
type Region = "us" | "europe" | "asia" | "emerging" | "international";

interface MarketInstrument {
  id: string;
  symbol: string;
  name: string;
  type: MarketType;
  region: Region;
  currentPrice: number;
  priceChange24h: number;
  percentChange24h: number;
  high52w: number;
  low52w: number;
  marketCap?: number;
  volume24h: number;
  lastUpdated: Date;
}

interface PortfolioPosition {
  id: string;
  symbol: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
  type: MarketType;
}

interface Ticket {
  id: string;
  userId: number;
  title: string;
  description: string;
  type: "buy" | "sell" | "alert" | "research" | "analysis";
  status: "open" | "in-progress" | "completed" | "archived";
  priority: "low" | "medium" | "high" | "urgent";
  symbol?: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
}

interface SimulatorTrade {
  id: string;
  userId: number;
  symbol: string;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  totalValue: number;
  timestamp: Date;
  strategy?: string;
  notes?: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const marketInstruments: Record<string, MarketInstrument> = {
  "AAPL": {
    id: "aapl-us",
    symbol: "AAPL",
    name: "Apple Inc.",
    type: "stocks",
    region: "us",
    currentPrice: 195.45,
    priceChange24h: 2.15,
    percentChange24h: 1.11,
    high52w: 199.62,
    low52w: 124.17,
    marketCap: 3050000000000,
    volume24h: 52300000,
    lastUpdated: new Date(),
  },
  "MSFT": {
    id: "msft-us",
    symbol: "MSFT",
    name: "Microsoft Corporation",
    type: "stocks",
    region: "us",
    currentPrice: 428.65,
    priceChange24h: 5.32,
    percentChange24h: 1.26,
    high52w: 445.99,
    low52w: 213.04,
    marketCap: 3200000000000,
    volume24h: 18900000,
    lastUpdated: new Date(),
  },
  "BTC": {
    id: "btc-crypto",
    symbol: "BTC",
    name: "Bitcoin",
    type: "crypto",
    region: "international",
    currentPrice: 68450.50,
    priceChange24h: 1250.75,
    percentChange24h: 1.86,
    high52w: 73750.00,
    low52w: 16550.00,
    volume24h: 28500000000,
    lastUpdated: new Date(),
  },
  "ETH": {
    id: "eth-crypto",
    symbol: "ETH",
    name: "Ethereum",
    type: "crypto",
    region: "international",
    currentPrice: 3850.25,
    priceChange24h: 125.50,
    percentChange24h: 3.37,
    high52w: 4891.70,
    low52w: 883.00,
    volume24h: 15200000000,
    lastUpdated: new Date(),
  },
  "GLD": {
    id: "gld-commodity",
    symbol: "GLD",
    name: "Gold ETF",
    type: "commodities",
    region: "international",
    currentPrice: 185.32,
    priceChange24h: 2.15,
    percentChange24h: 1.17,
    high52w: 220.50,
    low52w: 155.20,
    volume24h: 8500000,
    lastUpdated: new Date(),
  },
  "EURUSD": {
    id: "eurusd-forex",
    symbol: "EURUSD",
    name: "Euro/US Dollar",
    type: "forex",
    region: "international",
    currentPrice: 1.0875,
    priceChange24h: 0.0025,
    percentChange24h: 0.23,
    high52w: 1.1275,
    low52w: 0.9535,
    volume24h: 450000000000,
    lastUpdated: new Date(),
  },
  "GBPJPY": {
    id: "gbpjpy-forex",
    symbol: "GBPJPY",
    name: "British Pound/Japanese Yen",
    type: "forex",
    region: "international",
    currentPrice: 189.45,
    priceChange24h: 1.25,
    percentChange24h: 0.66,
    high52w: 205.80,
    low52w: 155.20,
    volume24h: 125000000000,
    lastUpdated: new Date(),
  },
  "SAP": {
    id: "sap-europe",
    symbol: "SAP",
    name: "SAP SE",
    type: "stocks",
    region: "europe",
    currentPrice: 185.50,
    priceChange24h: 3.25,
    percentChange24h: 1.78,
    high52w: 210.30,
    low52w: 105.40,
    marketCap: 215000000000,
    volume24h: 2500000,
    lastUpdated: new Date(),
  },
  "TATA": {
    id: "tata-asia",
    symbol: "TATA",
    name: "Tata Consultancy Services",
    type: "stocks",
    region: "asia",
    currentPrice: 3850.75,
    priceChange24h: 125.50,
    percentChange24h: 3.37,
    high52w: 4200.00,
    low52w: 2850.00,
    marketCap: 1250000000000,
    volume24h: 15000000,
    lastUpdated: new Date(),
  },
};

const userPortfolios: Record<number, PortfolioPosition[]> = {
  1: [
    {
      id: "pos-1",
      symbol: "AAPL",
      quantity: 50,
      averageCost: 150.25,
      currentPrice: 195.45,
      totalValue: 9772.50,
      gainLoss: 2260.00,
      gainLossPercent: 30.04,
      type: "stocks",
    },
    {
      id: "pos-2",
      symbol: "BTC",
      quantity: 0.5,
      averageCost: 45000.00,
      currentPrice: 68450.50,
      totalValue: 34225.25,
      gainLoss: 11725.25,
      gainLossPercent: 52.06,
      type: "crypto",
    },
  ],
};

const userTickets: Record<number, Ticket[]> = {
  1: [
    {
      id: "ticket-1",
      userId: 1,
      title: "Research emerging markets",
      description: "Analyze Asian tech stocks for portfolio diversification",
      type: "research",
      status: "in-progress",
      priority: "high",
      symbol: "TATA",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      id: "ticket-2",
      userId: 1,
      title: "Monitor Bitcoin resistance",
      description: "Watch BTC for breakout above $70,000",
      type: "alert",
      status: "open",
      priority: "medium",
      symbol: "BTC",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
  ],
};

const simulatorAccounts: Record<number, { balance: number; startingBalance: number; trades: SimulatorTrade[] }> = {
  1: {
    balance: 95000.00,
    startingBalance: 100000.00,
    trades: [
      {
        id: "trade-1",
        userId: 1,
        symbol: "AAPL",
        type: "buy",
        quantity: 10,
        price: 190.50,
        totalValue: 1905.00,
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        strategy: "momentum",
        notes: "Breakout above 190",
      },
      {
        id: "trade-2",
        userId: 1,
        symbol: "ETH",
        type: "buy",
        quantity: 5,
        price: 3200.00,
        totalValue: 16000.00,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        strategy: "dca",
        notes: "Dollar cost averaging",
      },
    ],
  },
};

// ============================================================================
// INVESTMENT DASHBOARD & TICKET SYSTEM
// ============================================================================

export const investmentDashboardSimulatorRouter = router({
  // ========== DASHBOARD PROCEDURES ==========

  /**
   * Get comprehensive investment dashboard
   */
  getInvestmentDashboard: protectedProcedure.query(async ({ ctx }) => {
    const portfolio = userPortfolios[ctx.user.id] || [];
    const tickets = userTickets[ctx.user.id] || [];

    const totalPortfolioValue = portfolio.reduce((sum, pos) => sum + pos.totalValue, 0);
    const totalGainLoss = portfolio.reduce((sum, pos) => sum + pos.gainLoss, 0);
    const totalGainLossPercent = totalPortfolioValue > 0 ? (totalGainLoss / (totalPortfolioValue - totalGainLoss)) * 100 : 0;

    const openTickets = tickets.filter((t) => t.status === "open").length;
    const inProgressTickets = tickets.filter((t) => t.status === "in-progress").length;

    return {
      portfolio: {
        totalValue: totalPortfolioValue,
        gainLoss: totalGainLoss,
        gainLossPercent: totalGainLossPercent,
        positions: portfolio.length,
        diversification: {
          stocks: portfolio.filter((p) => p.type === "stocks").length,
          crypto: portfolio.filter((p) => p.type === "crypto").length,
          commodities: portfolio.filter((p) => p.type === "commodities").length,
          forex: portfolio.filter((p) => p.type === "forex").length,
        },
      },
      positions: portfolio,
      tickets: {
        total: tickets.length,
        open: openTickets,
        inProgress: inProgressTickets,
        completed: tickets.filter((t) => t.status === "completed").length,
        recentTickets: tickets.slice(0, 5),
      },
      watchlist: [],
      alerts: [],
      performance: {
        dayChange: totalGainLoss * 0.02, // Mock daily change
        weekChange: totalGainLoss * 0.15,
        monthChange: totalGainLoss,
      },
    };
  }),

  /**
   * Get portfolio positions with detailed analysis
   */
  getPortfolioPositions: protectedProcedure.query(async ({ ctx }) => {
    const portfolio = userPortfolios[ctx.user.id] || [];

    return {
      positions: portfolio,
      summary: {
        totalPositions: portfolio.length,
        totalValue: portfolio.reduce((sum, p) => sum + p.totalValue, 0),
        totalGainLoss: portfolio.reduce((sum, p) => sum + p.gainLoss, 0),
        bestPerformer: portfolio.length > 0 ? portfolio.reduce((best, p) => (p.gainLossPercent > best.gainLossPercent ? p : best)) : null,
        worstPerformer: portfolio.length > 0 ? portfolio.reduce((worst, p) => (p.gainLossPercent < worst.gainLossPercent ? p : worst)) : null,
      },
    };
  }),

  /**
   * Create ticket for investment tracking
   */
  createTicket: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        type: z.enum(["buy", "sell", "alert", "research", "analysis"]),
        priority: z.enum(["low", "medium", "high", "urgent"]),
        symbol: z.string().optional(),
        dueDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const ticket: Ticket = {
        id: `ticket-${Date.now()}`,
        userId: ctx.user.id,
        title: input.title,
        description: input.description,
        type: input.type,
        status: "open",
        priority: input.priority,
        symbol: input.symbol,
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: input.dueDate,
      };

      if (!userTickets[ctx.user.id]) {
        userTickets[ctx.user.id] = [];
      }
      userTickets[ctx.user.id].push(ticket);

      return ticket;
    }),

  /**
   * Get all user tickets
   */
  getTickets: protectedProcedure
    .input(
      z.object({
        status: z.enum(["open", "in-progress", "completed", "archived"]).optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        type: z.enum(["buy", "sell", "alert", "research", "analysis"]).optional(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      let tickets = userTickets[ctx.user.id] || [];

      if (input.status) {
        tickets = tickets.filter((t) => t.status === input.status);
      }
      if (input.priority) {
        tickets = tickets.filter((t) => t.priority === input.priority);
      }
      if (input.type) {
        tickets = tickets.filter((t) => t.type === input.type);
      }

      return {
        tickets: tickets.slice(0, input.limit),
        total: tickets.length,
      };
    }),

  /**
   * Update ticket status
   */
  updateTicketStatus: protectedProcedure
    .input(
      z.object({
        ticketId: z.string(),
        status: z.enum(["open", "in-progress", "completed", "archived"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const tickets = userTickets[ctx.user.id];
      if (!tickets) {
        return { error: "No tickets found" };
      }

      const ticket = tickets.find((t) => t.id === input.ticketId);
      if (!ticket) {
        return { error: "Ticket not found" };
      }

      ticket.status = input.status;
      ticket.updatedAt = new Date();

      return { success: true, ticket };
    }),

  // ========== SIMULATOR PROCEDURES ==========

  /**
   * Get simulator account details
   */
  getSimulatorAccount: protectedProcedure.query(async ({ ctx }) => {
    const account = simulatorAccounts[ctx.user.id] || {
      balance: 100000.00,
      startingBalance: 100000.00,
      trades: [],
    };

    const totalTradeValue = account.trades.reduce((sum, t) => sum + t.totalValue, 0);
    const profitLoss = account.balance - account.startingBalance;
    const profitLossPercent = (profitLoss / account.startingBalance) * 100;

    return {
      balance: account.balance,
      startingBalance: account.startingBalance,
      profitLoss,
      profitLossPercent,
      totalTrades: account.trades.length,
      totalInvested: totalTradeValue,
      buyTrades: account.trades.filter((t) => t.type === "buy").length,
      sellTrades: account.trades.filter((t) => t.type === "sell").length,
    };
  }),

  /**
   * Execute simulator trade
   */
  executeSimulatorTrade: protectedProcedure
    .input(
      z.object({
        symbol: z.string(),
        type: z.enum(["buy", "sell"]),
        quantity: z.number().positive(),
        price: z.number().positive(),
        strategy: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!simulatorAccounts[ctx.user.id]) {
        simulatorAccounts[ctx.user.id] = {
          balance: 100000.00,
          startingBalance: 100000.00,
          trades: [],
        };
      }

      const account = simulatorAccounts[ctx.user.id];
      const totalValue = input.quantity * input.price;

      if (input.type === "buy" && account.balance < totalValue) {
        return { error: "Insufficient balance" };
      }

      const trade: SimulatorTrade = {
        id: `trade-${Date.now()}`,
        userId: ctx.user.id,
        symbol: input.symbol,
        type: input.type,
        quantity: input.quantity,
        price: input.price,
        totalValue,
        timestamp: new Date(),
        strategy: input.strategy,
        notes: input.notes,
      };

      account.trades.push(trade);

      if (input.type === "buy") {
        account.balance -= totalValue;
      } else {
        account.balance += totalValue;
      }

      return {
        success: true,
        trade,
        newBalance: account.balance,
      };
    }),

  /**
   * Get simulator trade history
   */
  getSimulatorTradeHistory: protectedProcedure
    .input(
      z.object({
        symbol: z.string().optional(),
        type: z.enum(["buy", "sell"]).optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const account = simulatorAccounts[ctx.user.id];
      if (!account) {
        return { trades: [], total: 0 };
      }

      let trades = account.trades;

      if (input.symbol) {
        trades = trades.filter((t) => t.symbol === input.symbol);
      }
      if (input.type) {
        trades = trades.filter((t) => t.type === input.type);
      }

      return {
        trades: trades.slice(0, input.limit),
        total: trades.length,
      };
    }),

  /**
   * Get simulator performance analytics
   */
  getSimulatorAnalytics: protectedProcedure.query(async ({ ctx }) => {
    const account = simulatorAccounts[ctx.user.id];
    if (!account) {
      return { error: "No simulator account found" };
    }

    const buyTrades = account.trades.filter((t) => t.type === "buy");
    const sellTrades = account.trades.filter((t) => t.type === "sell");

    const averageBuyPrice = buyTrades.length > 0 ? buyTrades.reduce((sum, t) => sum + t.price, 0) / buyTrades.length : 0;
    const averageSellPrice = sellTrades.length > 0 ? sellTrades.reduce((sum, t) => sum + t.price, 0) / sellTrades.length : 0;

    return {
      totalTrades: account.trades.length,
      winRate: sellTrades.length > 0 ? (sellTrades.filter((t) => t.price > averageBuyPrice).length / sellTrades.length) * 100 : 0,
      averageBuyPrice,
      averageSellPrice,
      bestTrade: account.trades.length > 0 ? account.trades.reduce((best, t) => (t.totalValue > best.totalValue ? t : best)) : null,
      profitLoss: account.balance - account.startingBalance,
      profitLossPercent: ((account.balance - account.startingBalance) / account.startingBalance) * 100,
      strategies: [...new Set(account.trades.filter((t) => t.strategy).map((t) => t.strategy))],
    };
  }),

  // ========== GLOBAL MARKET INTELLIGENCE ==========

  /**
   * Get market instruments by type and region
   */
  getMarketInstruments: publicProcedure
    .input(
      z.object({
        type: z.enum(["stocks", "crypto", "commodities", "forex", "etf"]).optional(),
        region: z.enum(["us", "europe", "asia", "emerging", "international"]).optional(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      let instruments = Object.values(marketInstruments);

      if (input.type) {
        instruments = instruments.filter((i) => i.type === input.type);
      }
      if (input.region) {
        instruments = instruments.filter((i) => i.region === input.region);
      }

      return {
        instruments: instruments.slice(0, input.limit),
        total: instruments.length,
      };
    }),

  /**
   * Get specific instrument details
   */
  getInstrumentDetails: publicProcedure
    .input(z.object({ symbol: z.string() }))
    .query(async ({ input }) => {
      const instrument = marketInstruments[input.symbol];
      if (!instrument) {
        return { error: "Instrument not found" };
      }

      return {
        instrument,
        technicals: {
          rsi: Math.random() * 100,
          macd: Math.random() * 10 - 5,
          movingAverage50: instrument.currentPrice * 0.98,
          movingAverage200: instrument.currentPrice * 0.95,
        },
        fundamentals:
          instrument.type === "stocks"
            ? {
                peRatio: 25.5,
                dividendYield: 1.5,
                eps: 6.05,
              }
            : null,
      };
    }),

  /**
   * Search markets globally
   */
  searchMarkets: publicProcedure
    .input(
      z.object({
        query: z.string(),
        type: z.enum(["stocks", "crypto", "commodities", "forex", "etf"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const query = input.query.toUpperCase();
      let results = Object.values(marketInstruments).filter(
        (i) => i.symbol.includes(query) || i.name.toUpperCase().includes(query)
      );

      if (input.type) {
        results = results.filter((i) => i.type === input.type);
      }

      return {
        results,
        total: results.length,
      };
    }),

  /**
   * Get market overview by region
   */
  getMarketOverview: publicProcedure
    .input(z.object({ region: z.enum(["us", "europe", "asia", "emerging", "international"]) }))
    .query(async ({ input }) => {
      const regionInstruments = Object.values(marketInstruments).filter((i) => i.region === input.region);

      const topGainers = regionInstruments.sort((a, b) => b.percentChange24h - a.percentChange24h).slice(0, 5);
      const topLosers = regionInstruments.sort((a, b) => a.percentChange24h - b.percentChange24h).slice(0, 5);

      return {
        region: input.region,
        totalInstruments: regionInstruments.length,
        topGainers,
        topLosers,
        averageChange: regionInstruments.reduce((sum, i) => sum + i.percentChange24h, 0) / regionInstruments.length,
      };
    }),

  /**
   * Add instrument to watchlist
   */
  addToWatchlist: protectedProcedure
    .input(z.object({ symbol: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const instrument = marketInstruments[input.symbol];
      if (!instrument) {
        return { error: "Instrument not found" };
      }

      return {
        success: true,
        symbol: input.symbol,
        name: instrument.name,
        addedAt: new Date(),
      };
    }),

  /**
   * Get market alerts and news
   */
  getMarketAlerts: publicProcedure.query(async () => {
    return {
      alerts: [
        {
          id: "alert-1",
          type: "price_alert",
          title: "Bitcoin breaks $68,000",
          description: "BTC reached new daily high",
          symbol: "BTC",
          severity: "medium",
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        },
        {
          id: "alert-2",
          type: "market_news",
          title: "Fed signals rate hold",
          description: "Federal Reserve maintains interest rates",
          severity: "high",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          id: "alert-3",
          type: "earnings",
          title: "Apple earnings beat expectations",
          description: "AAPL reports strong Q4 results",
          symbol: "AAPL",
          severity: "medium",
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        },
      ],
    };
  }),

  /**
   * Get international market hours
   */
  getMarketHours: publicProcedure.query(async () => {
    return {
      markets: [
        {
          region: "us",
          name: "US Markets (NYSE, NASDAQ)",
          open: "09:30 EST",
          close: "16:00 EST",
          status: "open",
        },
        {
          region: "europe",
          name: "European Markets (LSE, Euronext)",
          open: "08:00 GMT",
          close: "16:30 GMT",
          status: "closed",
        },
        {
          region: "asia",
          name: "Asian Markets (TSE, SSE, HKE)",
          open: "09:00 JST",
          close: "15:00 JST",
          status: "closed",
        },
        {
          region: "international",
          name: "Crypto Markets",
          open: "24/7",
          close: "24/7",
          status: "open",
        },
      ],
    };
  }),
});
