import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { houses, businessEntities } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// ============================================
// BUSINESS FORMATION VERIFICATION ROUTER
// State-specific filing checklists with document verification
// ============================================

// State filing information
const STATE_FILING_INFO: Record<string, {
  name: string;
  sosWebsite: string;
  eFilingAvailable: boolean;
  llcFilingFee: number;
  corpFilingFee: number;
  annualReportFee: number;
  processingTime: string;
}> = {
  AL: { name: "Alabama", sosWebsite: "sos.alabama.gov", eFilingAvailable: true, llcFilingFee: 200, corpFilingFee: 200, annualReportFee: 0, processingTime: "5-7 days" },
  AK: { name: "Alaska", sosWebsite: "commerce.alaska.gov", eFilingAvailable: true, llcFilingFee: 250, corpFilingFee: 250, annualReportFee: 100, processingTime: "10-15 days" },
  AZ: { name: "Arizona", sosWebsite: "azcc.gov", eFilingAvailable: true, llcFilingFee: 50, corpFilingFee: 60, annualReportFee: 0, processingTime: "5-10 days" },
  AR: { name: "Arkansas", sosWebsite: "sos.arkansas.gov", eFilingAvailable: true, llcFilingFee: 50, corpFilingFee: 50, annualReportFee: 150, processingTime: "3-5 days" },
  CA: { name: "California", sosWebsite: "bizfile.sos.ca.gov", eFilingAvailable: true, llcFilingFee: 70, corpFilingFee: 100, annualReportFee: 800, processingTime: "3-5 days" },
  CO: { name: "Colorado", sosWebsite: "sos.state.co.us", eFilingAvailable: true, llcFilingFee: 50, corpFilingFee: 50, annualReportFee: 10, processingTime: "1-3 days" },
  CT: { name: "Connecticut", sosWebsite: "portal.ct.gov/sots", eFilingAvailable: true, llcFilingFee: 120, corpFilingFee: 250, annualReportFee: 80, processingTime: "3-5 days" },
  DE: { name: "Delaware", sosWebsite: "corp.delaware.gov", eFilingAvailable: true, llcFilingFee: 90, corpFilingFee: 89, annualReportFee: 300, processingTime: "Same day" },
  FL: { name: "Florida", sosWebsite: "sunbiz.org", eFilingAvailable: true, llcFilingFee: 125, corpFilingFee: 70, annualReportFee: 138.75, processingTime: "2-3 days" },
  GA: { name: "Georgia", sosWebsite: "sos.ga.gov", eFilingAvailable: true, llcFilingFee: 100, corpFilingFee: 100, annualReportFee: 50, processingTime: "7-10 days" },
  HI: { name: "Hawaii", sosWebsite: "cca.hawaii.gov", eFilingAvailable: true, llcFilingFee: 50, corpFilingFee: 50, annualReportFee: 15, processingTime: "5-7 days" },
  ID: { name: "Idaho", sosWebsite: "sos.idaho.gov", eFilingAvailable: true, llcFilingFee: 100, corpFilingFee: 100, annualReportFee: 0, processingTime: "5-7 days" },
  IL: { name: "Illinois", sosWebsite: "ilsos.gov", eFilingAvailable: true, llcFilingFee: 150, corpFilingFee: 150, annualReportFee: 75, processingTime: "5-10 days" },
  IN: { name: "Indiana", sosWebsite: "inbiz.in.gov", eFilingAvailable: true, llcFilingFee: 95, corpFilingFee: 95, annualReportFee: 31, processingTime: "1-2 days" },
  IA: { name: "Iowa", sosWebsite: "sos.iowa.gov", eFilingAvailable: true, llcFilingFee: 50, corpFilingFee: 50, annualReportFee: 60, processingTime: "5-7 days" },
  KS: { name: "Kansas", sosWebsite: "sos.ks.gov", eFilingAvailable: true, llcFilingFee: 165, corpFilingFee: 90, annualReportFee: 55, processingTime: "3-5 days" },
  KY: { name: "Kentucky", sosWebsite: "sos.ky.gov", eFilingAvailable: true, llcFilingFee: 40, corpFilingFee: 40, annualReportFee: 15, processingTime: "3-5 days" },
  LA: { name: "Louisiana", sosWebsite: "sos.la.gov", eFilingAvailable: true, llcFilingFee: 100, corpFilingFee: 75, annualReportFee: 35, processingTime: "5-7 days" },
  ME: { name: "Maine", sosWebsite: "maine.gov/sos", eFilingAvailable: true, llcFilingFee: 175, corpFilingFee: 145, annualReportFee: 85, processingTime: "5-7 days" },
  MD: { name: "Maryland", sosWebsite: "egov.maryland.gov/businessexpress", eFilingAvailable: true, llcFilingFee: 100, corpFilingFee: 100, annualReportFee: 300, processingTime: "7-10 days" },
  MA: { name: "Massachusetts", sosWebsite: "sec.state.ma.us", eFilingAvailable: true, llcFilingFee: 500, corpFilingFee: 275, annualReportFee: 500, processingTime: "5-7 days" },
  MI: { name: "Michigan", sosWebsite: "michigan.gov/lara", eFilingAvailable: true, llcFilingFee: 50, corpFilingFee: 60, annualReportFee: 25, processingTime: "3-5 days" },
  MN: { name: "Minnesota", sosWebsite: "sos.state.mn.us", eFilingAvailable: true, llcFilingFee: 155, corpFilingFee: 155, annualReportFee: 0, processingTime: "5-7 days" },
  MS: { name: "Mississippi", sosWebsite: "sos.ms.gov", eFilingAvailable: true, llcFilingFee: 50, corpFilingFee: 50, annualReportFee: 0, processingTime: "3-5 days" },
  MO: { name: "Missouri", sosWebsite: "sos.mo.gov", eFilingAvailable: true, llcFilingFee: 50, corpFilingFee: 58, annualReportFee: 0, processingTime: "3-5 days" },
  MT: { name: "Montana", sosWebsite: "sosmt.gov", eFilingAvailable: true, llcFilingFee: 70, corpFilingFee: 70, annualReportFee: 20, processingTime: "3-5 days" },
  NE: { name: "Nebraska", sosWebsite: "sos.nebraska.gov", eFilingAvailable: true, llcFilingFee: 105, corpFilingFee: 65, annualReportFee: 26, processingTime: "3-5 days" },
  NV: { name: "Nevada", sosWebsite: "nvsos.gov", eFilingAvailable: true, llcFilingFee: 75, corpFilingFee: 75, annualReportFee: 350, processingTime: "1-2 days" },
  NH: { name: "New Hampshire", sosWebsite: "sos.nh.gov", eFilingAvailable: true, llcFilingFee: 100, corpFilingFee: 100, annualReportFee: 100, processingTime: "5-7 days" },
  NJ: { name: "New Jersey", sosWebsite: "njportal.com/dor/businessformation", eFilingAvailable: true, llcFilingFee: 125, corpFilingFee: 125, annualReportFee: 75, processingTime: "3-5 days" },
  NM: { name: "New Mexico", sosWebsite: "sos.state.nm.us", eFilingAvailable: true, llcFilingFee: 50, corpFilingFee: 100, annualReportFee: 0, processingTime: "5-7 days" },
  NY: { name: "New York", sosWebsite: "dos.ny.gov", eFilingAvailable: false, llcFilingFee: 200, corpFilingFee: 125, annualReportFee: 9, processingTime: "7-14 days" },
  NC: { name: "North Carolina", sosWebsite: "sosnc.gov", eFilingAvailable: true, llcFilingFee: 125, corpFilingFee: 125, annualReportFee: 200, processingTime: "3-5 days" },
  ND: { name: "North Dakota", sosWebsite: "sos.nd.gov", eFilingAvailable: true, llcFilingFee: 135, corpFilingFee: 100, annualReportFee: 50, processingTime: "5-7 days" },
  OH: { name: "Ohio", sosWebsite: "sos.state.oh.us", eFilingAvailable: true, llcFilingFee: 99, corpFilingFee: 99, annualReportFee: 0, processingTime: "3-5 days" },
  OK: { name: "Oklahoma", sosWebsite: "sos.ok.gov", eFilingAvailable: true, llcFilingFee: 100, corpFilingFee: 50, annualReportFee: 25, processingTime: "3-5 days" },
  OR: { name: "Oregon", sosWebsite: "sos.oregon.gov", eFilingAvailable: true, llcFilingFee: 100, corpFilingFee: 100, annualReportFee: 100, processingTime: "3-5 days" },
  PA: { name: "Pennsylvania", sosWebsite: "dos.pa.gov", eFilingAvailable: true, llcFilingFee: 125, corpFilingFee: 125, annualReportFee: 70, processingTime: "7-10 days" },
  RI: { name: "Rhode Island", sosWebsite: "sos.ri.gov", eFilingAvailable: true, llcFilingFee: 150, corpFilingFee: 230, annualReportFee: 50, processingTime: "5-7 days" },
  SC: { name: "South Carolina", sosWebsite: "sos.sc.gov", eFilingAvailable: true, llcFilingFee: 110, corpFilingFee: 135, annualReportFee: 0, processingTime: "3-5 days" },
  SD: { name: "South Dakota", sosWebsite: "sdsos.gov", eFilingAvailable: true, llcFilingFee: 150, corpFilingFee: 150, annualReportFee: 50, processingTime: "3-5 days" },
  TN: { name: "Tennessee", sosWebsite: "sos.tn.gov", eFilingAvailable: true, llcFilingFee: 300, corpFilingFee: 100, annualReportFee: 300, processingTime: "3-5 days" },
  TX: { name: "Texas", sosWebsite: "sos.state.tx.us", eFilingAvailable: true, llcFilingFee: 300, corpFilingFee: 300, annualReportFee: 0, processingTime: "3-5 days" },
  UT: { name: "Utah", sosWebsite: "corporations.utah.gov", eFilingAvailable: true, llcFilingFee: 54, corpFilingFee: 70, annualReportFee: 20, processingTime: "1-3 days" },
  VT: { name: "Vermont", sosWebsite: "sos.vermont.gov", eFilingAvailable: true, llcFilingFee: 125, corpFilingFee: 125, annualReportFee: 45, processingTime: "5-7 days" },
  VA: { name: "Virginia", sosWebsite: "scc.virginia.gov", eFilingAvailable: true, llcFilingFee: 100, corpFilingFee: 100, annualReportFee: 50, processingTime: "3-5 days" },
  WA: { name: "Washington", sosWebsite: "sos.wa.gov", eFilingAvailable: true, llcFilingFee: 200, corpFilingFee: 200, annualReportFee: 60, processingTime: "3-5 days" },
  WV: { name: "West Virginia", sosWebsite: "sos.wv.gov", eFilingAvailable: true, llcFilingFee: 100, corpFilingFee: 100, annualReportFee: 25, processingTime: "5-7 days" },
  WI: { name: "Wisconsin", sosWebsite: "dfi.wi.gov", eFilingAvailable: true, llcFilingFee: 130, corpFilingFee: 100, annualReportFee: 25, processingTime: "5-7 days" },
  WY: { name: "Wyoming", sosWebsite: "wyomingbusiness.org", eFilingAvailable: true, llcFilingFee: 100, corpFilingFee: 100, annualReportFee: 60, processingTime: "1-2 days" },
  DC: { name: "District of Columbia", sosWebsite: "dcra.dc.gov", eFilingAvailable: true, llcFilingFee: 220, corpFilingFee: 220, annualReportFee: 300, processingTime: "3-5 days" },
};

