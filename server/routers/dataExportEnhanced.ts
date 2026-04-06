import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { db } from "../db";
import { 
  businessEntities, 
  employees, 
  contactSubmissions,
  luvledgerAccounts 
} from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { json2csv } from "json-2-csv";

export const dataExportEnhancedRouter = router({
  // Export business entities as CSV
  exportBusinessEntities: protectedProcedure
    .input(z.object({ format: z.enum(["csv", "json"]) }))
    .mutation(async ({ input, ctx }) => {
      try {
        const entities = await db
          .select()
          .from(businessEntities)
          .where(eq(businessEntities.ownerId, ctx.user!.id));

        if (input.format === "csv") {
          const csv = await json2csv(entities);
          return {
            success: true,
            data: csv,
            filename: `business-entities-${new Date().toISOString().split("T")[0]}.csv`,
            mimeType: "text/csv",
          };
        } else {
          return {
            success: true,
            data: JSON.stringify(entities, null, 2),
            filename: `business-entities-${new Date().toISOString().split("T")[0]}.json`,
            mimeType: "application/json",
          };
        }
      } catch (error) {
        console.error("Error exporting business entities:", error);
        throw new Error("Failed to export business entities");
      }
    }),

  // Export employees as CSV
  exportEmployees: protectedProcedure
    .input(z.object({ format: z.enum(["csv", "json"]) }))
    .mutation(async ({ input }) => {
      try {
        const emps = await db.select().from(employees);

        if (input.format === "csv") {
          const csv = await json2csv(emps);
          return {
            success: true,
            data: csv,
            filename: `employees-${new Date().toISOString().split("T")[0]}.csv`,
            mimeType: "text/csv",
          };
        } else {
          return {
            success: true,
            data: JSON.stringify(emps, null, 2),
            filename: `employees-${new Date().toISOString().split("T")[0]}.json`,
            mimeType: "application/json",
          };
        }
      } catch (error) {
        console.error("Error exporting employees:", error);
        throw new Error("Failed to export employees");
      }
    }),

  // Export contact submissions as CSV
  exportContactSubmissions: protectedProcedure
    .input(z.object({ format: z.enum(["csv", "json"]) }))
    .mutation(async ({ input }) => {
      try {
        const submissions = await db.select().from(contactSubmissions);

        if (input.format === "csv") {
          const csv = await json2csv(submissions);
          return {
            success: true,
            data: csv,
            filename: `contact-submissions-${new Date().toISOString().split("T")[0]}.csv`,
            mimeType: "text/csv",
          };
        } else {
          return {
            success: true,
            data: JSON.stringify(submissions, null, 2),
            filename: `contact-submissions-${new Date().toISOString().split("T")[0]}.json`,
            mimeType: "application/json",
          };
        }
      } catch (error) {
        console.error("Error exporting contact submissions:", error);
        throw new Error("Failed to export contact submissions");
      }
    }),

  // Export LuvLedger accounts as CSV
  exportLuvLedgerAccounts: protectedProcedure
    .input(z.object({ format: z.enum(["csv", "json"]) }))
    .mutation(async ({ input, ctx }) => {
      try {
        const accounts = await db
          .select()
          .from(luvledgerAccounts)
          .where(eq(luvledgerAccounts.ownerId, ctx.user!.id));

        if (input.format === "csv") {
          const csv = await json2csv(accounts);
          return {
            success: true,
            data: csv,
            filename: `luvledger-accounts-${new Date().toISOString().split("T")[0]}.csv`,
            mimeType: "text/csv",
          };
        } else {
          return {
            success: true,
            data: JSON.stringify(accounts, null, 2),
            filename: `luvledger-accounts-${new Date().toISOString().split("T")[0]}.json`,
            mimeType: "application/json",
          };
        }
      } catch (error) {
        console.error("Error exporting LuvLedger accounts:", error);
        throw new Error("Failed to export LuvLedger accounts");
      }
    }),

  // Export all data as ZIP (comprehensive backup)
  exportAllData: protectedProcedure
    .input(z.object({ format: z.enum(["csv", "json"]) }))
    .mutation(async ({ input, ctx }) => {
      try {
        const [entities, emps, submissions, accounts] = await Promise.all([
          db
            .select()
            .from(businessEntities)
            .where(eq(businessEntities.ownerId, ctx.user!.id)),
          db.select().from(employees),
          db.select().from(contactSubmissions),
          db
            .select()
            .from(luvledgerAccounts)
            .where(eq(luvledgerAccounts.ownerId, ctx.user!.id)),
        ]);

        const exportData = {
          businessEntities: entities,
          employees: emps,
          contactSubmissions: submissions,
          luvledgerAccounts: accounts,
          exportedAt: new Date().toISOString(),
        };

        if (input.format === "csv") {
          return {
            success: true,
            data: JSON.stringify(exportData, null, 2),
            filename: `system-backup-${new Date().toISOString().split("T")[0]}.json`,
            mimeType: "application/json",
            note: "CSV export for all data returned as JSON. Use individual export endpoints for CSV format.",
          };
        } else {
          return {
            success: true,
            data: JSON.stringify(exportData, null, 2),
            filename: `system-backup-${new Date().toISOString().split("T")[0]}.json`,
            mimeType: "application/json",
          };
        }
      } catch (error) {
        console.error("Error exporting all data:", error);
        throw new Error("Failed to export system data");
      }
    }),

  // Get export statistics
  getExportStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const [entityCount, empCount, submissionCount, accountCount] = await Promise.all([
        db
          .select()
          .from(businessEntities)
          .where(eq(businessEntities.ownerId, ctx.user!.id)),
        db.select().from(employees),
        db.select().from(contactSubmissions),
        db
          .select()
          .from(luvledgerAccounts)
          .where(eq(luvledgerAccounts.ownerId, ctx.user!.id)),
      ]);

      return {
        businessEntities: entityCount.length,
        employees: empCount.length,
        contactSubmissions: submissionCount.length,
        luvledgerAccounts: accountCount.length,
        total: entityCount.length + empCount.length + submissionCount.length + accountCount.length,
      };
    } catch (error) {
      console.error("Error getting export stats:", error);
      throw new Error("Failed to get export statistics");
    }
  }),
});
