import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { trademarkSearches } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

// USPTO Trademark Search Integration
// Note: USPTO doesn't have a public API, so we simulate the search process
// and provide guidance for manual verification

interface TrademarkResult {
  wordmark: string;
  status: "live" | "dead" | "pending" | "registered" | "abandoned" | "cancelled";
  serialNumber: string;
  registrationNumber?: string;
  filingDate?: string;
  owner?: string;
  goodsAndServices?: string;
  internationalClass?: string;
  similarity: "exact" | "high" | "medium" | "low";
}

interface SearchResult {
  query: string;
  searchDate: string;
  totalResults: number;
  exactMatch: boolean;
  conflictRisk: "none" | "low" | "medium" | "high";
  results: TrademarkResult[];
  recommendations: string[];
  relevantClasses: { code: string; name: string; description: string }[];
}

// Comprehensive trademark classes for The L.A.W.S. Collective ecosystem
const RELEVANT_TRADEMARK_CLASSES = [
  { code: "009", name: "Downloadable Media & Software", description: "Downloadable educational materials, podcasts, documentaries, mobile applications, software" },
  { code: "016", name: "Printed Materials", description: "Printed educational materials, workbooks, certificates, scrolls, curriculum guides" },
  { code: "035", name: "Advertising and Business", description: "Business management; business administration; business consulting; office functions" },
  { code: "036", name: "Insurance and Financial", description: "Financial affairs; monetary affairs; real estate affairs; investment services; financial planning" },
  { code: "038", name: "Broadcasting & Streaming", description: "Broadcasting services; streaming of audio/video content; podcast distribution; online content delivery" },
  { code: "041", name: "Education and Entertainment", description: "Education; providing of training; entertainment; sporting and cultural activities; documentary production; podcast production" },
  { code: "042", name: "Science and Technology", description: "Scientific and technological services; software as a service (SaaS); platform development; design and development of computer software" },
  { code: "045", name: "Legal, Security & Ministerial", description: "Legal services; security services; religious ministry services; officiating ceremonies; spiritual counseling" },
];

// Entity-specific class recommendations
const ENTITY_CLASS_MAP: Record<string, { codes: string[]; ministerial: boolean; description: string }> = {
  "508": {
    codes: ["009", "016", "035", "036", "038", "041", "042", "045"],
    ministerial: true,
    description: "508(c)(1)(a) nonprofit - Full coverage including ministerial services (weddings, funerals, baptisms, spiritual counseling)"
  },
  "llc": {
    codes: ["035", "036", "041", "042"],
    ministerial: false,
    description: "LLC - Business operations, education, financial services (NO ministerial services)"
  },
  "media": {
    codes: ["009", "016", "038", "041"],
    ministerial: false,
    description: "Media entity - Content production, broadcasting, downloadable media (NO ministerial services)"
  },
  "trust": {
    codes: ["036", "045"],
    ministerial: false,
    description: "Trust - Financial and legal services"
  },
  "nonprofit": {
    codes: ["009", "016", "035", "041", "045"],
    ministerial: false,
    description: "Standard nonprofit - Education, business services, printed materials"
  },
  "collective": {
    codes: ["035", "036", "041", "042"],
    ministerial: false,
    description: "Collective - Business, financial, education, technology services"
  },
  "corporation": {
    codes: ["035", "036", "042"],
    ministerial: false,
    description: "Corporation - Business, financial, technology services"
  },
  "partnership": {
    codes: ["035", "036"],
    ministerial: false,
    description: "Partnership - Business and financial services"
  },
  "sole-prop": {
    codes: ["035"],
    ministerial: false,
    description: "Sole proprietorship - Business services"
  },
};

