import { describe, it, expect } from "vitest";
import {
  getAvailableJobs,
  getJobHistory,
  isJobRunning,
} from "./services/scheduledJobs";

describe("Scheduled Jobs Service", () => {
  describe("getAvailableJobs", () => {
    it("should return list of available jobs", () => {
      const jobs = getAvailableJobs();
      
      expect(Array.isArray(jobs)).toBe(true);
      expect(jobs.length).toBeGreaterThan(0);
      
      // Check signature expiration job exists
      const signatureJob = jobs.find(j => j.name === "signature_expiration_notifications");
      expect(signatureJob).toBeDefined();
      expect(signatureJob?.description).toContain("expiring");
      expect(signatureJob?.recommendedSchedule).toBe("0 8 * * *");
    });

    it("should include isRunning status for each job", () => {
      const jobs = getAvailableJobs();
      
      for (const job of jobs) {
        expect(typeof job.isRunning).toBe("boolean");
      }
    });

    it("should include all four scheduled jobs", () => {
      const jobs = getAvailableJobs();
      
      const jobNames = jobs.map(j => j.name);
      expect(jobNames).toContain("signature_expiration_notifications");
      expect(jobNames).toContain("daily_summary_report");
      expect(jobNames).toContain("weekly_compliance_audit");
      expect(jobNames).toContain("monthly_data_cleanup");
    });
  });

  describe("getJobHistory", () => {
    it("should return array from database", async () => {
      const history = await getJobHistory("nonexistent_job");
      
      expect(Array.isArray(history)).toBe(true);
    });

    it("should respect limit parameter", async () => {
      const history = await getJobHistory(undefined, 5);
      
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeLessThanOrEqual(5);
    });
  });

  describe("isJobRunning", () => {
    it("should return false for non-running job", () => {
      const running = isJobRunning("signature_expiration_notifications");
      
      expect(running).toBe(false);
    });

    it("should return false for unknown job", () => {
      const running = isJobRunning("unknown_job");
      
      expect(running).toBe(false);
    });
  });

  describe("Job Configuration", () => {
    it("should have valid cron expression for signature job", () => {
      const jobs = getAvailableJobs();
      const signatureJob = jobs.find(j => j.name === "signature_expiration_notifications");
      
      // Validate cron expression format (5 fields: minute hour day month weekday)
      const cronParts = signatureJob?.recommendedSchedule.split(" ");
      expect(cronParts?.length).toBe(5);
      
      // Should run at 8 AM
      expect(cronParts?.[1]).toBe("8");
    });

    it("should have descriptive information for each job", () => {
      const jobs = getAvailableJobs();
      
      for (const job of jobs) {
        expect(job.name).toBeTruthy();
        expect(job.description).toBeTruthy();
        expect(job.description.length).toBeGreaterThan(10);
      }
    });

    it("should have different schedules for different jobs", () => {
      const jobs = getAvailableJobs();
      
      // Daily summary should run at 7 AM
      const dailyJob = jobs.find(j => j.name === "daily_summary_report");
      expect(dailyJob?.recommendedSchedule).toBe("0 7 * * *");
      
      // Weekly audit should run on Monday
      const weeklyJob = jobs.find(j => j.name === "weekly_compliance_audit");
      expect(weeklyJob?.recommendedSchedule).toBe("0 6 * * 1");
      
      // Monthly cleanup should run on 1st of month
      const monthlyJob = jobs.find(j => j.name === "monthly_data_cleanup");
      expect(monthlyJob?.recommendedSchedule).toBe("0 3 1 * *");
    });
  });
});