// Formation step templates by entity type
const FORMATION_STEPS = {
  llc: [
    { id: 1, title: "Choose Business Name", description: "Select and verify name availability", category: "planning", requiresDocument: false, requiresVerification: true, filingType: "online_check" },
    { id: 2, title: "Name Reservation (Optional)", description: "Reserve your business name with the state", category: "filing", requiresDocument: true, documentType: "name_reservation", filingType: "electronic", fee: 25 },
    { id: 3, title: "Designate Registered Agent", description: "Appoint a registered agent for service of process", category: "planning", requiresDocument: true, documentType: "registered_agent_consent", filingType: "internal" },
    { id: 4, title: "File Articles of Organization", description: "Submit formation documents to Secretary of State", category: "filing", requiresDocument: true, documentType: "articles_of_organization", filingType: "varies", fee: "state_specific" },
    { id: 5, title: "Receive Stamped Articles", description: "Obtain state-stamped copy of filed articles", category: "verification", requiresDocument: true, documentType: "stamped_articles", filingType: "state_return" },
    { id: 6, title: "Draft Operating Agreement", description: "Create LLC operating agreement", category: "internal", requiresDocument: true, documentType: "operating_agreement", filingType: "internal", requiresSignature: true },
    { id: 7, title: "Apply for EIN", description: "Obtain Employer Identification Number from IRS", category: "federal", requiresDocument: true, documentType: "ein_confirmation", filingType: "electronic", fee: 0 },
    { id: 8, title: "File Initial Report (if required)", description: "Submit initial/annual report to state", category: "filing", requiresDocument: true, documentType: "initial_report", filingType: "varies", fee: "state_specific", conditional: true },
    { id: 9, title: "Obtain Business Licenses", description: "Apply for required local/state business licenses", category: "licensing", requiresDocument: true, documentType: "business_license", filingType: "varies" },
    { id: 10, title: "Open Business Bank Account", description: "Establish business banking relationship", category: "banking", requiresDocument: true, documentType: "bank_statement", filingType: "in_person" },
    { id: 11, title: "Set Up Accounting System", description: "Establish bookkeeping and accounting", category: "operations", requiresDocument: false, filingType: "internal" },
    { id: 12, title: "Formation Complete", description: "All formation steps verified and complete", category: "completion", requiresDocument: false, filingType: "system" },
  ],
  corporation: [
    { id: 1, title: "Choose Business Name", description: "Select and verify name availability", category: "planning", requiresDocument: false, requiresVerification: true, filingType: "online_check" },
    { id: 2, title: "Name Reservation (Optional)", description: "Reserve your business name with the state", category: "filing", requiresDocument: true, documentType: "name_reservation", filingType: "electronic", fee: 25 },
    { id: 3, title: "Designate Registered Agent", description: "Appoint a registered agent for service of process", category: "planning", requiresDocument: true, documentType: "registered_agent_consent", filingType: "internal" },
    { id: 4, title: "Appoint Initial Directors", description: "Name the initial board of directors", category: "planning", requiresDocument: true, documentType: "director_consent", filingType: "internal" },
    { id: 5, title: "File Articles of Incorporation", description: "Submit formation documents to Secretary of State", category: "filing", requiresDocument: true, documentType: "articles_of_incorporation", filingType: "varies", fee: "state_specific" },
    { id: 6, title: "Receive Stamped Articles", description: "Obtain state-stamped copy of filed articles", category: "verification", requiresDocument: true, documentType: "stamped_articles", filingType: "state_return" },
    { id: 7, title: "Draft Corporate Bylaws", description: "Create corporate bylaws", category: "internal", requiresDocument: true, documentType: "bylaws", filingType: "internal", requiresSignature: true },
    { id: 8, title: "Hold Organizational Meeting", description: "Conduct initial board meeting", category: "internal", requiresDocument: true, documentType: "organizational_minutes", filingType: "internal", requiresSignature: true },
    { id: 9, title: "Issue Stock Certificates", description: "Issue shares to initial shareholders", category: "internal", requiresDocument: true, documentType: "stock_certificates", filingType: "internal" },
    { id: 10, title: "Apply for EIN", description: "Obtain Employer Identification Number from IRS", category: "federal", requiresDocument: true, documentType: "ein_confirmation", filingType: "electronic", fee: 0 },
    { id: 11, title: "File Initial Report (if required)", description: "Submit initial/annual report to state", category: "filing", requiresDocument: true, documentType: "initial_report", filingType: "varies", fee: "state_specific", conditional: true },
    { id: 12, title: "Obtain Business Licenses", description: "Apply for required local/state business licenses", category: "licensing", requiresDocument: true, documentType: "business_license", filingType: "varies" },
    { id: 13, title: "Open Business Bank Account", description: "Establish business banking relationship", category: "banking", requiresDocument: true, documentType: "bank_statement", filingType: "in_person" },
    { id: 14, title: "S-Corp Election (Optional)", description: "File Form 2553 for S-Corp tax treatment", category: "federal", requiresDocument: true, documentType: "form_2553", filingType: "electronic", conditional: true },
    { id: 15, title: "Formation Complete", description: "All formation steps verified and complete", category: "completion", requiresDocument: false, filingType: "system" },
  ],
  trust: [
    { id: 1, title: "Define Trust Purpose", description: "Establish the purpose and goals of the trust", category: "planning", requiresDocument: false, filingType: "internal" },
    { id: 2, title: "Identify Trustees", description: "Name initial and successor trustees", category: "planning", requiresDocument: true, documentType: "trustee_designation", filingType: "internal" },
    { id: 3, title: "Identify Beneficiaries", description: "Name trust beneficiaries and their interests", category: "planning", requiresDocument: true, documentType: "beneficiary_designation", filingType: "internal" },
    { id: 4, title: "Draft Trust Agreement", description: "Create comprehensive trust document", category: "internal", requiresDocument: true, documentType: "trust_agreement", filingType: "internal", requiresSignature: true },
    { id: 5, title: "Execute Trust Agreement", description: "Sign trust agreement with notarization", category: "internal", requiresDocument: true, documentType: "executed_trust", filingType: "notarized", requiresSignature: true },
    { id: 6, title: "Apply for EIN", description: "Obtain Employer Identification Number from IRS", category: "federal", requiresDocument: true, documentType: "ein_confirmation", filingType: "electronic", fee: 0 },
    { id: 7, title: "Fund the Trust", description: "Transfer assets into the trust", category: "funding", requiresDocument: true, documentType: "funding_schedule", filingType: "internal" },
    { id: 8, title: "Open Trust Bank Account", description: "Establish trust banking relationship", category: "banking", requiresDocument: true, documentType: "bank_statement", filingType: "in_person" },
    { id: 9, title: "Record Deeds (if real property)", description: "Record property deeds in trust name", category: "filing", requiresDocument: true, documentType: "recorded_deed", filingType: "county", conditional: true },
    { id: 10, title: "Update Asset Titles", description: "Retitle assets in trust name", category: "funding", requiresDocument: true, documentType: "title_transfers", filingType: "varies" },
    { id: 11, title: "Trust Formation Complete", description: "All formation steps verified and complete", category: "completion", requiresDocument: false, filingType: "system" },
  ],
  collective: [
    { id: 1, title: "Define Collective Purpose", description: "Establish mission and purpose under 508(c)(1)(A)", category: "planning", requiresDocument: true, documentType: "purpose_statement", filingType: "internal" },
    { id: 2, title: "Draft Organization Documents", description: "Create articles of association/charter", category: "internal", requiresDocument: true, documentType: "articles_of_association", filingType: "internal", requiresSignature: true },
    { id: 3, title: "Establish Governance Structure", description: "Define leadership and decision-making processes", category: "planning", requiresDocument: true, documentType: "governance_bylaws", filingType: "internal", requiresSignature: true },
    { id: 4, title: "Apply for EIN", description: "Obtain Employer Identification Number from IRS", category: "federal", requiresDocument: true, documentType: "ein_confirmation", filingType: "electronic", fee: 0 },
    { id: 5, title: "Establish 508 Status", description: "Document 508(c)(1)(A) status and exemption", category: "federal", requiresDocument: true, documentType: "status_declaration", filingType: "internal" },
    { id: 6, title: "Open Organization Bank Account", description: "Establish banking relationship", category: "banking", requiresDocument: true, documentType: "bank_statement", filingType: "in_person" },
    { id: 7, title: "Create Membership Records", description: "Establish member tracking system", category: "operations", requiresDocument: true, documentType: "membership_roster", filingType: "internal" },
    { id: 8, title: "Collective Formation Complete", description: "All formation steps verified and complete", category: "completion", requiresDocument: false, filingType: "system" },
  ],
};

