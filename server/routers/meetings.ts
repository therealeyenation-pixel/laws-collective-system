import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { 
  meetings, 
  meetingParticipants, 
  meetingChats,
  chats,
  chatParticipants,
  users
} from "../../drizzle/schema";
import { eq, and, gte, lte, desc, asc, or, sql, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { sendMeetingInvitation, sendMeetingReminder } from "../services/emailNotifications";

// Helper to generate a unique room name
function generateRoomName(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'luv-';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper to create meeting chat
async function createMeetingChat(meetingId: number, hostId: number, title: string) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  // Create a chat for the meeting
  const [chat] = await db.insert(chats).values({
    chatType: "meeting",
    name: `Meeting: ${title}`,
    meetingId,
    createdById: hostId,
  });
  
  const chatId = (chat as any).insertId;
  
  // Add host as chat owner
  await db.insert(chatParticipants).values({
    chatId: Number(chatId),
    userId: hostId,
    role: "owner",
  });
  
  // Link meeting to chat
  await db.insert(meetingChats).values({
    meetingId,
    chatId: Number(chatId),
  });
  
  return Number(chatId);
}

export const meetingsRouter = router({
  // Create a new meeting
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(255),
      description: z.string().optional(),
      scheduledAt: z.string().datetime(),
      duration: z.number().min(5).max(480).default(60),
      timezone: z.string().default("America/New_York"),
      provider: z.enum(["daily", "teams", "custom"]).default("daily"),
      isRecorded: z.boolean().default(false),
      waitingRoomEnabled: z.boolean().default(false),
      maxParticipants: z.number().min(2).max(1000).default(100),
      participants: z.array(z.object({
        userId: z.number().optional(),
        email: z.string().email().optional(),
        name: z.string().optional(),
        role: z.enum(["co_host", "presenter", "attendee"]).default("attendee"),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const roomName = generateRoomName();
      
      // Create the meeting
      const [result] = await db.insert(meetings).values({
        title: input.title,
        description: input.description,
        hostId: ctx.user.id,
        scheduledAt: new Date(input.scheduledAt),
        duration: input.duration,
        timezone: input.timezone,
        provider: input.provider,
        roomName,
        isRecorded: input.isRecorded,
        waitingRoomEnabled: input.waitingRoomEnabled,
        maxParticipants: input.maxParticipants,
      });
      
      const meetingId = Number((result as any).insertId);
      
      // Add host as participant
      await db.insert(meetingParticipants).values({
        meetingId,
        userId: ctx.user.id,
        role: "host",
        inviteStatus: "accepted",
      });
      
      // Add other participants
      if (input.participants && input.participants.length > 0) {
        const participantValues = input.participants.map(p => ({
          meetingId,
          userId: p.userId || null,
          guestEmail: p.email || null,
          guestName: p.name || null,
          role: p.role as "co_host" | "presenter" | "attendee",
          inviteStatus: "pending" as const,
        }));
        
        await db.insert(meetingParticipants).values(participantValues);
      }
      
      // Create meeting chat
      await createMeetingChat(meetingId, ctx.user.id, input.title);
      
      // Send email invitations to participants (async, don't wait)
      if (input.participants && input.participants.length > 0) {
        const participantUserIds = input.participants
          .filter(p => p.userId)
          .map(p => p.userId as number);
        
        const endTime = new Date(new Date(input.scheduledAt).getTime() + input.duration * 60000);
        
        sendMeetingInvitation(
          {
            meetingId,
            title: input.title,
            description: input.description,
            startTime: new Date(input.scheduledAt),
            endTime,
            organizerName: ctx.user.name || "Meeting Organizer",
            meetingLink: `${process.env.VITE_APP_URL || ""}/meetings?join=${roomName}`,
          },
          participantUserIds
        ).catch(err => console.error("Failed to send meeting invitations:", err));
      }
      
      return { 
        id: meetingId, 
        roomName,
        message: "Meeting created successfully" 
      };
    }),

  // Get meeting by ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [meeting] = await db
        .select()
        .from(meetings)
        .where(eq(meetings.id, input.id))
        .limit(1);
      
      if (!meeting) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
      }
      
      // Check if user is a participant
      const [participant] = await db
        .select()
        .from(meetingParticipants)
        .where(and(
          eq(meetingParticipants.meetingId, input.id),
          eq(meetingParticipants.userId, ctx.user.id)
        ))
        .limit(1);
      
      if (!participant && meeting.hostId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not a participant of this meeting" });
      }
      
      // Get all participants with user info
      const participants = await db
        .select({
          id: meetingParticipants.id,
          meetingId: meetingParticipants.meetingId,
          userId: meetingParticipants.userId,
          guestEmail: meetingParticipants.guestEmail,
          guestName: meetingParticipants.guestName,
          role: meetingParticipants.role,
          inviteStatus: meetingParticipants.inviteStatus,
          joinedAt: meetingParticipants.joinedAt,
          leftAt: meetingParticipants.leftAt,
          userName: users.name,
          userEmail: users.email,
        })
        .from(meetingParticipants)
        .leftJoin(users, eq(meetingParticipants.userId, users.id))
        .where(eq(meetingParticipants.meetingId, input.id));
      
      // Get host info
      const [host] = await db
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .where(eq(users.id, meeting.hostId))
        .limit(1);
      
      return {
        ...meeting,
        host,
        participants,
        isHost: meeting.hostId === ctx.user.id,
        userRole: participant?.role || (meeting.hostId === ctx.user.id ? "host" : null),
      };
    }),

  // List user's meetings
  list: protectedProcedure
    .input(z.object({
      status: z.enum(["scheduled", "in_progress", "completed", "cancelled", "all"]).default("all"),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { meetings: [], total: 0 };

      // Get meetings where user is host or participant
      const participantMeetingIds = await db
        .select({ meetingId: meetingParticipants.meetingId })
        .from(meetingParticipants)
        .where(eq(meetingParticipants.userId, ctx.user.id));
      
      const meetingIds = participantMeetingIds.map((p: any) => p.meetingId);
      
      const results = await db
        .select({
          id: meetings.id,
          title: meetings.title,
          description: meetings.description,
          hostId: meetings.hostId,
          scheduledAt: meetings.scheduledAt,
          duration: meetings.duration,
          status: meetings.status,
          provider: meetings.provider,
          roomName: meetings.roomName,
          roomUrl: meetings.roomUrl,
          isRecorded: meetings.isRecorded,
          createdAt: meetings.createdAt,
          hostName: users.name,
        })
        .from(meetings)
        .leftJoin(users, eq(meetings.hostId, users.id))
        .where(
          meetingIds.length > 0
            ? or(
                eq(meetings.hostId, ctx.user.id),
                inArray(meetings.id, meetingIds)
              )
            : eq(meetings.hostId, ctx.user.id)
        )
        .orderBy(desc(meetings.scheduledAt))
        .limit(input.limit)
        .offset(input.offset);
      
      // Filter by status if not "all"
      let filteredResults = results;
      if (input.status !== "all") {
        filteredResults = results.filter((m: any) => m.status === input.status);
      }
      
      // Filter by date range
      if (input.startDate) {
        const startDate = new Date(input.startDate);
        filteredResults = filteredResults.filter((m: any) => m.scheduledAt >= startDate);
      }
      if (input.endDate) {
        const endDate = new Date(input.endDate);
        filteredResults = filteredResults.filter((m: any) => m.scheduledAt <= endDate);
      }
      
      return {
        meetings: filteredResults,
        total: filteredResults.length,
      };
    }),

  // Get upcoming meetings
  upcoming: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const now = new Date();
      
      // Get meeting IDs where user is participant
      const participantMeetingIds = await db
        .select({ meetingId: meetingParticipants.meetingId })
        .from(meetingParticipants)
        .where(eq(meetingParticipants.userId, ctx.user.id));
      
      const meetingIds = participantMeetingIds.map((p: any) => p.meetingId);
      
      const results = await db
        .select({
          id: meetings.id,
          title: meetings.title,
          scheduledAt: meetings.scheduledAt,
          duration: meetings.duration,
          status: meetings.status,
          provider: meetings.provider,
          roomName: meetings.roomName,
          hostId: meetings.hostId,
          hostName: users.name,
        })
        .from(meetings)
        .leftJoin(users, eq(meetings.hostId, users.id))
        .where(
          and(
            meetingIds.length > 0
              ? or(
                  eq(meetings.hostId, ctx.user.id),
                  inArray(meetings.id, meetingIds)
                )
              : eq(meetings.hostId, ctx.user.id),
            gte(meetings.scheduledAt, now),
            eq(meetings.status, "scheduled")
          )
        )
        .orderBy(asc(meetings.scheduledAt))
        .limit(input.limit);
      
      return results;
    }),

  // Update meeting
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
      scheduledAt: z.string().datetime().optional(),
      duration: z.number().min(5).max(480).optional(),
      isRecorded: z.boolean().optional(),
      waitingRoomEnabled: z.boolean().optional(),
      maxParticipants: z.number().min(2).max(1000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const { id, ...updates } = input;
      
      // Check if user is host
      const [meeting] = await db
        .select()
        .from(meetings)
        .where(eq(meetings.id, id))
        .limit(1);
      
      if (!meeting) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
      }
      
      if (meeting.hostId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the host can update the meeting" });
      }
      
      const updateData: any = {};
      if (updates.title) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.scheduledAt) updateData.scheduledAt = new Date(updates.scheduledAt);
      if (updates.duration) updateData.duration = updates.duration;
      if (updates.isRecorded !== undefined) updateData.isRecorded = updates.isRecorded;
      if (updates.waitingRoomEnabled !== undefined) updateData.waitingRoomEnabled = updates.waitingRoomEnabled;
      if (updates.maxParticipants) updateData.maxParticipants = updates.maxParticipants;
      
      if (Object.keys(updateData).length > 0) {
        await db.update(meetings).set(updateData).where(eq(meetings.id, id));
      }
      
      return { success: true, message: "Meeting updated successfully" };
    }),

  // Cancel meeting
  cancel: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [meeting] = await db
        .select()
        .from(meetings)
        .where(eq(meetings.id, input.id))
        .limit(1);
      
      if (!meeting) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
      }
      
      if (meeting.hostId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the host can cancel the meeting" });
      }
      
      await db.update(meetings)
        .set({ status: "cancelled" })
        .where(eq(meetings.id, input.id));
      
      return { success: true, message: "Meeting cancelled" };
    }),

  // Start meeting (update status and set room URL)
  start: protectedProcedure
    .input(z.object({ 
      id: z.number(),
      roomUrl: z.string().url().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [meeting] = await db
        .select()
        .from(meetings)
        .where(eq(meetings.id, input.id))
        .limit(1);
      
      if (!meeting) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
      }
      
      // Check if user is host or co-host
      const [participant] = await db
        .select()
        .from(meetingParticipants)
        .where(and(
          eq(meetingParticipants.meetingId, input.id),
          eq(meetingParticipants.userId, ctx.user.id)
        ))
        .limit(1);
      
      const canStart = meeting.hostId === ctx.user.id || 
                       participant?.role === "co_host";
      
      if (!canStart) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only host or co-host can start the meeting" });
      }
      
      await db.update(meetings)
        .set({ 
          status: "in_progress",
          startedAt: new Date(),
          roomUrl: input.roomUrl || meeting.roomUrl,
        })
        .where(eq(meetings.id, input.id));
      
      return { 
        success: true, 
        roomName: meeting.roomName,
        roomUrl: input.roomUrl || meeting.roomUrl,
      };
    }),

  // End meeting
  end: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [meeting] = await db
        .select()
        .from(meetings)
        .where(eq(meetings.id, input.id))
        .limit(1);
      
      if (!meeting) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
      }
      
      if (meeting.hostId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the host can end the meeting" });
      }
      
      await db.update(meetings)
        .set({ 
          status: "completed",
          endedAt: new Date(),
        })
        .where(eq(meetings.id, input.id));
      
      return { success: true, message: "Meeting ended" };
    }),

  // Join meeting (record participant join)
  join: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [meeting] = await db
        .select()
        .from(meetings)
        .where(eq(meetings.id, input.id))
        .limit(1);
      
      if (!meeting) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
      }
      
      // Check if user is a participant
      const [participant] = await db
        .select()
        .from(meetingParticipants)
        .where(and(
          eq(meetingParticipants.meetingId, input.id),
          eq(meetingParticipants.userId, ctx.user.id)
        ))
        .limit(1);
      
      if (!participant && meeting.hostId !== ctx.user.id) {
        // Add as attendee if not already a participant
        await db.insert(meetingParticipants).values({
          meetingId: input.id,
          userId: ctx.user.id,
          role: "attendee",
          inviteStatus: "accepted",
          joinedAt: new Date(),
        });
      } else if (participant) {
        // Update join time
        await db.update(meetingParticipants)
          .set({ 
            joinedAt: new Date(),
            inviteStatus: "accepted",
          })
          .where(eq(meetingParticipants.id, participant.id));
      }
      
      return { 
        success: true, 
        roomName: meeting.roomName,
        roomUrl: meeting.roomUrl,
        provider: meeting.provider,
      };
    }),

  // Leave meeting (record participant leave)
  leave: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [participant] = await db
        .select()
        .from(meetingParticipants)
        .where(and(
          eq(meetingParticipants.meetingId, input.id),
          eq(meetingParticipants.userId, ctx.user.id)
        ))
        .limit(1);
      
      if (participant) {
        const joinedAt = participant.joinedAt || new Date();
        const duration = Math.floor((Date.now() - joinedAt.getTime()) / 1000);
        
        await db.update(meetingParticipants)
          .set({ 
            leftAt: new Date(),
            totalDuration: (participant.totalDuration || 0) + duration,
          })
          .where(eq(meetingParticipants.id, participant.id));
      }
      
      return { success: true };
    }),

  // Add participant to meeting
  addParticipant: protectedProcedure
    .input(z.object({
      meetingId: z.number(),
      userId: z.number().optional(),
      email: z.string().email().optional(),
      name: z.string().optional(),
      role: z.enum(["co_host", "presenter", "attendee"]).default("attendee"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [meeting] = await db
        .select()
        .from(meetings)
        .where(eq(meetings.id, input.meetingId))
        .limit(1);
      
      if (!meeting) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
      }
      
      if (meeting.hostId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the host can add participants" });
      }
      
      await db.insert(meetingParticipants).values({
        meetingId: input.meetingId,
        userId: input.userId || null,
        guestEmail: input.email || null,
        guestName: input.name || null,
        role: input.role,
        inviteStatus: "pending",
      });
      
      return { success: true, message: "Participant added" };
    }),

  // Remove participant from meeting
  removeParticipant: protectedProcedure
    .input(z.object({
      meetingId: z.number(),
      participantId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [meeting] = await db
        .select()
        .from(meetings)
        .where(eq(meetings.id, input.meetingId))
        .limit(1);
      
      if (!meeting) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
      }
      
      if (meeting.hostId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the host can remove participants" });
      }
      
      await db.delete(meetingParticipants)
        .where(eq(meetingParticipants.id, input.participantId));
      
      return { success: true, message: "Participant removed" };
    }),

  // RSVP to meeting invitation
  rsvp: protectedProcedure
    .input(z.object({
      meetingId: z.number(),
      response: z.enum(["accepted", "declined", "tentative"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [participant] = await db
        .select()
        .from(meetingParticipants)
        .where(and(
          eq(meetingParticipants.meetingId, input.meetingId),
          eq(meetingParticipants.userId, ctx.user.id)
        ))
        .limit(1);
      
      if (!participant) {
        throw new TRPCError({ code: "NOT_FOUND", message: "You are not invited to this meeting" });
      }
      
      await db.update(meetingParticipants)
        .set({ inviteStatus: input.response })
        .where(eq(meetingParticipants.id, participant.id));
      
      return { success: true, message: `RSVP updated to ${input.response}` };
    }),

  // ==========================================
  // AGENDA ITEMS
  // ==========================================

  getAgendaItems: publicProcedure
    .input(z.object({ meetingId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      const items = await db.execute(sql`
        SELECT * FROM meeting_agenda_items 
        WHERE meetingId = ${input.meetingId}
        ORDER BY orderIndex ASC
      `);
      return items[0] || [];
    }),

  addAgendaItem: protectedProcedure
    .input(z.object({
      meetingId: z.number(),
      title: z.string(),
      description: z.string().optional(),
      presenter: z.string().optional(),
      duration: z.number().default(10),
      itemType: z.enum(["discussion", "vote", "information", "action_item", "add_on"]).default("discussion"),
      requiresVote: z.boolean().default(false),
      isAddOn: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Get next order index
      const maxOrder = await db.execute(sql`
        SELECT MAX(orderIndex) as maxOrder FROM meeting_agenda_items WHERE meetingId = ${input.meetingId}
      `);
      const nextOrder = ((maxOrder[0] as any)?.[0]?.maxOrder || 0) + 1;

      await db.execute(sql`
        INSERT INTO meeting_agenda_items 
        (meetingId, title, description, presenter, duration, orderIndex, itemType, requiresVote, isAddOn, addedById, addedByName)
        VALUES (${input.meetingId}, ${input.title}, ${input.description || null}, ${input.presenter || null}, 
                ${input.duration}, ${nextOrder}, ${input.itemType}, ${input.requiresVote}, ${input.isAddOn},
                ${ctx.user.id}, ${ctx.user.name || 'Unknown'})
      `);

      return { success: true };
    }),

  updateAgendaItem: protectedProcedure
    .input(z.object({
      itemId: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      requiresVote: z.boolean().optional(),
      status: z.enum(["pending", "in_progress", "completed", "skipped"]).optional(),
      discussionNotes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const updates: string[] = [];
      if (input.title !== undefined) updates.push(`title = '${input.title}'`);
      if (input.description !== undefined) updates.push(`description = '${input.description}'`);
      if (input.requiresVote !== undefined) updates.push(`requiresVote = ${input.requiresVote}`);
      if (input.status !== undefined) updates.push(`status = '${input.status}'`);
      if (input.discussionNotes !== undefined) updates.push(`discussionNotes = '${input.discussionNotes}'`);

      if (updates.length > 0) {
        await db.execute(sql.raw(`UPDATE meeting_agenda_items SET ${updates.join(', ')} WHERE id = ${input.itemId}`));
      }

      return { success: true };
    }),

  // ==========================================
  // LIVE VOTING
  // ==========================================

  startVote: protectedProcedure
    .input(z.object({
      meetingId: z.number(),
      agendaItemId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Verify host
      const [meeting] = await db.select().from(meetings).where(eq(meetings.id, input.meetingId)).limit(1);
      if (!meeting || meeting.hostId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the host can start a vote" });
      }

      await db.execute(sql`
        UPDATE meeting_agenda_items 
        SET voteStatus = 'in_progress', voteStartedAt = NOW()
        WHERE id = ${input.agendaItemId}
      `);

      return { success: true };
    }),

  castLiveVote: protectedProcedure
    .input(z.object({
      meetingId: z.number(),
      agendaItemId: z.number(),
      vote: z.enum(["for", "against", "abstain"]),
      rationale: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Check if voting is in progress
      const item = await db.execute(sql`
        SELECT * FROM meeting_agenda_items WHERE id = ${input.agendaItemId} AND voteStatus = 'in_progress'
      `);
      if (!(item[0] as any[])?.length) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Voting is not in progress for this item" });
      }

      // Insert or update vote
      await db.execute(sql`
        INSERT INTO meeting_live_votes (meetingId, agendaItemId, voterId, voterName, vote, rationale)
        VALUES (${input.meetingId}, ${input.agendaItemId}, ${ctx.user.id}, ${ctx.user.name || 'Unknown'}, ${input.vote}, ${input.rationale || null})
        ON DUPLICATE KEY UPDATE vote = ${input.vote}, rationale = ${input.rationale || null}, votedAt = NOW()
      `);

      // Update tally
      const votes = await db.execute(sql`
        SELECT vote, COUNT(*) as count FROM meeting_live_votes 
        WHERE agendaItemId = ${input.agendaItemId} GROUP BY vote
      `);
      
      let votesFor = 0, votesAgainst = 0, votesAbstain = 0;
      for (const v of (votes[0] as any[]) || []) {
        if (v.vote === 'for') votesFor = v.count;
        if (v.vote === 'against') votesAgainst = v.count;
        if (v.vote === 'abstain') votesAbstain = v.count;
      }

      await db.execute(sql`
        UPDATE meeting_agenda_items 
        SET votesFor = ${votesFor}, votesAgainst = ${votesAgainst}, votesAbstain = ${votesAbstain}
        WHERE id = ${input.agendaItemId}
      `);

      return { success: true, votesFor, votesAgainst, votesAbstain };
    }),

  endVote: protectedProcedure
    .input(z.object({
      meetingId: z.number(),
      agendaItemId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Verify host
      const [meeting] = await db.select().from(meetings).where(eq(meetings.id, input.meetingId)).limit(1);
      if (!meeting || meeting.hostId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the host can end a vote" });
      }

      // Get current tally
      const item = await db.execute(sql`
        SELECT votesFor, votesAgainst, votesAbstain FROM meeting_agenda_items WHERE id = ${input.agendaItemId}
      `);
      const data = (item[0] as any[])?.[0];
      
      let voteResult = 'pending';
      if (data) {
        if (data.votesFor > data.votesAgainst) voteResult = 'approved';
        else if (data.votesAgainst > data.votesFor) voteResult = 'rejected';
        else voteResult = 'tie';
      }

      await db.execute(sql`
        UPDATE meeting_agenda_items 
        SET voteStatus = 'completed', voteEndedAt = NOW(), voteResult = ${voteResult}
        WHERE id = ${input.agendaItemId}
      `);

      return { success: true, voteResult };
    }),

  getLiveVotes: publicProcedure
    .input(z.object({ agendaItemId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      const votes = await db.execute(sql`
        SELECT * FROM meeting_live_votes WHERE agendaItemId = ${input.agendaItemId} ORDER BY votedAt DESC
      `);
      return votes[0] || [];
    }),

  getVoteTally: publicProcedure
    .input(z.object({ agendaItemId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { votesFor: 0, votesAgainst: 0, votesAbstain: 0, voteStatus: 'pending', voteResult: 'pending' };
      
      const item = await db.execute(sql`
        SELECT votesFor, votesAgainst, votesAbstain, voteStatus, voteResult 
        FROM meeting_agenda_items WHERE id = ${input.agendaItemId}
      `);
      return (item[0] as any[])?.[0] || { votesFor: 0, votesAgainst: 0, votesAbstain: 0, voteStatus: 'pending', voteResult: 'pending' };
    }),

  // Convert agenda item vote to formal proposal
  convertToProposal: protectedProcedure
    .input(z.object({
      meetingId: z.number(),
      agendaItemId: z.number(),
      boardType: z.enum(["house", "network"]).default("network"),
      houseId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Get agenda item
      const item = await db.execute(sql`
        SELECT * FROM meeting_agenda_items WHERE id = ${input.agendaItemId}
      `);
      const agendaItem = (item[0] as any[])?.[0];
      if (!agendaItem) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Agenda item not found" });
      }

      // Create proposal
      const proposalNumber = `PROP-MTG-${Date.now()}`;
      const result = await db.execute(sql`
        INSERT INTO decision_board_proposals 
        (houseId, boardType, proposalNumber, title, description, proposalType,
         proposedByName, originatingMeetingId, originatingAgendaItemId,
         meetingDiscussionNotes, affectsNetworkPoolOnly, affectsHouseRetained,
         votingStartDate, votingEndDate, status)
        VALUES (${input.houseId || null}, ${input.boardType}, ${proposalNumber}, 
                ${agendaItem.title}, ${agendaItem.description || ''}, 'policy_change',
                ${ctx.user.name || 'Unknown'}, ${input.meetingId}, ${input.agendaItemId},
                ${agendaItem.discussionNotes || null}, ${input.boardType === 'network'}, FALSE,
                NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 'submitted')
      `);

      const proposalId = (result[0] as any).insertId;

      // Update agenda item
      await db.execute(sql`
        UPDATE meeting_agenda_items 
        SET voteProposalId = ${proposalId}, voteStatus = 'converted'
        WHERE id = ${input.agendaItemId}
      `);

      return { success: true, proposalId, proposalNumber };
    }),

  // Get meeting statistics
  stats: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return { upcoming: 0, completed: 0, hostedThisMonth: 0, totalMinutes: 0, totalMeetings: 0 };

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      // Get meeting IDs where user is participant
      const participantMeetingIds = await db
        .select({ meetingId: meetingParticipants.meetingId })
        .from(meetingParticipants)
        .where(eq(meetingParticipants.userId, ctx.user.id));
      
      const meetingIds = participantMeetingIds.map((p: any) => p.meetingId);
      
      const allMeetings = await db
        .select()
        .from(meetings)
        .where(
          meetingIds.length > 0
            ? or(
                eq(meetings.hostId, ctx.user.id),
                inArray(meetings.id, meetingIds)
              )
            : eq(meetings.hostId, ctx.user.id)
        );
      
      const upcoming = allMeetings.filter((m: any) => 
        m.status === "scheduled" && m.scheduledAt >= now
      ).length;
      
      const completed = allMeetings.filter((m: any) => 
        m.status === "completed"
      ).length;
      
      const hostedThisMonth = allMeetings.filter((m: any) => 
        m.hostId === ctx.user.id && m.scheduledAt >= thirtyDaysAgo
      ).length;
      
      const totalMinutes = allMeetings
        .filter((m: any) => m.status === "completed")
        .reduce((sum: number, m: any) => sum + (m.duration || 0), 0);
      
      return {
        upcoming,
        completed,
        hostedThisMonth,
        totalMinutes,
        totalMeetings: allMeetings.length,
      };
    }),
});
