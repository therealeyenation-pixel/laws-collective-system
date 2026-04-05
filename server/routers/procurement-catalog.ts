import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";

// Equipment Package Types
const equipmentPackages = [
  {
    id: "basic_remote",
    name: "Basic Remote",
    description: "Essential setup for entry-level positions",
    items: ["Laptop", "Webcam", "Headset", "Business Phone", "Mobile Internet"],
    cost: 1500,
    tier: "Specialist",
  },
  {
    id: "standard_remote",
    name: "Standard Remote",
    description: "Full remote office setup for coordinators",
    items: ["Laptop", "Monitor", "Webcam", "Headset", "Keyboard/Mouse", "Business Phone", "Mobile Internet"],
    cost: 2500,
    tier: "Coordinator",
  },
  {
    id: "manager_remote",
    name: "Manager Remote",
    description: "Complete manager workstation",
    items: ["Laptop", "Dual Monitors", "Webcam", "Headset", "Full Desk Setup", "Business Phone", "Mobile Internet", "Software Suite"],
    cost: 3500,
    tier: "Manager",
  },
  {
    id: "executive_remote",
    name: "Executive Remote",
    description: "Premium executive office setup",
    items: ["High-end Laptop", "Dual 4K Monitors", "Premium Desk Setup", "Business Phone", "Mobile Internet", "Full Software Suite", "Ergonomic Chair"],
    cost: 5000,
    tier: "Executive, Director",
  },
  {
    id: "design_package",
    name: "Design Package",
    description: "Creative professional workstation",
    items: ["MacBook Pro", "4K Monitor", "Wacom Tablet", "Adobe Creative Suite", "Business Phone", "Mobile Internet"],
    cost: 4500,
    tier: "Design roles",
  },
  {
    id: "media_package",
    name: "Media Package",
    description: "Content creation and production setup",
    items: ["Laptop", "Camera", "Professional Microphone", "Lighting Kit", "Editing Software", "Business Phone", "Mobile Internet"],
    cost: 4000,
    tier: "Media roles",
  },
  {
    id: "finance_package",
    name: "Finance Package",
    description: "Financial operations workstation",
    items: ["Laptop", "Dual Monitors", "QuickBooks License", "Excel Advanced", "Business Phone", "Mobile Internet", "Secure VPN"],
    cost: 3000,
    tier: "Finance roles",
  },
];

// Benefits Packages
const benefitsPackages = [
  {
    id: "standard_benefits",
    name: "Standard Benefits",
    description: "Core benefits package for all employees",
    items: [
      { name: "Health Insurance", monthlyCost: 450, coverage: "Employee + Family" },
      { name: "Dental Insurance", monthlyCost: 75, coverage: "Employee + Family" },
      { name: "Vision Insurance", monthlyCost: 25, coverage: "Employee + Family" },
      { name: "Life Insurance", monthlyCost: 50, coverage: "2x Annual Salary" },
      { name: "401(k) Match", monthlyCost: 0, coverage: "Up to 4% match" },
    ],
    annualCost: 7200,
    tier: "All employees",
  },
  {
    id: "enhanced_benefits",
    name: "Enhanced Benefits",
    description: "Enhanced package for managers and above",
    items: [
      { name: "Health Insurance (Premium)", monthlyCost: 650, coverage: "Employee + Family, Lower Deductible" },
      { name: "Dental Insurance", monthlyCost: 100, coverage: "Employee + Family, Orthodontics" },
      { name: "Vision Insurance", monthlyCost: 40, coverage: "Employee + Family, LASIK Discount" },
      { name: "Life Insurance", monthlyCost: 100, coverage: "3x Annual Salary" },
      { name: "401(k) Match", monthlyCost: 0, coverage: "Up to 6% match" },
      { name: "Professional Development", monthlyCost: 200, coverage: "$2,400/year for training" },
      { name: "Wellness Stipend", monthlyCost: 100, coverage: "Gym, mental health, etc." },
    ],
    annualCost: 14280,
    tier: "Manager and above",
  },
  {
    id: "executive_benefits",
    name: "Executive Benefits",
    description: "Comprehensive package for executives",
    items: [
      { name: "Health Insurance (Executive)", monthlyCost: 850, coverage: "Employee + Family, Concierge" },
      { name: "Dental Insurance", monthlyCost: 150, coverage: "Full coverage" },
      { name: "Vision Insurance", monthlyCost: 60, coverage: "Full coverage" },
      { name: "Life Insurance", monthlyCost: 200, coverage: "4x Annual Salary" },
      { name: "401(k) Match", monthlyCost: 0, coverage: "Up to 8% match" },
      { name: "Professional Development", monthlyCost: 500, coverage: "$6,000/year" },
      { name: "Wellness Stipend", monthlyCost: 250, coverage: "Comprehensive wellness" },
      { name: "Vehicle Allowance", monthlyCost: 500, coverage: "$6,000/year" },
      { name: "Executive Coaching", monthlyCost: 400, coverage: "Monthly sessions" },
    ],
    annualCost: 34920,
    tier: "Executive only",
  },
];

// Startup Costs (one-time per employee)
const startupCosts = [
  { id: "onboarding", name: "Onboarding & Training", cost: 500, description: "Initial training materials and onboarding process" },
  { id: "background_check", name: "Background Check", cost: 150, description: "Employment verification and background screening" },
  { id: "it_setup", name: "IT Account Setup", cost: 100, description: "Email, software licenses, security setup" },
  { id: "office_supplies", name: "Office Supplies", cost: 200, description: "Initial office supply kit" },
  { id: "business_cards", name: "Business Cards & ID", cost: 50, description: "Professional business cards and employee ID" },
];

