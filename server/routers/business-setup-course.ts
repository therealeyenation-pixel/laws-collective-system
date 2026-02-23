/**
 * Business Setup Course Router
 * Handles course progress, quiz submissions, and document generation
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import { eq, and, desc } from "drizzle-orm";
import { 
  getBusinessSetupModules, 
  getModuleById, 
  getLessonContent, 
  getModuleQuiz, 
  getOutputDocumentTemplate,
  calculateQuizScore,
  getCourseOverview
} from "../services/business-setup-course";

export const businessSetupCourseRouter = router({
  // Get course overview
  getCourseOverview: protectedProcedure.query(async () => {
    return getCourseOverview();
  }),

  // Get all modules
  getModules: protectedProcedure.query(async () => {
    return getBusinessSetupModules();
  }),

  // Get single module details
  getModule: protectedProcedure
    .input(z.object({ moduleId: z.number() }))
    .query(async ({ input }) => {
      return getModuleById(input.moduleId);
    }),

  // Get lesson content
  getLesson: protectedProcedure
    .input(z.object({ 
      moduleId: z.number(),
      lessonId: z.string()
    }))
    .query(async ({ input }) => {
      return getLessonContent(input.moduleId, input.lessonId);
    }),

  // Get module quiz
  getQuiz: protectedProcedure
    .input(z.object({ moduleId: z.number() }))
    .query(async ({ input }) => {
      const quiz = await getModuleQuiz(input.moduleId);
      if (!quiz) return null;
      // Return questions without correct answers for client
      return quiz.map(q => ({
        question: q.question,
        options: q.options
      }));
    }),

  // Submit quiz answers
  submitQuiz: protectedProcedure
    .input(z.object({
      moduleId: z.number(),
      answers: z.array(z.number())
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await calculateQuizScore(input.moduleId, input.answers);
      
      // Record progress if passed
      if (result.passed) {
        const module = await getModuleById(input.moduleId);
        if (module) {
          // Award tokens for passing quiz
          try {
            await db.execute({
              sql: `INSERT INTO token_transactions (user_id, amount, type, description, created_at)
                    VALUES (?, ?, 'earned', ?, NOW())`,
              args: [ctx.user.id, module.tokensReward, `Completed Business Setup Course Module ${input.moduleId}: ${module.title}`]
            });
            
            // Update user token balance
            await db.execute({
              sql: `UPDATE users SET token_balance = COALESCE(token_balance, 0) + ? WHERE id = ?`,
              args: [module.tokensReward, ctx.user.id]
            });
          } catch (e) {
            console.error("Error awarding tokens:", e);
          }
        }
      }
      
      return result;
    }),

  // Get output document template
  getDocumentTemplate: protectedProcedure
    .input(z.object({ moduleId: z.number() }))
    .query(async ({ input }) => {
      return getOutputDocumentTemplate(input.moduleId);
    }),

  // Save document output
  saveDocument: protectedProcedure
    .input(z.object({
      moduleId: z.number(),
      documentData: z.record(z.string(), z.any())
    }))
    .mutation(async ({ ctx, input }) => {
      const template = await getOutputDocumentTemplate(input.moduleId);
      if (!template) {
        throw new Error("Document template not found");
      }

      // Save to database
      const result = await db.execute({
        sql: `INSERT INTO course_documents (user_id, course_type, module_id, document_title, document_data, created_at)
              VALUES (?, 'business_setup', ?, ?, ?, NOW())
              ON DUPLICATE KEY UPDATE document_data = VALUES(document_data), updated_at = NOW()`,
        args: [ctx.user.id, input.moduleId, template.title, JSON.stringify(input.documentData)]
      });

      return { 
        success: true, 
        message: `${template.title} saved successfully`,
        documentId: result.insertId
      };
    }),

  // Get user's saved documents
  getSavedDocuments: protectedProcedure.query(async ({ ctx }) => {
    const results = await db.execute({
      sql: `SELECT id, module_id, document_title, document_data, created_at, updated_at
            FROM course_documents 
            WHERE user_id = ? AND course_type = 'business_setup'
            ORDER BY module_id ASC`,
      args: [ctx.user.id]
    });

    return results.rows.map((row: any) => ({
      id: row.id,
      moduleId: row.module_id,
      title: row.document_title,
      data: typeof row.document_data === 'string' ? JSON.parse(row.document_data) : row.document_data,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }),

  // Get user's course progress
  getProgress: protectedProcedure.query(async ({ ctx }) => {
    // Get completed modules from token transactions
    const completedResults = await db.execute({
      sql: `SELECT description FROM token_transactions 
            WHERE user_id = ? AND description LIKE 'Completed Business Setup Course Module%'`,
      args: [ctx.user.id]
    });

    const completedModules = completedResults.rows.map((row: any) => {
      const match = row.description.match(/Module (\d+)/);
      return match ? parseInt(match[1]) : null;
    }).filter(Boolean);

    // Get saved documents
    const documentsResults = await db.execute({
      sql: `SELECT module_id FROM course_documents 
            WHERE user_id = ? AND course_type = 'business_setup'`,
      args: [ctx.user.id]
    });

    const savedDocuments = documentsResults.rows.map((row: any) => row.module_id);

    const overview = getCourseOverview();
    const totalModules = overview.totalModules;
    const completedCount = completedModules.length;

    return {
      completedModules,
      savedDocuments,
      totalModules,
      completedCount,
      progressPercent: Math.round((completedCount / totalModules) * 100),
      isComplete: completedCount === totalModules,
      nextModule: completedCount < totalModules ? completedCount + 1 : null
    };
  }),

  // Generate final business plan PDF data
  generateBusinessPlan: protectedProcedure.mutation(async ({ ctx }) => {
    // Get all saved documents
    const documentsResults = await db.execute({
      sql: `SELECT module_id, document_title, document_data 
            FROM course_documents 
            WHERE user_id = ? AND course_type = 'business_setup'
            ORDER BY module_id ASC`,
      args: [ctx.user.id]
    });

    if (documentsResults.rows.length < 6) {
      throw new Error("Please complete all modules before generating your business plan");
    }

    const documents = documentsResults.rows.map((row: any) => ({
      moduleId: row.module_id,
      title: row.document_title,
      data: typeof row.document_data === 'string' ? JSON.parse(row.document_data) : row.document_data
    }));

    // Compile business plan data
    const businessPlanData = {
      generatedAt: new Date().toISOString(),
      userId: ctx.user.id,
      userName: ctx.user.name,
      sections: documents
    };

    // Save compiled business plan
    await db.execute({
      sql: `INSERT INTO generated_business_plans (user_id, plan_data, created_at)
            VALUES (?, ?, NOW())`,
      args: [ctx.user.id, JSON.stringify(businessPlanData)]
    });

    return {
      success: true,
      message: "Business plan generated successfully",
      data: businessPlanData
    };
  }),

  // Issue course completion certificate
  issueCertificate: protectedProcedure.mutation(async ({ ctx }) => {
    // Check if course is complete
    const completedResults = await db.execute({
      sql: `SELECT COUNT(DISTINCT description) as count FROM token_transactions 
            WHERE user_id = ? AND description LIKE 'Completed Business Setup Course Module%'`,
      args: [ctx.user.id]
    });

    const completedCount = (completedResults.rows[0] as any)?.count || 0;
    
    if (completedCount < 6) {
      throw new Error("Please complete all 6 modules before requesting your certificate");
    }

    // Check if certificate already issued
    const existingCert = await db.execute({
      sql: `SELECT id FROM certificates 
            WHERE user_id = ? AND certificate_type = 'business_setup_course'`,
      args: [ctx.user.id]
    });

    if (existingCert.rows.length > 0) {
      return {
        success: true,
        message: "Certificate already issued",
        certificateId: (existingCert.rows[0] as any).id
      };
    }

    // Issue new certificate
    const certResult = await db.execute({
      sql: `INSERT INTO certificates (user_id, certificate_type, title, description, issued_at)
            VALUES (?, 'business_setup_course', 'Business Setup Course Completion', 
                    'Successfully completed all 6 modules of the Business Setup Course', NOW())`,
      args: [ctx.user.id]
    });

    // Award completion bonus tokens
    await db.execute({
      sql: `INSERT INTO token_transactions (user_id, amount, type, description, created_at)
            VALUES (?, 500, 'earned', 'Business Setup Course Completion Bonus', NOW())`,
      args: [ctx.user.id]
    });

    await db.execute({
      sql: `UPDATE users SET token_balance = COALESCE(token_balance, 0) + 500 WHERE id = ?`,
      args: [ctx.user.id]
    });

    return {
      success: true,
      message: "Certificate issued successfully! You earned 500 bonus tokens.",
      certificateId: certResult.insertId
    };
  })
});
