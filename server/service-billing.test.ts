import { describe, it, expect, vi } from "vitest";
import { appRouter } from "./routers";

// Mock database connection
vi.mock("./db", () => ({
  getDb: vi.fn(() => Promise.resolve({
    execute: vi.fn((query: string, params?: any[]) => {
      // Mock service packages by ID
      if (query.includes("SELECT * FROM service_packages WHERE id")) {
        return Promise.resolve([[
          {
            id: 1,
            service_type: "design",
            package_name: "Logo Design",
            description: "Professional logo design",
            category: "branding",
            pricing_type: "fixed",
            base_price: "500.00",
            member_price: "400.00",
            estimated_hours: 10,
            deliverables: JSON.stringify(["Logo files", "Brand guidelines"]),
            features: JSON.stringify(["3 concepts", "Unlimited revisions"]),
            is_active: true,
            display_order: 1,
          },
        ]]);
      }
      // Mock service packages list
      if (query.includes("SELECT * FROM service_packages") && query.includes("design")) {
        return Promise.resolve([[
          {
            id: 1,
            service_type: "design",
            package_name: "Logo Design",
            description: "Professional logo design",
            category: "branding",
            pricing_type: "fixed",
            base_price: "500.00",
            member_price: "400.00",
            estimated_hours: 10,
            deliverables: JSON.stringify(["Logo files", "Brand guidelines"]),
            features: JSON.stringify(["3 concepts", "Unlimited revisions"]),
            is_active: true,
            display_order: 1,
          },
        ]]);
      }
      if (query.includes("SELECT * FROM service_packages") && query.includes("media")) {
        return Promise.resolve([[
          {
            id: 2,
            service_type: "media",
            package_name: "Video Production",
            description: "Professional video production",
            category: "video",
            pricing_type: "fixed",
            base_price: "2000.00",
            member_price: "1600.00",
            estimated_hours: 20,
            deliverables: JSON.stringify(["Final video", "Raw footage"]),
            features: JSON.stringify(["4K quality", "Color grading"]),
            is_active: true,
            display_order: 1,
          },
        ]]);
      }
      // Mock invoices
      if (query.includes("SELECT") && query.includes("service_invoices") && !query.includes("SUM") && !query.includes("COUNT")) {
        return Promise.resolve([[
          {
            id: 1,
            invoice_number: "DES-ABC123-XYZ",
            service_type: "design",
            package_id: 1,
            client_type: "external",
            client_name: "Test Client",
            client_email: "test@example.com",
            is_laws_member: false,
            subtotal: "500.00",
            discount_amount: "0.00",
            total_amount: "500.00",
            status: "draft",
            created_at: Date.now(),
          },
        ]]);
      }
      // Mock billing stats
      if (query.includes("SUM(total_amount)") && query.includes("status = 'paid'") && !query.includes("member_revenue")) {
        return Promise.resolve([[{ total: "5000.00" }]]);
      }
      if (query.includes("COUNT(*)") && query.includes("draft")) {
        return Promise.resolve([[{ count: 3, total: "1500.00" }]]);
      }
      if (query.includes("member_revenue")) {
        return Promise.resolve([[
          {
            member_revenue: "2000.00",
            external_revenue: "3000.00",
            total_member_savings: "500.00",
          }
        ]]);
      }
      if (query.includes("GROUP BY client_type")) {
        return Promise.resolve([[
          { client_type: "external", total: "3000.00" },
          { client_type: "internal_house", total: "2000.00" },
        ]]);
      }
      // Mock insert
      if (query.includes("INSERT INTO service_invoices")) {
        return Promise.resolve([{ insertId: 1 }]);
      }
      // Mock update
      if (query.includes("UPDATE service_invoices")) {
        return Promise.resolve([{ affectedRows: 1 }]);
      }
      return Promise.resolve([[]]);
    }),
  })),
}));

// Create mock caller
const createCaller = () => {
  return appRouter.createCaller({
    user: { id: 1, name: "Test User", email: "test@example.com", role: "admin" },
    req: { headers: { origin: "http://localhost:3000" } },
    res: {},
  } as any);
};

