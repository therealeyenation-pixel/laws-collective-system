import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { db } from "../db";
import { emergencyAlerts, emergencyContacts, emergencyResponses } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const emergencyRouter = router({
  // Trigger SOS alert
  triggerSOS: protectedProcedure
    .input(
      z.object({
        type: z.enum(["medical", "security", "fire", "natural_disaster", "other"]),
        location: z.string(),
        description: z.string(),
        severity: z.enum(["critical", "high", "medium", "low"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const alert = await db.insert(emergencyAlerts).values({
          userId: ctx.user.id,
          type: input.type,
          location: input.location,
          description: input.description,
          severity: input.severity,
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Notify emergency contacts
        const contacts = await db
          .select()
          .from(emergencyContacts)
          .where(eq(emergencyContacts.userId, ctx.user.id));

        for (const contact of contacts) {
          await db.insert(emergencyResponses).values({
            alertId: alert[0].insertId,
            contactId: contact.id,
            status: "notified",
            notifiedAt: new Date(),
          });
        }

        return {
          success: true,
          alertId: alert[0].insertId,
          contactsNotified: contacts.length,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to trigger SOS alert",
        });
      }
    }),

  // Get active alerts
  getActiveAlerts: protectedProcedure.query(async ({ ctx }) => {
    try {
      const alerts = await db
        .select()
        .from(emergencyAlerts)
        .where(
          and(
            eq(emergencyAlerts.userId, ctx.user.id),
            eq(emergencyAlerts.status, "active")
          )
        )
        .orderBy(desc(emergencyAlerts.createdAt));

      return alerts;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch active alerts",
      });
    }
  }),

  // Get alert history
  getAlertHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      try {
        const alerts = await db
          .select()
          .from(emergencyAlerts)
          .where(eq(emergencyAlerts.userId, ctx.user.id))
          .orderBy(desc(emergencyAlerts.createdAt))
          .limit(input.limit);

        return alerts;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch alert history",
        });
      }
    }),

  // Resolve alert
  resolveAlert: protectedProcedure
    .input(z.object({ alertId: z.number(), resolution: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const alert = await db
          .select()
          .from(emergencyAlerts)
          .where(
            and(
              eq(emergencyAlerts.id, input.alertId),
              eq(emergencyAlerts.userId, ctx.user.id)
            )
          );

        if (!alert.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Alert not found",
          });
        }

        await db
          .update(emergencyAlerts)
          .set({
            status: "resolved",
            resolution: input.resolution,
            updatedAt: new Date(),
          })
          .where(eq(emergencyAlerts.id, input.alertId));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to resolve alert",
        });
      }
    }),

  // Add emergency contact
  addContact: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        phone: z.string(),
        email: z.string().email(),
        relationship: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const contact = await db.insert(emergencyContacts).values({
          userId: ctx.user.id,
          name: input.name,
          phone: input.phone,
          email: input.email,
          relationship: input.relationship,
          createdAt: new Date(),
        });

        return { success: true, contactId: contact[0].insertId };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add emergency contact",
        });
      }
    }),

  // Get emergency contacts
  getContacts: protectedProcedure.query(async ({ ctx }) => {
    try {
      const contacts = await db
        .select()
        .from(emergencyContacts)
        .where(eq(emergencyContacts.userId, ctx.user.id));

      return contacts;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch emergency contacts",
      });
    }
  }),

  // Delete emergency contact
  deleteContact: protectedProcedure
    .input(z.object({ contactId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const contact = await db
          .select()
          .from(emergencyContacts)
          .where(
            and(
              eq(emergencyContacts.id, input.contactId),
              eq(emergencyContacts.userId, ctx.user.id)
            )
          );

        if (!contact.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Contact not found",
          });
        }

        await db
          .delete(emergencyContacts)
          .where(eq(emergencyContacts.id, input.contactId));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete emergency contact",
        });
      }
    }),

  // Get response status for alert
  getResponseStatus: protectedProcedure
    .input(z.object({ alertId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const responses = await db
          .select()
          .from(emergencyResponses)
          .where(eq(emergencyResponses.alertId, input.alertId));

        return responses;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch response status",
        });
      }
    }),
});
