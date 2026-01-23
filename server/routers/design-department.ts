import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  designProjects,
  designAssets,
  creativeArtists,
} from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

export const designDepartmentRouter = router({
  // ============================================================================
  // STATISTICS
  // ============================================================================
  
  getStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalAssets: 0,
        designers: 0,
        totalBilled: 0,
        projectsByType: {},
        projectsByStatus: {},
      };
    }

    try {
      const projects = await db.select().from(designProjects);
      const assets = await db.select().from(designAssets);
      const artists = await db.select().from(creativeArtists);
      
      const designers = artists.filter(a => 
        a.artistType === "designer" || a.artistType === "animator" || a.artistType === "hybrid"
      );
      
      const activeProjects = projects.filter(p => 
        p.status === "briefing" || p.status === "in_progress" || p.status === "review" || p.status === "revision"
      );
      const completedProjects = projects.filter(p => p.status === "delivered" || p.status === "approved");
      
      const totalBilled = projects.reduce((sum, p) => sum + parseFloat(p.totalBilled || "0"), 0);

      // Group by type
      const projectsByType: Record<string, number> = {};
      projects.forEach(p => {
        projectsByType[p.projectType] = (projectsByType[p.projectType] || 0) + 1;
      });

      // Group by status
      const projectsByStatus: Record<string, number> = {};
      projects.forEach(p => {
        projectsByStatus[p.status] = (projectsByStatus[p.status] || 0) + 1;
      });

      return {
        totalProjects: projects.length,
        activeProjects: activeProjects.length,
        completedProjects: completedProjects.length,
        totalAssets: assets.length,
        designers: designers.length,
        totalBilled,
        projectsByType,
        projectsByStatus,
      };
    } catch (error) {
      console.error("Error getting design department stats:", error);
      return {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalAssets: 0,
        designers: 0,
        totalBilled: 0,
        projectsByType: {},
        projectsByStatus: {},
      };
    }
  }),

  // ============================================================================
  // PROJECTS
  // ============================================================================

  getAllProjects: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    
    try {
      return await db.select().from(designProjects).orderBy(desc(designProjects.createdAt));
    } catch (error) {
      console.error("Error getting design projects:", error);
      return [];
    }
  }),

  getActiveProjects: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    
    try {
      const allProjects = await db.select().from(designProjects).orderBy(desc(designProjects.createdAt));
      return allProjects.filter(p => 
        p.status === "briefing" || p.status === "in_progress" || p.status === "review" || p.status === "revision"
      );
    } catch (error) {
      console.error("Error getting active projects:", error);
      return [];
    }
  }),

  getProjectsByType: publicProcedure
    .input(z.object({ 
      projectType: z.enum([
        "brand_identity", "logo_design", "marketing_materials", "ui_ux_design",
        "web_design", "app_design", "3d_modeling", "animation", "motion_graphics",
        "video_editing", "photo_editing", "illustration", "infographic",
        "presentation", "packaging", "merchandise_design", "nft_collection", "ai_assisted_design"
      ]) 
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      try {
        return await db
          .select()
          .from(designProjects)
          .where(eq(designProjects.projectType, input.projectType))
          .orderBy(desc(designProjects.createdAt));
      } catch (error) {
        console.error("Error getting projects by type:", error);
        return [];
      }
    }),

  getProjectById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      
      try {
        const results = await db
          .select()
          .from(designProjects)
          .where(eq(designProjects.id, input.id))
          .limit(1);
        return results[0] || null;
      } catch (error) {
        console.error("Error getting project:", error);
        return null;
      }
    }),

  getDesignerProjects: publicProcedure
    .input(z.object({ designerId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      try {
        return await db
          .select()
          .from(designProjects)
          .where(eq(designProjects.leadDesignerId, input.designerId))
          .orderBy(desc(designProjects.createdAt));
      } catch (error) {
        console.error("Error getting designer projects:", error);
        return [];
      }
    }),

  createProject: protectedProcedure
    .input(z.object({
      projectName: z.string().min(1),
      projectType: z.enum([
        "brand_identity", "logo_design", "marketing_materials", "ui_ux_design",
        "web_design", "app_design", "3d_modeling", "animation", "motion_graphics",
        "video_editing", "photo_editing", "illustration", "infographic",
        "presentation", "packaging", "merchandise_design", "nft_collection", "ai_assisted_design"
      ]),
      clientType: z.enum(["internal", "external"]).default("internal"),
      clientEntityId: z.number().optional(),
      clientName: z.string().optional(),
      leadDesignerId: z.number().optional(),
      description: z.string().optional(),
      requirements: z.string().optional(),
      deliverables: z.array(z.string()).optional(),
      startDate: z.string().optional(),
      dueDate: z.string().optional(),
      projectBudget: z.number().optional(),
      billingType: z.enum(["fixed", "hourly", "internal"]).default("internal"),
      hourlyRate: z.number().optional(),
      aiToolsUsed: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      try {
        const result = await db.insert(designProjects).values({
          ...input,
          deliverables: input.deliverables ? JSON.stringify(input.deliverables) : null,
          startDate: input.startDate ? new Date(input.startDate) : null,
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
          projectBudget: input.projectBudget?.toString(),
          hourlyRate: input.hourlyRate?.toString(),
          aiToolsUsed: input.aiToolsUsed ? JSON.stringify(input.aiToolsUsed) : null,
        });
        return { success: true, id: result[0].insertId };
      } catch (error) {
        console.error("Error creating project:", error);
        throw new Error("Failed to create project");
      }
    }),

  updateProject: protectedProcedure
    .input(z.object({
      id: z.number(),
      projectName: z.string().optional(),
      description: z.string().optional(),
      requirements: z.string().optional(),
      deliverables: z.array(z.string()).optional(),
      leadDesignerId: z.number().optional(),
      startDate: z.string().optional(),
      dueDate: z.string().optional(),
      completedDate: z.string().optional(),
      status: z.enum(["briefing", "in_progress", "review", "revision", "approved", "delivered", "archived"]).optional(),
      projectBudget: z.number().optional(),
      hoursLogged: z.number().optional(),
      totalBilled: z.number().optional(),
      aiToolsUsed: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, deliverables, startDate, dueDate, completedDate, projectBudget, hoursLogged, totalBilled, aiToolsUsed, ...rest } = input;
      
      try {
        await db
          .update(designProjects)
          .set({
            ...rest,
            ...(deliverables && { deliverables: JSON.stringify(deliverables) }),
            ...(startDate && { startDate: new Date(startDate) }),
            ...(dueDate && { dueDate: new Date(dueDate) }),
            ...(completedDate && { completedDate: new Date(completedDate) }),
            ...(projectBudget !== undefined && { projectBudget: projectBudget.toString() }),
            ...(hoursLogged !== undefined && { hoursLogged: hoursLogged.toString() }),
            ...(totalBilled !== undefined && { totalBilled: totalBilled.toString() }),
            ...(aiToolsUsed && { aiToolsUsed: JSON.stringify(aiToolsUsed) }),
          })
          .where(eq(designProjects.id, id));
        return { success: true };
      } catch (error) {
        console.error("Error updating project:", error);
        throw new Error("Failed to update project");
      }
    }),

  logHours: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      hours: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      try {
        const projects = await db
          .select()
          .from(designProjects)
          .where(eq(designProjects.id, input.projectId))
          .limit(1);
        
        const project = projects[0];
        if (!project) throw new Error("Project not found");
        
        const currentHours = parseFloat(project.hoursLogged || "0");
        const newHours = currentHours + input.hours;
        
        // Calculate billing if hourly
        let newBilled = parseFloat(project.totalBilled || "0");
        if (project.billingType === "hourly" && project.hourlyRate) {
          newBilled = newHours * parseFloat(project.hourlyRate);
        }
        
        await db
          .update(designProjects)
          .set({
            hoursLogged: newHours.toString(),
            totalBilled: newBilled.toString(),
          })
          .where(eq(designProjects.id, input.projectId));
        
        return { success: true, hoursLogged: newHours, totalBilled: newBilled };
      } catch (error) {
        console.error("Error logging hours:", error);
        throw new Error("Failed to log hours");
      }
    }),

  // ============================================================================
  // ASSETS
  // ============================================================================

  getAllAssets: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    
    try {
      return await db.select().from(designAssets).orderBy(desc(designAssets.createdAt));
    } catch (error) {
      console.error("Error getting design assets:", error);
      return [];
    }
  }),

  getProjectAssets: publicProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      try {
        return await db
          .select()
          .from(designAssets)
          .where(eq(designAssets.projectId, input.projectId))
          .orderBy(desc(designAssets.createdAt));
      } catch (error) {
        console.error("Error getting project assets:", error);
        return [];
      }
    }),

  getAssetsByType: publicProcedure
    .input(z.object({ 
      assetType: z.enum([
        "logo", "icon", "illustration", "photo", "video", "animation",
        "3d_model", "font", "color_palette", "template", "mockup",
        "source_file", "export", "nft"
      ]) 
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      try {
        return await db
          .select()
          .from(designAssets)
          .where(eq(designAssets.assetType, input.assetType))
          .orderBy(desc(designAssets.createdAt));
      } catch (error) {
        console.error("Error getting assets by type:", error);
        return [];
      }
    }),

  getAssetById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      
      try {
        const results = await db
          .select()
          .from(designAssets)
          .where(eq(designAssets.id, input.id))
          .limit(1);
        return results[0] || null;
      } catch (error) {
        console.error("Error getting asset:", error);
        return null;
      }
    }),

  createAsset: protectedProcedure
    .input(z.object({
      assetName: z.string().min(1),
      assetType: z.enum([
        "logo", "icon", "illustration", "photo", "video", "animation",
        "3d_model", "font", "color_palette", "template", "mockup",
        "source_file", "export", "nft"
      ]),
      projectId: z.number().optional(),
      productionId: z.number().optional(),
      creatorId: z.number().optional(),
      fileUrl: z.string().min(1),
      thumbnailUrl: z.string().optional(),
      fileFormat: z.string().optional(),
      fileSizeBytes: z.number().optional(),
      dimensions: z.string().optional(),
      description: z.string().optional(),
      tags: z.array(z.string()).optional(),
      colorPalette: z.array(z.string()).optional(),
      licenseType: z.enum([
        "internal_only", "client_exclusive", "royalty_free",
        "rights_managed", "creative_commons", "nft_owned"
      ]).default("internal_only"),
      isNft: z.boolean().default(false),
      nftContractAddress: z.string().optional(),
      nftTokenId: z.string().optional(),
      nftChain: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      try {
        const result = await db.insert(designAssets).values({
          ...input,
          tags: input.tags ? JSON.stringify(input.tags) : null,
          colorPalette: input.colorPalette ? JSON.stringify(input.colorPalette) : null,
        });
        return { success: true, id: result[0].insertId };
      } catch (error) {
        console.error("Error creating asset:", error);
        throw new Error("Failed to create asset");
      }
    }),

  updateAsset: protectedProcedure
    .input(z.object({
      id: z.number(),
      assetName: z.string().optional(),
      description: z.string().optional(),
      tags: z.array(z.string()).optional(),
      colorPalette: z.array(z.string()).optional(),
      licenseType: z.enum([
        "internal_only", "client_exclusive", "royalty_free",
        "rights_managed", "creative_commons", "nft_owned"
      ]).optional(),
      status: z.enum(["draft", "review", "approved", "archived"]).optional(),
      isNft: z.boolean().optional(),
      nftContractAddress: z.string().optional(),
      nftTokenId: z.string().optional(),
      nftChain: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, tags, colorPalette, ...rest } = input;
      
      try {
        await db
          .update(designAssets)
          .set({
            ...rest,
            ...(tags && { tags: JSON.stringify(tags) }),
            ...(colorPalette && { colorPalette: JSON.stringify(colorPalette) }),
          })
          .where(eq(designAssets.id, id));
        return { success: true };
      } catch (error) {
        console.error("Error updating asset:", error);
        throw new Error("Failed to update asset");
      }
    }),

  // Create new version of an asset
  createAssetVersion: protectedProcedure
    .input(z.object({
      parentAssetId: z.number(),
      fileUrl: z.string().min(1),
      thumbnailUrl: z.string().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      try {
        // Get parent asset
        const parentAssets = await db
          .select()
          .from(designAssets)
          .where(eq(designAssets.id, input.parentAssetId))
          .limit(1);
        
        const parent = parentAssets[0];
        if (!parent) throw new Error("Parent asset not found");
        
        // Create new version
        const result = await db.insert(designAssets).values({
          assetName: parent.assetName,
          assetType: parent.assetType,
          projectId: parent.projectId,
          productionId: parent.productionId,
          creatorId: parent.creatorId,
          fileUrl: input.fileUrl,
          thumbnailUrl: input.thumbnailUrl || parent.thumbnailUrl,
          fileFormat: parent.fileFormat,
          description: input.description || parent.description,
          tags: parent.tags,
          colorPalette: parent.colorPalette,
          licenseType: parent.licenseType,
          version: parent.version + 1,
          parentAssetId: input.parentAssetId,
          status: "draft",
        });
        
        return { success: true, id: result[0].insertId, version: parent.version + 1 };
      } catch (error) {
        console.error("Error creating asset version:", error);
        throw new Error("Failed to create asset version");
      }
    }),

  // ============================================================================
  // DESIGNERS
  // ============================================================================

  getDesigners: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    
    try {
      const artists = await db.select().from(creativeArtists);
      return artists.filter(a => 
        (a.artistType === "designer" || a.artistType === "animator" || a.artistType === "hybrid") &&
        (a.primaryEntity === "laws_collective" || a.primaryEntity === "both")
      );
    } catch (error) {
      console.error("Error getting designers:", error);
      return [];
    }
  }),

  getActiveDesigners: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    
    try {
      const artists = await db.select().from(creativeArtists);
      return artists.filter(a => 
        (a.artistType === "designer" || a.artistType === "animator" || a.artistType === "hybrid") &&
        (a.primaryEntity === "laws_collective" || a.primaryEntity === "both") &&
        (a.status === "active" || a.status === "senior" || a.status === "master")
      );
    } catch (error) {
      console.error("Error getting active designers:", error);
      return [];
    }
  }),

  // ============================================================================
  // AI TOOLS TRACKING
  // ============================================================================

  getAiToolsUsage: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { tools: {}, totalProjects: 0 };
    
    try {
      const projects = await db.select().from(designProjects);
      
      const toolUsage: Record<string, number> = {};
      let projectsWithAi = 0;
      
      projects.forEach(p => {
        if (p.aiToolsUsed) {
          projectsWithAi++;
          const tools = typeof p.aiToolsUsed === 'string' 
            ? JSON.parse(p.aiToolsUsed) 
            : p.aiToolsUsed;
          
          if (Array.isArray(tools)) {
            tools.forEach((tool: string) => {
              toolUsage[tool] = (toolUsage[tool] || 0) + 1;
            });
          }
        }
      });
      
      return {
        tools: toolUsage,
        totalProjects: projects.length,
        projectsWithAi,
        aiAdoptionRate: projects.length > 0 ? (projectsWithAi / projects.length) * 100 : 0,
      };
    } catch (error) {
      console.error("Error getting AI tools usage:", error);
      return { tools: {}, totalProjects: 0, projectsWithAi: 0, aiAdoptionRate: 0 };
    }
  }),

  // ============================================================================
  // NFT MANAGEMENT
  // ============================================================================

  getNftAssets: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    
    try {
      const assets = await db.select().from(designAssets);
      return assets.filter(a => a.isNft);
    } catch (error) {
      console.error("Error getting NFT assets:", error);
      return [];
    }
  }),

  mintNft: protectedProcedure
    .input(z.object({
      assetId: z.number(),
      contractAddress: z.string(),
      tokenId: z.string(),
      chain: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      try {
        await db
          .update(designAssets)
          .set({
            isNft: true,
            nftContractAddress: input.contractAddress,
            nftTokenId: input.tokenId,
            nftChain: input.chain,
            licenseType: "nft_owned",
          })
          .where(eq(designAssets.id, input.assetId));
        
        return { success: true };
      } catch (error) {
        console.error("Error minting NFT:", error);
        throw new Error("Failed to mint NFT");
      }
    }),

  // ============================================================================
  // INTERNAL SERVICE REQUESTS
  // ============================================================================

  getInternalProjects: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    
    try {
      return await db
        .select()
        .from(designProjects)
        .where(eq(designProjects.clientType, "internal"))
        .orderBy(desc(designProjects.createdAt));
    } catch (error) {
      console.error("Error getting internal projects:", error);
      return [];
    }
  }),

  getExternalProjects: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    
    try {
      return await db
        .select()
        .from(designProjects)
        .where(eq(designProjects.clientType, "external"))
        .orderBy(desc(designProjects.createdAt));
    } catch (error) {
      console.error("Error getting external projects:", error);
      return [];
    }
  }),

  // Request design service from another entity
  requestDesignService: protectedProcedure
    .input(z.object({
      requestingEntityId: z.number(),
      projectName: z.string().min(1),
      projectType: z.enum([
        "brand_identity", "logo_design", "marketing_materials", "ui_ux_design",
        "web_design", "app_design", "3d_modeling", "animation", "motion_graphics",
        "video_editing", "photo_editing", "illustration", "infographic",
        "presentation", "packaging", "merchandise_design", "nft_collection", "ai_assisted_design"
      ]),
      description: z.string(),
      requirements: z.string().optional(),
      deliverables: z.array(z.string()).optional(),
      dueDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      try {
        const result = await db.insert(designProjects).values({
          projectName: input.projectName,
          projectType: input.projectType,
          clientType: "internal",
          clientEntityId: input.requestingEntityId,
          description: input.description,
          requirements: input.requirements,
          deliverables: input.deliverables ? JSON.stringify(input.deliverables) : null,
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
          billingType: "internal",
          status: "briefing",
        });
        
        return { success: true, id: result[0].insertId };
      } catch (error) {
        console.error("Error requesting design service:", error);
        throw new Error("Failed to request design service");
      }
    }),

  // ============================================================================
  // MERCHANDISE SUBMISSIONS
  // ============================================================================

  getMerchandiseSubmissions: protectedProcedure
    .input(z.object({
      status: z.enum(['draft', 'submitted', 'in_review', 'revision_requested', 'approved', 'rejected', 'in_production', 'completed']).optional(),
      category: z.enum(['apparel', 'accessories', 'print', 'digital', 'promotional', 'other']).optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      try {
        const filters = input || {};
        let query = `SELECT * FROM design_submissions WHERE 1=1`;
        const params: any[] = [];

        if (filters.status) {
          query += ` AND status = ?`;
          params.push(filters.status);
        }
        if (filters.category) {
          query += ` AND category = ?`;
          params.push(filters.category);
        }

        query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        params.push(filters.limit, filters.offset);

        const [rows] = await db.execute(query, params);
        return rows as any[];
      } catch (error) {
        console.error("Error getting merchandise submissions:", error);
        return [];
      }
    }),

  getMerchandiseSubmission: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      
      try {
        const [submissions] = await db.execute(
          `SELECT * FROM design_submissions WHERE id = ?`,
          [input.id]
        );
        const submission = (submissions as any[])[0];

        if (!submission) return null;

        const [reviews] = await db.execute(
          `SELECT * FROM design_reviews WHERE submission_id = ? ORDER BY created_at DESC`,
          [input.id]
        );

        return {
          ...submission,
          reviews: reviews as any[],
        };
      } catch (error) {
        console.error("Error getting merchandise submission:", error);
        return null;
      }
    }),

  createMerchandiseSubmission: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      category: z.enum(['apparel', 'accessories', 'print', 'digital', 'promotional', 'other']),
      designScope: z.enum(['laws_collective', 'house', 'business']).default('house'),
      isOriginalDesign: z.boolean().default(false),
      isLogoDesign: z.boolean().default(false),
      productType: z.string().optional(),
      designConcept: z.string().optional(),
      targetAudience: z.string().optional(),
      estimatedCost: z.number().optional(),
      estimatedPrice: z.number().optional(),
      houseId: z.number().optional(),
      businessId: z.number().optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
      mockupUrls: z.array(z.string()).optional(),
      notes: z.string().optional(),
      submitImmediately: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      try {
        const now = Date.now();
        const status = input.submitImmediately ? 'submitted' : 'draft';
        const submittedAt = input.submitImmediately ? now : null;
        
        // Determine if Founding House approval is required:
        // Only L.A.W.S. Collective original designs and logos require Founding House approval
        // House/Business designs are self-governed
        const requiresFoundingHouseApproval = 
          input.designScope === 'laws_collective' && 
          (input.isOriginalDesign || input.isLogoDesign);
        
        const foundingHouseApproval = requiresFoundingHouseApproval ? 'pending' : 'not_required';

        const [result] = await db.execute(
          `INSERT INTO design_submissions 
           (title, description, category, design_scope, is_original_design, is_logo_design,
            founding_house_approval, product_type, design_concept, target_audience,
            estimated_cost, estimated_price, submitted_by_id, submitted_by_name, house_id,
            status, priority, mockup_urls, notes, created_at, updated_at, submitted_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            input.title,
            input.description || null,
            input.category,
            input.designScope,
            input.isOriginalDesign,
            input.isLogoDesign,
            foundingHouseApproval,
            input.productType || null,
            input.designConcept || null,
            input.targetAudience || null,
            input.estimatedCost || null,
            input.estimatedPrice || null,
            ctx.user.id,
            ctx.user.name,
            input.houseId || null,
            status,
            input.priority,
            input.mockupUrls ? JSON.stringify(input.mockupUrls) : null,
            input.notes || null,
            now,
            now,
            submittedAt,
          ]
        );

        return {
          success: true,
          id: (result as any).insertId,
          message: input.submitImmediately 
            ? "Merchandise concept submitted for review" 
            : "Merchandise concept saved as draft",
          requiresFoundingHouseApproval,
        };
      } catch (error) {
        console.error("Error creating merchandise submission:", error);
        throw new Error("Failed to create merchandise submission");
      }
    }),

  submitMerchandiseForReview: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      try {
        const now = Date.now();
        await db.execute(
          `UPDATE design_submissions 
           SET status = 'submitted', submitted_at = ?, updated_at = ?
           WHERE id = ? AND status = 'draft'`,
          [now, now, input.id]
        );

        return { success: true, message: "Merchandise submitted for review" };
      } catch (error) {
        console.error("Error submitting merchandise:", error);
        throw new Error("Failed to submit merchandise");
      }
    }),

  reviewMerchandise: protectedProcedure
    .input(z.object({
      submissionId: z.number(),
      action: z.enum(['comment', 'request_revision', 'approve', 'reject']),
      feedback: z.string().optional(),
      rating: z.number().min(1).max(5).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      try {
        const now = Date.now();

        // Add the review
        await db.execute(
          `INSERT INTO design_reviews 
           (submission_id, reviewer_id, reviewer_name, reviewer_role, action, feedback, rating, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            input.submissionId,
            ctx.user.id,
            ctx.user.name,
            ctx.user.role || 'reviewer',
            input.action,
            input.feedback || null,
            input.rating || null,
            now,
          ]
        );

        // Update submission status based on action
        let newStatus = 'in_review';
        let approvalFields = '';
        const updateParams: any[] = [now];

        switch (input.action) {
          case 'request_revision':
            newStatus = 'revision_requested';
            break;
          case 'approve':
            newStatus = 'approved';
            approvalFields = ', approved_at = ?, approved_by_id = ?, approved_by_name = ?';
            updateParams.push(now, ctx.user.id, ctx.user.name);
            break;
          case 'reject':
            newStatus = 'rejected';
            break;
        }

        updateParams.push(input.submissionId);

        await db.execute(
          `UPDATE design_submissions 
           SET status = ?, updated_at = ?${approvalFields}
           WHERE id = ? AND status NOT IN ('completed', 'rejected')`,
          [newStatus, ...updateParams]
        );

        return { 
          success: true, 
          message: input.action === 'approve' 
            ? "Merchandise approved and ready for production"
            : input.action === 'reject'
            ? "Merchandise rejected"
            : input.action === 'request_revision'
            ? "Revision requested"
            : "Feedback added"
        };
      } catch (error) {
        console.error("Error reviewing merchandise:", error);
        throw new Error("Failed to review merchandise");
      }
    }),

  moveMerchandiseToProduction: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      try {
        await db.execute(
          `UPDATE design_submissions 
           SET status = 'in_production', updated_at = ?
           WHERE id = ? AND status = 'approved'`,
          [Date.now(), input.id]
        );

        return { success: true, message: "Merchandise moved to production" };
      } catch (error) {
        console.error("Error moving to production:", error);
        throw new Error("Failed to move to production");
      }
    }),

  completeMerchandise: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      try {
        await db.execute(
          `UPDATE design_submissions 
           SET status = 'completed', updated_at = ?
           WHERE id = ? AND status = 'in_production'`,
          [Date.now(), input.id]
        );

        return { success: true, message: "Merchandise completed and ready for shop" };
      } catch (error) {
        console.error("Error completing merchandise:", error);
        throw new Error("Failed to complete merchandise");
      }
    }),

  getMerchandiseStats: protectedProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) return {
        total: 0, drafts: 0, submitted: 0, in_review: 0,
        revision_requested: 0, approved: 0, in_production: 0, completed: 0, rejected: 0
      };
      
      try {
        const [stats] = await db.execute(`
          SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as drafts,
            SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as submitted,
            SUM(CASE WHEN status = 'in_review' THEN 1 ELSE 0 END) as in_review,
            SUM(CASE WHEN status = 'revision_requested' THEN 1 ELSE 0 END) as revision_requested,
            SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
            SUM(CASE WHEN status = 'in_production' THEN 1 ELSE 0 END) as in_production,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
            SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
          FROM design_submissions
        `);

        return (stats as any[])[0];
      } catch (error) {
        console.error("Error getting merchandise stats:", error);
        return {
          total: 0, drafts: 0, submitted: 0, in_review: 0,
          revision_requested: 0, approved: 0, in_production: 0, completed: 0, rejected: 0
        };
      }
    }),

  getShopReadyMerchandise: publicProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) return [];
      
      try {
        const [rows] = await db.execute(
          `SELECT * FROM design_submissions 
           WHERE status IN ('completed', 'in_production')
           AND founding_house_approval = 'approved'
           ORDER BY approved_at DESC`
        );
        return rows as any[];
      } catch (error) {
        console.error("Error getting shop ready merchandise:", error);
        return [];
      }
    }),

  // ============================================================================
  // FOUNDING HOUSE APPROVAL (Original Designs & Logos)
  // ============================================================================

  getDesignsAwaitingFoundingHouseApproval: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      
      try {
        const [rows] = await db.execute(
          `SELECT * FROM design_submissions 
           WHERE (is_original_design = TRUE OR is_logo_design = TRUE)
           AND founding_house_approval = 'pending'
           AND status IN ('approved', 'in_review')
           ORDER BY created_at DESC`
        );
        return rows as any[];
      } catch (error) {
        console.error("Error getting designs awaiting Founding House approval:", error);
        return [];
      }
    }),

  foundingHouseApproveDesign: protectedProcedure
    .input(z.object({
      submissionId: z.number(),
      action: z.enum(['approve', 'reject']),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Only Founding House Chair (admin) can approve original designs
      if (ctx.user.role !== 'admin') {
        throw new Error("Only Founding House Chair can approve original designs and logos");
      }
      
      try {
        const now = Date.now();
        const approvalStatus = input.action === 'approve' ? 'approved' : 'rejected';
        
        await db.execute(
          `UPDATE design_submissions 
           SET founding_house_approval = ?,
               founding_house_approver_id = ?,
               founding_house_approval_date = ?,
               founding_house_approval_notes = ?,
               updated_at = ?
           WHERE id = ?`,
          [approvalStatus, ctx.user.id, now, input.notes || null, now, input.submissionId]
        );

        return { 
          success: true, 
          message: input.action === 'approve' 
            ? "Design approved by Founding House"
            : "Design rejected by Founding House"
        };
      } catch (error) {
        console.error("Error processing Founding House approval:", error);
        throw new Error("Failed to process Founding House approval");
      }
    }),

  markAsOriginalDesign: protectedProcedure
    .input(z.object({
      submissionId: z.number(),
      isOriginal: z.boolean(),
      isLogo: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      try {
        await db.execute(
          `UPDATE design_submissions 
           SET is_original_design = ?,
               is_logo_design = ?,
               founding_house_approval = CASE 
                 WHEN ? = TRUE OR ? = TRUE THEN 'pending'
                 ELSE founding_house_approval
               END,
               updated_at = ?
           WHERE id = ?`,
          [input.isOriginal, input.isLogo, input.isOriginal, input.isLogo, Date.now(), input.submissionId]
        );

        return { success: true };
      } catch (error) {
        console.error("Error marking design type:", error);
        throw new Error("Failed to mark design type");
      }
    }),

  // ============================================================================
  // DESIGN FILE MANAGEMENT
  // ============================================================================

  addDesignFile: protectedProcedure
    .input(z.object({
      submissionId: z.number(),
      fileName: z.string(),
      fileUrl: z.string(),
      fileType: z.string().optional(),
      fileSize: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      try {
        // Get current files
        const [submissions] = await db.execute(
          `SELECT design_files FROM design_submissions WHERE id = ?`,
          [input.submissionId]
        );
        const submission = (submissions as any[])[0];
        if (!submission) throw new Error("Submission not found");

        // Parse existing files or create new array
        let files = [];
        if (submission.design_files) {
          try {
            files = typeof submission.design_files === 'string' 
              ? JSON.parse(submission.design_files) 
              : submission.design_files;
          } catch {
            files = [];
          }
        }

        // Add new file
        files.push({
          fileName: input.fileName,
          fileUrl: input.fileUrl,
          fileType: input.fileType || 'unknown',
          fileSize: input.fileSize || 0,
          uploadedAt: Date.now(),
        });

        // Update database
        await db.execute(
          `UPDATE design_submissions SET design_files = ?, updated_at = ? WHERE id = ?`,
          [JSON.stringify(files), Date.now(), input.submissionId]
        );

        return { success: true, files };
      } catch (error) {
        console.error("Error adding design file:", error);
        throw new Error("Failed to add design file");
      }
    }),

  removeDesignFile: protectedProcedure
    .input(z.object({
      submissionId: z.number(),
      fileUrl: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      try {
        // Get current files
        const [submissions] = await db.execute(
          `SELECT design_files FROM design_submissions WHERE id = ?`,
          [input.submissionId]
        );
        const submission = (submissions as any[])[0];
        if (!submission) throw new Error("Submission not found");

        // Parse existing files
        let files = [];
        if (submission.design_files) {
          try {
            files = typeof submission.design_files === 'string' 
              ? JSON.parse(submission.design_files) 
              : submission.design_files;
          } catch {
            files = [];
          }
        }

        // Remove file by URL
        files = files.filter((f: any) => f.fileUrl !== input.fileUrl);

        // Update database
        await db.execute(
          `UPDATE design_submissions SET design_files = ?, updated_at = ? WHERE id = ?`,
          [JSON.stringify(files), Date.now(), input.submissionId]
        );

        return { success: true, files };
      } catch (error) {
        console.error("Error removing design file:", error);
        throw new Error("Failed to remove design file");
      }
    }),

  getDesignFiles: protectedProcedure
    .input(z.object({ submissionId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      try {
        const [submissions] = await db.execute(
          `SELECT design_files FROM design_submissions WHERE id = ?`,
          [input.submissionId]
        );
        const submission = (submissions as any[])[0];
        if (!submission || !submission.design_files) return [];

        try {
          return typeof submission.design_files === 'string' 
            ? JSON.parse(submission.design_files) 
            : submission.design_files;
        } catch {
          return [];
        }
      } catch (error) {
        console.error("Error getting design files:", error);
        return [];
      }
    }),
});
