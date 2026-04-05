import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";

// Form template definitions for foreign entity registration
const FORM_TEMPLATES = {
  // Certificate of Authority Application (Generic)
  certificateOfAuthority: {
    id: "cert-authority",
    name: "Application for Certificate of Authority",
    description: "Standard application to register a foreign entity to do business in a state",
    fields: [
      { name: "entityName", label: "Entity Name", type: "text", required: true },
      { name: "entityType", label: "Entity Type", type: "select", options: ["LLC", "Corporation", "LP", "LLP"], required: true },
      { name: "homeState", label: "State of Formation", type: "state", required: true },
      { name: "formationDate", label: "Date of Formation", type: "date", required: true },
      { name: "principalOffice", label: "Principal Office Address", type: "address", required: true },
      { name: "registeredAgent", label: "Registered Agent Name", type: "text", required: true },
      { name: "registeredAgentAddress", label: "Registered Agent Address", type: "address", required: true },
      { name: "purpose", label: "Purpose/Nature of Business", type: "textarea", required: true },
      { name: "managers", label: "Managers/Officers", type: "array", required: true },
      { name: "authorizedSignatory", label: "Authorized Signatory", type: "text", required: true },
    ],
  },

  // Certificate of Good Standing Request
  goodStandingRequest: {
    id: "good-standing",
    name: "Certificate of Good Standing Request",
    description: "Request a certificate of good standing from your home state",
    fields: [
      { name: "entityName", label: "Entity Name", type: "text", required: true },
      { name: "entityNumber", label: "Entity/File Number", type: "text", required: true },
      { name: "homeState", label: "State of Formation", type: "state", required: true },
      { name: "expedited", label: "Expedited Processing", type: "boolean", required: false },
      { name: "certified", label: "Certified Copy", type: "boolean", required: true },
      { name: "apostille", label: "Apostille Required", type: "boolean", required: false },
    ],
  },

  // Registered Agent Designation
  registeredAgentDesignation: {
    id: "reg-agent",
    name: "Registered Agent Designation",
    description: "Designate or change registered agent in a state",
    fields: [
      { name: "entityName", label: "Entity Name", type: "text", required: true },
      { name: "entityNumber", label: "Entity/File Number", type: "text", required: true },
      { name: "agentName", label: "New Registered Agent Name", type: "text", required: true },
      { name: "agentAddress", label: "Registered Agent Address", type: "address", required: true },
      { name: "agentConsent", label: "Agent Consent Obtained", type: "boolean", required: true },
      { name: "effectiveDate", label: "Effective Date", type: "date", required: false },
    ],
  },

  // Board Resolution for Foreign Registration
  boardResolution: {
    id: "board-resolution",
    name: "Board Resolution - Foreign Registration",
    description: "Board resolution authorizing registration in another jurisdiction",
    fields: [
      { name: "entityName", label: "Entity Name", type: "text", required: true },
      { name: "meetingDate", label: "Meeting Date", type: "date", required: true },
      { name: "targetJurisdiction", label: "Target State/Country", type: "text", required: true },
      { name: "registrationType", label: "Registration Type", type: "select", options: ["Foreign Qualification", "Branch Office", "Subsidiary"], required: true },
      { name: "authorizedPerson", label: "Person Authorized to Execute", type: "text", required: true },
      { name: "budgetApproved", label: "Budget Approved", type: "currency", required: false },
    ],
  },

  // Power of Attorney for Foreign Agent
  powerOfAttorney: {
    id: "poa-foreign",
    name: "Power of Attorney - Foreign Agent",
    description: "Grant power of attorney to local agent for foreign registration",
    fields: [
      { name: "principalName", label: "Principal (Company) Name", type: "text", required: true },
      { name: "principalAddress", label: "Principal Address", type: "address", required: true },
      { name: "agentName", label: "Attorney-in-Fact Name", type: "text", required: true },
      { name: "agentAddress", label: "Attorney-in-Fact Address", type: "address", required: true },
      { name: "scope", label: "Scope of Authority", type: "textarea", required: true },
      { name: "effectiveDate", label: "Effective Date", type: "date", required: true },
      { name: "expirationDate", label: "Expiration Date", type: "date", required: false },
      { name: "revocable", label: "Revocable", type: "boolean", required: true },
    ],
  },

  // Annual Report / Statement of Information
  annualReport: {
    id: "annual-report",
    name: "Annual Report / Statement of Information",
    description: "Annual filing required to maintain good standing",
    fields: [
      { name: "entityName", label: "Entity Name", type: "text", required: true },
      { name: "entityNumber", label: "Entity/File Number", type: "text", required: true },
      { name: "filingState", label: "Filing State", type: "state", required: true },
      { name: "reportYear", label: "Report Year", type: "number", required: true },
      { name: "principalAddress", label: "Principal Address", type: "address", required: true },
      { name: "registeredAgent", label: "Registered Agent", type: "text", required: true },
      { name: "officers", label: "Officers/Managers", type: "array", required: true },
    ],
  },

  // Withdrawal / Surrender of Authority
  withdrawalApplication: {
    id: "withdrawal",
    name: "Application for Withdrawal",
    description: "Withdraw foreign qualification from a state",
    fields: [
      { name: "entityName", label: "Entity Name", type: "text", required: true },
      { name: "entityNumber", label: "Entity/File Number", type: "text", required: true },
      { name: "withdrawalState", label: "State of Withdrawal", type: "state", required: true },
      { name: "effectiveDate", label: "Effective Date", type: "date", required: true },
      { name: "taxClearance", label: "Tax Clearance Obtained", type: "boolean", required: true },
      { name: "noLiabilities", label: "Confirm No Outstanding Liabilities", type: "boolean", required: true },
    ],
  },
};

