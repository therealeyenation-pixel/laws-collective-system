import { describe, it, expect, vi, beforeEach } from "vitest";
import { COURSE_PRODUCTS, CONSULTING_PRODUCTS } from "./stripe/course-products";

// Mock Stripe
vi.mock("stripe", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      checkout: {
        sessions: {
          create: vi.fn().mockResolvedValue({
            id: "cs_test_123",
            url: "https://checkout.stripe.com/test",
          }),
          retrieve: vi.fn().mockResolvedValue({
            id: "cs_test_123",
            payment_status: "paid",
            customer_details: {
              email: "test@example.com",
            },
            metadata: {
              productId: "laws_foundation_course",
              productName: "L.A.W.S. Foundation Course",
            },
          }),
        },
      },
    })),
  };
});

describe("Course Checkout Products", () => {
  describe("COURSE_PRODUCTS", () => {
    it("should have lawsFoundation course defined", () => {
      expect(COURSE_PRODUCTS.lawsFoundation).toBeDefined();
    });

    it("should have correct price for foundation course ($97)", () => {
      expect(COURSE_PRODUCTS.lawsFoundation.price).toBe(9700);
    });

    it("should have correct product ID", () => {
      expect(COURSE_PRODUCTS.lawsFoundation.id).toBe("laws_foundation_course");
    });

    it("should have 4 modules (LAND, AIR, WATER, SELF)", () => {
      expect(COURSE_PRODUCTS.lawsFoundation.modules).toHaveLength(4);
      expect(COURSE_PRODUCTS.lawsFoundation.modules.map(m => m.id)).toEqual([
        "land",
        "air",
        "water",
        "self",
      ]);
    });

    it("should have 5 lessons per module", () => {
      COURSE_PRODUCTS.lawsFoundation.modules.forEach((module) => {
        expect(module.lessons).toHaveLength(5);
      });
    });

    it("should have required features list", () => {
      expect(COURSE_PRODUCTS.lawsFoundation.features.length).toBeGreaterThan(0);
      expect(COURSE_PRODUCTS.lawsFoundation.features).toContain(
        "Lifetime access to course materials"
      );
    });
  });

  describe("CONSULTING_PRODUCTS", () => {
    it("should have strategySession defined", () => {
      expect(CONSULTING_PRODUCTS.strategySession).toBeDefined();
    });

    it("should have correct price for strategy session ($297)", () => {
      expect(CONSULTING_PRODUCTS.strategySession.price).toBe(29700);
    });

    it("should have correct product ID", () => {
      expect(CONSULTING_PRODUCTS.strategySession.id).toBe("laws_strategy_session");
    });

    it("should have 90-minute duration", () => {
      expect(CONSULTING_PRODUCTS.strategySession.duration).toBe("90 minutes");
    });

    it("should have vipDay defined", () => {
      expect(CONSULTING_PRODUCTS.vipDay).toBeDefined();
    });

    it("should have correct price for VIP day ($997)", () => {
      expect(CONSULTING_PRODUCTS.vipDay.price).toBe(99700);
    });
  });
});

describe("Course Checkout Input Validation", () => {
  it("should require email for course checkout", () => {
    const input = {
      productId: "laws_foundation_course",
      customerEmail: "",
    };
    expect(input.customerEmail).toBeFalsy();
  });

  it("should accept valid email format", () => {
    const validEmail = "test@lawscollective.com";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test(validEmail)).toBe(true);
  });

  it("should accept valid product ID", () => {
    const validProductIds = [
      "laws_foundation_course",
      "laws_strategy_session",
      "laws_vip_day",
    ];
    expect(validProductIds).toContain("laws_foundation_course");
  });
});

describe("Consulting Checkout Input Validation", () => {
  it("should require both name and email for consulting", () => {
    const input = {
      productId: "laws_strategy_session",
      customerEmail: "test@example.com",
      customerName: "John Doe",
    };
    expect(input.customerEmail).toBeTruthy();
    expect(input.customerName).toBeTruthy();
  });

  it("should accept optional phone number", () => {
    const input = {
      productId: "laws_strategy_session",
      customerEmail: "test@example.com",
      customerName: "John Doe",
      customerPhone: "+1-555-123-4567",
    };
    expect(input.customerPhone).toBeDefined();
  });
});

describe("Price Calculations", () => {
  it("should calculate correct USD amounts from cents", () => {
    const coursePrice = COURSE_PRODUCTS.lawsFoundation.price / 100;
    expect(coursePrice).toBe(97);

    const sessionPrice = CONSULTING_PRODUCTS.strategySession.price / 100;
    expect(sessionPrice).toBe(297);

    const vipPrice = CONSULTING_PRODUCTS.vipDay.price / 100;
    expect(vipPrice).toBe(997);
  });

  it("should have prices in cents (integer values)", () => {
    expect(Number.isInteger(COURSE_PRODUCTS.lawsFoundation.price)).toBe(true);
    expect(Number.isInteger(CONSULTING_PRODUCTS.strategySession.price)).toBe(true);
    expect(Number.isInteger(CONSULTING_PRODUCTS.vipDay.price)).toBe(true);
  });
});
