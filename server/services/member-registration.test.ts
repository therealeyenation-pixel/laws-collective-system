import { describe, it, expect, beforeEach } from "vitest";
import {
  BUSINESS_TYPES,
  INDUSTRY_CATEGORIES,
  MEMBERSHIP_TIERS,
  REGISTRATION_STATUSES,
  validateEIN,
  validatePhone,
  validateZipCode,
  validateEmail,
  validateRegistration,
  generateApplicationId,
  createRegistration,
  reviewRegistration,
  getMembershipTier,
  calculateMembershipFee,
  generateMembershipAgreement,
  generateTermsAndConditions,
  getStatusLabel,
  getStatusColor,
  filterRegistrations,
  calculateRegistrationStats,
  CreateRegistrationInput,
  BusinessRegistration,
  RegistrationStatus,
} from "./member-registration";

describe("Member Registration Service", () => {
  // Sample valid registration input
  const validInput: CreateRegistrationInput = {
    businessName: "Test Business LLC",
    dbaName: "Test DBA",
    businessType: "llc",
    industryCategory: "technology",
    einNumber: "12-3456789",
    stateOfFormation: "GA",
    dateOfFormation: "2020-01-15",
    businessAddress: {
      street1: "123 Main St",
      street2: "Suite 100",
      city: "Atlanta",
      state: "GA",
      zipCode: "30301",
      country: "USA",
    },
    primaryContact: {
      firstName: "John",
      lastName: "Doe",
      title: "CEO",
      email: "john@testbusiness.com",
      phone: "404-555-1234",
      preferredContact: "email",
    },
    numberOfEmployees: 10,
    annualRevenue: "$500,000 - $1,000,000",
    businessDescription: "A technology consulting company",
    productsServices: "IT consulting, software development",
    targetMarket: "Small to medium businesses",
    membershipTier: "standard",
    referralSource: "Website",
  };

  describe("Constants", () => {
    it("should have business types defined", () => {
      expect(BUSINESS_TYPES.length).toBeGreaterThan(0);
      expect(BUSINESS_TYPES.find(t => t.value === "llc")).toBeDefined();
      expect(BUSINESS_TYPES.find(t => t.value === "corporation")).toBeDefined();
    });

    it("should have industry categories defined", () => {
      expect(INDUSTRY_CATEGORIES.length).toBeGreaterThan(0);
      expect(INDUSTRY_CATEGORIES.find(c => c.value === "technology")).toBeDefined();
      expect(INDUSTRY_CATEGORIES.find(c => c.value === "healthcare")).toBeDefined();
    });

    it("should have membership tiers defined", () => {
      expect(MEMBERSHIP_TIERS.length).toBe(4);
      expect(MEMBERSHIP_TIERS.find(t => t.value === "associate")).toBeDefined();
      expect(MEMBERSHIP_TIERS.find(t => t.value === "founding")).toBeDefined();
    });

    it("should have registration statuses defined", () => {
      expect(REGISTRATION_STATUSES).toContain("pending");
      expect(REGISTRATION_STATUSES).toContain("approved");
      expect(REGISTRATION_STATUSES).toContain("rejected");
    });
  });

  describe("Validation Functions", () => {
    describe("validateEIN", () => {
      it("should validate correct EIN format", () => {
        expect(validateEIN("12-3456789")).toBe(true);
        expect(validateEIN("00-0000000")).toBe(true);
      });

      it("should reject invalid EIN formats", () => {
        expect(validateEIN("123456789")).toBe(false);
        expect(validateEIN("12-345678")).toBe(false);
        expect(validateEIN("12-34567890")).toBe(false);
        expect(validateEIN("AB-CDEFGHI")).toBe(false);
      });
    });

    describe("validatePhone", () => {
      it("should validate correct phone formats", () => {
        expect(validatePhone("404-555-1234")).toBe(true);
        expect(validatePhone("(404) 555-1234")).toBe(true);
        expect(validatePhone("4045551234")).toBe(true);
        expect(validatePhone("+1 404 555 1234")).toBe(true);
      });

      it("should reject invalid phone formats", () => {
        expect(validatePhone("123")).toBe(false);
        expect(validatePhone("abc-def-ghij")).toBe(false);
      });
    });

    describe("validateZipCode", () => {
      it("should validate correct ZIP code formats", () => {
        expect(validateZipCode("30301")).toBe(true);
        expect(validateZipCode("30301-1234")).toBe(true);
      });

      it("should reject invalid ZIP code formats", () => {
        expect(validateZipCode("3030")).toBe(false);
        expect(validateZipCode("303011")).toBe(false);
        expect(validateZipCode("ABCDE")).toBe(false);
      });
    });

    describe("validateEmail", () => {
      it("should validate correct email formats", () => {
        expect(validateEmail("test@example.com")).toBe(true);
        expect(validateEmail("user.name@domain.org")).toBe(true);
      });

      it("should reject invalid email formats", () => {
        expect(validateEmail("notanemail")).toBe(false);
        expect(validateEmail("@nodomain.com")).toBe(false);
        expect(validateEmail("no@domain")).toBe(false);
      });
    });
  });

  describe("validateRegistration", () => {
    it("should return no errors for valid input", () => {
      const errors = validateRegistration(validInput);
      expect(errors).toHaveLength(0);
    });

    it("should return errors for missing required fields", () => {
      const invalidInput = {
        ...validInput,
        businessName: "",
        businessType: undefined as any,
      };
      const errors = validateRegistration(invalidInput);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.find(e => e.field === "businessName")).toBeDefined();
    });

    it("should validate EIN format when provided", () => {
      const invalidEIN = { ...validInput, einNumber: "invalid" };
      const errors = validateRegistration(invalidEIN);
      expect(errors.find(e => e.field === "einNumber")).toBeDefined();
    });

    it("should validate address fields", () => {
      const invalidAddress = {
        ...validInput,
        businessAddress: {
          ...validInput.businessAddress,
          city: "",
          zipCode: "invalid",
        },
      };
      const errors = validateRegistration(invalidAddress);
      expect(errors.find(e => e.field === "businessAddress.city")).toBeDefined();
      expect(errors.find(e => e.field === "businessAddress.zipCode")).toBeDefined();
    });

    it("should validate contact information", () => {
      const invalidContact = {
        ...validInput,
        primaryContact: {
          ...validInput.primaryContact,
          email: "invalid",
          phone: "123",
        },
      };
      const errors = validateRegistration(invalidContact);
      expect(errors.find(e => e.field === "primaryContact.email")).toBeDefined();
      expect(errors.find(e => e.field === "primaryContact.phone")).toBeDefined();
    });
  });

  describe("generateApplicationId", () => {
    it("should generate unique IDs", () => {
      const id1 = generateApplicationId();
      const id2 = generateApplicationId();
      expect(id1).not.toBe(id2);
    });

    it("should follow expected format", () => {
      const id = generateApplicationId();
      expect(id).toMatch(/^REG-[A-Z0-9]+-[A-Z0-9]+$/);
    });
  });

  describe("createRegistration", () => {
    it("should create a registration with correct fields", () => {
      const registration = createRegistration(validInput, true, true);
      
      expect(registration.id).toMatch(/^REG-/);
      expect(registration.businessName).toBe(validInput.businessName);
      expect(registration.status).toBe("pending");
      expect(registration.agreedToTerms).toBe(true);
      expect(registration.agreedToMembershipAgreement).toBe(true);
      expect(registration.submittedAt).toBeInstanceOf(Date);
    });

    it("should include signature data when provided", () => {
      const signatureData = {
        signedBy: "John Doe",
        signedAt: new Date(),
        ipAddress: "192.168.1.1",
        signatureHash: "abc123",
      };
      const registration = createRegistration(validInput, true, true, signatureData);
      expect(registration.signatureData).toEqual(signatureData);
    });
  });

  describe("reviewRegistration", () => {
    let registration: BusinessRegistration;

    beforeEach(() => {
      registration = createRegistration(validInput, true, true);
    });

    it("should approve a registration", () => {
      const reviewed = reviewRegistration(registration, {
        status: "approved",
        reviewerId: "admin1",
        reviewerName: "Admin User",
        notes: "All documents verified",
      });

      expect(reviewed.status).toBe("approved");
      expect(reviewed.reviewedBy).toBe("admin1");
      expect(reviewed.approvedAt).toBeInstanceOf(Date);
    });

    it("should reject a registration with reason", () => {
      const reviewed = reviewRegistration(registration, {
        status: "rejected",
        reviewerId: "admin1",
        reviewerName: "Admin User",
        rejectedReason: "Incomplete documentation",
      });

      expect(reviewed.status).toBe("rejected");
      expect(reviewed.rejectedReason).toBe("Incomplete documentation");
    });

    it("should mark as under review", () => {
      const reviewed = reviewRegistration(registration, {
        status: "under_review",
        reviewerId: "admin1",
        reviewerName: "Admin User",
        notes: "Requesting additional information",
      });

      expect(reviewed.status).toBe("under_review");
      expect(reviewed.reviewNotes).toBe("Requesting additional information");
    });
  });

  describe("Membership Tier Functions", () => {
    it("should get membership tier details", () => {
      const tier = getMembershipTier("standard");
      expect(tier).toBeDefined();
      expect(tier?.label).toBe("Standard Member");
      expect(tier?.annualFee).toBe(250);
    });

    it("should calculate membership fee", () => {
      expect(calculateMembershipFee("associate")).toBe(100);
      expect(calculateMembershipFee("standard")).toBe(250);
      expect(calculateMembershipFee("premium")).toBe(500);
      expect(calculateMembershipFee("founding")).toBe(1000);
    });
  });

  describe("Document Generation", () => {
    it("should generate membership agreement", () => {
      const agreement = generateMembershipAgreement("Test Business LLC", "standard");
      expect(agreement).toContain("Test Business LLC");
      expect(agreement).toContain("Standard Member");
      expect(agreement).toContain("$250");
      expect(agreement).toContain("L.A.W.S.");
    });

    it("should generate terms and conditions", () => {
      const terms = generateTermsAndConditions();
      expect(terms).toContain("TERMS AND CONDITIONS");
      expect(terms).toContain("ELIGIBILITY");
      expect(terms).toContain("APPLICATION PROCESS");
      expect(terms).toContain("PRIVACY");
    });
  });

  describe("Status Helpers", () => {
    it("should return correct status labels", () => {
      expect(getStatusLabel("pending")).toBe("Pending Review");
      expect(getStatusLabel("approved")).toBe("Approved");
      expect(getStatusLabel("rejected")).toBe("Rejected");
    });

    it("should return correct status colors", () => {
      expect(getStatusColor("pending")).toBe("yellow");
      expect(getStatusColor("approved")).toBe("green");
      expect(getStatusColor("rejected")).toBe("red");
    });
  });

  describe("filterRegistrations", () => {
    const registrations: BusinessRegistration[] = [
      createRegistration({ ...validInput, businessName: "Tech Corp" }, true, true),
      createRegistration({ ...validInput, businessName: "Health Inc", industryCategory: "healthcare" }, true, true),
      createRegistration({ ...validInput, businessName: "Finance LLC", industryCategory: "finance", membershipTier: "premium" }, true, true),
    ];

    it("should filter by search term", () => {
      const filtered = filterRegistrations(registrations, { searchTerm: "Tech" });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].businessName).toBe("Tech Corp");
    });

    it("should filter by industry category", () => {
      const filtered = filterRegistrations(registrations, { industryCategory: "healthcare" });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].businessName).toBe("Health Inc");
    });

    it("should filter by membership tier", () => {
      const filtered = filterRegistrations(registrations, { membershipTier: "premium" });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].businessName).toBe("Finance LLC");
    });

    it("should combine multiple filters", () => {
      const filtered = filterRegistrations(registrations, {
        industryCategory: "technology",
        membershipTier: "standard",
      });
      expect(filtered).toHaveLength(1);
    });
  });

  describe("calculateRegistrationStats", () => {
    it("should calculate statistics correctly", () => {
      const registrations: BusinessRegistration[] = [
        createRegistration(validInput, true, true),
        createRegistration({ ...validInput, membershipTier: "premium" }, true, true),
      ];

      const stats = calculateRegistrationStats(registrations);
      
      expect(stats.total).toBe(2);
      expect(stats.byStatus.pending).toBe(2);
      expect(stats.byTier.standard).toBe(1);
      expect(stats.byTier.premium).toBe(1);
      expect(stats.pendingCount).toBe(2);
    });

    it("should handle empty array", () => {
      const stats = calculateRegistrationStats([]);
      expect(stats.total).toBe(0);
      expect(stats.pendingCount).toBe(0);
    });
  });
});
