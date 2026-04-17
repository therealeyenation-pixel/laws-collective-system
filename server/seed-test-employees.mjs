import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Staggered start dates: some past 2 years, some approaching, some far out
const now = new Date();
const daysAgo = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

const testEmployees = [
  // Founding Members (managers) - past 2-year mark
  { firstName: "Amber", lastName: "Freeman", dept: "Health", title: "Health Department Manager", level: "manager", start: daysAgo(800), entity: 1 },
  { firstName: "Amandes", lastName: "Freeman", dept: "Media", title: "Media Department Manager", level: "manager", start: daysAgo(790), entity: 1 },
  { firstName: "Craig", lastName: "Freeman", dept: "Finance", title: "Finance Department Manager", level: "manager", start: daysAgo(780), entity: 1 },
  { firstName: "Cornelius", lastName: "Christopher", dept: "Education", title: "Education Department Manager", level: "manager", start: daysAgo(770), entity: 1 },
  // Coordinators - approaching 2-year mark (within 6 months)
  { firstName: "Jordan", lastName: "Mitchell", dept: "Health", title: "Operations Coordinator", level: "coordinator", start: daysAgo(620), entity: 1 },
  { firstName: "Taylor", lastName: "Brooks", dept: "Media", title: "Operations Coordinator", level: "coordinator", start: daysAgo(610), entity: 1 },
  { firstName: "Morgan", lastName: "Davis", dept: "Finance", title: "Operations Coordinator", level: "coordinator", start: daysAgo(600), entity: 1 },
  { firstName: "Casey", lastName: "Williams", dept: "Education", title: "Operations Coordinator", level: "coordinator", start: daysAgo(590), entity: 1 },
  // Standard employees - not yet eligible
  { firstName: "Alex", lastName: "Johnson", dept: "Business", title: "Specialist", level: "specialist", start: daysAgo(300), entity: 1 },
  { firstName: "Riley", lastName: "Thompson", dept: "Health", title: "Operations Coordinator", level: "coordinator", start: daysAgo(200), entity: 1 },
  { firstName: "Sam", lastName: "Garcia", dept: "Media", title: "Intern", level: "intern", start: daysAgo(90), entity: 1 },
];

for (const emp of testEmployees) {
  // Check if employee already exists
  const [existing] = await conn.query(
    "SELECT id FROM employees WHERE firstName = ? AND lastName = ? LIMIT 1",
    [emp.firstName, emp.lastName]
  );
  if (existing.length > 0) {
    console.log(`  Skipping ${emp.firstName} ${emp.lastName} (already exists)`);
    continue;
  }

  await conn.query(
    `INSERT INTO employees (firstName, lastName, email, entityId, department, jobTitle, positionLevel, employmentType, workLocation, startDate, workerType, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'full_time', 'remote', ?, 'employee', 'active')`,
    [
      emp.firstName,
      emp.lastName,
      `${emp.firstName.toLowerCase()}.${emp.lastName.toLowerCase()}@lawscollective.org`,
      emp.entity,
      emp.dept,
      emp.title,
      emp.level,
      emp.start,
    ]
  );
  console.log(`  Seeded: ${emp.firstName} ${emp.lastName} (${emp.level}, started ${emp.start.toISOString().split("T")[0]})`);
}

// Also seed founding members records for the managers
const managers = testEmployees.filter(e => e.level === "manager");
for (const mgr of managers) {
  const [existing] = await conn.query(
    "SELECT id FROM founding_members WHERE fullName = ? LIMIT 1",
    [`${mgr.firstName} ${mgr.lastName}`]
  );
  if (existing.length > 0) {
    console.log(`  Skipping founding member ${mgr.firstName} ${mgr.lastName} (already exists)`);
    continue;
  }

  await conn.query(
    `INSERT INTO founding_members (fullName, foundingDate, foundingRole, entityName, status)
     VALUES (?, ?, 'charter_member', 'L.A.W.S. Collective', 'active')`,
    [`${mgr.firstName} ${mgr.lastName}`, mgr.start]
  );
  console.log(`  Seeded founding member: ${mgr.firstName} ${mgr.lastName}`);
}

console.log("\nDone seeding test employees.");
await conn.end();
