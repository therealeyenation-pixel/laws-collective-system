import { describe, it, expect } from "vitest";
import { getDb } from "./db";

describe("Donations System", () => {
  describe("Database Tables", () => {
    it("should have donations table", async () => {
      const db = await getDb();
      const [rows] = await db!.execute("SHOW TABLES LIKE 'donations'") as unknown as [any[], any];
      expect(rows.length).toBe(1);
    });

    it("should have donation_campaigns table", async () => {
      const db = await getDb();
      const [rows] = await db!.execute("SHOW TABLES LIKE 'donation_campaigns'") as unknown as [any[], any];
      expect(rows.length).toBe(1);
    });

    it("should have recurring_donations table", async () => {
      const db = await getDb();
      const [rows] = await db!.execute("SHOW TABLES LIKE 'recurring_donations'") as unknown as [any[], any];
      expect(rows.length).toBe(1);
    });
  });

  describe("Donations Table Structure", () => {
    it("should have required columns for donation tracking", async () => {
      const db = await getDb();
      const [columns] = await db!.execute(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'donations'"
      ) as unknown as [any[], any];
      const columnNames = columns.map((c: any) => c.COLUMN_NAME);
      
      // Check for essential columns
      expect(columnNames).toContain("id");
      expect(columnNames).toContain("amount");
    });
  });
});

describe("Grant Tracking System", () => {
  describe("Database Tables", () => {
    it("should have grant_opportunities table", async () => {
      const db = await getDb();
      const [rows] = await db!.execute("SHOW TABLES LIKE 'grant_opportunities'") as unknown as [any[], any];
      expect(rows.length).toBe(1);
    });

    it("should have grant_applications table", async () => {
      const db = await getDb();
      const [rows] = await db!.execute("SHOW TABLES LIKE 'grant_applications'") as unknown as [any[], any];
      expect(rows.length).toBe(1);
    });

    it("should have grant_documents table", async () => {
      const db = await getDb();
      const [rows] = await db!.execute("SHOW TABLES LIKE 'grant_documents'") as unknown as [any[], any];
      expect(rows.length).toBe(1);
    });

    it("should have grant_reporting table", async () => {
      const db = await getDb();
      const [rows] = await db!.execute("SHOW TABLES LIKE 'grant_reporting'") as unknown as [any[], any];
      expect(rows.length).toBe(1);
    });
  });

  describe("Grant Opportunities Structure", () => {
    it("should have required columns for opportunity tracking", async () => {
      const db = await getDb();
      const [columns] = await db!.execute(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'grant_opportunities'"
      ) as unknown as [any[], any];
      const columnNames = columns.map((c: any) => c.COLUMN_NAME);
      
      expect(columnNames).toContain("id");
      expect(columnNames).toContain("grant_name");
    });
  });

  describe("Grant Applications Structure", () => {
    it("should have required columns for application tracking", async () => {
      const db = await getDb();
      const [columns] = await db!.execute(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'grant_applications'"
      ) as unknown as [any[], any];
      const columnNames = columns.map((c: any) => c.COLUMN_NAME);
      
      expect(columnNames).toContain("id");
      expect(columnNames).toContain("opportunity_id");
      expect(columnNames).toContain("status");
    });
  });

  describe("Grant Reporting Structure", () => {
    it("should have required columns for reporting", async () => {
      const db = await getDb();
      const [columns] = await db!.execute(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'grant_reporting'"
      ) as unknown as [any[], any];
      const columnNames = columns.map((c: any) => c.COLUMN_NAME);
      
      expect(columnNames).toContain("id");
      expect(columnNames).toContain("application_id");
    });
  });
});

describe("Real Estate Positions", () => {
  it("should have Real Estate Manager positions for Georgia and North Carolina", async () => {
    const fs = await import("fs/promises");
    const path = await import("path");
    
    const orgStructurePath = path.join(process.cwd(), "client/public/organizational_structure.json");
    const content = await fs.readFile(orgStructurePath, "utf-8");
    
    // Check for Georgia and North Carolina in the content
    expect(content).toContain("Real Estate Manager GA");
    expect(content).toContain("Real Estate Manager NC");
    expect(content).toContain("Georgia Real Estate Commission");
    expect(content).toContain("North Carolina Real Estate Commission");
  });
});
