import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the getDb function
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

// Mock the email notifications
vi.mock("./services/emailNotifications", () => ({
  sendMeetingReminder: vi.fn().mockResolvedValue({ success: true, sent: 1 }),
}));

describe("Meeting Reminders Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("process15MinuteReminders", () => {
    it("should return result object with expected fields", async () => {
      const { process15MinuteReminders } = await import("./services/meetingReminders");
      
      const result = await process15MinuteReminders();
      
      expect(result).toHaveProperty("processed");
      expect(result).toHaveProperty("remindersSent");
      expect(result).toHaveProperty("errors");
      expect(typeof result.processed).toBe("number");
      expect(typeof result.remindersSent).toBe("number");
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it("should handle empty database gracefully", async () => {
      const { process15MinuteReminders } = await import("./services/meetingReminders");
      
      const result = await process15MinuteReminders();
      
      expect(result.processed).toBe(0);
      expect(result.remindersSent).toBe(0);
      expect(result.errors.length).toBe(0);
    });
  });

  describe("process1HourReminders", () => {
    it("should return result object with expected fields", async () => {
      const { process1HourReminders } = await import("./services/meetingReminders");
      
      const result = await process1HourReminders();
      
      expect(result).toHaveProperty("processed");
      expect(result).toHaveProperty("remindersSent");
      expect(result).toHaveProperty("errors");
      expect(typeof result.processed).toBe("number");
      expect(typeof result.remindersSent).toBe("number");
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });

  describe("process24HourReminders", () => {
    it("should return result object with expected fields", async () => {
      const { process24HourReminders } = await import("./services/meetingReminders");
      
      const result = await process24HourReminders();
      
      expect(result).toHaveProperty("processed");
      expect(result).toHaveProperty("remindersSent");
      expect(result).toHaveProperty("errors");
    });
  });

  describe("processAllMeetingReminders", () => {
    it("should process all reminder types and return combined results", async () => {
      const { processAllMeetingReminders } = await import("./services/meetingReminders");
      
      const result = await processAllMeetingReminders();
      
      expect(result).toHaveProperty("fifteenMin");
      expect(result).toHaveProperty("oneHour");
      expect(result).toHaveProperty("twentyFourHour");
      
      // Each should have the expected structure
      expect(result.fifteenMin).toHaveProperty("processed");
      expect(result.fifteenMin).toHaveProperty("remindersSent");
      expect(result.fifteenMin).toHaveProperty("errors");
      
      expect(result.oneHour).toHaveProperty("processed");
      expect(result.oneHour).toHaveProperty("remindersSent");
      expect(result.oneHour).toHaveProperty("errors");
      
      expect(result.twentyFourHour).toHaveProperty("processed");
      expect(result.twentyFourHour).toHaveProperty("remindersSent");
      expect(result.twentyFourHour).toHaveProperty("errors");
    });
  });
});
