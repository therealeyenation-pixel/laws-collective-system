/**
 * Investment Employment Opportunities & Career Pathways Router
 * Phase 32.6: Employment detection, career progression, W-2 to contractor pathways
 * 
 * Features:
 * - Investment manager and portfolio analyst positions
 * - Career progression tracking
 * - W-2 to contractor pathway guidance
 * - Employment opportunity matching
 * - Salary and compensation tracking
 * - Career milestone achievements
 */

import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { db } from "../db";
import { desc, eq, and, gte, lte } from "drizzle-orm";

/**
 * Get available investment employment opportunities
 */
export const getEmploymentOpportunities = publicProcedure
  .input(
    z.object({
      employmentType: z.enum(["w2", "contractor", "both"]).optional().default("both"),
      careerLevel: z.enum(["entry", "mid", "senior", "executive"]).optional(),
      limit: z.number().default(20),
    })
  )
  .query(async ({ input }) => {
    const opportunities = [
      {
        id: 1,
        title: "Investment Portfolio Analyst",
        company: "Collective Investment Partners",
        employmentType: "w2",
        careerLevel: "entry",
        salary: { min: 55000, max: 75000, currency: "USD" },
        description: "Analyze investment portfolios and provide recommendations to collective members",
        requirements: [
          "Investment Fundamentals certification",
          "2+ years finance experience",
          "Strong analytical skills",
        ],
        benefits: ["Health insurance", "401k matching", "Professional development"],
        location: "Remote",
        postedDate: new Date("2026-03-15"),
        applicants: 12,
      },
      {
        id: 2,
        title: "Investment Manager",
        company: "Collective Investment Partners",
        employmentType: "w2",
        careerLevel: "mid",
        salary: { min: 85000, max: 120000, currency: "USD" },
        description: "Manage collective investment pools and oversee portfolio performance",
        requirements: [
          "Portfolio Manager certification",
          "5+ years investment management",
          "Team leadership experience",
        ],
        benefits: ["Health insurance", "401k matching", "Performance bonus", "Stock options"],
        location: "Remote",
        postedDate: new Date("2026-03-10"),
        applicants: 8,
      },
      {
        id: 3,
        title: "Freelance Investment Consultant",
        company: "Self-Employed",
        employmentType: "contractor",
        careerLevel: "mid",
        salary: { min: 100, max: 250, currency: "USD/hour" },
        description: "Provide investment consulting services to collective members on contract basis",
        requirements: [
          "Portfolio Manager certification",
          "3+ years investment experience",
          "Client communication skills",
        ],
        benefits: ["Flexible schedule", "Multiple clients", "No overhead"],
        location: "Remote",
        postedDate: new Date("2026-03-12"),
        applicants: 5,
      },
      {
        id: 4,
        title: "Senior Investment Advisor",
        company: "Collective Investment Partners",
        employmentType: "w2",
        careerLevel: "senior",
        salary: { min: 130000, max: 180000, currency: "USD" },
        description: "Lead investment strategy and mentor junior team members",
        requirements: [
          "Investment Advisor certification",
          "10+ years investment experience",
          "Team management experience",
        ],
        benefits: [
          "Health insurance",
          "401k matching",
          "Performance bonus",
          "Stock options",
          "Executive benefits",
        ],
        location: "Remote",
        postedDate: new Date("2026-03-08"),
        applicants: 3,
      },
      {
        id: 5,
        title: "Investment Education Specialist",
        company: "Collective Investment Partners",
        employmentType: "w2",
        careerLevel: "entry",
        salary: { min: 50000, max: 70000, currency: "USD" },
        description: "Develop and deliver investment education content to collective members",
        requirements: [
          "Investment Literacy certification",
          "Teaching or training experience",
          "Strong communication skills",
        ],
        benefits: ["Health insurance", "401k matching", "Professional development"],
        location: "Remote",
        postedDate: new Date("2026-03-14"),
        applicants: 15,
      },
      {
        id: 6,
        title: "Contract Portfolio Analyst",
        company: "Various Clients",
        employmentType: "contractor",
        careerLevel: "entry",
        salary: { min: 60, max: 100, currency: "USD/hour" },
        description: "Provide portfolio analysis services on a contract basis",
        requirements: [
          "Investment Fundamentals certification",
          "Analytical skills",
          "Excel proficiency",
        ],
        benefits: ["Flexible work", "Project-based", "Skill building"],
        location: "Remote",
        postedDate: new Date("2026-03-13"),
        applicants: 22,
      },
    ];

    let filtered = opportunities;

    if (input.employmentType !== "both") {
      filtered = filtered.filter((opp) => opp.employmentType === input.employmentType);
    }

    if (input.careerLevel) {
      filtered = filtered.filter((opp) => opp.careerLevel === input.careerLevel);
    }

    return filtered.slice(0, input.limit);
  });

