import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";

// ENTITY STRUCTURE:
// CALEA Freeman Family Trust (Root)
//   └── LuvOnPurpose Autonomous Wealth System, LLC (Parent LLC)
//         └── The The The L.A.W.S. Collective, LLC (Operating Entity - 100%)
//               ├── LuvOnPurpose Academy & Outreach (508) - 30%
//               ├── Real-Eye-Nation (Media Division) - 20%
//               └── Services/Operations - 50%

export const unifiedGovernanceRouter = router({
  getEntityStructure: protectedProcedure.query(() => {
    return {
      rootEntity: {
        id: "calea_trust",
        name: "CALEA Freeman Family Trust",
        type: "family_trust",
        description: "Root holding entity for all L.A.W.S. assets",
        taxStatus: "Grantor Trust",
        role: "Asset protection and generational wealth transfer",
        visibility: "internal",
      },
      entities: [
        {
          id: "parent_llc",
          name: "LuvOnPurpose Autonomous Wealth System, LLC",
          shortName: "LAWS LLC",
          type: "parent_llc",
          taxStatus: "Disregarded Entity / Partnership",
          ownership: { owner: "CALEA Freeman Family Trust", percentage: 100 },
          description: "Parent holding company overseeing all L.A.W.S. entities",
          role: "Holds ownership, IP, and provides liability protection layer",
          governance: { managedBy: "Managing Member(s)", votingRights: "Per Operating Agreement", meetings: "Annual and as needed" },
          subsidiaries: ["collective"],
          departments: [
            { name: "Executive Operations", focus: "Strategic planning and governance" },
            { name: "Finance & Accounting", focus: "Financial management and compliance" },
            { name: "Legal & Compliance", focus: "Contract management and risk" },
            { name: "Business Development", focus: "Partnership and growth strategy" },
          ],
          internshipTracks: ["executive_operations", "finance_accounting", "legal_compliance", "business_development"],
        },
        {
          id: "collective",
          name: "The The The L.A.W.S. Collective, LLC",
          shortName: "The The L.A.W.S. Collective",
          type: "operating_llc",
          taxStatus: "Partnership (Multi-member LLC)",
          ownership: { owner: "LuvOnPurpose Autonomous Wealth System, LLC", percentage: 100 },
          description: "Operating entity for member services and community operations",
          role: "Day-to-day operations, member services, revenue generation",
          publicFacing: true,
          governance: { managedBy: "Managing Member(s) with Member Advisory Board", votingRights: "Profit Interest holders vote on major decisions", meetings: "Quarterly member meetings, annual general meeting" },
          divisions: [
            {
              id: "academy_508",
              name: "LuvOnPurpose Academy & Outreach",
              type: "508_organization",
              taxStatus: "508(c)(1)(A) Tax-Exempt",
              allocationPercentage: 30,
              description: "Educational and charitable arm",
              focus: ["K-12 Homeschool Program", "Trade Academy", "Community Outreach", "Scholarships & Grants"],
              governance: { managedBy: "Board of Directors", boardSize: "5-9 members", meetings: "Quarterly board meetings" },
              internshipTracks: ["curriculum_development", "instruction_support", "program_administration", "nonprofit_management"],
            },
            {
              id: "real_eye_nation",
              name: "Real-Eye-Nation",
              type: "media_division",
              taxStatus: "Pass-through to Collective",
              allocationPercentage: 20,
              description: "Media and content creation division",
              focus: ["Documentary Production", "Podcast/Video Content", "Historical Documentation", "Truth Narrative"],
              governance: { managedBy: "Division Director", reportsTo: "Collective Management" },
              internshipTracks: ["content_creation", "media_production", "research_documentation", "digital_marketing"],
            },
            {
              id: "services_operations",
              name: "Services & Operations",
              type: "operations_division",
              taxStatus: "Pass-through to Collective",
              allocationPercentage: 50,
              description: "Core business operations and member services",
              focus: ["Member Services", "Workforce Development", "Business Support", "Community Programs"],
              governance: { managedBy: "Operations Director", reportsTo: "Collective Management" },
              internshipTracks: ["member_services", "community_operations", "communications", "workforce_development"],
            },
          ],
          memberStructure: {
            tiers: [
              { name: "Founding Member", profitInterestRange: "5-15%", votingWeight: 3, requirements: "Original members, significant contribution" },
              { name: "Standard Member", profitInterestRange: "1-5%", votingWeight: 2, requirements: "Business owner, completed pathway" },
              { name: "Associate Member", profitInterestRange: "0.1-1%", votingWeight: 1, requirements: "Active participant, dues current" },
            ],
            obligations: [
              "10% Community Reinvestment from member business profits",
              "Monthly dues payment",
              "Participation in governance activities",
              "Adherence to L.A.W.S. framework principles",
            ],
          },
        },
      ],
      careerPathway: {
        stages: [
          { stage: 1, name: "Intern", entity: "Any", description: "Educational experience and skill development", duration: "3-6 months" },
          { stage: 2, name: "W-2 Employee", entity: "Any", description: "Stable employment with benefits", duration: "1-3 years" },
          { stage: 3, name: "Independent Contractor", entity: "Any", description: "Specialized services with flexibility", duration: "1-5 years" },
          { stage: 4, name: "Business Owner", entity: "Collective", description: "The The L.A.W.S. Collective member with own enterprise", duration: "Ongoing" },
        ],
        wealthLoop: [
          "External funding (grants/donations) → 508 Treasury",
          "Treasury funds L.A.W.S. positions (employment)",
          "Workers progress (W-2 → Contractor → Business Owner)",
          "Business owners register as 508/Collective members",
          "Member businesses pay Community Reinvestment (10%)",
          "Reinvestment returns to Treasury (loop continues)",
        ],
      },
      lawsFramework: {
        pillars: [
          { id: "land", name: "LAND", meaning: "Reconnection & Stability", color: "#8d6e63", focus: "Understanding roots, migrations, and family history" },
          { id: "air", name: "AIR", meaning: "Education & Knowledge", color: "#90caf9", focus: "Learning, personal development, and communication" },
          { id: "water", name: "WATER", meaning: "Healing & Balance", color: "#4fc3f7", focus: "Emotional resilience, healing cycles, and healthy decision-making" },
          { id: "self", name: "SELF", meaning: "Purpose & Skills", color: "#ffb74d", focus: "Financial literacy, business readiness, and purposeful growth" },
        ],
      },
    };
  }),

  getGovernanceSummary: protectedProcedure.query(() => {
    return {
      parentLLC: {
        name: "LuvOnPurpose Autonomous Wealth System, LLC",
        status: "Active",
        managementType: "Member-Managed",
        keyDocuments: ["Operating Agreement", "Certificate of Formation", "EIN Documentation", "Annual Report"],
      },
      collective: {
        name: "The The The L.A.W.S. Collective, LLC",
        status: "Active",
        managementType: "Member-Managed with Advisory Board",
        keyDocuments: ["Operating Agreement", "Membership Agreement Template", "Profit Interest Grant Template", "Community Reinvestment Policy"],
      },
      academy508: {
        name: "LuvOnPurpose Academy & Outreach",
        status: "Active",
        taxExemptStatus: "508(c)(1)(A)",
        keyDocuments: ["Articles of Incorporation", "Bylaws", "Board Resolutions", "Annual Report (Form 990-N)", "Donation Acknowledgment Templates"],
      },
      realEyeNation: {
        name: "Real-Eye-Nation",
        status: "Active",
        divisionType: "Media Division",
        keyDocuments: ["Division Charter", "Content Guidelines", "Media Release Templates"],
      },
    };
  }),

  getDocumentTemplates: protectedProcedure
    .input(z.object({ entityId: z.enum(["parent_llc", "collective", "academy_508", "real_eye_nation"]) }))
    .query(({ input }) => {
      const templates: Record<string, Array<{ id: string; name: string; category: string; description: string }>> = {
        parent_llc: [
          { id: "operating_agreement", name: "Operating Agreement", category: "formation", description: "LLC governing document" },
          { id: "resolution", name: "Member Resolution", category: "governance", description: "Formal member decisions" },
          { id: "profit_interest_grant", name: "Profit Interest Grant", category: "equity", description: "Grant profit interests to individuals" },
          { id: "employment_agreement", name: "Employment Agreement", category: "hr", description: "W-2 employee agreements" },
          { id: "contractor_agreement", name: "Contractor Agreement", category: "hr", description: "1099 contractor agreements" },
          { id: "internship_agreement", name: "Internship Agreement", category: "hr", description: "Intern program agreements" },
        ],
        collective: [
          { id: "membership_agreement", name: "Membership Agreement", category: "membership", description: "New member onboarding" },
          { id: "profit_sharing_plan", name: "Profit Sharing Plan", category: "equity", description: "Distribution methodology" },
          { id: "community_reinvestment", name: "Community Reinvestment Agreement", category: "membership", description: "10% reinvestment commitment" },
          { id: "member_business_registration", name: "Member Business Registration", category: "membership", description: "Register member-owned businesses" },
          { id: "internship_agreement", name: "Internship Agreement", category: "hr", description: "Collective internship program" },
          { id: "transition_agreement", name: "Career Transition Agreement", category: "hr", description: "Pathway progression documents" },
        ],
        academy_508: [
          { id: "bylaws", name: "Bylaws", category: "formation", description: "508 governing document" },
          { id: "board_resolution", name: "Board Resolution", category: "governance", description: "Formal board decisions" },
          { id: "donation_acknowledgment", name: "Donation Acknowledgment", category: "donations", description: "Tax-deductible donation receipts" },
          { id: "grant_application", name: "Grant Application", category: "funding", description: "Apply for external grants" },
          { id: "scholarship_award", name: "Scholarship Award", category: "programs", description: "Award scholarships to students" },
          { id: "homeschool_enrollment", name: "Homeschool Enrollment", category: "education", description: "K-12 homeschool program" },
          { id: "trade_academy_enrollment", name: "Trade Academy Enrollment", category: "education", description: "Trade/vocational programs" },
          { id: "internship_agreement", name: "Internship Agreement", category: "hr", description: "Academy internship program" },
        ],
        real_eye_nation: [
          { id: "content_agreement", name: "Content Creation Agreement", category: "production", description: "Content creator contracts" },
          { id: "media_release", name: "Media Release Form", category: "legal", description: "Permission for media use" },
          { id: "talent_agreement", name: "Talent Agreement", category: "production", description: "On-camera/voice talent" },
          { id: "licensing_agreement", name: "Content Licensing Agreement", category: "legal", description: "License content to third parties" },
          { id: "internship_agreement", name: "Internship Agreement", category: "hr", description: "Media internship program" },
        ],
      };
      return templates[input.entityId] || [];
    }),

  getComplianceChecklist: protectedProcedure
    .input(z.object({ entityId: z.enum(["parent_llc", "collective", "academy_508"]) }))
    .query(({ input }) => {
      const checklists: Record<string, Array<{ id: string; item: string; frequency: string; status: "pending" | "completed" | "overdue" }>> = {
        parent_llc: [
          { id: "annual_report", item: "File Annual Report with State", frequency: "Annual", status: "pending" },
          { id: "franchise_tax", item: "Pay Franchise Tax", frequency: "Annual", status: "pending" },
          { id: "operating_agreement_review", item: "Review Operating Agreement", frequency: "Annual", status: "pending" },
          { id: "member_meeting", item: "Hold Annual Member Meeting", frequency: "Annual", status: "pending" },
          { id: "tax_return", item: "File Partnership Tax Return (Form 1065)", frequency: "Annual", status: "pending" },
          { id: "k1_distribution", item: "Distribute K-1s to Members", frequency: "Annual", status: "pending" },
        ],
        collective: [
          { id: "quarterly_meeting", item: "Hold Quarterly Member Meeting", frequency: "Quarterly", status: "pending" },
          { id: "profit_distribution", item: "Calculate and Distribute Profits", frequency: "Quarterly", status: "pending" },
          { id: "member_dues_collection", item: "Collect Member Dues", frequency: "Monthly", status: "pending" },
          { id: "reinvestment_collection", item: "Collect Community Reinvestment", frequency: "Monthly", status: "pending" },
          { id: "annual_report", item: "File Annual Report with State", frequency: "Annual", status: "pending" },
          { id: "tax_return", item: "File Partnership Tax Return (Form 1065)", frequency: "Annual", status: "pending" },
        ],
        academy_508: [
          { id: "board_meeting", item: "Hold Quarterly Board Meeting", frequency: "Quarterly", status: "pending" },
          { id: "board_minutes", item: "Record and File Board Minutes", frequency: "Quarterly", status: "pending" },
          { id: "form_990n", item: "File Form 990-N (e-Postcard)", frequency: "Annual", status: "pending" },
          { id: "annual_report", item: "File Annual Report with State", frequency: "Annual", status: "pending" },
          { id: "conflict_of_interest", item: "Annual Conflict of Interest Disclosure", frequency: "Annual", status: "pending" },
          { id: "donor_acknowledgments", item: "Send Donor Acknowledgments", frequency: "Ongoing", status: "pending" },
          { id: "program_reporting", item: "Document Program Activities", frequency: "Ongoing", status: "pending" },
        ],
      };
      return checklists[input.entityId] || [];
    }),

  getFinancialFlowSummary: protectedProcedure.query(() => {
    return {
      inflows: [
        { source: "External Grants", destination: "508 Treasury", description: "Government and foundation grants for programs" },
        { source: "Donations", destination: "508 Treasury", description: "Tax-deductible charitable contributions" },
        { source: "Service Revenue", destination: "Collective", description: "Revenue from member services and operations" },
        { source: "Member Dues", destination: "Collective", description: "Monthly membership fees" },
        { source: "Community Reinvestment", destination: "Collective Treasury", description: "10% from member business profits" },
        { source: "Media Revenue", destination: "Real-Eye-Nation", description: "Content licensing and production fees" },
        { source: "Tuition", destination: "Academy", description: "Homeschool and trade academy fees" },
      ],
      outflows: [
        { source: "508 Treasury", destination: "Programs", description: "Fund educational and charitable programs" },
        { source: "508 Treasury", destination: "Scholarships", description: "Student financial aid" },
        { source: "508 Treasury", destination: "Grants to Members", description: "Business development grants" },
        { source: "Collective", destination: "Profit Distributions", description: "Quarterly distributions to profit interest holders" },
        { source: "Collective", destination: "Operating Expenses", description: "Salaries, rent, utilities, etc." },
        { source: "Collective", destination: "Member Benefits", description: "Healthcare, training, resources" },
      ],
      allocations: { collective: { academy508: 30, realEyeNation: 20, servicesOperations: 50 } },
    };
  }),

  getInternshipSummary: protectedProcedure.query(() => {
    return {
      totalTracks: 16,
      entities: [
        {
          id: "parent_llc",
          name: "LuvOnPurpose Autonomous Wealth System, LLC",
          tracks: [
            { id: "executive_operations", name: "Executive Operations", duration: "6 months", focus: "Strategic planning, governance, executive support" },
            { id: "finance_accounting", name: "Finance & Accounting", duration: "6 months", focus: "Financial management, reporting, compliance" },
            { id: "legal_compliance", name: "Legal & Compliance", duration: "6 months", focus: "Contract management, regulatory compliance, risk" },
            { id: "business_development", name: "Business Development", duration: "6 months", focus: "Partnership development, market analysis, growth" },
          ],
        },
        {
          id: "collective",
          name: "The The The L.A.W.S. Collective, LLC",
          tracks: [
            { id: "member_services", name: "Member Services", duration: "3-6 months", focus: "Member relations, onboarding, support" },
            { id: "community_operations", name: "Community Operations", duration: "3-6 months", focus: "Event coordination, community programs" },
            { id: "communications", name: "Communications", duration: "3-6 months", focus: "Internal/external communications, marketing" },
            { id: "workforce_development", name: "Workforce Development", duration: "6 months", focus: "Employment programs, contractor management" },
          ],
        },
        {
          id: "academy_508",
          name: "LuvOnPurpose Academy & Outreach",
          tracks: [
            { id: "curriculum_development", name: "Curriculum Development", duration: "6 months", focus: "Course design, content creation" },
            { id: "instruction_support", name: "Instruction & Student Support", duration: "3-6 months", focus: "Teaching assistance, tutoring" },
            { id: "program_administration", name: "Program Administration", duration: "6 months", focus: "Program coordination, enrollment" },
            { id: "nonprofit_management", name: "Nonprofit Management", duration: "6 months", focus: "Grant writing, donor relations" },
          ],
        },
        {
          id: "real_eye_nation",
          name: "Real-Eye-Nation",
          tracks: [
            { id: "content_creation", name: "Content Creation", duration: "3-6 months", focus: "Video production, writing, multimedia" },
            { id: "media_production", name: "Media Production", duration: "6 months", focus: "Audio/video editing, podcasts" },
            { id: "research_documentation", name: "Research & Documentation", duration: "6 months", focus: "Historical research, fact-checking" },
            { id: "digital_marketing", name: "Digital Marketing", duration: "3-6 months", focus: "Social media, digital campaigns" },
          ],
        },
      ],
      careerPathway: [
        { stage: 1, name: "Intern", nextStage: "W-2 Employee or Contractor" },
        { stage: 2, name: "W-2 Employee", nextStage: "Contractor or Business Owner" },
        { stage: 3, name: "Independent Contractor", nextStage: "Business Owner" },
        { stage: 4, name: "Business Owner / Collective Member", nextStage: "Generational Wealth" },
      ],
    };
  }),
});

export default unifiedGovernanceRouter;
