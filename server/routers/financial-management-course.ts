/**
 * Financial Management Course Router
 * Handles course progress, quiz submissions, and spreadsheet generation
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import {
  getFinancialManagementModules,
  getFinancialModuleById,
  getFinancialLessonContent,
  getFinancialModuleQuiz,
  getFinancialOutputTemplate,
  calculateFinancialQuizScore,
  getFinancialCourseOverview
} from "../services/financial-management-course";

export const financialManagementCourseRouter = router({
  // Get course overview
  getCourseOverview: protectedProcedure.query(async () => {
    return getFinancialCourseOverview();
  }),

  // Get all modules
  getModules: protectedProcedure.query(async () => {
    return getFinancialManagementModules();
  }),

  // Get single module details
  getModule: protectedProcedure
    .input(z.object({ moduleId: z.number() }))
    .query(async ({ input }) => {
      return getFinancialModuleById(input.moduleId);
    }),

  // Get lesson content
  getLesson: protectedProcedure
    .input(z.object({
      moduleId: z.number(),
      lessonId: z.string()
    }))
    .query(async ({ input }) => {
      return getFinancialLessonContent(input.moduleId, input.lessonId);
    }),

  // Get module quiz (without correct answers)
  getQuiz: protectedProcedure
    .input(z.object({ moduleId: z.number() }))
    .query(async ({ input }) => {
      const quiz = await getFinancialModuleQuiz(input.moduleId);
      if (!quiz) return null;
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
      const result = await calculateFinancialQuizScore(input.moduleId, input.answers);

      if (result.passed) {
        const module = await getFinancialModuleById(input.moduleId);
        if (module) {
          try {
            await db.execute({
              sql: `INSERT INTO token_transactions (user_id, amount, type, description, created_at)
                    VALUES (?, ?, 'earned', ?, NOW())`,
              args: [ctx.user.id, module.tokensReward, `Completed Financial Management Course Module ${input.moduleId}: ${module.title}`]
            });

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

  // Get spreadsheet template
  getSpreadsheetTemplate: protectedProcedure
    .input(z.object({ moduleId: z.number() }))
    .query(async ({ input }) => {
      return getFinancialOutputTemplate(input.moduleId);
    }),

  // Save spreadsheet data
  saveSpreadsheet: protectedProcedure
    .input(z.object({
      moduleId: z.number(),
      spreadsheetData: z.record(z.string(), z.any())
    }))
    .mutation(async ({ ctx, input }) => {
      const template = await getFinancialOutputTemplate(input.moduleId);
      if (!template) {
        throw new Error("Spreadsheet template not found");
      }

      const result = await db.execute({
        sql: `INSERT INTO course_documents (user_id, course_type, module_id, document_title, document_data, created_at)
              VALUES (?, 'financial_management', ?, ?, ?, NOW())
              ON DUPLICATE KEY UPDATE document_data = VALUES(document_data), updated_at = NOW()`,
        args: [ctx.user.id, input.moduleId, template.title, JSON.stringify(input.spreadsheetData)]
      });

      return {
        success: true,
        message: `${template.title} saved successfully`,
        documentId: result.insertId
      };
    }),

  // Get user's saved spreadsheets
  getSavedSpreadsheets: protectedProcedure.query(async ({ ctx }) => {
    const results = await db.execute({
      sql: `SELECT id, module_id, document_title, document_data, created_at, updated_at
            FROM course_documents
            WHERE user_id = ? AND course_type = 'financial_management'
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
    const completedResults = await db.execute({
      sql: `SELECT description FROM token_transactions
            WHERE user_id = ? AND description LIKE 'Completed Financial Management Course Module%'`,
      args: [ctx.user.id]
    });

    const completedModules = completedResults.rows.map((row: any) => {
      const match = row.description.match(/Module (\d+)/);
      return match ? parseInt(match[1]) : null;
    }).filter(Boolean);

    const spreadsheetsResults = await db.execute({
      sql: `SELECT module_id FROM course_documents
            WHERE user_id = ? AND course_type = 'financial_management'`,
      args: [ctx.user.id]
    });

    const savedSpreadsheets = spreadsheetsResults.rows.map((row: any) => row.module_id);

    const overview = getFinancialCourseOverview();
    const totalModules = overview.totalModules;
    const completedCount = completedModules.length;

    return {
      completedModules,
      savedSpreadsheets,
      totalModules,
      completedCount,
      progressPercent: Math.round((completedCount / totalModules) * 100),
      isComplete: completedCount === totalModules,
      nextModule: completedCount < totalModules ? completedCount + 1 : null
    };
  }),

  // Generate complete financial plan
  generateFinancialPlan: protectedProcedure.mutation(async ({ ctx }) => {
    const spreadsheetsResults = await db.execute({
      sql: `SELECT module_id, document_title, document_data
            FROM course_documents
            WHERE user_id = ? AND course_type = 'financial_management'
            ORDER BY module_id ASC`,
      args: [ctx.user.id]
    });

    if (spreadsheetsResults.rows.length < 6) {
      throw new Error("Please complete all modules before generating your financial plan");
    }

    const spreadsheets = spreadsheetsResults.rows.map((row: any) => ({
      moduleId: row.module_id,
      title: row.document_title,
      data: typeof row.document_data === 'string' ? JSON.parse(row.document_data) : row.document_data
    }));

    const financialPlanData = {
      generatedAt: new Date().toISOString(),
      userId: ctx.user.id,
      userName: ctx.user.name,
      sections: spreadsheets
    };

    await db.execute({
      sql: `INSERT INTO generated_business_plans (user_id, plan_data, created_at)
            VALUES (?, ?, NOW())`,
      args: [ctx.user.id, JSON.stringify({ type: 'financial_plan', ...financialPlanData })]
    });

    return {
      success: true,
      message: "Financial plan generated successfully",
      data: financialPlanData
    };
  }),

  // Issue course completion certificate
  issueCertificate: protectedProcedure.mutation(async ({ ctx }) => {
    const completedResults = await db.execute({
      sql: `SELECT COUNT(DISTINCT description) as count FROM token_transactions
            WHERE user_id = ? AND description LIKE 'Completed Financial Management Course Module%'`,
      args: [ctx.user.id]
    });

    const completedCount = (completedResults.rows[0] as any)?.count || 0;

    if (completedCount < 6) {
      throw new Error("Please complete all 6 modules before requesting your certificate");
    }

    const existingCert = await db.execute({
      sql: `SELECT id FROM certificates
            WHERE user_id = ? AND certificate_type = 'financial_management_course'`,
      args: [ctx.user.id]
    });

    if (existingCert.rows.length > 0) {
      return {
        success: true,
        message: "Certificate already issued",
        certificateId: (existingCert.rows[0] as any).id
      };
    }

    const certResult = await db.execute({
      sql: `INSERT INTO certificates (user_id, certificate_type, title, description, issued_at)
            VALUES (?, 'financial_management_course', 'Financial Management Course Completion',
                    'Successfully completed all 6 modules of the Financial Management Course', NOW())`,
      args: [ctx.user.id]
    });

    await db.execute({
      sql: `INSERT INTO token_transactions (user_id, amount, type, description, created_at)
            VALUES (?, 500, 'earned', 'Financial Management Course Completion Bonus', NOW())`,
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