/**
 * Get W-2 to contractor pathway guidance
 */
export const getW2ToContractorPathway = protectedProcedure.query(async ({ ctx }) => {
  return {
    userId: ctx.user.id,
    currentStatus: "w2_employed",
    pathway: {
      phase1: {
        title: "Preparation Phase (Months 1-3)",
        description: "Build financial foundation and contractor skills",
        steps: [
          "Complete Portfolio Manager certification",
          "Build 6-month emergency fund",
          "Establish business structure (LLC/S-Corp)",
          "Set up accounting system",
          "Build client network",
        ],
        estimatedCost: 2500,
        estimatedTime: 12,
      },
      phase2: {
        title: "Transition Phase (Months 4-6)",
        description: "Start contractor work while employed",
        steps: [
          "Take on 1-2 contract clients",
          "Establish pricing structure",
          "Build portfolio of work",
          "Develop marketing materials",
          "Create service packages",
        ],
        estimatedIncome: 5000,
        estimatedTime: 12,
      },
      phase3: {
        title: "Launch Phase (Months 7-12)",
        description: "Transition to full-time contractor",
        steps: [
          "Achieve $10k/month contract revenue",
          "Build 5-10 stable clients",
          "Establish contractor reputation",
          "Set up tax planning",
          "Leave W-2 employment",
        ],
        estimatedIncome: 60000,
        estimatedTime: 24,
      },
      phase4: {
        title: "Scale Phase (Year 2+)",
        description: "Grow contractor business",
        steps: [
          "Expand to $20k/month revenue",
          "Build team of contractors",
          "Develop signature service",
          "Create passive income streams",
          "Mentor other contractors",
        ],
        estimatedIncome: 240000,
        estimatedTime: null,
      },
    },
    riskFactors: [
      "Income variability",
      "No employer benefits",
      "Self-employment taxes",
      "Client acquisition challenges",
      "Market downturns",
    ],
    mitigationStrategies: [
      "Maintain 12-month emergency fund",
      "Diversify client base (5-10 clients)",
      "Build passive income streams",
      "Invest in professional development",
      "Network within collective",
    ],
    estimatedTotalTime: 36,
    estimatedTotalCost: 2500,
    estimatedTotalIncome: 305000,
  };
});

/**
 * Get member's career progression tracking
 */