// State-specific form variations
const STATE_FORM_LINKS = {
  GA: {
    certificateOfAuthority: "https://sos.ga.gov/corporations-division",
    formName: "Application for Certificate of Authority",
    fee: 225,
  },
  DE: {
    certificateOfAuthority: "https://corp.delaware.gov/",
    formName: "Certificate of Registration",
    fee: 200,
  },
  CA: {
    certificateOfAuthority: "https://www.sos.ca.gov/business-programs/",
    formName: "Statement and Designation by Foreign LLC",
    fee: 70,
  },
  NY: {
    certificateOfAuthority: "https://www.dos.ny.gov/corps/",
    formName: "Application for Authority",
    fee: 250,
  },
  TX: {
    certificateOfAuthority: "https://www.sos.texas.gov/corp/",
    formName: "Application for Registration",
    fee: 750,
  },
  FL: {
    certificateOfAuthority: "https://dos.myflorida.com/sunbiz/",
    formName: "Application for Authorization",
    fee: 125,
  },
};

export const foreignEntityFormsRouter = router({
  // Get all form templates
  getFormTemplates: protectedProcedure.query(() => {
    return Object.values(FORM_TEMPLATES);
  }),

  // Get specific form template
  getFormTemplate: protectedProcedure
    .input(z.object({ formId: z.string() }))
    .query(({ input }) => {
      const template = Object.values(FORM_TEMPLATES).find(t => t.id === input.formId);
      if (!template) {
        throw new Error("Form template not found");
      }
      return template;
    }),

  // Get state-specific form info
  getStateFormInfo: protectedProcedure
    .input(z.object({ stateCode: z.string() }))
    .query(({ input }) => {
      const stateInfo = STATE_FORM_LINKS[input.stateCode as keyof typeof STATE_FORM_LINKS];
      return stateInfo || null;
    }),

  // Generate form document (returns form data for PDF generation)
  generateForm: protectedProcedure
    .input(z.object({
      formId: z.string(),
      data: z.record(z.any()),
    }))
    .mutation(({ input }) => {
      const template = Object.values(FORM_TEMPLATES).find(t => t.id === input.formId);
      if (!template) {
        throw new Error("Form template not found");
      }

      // Validate required fields
      const missingFields = template.fields
        .filter(f => f.required && !input.data[f.name])
        .map(f => f.label);

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      // Return generated form data
      return {
        formId: input.formId,
        formName: template.name,
        generatedAt: new Date().toISOString(),
        data: input.data,
        status: "generated",
      };
    }),

  // Save draft form
  saveDraft: protectedProcedure
    .input(z.object({
      formId: z.string(),
      data: z.record(z.any()),
      name: z.string().optional(),
    }))
    .mutation(({ input, ctx }) => {
      // In production, save to database
      return {
        draftId: `draft-${Date.now()}`,
        formId: input.formId,
        savedAt: new Date().toISOString(),
        savedBy: ctx.user.id,
      };
    }),

  // Get filing checklist for a state
  getFilingChecklist: protectedProcedure
    .input(z.object({ 
      homeState: z.string(),
      targetState: z.string(),
      entityType: z.string(),
    }))
    .query(({ input }) => {
      // Generate dynamic checklist based on states and entity type
      const checklist = [
        {
          id: "1",
          task: "Obtain Certificate of Good Standing from " + input.homeState,
          required: true,
          estimatedDays: 3,
          estimatedCost: 50,
        },
        {
          id: "2",
          task: "Verify name availability in " + input.targetState,
          required: true,
          estimatedDays: 1,
          estimatedCost: 0,
        },
        {
          id: "3",
          task: "Appoint registered agent in " + input.targetState,
          required: true,
          estimatedDays: 1,
          estimatedCost: 100,
        },
        {
          id: "4",
          task: "Complete Application for Certificate of Authority",
          required: true,
          estimatedDays: 1,
          estimatedCost: 0,
        },
        {
          id: "5",
          task: "Submit application with filing fee",
          required: true,
          estimatedDays: 1,
          estimatedCost: STATE_FORM_LINKS[input.targetState as keyof typeof STATE_FORM_LINKS]?.fee || 200,
        },
        {
          id: "6",
          task: "Register for state taxes in " + input.targetState,
          required: true,
          estimatedDays: 5,
          estimatedCost: 0,
        },
        {
          id: "7",
          task: "Obtain local business licenses (if applicable)",
          required: false,
          estimatedDays: 14,
          estimatedCost: 100,
        },
      ];

      return {
        homeState: input.homeState,
        targetState: input.targetState,
        entityType: input.entityType,
        checklist,
        totalEstimatedCost: checklist.reduce((sum, item) => sum + item.estimatedCost, 0),
        totalEstimatedDays: Math.max(...checklist.map(item => item.estimatedDays)) + 7,
      };
    }),
});

export type ForeignEntityFormsRouter = typeof foreignEntityFormsRouter;
