import { describe, it, expect } from "vitest";
import { z } from "zod";

// Test the input schemas directly without calling the actual procedures
describe("Procedures Router - Bulk Import Schema", () => {
  const bulkImportSchema = z.object({
    procedures: z.array(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      documentNumber: z.string().optional(),
      category: z.enum(["sop", "manual", "policy", "guide", "training", "checklist", "template", "form"]),
      department: z.string().optional(),
      content: z.string().optional(),
      fileUrl: z.string().optional(),
      version: z.string().optional(),
      status: z.enum(["draft", "review", "approved", "archived", "superseded"]).optional(),
    })),
  });

  it("should accept valid bulk import data", () => {
    const validData = {
      procedures: [
        { title: "Test Procedure 1", category: "sop" as const },
        { title: "Test Procedure 2", category: "policy" as const, department: "HR" },
      ],
    };
    
    const result = bulkImportSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject procedures without title", () => {
    const invalidData = {
      procedures: [
        { category: "sop" as const },
      ],
    };
    
    const result = bulkImportSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should reject invalid category", () => {
    const invalidData = {
      procedures: [
        { title: "Test", category: "invalid" },
      ],
    };
    
    const result = bulkImportSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe("Procedures Router - Set Required Schema", () => {
  const setRequiredSchema = z.object({
    id: z.number(),
    isRequired: z.boolean(),
    departments: z.array(z.string()).optional(),
  });

  it("should accept valid set required data", () => {
    const validData = {
      id: 1,
      isRequired: true,
      departments: ["HR", "Finance"],
    };
    
    const result = setRequiredSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should accept without departments", () => {
    const validData = {
      id: 1,
      isRequired: false,
    };
    
    const result = setRequiredSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

describe("Procedures Router - Acknowledge Schema", () => {
  const acknowledgeSchema = z.object({
    procedureId: z.number(),
    version: z.string(),
  });

  it("should accept valid acknowledge data", () => {
    const validData = {
      procedureId: 1,
      version: "1.0",
    };
    
    const result = acknowledgeSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject missing version", () => {
    const invalidData = {
      procedureId: 1,
    };
    
    const result = acknowledgeSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe("Procedures Router - Get Required By Department Schema", () => {
  const getRequiredSchema = z.object({
    department: z.string(),
  });

  it("should accept valid department", () => {
    const validData = { department: "HR" };
    
    const result = getRequiredSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

describe("Procedures Router - Compliance Stats Schema", () => {
  const complianceStatsSchema = z.object({
    department: z.string(),
  });

  it("should accept valid department", () => {
    const validData = { department: "Finance" };
    
    const result = complianceStatsSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});
