import { describe, it, expect } from "vitest";
import * as pdfEngine from "./services/pdf-generation-engine";
import * as lifecycle from "./services/lifecycle-tracking";

describe("PDF Generation Engine", () => {
  describe("Template Management", () => {
    it("should get all PDF templates", () => {
      const templates = pdfEngine.getAllPDFTemplates();
      expect(templates.length).toBeGreaterThan(0);
      expect(templates[0]).toHaveProperty("id");
      expect(templates[0]).toHaveProperty("name");
      expect(templates[0]).toHaveProperty("sections");
    });

    it("should get PDF template by ID", () => {
      const template = pdfEngine.getPDFTemplateById("articles_of_incorporation_pdf");
      expect(template).toBeDefined();
      expect(template?.name).toContain("Articles of Incorporation");
    });

    it("should return undefined for non-existent template", () => {
      const template = pdfEngine.getPDFTemplateById("non_existent");
      expect(template).toBeUndefined();
    });

    it("should get templates by category", () => {
      const taxTemplates = pdfEngine.getPDFTemplatesByCategory("tax_form");
      expect(taxTemplates.length).toBeGreaterThan(0);
      expect(taxTemplates[0].category).toBe("tax_form");
    });

    it("should get Articles of Incorporation template for specific state", () => {
      const template = pdfEngine.getArticlesOfIncorporationPDFTemplate("California");
      expect(template.name).toContain("California");
      expect(template.sections.length).toBeGreaterThan(0);
    });

    it("should get W-2 template", () => {
      const template = pdfEngine.getW2PDFTemplate();
      expect(template.id).toBe("w2_pdf");
      expect(template.category).toBe("tax_form");
      expect(template.sections.length).toBeGreaterThan(0);
    });

    it("should get Promissory Note template", () => {
      const template = pdfEngine.getPromissoryNotePDFTemplate();
      expect(template.id).toBe("promissory_note_pdf");
      expect(template.signatureBlocks.length).toBeGreaterThan(0);
    });
  });

  describe("PDF Validation", () => {
    it("should validate required fields", () => {
      const template = pdfEngine.getArticlesOfIncorporationPDFTemplate();
      const result = pdfEngine.validatePDFData(template, {});
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.code === "REQUIRED_FIELD_MISSING")).toBe(true);
    });

    it("should pass validation with all required fields", () => {
      const template = pdfEngine.getArticlesOfIncorporationPDFTemplate();
      const result = pdfEngine.validatePDFData(template, {
        corporation_name: "Test Corp",
        registered_agent_name: "John Doe",
        registered_agent_address: "123 Main St",
        business_purpose: "General business",
        authorized_shares: 1000,
        par_value: 0.01,
        incorporator_name: "Jane Doe",
        incorporator_address: "456 Oak Ave",
      });
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it("should validate number ranges", () => {
      const template = pdfEngine.getPromissoryNotePDFTemplate();
      const result = pdfEngine.validatePDFData(template, {
        principal_amount: 10000,
        note_date: "2024-01-01",
        borrower_name: "Test Borrower",
        borrower_address: "123 Main St",
        lender_name: "Test Lender",
        lender_address: "456 Oak Ave",
        interest_rate: 150, // Invalid - over 100%
        term_months: 12,
        monthly_payment: 1000,
        maturity_date: "2025-01-01",
        first_payment_date: "2024-02-01",
        payment_day: 1,
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === "VALUE_TOO_HIGH")).toBe(true);
    });

    it("should add warnings for unsigned signature blocks", () => {
      const template = pdfEngine.getPromissoryNotePDFTemplate();
      const result = pdfEngine.validatePDFData(template, {
        principal_amount: 10000,
        note_date: "2024-01-01",
        borrower_name: "Test Borrower",
        borrower_address: "123 Main St",
        lender_name: "Test Lender",
        lender_address: "456 Oak Ave",
        interest_rate: 5,
        term_months: 12,
        monthly_payment: 1000,
        maturity_date: "2025-01-01",
        first_payment_date: "2024-02-01",
        payment_day: 1,
      });
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe("PDF Generation", () => {
    it("should generate PDF with valid data", () => {
      const template = pdfEngine.getArticlesOfIncorporationPDFTemplate();
      const pdf = pdfEngine.generatePDF(template, {
        corporation_name: "Test Corp",
        registered_agent_name: "John Doe",
        registered_agent_address: "123 Main St",
        business_purpose: "General business",
        authorized_shares: 1000,
        par_value: 0.01,
        incorporator_name: "Jane Doe",
        incorporator_address: "456 Oak Ave",
      });

      expect(pdf.id).toBeDefined();
      expect(pdf.templateId).toBe("articles_of_incorporation_pdf");
      expect(pdf.content).toBeDefined();
      expect(pdf.metadata.title).toBeDefined();
    });

    it("should generate barcode value", () => {
      const template = pdfEngine.getArticlesOfIncorporationPDFTemplate();
      const barcodeValue = pdfEngine.generateBarcodeValue(template, {
        corporation_name: "Test Corp",
        incorporator_name: "Jane Doe",
      });
      expect(barcodeValue).toMatch(/^DOC-/);
    });

    it("should format field values correctly", () => {
      const currencyField: pdfEngine.PDFField = {
        id: "amount",
        name: "Amount",
        type: "currency",
        x: 0,
        y: 0,
        width: 100,
        height: 20,
        required: true,
      };
      const formatted = pdfEngine.formatFieldValue(currencyField, 1234.56);
      expect(formatted).toContain("$");
      expect(formatted).toContain("1,234.56");
    });

    it("should include signature status in generated PDF", () => {
      const template = pdfEngine.getPromissoryNotePDFTemplate();
      const pdf = pdfEngine.generatePDF(
        template,
        {
          principal_amount: 10000,
          note_date: "2024-01-01",
          borrower_name: "Test Borrower",
          borrower_address: "123 Main St",
          lender_name: "Test Lender",
          lender_address: "456 Oak Ave",
          interest_rate: 5,
          term_months: 12,
          monthly_payment: 1000,
          maturity_date: "2025-01-01",
          first_payment_date: "2024-02-01",
          payment_day: 1,
        },
        {
          signatureData: {
            borrower_signature: {
              signed: true,
              signedAt: "2024-01-01T10:00:00Z",
              signedBy: "Test Borrower",
            },
          },
        }
      );

      expect(pdf.signatureStatus.length).toBeGreaterThan(0);
      const borrowerSig = pdf.signatureStatus.find(s => s.blockId === "borrower_signature");
      expect(borrowerSig?.signed).toBe(true);
    });
  });
});

describe("Lifecycle Tracking", () => {
  describe("Event Logging", () => {
    it("should create lifecycle event", () => {
      const event = lifecycle.createLifecycleEvent({
        entityType: "business",
        entityId: "biz_123",
        entityName: "Test Business",
        eventCategory: "creation",
        eventType: "business_formation",
        description: "Test business formed",
        performedBy: "admin",
      });

      expect(event.id).toBeDefined();
      expect(event.entityType).toBe("business");
      expect(event.blockchainHash).toMatch(/^0x/);
      expect(event.luvLedgerTxId).toBeDefined();
    });

    it("should log business creation", () => {
      const event = lifecycle.logBusinessCreation({
        businessId: "biz_123",
        businessName: "Test Corp",
        entityType: "LLC",
        state: "Delaware",
        performedBy: "admin",
        registrationDetails: { ein: "12-3456789" },
      });

      expect(event.eventType).toBe("business_formation");
      expect(event.metadata.entityType).toBe("LLC");
      expect(event.metadata.state).toBe("Delaware");
    });

    it("should log business dissolution", () => {
      const event = lifecycle.logBusinessDissolution({
        businessId: "biz_123",
        businessName: "Test Corp",
        reason: "Voluntary dissolution",
        effectiveDate: "2024-12-31",
        performedBy: "admin",
        finalDetails: {},
      });

      expect(event.eventType).toBe("business_dissolution");
      expect(event.newState?.status).toBe("dissolved");
    });

    it("should log property acquisition", () => {
      const event = lifecycle.logPropertyAcquisition({
        propertyId: "prop_123",
        propertyAddress: "123 Main St",
        acquisitionType: "purchase",
        purchasePrice: 500000,
        performedBy: "admin",
        acquisitionDetails: {},
      });

      expect(event.eventType).toBe("property_acquisition");
      expect(event.metadata.purchasePrice).toBe(500000);
    });

    it("should log worker hire", () => {
      const event = lifecycle.logWorkerHire({
        workerId: "worker_123",
        workerName: "John Doe",
        position: "Software Engineer",
        department: "Engineering",
        startDate: "2024-01-15",
        employmentType: "full_time",
        performedBy: "hr_admin",
        hireDetails: {},
      });

      expect(event.eventType).toBe("worker_hire");
      expect(event.metadata.position).toBe("Software Engineer");
    });

    it("should log document filing", () => {
      const event = lifecycle.logDocumentFiling({
        documentId: "doc_123",
        documentName: "Annual Report",
        filingAgency: "Secretary of State",
        filingDate: "2024-03-15",
        confirmationNumber: "CONF-12345",
        performedBy: "admin",
        filingDetails: {},
      });

      expect(event.eventType).toBe("document_filing");
      expect(event.newState?.confirmationNumber).toBe("CONF-12345");
    });
  });

  describe("Event Triggers", () => {
    it("should create event trigger", () => {
      const trigger = lifecycle.createEventTrigger({
        name: "Test Trigger",
        description: "Test trigger description",
        triggerType: "event",
        sourceEventType: "business_formation",
        targetAction: "log_to_luvledger",
        conditions: [{ field: "entityType", operator: "equals", value: "LLC" }],
        actions: [{ type: "log_to_luvledger", parameters: {} }],
      });

      expect(trigger.id).toBeDefined();
      expect(trigger.enabled).toBe(true);
      expect(trigger.triggerCount).toBe(0);
    });

    it("should evaluate trigger conditions", () => {
      const trigger = lifecycle.createEventTrigger({
        name: "LLC Formation Trigger",
        description: "Trigger for LLC formations",
        triggerType: "event",
        sourceEventType: "business_formation",
        targetAction: "log_to_luvledger",
        conditions: [{ field: "entityType", operator: "equals", value: "LLC" }],
        actions: [],
      });

      const event = lifecycle.logBusinessCreation({
        businessId: "biz_123",
        businessName: "Test LLC",
        entityType: "LLC",
        state: "Delaware",
        performedBy: "admin",
        registrationDetails: {},
      });

      const matches = lifecycle.evaluateTriggerConditions(trigger, event);
      expect(matches).toBe(true);
    });

    it("should get default event triggers", () => {
      const triggers = lifecycle.getDefaultEventTriggers();
      expect(triggers.length).toBeGreaterThan(0);
      expect(triggers.some(t => t.sourceEventType === "business_formation")).toBe(true);
    });
  });

  describe("Filing Workflows", () => {
    it("should create filing workflow", () => {
      const workflow = lifecycle.createFilingWorkflow({
        name: "Annual Report Filing",
        entityType: "business",
        entityId: "biz_123",
        filingType: "annual_report",
        jurisdiction: "Delaware",
        deadline: "2024-03-01",
        tasks: [
          { name: "Prepare documents", description: "Gather required documents", order: 1 },
          { name: "Submit filing", description: "Submit to Secretary of State", order: 2 },
        ],
      });

      expect(workflow.id).toBeDefined();
      expect(workflow.status).toBe("pending");
      expect(workflow.tasks.length).toBe(2);
    });

    it("should update filing task status", () => {
      const workflow = lifecycle.createFilingWorkflow({
        name: "Test Workflow",
        entityType: "business",
        entityId: "biz_123",
        filingType: "test",
        jurisdiction: "Delaware",
        tasks: [
          { name: "Task 1", description: "First task", order: 1 },
          { name: "Task 2", description: "Second task", order: 2 },
        ],
      });

      const taskId = workflow.tasks[0].id;
      const updated = lifecycle.updateFilingTaskStatus(workflow, taskId, "completed", "admin");

      expect(updated.tasks[0].status).toBe("completed");
      expect(updated.tasks[0].completedBy).toBe("admin");
      // Workflow status stays pending until all tasks are completed
      expect(updated.status).toBe("pending");
    });
  });

  describe("Asset Lifecycle", () => {
    it("should create asset lifecycle", () => {
      const assetLifecycle = lifecycle.createAssetLifecycle({
        entityType: "business",
        entityId: "biz_123",
        entityName: "Test Business",
        createdBy: "admin",
      });

      expect(assetLifecycle.id).toBeDefined();
      expect(assetLifecycle.currentStatus).toBe("active");
      expect(assetLifecycle.statusHistory.length).toBe(1);
    });

    it("should update asset status", () => {
      const assetLifecycle = lifecycle.createAssetLifecycle({
        entityType: "business",
        entityId: "biz_123",
        entityName: "Test Business",
        createdBy: "admin",
      });

      const updated = lifecycle.updateAssetStatus(
        assetLifecycle,
        "suspended",
        "admin",
        "Under review"
      );

      expect(updated.currentStatus).toBe("suspended");
      expect(updated.statusHistory.length).toBe(2);
    });

    it("should add document to lifecycle", () => {
      const assetLifecycle = lifecycle.createAssetLifecycle({
        entityType: "business",
        entityId: "biz_123",
        entityName: "Test Business",
        createdBy: "admin",
      });

      const updated = lifecycle.addDocumentToLifecycle(assetLifecycle, {
        documentId: "doc_123",
        documentType: "articles_of_incorporation",
        documentName: "Articles of Incorporation",
        addedAt: new Date().toISOString(),
        addedBy: "admin",
        status: "filed",
      });

      expect(updated.documents.length).toBe(1);
      expect(updated.documents[0].documentType).toBe("articles_of_incorporation");
    });

    it("should add financial record to lifecycle", () => {
      const assetLifecycle = lifecycle.createAssetLifecycle({
        entityType: "business",
        entityId: "biz_123",
        entityName: "Test Business",
        createdBy: "admin",
      });

      const updated = lifecycle.addFinancialRecord(assetLifecycle, {
        type: "income",
        amount: 10000,
        currency: "USD",
        date: new Date().toISOString(),
        description: "Revenue",
        category: "sales",
      });

      expect(updated.financials.length).toBe(1);
      expect(updated.financials[0].amount).toBe(10000);
    });

    it("should generate lifecycle report", () => {
      let assetLifecycle = lifecycle.createAssetLifecycle({
        entityType: "business",
        entityId: "biz_123",
        entityName: "Test Business",
        createdBy: "admin",
      });

      assetLifecycle = lifecycle.addFinancialRecord(assetLifecycle, {
        type: "income",
        amount: 10000,
        currency: "USD",
        date: new Date().toISOString(),
        description: "Revenue",
        category: "sales",
      });

      assetLifecycle = lifecycle.addFinancialRecord(assetLifecycle, {
        type: "expense",
        amount: 3000,
        currency: "USD",
        date: new Date().toISOString(),
        description: "Operating costs",
        category: "operations",
      });

      const report = lifecycle.generateLifecycleReport(assetLifecycle);

      expect(report.entityName).toBe("Test Business");
      expect(report.financialSummary.totalIncome).toBe(10000);
      expect(report.financialSummary.totalExpenses).toBe(3000);
      expect(report.financialSummary.netPosition).toBe(7000);
    });
  });
});