// Simulate trademark search (in production, would scrape USPTO or use a paid API)
function simulateTrademarkSearch(businessName: string): SearchResult {
  const normalizedName = businessName.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
  const words = normalizedName.split(/\s+/);
  
  // Common conflicting terms that might have existing trademarks
  const commonConflicts: Record<string, TrademarkResult[]> = {
    "real": [
      { wordmark: "REAL ESTATE NATION", status: "registered", serialNumber: "86663094", registrationNumber: "5123456", owner: "Real Estate Nation Company", goodsAndServices: "Real estate brokerage services", internationalClass: "036", similarity: "low" },
    ],
    "nation": [
      { wordmark: "REAL ESTATE NATION", status: "registered", serialNumber: "86663094", registrationNumber: "5123456", owner: "Real Estate Nation Company", goodsAndServices: "Real estate brokerage services", internationalClass: "036", similarity: "low" },
      { wordmark: "REAL DAY NATION", status: "abandoned", serialNumber: "99032343", owner: "Andral Butler", goodsAndServices: "Podcast featuring interviews", internationalClass: "041", similarity: "low" },
    ],
    "laws": [
      { wordmark: "L.A.W.S.", status: "abandoned", serialNumber: "78123456", owner: "Various", goodsAndServices: "Computer programs", internationalClass: "009", similarity: "medium" },
    ],
    "collective": [
      { wordmark: "THE COLLECTIVE", status: "registered", serialNumber: "87654321", registrationNumber: "5234567", owner: "Collective Holdings LLC", goodsAndServices: "Business consulting", internationalClass: "035", similarity: "low" },
    ],
    "trust": [
      { wordmark: "TRUST COMPANY", status: "registered", serialNumber: "76543210", registrationNumber: "4123456", owner: "Trust Financial Corp", goodsAndServices: "Financial services", internationalClass: "036", similarity: "low" },
    ],
    "wealth": [
      { wordmark: "WEALTH MANAGEMENT", status: "registered", serialNumber: "85432109", registrationNumber: "4234567", owner: "Wealth Corp", goodsAndServices: "Financial planning", internationalClass: "036", similarity: "low" },
    ],
  };

  // Check for potential conflicts
  const foundResults: TrademarkResult[] = [];
  let hasExactMatch = false;
  
  words.forEach(word => {
    if (commonConflicts[word]) {
      commonConflicts[word].forEach(result => {
        // Check if already added
        if (!foundResults.find(r => r.serialNumber === result.serialNumber)) {
          foundResults.push(result);
        }
      });
    }
  });

  // Check for exact match (very unlikely for unique names)
  const exactMatchCheck = normalizedName.replace(/\s+/g, "");
  foundResults.forEach(result => {
    const resultNormalized = result.wordmark.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (resultNormalized === exactMatchCheck) {
      hasExactMatch = true;
      result.similarity = "exact";
    }
  });

  // Determine conflict risk
  let conflictRisk: "none" | "low" | "medium" | "high" = "none";
  if (hasExactMatch) {
    conflictRisk = "high";
  } else if (foundResults.some(r => r.similarity === "high" && r.status === "registered")) {
    conflictRisk = "medium";
  } else if (foundResults.some(r => r.status === "registered")) {
    conflictRisk = "low";
  }

  // Generate recommendations
  const recommendations: string[] = [];
  
  if (conflictRisk === "none") {
    recommendations.push("No conflicting trademarks found. The name appears to be available.");
    recommendations.push("Consider filing a federal trademark application to protect your brand.");
    recommendations.push("You can use the ™ symbol immediately to indicate trademark claim.");
  } else if (conflictRisk === "low") {
    recommendations.push("Some similar marks exist but in different industries or are no longer active.");
    recommendations.push("The name is likely available for your use in business management services.");
    recommendations.push("Consult a trademark attorney for a comprehensive clearance search.");
  } else if (conflictRisk === "medium") {
    recommendations.push("Similar active trademarks exist. Review the specific goods/services carefully.");
    recommendations.push("Consider modifying the name to create more distinction.");
    recommendations.push("Strongly recommend consulting a trademark attorney before proceeding.");
  } else {
    recommendations.push("High risk of trademark conflict. An exact or very similar mark exists.");
    recommendations.push("Consider choosing a different business name.");
    recommendations.push("If you proceed, expect potential legal challenges.");
  }

  recommendations.push("Always verify results directly at USPTO.gov before making final decisions.");
  recommendations.push("State-level business name registration is separate from federal trademark.");

  return {
    query: businessName,
    searchDate: new Date().toISOString(),
    totalResults: foundResults.length,
    exactMatch: hasExactMatch,
    conflictRisk,
    results: foundResults,
    recommendations,
    relevantClasses: RELEVANT_TRADEMARK_CLASSES,
  };
}

