/**
 * Programs & Governance Layer Tests
 * Tests for Training & Curriculum, Outreach & Engagement, Board Oversight, Policy Management, Strategic Planning
 */

import { describe, it, expect } from "vitest";
import {
  calculateCourseProgress,
  createCourseData,
  createEnrollmentData,
  createCampaignData,
  createEventData,
  createCommunityMemberData,
  calculateEngagementRate,
  calculateCampaignROI,
  getEventAvailability,
  getProgramsLayerSummary
} from "./services/programs-layer";
import {
  checkQuorum,
  calculateVotingResult,
  createBoardMemberData,
  createBoardMeetingData,
  createResolutionData,
  isPolicyDueForReview,
  generatePolicyNumber,
  createPolicyData,
  calculateGoalProgress,
  getGoalStatus,
  createStrategicGoalData,
  createInitiativeData,
  getGovernanceLayerSummary
} from "./services/governance-layer";

describe("Programs Layer Service", () => {
  describe("Training & Curriculum Functions", () => {
    it("should calculate course progress correctly", () => {
      expect(calculateCourseProgress(5, 10)).toBe(50);
      expect(calculateCourseProgress(10, 10)).toBe(100);
      expect(calculateCourseProgress(0, 10)).toBe(0);
      expect(calculateCourseProgress(0, 0)).toBe(0);
    });

    it("should create course data", () => {
      const course = createCourseData(
        "Leadership 101",
        "Introduction to leadership",
        "leadership",
        "beginner",
        120,
        1
      );

      expect(course.title).toBe("Leadership 101");
      expect(course.category).toBe("leadership");
      expect(course.level).toBe("beginner");
      expect(course.duration).toBe(120);
      expect(course.status).toBe("draft");
      expect(course.createdBy).toBe(1);
    });

    it("should create enrollment data", () => {
      const enrollment = createEnrollmentData(1, 5);

      expect(enrollment.userId).toBe(1);
      expect(enrollment.courseId).toBe(5);
      expect(enrollment.status).toBe("enrolled");
      expect(enrollment.progress).toBe(0);
    });
  });

  describe("Outreach & Engagement Functions", () => {
    it("should calculate engagement rate", () => {
      expect(calculateEngagementRate(100, 1000)).toBe(10);
      expect(calculateEngagementRate(0, 1000)).toBe(0);
      expect(calculateEngagementRate(50, 0)).toBe(0);
    });

    it("should calculate campaign ROI", () => {
      expect(calculateCampaignROI(15000, 5000)).toBe(200);
      expect(calculateCampaignROI(5000, 5000)).toBe(0);
      expect(calculateCampaignROI(3000, 5000)).toBe(-40);
      expect(calculateCampaignROI(1000, 0)).toBe(0);
    });

    it("should create campaign data", () => {
      const campaign = createCampaignData(
        "Summer Newsletter",
        "newsletter",
        "All subscribers",
        new Date("2025-06-01"),
        500
      );

      expect(campaign.name).toBe("Summer Newsletter");
      expect(campaign.type).toBe("newsletter");
      expect(campaign.status).toBe("draft");
      expect(campaign.budget).toBe(500);
      expect(campaign.metrics.reach).toBe(0);
    });

    it("should create event data", () => {
      const event = createEventData(
        "Tech Workshop",
        "workshop",
        "Learn new technologies",
        new Date("2025-07-15"),
        180,
        "Conference Room A",
        false,
        50
      );

      expect(event.name).toBe("Tech Workshop");
      expect(event.type).toBe("workshop");
      expect(event.capacity).toBe(50);
      expect(event.registrations).toBe(0);
      expect(event.status).toBe("upcoming");
    });

    it("should get event availability", () => {
      const event = {
        id: 1,
        name: "Workshop",
        type: "workshop" as const,
        description: "Test",
        date: new Date(),
        duration: 60,
        location: "Room A",
        isVirtual: false,
        capacity: 100,
        registrations: 75,
        status: "upcoming" as const
      };

      const availability = getEventAvailability(event);
      expect(availability.available).toBe(25);
      expect(availability.percentFull).toBe(75);
    });

    it("should create community member data", () => {
      const member = createCommunityMemberData(
        "test@example.com",
        "Test User",
        ["technology", "finance"]
      );

      expect(member.email).toBe("test@example.com");
      expect(member.name).toBe("Test User");
      expect(member.interests).toEqual(["technology", "finance"]);
      expect(member.status).toBe("active");
      expect(member.engagementScore).toBe(0);
    });
  });

  describe("Programs Layer Summary", () => {
    it("should return correct summary", () => {
      const summary = getProgramsLayerSummary();

      expect(summary.modules).toContain("Training & Curriculum (LMS)");
      expect(summary.modules).toContain("Outreach & Engagement");
      expect(summary.courseCategories).toContain("technical");
      expect(summary.campaignTypes).toContain("email");
      expect(summary.eventTypes).toContain("workshop");
    });
  });
});

