/**
 * Seed script to create sample employees for payroll testing
 * Run with: npx tsx server/scripts/seed-payroll-test.ts
 */

import { getDb } from "../db";
import { employees, businessEntities, timekeepingWorkers, chargeCodes, fundingSources, timeEntries } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

async function seedPayrollTestData() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    process.exit(1);
  }

  console.log("Starting payroll test data seed...");

  // Get or create L.A.W.S. Collective entity
  let entityId = 1;
  const existingEntities = await db.select().from(businessEntities).limit(1);
  if (existingEntities.length > 0) {
    entityId = existingEntities[0].id;
    console.log(`Using existing entity: ${existingEntities[0].name} (ID: ${entityId})`);
  } else {
    const entityResult = await db.insert(businessEntities).values({
      userId: 1,
      name: "L.A.W.S. Collective, LLC",
      entityType: "llc",
      status: "active",
      trustLevel: 1,
      description: "Land, Air, Water, Self - Multi-generational wealth building",
      stateOfFormation: "Georgia",
    });
    entityId = entityResult[0].insertId;
    console.log(`Created entity: L.A.W.S. Collective, LLC (ID: ${entityId})`);
  }

  // Sample employees for payroll testing
  const sampleEmployees = [
    {
      firstName: "Marcus",
      lastName: "Johnson",
      email: "marcus.johnson@lawscollective.com",
      phone: "404-555-0101",
      department: "Finance",
      jobTitle: "Finance Manager",
      positionLevel: "manager" as const,
      employmentType: "full_time" as const,
      workLocation: "remote" as const,
      workerType: "employee" as const,
      hourlyRate: "45.00",
      status: "active" as const,
    },
    {
      firstName: "Keisha",
      lastName: "Williams",
      email: "keisha.williams@lawscollective.com",
      phone: "404-555-0102",
      department: "Operations",
      jobTitle: "Operations Coordinator",
      positionLevel: "coordinator" as const,
      employmentType: "full_time" as const,
      workLocation: "remote" as const,
      workerType: "employee" as const,
      hourlyRate: "32.00",
      status: "active" as const,
    },
    {
      firstName: "Darnell",
      lastName: "Thompson",
      email: "darnell.thompson@lawscollective.com",
      phone: "404-555-0103",
      department: "HR",
      jobTitle: "HR Specialist",
      positionLevel: "specialist" as const,
      employmentType: "full_time" as const,
      workLocation: "hybrid" as const,
      workerType: "employee" as const,
      hourlyRate: "28.00",
      status: "active" as const,
    },
    {
      firstName: "Aaliyah",
      lastName: "Davis",
      email: "aaliyah.davis@lawscollective.com",
      phone: "404-555-0104",
      department: "Education",
      jobTitle: "Training Coordinator",
      positionLevel: "coordinator" as const,
      employmentType: "part_time" as const,
      workLocation: "remote" as const,
      workerType: "employee" as const,
      hourlyRate: "25.00",
      status: "active" as const,
    },
    {
      firstName: "Terrence",
      lastName: "Brown",
      email: "terrence.brown@lawscollective.com",
      phone: "404-555-0105",
      department: "IT",
      jobTitle: "IT Support Specialist",
      positionLevel: "specialist" as const,
      employmentType: "full_time" as const,
      workLocation: "remote" as const,
      workerType: "employee" as const,
      hourlyRate: "35.00",
      status: "active" as const,
    },
  ];

  console.log("\nCreating sample employees...");
  const createdEmployeeIds: number[] = [];

  for (const emp of sampleEmployees) {
    // Check if employee already exists
    const existing = await db.select()
      .from(employees)
      .where(eq(employees.email, emp.email))
      .limit(1);

    if (existing.length > 0) {
      console.log(`  Employee ${emp.firstName} ${emp.lastName} already exists (ID: ${existing[0].id})`);
      createdEmployeeIds.push(existing[0].id);
      continue;
    }

    const result = await db.insert(employees).values({
      ...emp,
      entityId,
      startDate: new Date("2024-01-15"),
    });
    createdEmployeeIds.push(result[0].insertId);
    console.log(`  Created: ${emp.firstName} ${emp.lastName} - ${emp.jobTitle} @ $${emp.hourlyRate}/hr`);
  }

  // Create or get funding source
  console.log("\nCreating funding source...");
  let fundingSourceId = 1;
  const existingFunding = await db.select().from(fundingSources).limit(1);
  if (existingFunding.length > 0) {
    fundingSourceId = existingFunding[0].id;
    console.log(`  Using existing funding source: ${existingFunding[0].name}`);
  } else {
    const fundingResult = await db.insert(fundingSources).values({
      name: "General Operations",
      code: "GEN-OPS",
      type: "internal",
      description: "General operating fund for payroll and expenses",
      totalBudget: "500000.00",
      laborBudget: "350000.00",
      status: "active",
    });
    fundingSourceId = fundingResult[0].insertId;
    console.log(`  Created funding source: General Operations`);
  }

  // Create charge code
  console.log("\nCreating charge code...");
  let chargeCodeId = 1;
  const existingCodes = await db.select().from(chargeCodes).limit(1);
  if (existingCodes.length > 0) {
    chargeCodeId = existingCodes[0].id;
    console.log(`  Using existing charge code: ${existingCodes[0].code}`);
  } else {
    const codeResult = await db.insert(chargeCodes).values({
      code: "ADMIN-001",
      name: "Administrative Operations",
      description: "General administrative and operational work",
      fundingSourceId,
      budgetedHours: "2000.00",
      hourlyRate: "35.00",
      isBillable: false,
      isActive: true,
    });
    chargeCodeId = codeResult[0].insertId;
    console.log(`  Created charge code: ADMIN-001`);
  }

  // Sync employees to timekeeping workers
  console.log("\nSyncing employees to timekeeping workers...");
  for (const empId of createdEmployeeIds) {
    const [emp] = await db.select().from(employees).where(eq(employees.id, empId));
    if (!emp) continue;

    // Check if worker already exists
    const existingWorker = await db.select()
      .from(timekeepingWorkers)
      .where(eq(timekeepingWorkers.employeeId, empId))
      .limit(1);

    if (existingWorker.length > 0) {
      console.log(`  Worker ${emp.firstName} ${emp.lastName} already synced`);
      continue;
    }

    await db.insert(timekeepingWorkers).values({
      employeeId: empId,
      workerType: emp.workerType,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      entityId: emp.entityId,
      department: emp.department,
      hourlyRate: emp.hourlyRate,
      standardHoursPerWeek: "40.00",
      overtimeEligible: true,
      status: "active",
      hireDate: emp.startDate,
    });
    console.log(`  Synced: ${emp.firstName} ${emp.lastName}`);
  }

  // Create sample time entries for the current pay period
  console.log("\nCreating sample time entries...");
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysToLastSunday = dayOfWeek === 0 ? 7 : dayOfWeek;
  const periodEnd = new Date(today);
  periodEnd.setDate(today.getDate() - daysToLastSunday);
  const periodStart = new Date(periodEnd);
  periodStart.setDate(periodEnd.getDate() - 13);

  // Get timekeeping workers
  const workers = await db.select().from(timekeepingWorkers).where(eq(timekeepingWorkers.status, "active"));

  for (const worker of workers) {
    // Check if time entries already exist for this period
    const existingEntries = await db.select()
      .from(timeEntries)
      .where(eq(timeEntries.workerId, worker.id))
      .limit(1);

    if (existingEntries.length > 0) {
      console.log(`  Time entries already exist for ${worker.firstName} ${worker.lastName}`);
      continue;
    }

    // Create 10 days of time entries (2 weeks, Mon-Fri)
    for (let i = 0; i < 10; i++) {
      const entryDate = new Date(periodStart);
      entryDate.setDate(periodStart.getDate() + i + (i >= 5 ? 2 : 0)); // Skip weekends

      // Vary hours slightly
      const baseHours = worker.firstName === "Aaliyah" ? 4 : 8; // Part-time vs full-time
      const hours = baseHours + (Math.random() * 0.5 - 0.25); // +/- 15 minutes

      await db.insert(timeEntries).values({
        workerId: worker.id,
        chargeCodeId,
        entryDate,
        hoursWorked: hours.toFixed(2),
        description: `Daily work - ${entryDate.toLocaleDateString()}`,
        isBillable: false,
        status: "approved",
      });
    }
    console.log(`  Created 10 time entries for ${worker.firstName} ${worker.lastName}`);
  }

  console.log("\n✅ Payroll test data seeded successfully!");
  console.log("\nNext steps:");
  console.log("1. Go to Timekeeping Dashboard and verify workers are synced");
  console.log("2. Go to Payroll Dashboard and click 'Run Payroll'");
  console.log("3. Review calculated payroll and process payments");

  process.exit(0);
}

seedPayrollTestData().catch((err) => {
  console.error("Error seeding data:", err);
  process.exit(1);
});
