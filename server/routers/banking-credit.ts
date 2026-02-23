import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { houses } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// ============================================
// BANKING & CREDIT BUILDING ROUTER
// Business bank accounts, credit building, and financial infrastructure
// ============================================

// Bank account types for business
const ACCOUNT_TYPES = {
  operating: {
    name: "Operating Account",
    description: "Day-to-day business transactions",
    purpose: "Revenue deposits, expense payments, vendor payments",
    required: true,
    order: 1,
  },
  reserve: {
    name: "Reserve Account",
    description: "60% House internal split - long-term reserves",
    purpose: "Wealth accumulation, emergency fund, investment capital",
    required: true,
    order: 2,
  },
  tax_escrow: {
    name: "Tax Escrow Account",
    description: "Withholding deposits and tax payments",
    purpose: "Payroll taxes, quarterly estimates, annual tax payments",
    required: true,
    order: 3,
  },
  payroll: {
    name: "Payroll Account",
    description: "Employee salary payments",
    purpose: "W-2 employee payments, direct deposits",
    required: false,
    order: 4,
  },
  trust_treasury: {
    name: "Trust Treasury Account",
    description: "70% platform fee accumulation",
    purpose: "Platform fees from all House transactions",
    required: true,
    order: 5,
  },
};

// Credit building steps in proper sequence
const CREDIT_BUILDING_STEPS = [
  {
    id: 1,
    title: "Obtain EIN",
    description: "Get Employer Identification Number from IRS",
    category: "foundation",
    timeline: "Day 1",
    verification: "ein_letter",
    required: true,
  },
  {
    id: 2,
    title: "Open Business Bank Account",
    description: "Establish primary business checking account",
    category: "banking",
    timeline: "Week 1",
    verification: "bank_statement",
    required: true,
  },
  {
    id: 3,
    title: "Get D-U-N-S Number",
    description: "Apply for Dun & Bradstreet D-U-N-S Number",
    category: "credit_profile",
    timeline: "Week 1-2",
    verification: "duns_confirmation",
    required: true,
    notes: "Free at dnb.com, takes 30 days or pay for expedited",
  },
  {
    id: 4,
    title: "Establish Business Phone",
    description: "Get dedicated business phone line listed in 411",
    category: "foundation",
    timeline: "Week 2",
    verification: "phone_listing",
    required: true,
    notes: "Must be listed in directory for credit applications",
  },
  {
    id: 5,
    title: "Verify Business Address",
    description: "Establish verifiable business address",
    category: "foundation",
    timeline: "Week 2",
    verification: "utility_bill",
    required: true,
    notes: "PO Box not acceptable for most credit applications",
  },
  {
    id: 6,
    title: "Create Business Website",
    description: "Establish professional web presence",
    category: "foundation",
    timeline: "Week 2-3",
    verification: "website_url",
    required: false,
    notes: "Improves credibility for credit applications",
  },
  {
    id: 7,
    title: "Open Net-30 Account #1",
    description: "First trade credit account (e.g., Uline, Grainger)",
    category: "trade_credit",
    timeline: "Month 1",
    verification: "account_confirmation",
    required: true,
    vendors: ["Uline", "Grainger", "Quill", "Strategic Network Solutions"],
  },
  {
    id: 8,
    title: "Open Net-30 Account #2",
    description: "Second trade credit account",
    category: "trade_credit",
    timeline: "Month 1",
    verification: "account_confirmation",
    required: true,
  },
  {
    id: 9,
    title: "Open Net-30 Account #3",
    description: "Third trade credit account",
    category: "trade_credit",
    timeline: "Month 1-2",
    verification: "account_confirmation",
    required: true,
  },
  {
    id: 10,
    title: "Open Net-30 Account #4",
    description: "Fourth trade credit account",
    category: "trade_credit",
    timeline: "Month 2",
    verification: "account_confirmation",
    required: false,
  },
  {
    id: 11,
    title: "Open Net-30 Account #5",
    description: "Fifth trade credit account",
    category: "trade_credit",
    timeline: "Month 2",
    verification: "account_confirmation",
    required: false,
  },
  {
    id: 12,
    title: "Apply for Secured Business Credit Card",
    description: "First business credit card (secured)",
    category: "credit_cards",
    timeline: "Month 2-3",
    verification: "card_statement",
    required: true,
    notes: "Requires deposit, reports to business credit bureaus",
  },
  {
    id: 13,
    title: "Monitor Business Credit Reports",
    description: "Check D&B, Experian Business, Equifax Business",
    category: "monitoring",
    timeline: "Month 3+",
    verification: "credit_report",
    required: true,
  },
  {
    id: 14,
    title: "Apply for Business Line of Credit",
    description: "Establish revolving credit line",
    category: "credit_lines",
    timeline: "Month 6+",
    verification: "credit_agreement",
    required: false,
    notes: "Requires established credit history",
  },
  {
    id: 15,
    title: "Apply for Unsecured Business Credit Card",
    description: "Graduate to unsecured business credit",
    category: "credit_cards",
    timeline: "Month 6+",
    verification: "card_statement",
    required: false,
  },
  {
    id: 16,
    title: "Apply for SBA Loan (if needed)",
    description: "Small Business Administration financing",
    category: "loans",
    timeline: "Year 1+",
    verification: "loan_documents",
    required: false,
  },
];

