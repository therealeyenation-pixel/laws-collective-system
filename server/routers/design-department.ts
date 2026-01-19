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
});