export const getMemberCareerProgress = protectedProcedure.query(async ({ ctx }) => {
  return {
    userId: ctx.user.id,
    currentPosition: {
      title: "Portfolio Analyst",
      company: "Collective Investment Partners",
      employmentType: "w2",
      startDate: new Date("2024-06-01"),
      salary: 65000,
      careerLevel: "entry",
    },
    careerHistory: [
      {
        position: "Investment Associate",
        company: "Financial Services Inc",
        startDate: new Date("2022-01-01"),
        endDate: new Date("2024-05-31"),
        duration: 29,
        salary: 55000,
      },
    ],
    certifications: [
      {
        name: "Investment Fundamentals Certificate",
        earnedDate: new Date("2026-01-15"),
        provider: "Collective Investment Partners",
        expiryDate: null,
      },
      {
        name: "Portfolio Manager Certification",
        earnedDate: new Date("2026-02-20"),
        provider: "Collective Investment Partners",
        expiryDate: null,
      },
    ],
    skills: [
      { name: "Portfolio Analysis", level: "advanced", endorsements: 12 },
      { name: "Risk Management", level: "intermediate", endorsements: 8 },
      { name: "Financial Modeling", level: "intermediate", endorsements: 6 },
      { name: "Investment Strategy", level: "beginner", endorsements: 3 },
    ],
    careerGoals: [
      {
        goal: "Become Senior Investment Advisor",
        targetDate: new Date("2028-12-31"),
        progress: 40,
        requiredCertifications: ["Investment Advisor Certification"],
        requiredExperience: "10 years total",
      },
      {
        goal: "Transition to Contract Work",
        targetDate: new Date("2027-06-30"),
        progress: 25,
        requiredCertifications: ["Portfolio Manager Certification"],
        requiredExperience: "5 years total",
      },
    ],
    nextMilestone: {
      title: "Earn Investment Advisor Certification",
      completionDate: new Date("2026-06-30"),
      progress: 60,
      requiredCourses: ["Advanced Strategies", "Risk Management"],
    },
  };
});

/**
 * Get employment opportunity recommendations
 */
export const getEmploymentRecommendations = protectedProcedure.query(async ({ ctx }) => {
  return {
    userId: ctx.user.id,
    recommendations: [
      {
        opportunityId: 2,
        title: "Investment Manager",
        matchScore: 85,
        reasoning: [
          "You have Portfolio Manager certification",
          "You have 3+ years investment experience",
          "Your skills align with requirements",
          "Salary aligns with career progression",
        ],
        nextSteps: [
          "Review full job description",
          "Prepare application materials",
          "Schedule informational interview",
          "Apply for position",
        ],
      },
      {
        opportunityId: 3,
        title: "Freelance Investment Consultant",
        matchScore: 72,
        reasoning: [
          "You have Portfolio Manager certification",
          "Contract work aligns with your goals",
          "Flexible schedule matches preferences",
          "Hourly rate is competitive",
        ],
        nextSteps: [
          "Set up contractor profile",
          "Define service offerings",
          "Build portfolio of work",
          "Start networking with potential clients",
        ],
      },
      {
        opportunityId: 5,
        title: "Investment Education Specialist",
        matchScore: 68,
        reasoning: [
          "You have teaching experience",
          "You understand investment concepts",
          "Role aligns with education goals",
          "Stable W-2 employment",
        ],
        nextSteps: [
          "Develop curriculum samples",
          "Prepare teaching portfolio",
          "Schedule interview",
          "Apply for position",
        ],
      },
    ],
    careerPathRecommendation: "W-2 to Contractor Transition",
    estimatedTimeToTransition: 18,
    readinessScore: 65,
    readinessFactors: {
      certifications: "Complete - 2/3 required",
      experience: "Developing - 3 years of 5 needed",
      financialReadiness: "Moderate - 4 months emergency fund",
      networkReadiness: "Good - 20+ professional contacts",
      skillReadiness: "Strong - Advanced in 1 area",
    },
  };
});

/**
 * Get salary and compensation data for role
 */