// In-memory storage for formation tracking
const formationTrackers: Map<string, any> = new Map();

export const businessFormationRouter = router({
  /**
   * Get state filing information
   */
  getStateInfo: protectedProcedure
    .input(z.object({ stateCode: z.string().length(2) }))
    .query(async ({ input }) => {
      const stateInfo = STATE_FILING_INFO[input.stateCode.toUpperCase()];
      if (!stateInfo) throw new TRPCError({ code: "NOT_FOUND", message: "State not found" });
      return stateInfo;
    }),

  /**
   * Get all states with filing info
   */
  getAllStates: protectedProcedure.query(async () => {
    return Object.entries(STATE_FILING_INFO).map(([code, info]) => ({
      code,
      ...info,
    }));
  }),

  /**
   * Start business formation tracking
   */
  startFormation: protectedProcedure
    .input(z.object({
      businessName: z.string().min(1),
      entityType: z.enum(["llc", "corporation", "trust", "collective"]),
      stateCode: z.string().length(2),
      businessEntityId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [userHouse] = await db.select().from(houses).where(eq(houses.ownerUserId, ctx.user.id)).limit(1);
      const houseId = userHouse?.id || 1;

      const stateInfo = STATE_FILING_INFO[input.stateCode.toUpperCase()];
      if (!stateInfo) throw new TRPCError({ code: "NOT_FOUND", message: "State not found" });

      const trackerId = `FORM-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      // Get formation steps for entity type
      const steps = FORMATION_STEPS[input.entityType].map(step => ({
        ...step,
        status: "pending",
        completedAt: null,
        documentId: null,
        verificationNotes: null,
        confirmationNumber: null,
        filingFee: step.fee === "state_specific" 
          ? (input.entityType === "llc" ? stateInfo.llcFilingFee : stateInfo.corpFilingFee)
          : step.fee,
        eFilingAvailable: step.filingType === "electronic" || (step.filingType === "varies" && stateInfo.eFilingAvailable),
      }));

      const tracker = {
        id: trackerId,
        houseId,
        businessEntityId: input.businessEntityId,
        businessName: input.businessName,
        entityType: input.entityType,
        stateCode: input.stateCode.toUpperCase(),
        stateInfo,
        steps,
        totalSteps: steps.length,
        completedSteps: 0,
        progress: 0,
        status: "in_progress",
        estimatedFees: steps.reduce((sum, s) => sum + (typeof s.filingFee === "number" ? s.filingFee : 0), 0),
        actualFeesPaid: 0,
        startedAt: new Date().toISOString(),
        startedBy: ctx.user.id,
        completedAt: null,
        documents: [],
      };

      formationTrackers.set(trackerId, tracker);

      return {
        success: true,
        trackerId,
        tracker,
      };
    }),

  /**
   * Get formation tracker
   */
  getTracker: protectedProcedure
    .input(z.object({ trackerId: z.string() }))
    .query(async ({ input }) => {
      const tracker = formationTrackers.get(input.trackerId);
      if (!tracker) throw new TRPCError({ code: "NOT_FOUND", message: "Formation tracker not found" });
      return tracker;
    }),

  /**
   * Get all formation trackers for the house
   */
  getTrackers: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const [userHouse] = await db.select().from(houses).where(eq(houses.ownerUserId, ctx.user.id)).limit(1);
    const houseId = userHouse?.id || 1;

    const trackers = Array.from(formationTrackers.values()).filter(t => t.houseId === houseId);
    return trackers;
  }),

  /**
   * Complete a formation step
   */
  completeStep: protectedProcedure
    .input(z.object({
      trackerId: z.string(),
      stepId: z.number(),
      documentUrl: z.string().optional(),
      confirmationNumber: z.string().optional(),
      verificationNotes: z.string().optional(),
      actualFeePaid: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const tracker = formationTrackers.get(input.trackerId);
      if (!tracker) throw new TRPCError({ code: "NOT_FOUND", message: "Formation tracker not found" });

      const step = tracker.steps.find((s: any) => s.id === input.stepId);
      if (!step) throw new TRPCError({ code: "NOT_FOUND", message: "Step not found" });

      // Check if previous required steps are complete
      const previousSteps = tracker.steps.filter((s: any) => s.id < input.stepId && !s.conditional);
      const incompletePrevious = previousSteps.filter((s: any) => s.status !== "completed" && s.status !== "skipped");
      if (incompletePrevious.length > 0) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: `Complete previous steps first: ${incompletePrevious.map((s: any) => s.title).join(", ")}` 
        });
      }

      // Verify document if required
      if (step.requiresDocument && !input.documentUrl) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Document upload required for this step" });
      }

      step.status = "completed";
      step.completedAt = new Date().toISOString();
      step.completedBy = ctx.user.id;
      step.documentUrl = input.documentUrl;
      step.confirmationNumber = input.confirmationNumber;
      step.verificationNotes = input.verificationNotes;

      if (input.actualFeePaid) {
        step.actualFeePaid = input.actualFeePaid;
        tracker.actualFeesPaid += input.actualFeePaid;
      }

      // Update progress
      tracker.completedSteps = tracker.steps.filter((s: any) => s.status === "completed" || s.status === "skipped").length;
      tracker.progress = Math.round((tracker.completedSteps / tracker.totalSteps) * 100);

      // Check if all steps complete
      const allComplete = tracker.steps.every((s: any) => s.status === "completed" || s.status === "skipped");
      if (allComplete) {
        tracker.status = "completed";
        tracker.completedAt = new Date().toISOString();
      }

      return {
        success: true,
        step,
        progress: tracker.progress,
        status: tracker.status,
      };
    }),

  /**
   * Skip a conditional step
   */
  skipStep: protectedProcedure
    .input(z.object({
      trackerId: z.string(),
      stepId: z.number(),
      reason: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const tracker = formationTrackers.get(input.trackerId);
      if (!tracker) throw new TRPCError({ code: "NOT_FOUND", message: "Formation tracker not found" });

      const step = tracker.steps.find((s: any) => s.id === input.stepId);
      if (!step) throw new TRPCError({ code: "NOT_FOUND", message: "Step not found" });

      if (!step.conditional) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Only conditional steps can be skipped" });
      }

      step.status = "skipped";
      step.skippedAt = new Date().toISOString();
      step.skippedBy = ctx.user.id;
      step.skipReason = input.reason;

      // Update progress
      tracker.completedSteps = tracker.steps.filter((s: any) => s.status === "completed" || s.status === "skipped").length;
      tracker.progress = Math.round((tracker.completedSteps / tracker.totalSteps) * 100);

      return {
        success: true,
        step,
        progress: tracker.progress,
      };
    }),

  /**
   * Verify a document for a step
   */
  verifyDocument: protectedProcedure
    .input(z.object({
      trackerId: z.string(),
      stepId: z.number(),
      documentUrl: z.string(),
      verificationType: z.enum(["manual", "ai_assisted"]),
      verificationResult: z.enum(["verified", "rejected", "needs_review"]),
      verificationNotes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const tracker = formationTrackers.get(input.trackerId);
      if (!tracker) throw new TRPCError({ code: "NOT_FOUND", message: "Formation tracker not found" });

      const step = tracker.steps.find((s: any) => s.id === input.stepId);
      if (!step) throw new TRPCError({ code: "NOT_FOUND", message: "Step not found" });

      step.documentVerification = {
        documentUrl: input.documentUrl,
        verificationType: input.verificationType,
        verificationResult: input.verificationResult,
        verificationNotes: input.verificationNotes,
        verifiedBy: ctx.user.id,
        verifiedAt: new Date().toISOString(),
      };

      if (input.verificationResult === "verified") {
        step.status = "verified";
      } else if (input.verificationResult === "rejected") {
        step.status = "rejected";
      }

      return {
        success: true,
        verification: step.documentVerification,
      };
    }),

  /**
   * Get formation checklist for House activation
   */
  getActivationChecklist: protectedProcedure
    .input(z.object({ businessEntityId: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [userHouse] = await db.select().from(houses).where(eq(houses.ownerUserId, ctx.user.id)).limit(1);
      const houseId = userHouse?.id || 1;

      const trackers = Array.from(formationTrackers.values()).filter(t => {
        if (input.businessEntityId) {
          return t.houseId === houseId && t.businessEntityId === input.businessEntityId;
        }
        return t.houseId === houseId;
      });

      const checklist = {
        hasCompletedFormation: trackers.some(t => t.status === "completed"),
        formationTrackers: trackers.map(t => ({
          id: t.id,
          businessName: t.businessName,
          entityType: t.entityType,
          progress: t.progress,
          status: t.status,
        })),
        requirements: {
          businessFormation: trackers.some(t => t.status === "completed"),
          einObtained: trackers.some(t => t.steps.find((s: any) => s.documentType === "ein_confirmation" && s.status === "completed")),
          bankAccountOpened: trackers.some(t => t.steps.find((s: any) => s.documentType === "bank_statement" && s.status === "completed")),
          operatingDocsSigned: trackers.some(t => t.steps.find((s: any) => (s.documentType === "operating_agreement" || s.documentType === "bylaws" || s.documentType === "trust_agreement") && s.status === "completed")),
        },
        canActivateHouse: false,
      };

      // Check if all requirements met
      checklist.canActivateHouse = Object.values(checklist.requirements).every(v => v === true);

      return checklist;
    }),

  /**
   * Get formation dashboard
   */
  getDashboard: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const [userHouse] = await db.select().from(houses).where(eq(houses.ownerUserId, ctx.user.id)).limit(1);
    const houseId = userHouse?.id || 1;

    const trackers = Array.from(formationTrackers.values()).filter(t => t.houseId === houseId);

    const inProgress = trackers.filter(t => t.status === "in_progress");
    const completed = trackers.filter(t => t.status === "completed");

    const totalEstimatedFees = trackers.reduce((sum, t) => sum + t.estimatedFees, 0);
    const totalActualFees = trackers.reduce((sum, t) => sum + t.actualFeesPaid, 0);

    return {
      summary: {
        total: trackers.length,
        inProgress: inProgress.length,
        completed: completed.length,
        totalEstimatedFees,
        totalActualFees,
      },
      activeFormations: inProgress.map(t => ({
        id: t.id,
        businessName: t.businessName,
        entityType: t.entityType,
        state: t.stateCode,
        progress: t.progress,
        nextStep: t.steps.find((s: any) => s.status === "pending")?.title,
      })),
      recentlyCompleted: completed.slice(0, 5).map(t => ({
        id: t.id,
        businessName: t.businessName,
        entityType: t.entityType,
        completedAt: t.completedAt,
      })),
    };
  }),
});

export default businessFormationRouter;
