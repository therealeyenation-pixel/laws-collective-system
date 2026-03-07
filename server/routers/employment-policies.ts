import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";

// Employment classification types
const employmentClassifications = [
  "full_time_exempt",
  "part_time_exempt",
  "full_time_non_exempt",
  "contractor",
] as const;

// Core hours definition - After standard work hours for startup phase
const coreHours = {
  days: ["Tuesday", "Wednesday", "Thursday"],
  startTime: "18:00",
  endTime: "21:00",
  timezone: "America/Chicago",
  description: "Tuesday - Thursday, 6:00 PM - 9:00 PM CT (after standard work hours)",
  alternateDay: "Saturday",
  alternateTime: "9:00 AM - 12:00 PM CT",
  phase: "startup",
  note: "Startup phase schedule allows team members to maintain current employment while building the organization.",
};

// Employment terms structure
const employmentTerms = {
  classification: "full_time_exempt",
  hoursPerWeek: 40,
  flexibleSchedule: true,
  coreHours: coreHours,
  responseTime: "24 hours for communications (async-first approach)",
  meetingAttendance: "Mandatory for all scheduled evening/weekend meetings",
  advanceNotice: "48 hours for scheduled meetings when possible",
  meetingSchedule: "Evenings (6-9 PM CT) or Saturday mornings",
  phase: "startup",
  outsideEmployment: {
    allowed: true,
    conditions: [
      "No conflict of interest with The L.A.W.S. Collective business",
      "Must not interfere with core hours availability",
      "Must not affect job performance or deliverables",
      "Disclosure required via Conflict of Interest Form",
    ],
  },
  requiredDocuments: [
    "Signed Offer Letter",
    "Flexible Work Policy Acknowledgment",
    "Conflict of Interest Disclosure Form",
    "W-4 Tax Withholding Form",
    "I-9 Employment Eligibility Verification",
    "Direct Deposit Authorization",
    "Benefits Enrollment Forms",
  ],
};

// Policy document types
const policyDocuments = [
  {
    id: "flexible_work_policy",
    name: "Flexible Work Arrangement Policy",
    description: "Guidelines for flexible scheduling and remote work",
    required: true,
    requiresSignature: true,
  },
  {
    id: "conflict_of_interest",
    name: "Conflict of Interest Disclosure Form",
    description: "Disclosure of outside employment and business interests",
    required: true,
    requiresSignature: true,
  },
  {
    id: "employment_conditions",
    name: "Employment Conditions Summary",
    description: "Overview of employment terms and expectations",
    required: true,
    requiresSignature: false,
  },
  {
    id: "employee_handbook",
    name: "Employee Handbook Acknowledgment",
    description: "Acknowledgment of company policies and procedures",
    required: true,
    requiresSignature: true,
  },
];

export const employmentPoliciesRouter = router({
  // Get employment terms
  getTerms: publicProcedure.query(() => {
    return employmentTerms;
  }),

  // Get core hours
  getCoreHours: publicProcedure.query(() => {
    return coreHours;
  }),

  // Get required policy documents
  getPolicyDocuments: publicProcedure.query(() => {
    return policyDocuments;
  }),

  // Get employment classifications
  getClassifications: publicProcedure.query(() => {
    return employmentClassifications.map((c) => ({
      value: c,
      label: c.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    }));
  }),

  // Check if outside employment is allowed
  checkOutsideEmployment: publicProcedure
    .input(
      z.object({
        positionLevel: z.enum(["executive", "director", "manager", "coordinator", "specialist"]),
        hasConflict: z.boolean(),
      })
    )
    .query(({ input }) => {
      // All levels can have outside employment if no conflict
      if (input.hasConflict) {
        return {
          allowed: false,
          reason: "Potential conflict of interest detected. Please discuss with HR.",
        };
      }

      return {
        allowed: true,
        conditions: employmentTerms.outsideEmployment.conditions,
        requiredForm: "Conflict of Interest Disclosure Form",
      };
    }),

  // Submit conflict of interest disclosure
  submitConflictDisclosure: protectedProcedure
    .input(
      z.object({
        employeeId: z.string().optional(),
        outsideEmployer: z.string(),
        natureOfWork: z.string(),
        hoursPerWeek: z.number(),
        potentialConflict: z.string().optional(),
        additionalEmployers: z
          .array(
            z.object({
              employer: z.string(),
              natureOfWork: z.string(),
              hoursPerWeek: z.number(),
            })
          )
          .optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      // In production, this would save to database
      return {
        success: true,
        submissionId: `COI-${Date.now()}`,
        submittedBy: ctx.user?.name || "Unknown",
        submittedAt: new Date().toISOString(),
        status: "pending_review",
        message: "Your disclosure has been submitted for HR review.",
      };
    }),

  // Get onboarding checklist
  getOnboardingChecklist: publicProcedure
    .input(
      z.object({
        positionLevel: z.enum(["executive", "director", "manager", "coordinator", "specialist"]),
      })
    )
    .query(({ input }) => {
      const baseChecklist = [
        { id: "offer_letter", name: "Sign Offer Letter", required: true, completed: false },
        { id: "flexible_work", name: "Sign Flexible Work Policy", required: true, completed: false },
        { id: "coi_form", name: "Submit Conflict of Interest Form", required: true, completed: false },
        { id: "w4", name: "Complete W-4 Form", required: true, completed: false },
        { id: "i9", name: "Complete I-9 Verification", required: true, completed: false },
        { id: "direct_deposit", name: "Set Up Direct Deposit", required: true, completed: false },
        { id: "benefits", name: "Enroll in Benefits", required: true, completed: false },
        { id: "equipment", name: "Receive Equipment Package", required: true, completed: false },
        { id: "academy_enrollment", name: "Enroll in L.A.W.S. Academy", required: true, completed: false },
        { id: "team_intro", name: "Complete Team Introduction", required: true, completed: false },
      ];

      // Add manager-specific items
      if (["executive", "director", "manager"].includes(input.positionLevel)) {
        baseChecklist.push(
          { id: "leadership_training", name: "Complete Leadership Training", required: true, completed: false },
          { id: "budget_access", name: "Set Up Budget Access", required: true, completed: false }
        );
      }

      return baseChecklist;
    }),

  // Get meeting attendance policy
  getMeetingPolicy: publicProcedure.query(() => {
    return {
      mandatory: [
        "Weekly team meetings",
        "Monthly department meetings",
        "Quarterly all-hands meetings",
        "Annual planning sessions",
      ],
      optional: [
        "Cross-functional project meetings (as assigned)",
        "Professional development sessions",
        "Social events",
      ],
      advanceNotice: "48 hours when possible",
      absencePolicy: "Notify supervisor at least 24 hours in advance if unable to attend mandatory meeting",
    };
  }),
});

export type EmploymentPoliciesRouter = typeof employmentPoliciesRouter;
