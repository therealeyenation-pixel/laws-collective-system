import { describe, it, expect } from "vitest";
import {
  FUND_CATEGORIES,
  TRANSACTION_TYPES,
  generateTransactionId,
  generateTransferRequestId,
  generateDisbursementRequestId,
  getFundCategory,
  createFundTransaction,
  allocateDonation,
  allocateGrant,
  createTransferRequest,
  approveTransferRequest,
  completeTransferRequest,
  rejectTransferRequest,
  createDisbursementRequest,
  approveDisbursementRequest,
  completeDisbursement,
  rejectDisbursementRequest,
  calculateFundBalance,
  calculateAllFundBalances,
  validateTransfer,
  validateDisbursement,
  generateFundReport,
  generateDashboardWidgets,
  FundTransaction,
  DisbursementRequest,
  DonationAllocation,
} from "./acquisition-fund";

describe("Acquisition Fund Service", () => {
  describe("Constants", () => {
    it("should have fund categories defined", () => {
      expect(FUND_CATEGORIES.length).toBeGreaterThan(0);
      expect(FUND_CATEGORIES.find(f => f.id === "land_acquisition")).toBeDefined();
      expect(FUND_CATEGORIES.find(f => f.id === "building_acquisition")).toBeDefined();
      expect(FUND_CATEGORIES.find(f => f.id === "construction")).toBeDefined();
    });

    it("should have transaction types defined", () => {
      expect(TRANSACTION_TYPES).toContain("donation");
      expect(TRANSACTION_TYPES).toContain("grant_allocation");
      expect(TRANSACTION_TYPES).toContain("disbursement");
      expect(TRANSACTION_TYPES).toContain("transfer_in");
      expect(TRANSACTION_TYPES).toContain("transfer_out");
    });

    it("should have target amounts for each fund", () => {
      FUND_CATEGORIES.forEach(fund => {
        expect(fund.targetAmount).toBeGreaterThan(0);
      });
    });
  });

  describe("ID Generation", () => {
    it("should generate unique transaction IDs", () => {
      const id1 = generateTransactionId();
      const id2 = generateTransactionId();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^TXN-/);
    });

    it("should generate unique transfer request IDs", () => {
      const id1 = generateTransferRequestId();
      const id2 = generateTransferRequestId();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^TRF-/);
    });

    it("should generate unique disbursement request IDs", () => {
      const id1 = generateDisbursementRequestId();
      const id2 = generateDisbursementRequestId();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^DSB-/);
    });
  });

  describe("getFundCategory", () => {
    it("should return fund category by ID", () => {
      const fund = getFundCategory("land_acquisition");
      expect(fund).toBeDefined();
      expect(fund?.name).toBe("Land Acquisition Fund");
    });

    it("should return undefined for invalid ID", () => {
      const fund = getFundCategory("invalid" as any);
      expect(fund).toBeUndefined();
    });
  });

  describe("createFundTransaction", () => {
    it("should create a transaction with required fields", () => {
      const txn = createFundTransaction(
        "land_acquisition",
        "donation",
        1000,
        "Test donation",
        "user123"
      );

      expect(txn.id).toMatch(/^TXN-/);
      expect(txn.fundId).toBe("land_acquisition");
      expect(txn.type).toBe("donation");
      expect(txn.amount).toBe(1000);
      expect(txn.description).toBe("Test donation");
      expect(txn.createdBy).toBe("user123");
      expect(txn.createdAt).toBeInstanceOf(Date);
    });

    it("should include optional fields when provided", () => {
      const txn = createFundTransaction(
        "building_acquisition",
        "grant_allocation",
        5000,
        "Grant from Foundation",
        "admin1",
        {
          referenceId: "grant123",
          referenceType: "grant",
          notes: "Annual grant allocation",
        }
      );

      expect(txn.referenceId).toBe("grant123");
      expect(txn.referenceType).toBe("grant");
      expect(txn.notes).toBe("Annual grant allocation");
    });
  });

  describe("allocateDonation", () => {
    it("should allocate to designated fund when specified", () => {
      const allocation = allocateDonation(
        "don123",
        "John Doe",
        "john@example.com",
        1000,
        "land_acquisition"
      );

      expect(allocation.isDesignated).toBe(true);
      expect(allocation.designatedFund).toBe("land_acquisition");
      expect(allocation.allocations).toHaveLength(1);
      expect(allocation.allocations[0].fundId).toBe("land_acquisition");
      expect(allocation.allocations[0].amount).toBe(1000);
      expect(allocation.allocations[0].percentage).toBe(100);
    });

    it("should use default allocation when no designation", () => {
      const allocation = allocateDonation(
        "don456",
        "Jane Smith",
        "jane@example.com",
        1000
      );

      expect(allocation.isDesignated).toBe(false);
      expect(allocation.allocations.length).toBeGreaterThan(1);
      
      const totalAllocated = allocation.allocations.reduce((sum, a) => sum + a.amount, 0);
      expect(totalAllocated).toBe(1000);
    });
  });

  describe("allocateGrant", () => {
    it("should allocate grant with percentages", () => {
      const allocation = allocateGrant(
        "grant123",
        "Community Development Grant",
        "State Foundation",
        50000,
        [
          { fundId: "land_acquisition", amount: 30000 },
          { fundId: "building_acquisition", amount: 20000 },
        ],
        ["land_purchase", "building_purchase"]
      );

      expect(allocation.totalAmount).toBe(50000);
      expect(allocation.allocations).toHaveLength(2);
      expect(allocation.allocations[0].percentage).toBe(60);
      expect(allocation.allocations[1].percentage).toBe(40);
      expect(allocation.restrictions).toContain("land_purchase");
    });
  });

  describe("Transfer Requests", () => {
    it("should create transfer request", () => {
      const request = createTransferRequest(
        "general_operations",
        "land_acquisition",
        5000,
        "Reallocate funds for land purchase",
        "admin1"
      );

      expect(request.id).toMatch(/^TRF-/);
      expect(request.status).toBe("pending");
      expect(request.fromFundId).toBe("general_operations");
      expect(request.toFundId).toBe("land_acquisition");
    });

    it("should approve transfer request", () => {
      const request = createTransferRequest(
        "general_operations",
        "land_acquisition",
        5000,
        "Reallocate funds",
        "admin1"
      );

      const approved = approveTransferRequest(request, "admin2");
      expect(approved.status).toBe("approved");
      expect(approved.approvedBy).toBe("admin2");
      expect(approved.approvedAt).toBeInstanceOf(Date);
    });

    it("should complete transfer request", () => {
      let request = createTransferRequest(
        "general_operations",
        "land_acquisition",
        5000,
        "Reallocate funds",
        "admin1"
      );
      request = approveTransferRequest(request, "admin2");
      const completed = completeTransferRequest(request);

      expect(completed.status).toBe("completed");
      expect(completed.completedAt).toBeInstanceOf(Date);
    });

    it("should reject transfer request", () => {
      const request = createTransferRequest(
        "general_operations",
        "land_acquisition",
        5000,
        "Reallocate funds",
        "admin1"
      );

      const rejected = rejectTransferRequest(request, "Insufficient justification");
      expect(rejected.status).toBe("rejected");
      expect(rejected.rejectedReason).toBe("Insufficient justification");
    });

    it("should throw error when completing unapproved transfer", () => {
      const request = createTransferRequest(
        "general_operations",
        "land_acquisition",
        5000,
        "Reallocate funds",
        "admin1"
      );

      expect(() => completeTransferRequest(request)).toThrow();
    });
  });

  describe("Disbursement Requests", () => {
    it("should create disbursement request", () => {
      const request = createDisbursementRequest(
        "land_acquisition",
        25000,
        "Land purchase deposit",
        "admin1",
        { vendor: "ABC Realty", invoiceNumber: "INV-001" }
      );

      expect(request.id).toMatch(/^DSB-/);
      expect(request.status).toBe("pending");
      expect(request.vendor).toBe("ABC Realty");
    });

    it("should approve disbursement request", () => {
      const request = createDisbursementRequest(
        "land_acquisition",
        25000,
        "Land purchase deposit",
        "admin1"
      );

      const approved = approveDisbursementRequest(request, "admin2");
      expect(approved.status).toBe("approved");
    });

    it("should complete disbursement", () => {
      let request = createDisbursementRequest(
        "land_acquisition",
        25000,
        "Land purchase deposit",
        "admin1"
      );
      request = approveDisbursementRequest(request, "admin2");
      const completed = completeDisbursement(request, "CHK-12345");

      expect(completed.status).toBe("disbursed");
      expect(completed.checkNumber).toBe("CHK-12345");
    });

    it("should reject disbursement request", () => {
      const request = createDisbursementRequest(
        "land_acquisition",
        25000,
        "Land purchase deposit",
        "admin1"
      );

      const rejected = rejectDisbursementRequest(request, "Budget exceeded");
      expect(rejected.status).toBe("rejected");
    });
  });

  describe("calculateFundBalance", () => {
    it("should calculate balance from transactions", () => {
      const transactions: FundTransaction[] = [
        createFundTransaction("land_acquisition", "donation", 10000, "Donation 1", "user1"),
        createFundTransaction("land_acquisition", "donation", 5000, "Donation 2", "user2"),
        createFundTransaction("land_acquisition", "disbursement", -3000, "Disbursement", "admin1"),
      ];

      const balance = calculateFundBalance("land_acquisition", transactions, []);

      expect(balance.fundId).toBe("land_acquisition");
      expect(balance.totalInflows).toBe(15000);
      expect(balance.totalOutflows).toBe(3000);
      expect(balance.currentBalance).toBe(12000);
    });

    it("should include pending disbursements in available balance", () => {
      const transactions: FundTransaction[] = [
        createFundTransaction("land_acquisition", "donation", 20000, "Donation", "user1"),
      ];

      const pendingDisbursements: DisbursementRequest[] = [
        {
          id: "DSB-1",
          fundId: "land_acquisition",
          amount: 5000,
          purpose: "Pending payment",
          requestedBy: "admin1",
          requestedAt: new Date(),
          status: "pending",
        },
      ];

      const balance = calculateFundBalance("land_acquisition", transactions, pendingDisbursements);

      expect(balance.currentBalance).toBe(20000);
      expect(balance.pendingDisbursements).toBe(5000);
      expect(balance.availableBalance).toBe(15000);
    });
  });

  describe("calculateAllFundBalances", () => {
    it("should calculate balances for all funds", () => {
      const transactions: FundTransaction[] = [
        createFundTransaction("land_acquisition", "donation", 10000, "Donation", "user1"),
        createFundTransaction("building_acquisition", "donation", 5000, "Donation", "user2"),
      ];

      const balances = calculateAllFundBalances(transactions, []);

      expect(balances.length).toBe(FUND_CATEGORIES.length);
      expect(balances.find(b => b.fundId === "land_acquisition")?.currentBalance).toBe(10000);
      expect(balances.find(b => b.fundId === "building_acquisition")?.currentBalance).toBe(5000);
    });
  });

  describe("validateTransfer", () => {
    it("should validate valid transfer", () => {
      const result = validateTransfer("general_operations", "land_acquisition", 1000, 5000);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject transfer to same fund", () => {
      const result = validateTransfer("land_acquisition", "land_acquisition", 1000, 5000);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Cannot transfer to the same fund");
    });

    it("should reject transfer exceeding balance", () => {
      const result = validateTransfer("general_operations", "land_acquisition", 10000, 5000);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Insufficient funds for transfer");
    });

    it("should reject negative transfer amount", () => {
      const result = validateTransfer("general_operations", "land_acquisition", -100, 5000);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Transfer amount must be positive");
    });
  });

  describe("validateDisbursement", () => {
    it("should validate valid disbursement", () => {
      const result = validateDisbursement("land_acquisition", 5000, "Land purchase", 10000);
      expect(result.valid).toBe(true);
    });

    it("should reject disbursement exceeding balance", () => {
      const result = validateDisbursement("land_acquisition", 15000, "Land purchase", 10000);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Insufficient available funds");
    });

    it("should reject negative disbursement", () => {
      const result = validateDisbursement("land_acquisition", -100, "Land purchase", 10000);
      expect(result.valid).toBe(false);
    });
  });

  describe("generateFundReport", () => {
    it("should generate comprehensive fund report", () => {
      const now = new Date();
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

      const transactions: FundTransaction[] = [
        createFundTransaction("land_acquisition", "donation", 10000, "Donation", "user1"),
        createFundTransaction("building_acquisition", "grant_allocation", 25000, "Grant", "admin1"),
      ];

      const donationAllocations: DonationAllocation[] = [
        allocateDonation("don1", "John Doe", "john@example.com", 10000, "land_acquisition"),
      ];

      const report = generateFundReport(
        transactions,
        [],
        donationAllocations,
        monthAgo,
        tomorrow // Use tomorrow to include transactions created "now"
      );

      expect(report.reportDate).toBeInstanceOf(Date);
      expect(report.fundBalances.length).toBe(FUND_CATEGORIES.length);
      expect(report.totalAssets).toBeGreaterThan(0);
      expect(report.transactionSummary.totalDonations).toBe(10000);
      expect(report.transactionSummary.totalGrants).toBe(25000);
    });
  });

  describe("generateDashboardWidgets", () => {
    it("should generate dashboard widgets for all funds", () => {
      const transactions: FundTransaction[] = [
        createFundTransaction("land_acquisition", "donation", 400000, "Large donation", "user1"),
      ];

      const widgets = generateDashboardWidgets(transactions, []);

      expect(widgets.length).toBe(FUND_CATEGORIES.length);
      
      const landWidget = widgets.find(w => w.fundId === "land_acquisition");
      expect(landWidget).toBeDefined();
      expect(landWidget?.currentBalance).toBe(400000);
      expect(landWidget?.progress).toBe(80); // 400000/500000 * 100
    });

    it("should determine correct status based on progress", () => {
      const transactions: FundTransaction[] = [
        createFundTransaction("land_acquisition", "donation", 500000, "Full target", "user1"),
        createFundTransaction("building_acquisition", "donation", 100000, "Partial", "user2"),
      ];

      const widgets = generateDashboardWidgets(transactions, []);

      const landWidget = widgets.find(w => w.fundId === "land_acquisition");
      const buildingWidget = widgets.find(w => w.fundId === "building_acquisition");

      expect(landWidget?.status).toBe("ahead");
      expect(buildingWidget?.status).toBe("critical"); // 100000/750000 = 13.3%
    });
  });
});