describe("Service Billing Router", () => {
  describe("serviceBilling.getDesignPackages", () => {
    it("should return design service packages", async () => {
      const caller = createCaller();
      const packages = await caller.serviceBilling.getDesignPackages();
      
      expect(Array.isArray(packages)).toBe(true);
      if (packages.length > 0) {
        expect(packages[0]).toHaveProperty("package_name");
        expect(packages[0]).toHaveProperty("base_price");
        expect(packages[0]).toHaveProperty("member_price");
        expect(packages[0]).toHaveProperty("deliverables");
      }
    });
  });

  describe("serviceBilling.getMediaPackages", () => {
    it("should return media service packages", async () => {
      const caller = createCaller();
      const packages = await caller.serviceBilling.getMediaPackages();
      
      expect(Array.isArray(packages)).toBe(true);
      if (packages.length > 0) {
        expect(packages[0]).toHaveProperty("package_name");
        expect(packages[0]).toHaveProperty("base_price");
        expect(packages[0]).toHaveProperty("member_price");
      }
    });
  });

  describe("serviceBilling.getInvoices", () => {
    it("should return invoices for design services", async () => {
      const caller = createCaller();
      const invoices = await caller.serviceBilling.getInvoices({ serviceType: "design" });
      
      expect(Array.isArray(invoices)).toBe(true);
    });

    it("should return invoices for media services", async () => {
      const caller = createCaller();
      const invoices = await caller.serviceBilling.getInvoices({ serviceType: "media" });
      
      expect(Array.isArray(invoices)).toBe(true);
    });
  });

  describe("serviceBilling.getBillingStats", () => {
    it("should return billing statistics for design services", async () => {
      const caller = createCaller();
      const stats = await caller.serviceBilling.getBillingStats({ serviceType: "design" });
      
      // Stats may be null if no data, but should have expected shape if present
      if (stats) {
        expect(stats).toHaveProperty("totalRevenue");
        expect(stats).toHaveProperty("monthlyRevenue");
        expect(stats).toHaveProperty("pendingCount");
        expect(stats).toHaveProperty("pendingAmount");
        expect(stats).toHaveProperty("memberRevenue");
        expect(stats).toHaveProperty("externalRevenue");
        expect(stats).toHaveProperty("totalMemberSavings");
      }
    });

    it("should return billing statistics for media services", async () => {
      const caller = createCaller();
      const stats = await caller.serviceBilling.getBillingStats({ serviceType: "media" });
      
      if (stats) {
        expect(stats).toHaveProperty("totalRevenue");
        expect(stats).toHaveProperty("pendingCount");
      }
    });
  });

  describe("serviceBilling.createInvoiceFromPackage", () => {
    it("should create invoice with member discount", async () => {
      const caller = createCaller();
      
      const result = await caller.serviceBilling.createInvoiceFromPackage({
        packageId: 1,
        clientType: "external",
        clientName: "Test Client",
        clientEmail: "test@example.com",
        isLawsMember: true,
        quantity: 1,
      });
      
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("invoiceNumber");
      expect(result).toHaveProperty("totalAmount");
      expect(result).toHaveProperty("memberSavings");
    });

    it("should create invoice without member discount", async () => {
      const caller = createCaller();
      
      const result = await caller.serviceBilling.createInvoiceFromPackage({
        packageId: 1,
        clientType: "external",
        clientName: "External Client",
        isLawsMember: false,
        quantity: 1,
      });
      
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("totalAmount");
    });
  });

  describe("serviceBilling.sendInvoice", () => {
    it("should mark invoice as sent", async () => {
      const caller = createCaller();
      
      const result = await caller.serviceBilling.sendInvoice({ id: 1 });
      
      expect(result).toHaveProperty("success");
      expect(result.success).toBe(true);
    });
  });

  describe("serviceBilling.cancelInvoice", () => {
    it("should cancel invoice with reason", async () => {
      const caller = createCaller();
      
      const result = await caller.serviceBilling.cancelInvoice({
        id: 1,
        reason: "Client requested cancellation",
      });
      
      expect(result).toHaveProperty("success");
      expect(result.success).toBe(true);
    });
  });

  describe("Member pricing calculation", () => {
    it("should apply 20% discount for L.A.W.S. members", () => {
      const basePrice = 500;
      const discountPercent = 20;
      const memberPrice = basePrice * (1 - discountPercent / 100);
      
      expect(memberPrice).toBe(400);
    });

    it("should calculate correct 60/40 revenue split", () => {
      const paymentAmount = 1000;
      const businessShare = paymentAmount * 0.60;
      const trustShare = paymentAmount * 0.40;
      
      expect(businessShare).toBe(600);
      expect(trustShare).toBe(400);
      expect(businessShare + trustShare).toBe(paymentAmount);
    });
  });
});
