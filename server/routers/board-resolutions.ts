import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

/**
 * Board Resolutions Router
 * 
 * Generates formal board resolutions for:
 * - Grant application authorization
 * - Contract approval
 * - Officer appointments
 * - Bank account authorization
 * - General corporate actions
 */

// Resolution types
const resolutionTypes = [
  "grant_authorization",
  "contract_approval",
  "officer_appointment",
  "bank_authorization",
  "budget_approval",
  "policy_adoption",
  "general_action",
] as const;

export const boardResolutionsRouter = router({
  // Get all saved resolutions
  getResolutions: protectedProcedure
    .input(z.object({
      entityId: z.number().optional(),
      type: z.enum(resolutionTypes).optional(),
      status: z.enum(["draft", "pending", "approved", "archived"]).optional(),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = sql`SELECT * FROM board_resolutions WHERE userId = ${ctx.user.id}`;
      
      if (input.entityId) {
        query = sql`${query} AND entityId = ${input.entityId}`;
      }
      if (input.type) {
        query = sql`${query} AND resolutionType = ${input.type}`;
      }
      if (input.status) {
        query = sql`${query} AND status = ${input.status}`;
      }
      
      query = sql`${query} ORDER BY createdAt DESC`;
      
      const resolutions = await db.execute(query);
      return resolutions as any[];
    }),

  // Get resolution templates
  getTemplates: protectedProcedure.query(async () => {
    return [
      {
        type: "grant_authorization",
        name: "Grant Application Authorization",
        description: "Authorizes the organization to apply for and accept grant funding",
        requiredFields: ["grantName", "grantorName", "maxAmount", "purpose", "authorizedSigners"],
      },
      {
        type: "contract_approval",
        name: "Contract Approval",
        description: "Approves entering into a specific contract or agreement",
        requiredFields: ["contractTitle", "counterparty", "contractValue", "term", "authorizedSigners"],
      },
      {
        type: "officer_appointment",
        name: "Officer Appointment",
        description: "Appoints officers to serve the organization",
        requiredFields: ["officerName", "position", "effectiveDate", "responsibilities"],
      },
      {
        type: "bank_authorization",
        name: "Bank Account Authorization",
        description: "Authorizes opening/managing bank accounts and designates signers",
        requiredFields: ["bankName", "accountType", "authorizedSigners", "signatureRequirements"],
      },
      {
        type: "budget_approval",
        name: "Budget Approval",
        description: "Approves the annual or project budget",
        requiredFields: ["budgetPeriod", "totalAmount", "majorCategories"],
      },
      {
        type: "policy_adoption",
        name: "Policy Adoption",
        description: "Adopts a new organizational policy",
        requiredFields: ["policyName", "policyPurpose", "effectiveDate"],
      },
      {
        type: "general_action",
        name: "General Corporate Action",
        description: "Authorizes any other corporate action",
        requiredFields: ["actionDescription", "rationale", "authorizedParties"],
      },
    ];
  }),

  // Generate Grant Authorization Resolution
  generateGrantAuthorization: protectedProcedure
    .input(z.object({
      entityName: z.string(),
      entityType: z.string().default("LLC"),
      grantName: z.string(),
      grantorName: z.string(),
      maxAmount: z.number(),
      purpose: z.string(),
      authorizedSigners: z.array(z.object({
        name: z.string(),
        title: z.string(),
      })),
      meetingDate: z.string(),
      meetingLocation: z.string().default("Virtual Meeting"),
      boardMembers: z.array(z.object({
        name: z.string(),
        title: z.string(),
        present: z.boolean().default(true),
      })),
    }))
    .mutation(async ({ input }) => {
      const { 
        entityName, entityType, grantName, grantorName, maxAmount, purpose,
        authorizedSigners, meetingDate, meetingLocation, boardMembers 
      } = input;

      const presentMembers = boardMembers.filter(m => m.present);
      const quorumMet = presentMembers.length >= Math.ceil(boardMembers.length / 2);

      const resolution = {
        type: "grant_authorization",
        documentTitle: `RESOLUTION OF THE ${entityType === "LLC" ? "MEMBERS" : "BOARD OF DIRECTORS"} OF ${entityName.toUpperCase()}`,
        subtitle: "AUTHORIZATION TO APPLY FOR AND ACCEPT GRANT FUNDING",
        meetingInfo: {
          date: meetingDate,
          location: meetingLocation,
          quorumMet,
          membersPresent: presentMembers.map(m => `${m.name}, ${m.title}`),
        },
        recitals: [
          `WHEREAS, ${entityName} (the "${entityType === "LLC" ? "Company" : "Corporation"}") has identified a grant opportunity from ${grantorName} known as "${grantName}";`,
          `WHEREAS, the grant funding, if awarded, would be used for the following purpose: ${purpose};`,
          `WHEREAS, the maximum grant amount being applied for is $${maxAmount.toLocaleString()};`,
          `WHEREAS, the ${entityType === "LLC" ? "Members" : "Board of Directors"} has determined that pursuing this grant funding is in the best interest of the ${entityType === "LLC" ? "Company" : "Corporation"};`,
        ],
        resolutions: [
          `RESOLVED, that the ${entityType === "LLC" ? "Company" : "Corporation"} is hereby authorized to submit a grant application to ${grantorName} for the "${grantName}" grant program, requesting funding up to $${maxAmount.toLocaleString()}.`,
          `RESOLVED, that the following individuals are hereby authorized to execute and deliver, on behalf of the ${entityType === "LLC" ? "Company" : "Corporation"}, any and all documents, instruments, and agreements necessary to apply for, accept, and administer the grant:\n${authorizedSigners.map(s => `    • ${s.name}, ${s.title}`).join('\n')}`,
          `RESOLVED, that the authorized signers are empowered to negotiate the terms and conditions of the grant agreement, provided that such terms are consistent with the ${entityType === "LLC" ? "Company's" : "Corporation's"} mission and do not impose obligations materially different from those described in the grant application.`,
          `RESOLVED, that upon award of the grant, the ${entityType === "LLC" ? "Company" : "Corporation"} shall use the funds solely for the purposes described in the grant application and in accordance with all applicable grant requirements.`,
          `RESOLVED, that the officers of the ${entityType === "LLC" ? "Company" : "Corporation"} are authorized to take any and all actions necessary to effectuate the foregoing resolutions.`,
        ],
        certification: {
          text: `I, the undersigned, being the Secretary of ${entityName}, do hereby certify that the foregoing is a true and correct copy of resolutions duly adopted by the ${entityType === "LLC" ? "Members" : "Board of Directors"} at a meeting held on ${meetingDate}, at which a quorum was present and acting throughout.`,
          signatureLine: true,
          dateField: true,
        },
        generatedAt: new Date().toISOString(),
      };

      return resolution;
    }),

  // Generate Contract Approval Resolution
  generateContractApproval: protectedProcedure
    .input(z.object({
      entityName: z.string(),
      entityType: z.string().default("LLC"),
      contractTitle: z.string(),
      counterparty: z.string(),
      contractValue: z.number(),
      term: z.string(),
      contractPurpose: z.string(),
      authorizedSigners: z.array(z.object({
        name: z.string(),
        title: z.string(),
      })),
      meetingDate: z.string(),
      meetingLocation: z.string().default("Virtual Meeting"),
      boardMembers: z.array(z.object({
        name: z.string(),
        title: z.string(),
        present: z.boolean().default(true),
      })),
    }))
    .mutation(async ({ input }) => {
      const { 
        entityName, entityType, contractTitle, counterparty, contractValue, term,
        contractPurpose, authorizedSigners, meetingDate, meetingLocation, boardMembers 
      } = input;

      const presentMembers = boardMembers.filter(m => m.present);
      const quorumMet = presentMembers.length >= Math.ceil(boardMembers.length / 2);

      const resolution = {
        type: "contract_approval",
        documentTitle: `RESOLUTION OF THE ${entityType === "LLC" ? "MEMBERS" : "BOARD OF DIRECTORS"} OF ${entityName.toUpperCase()}`,
        subtitle: "APPROVAL OF CONTRACT",
        meetingInfo: {
          date: meetingDate,
          location: meetingLocation,
          quorumMet,
          membersPresent: presentMembers.map(m => `${m.name}, ${m.title}`),
        },
        recitals: [
          `WHEREAS, ${entityName} (the "${entityType === "LLC" ? "Company" : "Corporation"}") desires to enter into a contract titled "${contractTitle}" with ${counterparty};`,
          `WHEREAS, the contract has a value of $${contractValue.toLocaleString()} and a term of ${term};`,
          `WHEREAS, the purpose of the contract is: ${contractPurpose};`,
          `WHEREAS, the ${entityType === "LLC" ? "Members" : "Board of Directors"} has reviewed the terms of the proposed contract and determined that entering into such contract is in the best interest of the ${entityType === "LLC" ? "Company" : "Corporation"};`,
        ],
        resolutions: [
          `RESOLVED, that the ${entityType === "LLC" ? "Company" : "Corporation"} is hereby authorized to enter into the contract titled "${contractTitle}" with ${counterparty}, substantially in the form presented to this meeting.`,
          `RESOLVED, that the following individuals are hereby authorized to execute and deliver the contract on behalf of the ${entityType === "LLC" ? "Company" : "Corporation"}:\n${authorizedSigners.map(s => `    • ${s.name}, ${s.title}`).join('\n')}`,
          `RESOLVED, that the authorized signers are empowered to negotiate and agree to such modifications to the contract as they deem necessary or appropriate, provided that such modifications do not materially increase the ${entityType === "LLC" ? "Company's" : "Corporation's"} obligations or decrease its rights under the contract.`,
          `RESOLVED, that the officers of the ${entityType === "LLC" ? "Company" : "Corporation"} are authorized to take any and all actions necessary to effectuate the foregoing resolutions.`,
        ],
        certification: {
          text: `I, the undersigned, being the Secretary of ${entityName}, do hereby certify that the foregoing is a true and correct copy of resolutions duly adopted by the ${entityType === "LLC" ? "Members" : "Board of Directors"} at a meeting held on ${meetingDate}, at which a quorum was present and acting throughout.`,
          signatureLine: true,
          dateField: true,
        },
        generatedAt: new Date().toISOString(),
      };

      return resolution;
    }),

  // Generate Officer Appointment Resolution
  generateOfficerAppointment: protectedProcedure
    .input(z.object({
      entityName: z.string(),
      entityType: z.string().default("LLC"),
      appointments: z.array(z.object({
        name: z.string(),
        position: z.string(),
        responsibilities: z.string().optional(),
      })),
      effectiveDate: z.string(),
      meetingDate: z.string(),
      meetingLocation: z.string().default("Virtual Meeting"),
      boardMembers: z.array(z.object({
        name: z.string(),
        title: z.string(),
        present: z.boolean().default(true),
      })),
    }))
    .mutation(async ({ input }) => {
      const { 
        entityName, entityType, appointments, effectiveDate,
        meetingDate, meetingLocation, boardMembers 
      } = input;

      const presentMembers = boardMembers.filter(m => m.present);
      const quorumMet = presentMembers.length >= Math.ceil(boardMembers.length / 2);

      const resolution = {
        type: "officer_appointment",
        documentTitle: `RESOLUTION OF THE ${entityType === "LLC" ? "MEMBERS" : "BOARD OF DIRECTORS"} OF ${entityName.toUpperCase()}`,
        subtitle: "APPOINTMENT OF OFFICERS",
        meetingInfo: {
          date: meetingDate,
          location: meetingLocation,
          quorumMet,
          membersPresent: presentMembers.map(m => `${m.name}, ${m.title}`),
        },
        recitals: [
          `WHEREAS, the ${entityType === "LLC" ? "Members" : "Board of Directors"} of ${entityName} (the "${entityType === "LLC" ? "Company" : "Corporation"}") desires to appoint officers to serve the ${entityType === "LLC" ? "Company" : "Corporation"};`,
          `WHEREAS, the ${entityType === "LLC" ? "Members" : "Board of Directors"} has determined that the individuals named below are qualified to serve in the positions indicated;`,
        ],
        resolutions: [
          `RESOLVED, that the following individuals are hereby appointed to serve as officers of the ${entityType === "LLC" ? "Company" : "Corporation"}, effective ${effectiveDate}, to serve until their successors are duly appointed or until their earlier resignation or removal:\n${appointments.map(a => `    • ${a.name} as ${a.position}${a.responsibilities ? ` - ${a.responsibilities}` : ''}`).join('\n')}`,
          `RESOLVED, that each officer shall have such powers and duties as are customarily associated with their respective positions, as well as such additional powers and duties as may be assigned by the ${entityType === "LLC" ? "Members" : "Board of Directors"} from time to time.`,
          `RESOLVED, that the officers are authorized to execute documents, open accounts, and take such other actions as are necessary to carry out the business of the ${entityType === "LLC" ? "Company" : "Corporation"}.`,
        ],
        certification: {
          text: `I, the undersigned, being the Secretary of ${entityName}, do hereby certify that the foregoing is a true and correct copy of resolutions duly adopted by the ${entityType === "LLC" ? "Members" : "Board of Directors"} at a meeting held on ${meetingDate}, at which a quorum was present and acting throughout.`,
          signatureLine: true,
          dateField: true,
        },
        generatedAt: new Date().toISOString(),
      };

      return resolution;
    }),

  // Generate Bank Authorization Resolution
  generateBankAuthorization: protectedProcedure
    .input(z.object({
      entityName: z.string(),
      entityType: z.string().default("LLC"),
      bankName: z.string(),
      accountTypes: z.array(z.string()),
      authorizedSigners: z.array(z.object({
        name: z.string(),
        title: z.string(),
      })),
      signatureRequirements: z.string().default("Any one authorized signer"),
      meetingDate: z.string(),
      meetingLocation: z.string().default("Virtual Meeting"),
      boardMembers: z.array(z.object({
        name: z.string(),
        title: z.string(),
        present: z.boolean().default(true),
      })),
    }))
    .mutation(async ({ input }) => {
      const { 
        entityName, entityType, bankName, accountTypes, authorizedSigners,
        signatureRequirements, meetingDate, meetingLocation, boardMembers 
      } = input;

      const presentMembers = boardMembers.filter(m => m.present);
      const quorumMet = presentMembers.length >= Math.ceil(boardMembers.length / 2);

      const resolution = {
        type: "bank_authorization",
        documentTitle: `RESOLUTION OF THE ${entityType === "LLC" ? "MEMBERS" : "BOARD OF DIRECTORS"} OF ${entityName.toUpperCase()}`,
        subtitle: "AUTHORIZATION TO OPEN AND MAINTAIN BANK ACCOUNTS",
        meetingInfo: {
          date: meetingDate,
          location: meetingLocation,
          quorumMet,
          membersPresent: presentMembers.map(m => `${m.name}, ${m.title}`),
        },
        recitals: [
          `WHEREAS, ${entityName} (the "${entityType === "LLC" ? "Company" : "Corporation"}") requires banking services for the conduct of its business;`,
          `WHEREAS, the ${entityType === "LLC" ? "Members" : "Board of Directors"} has determined that ${bankName} is an appropriate financial institution for the ${entityType === "LLC" ? "Company's" : "Corporation's"} banking needs;`,
        ],
        resolutions: [
          `RESOLVED, that the ${entityType === "LLC" ? "Company" : "Corporation"} is hereby authorized to open and maintain the following types of accounts at ${bankName}:\n${accountTypes.map(t => `    • ${t}`).join('\n')}`,
          `RESOLVED, that the following individuals are hereby designated as authorized signers on all accounts of the ${entityType === "LLC" ? "Company" : "Corporation"} at ${bankName}:\n${authorizedSigners.map(s => `    • ${s.name}, ${s.title}`).join('\n')}`,
          `RESOLVED, that the signature requirements for transactions shall be: ${signatureRequirements}.`,
          `RESOLVED, that the authorized signers are empowered to:\n    • Deposit and withdraw funds\n    • Sign checks and authorize electronic transfers\n    • Access online banking services\n    • Request and manage debit cards\n    • Execute any documents required by the bank`,
          `RESOLVED, that this resolution shall remain in effect until modified or revoked by subsequent action of the ${entityType === "LLC" ? "Members" : "Board of Directors"}.`,
        ],
        certification: {
          text: `I, the undersigned, being the Secretary of ${entityName}, do hereby certify that the foregoing is a true and correct copy of resolutions duly adopted by the ${entityType === "LLC" ? "Members" : "Board of Directors"} at a meeting held on ${meetingDate}, at which a quorum was present and acting throughout.`,
          signatureLine: true,
          dateField: true,
        },
        generatedAt: new Date().toISOString(),
      };

      return resolution;
    }),

  // Save resolution to database
  saveResolution: protectedProcedure
    .input(z.object({
      entityId: z.number().optional(),
      resolutionType: z.enum(resolutionTypes),
      title: z.string(),
      data: z.any(),
      status: z.enum(["draft", "pending", "approved", "archived"]).default("draft"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.execute(
        sql`INSERT INTO board_resolutions 
            (userId, entityId, resolutionType, title, data, status, createdAt, updatedAt)
            VALUES (${ctx.user.id}, ${input.entityId || null}, ${input.resolutionType}, 
                    ${input.title}, ${JSON.stringify(input.data)}, ${input.status}, NOW(), NOW())`
      );

      return { success: true, id: (result as any).insertId };
    }),

  // Update resolution status
  updateStatus: protectedProcedure
    .input(z.object({
      resolutionId: z.number(),
      status: z.enum(["draft", "pending", "approved", "archived"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.execute(
        sql`UPDATE board_resolutions 
            SET status = ${input.status}, updatedAt = NOW()
            WHERE id = ${input.resolutionId} AND userId = ${ctx.user.id}`
      );

      return { success: true };
    }),
});
