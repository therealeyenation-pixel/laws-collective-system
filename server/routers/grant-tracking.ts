import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";

export const grantTrackingRouter = router({
  // Get grant tracking dashboard
  getDashboard: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const [opportunities] = await db.execute(
      `SELECT 
        COUNT(*) as total_opportunities,
        SUM(CASE WHEN status = 'eligible' THEN 1 ELSE 0 END) as eligible,
        SUM(CASE WHEN status = 'applied' THEN 1 ELSE 0 END) as applied,
        SUM(CASE WHEN deadline >= CURDATE() AND deadline <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as upcoming_deadlines
      FROM grant_opportunities`
    );

    const [applications] = await db.execute(
      `SELECT 
        COUNT(*) as total_applications,
        SUM(CASE WHEN status = 'awarded' THEN 1 ELSE 0 END) as awarded,
        SUM(CASE WHEN status = 'submitted' OR status = 'under_review' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'awarded' THEN awarded_amount ELSE 0 END) as total_awarded,
        SUM(CASE WHEN status IN ('drafting', 'review') THEN 1 ELSE 0 END) as in_progress
      FROM grant_applications`
    );

    const [upcomingDeadlines] = await db.execute(
      `SELECT go.id, go.grant_name, go.funder_name, go.deadline, go.funding_amount_max, go.priority
      FROM grant_opportunities go
      WHERE go.deadline >= CURDATE() AND go.status IN ('researching', 'eligible')
      ORDER BY go.deadline ASC LIMIT 10`
    );

    const [recentApplications] = await db.execute(
      `SELECT ga.id, ga.project_title, ga.status, ga.requested_amount, ga.submitted_date,
        go.grant_name, go.funder_name
      FROM grant_applications ga
      JOIN grant_opportunities go ON ga.opportunity_id = go.id
      ORDER BY ga.updated_at DESC LIMIT 10`
    );

    const [upcomingReports] = await db.execute(
      `SELECT gr.id, gr.report_type, gr.report_name, gr.due_date, gr.status,
        ga.project_title, go.funder_name
      FROM grant_reporting gr
      JOIN grant_applications ga ON gr.application_id = ga.id
      JOIN grant_opportunities go ON ga.opportunity_id = go.id
      WHERE gr.status IN ('upcoming', 'in_progress') AND gr.due_date >= CURDATE()
      ORDER BY gr.due_date ASC LIMIT 5`
    );

    const oppStats = (opportunities as any[])[0] || {};
    const appStats = (applications as any[])[0] || {};

    return {
      opportunities: {
        total: Number(oppStats.total_opportunities) || 0,
        eligible: Number(oppStats.eligible) || 0,
        applied: Number(oppStats.applied) || 0,
        upcomingDeadlines: Number(oppStats.upcoming_deadlines) || 0,
      },
      applications: {
        total: Number(appStats.total_applications) || 0,
        awarded: Number(appStats.awarded) || 0,
        pending: Number(appStats.pending) || 0,
        inProgress: Number(appStats.in_progress) || 0,
        totalAwarded: Number(appStats.total_awarded) || 0,
      },
      upcomingDeadlines: upcomingDeadlines as any[],
      recentApplications: recentApplications as any[],
      upcomingReports: upcomingReports as any[],
    };
  }),

  // Get all opportunities
  getOpportunities: protectedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        grantType: z.string().optional(),
        priority: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = `SELECT * FROM grant_opportunities WHERE 1=1`;
      const params: any[] = [];

      if (input.status) {
        query += ` AND status = ?`;
        params.push(input.status);
      }
      if (input.grantType) {
        query += ` AND grant_type = ?`;
        params.push(input.grantType);
      }
      if (input.priority) {
        query += ` AND priority = ?`;
        params.push(input.priority);
      }

      query += ` ORDER BY deadline ASC`;

      const [opportunities] = await db.execute(query, params);
      return opportunities as any[];
    }),

  // Create opportunity
  createOpportunity: protectedProcedure
    .input(
      z.object({
        funderName: z.string(),
        grantName: z.string(),
        description: z.string().optional(),
        fundingAmountMin: z.number().optional(),
        fundingAmountMax: z.number().optional(),
        deadline: z.string().optional(),
        applicationUrl: z.string().optional(),
        eligibilityRequirements: z.string().optional(),
        focusAreas: z.string().optional(),
        grantType: z.enum(["federal", "state", "local", "foundation", "corporate", "other"]).default("foundation"),
        priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.execute(
        `INSERT INTO grant_opportunities (
          funder_name, grant_name, description, funding_amount_min, funding_amount_max,
          deadline, application_url, eligibility_requirements, focus_areas,
          grant_type, priority, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          input.funderName,
          input.grantName,
          input.description || null,
          input.fundingAmountMin || null,
          input.fundingAmountMax || null,
          input.deadline || null,
          input.applicationUrl || null,
          input.eligibilityRequirements || null,
          input.focusAreas || null,
          input.grantType,
          input.priority,
          input.notes || null,
        ]
      );

      return { success: true };
    }),

  // Update opportunity status
  updateOpportunityStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["researching", "eligible", "not_eligible", "applied", "archived"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.execute(
        `UPDATE grant_opportunities SET status = ? WHERE id = ?`,
        [input.status, input.id]
      );

      return { success: true };
    }),

  // Get all applications
  getApplications: protectedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        opportunityId: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = `SELECT ga.*, go.grant_name, go.funder_name, go.deadline as opportunity_deadline
        FROM grant_applications ga
        JOIN grant_opportunities go ON ga.opportunity_id = go.id
        WHERE 1=1`;
      const params: any[] = [];

      if (input.status) {
        query += ` AND ga.status = ?`;
        params.push(input.status);
      }
      if (input.opportunityId) {
        query += ` AND ga.opportunity_id = ?`;
        params.push(input.opportunityId);
      }

      query += ` ORDER BY ga.updated_at DESC`;

      const [applications] = await db.execute(query, params);
      return applications as any[];
    }),

  // Create application
  createApplication: protectedProcedure
    .input(
      z.object({
        opportunityId: z.number(),
        applicationName: z.string().optional(),
        projectTitle: z.string(),
        projectDescription: z.string().optional(),
        requestedAmount: z.number().optional(),
        projectStartDate: z.string().optional(),
        projectEndDate: z.string().optional(),
        assignedTo: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [result] = await db.execute(
        `INSERT INTO grant_applications (
          opportunity_id, application_name, project_title, project_description,
          requested_amount, project_start_date, project_end_date, assigned_to, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'not_started')`,
        [
          input.opportunityId,
          input.applicationName || null,
          input.projectTitle,
          input.projectDescription || null,
          input.requestedAmount || null,
          input.projectStartDate || null,
          input.projectEndDate || null,
          input.assignedTo || null,
        ]
      );

      // Update opportunity status to applied
      await db.execute(
        `UPDATE grant_opportunities SET status = 'applied' WHERE id = ?`,
        [input.opportunityId]
      );

      return { success: true, applicationId: (result as any).insertId };
    }),

  // Update application status
  updateApplicationStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["not_started", "drafting", "review", "submitted", "under_review", "awarded", "rejected", "withdrawn"]),
        submittedDate: z.string().optional(),
        confirmationNumber: z.string().optional(),
        awardedAmount: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = `UPDATE grant_applications SET status = ?`;
      const params: any[] = [input.status];

      if (input.submittedDate) {
        query += `, submitted_date = ?`;
        params.push(input.submittedDate);
      }
      if (input.confirmationNumber) {
        query += `, confirmation_number = ?`;
        params.push(input.confirmationNumber);
      }
      if (input.awardedAmount !== undefined) {
        query += `, awarded_amount = ?`;
        params.push(input.awardedAmount);
      }

      query += ` WHERE id = ?`;
      params.push(input.id);

      await db.execute(query, params);

      return { success: true };
    }),

  // Get documents for application
  getDocuments: protectedProcedure
    .input(z.object({ applicationId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [documents] = await db.execute(
        `SELECT * FROM grant_documents WHERE application_id = ? ORDER BY due_date ASC`,
        [input.applicationId]
      );

      return documents as any[];
    }),

  // Add document to application
  addDocument: protectedProcedure
    .input(
      z.object({
        applicationId: z.number(),
        documentType: z.enum(["narrative", "budget", "timeline", "letters_of_support", "financials", "tax_exempt", "board_list", "org_chart", "resumes", "other"]),
        documentName: z.string(),
        dueDate: z.string().optional(),
        assignedTo: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.execute(
        `INSERT INTO grant_documents (application_id, document_type, document_name, due_date, assigned_to)
        VALUES (?, ?, ?, ?, ?)`,
        [input.applicationId, input.documentType, input.documentName, input.dueDate || null, input.assignedTo || null]
      );

      return { success: true };
    }),

  // Update document status
  updateDocumentStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["not_started", "in_progress", "complete", "needs_revision"]),
        fileUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = `UPDATE grant_documents SET status = ?`;
      const params: any[] = [input.status];

      if (input.fileUrl) {
        query += `, file_url = ?`;
        params.push(input.fileUrl);
      }

      query += ` WHERE id = ?`;
      params.push(input.id);

      await db.execute(query, params);

      return { success: true };
    }),

  // Get reporting requirements
  getReporting: protectedProcedure
    .input(z.object({ applicationId: z.number().optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = `SELECT gr.*, ga.project_title, go.funder_name
        FROM grant_reporting gr
        JOIN grant_applications ga ON gr.application_id = ga.id
        JOIN grant_opportunities go ON ga.opportunity_id = go.id`;
      const params: any[] = [];

      if (input.applicationId) {
        query += ` WHERE gr.application_id = ?`;
        params.push(input.applicationId);
      }

      query += ` ORDER BY gr.due_date ASC`;

      const [reports] = await db.execute(query, params);
      return reports as any[];
    }),

  // Add reporting requirement
  addReportingRequirement: protectedProcedure
    .input(
      z.object({
        applicationId: z.number(),
        reportType: z.enum(["progress", "financial", "final", "interim", "annual"]),
        reportName: z.string().optional(),
        dueDate: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.execute(
        `INSERT INTO grant_reporting (application_id, report_type, report_name, due_date)
        VALUES (?, ?, ?, ?)`,
        [input.applicationId, input.reportType, input.reportName || null, input.dueDate]
      );

      return { success: true };
    }),

  // Update report status
  updateReportStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["upcoming", "in_progress", "submitted", "accepted", "revision_needed"]),
        submittedDate: z.string().optional(),
        fileUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = `UPDATE grant_reporting SET status = ?`;
      const params: any[] = [input.status];

      if (input.submittedDate) {
        query += `, submitted_date = ?`;
        params.push(input.submittedDate);
      }
      if (input.fileUrl) {
        query += `, file_url = ?`;
        params.push(input.fileUrl);
      }

      query += ` WHERE id = ?`;
      params.push(input.id);

      await db.execute(query, params);

      return { success: true };
    }),

  // Get pipeline view (opportunities grouped by status)
  getPipeline: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const [researching] = await db.execute(
      `SELECT * FROM grant_opportunities WHERE status = 'researching' ORDER BY deadline ASC`
    );
    const [eligible] = await db.execute(
      `SELECT * FROM grant_opportunities WHERE status = 'eligible' ORDER BY deadline ASC`
    );
    const [applied] = await db.execute(
      `SELECT go.*, ga.status as application_status, ga.id as application_id
      FROM grant_opportunities go
      LEFT JOIN grant_applications ga ON go.id = ga.opportunity_id
      WHERE go.status = 'applied' ORDER BY go.deadline ASC`
    );

    return {
      researching: researching as any[],
      eligible: eligible as any[],
      applied: applied as any[],
    };
  }),
});
