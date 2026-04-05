import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { jobApplications, applicationDocuments, applicationActivityLog, luvLedgerTransactions, blockchainRecords } from "../../drizzle/schema";
import { eq, desc, and, like, or } from "drizzle-orm";
import { storagePut } from "../storage";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";

// Generate a random suffix for file keys
function randomSuffix(): string {
  return Math.random().toString(36).substring(2, 10);
}

// Generate blockchain hash for LuvLedger entries
function generateBlockchainHash(data: object): string {
  const dataString = JSON.stringify(data) + Date.now().toString();
  return crypto.createHash('sha256').update(dataString).digest('hex');
}

// Log milestone event to LuvLedger
async function logToLuvLedger(
  db: any,
  eventType: 'interviewed' | 'hired' | 'rejected' | 'offer_accepted',
  applicationId: number,
  applicantName: string,
  positionTitle: string,
  entity: string,
  details?: string
) {
  const activityData = {
    eventType,
    applicationId,
    applicantName,
    positionTitle,
    entity,
    details,
    timestamp: new Date().toISOString(),
  };

  const blockchainHash = generateBlockchainHash(activityData);

  // Create LuvLedger transaction record for HR milestone
  await db.insert(luvLedgerTransactions).values({
    accountId: 1, // System account
    transactionType: 'adjustment',
    amount: '0',
    description: `HR Milestone: ${eventType.toUpperCase()} - ${applicantName} for ${positionTitle} at ${entity}`,
    metadata: activityData,
  });

  // Create blockchain record for immutability
  await db.insert(blockchainRecords).values({
    recordType: 'entity_creation',
    referenceId: applicationId,
    blockchainHash,
    data: activityData,
  });

  return blockchainHash;
}

