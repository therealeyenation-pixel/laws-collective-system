import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  creativeArtists,
  creativeProductions,
  productionCredits,
  artistRevenueStreams,
  creativeBookings,
  creativeTrainingPrograms,
  artistTrainingProgress,
} from "../../drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export const creativeEnterpriseRouter = router({
  // ============================================================================
  // STATISTICS
  // ============================================================================
  
  getStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return {
        totalArtists: 0,
        activeArtists: 0,
        totalProductions: 0,
        releasedProductions: 0,
        upcomingBookings: 0,
        totalRevenue: 0,
        artistsByType: {
          performer: 0,
          producer: 0,
          designer: 0,
          animator: 0,
          hybrid: 0,
        },
      };
    }

    try {
      const artistsResult = await db.select().from(creativeArtists);
      const productionsResult = await db.select().from(creativeProductions);
      const bookingsResult = await db.select().from(creativeBookings);
      const revenueResult = await db.select().from(artistRevenueStreams);
      
      // Ensure results are arrays
      const artists = Array.isArray(artistsResult) ? artistsResult : [];
      const productions = Array.isArray(productionsResult) ? productionsResult : [];
      const bookings = Array.isArray(bookingsResult) ? bookingsResult : [];
      const revenue = Array.isArray(revenueResult) ? revenueResult : [];

      const activeArtists = artists.filter(a => a.status === "active" || a.status === "senior" || a.status === "master");
      const releasedProductions = productions.filter(p => p.status === "released");
      const upcomingBookings = bookings.filter(b => 
        b.status === "confirmed" && new Date(b.startDateTime) > new Date()
      );
      
      const totalRevenue = revenue.reduce((sum, r) => sum + parseFloat(r.grossAmount || "0"), 0);

      const artistsByType = {
        performer: artists.filter(a => a.artistType === "performer").length,
        producer: artists.filter(a => a.artistType === "producer").length,
        designer: artists.filter(a => a.artistType === "designer").length,
        animator: artists.filter(a => a.artistType === "animator").length,
        hybrid: artists.filter(a => a.artistType === "hybrid").length,
      };

      return {
        totalArtists: artists.length,
        activeArtists: activeArtists.length,
        totalProductions: productions.length,
        releasedProductions: releasedProductions.length,
        upcomingBookings: upcomingBookings.length,
        totalRevenue,
        artistsByType,
      };
    } catch (error) {
      console.error("Error getting creative enterprise stats:", error);
      return {
        totalArtists: 0,
        activeArtists: 0,
        totalProductions: 0,
        releasedProductions: 0,
        upcomingBookings: 0,
        totalRevenue: 0,
        artistsByType: {
          performer: 0,
          producer: 0,
          designer: 0,
          animator: 0,
          hybrid: 0,
        },
      };
    }
  }),

  // ============================================================================
  // ARTISTS
  // ============================================================================

  getAllArtists: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    
    try {
      return await db.select().from(creativeArtists).orderBy(desc(creativeArtists.createdAt));
    } catch (error) {
      console.error("Error getting artists:", error);
      return [];
    }
  }),

  getArtistsByEntity: publicProcedure
    .input(z.object({ entity: z.enum(["real_eye_nation", "laws_collective", "both"]) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      try {
        if (input.entity === "both") {
          return await db.select().from(creativeArtists).orderBy(desc(creativeArtists.createdAt));
        }
        return await db
          .select()
          .from(creativeArtists)
          .where(eq(creativeArtists.primaryEntity, input.entity))
          .orderBy(desc(creativeArtists.createdAt));
      } catch (error) {
        console.error("Error getting artists by entity:", error);
        return [];
      }
    }),

  getArtistById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      
      try {
        const results = await db
          .select()
          .from(creativeArtists)
          .where(eq(creativeArtists.id, input.id))
          .limit(1);
        return results[0] || null;
      } catch (error) {
        console.error("Error getting artist:", error);
        return null;
      }
    }),

  createArtist: protectedProcedure
    .input(z.object({
      fullName: z.string().min(1),
      stageName: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      artistType: z.enum(["performer", "producer", "designer", "animator", "hybrid"]),
      primaryEntity: z.enum(["real_eye_nation", "laws_collective", "both"]).default("real_eye_nation"),
      specializations: z.array(z.string()).optional(),
      familyMemberId: z.number().optional(),
      houseId: z.string().optional(),
      specialistTrackId: z.number().optional(),
      status: z.enum(["applicant", "trainee", "active", "senior", "master", "emeritus", "inactive"]).default("applicant"),
      experienceLevel: z.enum(["entry", "intermediate", "advanced", "expert", "master"]).default("entry"),
      bio: z.string().optional(),
      contractType: z.enum(["employee", "contractor", "freelance", "intern"]).default("contractor"),
      minimumGuarantee: z.number().optional(),
      revenueSharePercentage: z.number().default(70),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      try {
        const result = await db.insert(creativeArtists).values({
          ...input,
          specializations: input.specializations ? JSON.stringify(input.specializations) : null,
          minimumGuarantee: input.minimumGuarantee?.toString(),
          revenueSharePercentage: input.revenueSharePercentage.toString(),
        });
        return { success: true, id: result[0].insertId };
      } catch (error) {
        console.error("Error creating artist:", error);
        throw new Error("Failed to create artist");
      }
    }),

  updateArtist: protectedProcedure
    .input(z.object({
      id: z.number(),
      fullName: z.string().optional(),
      stageName: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      artistType: z.enum(["performer", "producer", "designer", "animator", "hybrid"]).optional(),
      primaryEntity: z.enum(["real_eye_nation", "laws_collective", "both"]).optional(),
      specializations: z.array(z.string()).optional(),
      status: z.enum(["applicant", "trainee", "active", "senior", "master", "emeritus", "inactive"]).optional(),
      experienceLevel: z.enum(["entry", "intermediate", "advanced", "expert", "master"]).optional(),
      businessFundamentalsCompleted: z.boolean().optional(),
      financialLiteracyCompleted: z.boolean().optional(),
      ipLicensingTrainingCompleted: z.boolean().optional(),
      portfolioUrl: z.string().optional(),
      demoReelUrl: z.string().optional(),
      bio: z.string().optional(),
      contractType: z.enum(["employee", "contractor", "freelance", "intern"]).optional(),
      minimumGuarantee: z.number().optional(),
      revenueSharePercentage: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, specializations, minimumGuarantee, revenueSharePercentage, ...rest } = input;
      
      try {
        await db
          .update(creativeArtists)
          .set({
            ...rest,
            ...(specializations && { specializations: JSON.stringify(specializations) }),
            ...(minimumGuarantee !== undefined && { minimumGuarantee: minimumGuarantee.toString() }),
            ...(revenueSharePercentage !== undefined && { revenueSharePercentage: revenueSharePercentage.toString() }),
          })
          .where(eq(creativeArtists.id, id));
        return { success: true };
      } catch (error) {
        console.error("Error updating artist:", error);
        throw new Error("Failed to update artist");
      }
    }),

  // ============================================================================
  // PRODUCTIONS
  // ============================================================================

  getAllProductions: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    
    try {
      return await db.select().from(creativeProductions).orderBy(desc(creativeProductions.createdAt));
    } catch (error) {
      console.error("Error getting productions:", error);
      return [];
    }
  }),

  getProductionsByEntity: publicProcedure
    .input(z.object({ entity: z.enum(["real_eye_nation", "laws_collective", "joint"]) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      try {
        return await db
          .select()
          .from(creativeProductions)
          .where(eq(creativeProductions.owningEntity, input.entity))
          .orderBy(desc(creativeProductions.createdAt));
      } catch (error) {
        console.error("Error getting productions by entity:", error);
        return [];
      }
    }),

  getProductionById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      
      try {
        const results = await db
          .select()
          .from(creativeProductions)
          .where(eq(creativeProductions.id, input.id))
          .limit(1);
        return results[0] || null;
      } catch (error) {
        console.error("Error getting production:", error);
        return null;
      }
    }),

  createProduction: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      productionType: z.enum([
        "film", "video", "music_track", "album", "podcast", "live_performance",
        "theater_production", "dance_piece", "spoken_word", "documentary",
        "graphic_design", "brand_identity", "ui_ux_design", "3d_model",
        "animation", "motion_graphics", "nft", "digital_art", "illustration",
        "music_video", "promotional_content", "educational_content"
      ]),
      owningEntity: z.enum(["real_eye_nation", "laws_collective", "joint"]),
      description: z.string().optional(),
      genre: z.string().optional(),
      duration: z.number().optional(),
      releaseDate: z.string().optional(),
      ipOwnership: z.enum([
        "artist_full", "company_full", "shared_majority_artist",
        "shared_majority_company", "work_for_hire"
      ]).default("shared_majority_artist"),
      licensingAvailable: z.boolean().default(true),
      licensingTypes: z.array(z.string()).optional(),
      productionBudget: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      try {
        const result = await db.insert(creativeProductions).values({
          ...input,
          releaseDate: input.releaseDate ? new Date(input.releaseDate) : null,
          licensingTypes: input.licensingTypes ? JSON.stringify(input.licensingTypes) : null,
          productionBudget: input.productionBudget?.toString(),
        });
        return { success: true, id: result[0].insertId };
      } catch (error) {
        console.error("Error creating production:", error);
        throw new Error("Failed to create production");
      }
    }),

  updateProduction: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      genre: z.string().optional(),
      status: z.enum([
        "in_development", "in_production", "post_production",
        "completed", "released", "archived"
      ]).optional(),
      ipOwnership: z.enum([
        "artist_full", "company_full", "shared_majority_artist",
        "shared_majority_company", "work_for_hire"
      ]).optional(),
      copyrightRegistered: z.boolean().optional(),
      copyrightNumber: z.string().optional(),
      licensingAvailable: z.boolean().optional(),
      productionBudget: z.number().optional(),
      totalRevenue: z.number().optional(),
      primaryAssetUrl: z.string().optional(),
      thumbnailUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, productionBudget, totalRevenue, ...rest } = input;
      
      try {
        await db
          .update(creativeProductions)
          .set({
            ...rest,
            ...(productionBudget !== undefined && { productionBudget: productionBudget.toString() }),
            ...(totalRevenue !== undefined && { totalRevenue: totalRevenue.toString() }),
          })
          .where(eq(creativeProductions.id, id));
        return { success: true };
      } catch (error) {
        console.error("Error updating production:", error);
        throw new Error("Failed to update production");
      }
    }),

  // ============================================================================
  // PRODUCTION CREDITS
  // ============================================================================

  getProductionCredits: publicProcedure
    .input(z.object({ productionId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      try {
        return await db
          .select()
          .from(productionCredits)
          .where(eq(productionCredits.productionId, input.productionId));
      } catch (error) {
        console.error("Error getting production credits:", error);
        return [];
      }
    }),

  addProductionCredit: protectedProcedure
    .input(z.object({
      productionId: z.number(),
      artistId: z.number(),
      role: z.string().min(1),
      creditType: z.enum([
        "creator", "performer", "producer", "director", "writer",
        "designer", "animator", "editor", "composer", "featured"
      ]),
      revenueSharePercentage: z.number().optional(),
      flatFee: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      try {
        const result = await db.insert(productionCredits).values({
          ...input,
          revenueSharePercentage: input.revenueSharePercentage?.toString(),
          flatFee: input.flatFee?.toString(),
        });
        return { success: true, id: result[0].insertId };
      } catch (error) {
        console.error("Error adding production credit:", error);
        throw new Error("Failed to add production credit");
      }
    }),

  // ============================================================================
  // BOOKINGS
  // ============================================================================

  getAllBookings: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    
    try {
      return await db.select().from(creativeBookings).orderBy(desc(creativeBookings.startDateTime));
    } catch (error) {
      console.error("Error getting bookings:", error);
      return [];
    }
  }),

  getUpcomingBookings: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    
    try {
      const allBookings = await db.select().from(creativeBookings).orderBy(desc(creativeBookings.startDateTime));
      return allBookings.filter(b => 
        (b.status === "confirmed" || b.status === "pending") && 
        new Date(b.startDateTime) > new Date()
      );
    } catch (error) {
      console.error("Error getting upcoming bookings:", error);
      return [];
    }
  }),

  getArtistBookings: publicProcedure
    .input(z.object({ artistId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      try {
        return await db
          .select()
          .from(creativeBookings)
          .where(eq(creativeBookings.primaryArtistId, input.artistId))
          .orderBy(desc(creativeBookings.startDateTime));
      } catch (error) {
        console.error("Error getting artist bookings:", error);
        return [];
      }
    }),

  createBooking: protectedProcedure
    .input(z.object({
      bookingType: z.enum([
        "live_performance", "recording_session", "photo_shoot", "video_shoot",
        "workshop", "teaching", "consultation", "design_session", "event_appearance"
      ]),
      primaryArtistId: z.number(),
      additionalArtists: z.array(z.number()).optional(),
      eventName: z.string().min(1),
      eventDescription: z.string().optional(),
      locationType: z.enum(["in_person", "virtual", "hybrid"]).default("in_person"),
      venue: z.string().optional(),
      address: z.string().optional(),
      virtualLink: z.string().optional(),
      startDateTime: z.string(),
      endDateTime: z.string(),
      setupTime: z.number().optional(),
      clientType: z.enum(["internal", "external"]).default("internal"),
      clientEntityId: z.number().optional(),
      clientName: z.string().optional(),
      clientContact: z.string().optional(),
      bookingFee: z.number().optional(),
      depositAmount: z.number().optional(),
      technicalRequirements: z.string().optional(),
      specialRequests: z.string().optional(),
      productionId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      try {
        const result = await db.insert(creativeBookings).values({
          ...input,
          additionalArtists: input.additionalArtists ? JSON.stringify(input.additionalArtists) : null,
          startDateTime: new Date(input.startDateTime),
          endDateTime: new Date(input.endDateTime),
          bookingFee: input.bookingFee?.toString(),
          depositAmount: input.depositAmount?.toString(),
        });
        return { success: true, id: result[0].insertId };
      } catch (error) {
        console.error("Error creating booking:", error);
        throw new Error("Failed to create booking");
      }
    }),

  updateBookingStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["inquiry", "pending", "confirmed", "in_progress", "completed", "cancelled"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      try {
        await db
          .update(creativeBookings)
          .set({ status: input.status })
          .where(eq(creativeBookings.id, input.id));
        return { success: true };
      } catch (error) {
        console.error("Error updating booking status:", error);
        throw new Error("Failed to update booking status");
      }
    }),

  // ============================================================================
  // REVENUE STREAMS
  // ============================================================================

  getArtistRevenue: publicProcedure
    .input(z.object({ artistId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      try {
        return await db
          .select()
          .from(artistRevenueStreams)
          .where(eq(artistRevenueStreams.artistId, input.artistId))
          .orderBy(desc(artistRevenueStreams.createdAt));
      } catch (error) {
        console.error("Error getting artist revenue:", error);
        return [];
      }
    }),

  recordRevenue: protectedProcedure
    .input(z.object({
      artistId: z.number(),
      revenueType: z.enum([
        "royalty", "performance_fee", "teaching_fee", "commission",
        "licensing_fee", "merchandise", "streaming", "sync_license",
        "nft_sale", "nft_royalty", "grant", "sponsorship"
      ]),
      productionId: z.number().optional(),
      bookingId: z.number().optional(),
      grossAmount: z.number(),
      companySharePercentage: z.number().default(30), // Company takes 30% by default
      description: z.string().optional(),
      periodStart: z.string().optional(),
      periodEnd: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const companyShare = input.grossAmount * (input.companySharePercentage / 100);
      const artistShare = input.grossAmount - companyShare;
      
      try {
        const result = await db.insert(artistRevenueStreams).values({
          artistId: input.artistId,
          revenueType: input.revenueType,
          productionId: input.productionId,
          bookingId: input.bookingId,
          grossAmount: input.grossAmount.toString(),
          companyShare: companyShare.toString(),
          artistShare: artistShare.toString(),
          description: input.description,
          periodStart: input.periodStart ? new Date(input.periodStart) : null,
          periodEnd: input.periodEnd ? new Date(input.periodEnd) : null,
        });
        return { success: true, id: result[0].insertId };
      } catch (error) {
        console.error("Error recording revenue:", error);
        throw new Error("Failed to record revenue");
      }
    }),

  // ============================================================================
  // TRAINING PROGRAMS
  // ============================================================================

  getTrainingPrograms: publicProcedure
    .input(z.object({ entity: z.enum(["real_eye_nation", "laws_collective", "academy", "all"]).default("all") }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      try {
        if (input.entity === "all") {
          return await db.select().from(creativeTrainingPrograms).orderBy(creativeTrainingPrograms.programName);
        }
        return await db
          .select()
          .from(creativeTrainingPrograms)
          .where(eq(creativeTrainingPrograms.owningEntity, input.entity))
          .orderBy(creativeTrainingPrograms.programName);
      } catch (error) {
        console.error("Error getting training programs:", error);
        return [];
      }
    }),

  getBusinessFundamentals: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    
    try {
      const allPrograms = await db.select().from(creativeTrainingPrograms);
      return allPrograms.filter(p => p.isBusinessFundamental);
    } catch (error) {
      console.error("Error getting business fundamentals:", error);
      return [];
    }
  }),

  createTrainingProgram: protectedProcedure
    .input(z.object({
      programName: z.string().min(1),
      programType: z.enum([
        "acting", "voice_acting", "music_performance", "music_production",
        "dance", "spoken_word", "theater", "film_production",
        "graphic_design", "ui_ux", "3d_animation", "motion_graphics",
        "brand_development", "digital_art", "nft_creation",
        "business_fundamentals", "financial_literacy", "ip_licensing",
        "marketing_self", "contract_negotiation"
      ]),
      owningEntity: z.enum(["real_eye_nation", "laws_collective", "academy"]),
      description: z.string().optional(),
      learningObjectives: z.array(z.string()).optional(),
      prerequisitePrograms: z.array(z.number()).optional(),
      isBusinessFundamental: z.boolean().default(false),
      durationWeeks: z.number().optional(),
      hoursPerWeek: z.number().optional(),
      modules: z.array(z.object({
        name: z.string(),
        description: z.string().optional(),
        durationHours: z.number().optional(),
      })).optional(),
      completionTokenReward: z.number().default(100),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      try {
        const result = await db.insert(creativeTrainingPrograms).values({
          ...input,
          learningObjectives: input.learningObjectives ? JSON.stringify(input.learningObjectives) : null,
          prerequisitePrograms: input.prerequisitePrograms ? JSON.stringify(input.prerequisitePrograms) : null,
          modules: input.modules ? JSON.stringify(input.modules) : null,
        });
        return { success: true, id: result[0].insertId };
      } catch (error) {
        console.error("Error creating training program:", error);
        throw new Error("Failed to create training program");
      }
    }),

  // ============================================================================
  // ARTIST TRAINING PROGRESS
  // ============================================================================

  getArtistTrainingProgress: publicProcedure
    .input(z.object({ artistId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      try {
        return await db
          .select()
          .from(artistTrainingProgress)
          .where(eq(artistTrainingProgress.artistId, input.artistId))
          .orderBy(desc(artistTrainingProgress.enrolledAt));
      } catch (error) {
        console.error("Error getting artist training progress:", error);
        return [];
      }
    }),

  enrollInProgram: protectedProcedure
    .input(z.object({
      artistId: z.number(),
      programId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      try {
        const result = await db.insert(artistTrainingProgress).values({
          artistId: input.artistId,
          programId: input.programId,
          status: "enrolled",
          progressPercentage: 0,
        });
        return { success: true, id: result[0].insertId };
      } catch (error) {
        console.error("Error enrolling in program:", error);
        throw new Error("Failed to enroll in program");
      }
    }),

  updateTrainingProgress: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["enrolled", "in_progress", "completed", "dropped"]).optional(),
      progressPercentage: z.number().optional(),
      moduleProgress: z.record(z.string(), z.boolean()).optional(),
      finalScore: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, moduleProgress, ...rest } = input;
      
      try {
        await db
          .update(artistTrainingProgress)
          .set({
            ...rest,
            ...(moduleProgress && { moduleProgress: JSON.stringify(moduleProgress) }),
            ...(input.status === "completed" && { completedAt: new Date() }),
            ...(input.status === "in_progress" && { startedAt: new Date() }),
          })
          .where(eq(artistTrainingProgress.id, id));
        return { success: true };
      } catch (error) {
        console.error("Error updating training progress:", error);
        throw new Error("Failed to update training progress");
      }
    }),

  // ============================================================================
  // ANTI-STARVING-ARTIST CHECKS
  // ============================================================================

  checkArtistReadiness: publicProcedure
    .input(z.object({ artistId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return {
          ready: false,
          businessFundamentals: false,
          financialLiteracy: false,
          ipLicensing: false,
          missingRequirements: ["Database not available"],
        };
      }
      
      try {
        const artists = await db
          .select()
          .from(creativeArtists)
          .where(eq(creativeArtists.id, input.artistId))
          .limit(1);
        
        const artist = artists[0];
        if (!artist) {
          return {
            ready: false,
            businessFundamentals: false,
            financialLiteracy: false,
            ipLicensing: false,
            missingRequirements: ["Artist not found"],
          };
        }

        const missingRequirements: string[] = [];
        
        if (!artist.businessFundamentalsCompleted) {
          missingRequirements.push("Business Fundamentals training");
        }
        if (!artist.financialLiteracyCompleted) {
          missingRequirements.push("Financial Literacy training");
        }
        if (!artist.ipLicensingTrainingCompleted) {
          missingRequirements.push("IP & Licensing training");
        }

        return {
          ready: missingRequirements.length === 0,
          businessFundamentals: artist.businessFundamentalsCompleted,
          financialLiteracy: artist.financialLiteracyCompleted,
          ipLicensing: artist.ipLicensingTrainingCompleted,
          missingRequirements,
        };
      } catch (error) {
        console.error("Error checking artist readiness:", error);
        return {
          ready: false,
          businessFundamentals: false,
          financialLiteracy: false,
          ipLicensing: false,
          missingRequirements: ["Error checking readiness"],
        };
      }
    }),
});
