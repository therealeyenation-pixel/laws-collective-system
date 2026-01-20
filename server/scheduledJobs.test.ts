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
  });

  describe("getJobHistory", () => {
    it("should return empty array when no jobs have run", () => {
      const history = getJobHistory("nonexistent_job");
      
      expect(Array.isArray(history)).toBe(true);
    });

    it("should respect limit parameter", () => {
      const history = getJobHistory(undefined, 5);
      
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
  });
});
