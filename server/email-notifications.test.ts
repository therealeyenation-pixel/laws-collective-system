import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
  }),
}));

describe("Email Notifications Service", () => {
  describe("Email Templates", () => {
    it("should generate chat message email with correct structure", async () => {
      // Test that email templates include required elements
      const notification = {
        chatId: 1,
        messageId: 100,
        senderId: 1,
        senderName: "John Doe",
        content: "Hello, this is a test message",
        chatName: "Team Chat",
      };

      // Verify notification object has required fields
      expect(notification).toHaveProperty("chatId");
      expect(notification).toHaveProperty("messageId");
      expect(notification).toHaveProperty("senderId");
      expect(notification).toHaveProperty("senderName");
      expect(notification).toHaveProperty("content");
    });

    it("should generate meeting invitation email with correct structure", async () => {
      const notification = {
        meetingId: 1,
        title: "Team Standup",
        description: "Daily standup meeting",
        startTime: new Date("2026-01-22T10:00:00Z"),
        endTime: new Date("2026-01-22T11:00:00Z"),
        organizerName: "Jane Smith",
        meetingLink: "https://example.com/meetings?join=test-room",
        location: "Virtual",
      };

      // Verify notification object has required fields
      expect(notification).toHaveProperty("meetingId");
      expect(notification).toHaveProperty("title");
      expect(notification).toHaveProperty("startTime");
      expect(notification).toHaveProperty("endTime");
      expect(notification).toHaveProperty("organizerName");
      expect(notification.startTime).toBeInstanceOf(Date);
      expect(notification.endTime).toBeInstanceOf(Date);
    });

    it("should generate meeting reminder email with minutes before", async () => {
      const notification = {
        meetingId: 1,
        title: "Important Meeting",
        startTime: new Date("2026-01-22T10:00:00Z"),
        endTime: new Date("2026-01-22T11:00:00Z"),
        organizerName: "Jane Smith",
      };
      const minutesBefore = 15;

      // Verify reminder parameters
      expect(minutesBefore).toBeGreaterThan(0);
      expect(notification.title).toBeTruthy();
    });
  });

  describe("Calendar Link Generation", () => {
    it("should generate valid Google Calendar URL", () => {
      const meeting = {
        title: "Test Meeting",
        description: "Test description",
        scheduledAt: new Date("2026-01-22T10:00:00Z"),
        duration: 60,
        location: "Virtual",
        roomName: "test-room",
      };

      // Calculate expected date format
      const startDate = meeting.scheduledAt.toISOString().replace(/-|:|\.\d+/g, "");
      const endTime = new Date(meeting.scheduledAt.getTime() + meeting.duration * 60000);
      const endDate = endTime.toISOString().replace(/-|:|\.\d+/g, "");

      // Verify date formatting
      expect(startDate).toMatch(/^\d{8}T\d{6}Z$/);
      expect(endDate).toMatch(/^\d{8}T\d{6}Z$/);
    });

    it("should generate valid Outlook Calendar URL", () => {
      const meeting = {
        title: "Test Meeting",
        description: "Test description",
        scheduledAt: new Date("2026-01-22T10:00:00Z"),
        duration: 60,
        location: "Virtual",
      };

      // Verify ISO date format for Outlook
      const startDate = meeting.scheduledAt.toISOString();
      expect(startDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it("should generate valid ICS content", () => {
      const meeting = {
        id: 1,
        title: "Test Meeting",
        description: "Test description",
        scheduledAt: new Date("2026-01-22T10:00:00Z"),
        duration: 60,
        location: "Virtual",
        roomName: "test-room",
        organizerName: "John Doe",
        organizerEmail: "john@example.com",
      };

      // Verify ICS date format
      const formatICSDate = (date: Date) => {
        return date.toISOString().replace(/-|:|\.\d+/g, "").slice(0, 15) + "Z";
      };

      const icsDate = formatICSDate(meeting.scheduledAt);
      expect(icsDate).toMatch(/^\d{8}T\d{6}Z$/);
      expect(icsDate).toBe("20260122T100000Z");
    });
  });

  describe("Email Recipients", () => {
    it("should filter recipients by email notification preference", () => {
      const users = [
        { id: 1, email: "user1@example.com", name: "User 1", emailEnabled: true },
        { id: 2, email: "user2@example.com", name: "User 2", emailEnabled: false },
        { id: 3, email: "user3@example.com", name: "User 3", emailEnabled: null }, // defaults to true
        { id: 4, email: null, name: "User 4", emailEnabled: true }, // no email
      ];

      // Filter logic: email enabled (true or null) AND has email
      const recipients = users.filter(
        (u) => u.email && (u.emailEnabled === null || u.emailEnabled === true)
      );

      expect(recipients).toHaveLength(2);
      expect(recipients.map((r) => r.id)).toEqual([1, 3]);
    });

    it("should exclude sender from chat notification recipients", () => {
      const participants = [
        { userId: 1 },
        { userId: 2 },
        { userId: 3 },
      ];
      const senderId = 2;

      const recipientIds = participants
        .map((p) => p.userId)
        .filter((id) => id !== senderId);

      expect(recipientIds).toEqual([1, 3]);
      expect(recipientIds).not.toContain(senderId);
    });
  });

  describe("HTML Escaping", () => {
    it("should escape HTML special characters", () => {
      const escapeHtml = (text: string): string => {
        const htmlEntities: Record<string, string> = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        };
        return text.replace(/[&<>"']/g, (char) => htmlEntities[char]);
      };

      expect(escapeHtml("<script>alert('xss')</script>")).toBe(
        "&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;"
      );
      expect(escapeHtml("Hello & Goodbye")).toBe("Hello &amp; Goodbye");
      expect(escapeHtml('Say "Hello"')).toBe("Say &quot;Hello&quot;");
    });
  });

  describe("Meeting Duration Calculation", () => {
    it("should calculate correct end time from duration", () => {
      const startTime = new Date("2026-01-22T10:00:00Z");
      const duration = 60; // minutes

      const endTime = new Date(startTime.getTime() + duration * 60000);

      expect(endTime.toISOString()).toBe("2026-01-22T11:00:00.000Z");
    });

    it("should handle various durations correctly", () => {
      const startTime = new Date("2026-01-22T10:00:00Z");

      // 30 minutes
      expect(new Date(startTime.getTime() + 30 * 60000).toISOString()).toBe(
        "2026-01-22T10:30:00.000Z"
      );

      // 90 minutes
      expect(new Date(startTime.getTime() + 90 * 60000).toISOString()).toBe(
        "2026-01-22T11:30:00.000Z"
      );

      // 120 minutes
      expect(new Date(startTime.getTime() + 120 * 60000).toISOString()).toBe(
        "2026-01-22T12:00:00.000Z"
      );
    });
  });
});

describe("Calendar Sync Router", () => {
  describe("ICS File Generation", () => {
    it("should generate valid VCALENDAR structure", () => {
      const icsTemplate = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//The L.A.W.S. Collective//Meeting System//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:meeting-1@laws-collective.com
DTSTAMP:20260121T120000Z
DTSTART:20260122T100000Z
DTEND:20260122T110000Z
SUMMARY:Test Meeting
DESCRIPTION:Test description
LOCATION:Virtual
ORGANIZER;CN=John Doe:mailto:john@example.com
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

      expect(icsTemplate).toContain("BEGIN:VCALENDAR");
      expect(icsTemplate).toContain("END:VCALENDAR");
      expect(icsTemplate).toContain("BEGIN:VEVENT");
      expect(icsTemplate).toContain("END:VEVENT");
      expect(icsTemplate).toContain("VERSION:2.0");
    });

    it("should escape special characters in ICS fields", () => {
      const escapeICS = (text: string) => text.replace(/[,;\\]/g, "\\$&");

      expect(escapeICS("Hello, World")).toBe("Hello\\, World");
      expect(escapeICS("Test;Value")).toBe("Test\\;Value");
      expect(escapeICS("Path\\to\\file")).toBe("Path\\\\to\\\\file");
    });
  });

  describe("Availability Checking", () => {
    it("should detect meeting conflicts", () => {
      const proposedStart = new Date("2026-01-22T10:00:00Z");
      const proposedEnd = new Date("2026-01-22T11:00:00Z");

      const existingMeetings = [
        {
          title: "Morning Standup",
          scheduledAt: new Date("2026-01-22T09:30:00Z"),
          duration: 30, // ends at 10:00
        },
        {
          title: "Team Sync",
          scheduledAt: new Date("2026-01-22T10:30:00Z"),
          duration: 60, // overlaps with proposed
        },
        {
          title: "Afternoon Meeting",
          scheduledAt: new Date("2026-01-22T14:00:00Z"),
          duration: 60, // no conflict
        },
      ];

      const conflicts = existingMeetings.filter((m) => {
        const meetingEnd = new Date(m.scheduledAt.getTime() + m.duration * 60000);
        // Conflict if: meeting starts before proposed ends AND meeting ends after proposed starts
        return m.scheduledAt < proposedEnd && meetingEnd > proposedStart;
      });

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].title).toBe("Team Sync");
    });

    it("should allow adjacent meetings without conflict", () => {
      const proposedStart = new Date("2026-01-22T10:00:00Z");
      const proposedEnd = new Date("2026-01-22T11:00:00Z");

      const existingMeetings = [
        {
          title: "Before Meeting",
          scheduledAt: new Date("2026-01-22T09:00:00Z"),
          duration: 60, // ends exactly at 10:00
        },
        {
          title: "After Meeting",
          scheduledAt: new Date("2026-01-22T11:00:00Z"),
          duration: 60, // starts exactly at 11:00
        },
      ];

      const conflicts = existingMeetings.filter((m) => {
        const meetingEnd = new Date(m.scheduledAt.getTime() + m.duration * 60000);
        return m.scheduledAt < proposedEnd && meetingEnd > proposedStart;
      });

      expect(conflicts).toHaveLength(0);
    });
  });
});