describe("Governance Layer Service", () => {
  describe("Board Oversight Functions", () => {
    it("should check quorum correctly", () => {
      expect(checkQuorum(5, 10)).toBe(true);  // 50%
      expect(checkQuorum(4, 10)).toBe(false); // 40%
      expect(checkQuorum(7, 10, 60)).toBe(true);  // 70% with 60% threshold
      expect(checkQuorum(5, 10, 60)).toBe(false); // 50% with 60% threshold
    });

    it("should calculate voting result", () => {
      const passed = calculateVotingResult(7, 3, 2);
      expect(passed.passed).toBe(true);
      expect(passed.yesVotes).toBe(7);
      expect(passed.noVotes).toBe(3);

      const failed = calculateVotingResult(4, 6, 0);
      expect(failed.passed).toBe(false);
    });

    it("should handle tie votes", () => {
      const tie = calculateVotingResult(5, 5, 0);
      expect(tie.passed).toBe(false); // Ties don't pass
    });

    it("should create board member data", () => {
      const member = createBoardMemberData(
        "Jane Smith",
        "CEO",
        "chair",
        new Date("2025-01-01"),
        new Date("2027-12-31")
      );

      expect(member.name).toBe("Jane Smith");
      expect(member.role).toBe("chair");
      expect(member.status).toBe("active");
      expect(member.votingRights).toBe(true);
    });

    it("should create board meeting data", () => {
      const meeting = createBoardMeetingData(
        "Q1 Board Meeting",
        "regular",
        new Date("2025-03-15"),
        "Headquarters",
        false
      );

      expect(meeting.title).toBe("Q1 Board Meeting");
      expect(meeting.type).toBe("regular");
      expect(meeting.status).toBe("scheduled");
      expect(meeting.quorumMet).toBe(false);
    });

    it("should create resolution data", () => {
      const resolution = createResolutionData(
        "RES-2025-001",
        "Budget Approval",
        "Approve annual budget",
        "financial",
        1
      );

      expect(resolution.number).toBe("RES-2025-001");
      expect(resolution.category).toBe("financial");
      expect(resolution.status).toBe("proposed");
    });
  });

  describe("Policy Management Functions", () => {
    it("should detect policies due for review", () => {
      const dueSoon = {
        id: 1,
        number: "HR-0001",
        title: "Test",
        category: "hr" as const,
        description: "Test",
        content: "Test",
        version: "1.0",
        effectiveDate: new Date("2024-01-01"),
        reviewDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
        status: "approved" as const
      };

      const notDue = {
        ...dueSoon,
        reviewDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days
      };

      expect(isPolicyDueForReview(dueSoon)).toBe(true);
      expect(isPolicyDueForReview(notDue)).toBe(false);
    });

    it("should generate policy numbers correctly", () => {
      expect(generatePolicyNumber("hr", 1)).toBe("HR-0001");
      expect(generatePolicyNumber("finance", 42)).toBe("FIN-0042");
      expect(generatePolicyNumber("it", 100)).toBe("IT-0100");
    });

    it("should create policy data", () => {
      const policy = createPolicyData(
        "HR-0001",
        "Remote Work Policy",
        "hr",
        "Guidelines for remote work",
        "Full policy content here..."
      );

      expect(policy.number).toBe("HR-0001");
      expect(policy.category).toBe("hr");
      expect(policy.version).toBe("1.0");
      expect(policy.status).toBe("draft");
    });
  });

  describe("Strategic Planning Functions", () => {
    it("should calculate goal progress", () => {
      const metrics = [
        { name: "Revenue", target: 1000000, current: 750000, unit: "USD" },
        { name: "Customers", target: 100, current: 100, unit: "count" }
      ];

      const progress = calculateGoalProgress(metrics);
      expect(progress).toBe(88); // (75 + 100) / 2 = 87.5 rounded
    });

    it("should handle empty metrics", () => {
      expect(calculateGoalProgress([])).toBe(0);
    });

    it("should get goal status correctly", () => {
      const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      const pastDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      expect(getGoalStatus(100, futureDate)).toBe("achieved");
      expect(getGoalStatus(50, pastDate)).toBe("missed");
    });

    it("should create strategic goal data", () => {
      const goal = createStrategicGoalData(
        "Expand Market Share",
        "Increase market share by 20%",
        "growth",
        "medium_term",
        new Date("2026-12-31"),
        1,
        "high"
      );

      expect(goal.title).toBe("Expand Market Share");
      expect(goal.category).toBe("growth");
      expect(goal.timeframe).toBe("medium_term");
      expect(goal.priority).toBe("high");
      expect(goal.status).toBe("not_started");
    });

    it("should create initiative data", () => {
      const initiative = createInitiativeData(
        1,
        "Launch New Product Line",
        "Develop and launch 3 new products",
        new Date("2025-01-01"),
        new Date("2025-06-30"),
        1,
        50000
      );

      expect(initiative.goalId).toBe(1);
      expect(initiative.title).toBe("Launch New Product Line");
      expect(initiative.budget).toBe(50000);
      expect(initiative.status).toBe("planned");
      expect(initiative.progress).toBe(0);
    });
  });

  describe("Governance Layer Summary", () => {
    it("should return correct summary", () => {
      const summary = getGovernanceLayerSummary();

      expect(summary.modules).toContain("Board Oversight");
      expect(summary.modules).toContain("Policy Management");
      expect(summary.modules).toContain("Strategic Planning");
      expect(summary.boardRoles).toContain("chair");
      expect(summary.policyCategories).toContain("hr");
      expect(summary.goalCategories).toContain("growth");
    });
  });
});