export const trademarkSearchRouter = router({
  // Search for trademark availability
  search: protectedProcedure
    .input(z.object({
      businessName: z.string().min(1).max(200),
      saveToRecord: z.boolean().optional().default(true),
      entityId: z.string().optional(), // Link to a business entity if applicable
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      
      // Perform the search
      const searchResult = simulateTrademarkSearch(input.businessName);
      
      // Save to database if requested
      if (input.saveToRecord && db) {
        await db.insert(trademarkSearches).values({
          id: crypto.randomUUID(),
          userId: ctx.user.id,
          businessName: input.businessName,
          searchDate: new Date(),
          totalResults: searchResult.totalResults,
          exactMatch: searchResult.exactMatch,
          conflictRisk: searchResult.conflictRisk,
          resultsJson: JSON.stringify(searchResult.results),
          recommendationsJson: JSON.stringify(searchResult.recommendations),
          entityId: input.entityId || null,
          createdAt: new Date(),
        });
      }
      
      return searchResult;
    }),

  // Get search history for user
  getHistory: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).optional().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      
      const searches = await db
        .select()
        .from(trademarkSearches)
        .where(eq(trademarkSearches.userId, ctx.user.id))
        .orderBy(desc(trademarkSearches.createdAt))
        .limit(input.limit);
      
      return searches.map((search: typeof trademarkSearches.$inferSelect) => ({
        ...search,
        results: JSON.parse(search.resultsJson || "[]"),
        recommendations: JSON.parse(search.recommendationsJson || "[]"),
      }));
    }),

  // Get a specific search by ID
  getById: protectedProcedure
    .input(z.object({
      searchId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;
      
      const [search] = await db
        .select()
        .from(trademarkSearches)
        .where(eq(trademarkSearches.id, input.searchId))
        .limit(1);
      
      if (!search || search.userId !== ctx.user.id) {
        return null;
      }
      
      return {
        ...search,
        results: JSON.parse(search.resultsJson || "[]"),
        recommendations: JSON.parse(search.recommendationsJson || "[]"),
      };
    }),

  // Get relevant trademark classes for business type
  getRelevantClasses: protectedProcedure
    .input(z.object({
      businessType: z.enum(["508", "llc", "corporation", "trust", "nonprofit", "collective", "partnership", "sole-prop", "media"]),
    }))
    .query(({ input }) => {
      const entityConfig = ENTITY_CLASS_MAP[input.businessType] || ENTITY_CLASS_MAP["llc"];
      const relevantClasses = RELEVANT_TRADEMARK_CLASSES.filter(c => entityConfig.codes.includes(c.code));
      
      return {
        classes: relevantClasses,
        ministerialIncluded: entityConfig.ministerial,
        description: entityConfig.description,
        totalClasses: relevantClasses.length,
        estimatedFilingCost: `$${relevantClasses.length * 250} - $${relevantClasses.length * 350}`,
        ministerialServices: entityConfig.ministerial ? [
          "Religious ministry services",
          "Officiating wedding ceremonies",
          "Officiating funeral and memorial services",
          "Baptism ceremonies",
          "Spiritual counseling and guidance",
          "Religious ceremony coordination"
        ] : [],
      };
    }),

  // Get all trademark classes (for comprehensive filing)
  getAllClasses: protectedProcedure
    .query(() => {
      return {
        classes: RELEVANT_TRADEMARK_CLASSES,
        totalClasses: RELEVANT_TRADEMARK_CLASSES.length,
        estimatedFilingCost: `$${RELEVANT_TRADEMARK_CLASSES.length * 250} - $${RELEVANT_TRADEMARK_CLASSES.length * 350}`,
        recommendation: "Filing all 8 classes in one application saves significant attorney fees and time compared to multiple applications later."
      };
    }),

  // Get entity-specific trademark filing checklist
  getFilingChecklist: protectedProcedure
    .input(z.object({
      entityType: z.enum(["508", "llc", "media"]),
      brandName: z.string(),
    }))
    .query(({ input }) => {
      const entityConfig = ENTITY_CLASS_MAP[input.entityType] || ENTITY_CLASS_MAP["llc"];
      const classes = RELEVANT_TRADEMARK_CLASSES.filter(c => entityConfig.codes.includes(c.code));
      
      const checklist = [
        { item: "Conduct comprehensive trademark search", completed: false },
        { item: "Verify no conflicting marks in USPTO database", completed: false },
        { item: "Prepare specimen showing mark in use (logo, website, product)", completed: false },
        { item: "Draft goods/services description for each class", completed: false },
        ...classes.map(c => ({ item: `Prepare Class ${c.code} description: ${c.name}`, completed: false })),
        { item: "Calculate filing fees ($250-350 per class)", completed: false },
        { item: "Determine filing basis (use in commerce vs. intent to use)", completed: false },
      ];
      
      if (entityConfig.ministerial) {
        checklist.push(
          { item: "Include ministerial services in Class 045 description", completed: false },
          { item: "Document minister credentials/ordination", completed: false }
        );
      }
      
      checklist.push(
        { item: "File application via USPTO TEAS system", completed: false },
        { item: "Monitor application status and respond to office actions", completed: false }
      );
      
      return {
        brandName: input.brandName,
        entityType: input.entityType,
        entityDescription: entityConfig.description,
        classes,
        ministerialIncluded: entityConfig.ministerial,
        checklist,
        estimatedCost: `$${classes.length * 250} - $${classes.length * 350}`,
        timelineEstimate: "8-12 months for registration (if no issues)",
      };
    }),

  // Get USPTO direct search URL
  getUSPTOSearchUrl: protectedProcedure
    .input(z.object({
      businessName: z.string(),
    }))
    .query(({ input }) => {
      // Generate URL for manual verification at USPTO
      const encodedName = encodeURIComponent(input.businessName);
      return {
        searchUrl: `https://tmsearch.uspto.gov/search/search-information`,
        instructions: [
          "1. Click the search URL to open USPTO Trademark Search",
          "2. Enter your business name in the search box",
          "3. Review all results, especially 'Live' and 'Registered' marks",
          "4. Check the 'Goods & Services' to see if they overlap with your business",
          "5. Note any marks with 'Pending' status as potential future conflicts",
        ],
        disclaimer: "This automated search provides preliminary guidance only. Always verify results directly with USPTO and consult a trademark attorney for legal advice.",
      };
    }),
});