export const jobApplicationsRouter = router({
  // Submit a new job application (public - anyone can apply)
  submit: publicProcedure
    .input(z.object({
      positionId: z.string(),
      positionTitle: z.string(),
      entity: z.string(),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      currentRole: z.string().optional(),
      yearsExperience: z.string().optional(),
      relevantSkills: z.string().optional(),
      whyInterested: z.string().optional(),
      coverLetter: z.string().optional(),
      // Resume file data (base64 encoded)
      resumeData: z.string().optional(),
      resumeFileName: z.string().optional(),
      resumeMimeType: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      let resumeUrl: string | null = null;
      let resumeFileKey: string | null = null;
      let resumeFileName: string | null = input.resumeFileName || null;

      // Upload resume to S3 if provided
      if (input.resumeData && input.resumeFileName) {
        try {
          // Decode base64 data
          const base64Data = input.resumeData.replace(/^data:[^;]+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          
          // Generate unique file key
          const fileExt = input.resumeFileName.split('.').pop() || 'pdf';
          const fileKey = `applications/resumes/${Date.now()}-${randomSuffix()}.${fileExt}`;
          
          // Upload to S3
          const result = await storagePut(fileKey, buffer, input.resumeMimeType || 'application/pdf');
          resumeUrl = result.url;
          resumeFileKey = fileKey;
        } catch (error) {
          console.error('Error uploading resume:', error);
          // Continue without resume if upload fails
        }
      }

      // Insert application
      const [application] = await db.insert(jobApplications).values({
        positionId: input.positionId,
        positionTitle: input.positionTitle,
        entity: input.entity,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone || null,
        currentRole: input.currentRole || null,
        yearsExperience: input.yearsExperience || null,
        relevantSkills: input.relevantSkills || null,
        whyInterested: input.whyInterested || null,
        coverLetter: input.coverLetter || null,
        resumeUrl: resumeUrl,
        resumeFileName: resumeFileName,
        resumeFileKey: resumeFileKey,
        status: 'received',
      }).$returningId();

      // Log the application received
      await db.insert(applicationActivityLog).values({
        applicationId: application.id,
        action: 'application_received',
        newValue: `Application received for ${input.positionTitle}`,
        notes: `Applicant: ${input.firstName} ${input.lastName} (${input.email})`,
      });

      // If resume was uploaded, also log it as a document
      if (resumeUrl && resumeFileKey && resumeFileName) {
        await db.insert(applicationDocuments).values({
          applicationId: application.id,
          documentType: 'resume',
          fileName: resumeFileName,
          fileKey: resumeFileKey,
          fileUrl: resumeUrl,
          mimeType: input.resumeMimeType || 'application/pdf',
        });
      }

      return {
        success: true,
        applicationId: application.id,
        message: 'Your application has been submitted successfully. We will review it and get back to you soon.',
      };
    }),

  // Get all applications (protected - HR/Admin only)
  list: protectedProcedure
    .input(z.object({
      status: z.string().optional(),
      positionId: z.string().optional(),
      search: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const filters = [];
      
      if (input?.status) {
        filters.push(eq(jobApplications.status, input.status as any));
      }
      
      if (input?.positionId) {
        filters.push(eq(jobApplications.positionId, input.positionId));
      }
      
      if (input?.search) {
        filters.push(
          or(
            like(jobApplications.firstName, `%${input.search}%`),
            like(jobApplications.lastName, `%${input.search}%`),
            like(jobApplications.email, `%${input.search}%`)
          )
        );
      }

      const applications = await db
        .select()
        .from(jobApplications)
        .where(filters.length > 0 ? and(...filters) : undefined)
        .orderBy(desc(jobApplications.appliedAt))
        .limit(input?.limit || 50)
        .offset(input?.offset || 0);

      return applications;
    }),

  // Get single application details
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const [application] = await db
        .select()
        .from(jobApplications)
        .where(eq(jobApplications.id, input.id));

      if (!application) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Application not found' });
      }

      // Get documents
      const documents = await db
        .select()
        .from(applicationDocuments)
        .where(eq(applicationDocuments.applicationId, input.id));

      // Get activity log
      const activityLog = await db
        .select()
        .from(applicationActivityLog)
        .where(eq(applicationActivityLog.applicationId, input.id))
        .orderBy(desc(applicationActivityLog.createdAt));

      return {
        ...application,
        documents,
        activityLog,
      };
    }),

  // Update application status
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum([
        'received', 'screening', 'phone_screen', 'interview_scheduled',
        'interview_completed', 'reference_check', 'offer_extended',
        'offer_accepted', 'hired', 'rejected', 'withdrawn'
      ]),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Get current status
      const [current] = await db
        .select()
        .from(jobApplications)
        .where(eq(jobApplications.id, input.id));

      if (!current) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Application not found' });
      }

      // Update status
      await db
        .update(jobApplications)
        .set({
          status: input.status,
          statusNotes: input.notes || current.statusNotes,
        })
        .where(eq(jobApplications.id, input.id));

      // Log the status change
      await db.insert(applicationActivityLog).values({
        applicationId: input.id,
        actorId: ctx.user?.id,
        actorName: ctx.user?.name || 'System',
        action: 'status_changed',
        previousValue: current.status,
        newValue: input.status,
        notes: input.notes,
      });

      // Log milestone events to LuvLedger
      const applicantName = `${current.firstName} ${current.lastName}`;
      if (input.status === 'hired') {
        await logToLuvLedger(db, 'hired', input.id, applicantName, current.positionTitle, current.entity, input.notes);
      } else if (input.status === 'rejected') {
        await logToLuvLedger(db, 'rejected', input.id, applicantName, current.positionTitle, current.entity, input.notes);
      } else if (input.status === 'offer_accepted') {
        await logToLuvLedger(db, 'offer_accepted', input.id, applicantName, current.positionTitle, current.entity, input.notes);
      }

      return { success: true };
    }),

  // Schedule interview
  scheduleInterview: protectedProcedure
    .input(z.object({
      id: z.number(),
      interviewDate: z.string(), // ISO date string
      interviewType: z.enum(['phone', 'video', 'in_person']),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Get application details for LuvLedger
      const [current] = await db
        .select()
        .from(jobApplications)
        .where(eq(jobApplications.id, input.id));

      if (!current) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Application not found' });
      }

      await db
        .update(jobApplications)
        .set({
          status: 'interview_scheduled',
          interviewDate: new Date(input.interviewDate),
          interviewType: input.interviewType,
          interviewNotes: input.notes,
        })
        .where(eq(jobApplications.id, input.id));

      // Log the interview scheduling
      await db.insert(applicationActivityLog).values({
        applicationId: input.id,
        actorId: ctx.user?.id,
        actorName: ctx.user?.name || 'System',
        action: 'interview_scheduled',
        newValue: `${input.interviewType} interview scheduled for ${input.interviewDate}`,
        notes: input.notes,
      });

      return { success: true };
    }),

  // Add interview score/notes - THIS IS A MILESTONE EVENT
  recordInterviewResults: protectedProcedure
    .input(z.object({
      id: z.number(),
      score: z.number().min(1).max(5),
      notes: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Get application details for LuvLedger
      const [current] = await db
        .select()
        .from(jobApplications)
        .where(eq(jobApplications.id, input.id));

      if (!current) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Application not found' });
      }

      await db
        .update(jobApplications)
        .set({
          status: 'interview_completed',
          interviewScore: input.score,
          interviewNotes: input.notes,
        })
        .where(eq(jobApplications.id, input.id));

      // Log the interview completion
      await db.insert(applicationActivityLog).values({
        applicationId: input.id,
        actorId: ctx.user?.id,
        actorName: ctx.user?.name || 'System',
        action: 'interview_completed',
        newValue: `Interview score: ${input.score}/5`,
        notes: input.notes,
      });

      // Log to LuvLedger - INTERVIEWED is a milestone event
      const applicantName = `${current.firstName} ${current.lastName}`;
      await logToLuvLedger(
        db, 
        'interviewed', 
        input.id, 
        applicantName, 
        current.positionTitle, 
        current.entity, 
        `Score: ${input.score}/5 - ${input.notes}`
      );

      return { success: true };
    }),

  // Extend offer
  extendOffer: protectedProcedure
    .input(z.object({
      id: z.number(),
      salary: z.number(),
      startDate: z.string(), // ISO date string
      expiresAt: z.string().optional(), // ISO date string
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      await db
        .update(jobApplications)
        .set({
          status: 'offer_extended',
          offeredSalary: input.salary.toString(),
          offeredStartDate: new Date(input.startDate),
          offerExpiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
          decisionMadeBy: ctx.user?.id,
          decisionDate: new Date(),
          decisionReason: input.notes,
        })
        .where(eq(jobApplications.id, input.id));

      // Log the offer
      await db.insert(applicationActivityLog).values({
        applicationId: input.id,
        actorId: ctx.user?.id,
        actorName: ctx.user?.name || 'System',
        action: 'offer_sent',
        newValue: `Offer extended: $${input.salary.toLocaleString()} starting ${input.startDate}`,
        notes: input.notes,
      });

      return { success: true };
    }),

  // Get application statistics
  getStats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { total: 0, byStatus: {}, byPosition: {}, recentApplications: 0 };

    const all = await db.select().from(jobApplications);
    
    const stats = {
      total: all.length,
      byStatus: {} as Record<string, number>,
      byPosition: {} as Record<string, number>,
      recentApplications: 0,
    };

    // Count by status
    for (const app of all) {
      stats.byStatus[app.status] = (stats.byStatus[app.status] || 0) + 1;
      stats.byPosition[app.positionTitle] = (stats.byPosition[app.positionTitle] || 0) + 1;
      
      // Count applications in last 7 days
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      if (new Date(app.appliedAt) > weekAgo) {
        stats.recentApplications++;
      }
    }

    return stats;
  }),

  // Upload additional document
  uploadDocument: protectedProcedure
    .input(z.object({
      applicationId: z.number(),
      documentType: z.enum(['resume', 'cover_letter', 'portfolio', 'certification', 'reference_letter', 'transcript', 'other']),
      fileName: z.string(),
      fileData: z.string(), // base64
      mimeType: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Decode and upload
      const base64Data = input.fileData.replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      const fileExt = input.fileName.split('.').pop() || 'pdf';
      const fileKey = `applications/documents/${input.applicationId}/${Date.now()}-${randomSuffix()}.${fileExt}`;
      
      const result = await storagePut(fileKey, buffer, input.mimeType);

      // Save document record
      await db.insert(applicationDocuments).values({
        applicationId: input.applicationId,
        documentType: input.documentType,
        fileName: input.fileName,
        fileKey: fileKey,
        fileUrl: result.url,
        fileSize: buffer.length,
        mimeType: input.mimeType,
      });

      // Log the upload
      await db.insert(applicationActivityLog).values({
        applicationId: input.applicationId,
        actorId: ctx.user?.id,
        actorName: ctx.user?.name || 'System',
        action: 'document_uploaded',
        newValue: `${input.documentType}: ${input.fileName}`,
      });

      return { success: true, url: result.url };
    }),
});