export const getRoleSalaryData = publicProcedure
  .input(z.object({ roleTitle: z.string(), careerLevel: z.string() }))
  .query(async ({ input }) => {
    const salaryData: Record<string, any> = {
      "portfolio_analyst_entry": {
        role: "Portfolio Analyst",
        level: "entry",
        salaryRange: { min: 50000, max: 75000, median: 62500 },
        bonusRange: { min: 0, max: 10000, median: 5000 },
        totalCompensation: { min: 50000, max: 85000, median: 67500 },
        benefits: ["Health", "401k", "PTO", "Professional development"],
        jobMarketTrend: "Growing - 8% annual growth",
        marketPosition: "Below average",
      },
      "investment_manager_mid": {
        role: "Investment Manager",
        level: "mid",
        salaryRange: { min: 80000, max: 130000, median: 105000 },
        bonusRange: { min: 10000, max: 50000, median: 25000 },
        totalCompensation: { min: 90000, max: 180000, median: 130000 },
        benefits: ["Health", "401k", "PTO", "Stock options", "Performance bonus"],
        jobMarketTrend: "Strong - 12% annual growth",
        marketPosition: "Average",
      },
      "senior_advisor_senior": {
        role: "Senior Investment Advisor",
        level: "senior",
        salaryRange: { min: 120000, max: 200000, median: 160000 },
        bonusRange: { min: 30000, max: 100000, median: 60000 },
        totalCompensation: { min: 150000, max: 300000, median: 220000 },
        benefits: [
          "Health",
          "401k",
          "PTO",
          "Stock options",
          "Performance bonus",
          "Executive benefits",
        ],
        jobMarketTrend: "Stable - 5% annual growth",
        marketPosition: "Above average",
      },
    };

    const key = `${input.roleTitle.toLowerCase().replace(/\s+/g, "_")}_${input.careerLevel}`;
    return salaryData[key] || { error: "Role data not found" };
  });

/**
 * Track employment milestone achievement
 */