// Recommended Net-30 vendors that report to business credit bureaus
const NET30_VENDORS = [
  { name: "Uline", website: "uline.com", category: "Shipping/Packaging", minOrder: 50, reportsTo: ["D&B", "Experian"] },
  { name: "Grainger", website: "grainger.com", category: "Industrial Supplies", minOrder: 0, reportsTo: ["D&B"] },
  { name: "Quill", website: "quill.com", category: "Office Supplies", minOrder: 0, reportsTo: ["D&B", "Experian"] },
  { name: "Strategic Network Solutions", website: "snscard.com", category: "Office Supplies", minOrder: 50, reportsTo: ["D&B", "Experian", "Equifax"] },
  { name: "Crown Office Supplies", website: "crownofficesupplies.com", category: "Office Supplies", minOrder: 99, reportsTo: ["D&B", "Experian", "Equifax"] },
  { name: "Summa Office Supplies", website: "summaofficesupplies.com", category: "Office Supplies", minOrder: 50, reportsTo: ["D&B", "Experian", "Equifax"] },
  { name: "Shirtsy", website: "shirtsy.com", category: "Apparel/Promo", minOrder: 99, reportsTo: ["D&B", "Experian", "Equifax"] },
  { name: "Creative Analytics", website: "creditstrongbusiness.com", category: "Credit Building", minOrder: 0, reportsTo: ["D&B", "Experian", "Equifax"] },
];

// In-memory storage
const bankAccounts: Map<string, any> = new Map();
const creditProfiles: Map<number, any> = new Map();
const creditBuildingTrackers: Map<string, any> = new Map();

