/**
 * Real Property System Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  // Types
  PropertyAsset,
  PropertyDonation,
  HousePropertyAssignment,
  PropertyUsageAgreement,
  PropertyImprovement,
  PropertyCouncilDecision,
  PropertyFundAccount,
  
  // Constants
  PROPERTY_TYPES,
  DONATION_TYPES,
  AGREEMENT_TYPES,
  IMPROVEMENT_TYPES,
  
  // Property Asset Functions
  createPropertyAsset,
  updatePropertyAppraisal,
  assignPropertyToHouse,
  unassignPropertyFromHouse,
  
  // Donation Functions
  createPropertyDonation,
  updateDonationStatus,
  completeDueDiligence,
  isDueDiligenceComplete,
  calculateTaxDeduction,
  
  // Assignment Functions
  createHouseAssignment,
  terminateAssignment,
  
  // Agreement Functions
  generateAgreementNumber,
  createUsageAgreement,
  activateAgreement,
  renewAgreement,
  generateGroundLeaseDocument,
  
  // Improvement Functions
  createImprovement,
  approveImprovement,
  rejectImprovement,
  startImprovement,
  completeImprovement,
  calculateTotalImprovementCredits,
  
  // Council Functions
  createCouncilDecision,
  recordVote,
  implementDecision,
  
  // Exit Functions
  calculateExitProvisions,
  
  // Fund Functions
  createPropertyFundAccount,
  updateFundBalance,
  
  // Reporting Functions
  generatePortfolioSummary,
  generateDonationPipelineSummary,
} from "./real-property";

describe("Real Property System", () => {
  // ============================================================================
  // Constants Tests
  // ============================================================================
  
  describe("Constants", () => {
    it("should have all property types defined", () => {
      expect(PROPERTY_TYPES).toHaveLength(6);
      expect(PROPERTY_TYPES.map(t => t.id)).toContain("land");
      expect(PROPERTY_TYPES.map(t => t.id)).toContain("residential");
      expect(PROPERTY_TYPES.map(t => t.id)).toContain("commercial");
    });
    
    it("should have all donation types defined", () => {
      expect(DONATION_TYPES).toHaveLength(5);
      expect(DONATION_TYPES.map(t => t.id)).toContain("outright");
      expect(DONATION_TYPES.map(t => t.id)).toContain("bargain_sale");
    });
    
    it("should have all agreement types defined", () => {
      expect(AGREEMENT_TYPES).toHaveLength(5);
      expect(AGREEMENT_TYPES.map(t => t.id)).toContain("ground_lease");
    });
    
    it("should have improvement types with credit multipliers", () => {
      expect(IMPROVEMENT_TYPES).toHaveLength(7);
      const construction = IMPROVEMENT_TYPES.find(t => t.id === "construction");
      expect(construction?.creditMultiplier).toBe(1.0);
      const maintenance = IMPROVEMENT_TYPES.find(t => t.id === "maintenance");
      expect(maintenance?.creditMultiplier).toBe(0.3);
    });
  });
  
  // ============================================================================
  // Property Asset Tests
  // ============================================================================
  
  describe("Property Asset Functions", () => {
    let property: PropertyAsset;
    
    beforeEach(() => {
      property = createPropertyAsset(
        "Oak Grove Parcel",
        "land",
        {
          street: "123 Oak Street",
          city: "Atlanta",
          state: "GA",
          zipCode: "30301",
          county: "Fulton",
          parcelNumber: "14-0001-0001",
        },
        5.5,
        250000,
        "purchase",
        "Wooded lot suitable for development",
        "R-1 Residential"
      );
    });
    
    it("should create a property asset", () => {
      expect(property.id).toBeDefined();
      expect(property.name).toBe("Oak Grove Parcel");
      expect(property.type).toBe("land");
      expect(property.status).toBe("available");
      expect(property.acreage).toBe(5.5);
      expect(property.acquisitionValue).toBe(250000);
      expect(property.currentAppraisedValue).toBe(250000);
    });
    
    it("should create property with optional fields", () => {
      const propWithOptions = createPropertyAsset(
        "Downtown Building",
        "commercial",
        {
          street: "456 Main St",
          city: "Atlanta",
          state: "GA",
          zipCode: "30302",
          county: "Fulton",
        },
        0.5,
        1500000,
        "donation",
        "Three-story commercial building",
        "C-2 Commercial",
        {
          coordinates: { latitude: 33.749, longitude: -84.388 },
          squareFootage: 15000,
          features: ["Elevator", "Parking Garage"],
          restrictions: ["Historic District"],
          donationId: "don-123",
        }
      );
      
      expect(propWithOptions.coordinates?.latitude).toBe(33.749);
      expect(propWithOptions.squareFootage).toBe(15000);
      expect(propWithOptions.features).toContain("Elevator");
      expect(propWithOptions.donationId).toBe("don-123");
    });
    
    it("should update property appraisal", () => {
      const updated = updatePropertyAppraisal(property, 275000);
      expect(updated.currentAppraisedValue).toBe(275000);
      expect(updated.lastAppraisalDate).toBeDefined();
    });
    
    it("should assign property to house", () => {
      const assigned = assignPropertyToHouse(property, "house-123");
      expect(assigned.status).toBe("assigned");
      expect(assigned.assignedHouseId).toBe("house-123");
      expect(assigned.assignmentDate).toBeDefined();
    });
    
    it("should unassign property from house", () => {
      const assigned = assignPropertyToHouse(property, "house-123");
      const unassigned = unassignPropertyFromHouse(assigned);
      expect(unassigned.status).toBe("available");
      expect(unassigned.assignedHouseId).toBeUndefined();
    });
  });
  
  // ============================================================================
  // Property Donation Tests
  // ============================================================================
  
  describe("Property Donation Functions", () => {
    let donation: PropertyDonation;
    
    beforeEach(() => {
      donation = createPropertyDonation(
        "John Smith",
        "john@example.com",
        "555-123-4567",
        "100 Donor Lane, Atlanta, GA 30301",
        "500 Gift Road, Atlanta, GA 30302",
        "residential",
        500000,
        2.0,
        "Single family home on 2 acres",
        "outright"
      );
    });
    
    it("should create a property donation", () => {
      expect(donation.id).toBeDefined();
      expect(donation.donorName).toBe("John Smith");
      expect(donation.status).toBe("inquiry");
      expect(donation.estimatedValue).toBe(500000);
      expect(donation.donationType).toBe("outright");
    });
    
    it("should update donation status", () => {
      const updated = updateDonationStatus(donation, "evaluation");
      expect(updated.status).toBe("evaluation");
    });
    
    it("should update donation with appraisal", () => {
      const updated = updateDonationStatus(donation, "due_diligence", {
        appraisalValue: 525000,
        appraisalDate: new Date(),
        appraiserName: "ABC Appraisals",
      });
      expect(updated.appraisalValue).toBe(525000);
      expect(updated.appraiserName).toBe("ABC Appraisals");
    });
    
    it("should set acceptance date when accepted", () => {
      const updated = updateDonationStatus(donation, "accepted");
      expect(updated.acceptanceDate).toBeDefined();
    });
    
    it("should complete due diligence items", () => {
      let updated = completeDueDiligence(donation, "titleSearchComplete");
      expect(updated.titleSearchComplete).toBe(true);
      
      updated = completeDueDiligence(updated, "environmentalReviewComplete");
      expect(updated.environmentalReviewComplete).toBe(true);
    });
    
    it("should check if due diligence is complete", () => {
      expect(isDueDiligenceComplete(donation)).toBe(false);
      
      let updated = completeDueDiligence(donation, "titleSearchComplete");
      updated = completeDueDiligence(updated, "environmentalReviewComplete");
      updated = completeDueDiligence(updated, "surveyComplete");
      updated = completeDueDiligence(updated, "legalReviewComplete");
      
      expect(isDueDiligenceComplete(updated)).toBe(true);
    });
    
    it("should calculate tax deduction for outright gift", () => {
      const withAppraisal = updateDonationStatus(donation, "accepted", {
        appraisalValue: 500000,
      });
      const deduction = calculateTaxDeduction(withAppraisal);
      expect(deduction).toBe(500000);
    });
    
    it("should calculate tax deduction for bargain sale", () => {
      const bargainSale = createPropertyDonation(
        "Jane Doe",
        "jane@example.com",
        "555-987-6543",
        "200 Seller St",
        "300 Property Ave",
        "land",
        400000,
        10,
        "Large parcel",
        "bargain_sale"
      );
      const withAppraisal = updateDonationStatus(bargainSale, "accepted", {
        appraisalValue: 400000,
      });
      const deduction = calculateTaxDeduction(withAppraisal);
      expect(deduction).toBe(200000); // 50% for bargain sale
    });
    
    it("should return 0 deduction without appraisal", () => {
      const deduction = calculateTaxDeduction(donation);
      expect(deduction).toBe(0);
    });
  });
  
  // ============================================================================
  // House Assignment Tests
  // ============================================================================
  
  describe("House Assignment Functions", () => {
    let assignment: HousePropertyAssignment;
    
    beforeEach(() => {
      assignment = createHouseAssignment(
        "prop-123",
        "house-456",
        "House of Innovation",
        "primary",
        500,
        1000
      );
    });
    
    it("should create a house assignment", () => {
      expect(assignment.id).toBeDefined();
      expect(assignment.propertyId).toBe("prop-123");
      expect(assignment.houseId).toBe("house-456");
      expect(assignment.houseName).toBe("House of Innovation");
      expect(assignment.monthlyFee).toBe(500);
      expect(assignment.status).toBe("active");
    });
    
    it("should create assignment with options", () => {
      const withOptions = createHouseAssignment(
        "prop-123",
        "house-456",
        "House of Innovation",
        "secondary",
        300,
        600,
        {
          allowedUses: ["office", "workshop"],
          restrictions: ["No retail"],
          exitNoticeRequired: 180,
          exitPenalty: 2000,
        }
      );
      
      expect(withOptions.allowedUses).toContain("office");
      expect(withOptions.restrictions).toContain("No retail");
      expect(withOptions.exitNoticeRequired).toBe(180);
      expect(withOptions.exitPenalty).toBe(2000);
    });
    
    it("should terminate assignment voluntarily", () => {
      const terminated = terminateAssignment(assignment, "voluntary");
      expect(terminated.status).toBe("terminated");
      expect(terminated.endDate).toBeDefined();
    });
    
    it("should mark assignment as expired", () => {
      const expired = terminateAssignment(assignment, "expired");
      expect(expired.status).toBe("expired");
    });
  });
  
  // ============================================================================
  // Usage Agreement Tests
  // ============================================================================
  
  describe("Usage Agreement Functions", () => {
    let agreement: PropertyUsageAgreement;
    
    beforeEach(() => {
      agreement = createUsageAgreement(
        "prop-123",
        "house-456",
        "ground_lease",
        "Ground Lease for House of Innovation",
        new Date("2025-01-01"),
        99,
        500
      );
    });
    
    it("should generate agreement number", () => {
      const number = generateAgreementNumber();
      expect(number).toMatch(/^AGR-\d{4}-[A-Z0-9]{6}$/);
    });
    
    it("should create a usage agreement", () => {
      expect(agreement.id).toBeDefined();
      expect(agreement.agreementType).toBe("ground_lease");
      expect(agreement.monthlyPayment).toBe(500);
      expect(agreement.status).toBe("draft");
      expect(agreement.renewalOptions).toBe(2);
    });
    
    it("should calculate end date based on term", () => {
      const startYear = new Date("2025-01-01").getFullYear();
      const endYear = agreement.endDate.getFullYear();
      expect(endYear - startYear).toBe(99);
    });
    
    it("should create agreement with options", () => {
      const withOptions = createUsageAgreement(
        "prop-123",
        "house-456",
        "usage_agreement",
        "Usage Agreement",
        new Date("2025-01-01"),
        5,
        1000,
        {
          annualEscalation: 5,
          securityDeposit: 3000,
          renewalOptions: 3,
          autoRenewal: true,
          allowedUses: ["residential", "office"],
          prohibitedUses: ["industrial"],
          improvementRights: false,
          sublettingAllowed: true,
        }
      );
      
      expect(withOptions.annualEscalation).toBe(5);
      expect(withOptions.securityDeposit).toBe(3000);
      expect(withOptions.autoRenewal).toBe(true);
      expect(withOptions.improvementRights).toBe(false);
      expect(withOptions.sublettingAllowed).toBe(true);
    });
    
    it("should activate agreement", () => {
      const activated = activateAgreement(agreement);
      expect(activated.status).toBe("active");
    });
    
    it("should renew agreement with escalation", () => {
      const renewed = renewAgreement(agreement, 5);
      expect(renewed.status).toBe("renewed");
      expect(renewed.renewalOptions).toBe(1);
      // 3% annual escalation for 5 years
      expect(renewed.monthlyPayment).toBeGreaterThan(500);
    });
    
    it("should generate ground lease document", () => {
      const property = createPropertyAsset(
        "Test Property",
        "land",
        {
          street: "123 Test St",
          city: "Atlanta",
          state: "GA",
          zipCode: "30301",
          county: "Fulton",
          parcelNumber: "14-0001-0001",
        },
        5,
        100000,
        "purchase",
        "Test property",
        "R-1"
      );
      
      const doc = generateGroundLeaseDocument(agreement, property, "House of Innovation");
      expect(doc).toContain("GROUND LEASE AGREEMENT");
      expect(doc).toContain("House of Innovation");
      expect(doc).toContain("Test Property");
      expect(doc).toContain("$500");
    });
  });
  
  // ============================================================================
  // Improvement Tests
  // ============================================================================
  
  describe("Improvement Functions", () => {
    let improvement: PropertyImprovement;
    
    beforeEach(() => {
      improvement = createImprovement(
        "prop-123",
        "house-456",
        "construction",
        "New Workshop Building",
        "Construction of 2000 sq ft workshop",
        100000,
        "house",
        new Date("2025-06-01"),
        new Date("2025-12-01")
      );
    });
    
    it("should create an improvement", () => {
      expect(improvement.id).toBeDefined();
      expect(improvement.type).toBe("construction");
      expect(improvement.estimatedCost).toBe(100000);
      expect(improvement.status).toBe("proposed");
      // Construction has 1.0 multiplier
      expect(improvement.creditAmount).toBe(100000);
    });
    
    it("should calculate credit based on improvement type", () => {
      const renovation = createImprovement(
        "prop-123",
        "house-456",
        "renovation",
        "Kitchen Renovation",
        "Complete kitchen remodel",
        50000,
        "house",
        new Date("2025-06-01"),
        new Date("2025-08-01")
      );
      // Renovation has 0.8 multiplier
      expect(renovation.creditAmount).toBe(40000);
    });
    
    it("should approve improvement", () => {
      const approved = approveImprovement(improvement, "admin-123");
      expect(approved.status).toBe("approved");
      expect(approved.approvedBy).toBe("admin-123");
      expect(approved.approvalDate).toBeDefined();
    });
    
    it("should reject improvement", () => {
      const rejected = rejectImprovement(improvement, "Budget constraints");
      expect(rejected.status).toBe("rejected");
      expect(rejected.rejectionReason).toBe("Budget constraints");
    });
    
    it("should start improvement", () => {
      const approved = approveImprovement(improvement, "admin-123");
      const started = startImprovement(approved);
      expect(started.status).toBe("in_progress");
      expect(started.actualStartDate).toBeDefined();
    });
    
    it("should complete improvement and recalculate credit", () => {
      const approved = approveImprovement(improvement, "admin-123");
      const started = startImprovement(approved);
      const completed = completeImprovement(started, 95000);
      
      expect(completed.status).toBe("completed");
      expect(completed.actualCost).toBe(95000);
      expect(completed.creditAmount).toBe(95000); // 1.0 multiplier
      expect(completed.creditExpirationDate).toBeDefined();
    });
    
    it("should calculate total improvement credits for house", () => {
      const completed1 = completeImprovement(
        approveImprovement(improvement, "admin"),
        100000
      );
      
      const improvement2 = createImprovement(
        "prop-123",
        "house-456",
        "landscaping",
        "Garden",
        "Landscaping",
        20000,
        "house",
        new Date(),
        new Date()
      );
      const completed2 = completeImprovement(
        approveImprovement(improvement2, "admin"),
        20000
      );
      
      const total = calculateTotalImprovementCredits(
        [completed1, completed2],
        "house-456"
      );
      // 100000 * 1.0 + 20000 * 0.5 = 110000
      expect(total).toBe(110000);
    });
    
    it("should exclude expired credits", () => {
      const completed = completeImprovement(
        approveImprovement(improvement, "admin"),
        100000
      );
      
      // Manually set expiration to past
      const expired = {
        ...completed,
        creditExpirationDate: new Date("2020-01-01"),
      };
      
      const total = calculateTotalImprovementCredits([expired], "house-456");
      expect(total).toBe(0);
    });
  });
  
  // ============================================================================
  // Property Council Tests
  // ============================================================================
  
  describe("Property Council Functions", () => {
    let decision: PropertyCouncilDecision;
    
    beforeEach(() => {
      decision = createCouncilDecision(
        "property_acquisition",
        "Acquire Oak Grove Parcel",
        "Proposal to acquire 5.5 acre parcel for community housing",
        new Date("2025-02-15"),
        {
          propertyId: "prop-123",
          implementationDeadline: new Date("2025-03-15"),
        }
      );
    });
    
    it("should create a council decision", () => {
      expect(decision.id).toBeDefined();
      expect(decision.decisionType).toBe("property_acquisition");
      expect(decision.result).toBe("pending");
      expect(decision.quorumMet).toBe(false);
    });
    
    it("should record votes and determine approval", () => {
      const voted = recordVote(decision, 8, 2, 1, 15);
      expect(voted.votesFor).toBe(8);
      expect(voted.votesAgainst).toBe(2);
      expect(voted.votesAbstain).toBe(1);
      expect(voted.quorumMet).toBe(true); // 11/15 > 50%
      expect(voted.result).toBe("approved"); // 8/10 > 50%
    });
    
    it("should reject when votes against exceed", () => {
      const voted = recordVote(decision, 3, 7, 1, 15);
      expect(voted.result).toBe("rejected");
    });
    
    it("should table when quorum not met", () => {
      const voted = recordVote(decision, 5, 1, 0, 15);
      expect(voted.quorumMet).toBe(false); // 6/15 < 50%
      expect(voted.result).toBe("tabled");
    });
    
    it("should implement decision", () => {
      const voted = recordVote(decision, 10, 2, 0, 15);
      const implemented = implementDecision(voted, "Property acquired successfully");
      expect(implemented.implementedDate).toBeDefined();
      expect(implemented.implementationNotes).toBe("Property acquired successfully");
    });
  });
  
  // ============================================================================
  // Exit Provision Tests
  // ============================================================================
  
  describe("Exit Provision Functions", () => {
    it("should calculate exit provisions", () => {
      const assignment = createHouseAssignment(
        "prop-123",
        "house-456",
        "House of Innovation",
        "primary",
        500,
        1000,
        {
          exitNoticeRequired: 90,
          exitPenalty: 2000,
        }
      );
      
      const improvement = createImprovement(
        "prop-123",
        "house-456",
        "construction",
        "Workshop",
        "Workshop building",
        50000,
        "house",
        new Date(),
        new Date()
      );
      const completedImprovement = completeImprovement(
        approveImprovement(improvement, "admin"),
        50000
      );
      
      const result = calculateExitProvisions(
        assignment,
        [completedImprovement],
        1500, // outstanding fees
        500,  // damage assessment
        true  // early termination
      );
      
      expect(result.improvementCredits).toBe(50000);
      expect(result.securityDepositReturn).toBe(1000);
      expect(result.outstandingFees).toBe(1500);
      expect(result.damageAssessment).toBe(500);
      expect(result.earlyTerminationPenalty).toBe(2000);
      expect(result.netSettlement).toBe(50000 + 1000 - 1500 - 500 - 2000);
    });
    
    it("should not apply penalty for non-early termination", () => {
      const assignment = createHouseAssignment(
        "prop-123",
        "house-456",
        "House of Innovation",
        "primary",
        500,
        1000,
        {
          exitPenalty: 2000,
        }
      );
      
      const result = calculateExitProvisions(
        assignment,
        [],
        0,
        0,
        false // not early termination
      );
      
      expect(result.earlyTerminationPenalty).toBe(0);
    });
  });
  
  // ============================================================================
  // Fund Account Tests
  // ============================================================================
  
  describe("Fund Account Functions", () => {
    it("should create a fund account", () => {
      const account = createPropertyFundAccount(
        "Property Acquisition Fund",
        "acquisition",
        100000,
        true,
        "For land purchases only"
      );
      
      expect(account.id).toBeDefined();
      expect(account.name).toBe("Property Acquisition Fund");
      expect(account.type).toBe("acquisition");
      expect(account.balance).toBe(100000);
      expect(account.restricted).toBe(true);
      expect(account.restrictionDetails).toBe("For land purchases only");
    });
    
    it("should update fund balance", () => {
      const account = createPropertyFundAccount(
        "Operating Fund",
        "operating",
        50000
      );
      
      const updated = updateFundBalance(account, 10000);
      expect(updated.balance).toBe(60000);
      expect(updated.lastTransactionDate).toBeDefined();
    });
    
    it("should handle negative balance updates", () => {
      const account = createPropertyFundAccount(
        "Reserve Fund",
        "reserve",
        100000
      );
      
      const updated = updateFundBalance(account, -25000);
      expect(updated.balance).toBe(75000);
    });
  });
  
  // ============================================================================
  // Reporting Tests
  // ============================================================================
  
  describe("Reporting Functions", () => {
    it("should generate portfolio summary", () => {
      const properties: PropertyAsset[] = [
        createPropertyAsset(
          "Property 1",
          "land",
          { street: "1", city: "Atlanta", state: "GA", zipCode: "30301", county: "Fulton" },
          10,
          500000,
          "purchase",
          "Land",
          "R-1"
        ),
        createPropertyAsset(
          "Property 2",
          "residential",
          { street: "2", city: "Atlanta", state: "GA", zipCode: "30301", county: "Fulton" },
          1,
          300000,
          "donation",
          "House",
          "R-1"
        ),
        createPropertyAsset(
          "Property 3",
          "land",
          { street: "3", city: "Atlanta", state: "GA", zipCode: "30301", county: "Fulton" },
          5,
          200000,
          "purchase",
          "Land",
          "R-1"
        ),
      ];
      
      // Assign one property
      properties[1] = assignPropertyToHouse(properties[1], "house-123");
      
      const summary = generatePortfolioSummary(properties);
      
      expect(summary.totalProperties).toBe(3);
      expect(summary.totalAcreage).toBe(16);
      expect(summary.totalValue).toBe(1000000);
      expect(summary.byType.land.count).toBe(2);
      expect(summary.byType.residential.count).toBe(1);
      expect(summary.assignedToHouses).toBe(1);
      expect(summary.available).toBe(2);
    });
    
    it("should generate donation pipeline summary", () => {
      const donations: PropertyDonation[] = [
        createPropertyDonation("A", "a@test.com", "555-1111", "addr", "prop", "land", 100000, 1, "desc", "outright"),
        createPropertyDonation("B", "b@test.com", "555-2222", "addr", "prop", "land", 200000, 2, "desc", "outright"),
        createPropertyDonation("C", "c@test.com", "555-3333", "addr", "prop", "land", 300000, 3, "desc", "outright"),
      ];
      
      // Update statuses
      donations[1] = updateDonationStatus(donations[1], "evaluation");
      donations[2] = updateDonationStatus(donations[2], "completed", { appraisalValue: 350000 });
      
      const summary = generateDonationPipelineSummary(donations);
      
      expect(summary.totalInquiries).toBe(1);
      expect(summary.inEvaluation).toBe(1);
      expect(summary.completed).toBe(1);
      expect(summary.totalEstimatedValue).toBe(600000);
      expect(summary.totalAppraisedValue).toBe(350000);
    });
  });
});
