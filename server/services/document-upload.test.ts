import { describe, it, expect } from "vitest";
import {
  validateUpload,
  generateS3Key,
  createUploadedDocument,
  linkDocumentToEntity,
  unlinkDocumentFromEntity,
  createBusinessLinkConfig,
  validateBusinessLinkConfig,
  addDocumentToBusinessLink,
  removeDocumentFromBusinessLink,
  getRequiredTrustDocuments,
  getRequiredBusinessDocuments,
  calculateUploadProgress,
  verifyDocument,
  rejectDocument,
  getDocumentTypeLabel,
  getAllDocumentTypes,
  SUPPORTED_MIME_TYPES,
  MAX_FILE_SIZE,
  TRUST_DOCUMENT_LABELS,
  BUSINESS_DOCUMENT_LABELS,
} from "./document-upload";

describe("Document Upload Service", () => {
  describe("validateUpload", () => {
    it("should validate a valid PDF file", () => {
      const result = validateUpload("test.pdf", "application/pdf", 1024 * 1024);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate a valid JPEG file", () => {
      const result = validateUpload("photo.jpg", "image/jpeg", 2 * 1024 * 1024);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate a valid DOCX file", () => {
      const result = validateUpload(
        "document.docx",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        500 * 1024
      );
      expect(result.isValid).toBe(true);
    });

    it("should reject files exceeding max size", () => {
      const result = validateUpload("large.pdf", "application/pdf", 60 * 1024 * 1024);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes("exceeds maximum"))).toBe(true);
    });

    it("should reject unsupported file types", () => {
      const result = validateUpload("script.exe", "application/x-msdownload", 1024);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes("not supported"))).toBe(true);
    });

    it("should suggest trust category for trust-related filenames", () => {
      const result = validateUpload("family_trust_agreement.pdf", "application/pdf", 1024);
      expect(result.suggestedCategory).toBe("trust");
      expect(result.suggestedType).toBe("trust_agreement");
    });

    it("should suggest business category for LLC filenames", () => {
      const result = validateUpload("llc_operating_agreement.pdf", "application/pdf", 1024);
      expect(result.suggestedCategory).toBe("business");
      expect(result.suggestedType).toBe("operating_agreement");
    });

    it("should suggest trust_amendment for amendment filenames", () => {
      const result = validateUpload("trust_amendment_2024.pdf", "application/pdf", 1024);
      expect(result.suggestedType).toBe("trust_amendment");
    });

    it("should suggest power_of_attorney for POA filenames", () => {
      const result = validateUpload("poa_document.pdf", "application/pdf", 1024);
      expect(result.suggestedType).toBe("power_of_attorney");
    });

    it("should warn about extension mismatch", () => {
      const result = validateUpload("document.txt", "application/pdf", 1024);
      expect(result.warnings.some(w => w.includes("may not match"))).toBe(true);
    });
  });

  describe("generateS3Key", () => {
    it("should generate a valid S3 key with user ID and category", () => {
      const key = generateS3Key(123, "trust", "my_document.pdf");
      expect(key).toMatch(/^documents\/123\/trust\/\d+-[a-z0-9]+-my_document\.pdf$/);
    });

    it("should sanitize special characters in filename", () => {
      const key = generateS3Key(1, "business", "my file (copy).pdf");
      expect(key).not.toContain(" ");
      expect(key).not.toContain("(");
      expect(key).not.toContain(")");
    });

    it("should include timestamp for uniqueness", () => {
      const key1 = generateS3Key(1, "trust", "doc.pdf");
      const key2 = generateS3Key(1, "trust", "doc.pdf");
      // Keys should be different due to timestamp
      expect(key1).not.toBe(key2);
    });
  });

  describe("createUploadedDocument", () => {
    it("should create a document with all required fields", () => {
      const doc = createUploadedDocument(
        1,
        "test.pdf",
        "application/pdf",
        1024,
        "documents/1/trust/123-abc-test.pdf",
        "https://s3.example.com/documents/1/trust/123-abc-test.pdf",
        "trust",
        "trust_agreement",
        "Family Trust Agreement"
      );

      expect(doc.documentId).toMatch(/^doc-\d+-[a-z0-9]+$/);
      expect(doc.originalName).toBe("test.pdf");
      expect(doc.mimeType).toBe("application/pdf");
      expect(doc.fileSize).toBe(1024);
      expect(doc.category).toBe("trust");
      expect(doc.documentType).toBe("trust_agreement");
      expect(doc.title).toBe("Family Trust Agreement");
      expect(doc.uploadedBy).toBe(1);
      expect(doc.verificationStatus).toBe("pending");
      expect(doc.linkedEntities).toHaveLength(0);
    });

    it("should include optional metadata", () => {
      const doc = createUploadedDocument(
        1,
        "test.pdf",
        "application/pdf",
        1024,
        "key",
        "url",
        "trust",
        "trust_agreement",
        "Title",
        {
          description: "Test description",
          houseId: 5,
          businessEntityId: 10,
          metadata: {
            notarized: true,
            signatories: ["John Doe"],
          },
        }
      );

      expect(doc.description).toBe("Test description");
      expect(doc.houseId).toBe(5);
      expect(doc.businessEntityId).toBe(10);
      expect(doc.metadata.notarized).toBe(true);
      expect(doc.metadata.signatories).toContain("John Doe");
    });
  });

  describe("linkDocumentToEntity", () => {
    it("should add a new entity link", () => {
      const doc = createUploadedDocument(1, "test.pdf", "application/pdf", 1024, "key", "url", "trust", "trust_agreement", "Title");
      const linked = linkDocumentToEntity(doc, "house", 1, "Smith House", "owner");

      expect(linked.linkedEntities).toHaveLength(1);
      expect(linked.linkedEntities[0].entityType).toBe("house");
      expect(linked.linkedEntities[0].entityId).toBe(1);
      expect(linked.linkedEntities[0].entityName).toBe("Smith House");
      expect(linked.linkedEntities[0].linkType).toBe("owner");
    });

    it("should not duplicate existing links", () => {
      const doc = createUploadedDocument(1, "test.pdf", "application/pdf", 1024, "key", "url", "trust", "trust_agreement", "Title");
      const linked1 = linkDocumentToEntity(doc, "house", 1, "Smith House", "owner");
      const linked2 = linkDocumentToEntity(linked1, "house", 1, "Smith House", "owner");

      expect(linked2.linkedEntities).toHaveLength(1);
    });

    it("should allow multiple different entity links", () => {
      const doc = createUploadedDocument(1, "test.pdf", "application/pdf", 1024, "key", "url", "trust", "trust_agreement", "Title");
      const linked1 = linkDocumentToEntity(doc, "house", 1, "Smith House", "owner");
      const linked2 = linkDocumentToEntity(linked1, "business", 2, "Smith LLC", "related");

      expect(linked2.linkedEntities).toHaveLength(2);
    });
  });

  describe("unlinkDocumentFromEntity", () => {
    it("should remove an entity link", () => {
      const doc = createUploadedDocument(1, "test.pdf", "application/pdf", 1024, "key", "url", "trust", "trust_agreement", "Title");
      const linked = linkDocumentToEntity(doc, "house", 1, "Smith House", "owner");
      const unlinked = unlinkDocumentFromEntity(linked, "house", 1);

      expect(unlinked.linkedEntities).toHaveLength(0);
    });

    it("should not affect other links", () => {
      const doc = createUploadedDocument(1, "test.pdf", "application/pdf", 1024, "key", "url", "trust", "trust_agreement", "Title");
      const linked1 = linkDocumentToEntity(doc, "house", 1, "Smith House", "owner");
      const linked2 = linkDocumentToEntity(linked1, "business", 2, "Smith LLC", "related");
      const unlinked = unlinkDocumentFromEntity(linked2, "house", 1);

      expect(unlinked.linkedEntities).toHaveLength(1);
      expect(unlinked.linkedEntities[0].entityType).toBe("business");
    });
  });

  describe("createBusinessLinkConfig", () => {
    it("should create config with default 70/30 split", () => {
      const config = createBusinessLinkConfig(1, "Smith LLC", 2, "Smith House");

      expect(config.businessEntityId).toBe(1);
      expect(config.businessName).toBe("Smith LLC");
      expect(config.houseId).toBe(2);
      expect(config.houseName).toBe("Smith House");
      expect(config.ownershipPercentage).toBe(100);
      expect(config.incomeContributionRate).toBe(100);
      expect(config.splitConfiguration.operatingPercentage).toBe(70);
      expect(config.splitConfiguration.housePercentage).toBe(30);
    });

    it("should accept custom split percentages", () => {
      const config = createBusinessLinkConfig(1, "LLC", 2, "House", {
        operatingPercentage: 60,
        housePercentage: 40,
      });

      expect(config.splitConfiguration.operatingPercentage).toBe(60);
      expect(config.splitConfiguration.housePercentage).toBe(40);
    });

    it("should accept custom ownership percentage", () => {
      const config = createBusinessLinkConfig(1, "LLC", 2, "House", {
        ownershipPercentage: 50,
      });

      expect(config.ownershipPercentage).toBe(50);
    });
  });

  describe("validateBusinessLinkConfig", () => {
    it("should validate a correct config", () => {
      const config = createBusinessLinkConfig(1, "LLC", 2, "House");
      const result = validateBusinessLinkConfig(config);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject split not totaling 100%", () => {
      const config = createBusinessLinkConfig(1, "LLC", 2, "House", {
        operatingPercentage: 60,
        housePercentage: 30,
      });
      const result = validateBusinessLinkConfig(config);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes("total 100%"))).toBe(true);
    });

    it("should reject negative ownership percentage", () => {
      const config = createBusinessLinkConfig(1, "LLC", 2, "House", {
        ownershipPercentage: -10,
      });
      const result = validateBusinessLinkConfig(config);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes("Ownership percentage"))).toBe(true);
    });

    it("should reject ownership percentage over 100", () => {
      const config = createBusinessLinkConfig(1, "LLC", 2, "House", {
        ownershipPercentage: 150,
      });
      const result = validateBusinessLinkConfig(config);

      expect(result.isValid).toBe(false);
    });
  });

  describe("addDocumentToBusinessLink / removeDocumentFromBusinessLink", () => {
    it("should add document to business link", () => {
      const config = createBusinessLinkConfig(1, "LLC", 2, "House");
      const updated = addDocumentToBusinessLink(config, "doc-123");

      expect(updated.linkedDocuments).toContain("doc-123");
    });

    it("should not duplicate documents", () => {
      const config = createBusinessLinkConfig(1, "LLC", 2, "House");
      const updated1 = addDocumentToBusinessLink(config, "doc-123");
      const updated2 = addDocumentToBusinessLink(updated1, "doc-123");

      expect(updated2.linkedDocuments).toHaveLength(1);
    });

    it("should remove document from business link", () => {
      const config = createBusinessLinkConfig(1, "LLC", 2, "House");
      const added = addDocumentToBusinessLink(config, "doc-123");
      const removed = removeDocumentFromBusinessLink(added, "doc-123");

      expect(removed.linkedDocuments).not.toContain("doc-123");
    });
  });

  describe("getRequiredTrustDocuments", () => {
    it("should return required trust documents", () => {
      const docs = getRequiredTrustDocuments();

      expect(docs.length).toBeGreaterThan(0);
      expect(docs.some((d) => d.type === "trust_agreement" && d.required)).toBe(true);
      expect(docs.some((d) => d.type === "certificate_of_trust" && d.required)).toBe(true);
      expect(docs.some((d) => d.type === "schedule_a" && d.required)).toBe(true);
    });

    it("should include optional documents", () => {
      const docs = getRequiredTrustDocuments();

      expect(docs.some((d) => d.type === "pour_over_will" && !d.required)).toBe(true);
      expect(docs.some((d) => d.type === "power_of_attorney" && !d.required)).toBe(true);
    });

    it("should have descriptions for all documents", () => {
      const docs = getRequiredTrustDocuments();

      docs.forEach((doc) => {
        expect(doc.description).toBeTruthy();
        expect(doc.label).toBeTruthy();
      });
    });
  });

  describe("getRequiredBusinessDocuments", () => {
    it("should return LLC-specific documents", () => {
      const docs = getRequiredBusinessDocuments("llc");

      expect(docs.some((d) => d.type === "articles_of_organization")).toBe(true);
      expect(docs.some((d) => d.type === "operating_agreement")).toBe(true);
      expect(docs.some((d) => d.type === "membership_certificate")).toBe(true);
    });

    it("should return corporation-specific documents", () => {
      const docs = getRequiredBusinessDocuments("corporation");

      expect(docs.some((d) => d.type === "articles_of_incorporation")).toBe(true);
      expect(docs.some((d) => d.type === "bylaws")).toBe(true);
      expect(docs.some((d) => d.type === "stock_certificate")).toBe(true);
    });

    it("should include common documents for all entity types", () => {
      const llcDocs = getRequiredBusinessDocuments("llc");
      const corpDocs = getRequiredBusinessDocuments("corporation");

      expect(llcDocs.some((d) => d.type === "ein_letter")).toBe(true);
      expect(corpDocs.some((d) => d.type === "ein_letter")).toBe(true);
    });
  });

  describe("calculateUploadProgress", () => {
    it("should calculate 0% for no uploads", () => {
      const required = [
        { type: "trust_agreement", required: true },
        { type: "certificate_of_trust", required: true },
      ];
      const progress = calculateUploadProgress([], required);

      expect(progress.percentComplete).toBe(0);
      expect(progress.uploadedRequired).toBe(0);
      expect(progress.totalRequired).toBe(2);
      expect(progress.missingRequired).toContain("trust_agreement");
      expect(progress.missingRequired).toContain("certificate_of_trust");
    });

    it("should calculate 50% for half uploads", () => {
      const required = [
        { type: "trust_agreement", required: true },
        { type: "certificate_of_trust", required: true },
      ];
      const uploaded = [
        createUploadedDocument(1, "test.pdf", "application/pdf", 1024, "key", "url", "trust", "trust_agreement", "Title"),
      ];
      const progress = calculateUploadProgress(uploaded, required);

      expect(progress.percentComplete).toBe(50);
      expect(progress.uploadedRequired).toBe(1);
      expect(progress.missingRequired).toContain("certificate_of_trust");
      expect(progress.missingRequired).not.toContain("trust_agreement");
    });

    it("should calculate 100% for all required uploads", () => {
      const required = [
        { type: "trust_agreement", required: true },
        { type: "pour_over_will", required: false },
      ];
      const uploaded = [
        createUploadedDocument(1, "test.pdf", "application/pdf", 1024, "key", "url", "trust", "trust_agreement", "Title"),
      ];
      const progress = calculateUploadProgress(uploaded, required);

      expect(progress.percentComplete).toBe(100);
      expect(progress.missingRequired).toHaveLength(0);
    });

    it("should track optional uploads separately", () => {
      const required = [
        { type: "trust_agreement", required: true },
        { type: "pour_over_will", required: false },
      ];
      const uploaded = [
        createUploadedDocument(1, "test.pdf", "application/pdf", 1024, "key", "url", "trust", "pour_over_will", "Title"),
      ];
      const progress = calculateUploadProgress(uploaded, required);

      expect(progress.uploadedOptional).toBe(1);
      expect(progress.totalOptional).toBe(1);
    });
  });

  describe("verifyDocument / rejectDocument", () => {
    it("should mark document as verified", () => {
      const doc = createUploadedDocument(1, "test.pdf", "application/pdf", 1024, "key", "url", "trust", "trust_agreement", "Title");
      const verified = verifyDocument(doc, 2);

      expect(verified.verificationStatus).toBe("verified");
      expect((verified.metadata as any).verifiedBy).toBe(2);
      expect((verified.metadata as any).verifiedAt).toBeInstanceOf(Date);
    });

    it("should mark document as rejected with reason", () => {
      const doc = createUploadedDocument(1, "test.pdf", "application/pdf", 1024, "key", "url", "trust", "trust_agreement", "Title");
      const rejected = rejectDocument(doc, 2, "Document is illegible");

      expect(rejected.verificationStatus).toBe("rejected");
      expect((rejected.metadata as any).rejectedBy).toBe(2);
      expect((rejected.metadata as any).rejectionReason).toBe("Document is illegible");
    });
  });

  describe("getDocumentTypeLabel", () => {
    it("should return label for trust document types", () => {
      expect(getDocumentTypeLabel("trust_agreement")).toBe("Trust Agreement");
      expect(getDocumentTypeLabel("certificate_of_trust")).toBe("Certificate of Trust");
    });

    it("should return label for business document types", () => {
      expect(getDocumentTypeLabel("articles_of_organization")).toBe("Articles of Organization");
      expect(getDocumentTypeLabel("operating_agreement")).toBe("Operating Agreement");
    });

    it("should format unknown types", () => {
      expect(getDocumentTypeLabel("custom_document_type")).toBe("Custom Document Type");
    });
  });

  describe("getAllDocumentTypes", () => {
    it("should return all document types with categories", () => {
      const types = getAllDocumentTypes();

      expect(types.length).toBeGreaterThan(0);
      expect(types.some((t) => t.category === "trust")).toBe(true);
      expect(types.some((t) => t.category === "business")).toBe(true);
    });

    it("should include all trust document types", () => {
      const types = getAllDocumentTypes();
      const trustTypes = types.filter((t) => t.category === "trust");

      expect(trustTypes.length).toBe(Object.keys(TRUST_DOCUMENT_LABELS).length);
    });

    it("should include all business document types", () => {
      const types = getAllDocumentTypes();
      const businessTypes = types.filter((t) => t.category === "business");

      expect(businessTypes.length).toBe(Object.keys(BUSINESS_DOCUMENT_LABELS).length);
    });
  });

  describe("Constants", () => {
    it("should have supported mime types", () => {
      expect(SUPPORTED_MIME_TYPES).toContain("application/pdf");
      expect(SUPPORTED_MIME_TYPES).toContain("image/png");
      expect(SUPPORTED_MIME_TYPES).toContain("image/jpeg");
    });

    it("should have max file size of 50MB", () => {
      expect(MAX_FILE_SIZE).toBe(50 * 1024 * 1024);
    });

    it("should have trust document labels", () => {
      expect(TRUST_DOCUMENT_LABELS.trust_agreement).toBe("Trust Agreement");
      expect(TRUST_DOCUMENT_LABELS.pour_over_will).toBe("Pour-Over Will");
    });

    it("should have business document labels", () => {
      expect(BUSINESS_DOCUMENT_LABELS.articles_of_organization).toBe("Articles of Organization");
      expect(BUSINESS_DOCUMENT_LABELS.operating_agreement).toBe("Operating Agreement");
    });
  });
});
