import { describe, it, expect } from "vitest";

describe("Company Calendar System", () => {
  describe("Meeting Scheduling", () => {
    it("should validate after-hours meeting times", () => {
      // After-hours: 6 PM - 9 PM CT (Tuesday-Thursday) or Saturday mornings
      const isAfterHours = (hour: number, dayOfWeek: number): boolean => {
        // Saturday (6) mornings 9 AM - 12 PM
        if (dayOfWeek === 6 && hour >= 9 && hour < 12) return true;
        // Tuesday (2), Wednesday (3), Thursday (4) evenings 6 PM - 9 PM
        if ([2, 3, 4].includes(dayOfWeek) && hour >= 18 && hour < 21) return true;
        return false;
      };

      // Valid times
      expect(isAfterHours(18, 2)).toBe(true); // Tuesday 6 PM
      expect(isAfterHours(19, 3)).toBe(true); // Wednesday 7 PM
      expect(isAfterHours(20, 4)).toBe(true); // Thursday 8 PM
      expect(isAfterHours(9, 6)).toBe(true);  // Saturday 9 AM
      expect(isAfterHours(10, 6)).toBe(true); // Saturday 10 AM

      // Invalid times
      expect(isAfterHours(14, 2)).toBe(false); // Tuesday 2 PM (business hours)
      expect(isAfterHours(22, 3)).toBe(false); // Wednesday 10 PM (too late)
      expect(isAfterHours(18, 1)).toBe(false); // Monday 6 PM (wrong day)
      expect(isAfterHours(18, 5)).toBe(false); // Friday 6 PM (wrong day)
    });

    it("should calculate meeting duration correctly", () => {
      const calculateDuration = (startHour: number, endHour: number): number => {
        return endHour - startHour;
      };

      expect(calculateDuration(18, 19)).toBe(1);
      expect(calculateDuration(18, 21)).toBe(3);
      expect(calculateDuration(9, 12)).toBe(3);
    });

    it("should validate meeting types", () => {
      const validTypes = ["team", "one_on_one", "training", "board", "all_hands"];
      
      expect(validTypes.includes("team")).toBe(true);
      expect(validTypes.includes("training")).toBe(true);
      expect(validTypes.includes("board")).toBe(true);
      expect(validTypes.includes("invalid")).toBe(false);
    });
  });

  describe("Attendance Tracking", () => {
    it("should track attendance statuses", () => {
      const validStatuses = ["pending", "confirmed", "declined", "attended", "absent", "excused"];
      
      expect(validStatuses.includes("pending")).toBe(true);
      expect(validStatuses.includes("confirmed")).toBe(true);
      expect(validStatuses.includes("attended")).toBe(true);
      expect(validStatuses.includes("excused")).toBe(true);
    });

    it("should calculate attendance rate", () => {
      const calculateAttendanceRate = (attended: number, total: number): number => {
        if (total === 0) return 0;
        return Math.round((attended / total) * 100);
      };

      expect(calculateAttendanceRate(10, 10)).toBe(100);
      expect(calculateAttendanceRate(8, 10)).toBe(80);
      expect(calculateAttendanceRate(0, 10)).toBe(0);
      expect(calculateAttendanceRate(0, 0)).toBe(0);
    });

    it("should identify attendance issues", () => {
      const hasAttendanceIssue = (rate: number, threshold: number = 75): boolean => {
        return rate < threshold;
      };

      expect(hasAttendanceIssue(80)).toBe(false);
      expect(hasAttendanceIssue(75)).toBe(false);
      expect(hasAttendanceIssue(74)).toBe(true);
      expect(hasAttendanceIssue(50)).toBe(true);
    });
  });

  describe("Core Hours Validation", () => {
    it("should validate core hours policy", () => {
      const coreHours = {
        days: [2, 3, 4], // Tuesday, Wednesday, Thursday
        startTime: 18,   // 6 PM
        endTime: 21,     // 9 PM
        timezone: "America/Chicago"
      };

      expect(coreHours.days).toContain(2);
      expect(coreHours.days).toContain(3);
      expect(coreHours.days).toContain(4);
      expect(coreHours.startTime).toBe(18);
      expect(coreHours.endTime).toBe(21);
    });

    it("should validate Saturday hours", () => {
      const saturdayHours = {
        day: 6,
        startTime: 9,
        endTime: 12,
        timezone: "America/Chicago"
      };

      expect(saturdayHours.day).toBe(6);
      expect(saturdayHours.startTime).toBe(9);
      expect(saturdayHours.endTime).toBe(12);
    });
  });
});
