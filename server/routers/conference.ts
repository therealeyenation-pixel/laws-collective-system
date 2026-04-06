import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { db } from "../db";
import { conferenceRooms, conferenceSessions, conferenceParticipants } from "../../drizzle/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const conferenceRouter = router({
  // Create conference room
  createRoom: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        capacity: z.number().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const room = await db.insert(conferenceRooms).values({
          userId: ctx.user.id,
          name: input.name,
          description: input.description,
          capacity: input.capacity,
          status: "available",
          createdAt: new Date(),
        });

        return { success: true, roomId: room[0].insertId };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create conference room",
        });
      }
    }),

  // Get all conference rooms
  getRooms: protectedProcedure.query(async ({ ctx }) => {
    try {
      const rooms = await db
        .select()
        .from(conferenceRooms)
        .where(eq(conferenceRooms.userId, ctx.user.id))
        .orderBy(desc(conferenceRooms.createdAt));

      return rooms;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch conference rooms",
      });
    }
  }),

  // Schedule conference session
  scheduleSession: protectedProcedure
    .input(
      z.object({
        roomId: z.number(),
        title: z.string(),
        description: z.string(),
        startTime: z.date(),
        endTime: z.date(),
        topic: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify room ownership
        const room = await db
          .select()
          .from(conferenceRooms)
          .where(
            and(
              eq(conferenceRooms.id, input.roomId),
              eq(conferenceRooms.userId, ctx.user.id)
            )
          );

        if (!room.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Conference room not found",
          });
        }

        const session = await db.insert(conferenceSessions).values({
          roomId: input.roomId,
          title: input.title,
          description: input.description,
          startTime: input.startTime,
          endTime: input.endTime,
          topic: input.topic,
          status: "scheduled",
          createdAt: new Date(),
        });

        return { success: true, sessionId: session[0].insertId };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to schedule conference session",
        });
      }
    }),

  // Get sessions for room
  getSessions: protectedProcedure
    .input(z.object({ roomId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        // Verify room ownership
        const room = await db
          .select()
          .from(conferenceRooms)
          .where(
            and(
              eq(conferenceRooms.id, input.roomId),
              eq(conferenceRooms.userId, ctx.user.id)
            )
          );

        if (!room.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Conference room not found",
          });
        }

        const sessions = await db
          .select()
          .from(conferenceSessions)
          .where(eq(conferenceSessions.roomId, input.roomId))
          .orderBy(desc(conferenceSessions.startTime));

        return sessions;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch conference sessions",
        });
      }
    }),

  // Get upcoming sessions
  getUpcomingSessions: protectedProcedure.query(async ({ ctx }) => {
    try {
      const now = new Date();
      const sessions = await db
        .select()
        .from(conferenceSessions)
        .innerJoin(
          conferenceRooms,
          eq(conferenceSessions.roomId, conferenceRooms.id)
        )
        .where(
          and(
            eq(conferenceRooms.userId, ctx.user.id),
            gte(conferenceSessions.startTime, now)
          )
        )
        .orderBy(conferenceSessions.startTime);

      return sessions;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch upcoming sessions",
      });
    }
  }),

  // Add participant to session
  addParticipant: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        name: z.string(),
        email: z.string().email(),
        role: z.enum(["host", "presenter", "attendee"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const participant = await db.insert(conferenceParticipants).values({
          sessionId: input.sessionId,
          name: input.name,
          email: input.email,
          role: input.role,
          status: "invited",
          joinedAt: null,
          createdAt: new Date(),
        });

        return { success: true, participantId: participant[0].insertId };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add participant",
        });
      }
    }),

  // Get session participants
  getParticipants: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const participants = await db
          .select()
          .from(conferenceParticipants)
          .where(eq(conferenceParticipants.sessionId, input.sessionId))
          .orderBy(conferenceParticipants.role);

        return participants;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch participants",
        });
      }
    }),

  // Start session
  startSession: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await db
          .update(conferenceSessions)
          .set({
            status: "active",
            startedAt: new Date(),
          })
          .where(eq(conferenceSessions.id, input.sessionId));

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to start session",
        });
      }
    }),

  // End session
  endSession: protectedProcedure
    .input(z.object({ sessionId: z.number(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await db
          .update(conferenceSessions)
          .set({
            status: "completed",
            endedAt: new Date(),
            notes: input.notes,
          })
          .where(eq(conferenceSessions.id, input.sessionId));

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to end session",
        });
      }
    }),

  // Mark participant as joined
  markParticipantJoined: protectedProcedure
    .input(z.object({ participantId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await db
          .update(conferenceParticipants)
          .set({
            status: "joined",
            joinedAt: new Date(),
          })
          .where(eq(conferenceParticipants.id, input.participantId));

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to mark participant as joined",
        });
      }
    }),
});
