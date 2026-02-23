/**
 * LuvLedger Auto-Logging Service Tests
 * Phase 50.1: Tests for automatic business event logging
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as autoLog from "./luvledger-auto-logging";

describe("LuvLedger Auto-Logging Service", () => {
  beforeEach(() => {
    autoLog.clearAllLogEntries();
  });

  describe("Business Creation Logging", () => {
    it("should log business creation event", () => {
      const entry = autoLog.logBusinessCreation(
        "Test Corp LLC",
        "LLC",
        "Delaware",
        "user_123"
      );

      expect(entry.id).toMatch(/^log_/);
      expect(entry.eventType).toBe("business_creation");
      expect(entry.category).toBe("entity");
      expect(entry.description).toContain("Test Corp LLC");
      expect(entry.status).toBe("logged");
      expect(entry.blockchainHash).toBeDefined();
    });

    it("should include additional details", () => {
      const entry = autoLog.logBusinessCreation(
        "Test Corp LLC",
        "LLC",
        "Delaware",
        "user_123",
        { ein: "12-3456789", incorporationDate: "2024-01-15" }
      );

      expect(entry.details.ein).toBe("12-3456789");
      expect(entry.details.incorporationDate).toBe("2024-01-15");
    });
  });

  describe("Property Acquisition Logging", () => {
    it("should log property acquisition event", () => {
      const entry = autoLog.logPropertyAcquisition(
        "123 Main Street, City, ST 12345",
        "Commercial",
        500000,
        "USD",
        "entity_001",
        "Test Corp LLC",
        "user_123"
      );

      expect(entry.eventType).toBe("property_acquisition");
      expect(entry.category).toBe("property");
      expect(entry.financialImpact?.amount).toBe(500000);
      expect(entry.financialImpact?.direction).toBe("outflow");
      expect(entry.blockchainHash).toBeDefined();
    });

    it("should log property disposition event", () => {
      const entry = autoLog.logPropertyDisposition(
        "123 Main Street, City, ST 12345",
        "Commercial",
        600000,
        "USD",
        "entity_001",
        "Test Corp LLC",
        "user_123"
      );

      expect(entry.eventType).toBe("property_disposition");
      expect(entry.financialImpact?.direction).toBe("inflow");
      expect(entry.status).toBe("pending_review"); // Requires approval
    });
  });

  describe("Worker Hire Logging", () => {
    it("should log worker hire event", () => {
      const entry = autoLog.logWorkerHire(
        "John Smith",
        "Software Engineer",
        "Engineering",
        "2024-02-01",
        85000,
        "USD",
        "entity_001",
        "Test Corp LLC",
        "user_123"
      );

      expect(entry.eventType).toBe("worker_hire");
      expect(entry.category).toBe("personnel");
      expect(entry.details.workerName).toBe("John Smith");
      expect(entry.details.position).toBe("Software Engineer");
      expect(entry.financialImpact?.amount).toBe(85000);
      expect(entry.blockchainHash).toBeUndefined(); // Personnel events not anchored
    });

    it("should log worker termination event", () => {
      const entry = autoLog.logWorkerTermination(
        "John Smith",
        "Software Engineer",
        "2024-12-31",
        "voluntary",
        "entity_001",
        "Test Corp LLC",
        "user_123"
      );

      expect(entry.eventType).toBe("worker_termination");
      expect(entry.details.terminationType).toBe("voluntary");
    });
  });

  describe("Contractor Engagement Logging", () => {
    it("should log contractor engagement event", () => {
      const entry = autoLog.logContractorEngagement(
        "ABC Consulting",
        "IT Services",
        50000,
        "USD",
        "2024-01-01",
        "2024-12-31",
        "entity_001",
        "Test Corp LLC",
        "user_123"
      );

      expect(entry.eventType).toBe("contractor_engagement");
      expect(entry.details.contractorName).toBe("ABC Consulting");
      expect(entry.details.serviceType).toBe("IT Services");
      expect(entry.financialImpact?.amount).toBe(50000);
    });
  });

  describe("Entity Formation Logging", () => {
    it("should log entity formation event", () => {
      const entry = autoLog.logEntityFormation(
        "Subsidiary Corp",
        "Corporation",
        "Nevada",
        "parent_001",
        "user_123"
      );

      expect(entry.eventType).toBe("entity_formation");
      expect(entry.category).toBe("entity");
      expect(entry.relatedEntities).toContain("parent_001");
      expect(entry.blockchainHash).toBeDefined();
    });

    it("should handle entity without parent", () => {
      const entry = autoLog.logEntityFormation(
        "Standalone Corp",
        "Corporation",
        "Delaware",
        undefined,
        "user_123"
      );

      expect(entry.relatedEntities).toBeUndefined();
    });
  });

  describe("Asset Acquisition Logging", () => {
    it("should log asset acquisition event", () => {
      const entry = autoLog.logAssetAcquisition(
        "Office Equipment",
        "Equipment",
        25000,
        "USD",
        "entity_001",
        "Test Corp LLC",
        "user_123"
      );

      expect(entry.eventType).toBe("asset_acquisition");
      expect(entry.category).toBe("financial");
      expect(entry.financialImpact?.amount).toBe(25000);
      expect(entry.blockchainHash).toBeDefined();
    });
  });

  describe("Contract Execution Logging", () => {
    it("should log contract execution event", () => {
      const entry = autoLog.logContractExecution(
        "Service Agreement",
        "Services",
        100000,
        "USD",
        "Client Corp",
        "entity_001",
        "Test Corp LLC",
        "user_123"
      );

      expect(entry.eventType).toBe("contract_execution");
      expect(entry.category).toBe("legal");
      expect(entry.details.counterparty).toBe("Client Corp");
      expect(entry.blockchainHash).toBeDefined();
    });
  });

  describe("Grant Award Logging", () => {
    it("should log grant award event", () => {
      const entry = autoLog.logGrantAward(
        "Community Development Grant",
        "State Foundation",
        250000,
        "USD",
        "Community outreach programs",
        "entity_001",
        "Test Nonprofit",
        "user_123"
      );

      expect(entry.eventType).toBe("grant_award");
      expect(entry.category).toBe("financial");
      expect(entry.financialImpact?.direction).toBe("inflow");
      expect(entry.details.grantorName).toBe("State Foundation");
    });
  });

  describe("Loan Origination Logging", () => {
    it("should log loan origination event", () => {
      const entry = autoLog.logLoanOrigination(
        "Business Line of Credit",
        "First National Bank",
        500000,
        "USD",
        6.5,
        60,
        "entity_001",
        "Test Corp LLC",
        "user_123"
      );

      expect(entry.eventType).toBe("loan_origination");
      expect(entry.details.interestRate).toBe(6.5);
      expect(entry.details.termMonths).toBe(60);
      expect(entry.financialImpact?.direction).toBe("inflow");
    });
  });

  describe("Trust Creation Logging", () => {
    it("should log trust creation event", () => {
      const entry = autoLog.logTrustCreation(
        "Family Trust",
        "Revocable Living Trust",
        "John Smith",
        ["Jane Smith", "Trust Company"],
        ["Child 1", "Child 2"],
        "user_123"
      );

      expect(entry.eventType).toBe("trust_creation");
      expect(entry.category).toBe("entity");
      expect(entry.details.settlor).toBe("John Smith");
      expect(entry.details.trustees).toHaveLength(2);
      expect(entry.details.beneficiaries).toHaveLength(2);
      expect(entry.blockchainHash).toBeDefined();
    });
  });

  describe("Succession Event Logging", () => {
    it("should log succession event", () => {
      const entry = autoLog.logSuccessionEvent(
        "CEO Transition",
        "John Smith Sr.",
        "John Smith Jr.",
        "entity_001",
        "Test Corp LLC",
        "user_123"
      );

      expect(entry.eventType).toBe("succession_event");
      expect(entry.category).toBe("governance");
      expect(entry.status).toBe("pending_review"); // Requires approval
      expect(entry.blockchainHash).toBeDefined();
    });
  });

  describe("Governance Change Logging", () => {
    it("should log governance change event", () => {
      const entry = autoLog.logGovernanceChange(
        "Board Composition",
        "Added two independent directors",
        "entity_001",
        "Test Corp LLC",
        "user_123"
      );

      expect(entry.eventType).toBe("governance_change");
      expect(entry.status).toBe("pending_review");
    });
  });

  describe("Compliance Filing Logging", () => {
    it("should log compliance filing event", () => {
      const entry = autoLog.logComplianceFiling(
        "Annual Report",
        "Delaware",
        "2024",
        "entity_001",
        "Test Corp LLC",
        "user_123"
      );

      expect(entry.eventType).toBe("compliance_filing");
      expect(entry.category).toBe("compliance");
      expect(entry.details.jurisdiction).toBe("Delaware");
    });
  });

  describe("Certificate Issuance Logging", () => {
    it("should log certificate issuance event", () => {
      const entry = autoLog.logCertificateIssuance(
        "Course Completion",
        "Jane Doe",
        "LuvOnPurpose Academy",
        "cert_12345",
        "user_123"
      );

      expect(entry.eventType).toBe("certificate_issuance");
      expect(entry.details.certificateId).toBe("cert_12345");
      expect(entry.blockchainHash).toBeDefined();
    });
  });

  describe("Log Entry Retrieval", () => {
    beforeEach(() => {
      // Create some test entries
      autoLog.logBusinessCreation("Corp A", "LLC", "Delaware", "user_1");
      autoLog.logBusinessCreation("Corp B", "Corp", "Nevada", "user_1");
      autoLog.logWorkerHire("John", "Engineer", "Tech", "2024-01-01", 80000, "USD", "entity_1", "Corp A", "user_1");
      autoLog.logPropertyAcquisition("123 Main", "Office", 500000, "USD", "entity_1", "Corp A", "user_1");
    });

    it("should get all log entries", () => {
      const entries = autoLog.getAllLogEntries();
      expect(entries.length).toBe(4);
    });

    it("should get entries by entity", () => {
      const entries = autoLog.getLogEntriesByEntity("entity_1");
      expect(entries.length).toBe(2);
    });

    it("should get entries by category", () => {
      const entityEntries = autoLog.getLogEntriesByCategory("entity");
      expect(entityEntries.length).toBe(2);

      const personnelEntries = autoLog.getLogEntriesByCategory("personnel");
      expect(personnelEntries.length).toBe(1);
    });

    it("should get entries by event type", () => {
      const entries = autoLog.getLogEntriesByEventType("business_creation");
      expect(entries.length).toBe(2);
    });

    it("should get entry by ID", () => {
      const entries = autoLog.getAllLogEntries();
      const entry = autoLog.getLogEntryById(entries[0].id);
      expect(entry).not.toBeNull();
      expect(entry?.id).toBe(entries[0].id);
    });

    it("should return null for unknown ID", () => {
      const entry = autoLog.getLogEntryById("unknown_id");
      expect(entry).toBeNull();
    });
  });

  describe("Log Entry Status Updates", () => {
    it("should update log entry status", () => {
      const entry = autoLog.logSuccessionEvent(
        "CEO Transition",
        "John Sr.",
        "John Jr.",
        "entity_1",
        "Corp A",
        "user_1"
      );

      expect(entry.status).toBe("pending_review");

      const updated = autoLog.updateLogEntryStatus(entry.id, "verified");
      expect(updated?.status).toBe("verified");
    });

    it("should return null for unknown entry", () => {
      const result = autoLog.updateLogEntryStatus("unknown_id", "verified");
      expect(result).toBeNull();
    });
  });

  describe("Date Range Filtering", () => {
    it("should filter entries by date range", () => {
      autoLog.logBusinessCreation("Corp A", "LLC", "Delaware", "user_1");
      
      const now = new Date();
      const startDate = new Date(now.getTime() - 86400000).toISOString(); // 1 day ago
      const endDate = new Date(now.getTime() + 86400000).toISOString(); // 1 day from now
      
      const entries = autoLog.getLogEntriesByDateRange(startDate, endDate);
      expect(entries.length).toBe(1);
    });
  });

  describe("Event Configuration", () => {
    it("should get event configuration", () => {
      const config = autoLog.getEventConfig("business_creation");
      
      expect(config.eventType).toBe("business_creation");
      expect(config.category).toBe("entity");
      expect(config.blockchainAnchor).toBe(true);
      expect(config.notifyOwner).toBe(true);
      expect(config.retentionYears).toBe(100);
    });

    it("should get all event configurations", () => {
      const configs = autoLog.getAllEventConfigs();
      
      expect(Object.keys(configs).length).toBeGreaterThan(20);
      expect(configs.business_creation).toBeDefined();
      expect(configs.worker_hire).toBeDefined();
    });
  });

  describe("Log Statistics", () => {
    beforeEach(() => {
      autoLog.logBusinessCreation("Corp A", "LLC", "Delaware", "user_1");
      autoLog.logPropertyAcquisition("123 Main", "Office", 500000, "USD", "entity_1", "Corp A", "user_1");
      autoLog.logGrantAward("Grant", "Foundation", 100000, "USD", "Purpose", "entity_1", "Corp A", "user_1");
    });

    it("should calculate log statistics", () => {
      const stats = autoLog.getLogStatistics();
      
      expect(stats.totalEntries).toBe(3);
      expect(stats.byCategory.entity).toBe(1);
      expect(stats.byCategory.property).toBe(1);
      expect(stats.byCategory.financial).toBe(1);
    });

    it("should calculate financial summary", () => {
      const stats = autoLog.getLogStatistics();
      
      expect(stats.financialSummary.totalInflows).toBe(100000);
      expect(stats.financialSummary.totalOutflows).toBe(500000);
      expect(stats.financialSummary.netFlow).toBe(-400000);
    });

    it("should count by status", () => {
      const stats = autoLog.getLogStatistics();
      
      expect(stats.byStatus.logged).toBeGreaterThan(0);
    });
  });

  describe("Blockchain Anchoring", () => {
    it("should anchor entity events to blockchain", () => {
      const entry = autoLog.logBusinessCreation("Corp", "LLC", "DE", "user_1");
      expect(entry.blockchainHash).toBeDefined();
      expect(entry.blockchainHash).toMatch(/^0x/);
    });

    it("should not anchor personnel events", () => {
      const entry = autoLog.logWorkerHire("John", "Eng", "Tech", "2024-01-01", 80000, "USD", "e1", "Corp", "u1");
      expect(entry.blockchainHash).toBeUndefined();
    });

    it("should anchor financial events", () => {
      const entry = autoLog.logPropertyAcquisition("123 Main", "Office", 500000, "USD", "e1", "Corp", "u1");
      expect(entry.blockchainHash).toBeDefined();
    });
  });
});