// Vendor Categories
const vendorCategories = [
  { id: "technology", name: "Technology", vendors: ["Dell", "Apple", "Lenovo", "Microsoft"] },
  { id: "office_furniture", name: "Office Furniture", vendors: ["Herman Miller", "Steelcase", "IKEA Business"] },
  { id: "software", name: "Software", vendors: ["Adobe", "Microsoft 365", "QuickBooks", "Slack"] },
  { id: "telecommunications", name: "Telecommunications", vendors: ["Verizon Business", "AT&T Business", "T-Mobile Business"] },
  { id: "insurance", name: "Insurance", vendors: ["Blue Cross Blue Shield", "Aetna", "United Healthcare"] },
  { id: "payroll", name: "Payroll Services", vendors: ["ADP", "Gusto", "Paychex"] },
];

export const procurementCatalogRouter = router({
  // Get all equipment packages
  getEquipmentPackages: publicProcedure.query(() => {
    return equipmentPackages;
  }),

  // Get equipment package by ID
  getEquipmentPackage: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const pkg = equipmentPackages.find((p) => p.id === input.id);
      if (!pkg) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Equipment package not found" });
      }
      return pkg;
    }),

  // Get all benefits packages
  getBenefitsPackages: publicProcedure.query(() => {
    return benefitsPackages;
  }),

  // Get benefits package by ID
  getBenefitsPackage: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const pkg = benefitsPackages.find((p) => p.id === input.id);
      if (!pkg) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Benefits package not found" });
      }
      return pkg;
    }),

  // Get startup costs
  getStartupCosts: publicProcedure.query(() => {
    return startupCosts;
  }),

  // Get vendor categories
  getVendorCategories: publicProcedure.query(() => {
    return vendorCategories;
  }),

  // Calculate total package cost for a position
  calculatePackageCost: publicProcedure
    .input(
      z.object({
        tier: z.enum(["specialist", "coordinator", "manager", "director", "executive"]),
        annualSalary: z.number(),
        equipmentPackageId: z.string().optional(),
      })
    )
    .query(({ input }) => {
      // Determine equipment package
      let equipmentCost = 2500; // Default
      if (input.equipmentPackageId) {
        const pkg = equipmentPackages.find((p) => p.id === input.equipmentPackageId);
        if (pkg) equipmentCost = pkg.cost;
      } else {
        // Auto-select based on tier
        switch (input.tier) {
          case "executive":
            equipmentCost = 5000;
            break;
          case "director":
            equipmentCost = 5000;
            break;
          case "manager":
            equipmentCost = 3500;
            break;
          case "coordinator":
            equipmentCost = 2500;
            break;
          case "specialist":
            equipmentCost = 1500;
            break;
        }
      }

      // Determine benefits package
      let benefitsAnnual = 7200; // Standard
      if (input.tier === "executive" || input.tier === "director") {
        benefitsAnnual = 34920;
      } else if (input.tier === "manager") {
        benefitsAnnual = 14280;
      }

      // Calculate startup costs
      const totalStartup = startupCosts.reduce((sum, cost) => sum + cost.cost, 0);

      return {
        salary: input.annualSalary,
        equipment: equipmentCost,
        benefits: benefitsAnnual,
        startup: totalStartup,
        year1Total: input.annualSalary + equipmentCost + benefitsAnnual + totalStartup,
        ongoingAnnual: input.annualSalary + benefitsAnnual,
        breakdown: {
          equipmentPackage: equipmentPackages.find((p) => p.cost === equipmentCost)?.name || "Standard Remote",
          benefitsPackage:
            input.tier === "executive" || input.tier === "director"
              ? "Executive Benefits"
              : input.tier === "manager"
              ? "Enhanced Benefits"
              : "Standard Benefits",
          startupItems: startupCosts,
        },
      };
    }),

  // Generate full procurement budget for contingency offers
  generateBudget: publicProcedure
    .input(
      z.object({
        candidates: z.array(
          z.object({
            name: z.string(),
            position: z.string(),
            tier: z.enum(["specialist", "coordinator", "manager", "director", "executive"]),
            salary: z.number(),
            equipmentPackageId: z.string().optional(),
          })
        ),
      })
    )
    .mutation(({ input }) => {
      const results = input.candidates.map((candidate) => {
        let equipmentCost = 2500;
        if (candidate.equipmentPackageId) {
          const pkg = equipmentPackages.find((p) => p.id === candidate.equipmentPackageId);
          if (pkg) equipmentCost = pkg.cost;
        } else {
          switch (candidate.tier) {
            case "executive":
            case "director":
              equipmentCost = 5000;
              break;
            case "manager":
              equipmentCost = 3500;
              break;
            case "coordinator":
              equipmentCost = 2500;
              break;
            case "specialist":
              equipmentCost = 1500;
              break;
          }
        }

        let benefitsAnnual = 7200;
        if (candidate.tier === "executive" || candidate.tier === "director") {
          benefitsAnnual = 34920;
        } else if (candidate.tier === "manager") {
          benefitsAnnual = 14280;
        }

        const totalStartup = startupCosts.reduce((sum, cost) => sum + cost.cost, 0);

        return {
          ...candidate,
          equipment: equipmentCost,
          benefits: benefitsAnnual,
          startup: totalStartup,
          year1Total: candidate.salary + equipmentCost + benefitsAnnual + totalStartup,
        };
      });

      const totals = {
        totalCandidates: results.length,
        totalSalary: results.reduce((sum, r) => sum + r.salary, 0),
        totalEquipment: results.reduce((sum, r) => sum + r.equipment, 0),
        totalBenefits: results.reduce((sum, r) => sum + r.benefits, 0),
        totalStartup: results.reduce((sum, r) => sum + r.startup, 0),
        grandTotal: results.reduce((sum, r) => sum + r.year1Total, 0),
      };

      return { candidates: results, totals };
    }),
});