export const bankingCreditRouter = router({
  /**
   * Get account types info
   */
  getAccountTypes: protectedProcedure.query(async () => {
    return Object.entries(ACCOUNT_TYPES).map(([key, value]) => ({
      type: key,
      ...value,
    }));
  }),

  /**
   * Add a bank account
   */
  addBankAccount: protectedProcedure
    .input(z.object({
      businessEntityId: z.number(),
      accountType: z.enum(["operating", "reserve", "tax_escrow", "payroll", "trust_treasury"]),
      bankName: z.string().min(1),
      accountNumber: z.string().min(4), // Last 4 digits only for security
      routingNumber: z.string().optional(),
      accountNickname: z.string().optional(),
      openedDate: z.string(),
      initialBalance: z.number().default(0),
      documentUrl: z.string().optional(), // Bank statement upload
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [userHouse] = await db.select().from(houses).where(eq(houses.ownerUserId, ctx.user.id)).limit(1);
      const houseId = userHouse?.id || 1;

      const accountId = `BANK-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      const account = {
        id: accountId,
        houseId,
        businessEntityId: input.businessEntityId,
        accountType: input.accountType,
        accountTypeInfo: ACCOUNT_TYPES[input.accountType],
        bankName: input.bankName,
        accountNumberLast4: input.accountNumber.slice(-4),
        routingNumber: input.routingNumber,
        accountNickname: input.accountNickname || ACCOUNT_TYPES[input.accountType].name,
        openedDate: input.openedDate,
        initialBalance: input.initialBalance,
        currentBalance: input.initialBalance,
        documentUrl: input.documentUrl,
        verified: !!input.documentUrl,
        status: "active",
        createdAt: new Date().toISOString(),
        createdBy: ctx.user.id,
        transactions: [],
      };

      bankAccounts.set(accountId, account);

      return {
        success: true,
        accountId,
        account,
      };
    }),

  /**
   * Get bank accounts for a business
   */
  getAccounts: protectedProcedure
    .input(z.object({ businessEntityId: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [userHouse] = await db.select().from(houses).where(eq(houses.ownerUserId, ctx.user.id)).limit(1);
      const houseId = userHouse?.id || 1;

      let accounts = Array.from(bankAccounts.values()).filter(a => a.houseId === houseId);
      
      if (input.businessEntityId) {
        accounts = accounts.filter(a => a.businessEntityId === input.businessEntityId);
      }

      return accounts.sort((a, b) => a.accountTypeInfo.order - b.accountTypeInfo.order);
    }),

  /**
   * Update account balance
   */
  updateBalance: protectedProcedure
    .input(z.object({
      accountId: z.string(),
      newBalance: z.number(),
      note: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const account = bankAccounts.get(input.accountId);
      if (!account) throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });

      const previousBalance = account.currentBalance;
      account.currentBalance = input.newBalance;
      account.lastUpdated = new Date().toISOString();
      account.lastUpdatedBy = ctx.user.id;

      // Record balance update
      account.transactions.push({
        type: "balance_update",
        previousBalance,
        newBalance: input.newBalance,
        note: input.note,
        timestamp: new Date().toISOString(),
        recordedBy: ctx.user.id,
      });

      return {
        success: true,
        previousBalance,
        newBalance: input.newBalance,
      };
    }),

  /**
   * Start credit building program
   */
  startCreditBuilding: protectedProcedure
    .input(z.object({
      businessEntityId: z.number(),
      businessName: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [userHouse] = await db.select().from(houses).where(eq(houses.ownerUserId, ctx.user.id)).limit(1);
      const houseId = userHouse?.id || 1;

      const trackerId = `CREDIT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      const steps = CREDIT_BUILDING_STEPS.map(step => ({
        ...step,
        status: "pending",
        completedAt: null,
        documentUrl: null,
        notes: step.notes || null,
      }));

      const tracker = {
        id: trackerId,
        houseId,
        businessEntityId: input.businessEntityId,
        businessName: input.businessName,
        steps,
        totalSteps: steps.length,
        requiredSteps: steps.filter(s => s.required).length,
        completedSteps: 0,
        completedRequiredSteps: 0,
        progress: 0,
        status: "in_progress",
        creditScores: {
          dnb_paydex: null,
          experian_intelliscore: null,
          equifax_business: null,
          lastUpdated: null,
        },
        startedAt: new Date().toISOString(),
        startedBy: ctx.user.id,
      };

      creditBuildingTrackers.set(trackerId, tracker);

      return {
        success: true,
        trackerId,
        tracker,
      };
    }),

  /**
   * Get credit building tracker
   */
  getCreditTracker: protectedProcedure
    .input(z.object({ trackerId: z.string() }))
    .query(async ({ input }) => {
      const tracker = creditBuildingTrackers.get(input.trackerId);
      if (!tracker) throw new TRPCError({ code: "NOT_FOUND", message: "Credit tracker not found" });
      return tracker;
    }),

  /**
   * Get all credit trackers for the house
   */
  getCreditTrackers: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const [userHouse] = await db.select().from(houses).where(eq(houses.ownerUserId, ctx.user.id)).limit(1);
    const houseId = userHouse?.id || 1;

    return Array.from(creditBuildingTrackers.values()).filter(t => t.houseId === houseId);
  }),

  /**
   * Complete a credit building step
   */
  completeCreditStep: protectedProcedure
    .input(z.object({
      trackerId: z.string(),
      stepId: z.number(),
      documentUrl: z.string().optional(),
      confirmationNumber: z.string().optional(),
      vendorName: z.string().optional(),
      creditLimit: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const tracker = creditBuildingTrackers.get(input.trackerId);
      if (!tracker) throw new TRPCError({ code: "NOT_FOUND", message: "Credit tracker not found" });

      const step = tracker.steps.find((s: any) => s.id === input.stepId);
      if (!step) throw new TRPCError({ code: "NOT_FOUND", message: "Step not found" });

      step.status = "completed";
      step.completedAt = new Date().toISOString();
      step.completedBy = ctx.user.id;
      step.documentUrl = input.documentUrl;
      step.confirmationNumber = input.confirmationNumber;
      step.vendorName = input.vendorName;
      step.creditLimit = input.creditLimit;
      if (input.notes) step.completionNotes = input.notes;

      // Update progress
      tracker.completedSteps = tracker.steps.filter((s: any) => s.status === "completed").length;
      tracker.completedRequiredSteps = tracker.steps.filter((s: any) => s.required && s.status === "completed").length;
      tracker.progress = Math.round((tracker.completedSteps / tracker.totalSteps) * 100);

      // Check if foundation complete (all required steps)
      const allRequiredComplete = tracker.steps.filter((s: any) => s.required).every((s: any) => s.status === "completed");
      if (allRequiredComplete) {
        tracker.status = "foundation_complete";
      }

      return {
        success: true,
        step,
        progress: tracker.progress,
        status: tracker.status,
      };
    }),

  /**
   * Update credit scores
   */
  updateCreditScores: protectedProcedure
    .input(z.object({
      trackerId: z.string(),
      dnb_paydex: z.number().min(0).max(100).optional(),
      experian_intelliscore: z.number().min(0).max(100).optional(),
      equifax_business: z.number().min(100).max(300).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const tracker = creditBuildingTrackers.get(input.trackerId);
      if (!tracker) throw new TRPCError({ code: "NOT_FOUND", message: "Credit tracker not found" });

      if (input.dnb_paydex !== undefined) tracker.creditScores.dnb_paydex = input.dnb_paydex;
      if (input.experian_intelliscore !== undefined) tracker.creditScores.experian_intelliscore = input.experian_intelliscore;
      if (input.equifax_business !== undefined) tracker.creditScores.equifax_business = input.equifax_business;
      tracker.creditScores.lastUpdated = new Date().toISOString();
      tracker.creditScores.updatedBy = ctx.user.id;

      return {
        success: true,
        creditScores: tracker.creditScores,
      };
    }),

  /**
   * Get recommended Net-30 vendors
   */
  getNet30Vendors: protectedProcedure.query(async () => {
    return NET30_VENDORS;
  }),

  /**
   * Add a vendor account
   */
  addVendorAccount: protectedProcedure
    .input(z.object({
      trackerId: z.string(),
      vendorName: z.string(),
      accountNumber: z.string().optional(),
      creditLimit: z.number(),
      terms: z.enum(["net_30", "net_60", "net_90"]),
      openedDate: z.string(),
      reportsTo: z.array(z.string()),
      documentUrl: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const tracker = creditBuildingTrackers.get(input.trackerId);
      if (!tracker) throw new TRPCError({ code: "NOT_FOUND", message: "Credit tracker not found" });

      if (!tracker.vendorAccounts) tracker.vendorAccounts = [];

      const vendorAccount = {
        id: `VENDOR-${Date.now()}`,
        vendorName: input.vendorName,
        accountNumber: input.accountNumber,
        creditLimit: input.creditLimit,
        terms: input.terms,
        openedDate: input.openedDate,
        reportsTo: input.reportsTo,
        documentUrl: input.documentUrl,
        status: "active",
        currentBalance: 0,
        addedAt: new Date().toISOString(),
        addedBy: ctx.user.id,
      };

      tracker.vendorAccounts.push(vendorAccount);

      return {
        success: true,
        vendorAccount,
      };
    }),

  /**
   * Add a credit card
   */
  addCreditCard: protectedProcedure
    .input(z.object({
      trackerId: z.string(),
      cardName: z.string(),
      issuer: z.string(),
      cardType: z.enum(["secured", "unsecured"]),
      creditLimit: z.number(),
      apr: z.number().optional(),
      annualFee: z.number().optional(),
      openedDate: z.string(),
      reportsTo: z.array(z.string()),
      documentUrl: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const tracker = creditBuildingTrackers.get(input.trackerId);
      if (!tracker) throw new TRPCError({ code: "NOT_FOUND", message: "Credit tracker not found" });

      if (!tracker.creditCards) tracker.creditCards = [];

      const creditCard = {
        id: `CARD-${Date.now()}`,
        cardName: input.cardName,
        issuer: input.issuer,
        cardType: input.cardType,
        creditLimit: input.creditLimit,
        apr: input.apr,
        annualFee: input.annualFee,
        openedDate: input.openedDate,
        reportsTo: input.reportsTo,
        documentUrl: input.documentUrl,
        status: "active",
        currentBalance: 0,
        addedAt: new Date().toISOString(),
        addedBy: ctx.user.id,
      };

      tracker.creditCards.push(creditCard);

      return {
        success: true,
        creditCard,
      };
    }),

  /**
   * Add a line of credit
   */
  addLineOfCredit: protectedProcedure
    .input(z.object({
      trackerId: z.string(),
      lenderName: z.string(),
      creditLimit: z.number(),
      interestRate: z.number(),
      termMonths: z.number().optional(),
      collateral: z.string().optional(),
      openedDate: z.string(),
      documentUrl: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const tracker = creditBuildingTrackers.get(input.trackerId);
      if (!tracker) throw new TRPCError({ code: "NOT_FOUND", message: "Credit tracker not found" });

      if (!tracker.linesOfCredit) tracker.linesOfCredit = [];

      const loc = {
        id: `LOC-${Date.now()}`,
        lenderName: input.lenderName,
        creditLimit: input.creditLimit,
        interestRate: input.interestRate,
        termMonths: input.termMonths,
        collateral: input.collateral,
        openedDate: input.openedDate,
        documentUrl: input.documentUrl,
        status: "active",
        currentBalance: 0,
        availableCredit: input.creditLimit,
        addedAt: new Date().toISOString(),
        addedBy: ctx.user.id,
      };

      tracker.linesOfCredit.push(loc);

      return {
        success: true,
        lineOfCredit: loc,
      };
    }),

  /**
   * Get banking & credit dashboard
   */
  getDashboard: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const [userHouse] = await db.select().from(houses).where(eq(houses.ownerUserId, ctx.user.id)).limit(1);
    const houseId = userHouse?.id || 1;

    const accounts = Array.from(bankAccounts.values()).filter(a => a.houseId === houseId);
    const creditTrackers = Array.from(creditBuildingTrackers.values()).filter(t => t.houseId === houseId);

    // Calculate totals
    const totalBankBalance = accounts.reduce((sum, a) => sum + a.currentBalance, 0);
    const operatingBalance = accounts.filter(a => a.accountType === "operating").reduce((sum, a) => sum + a.currentBalance, 0);
    const reserveBalance = accounts.filter(a => a.accountType === "reserve").reduce((sum, a) => sum + a.currentBalance, 0);
    const treasuryBalance = accounts.filter(a => a.accountType === "trust_treasury").reduce((sum, a) => sum + a.currentBalance, 0);

    // Credit summary
    const totalCreditLimit = creditTrackers.reduce((sum, t) => {
      const vendorLimit = (t.vendorAccounts || []).reduce((s: number, v: any) => s + v.creditLimit, 0);
      const cardLimit = (t.creditCards || []).reduce((s: number, c: any) => s + c.creditLimit, 0);
      const locLimit = (t.linesOfCredit || []).reduce((s: number, l: any) => s + l.creditLimit, 0);
      return sum + vendorLimit + cardLimit + locLimit;
    }, 0);

    return {
      banking: {
        totalAccounts: accounts.length,
        totalBalance: totalBankBalance,
        operatingBalance,
        reserveBalance,
        treasuryBalance,
        accountsByType: Object.keys(ACCOUNT_TYPES).map(type => ({
          type,
          name: ACCOUNT_TYPES[type as keyof typeof ACCOUNT_TYPES].name,
          count: accounts.filter(a => a.accountType === type).length,
          balance: accounts.filter(a => a.accountType === type).reduce((sum, a) => sum + a.currentBalance, 0),
        })),
      },
      credit: {
        activeTrackers: creditTrackers.length,
        totalCreditLimit,
        averageProgress: creditTrackers.length > 0 
          ? Math.round(creditTrackers.reduce((sum, t) => sum + t.progress, 0) / creditTrackers.length)
          : 0,
        trackers: creditTrackers.map(t => ({
          id: t.id,
          businessName: t.businessName,
          progress: t.progress,
          status: t.status,
          creditScores: t.creditScores,
          vendorAccountCount: (t.vendorAccounts || []).length,
          creditCardCount: (t.creditCards || []).length,
        })),
      },
      activationStatus: {
        hasBankAccount: accounts.some(a => a.accountType === "operating" && a.verified),
        hasCreditProfile: creditTrackers.some(t => t.completedRequiredSteps >= 3),
        hasTradeCredit: creditTrackers.some(t => (t.vendorAccounts || []).length >= 3),
        readyForActivation: accounts.some(a => a.accountType === "operating" && a.verified) && 
                           creditTrackers.some(t => t.completedRequiredSteps >= 3),
      },
    };
  }),

  /**
   * Get House activation banking requirements
   */
  getActivationRequirements: protectedProcedure
    .input(z.object({ businessEntityId: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [userHouse] = await db.select().from(houses).where(eq(houses.ownerUserId, ctx.user.id)).limit(1);
      const houseId = userHouse?.id || 1;

      let accounts = Array.from(bankAccounts.values()).filter(a => a.houseId === houseId);
      let creditTrackers = Array.from(creditBuildingTrackers.values()).filter(t => t.houseId === houseId);

      if (input.businessEntityId) {
        accounts = accounts.filter(a => a.businessEntityId === input.businessEntityId);
        creditTrackers = creditTrackers.filter(t => t.businessEntityId === input.businessEntityId);
      }

      const requirements = {
        operatingAccount: {
          required: true,
          met: accounts.some(a => a.accountType === "operating" && a.verified),
          description: "Verified business operating account",
        },
        einObtained: {
          required: true,
          met: creditTrackers.some(t => t.steps.find((s: any) => s.id === 1 && s.status === "completed")),
          description: "EIN obtained from IRS",
        },
        dunsNumber: {
          required: true,
          met: creditTrackers.some(t => t.steps.find((s: any) => s.id === 3 && s.status === "completed")),
          description: "D-U-N-S Number obtained",
        },
        businessPhone: {
          required: true,
          met: creditTrackers.some(t => t.steps.find((s: any) => s.id === 4 && s.status === "completed")),
          description: "Business phone listed in 411",
        },
        tradeCredit: {
          required: false,
          met: creditTrackers.some(t => (t.vendorAccounts || []).length >= 3),
          description: "At least 3 Net-30 vendor accounts (recommended)",
        },
      };

      const requiredMet = Object.values(requirements).filter(r => r.required && r.met).length;
      const requiredTotal = Object.values(requirements).filter(r => r.required).length;

      return {
        requirements,
        progress: Math.round((requiredMet / requiredTotal) * 100),
        canActivate: requiredMet === requiredTotal,
        missingRequired: Object.entries(requirements)
          .filter(([_, r]) => r.required && !r.met)
          .map(([key, r]) => ({ key, ...r })),
      };
    }),
});

export default bankingCreditRouter;