export const trackEmploymentMilestone = protectedProcedure
  .input(
    z.object({
      milestoneType: z.enum(["certification", "promotion", "salary_increase", "role_change"]),
      description: z.string(),
      previousValue: z.string().optional(),
      newValue: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    return {
      success: true,
      milestone: {
        userId: ctx.user.id,
        type: input.milestoneType,
        description: input.description,
        previousValue: input.previousValue,
        newValue: input.newValue,
        achievedAt: new Date(),
        tokenReward: 100,
      },
      message: `Congratulations on your ${input.milestoneType}!`,
    };
  });

/**
 * Get contractor readiness assessment
 */
export const getContractorReadinessAssessment = protectedProcedure.query(async ({ ctx }) => {
  return {
    userId: ctx.user.id,
    overallReadiness: 68,
    readinessBreakdown: {
      financialReadiness: {
        score: 65,
        status: "Moderate",
        factors: {
          emergencyFund: { status: "Good", months: 4, target: 12 },
          businessCapital: { status: "Needs work", available: 5000, recommended: 15000 },
          creditScore: { status: "Good", score: 720 },
          debtLevel: { status: "Moderate", totalDebt: 25000 },
        },
        recommendations: [
          "Build emergency fund to 12 months",
          "Save additional $10k for business setup",
          "Pay down high-interest debt",
        ],
      },
      certificationReadiness: {
        score: 90,
        status: "Excellent",
        certifications: {
          required: [
            { name: "Portfolio Manager Certification", status: "Completed" },
            { name: "Investment Advisor Certification", status: "In Progress (60%)" },
          ],
          recommended: [
            { name: "Tax Planning Certification", status: "Not started" },
            { name: "Business Management Certification", status: "Not started" },
          ],
        },
        recommendations: [
          "Complete Investment Advisor Certification",
          "Consider tax planning certification",
          "Take business management course",
        ],
      },
      experienceReadiness: {
        score: 70,
        status: "Good",
        experience: {
          totalYears: 3,
          targetYears: 5,
          yearsToTarget: 2,
          relevantProjects: 12,
          clientExperience: "Limited - 2 contract projects",
        },
        recommendations: [
          "Take on more contract work while employed",
          "Build portfolio of successful projects",
          "Develop case studies for marketing",
        ],
      },
      networkReadiness: {
        score: 75,
        status: "Good",
        network: {
          professionalContacts: 28,
          targetContacts: 50,
          clientLeads: 8,
          mentors: 2,
          referralSources: 5,
        },
        recommendations: [
          "Expand network to 50+ contacts",
          "Develop relationships with 5+ potential clients",
          "Find additional mentors in contractor space",
        ],
      },
      skillReadiness: {
        score: 80,
        status: "Strong",
        skills: {
          coreSkills: ["Portfolio Analysis", "Risk Management", "Financial Modeling"],
          businessSkills: ["Client communication", "Project management", "Sales"],
          technicalSkills: ["Excel", "Bloomberg Terminal", "Python"],
        },
        recommendations: [
          "Strengthen sales and marketing skills",
          "Learn business accounting software",
          "Develop thought leadership content",
        ],
      },
    },
    actionPlan: [
      {
        priority: "High",
        action: "Complete Investment Advisor Certification",
        timeline: "3 months",
        impact: "Unlock senior opportunities",
      },
      {
        priority: "High",
        action: "Build emergency fund to 12 months",
        timeline: "12 months",
        impact: "Financial stability for transition",
      },
      {
        priority: "Medium",
        action: "Take on 2-3 contract projects",
        timeline: "6 months",
        impact: "Build contractor experience",
      },
      {
        priority: "Medium",
        action: "Expand professional network to 50+",
        timeline: "6 months",
        impact: "Client acquisition pipeline",
      },
      {
        priority: "Low",
        action: "Take business management course",
        timeline: "3 months",
        impact: "Business operation skills",
      },
    ],
    estimatedReadyDate: new Date("2027-09-01"),
    estimatedMonthsToReady: 18,
  };
});

/**
 * Get career advancement milestones
 */
export const getCareerAdvancementMilestones = protectedProcedure.query(async ({ ctx }) => {
  return {
    userId: ctx.user.id,
    currentLevel: "entry",
    milestones: [
      {
        level: "mid",
        title: "Promotion to Senior Analyst",
        requirements: [
          "3+ years experience",
          "Portfolio Manager certification",
          "Manage $5M+ in assets",
          "Mentor 1+ junior analyst",
        ],
        estimatedTimeframe: "18-24 months",
        salaryIncrease: { from: 65000, to: 95000, increase: 46 },
        progress: 40,
      },
      {
        level: "senior",
        title: "Promotion to Investment Manager",
        requirements: [
          "5+ years experience",
          "Investment Advisor certification",
          "Manage $20M+ in assets",
          "Lead team of 3+ analysts",
          "Develop investment strategy",
        ],
        estimatedTimeframe: "36-48 months",
        salaryIncrease: { from: 95000, to: 140000, increase: 47 },
        progress: 20,
      },
      {
        level: "executive",
        title: "Promotion to Director of Investments",
        requirements: [
          "8+ years experience",
          "Investment Advisor certification",
          "Manage $100M+ in assets",
          "Lead team of 10+ professionals",
          "Set firm investment strategy",
          "MBA or equivalent",
        ],
        estimatedTimeframe: "60+ months",
        salaryIncrease: { from: 140000, to: 200000, increase: 43 },
        progress: 5,
      },
    ],
    nextMilestone: {
      level: "mid",
      title: "Promotion to Senior Analyst",
      daysUntilEligible: 547,
      requiredActions: [
        "Earn Portfolio Manager certification (Complete)",
        "Gain 3+ years experience (1 year 9 months remaining)",
        "Manage $5M+ in assets (Start managing larger portfolios)",
        "Mentor 1+ junior analyst (Volunteer to mentor)",
      ],
    },
  };
});

export const employmentOpportunitiesRouter = router({
  getEmploymentOpportunities,
  getW2ToContractorPathway,
  getMemberCareerProgress,
  getEmploymentRecommendations,
  getRoleSalaryData,
  trackEmploymentMilestone,
  getContractorReadinessAssessment,
  getCareerAdvancementMilestones,
});
