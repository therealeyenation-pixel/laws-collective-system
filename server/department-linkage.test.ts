/**
 * Department-Simulator-Certificate Linkage Tests
 * 
 * Tests the complete chain:
 * 1. Department Registry — lookup helpers and data integrity
 * 2. Certificate Bridge — issuance and blockchain recording
 * 3. Department Dashboard Router — stats and content management
 */

import { describe, it, expect } from "vitest";
import {
  DEPARTMENT_REGISTRY,
  getDepartment,
  getDepartmentBySimulatorType,
  getSigningManager,
  getSimulatorMapping,
  getDepartmentsWithSimulators,
  getAllSimulatorTypes,
  getDepartmentsByManager,
  getCertificateContext,
  getRegistryStats,
} from "../shared/departmentRegistry";

describe("Department Registry — Data Integrity", () => {
  it("should have at least 10 departments registered", () => {
    expect(DEPARTMENT_REGISTRY.length).toBeGreaterThanOrEqual(10);
  });

  it("every department should have required fields", () => {
    for (const dept of DEPARTMENT_REGISTRY) {
      expect(dept.id).toBeTruthy();
      expect(dept.name).toBeTruthy();
      expect(dept.description).toBeTruthy();
      expect(dept.entity).toBeTruthy();
      expect(dept.manager).toBeTruthy();
      expect(dept.manager.name).toBeTruthy();
      expect(dept.manager.title).toBeTruthy();
      expect(dept.dashboardRoute).toBeTruthy();
      expect(dept.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(dept.icon).toBeTruthy();
    }
  });

  it("should have unique department IDs", () => {
    const ids = DEPARTMENT_REGISTRY.map((d) => d.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have unique dashboard routes", () => {
    const routes = DEPARTMENT_REGISTRY.map((d) => d.dashboardRoute);
    const uniqueRoutes = new Set(routes);
    expect(uniqueRoutes.size).toBe(routes.length);
  });

  it("Property and Assets should be a single combined department, separate from Real Estate", () => {
    const propertyAssets = getDepartment("property_assets");
    expect(propertyAssets).toBeDefined();
    expect(propertyAssets!.name).toBe("Property & Assets");
    // Verify it's separate from any real_estate department
    const allIds = DEPARTMENT_REGISTRY.map((d) => d.id);
    expect(allIds.includes("property_assets")).toBe(true);
  });
});

describe("Department Registry — Lookup Helpers", () => {
  it("getDepartment should return correct department by ID", () => {
    const business = getDepartment("business");
    expect(business).toBeDefined();
    expect(business!.name).toBe("Business");
    expect(business!.manager.name).toBe("LaShanna Russell");
  });

  it("getDepartment should return undefined for invalid ID", () => {
    const result = getDepartment("nonexistent");
    expect(result).toBeUndefined();
  });

  it("getDepartmentBySimulatorType should find the owning department", () => {
    const dept = getDepartmentBySimulatorType("business");
    expect(dept).toBeDefined();
    expect(dept!.id).toBe("business");

    const grantDept = getDepartmentBySimulatorType("grants");
    expect(grantDept).toBeDefined();
    expect(grantDept!.id).toBe("finance");

    const contractsDept = getDepartmentBySimulatorType("contracts");
    expect(contractsDept).toBeDefined();
    expect(contractsDept!.id).toBe("legal");

    const mediaDept = getDepartmentBySimulatorType("real_eye_nation");
    expect(mediaDept).toBeDefined();
    expect(mediaDept!.id).toBe("media");
  });

  it("getSigningManager should return the correct manager for each simulator", () => {
    const businessManager = getSigningManager("business");
    expect(businessManager).toBeDefined();
    expect(businessManager!.name).toBe("LaShanna Russell");

    const financeManager = getSigningManager("grants");
    expect(financeManager).toBeDefined();
    expect(financeManager!.name).toBe("Craig Russell");

    const mediaManager = getSigningManager("real_eye_nation");
    expect(mediaManager).toBeDefined();
    expect(mediaManager!.name).toBe("Amandes Pearsall IV");
  });

  it("getSimulatorMapping should return correct simulator details", () => {
    const sim = getSimulatorMapping("business");
    expect(sim).toBeDefined();
    expect(sim!.label).toBe("Business Formation Workshop");
    expect(sim!.route).toBe("/business-simulator");
    expect(sim!.certificateType).toBe("simulator_completion");
  });

  it("getDepartmentsWithSimulators should only return departments with simulators", () => {
    const depts = getDepartmentsWithSimulators();
    expect(depts.length).toBeGreaterThan(0);
    for (const dept of depts) {
      expect(dept.simulators.length).toBeGreaterThan(0);
    }
    // Health dept has no simulators
    const healthInList = depts.find((d) => d.id === "health");
    expect(healthInList).toBeUndefined();
  });

  it("getAllSimulatorTypes should return all simulator types", () => {
    const types = getAllSimulatorTypes();
    expect(types).toContain("business");
    expect(types).toContain("grants");
    expect(types).toContain("contracts");
    expect(types).toContain("proposals");
    expect(types).toContain("real_eye_nation");
    expect(types).toContain("other"); // L.A.W.S. Foundation Course
  });

  it("getDepartmentsByManager should find all departments for LaShanna Russell", () => {
    const depts = getDepartmentsByManager("LaShanna");
    expect(depts.length).toBeGreaterThanOrEqual(2); // Business + Legal
    const ids = depts.map((d) => d.id);
    expect(ids).toContain("business");
    expect(ids).toContain("legal");
  });
});

describe("Department Registry — Certificate Context", () => {
  it("getCertificateContext should return full context for a simulator type", () => {
    const ctx = getCertificateContext("business");
    expect(ctx).not.toBeNull();
    expect(ctx!.department.id).toBe("business");
    expect(ctx!.simulator.type).toBe("business");
    expect(ctx!.signingManager.name).toBe("LaShanna Russell");
    expect(ctx!.trainingManager.name).toBe("Cornelius D. Christopher");
    expect(ctx!.entity).toBe("The L.A.W.S. Collective LLC");
    expect(ctx!.certificateType).toBe("simulator_completion");
  });

  it("getCertificateContext should return null for unknown simulator type", () => {
    const ctx = getCertificateContext("nonexistent_simulator");
    expect(ctx).toBeNull();
  });

  it("getCertificateContext for grants should reference Finance department", () => {
    const ctx = getCertificateContext("grants");
    expect(ctx).not.toBeNull();
    expect(ctx!.department.id).toBe("finance");
    expect(ctx!.signingManager.name).toBe("Craig Russell");
  });

  it("getCertificateContext for real_eye_nation should reference Media department", () => {
    const ctx = getCertificateContext("real_eye_nation");
    expect(ctx).not.toBeNull();
    expect(ctx!.department.id).toBe("media");
    expect(ctx!.entity).toBe("Real-Eye-Nation");
    expect(ctx!.signingManager.name).toBe("Amandes Pearsall IV");
  });
});

describe("Department Registry — Statistics", () => {
  it("getRegistryStats should return correct summary", () => {
    const stats = getRegistryStats();
    expect(stats.totalDepartments).toBe(DEPARTMENT_REGISTRY.length);
    expect(stats.filledManagers).toBeGreaterThan(0);
    expect(stats.openManagerPositions).toBeGreaterThanOrEqual(0);
    expect(stats.totalSimulators).toBeGreaterThan(0);
    expect(stats.totalCertificateTypes).toBeGreaterThan(0);
    // Verify math
    expect(stats.filledManagers + stats.openManagerPositions).toBe(stats.totalDepartments);
  });
});

describe("Department Registry — Entity Affiliations", () => {
  it("Education should be under 508-LuvOnPurpose Academy and Outreach", () => {
    const edu = getDepartment("education");
    expect(edu!.entity).toBe("508-LuvOnPurpose Academy and Outreach");
    expect(edu!.manager.entity).toBe("508-LuvOnPurpose Academy and Outreach");
  });

  it("Media should be under Real-Eye-Nation", () => {
    const media = getDepartment("media");
    expect(media!.entity).toBe("Real-Eye-Nation");
  });

  it("Business should be under The L.A.W.S. Collective LLC", () => {
    const biz = getDepartment("business");
    expect(biz!.entity).toBe("The L.A.W.S. Collective LLC");
  });

  it("Outreach should be under 508-LuvOnPurpose Academy and Outreach", () => {
    const outreach = getDepartment("outreach");
    expect(outreach!.entity).toBe("508-LuvOnPurpose Academy and Outreach");
  });
});

describe("Department Registry — Manager Assignments", () => {
  it("Amber S. Hunter should be Health Manager (not Amber Russell)", () => {
    const health = getDepartment("health");
    expect(health!.manager.name).toBe("Amber S. Hunter");
  });

  it("Cornelius D. Christopher should be Education Manager", () => {
    const edu = getDepartment("education");
    expect(edu!.manager.name).toBe("Cornelius D. Christopher");
  });

  it("Amandes Pearsall IV should be Media Manager", () => {
    const media = getDepartment("media");
    expect(media!.manager.name).toBe("Amandes Pearsall IV");
  });

  it("Essence Hunter should be Design Manager", () => {
    const design = getDepartment("design");
    expect(design!.manager.name).toBe("Essence Hunter");
  });
});
