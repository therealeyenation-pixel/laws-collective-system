import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Candidates from spreadsheet - using correct schema columns
const candidates = [
  {
    firstName: "Maia",
    lastName: "Rylandlesesene",
    jobTitle: "Procurement Manager",
    department: "Procurement",
    email: "mrylandlesesene@gmail.com",
    phone: "404-697-0903",
    positionLevel: "manager",
    status: "pending"
  },
  {
    firstName: "Latisha",
    lastName: "Cox",
    jobTitle: "Purchasing Manager",
    department: "Purchasing",
    email: "latishacox@yahoo.com",
    phone: "404-697-0903",
    positionLevel: "manager",
    status: "pending"
  },
  {
    firstName: "Roshonda",
    lastName: "Parker",
    jobTitle: "Contracts Manager",
    department: "Contracts",
    email: "roshondaparker@gmail.com",
    phone: "404-697-0903",
    positionLevel: "manager",
    status: "pending"
  },
  {
    firstName: "Talbert",
    lastName: "Cox",
    jobTitle: "Property Manager",
    department: "Property",
    email: "talbertcox@gmail.com",
    phone: "404-697-0903",
    positionLevel: "manager",
    status: "pending"
  },
  {
    firstName: "Christopher",
    lastName: "Battle Sr.",
    jobTitle: "Project Controls Manager",
    department: "Project Controls",
    email: "christopherbattle@gmail.com",
    phone: "404-697-0903",
    positionLevel: "manager",
    status: "pending"
  },
  {
    firstName: "Treiva",
    lastName: "Hunter",
    jobTitle: "Real Estate Manager - SC",
    department: "Real Estate",
    email: "treivahunter@gmail.com",
    phone: "803-555-0000",
    positionLevel: "manager",
    status: "pending"
  },
  {
    firstName: "Kenneth",
    lastName: "Coleman",
    jobTitle: "Real Estate Manager - GA",
    department: "Real Estate",
    email: "kennethcoleman@gmail.com",
    phone: "404-555-0000",
    positionLevel: "manager",
    status: "pending"
  }
];

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  // Get the L.A.W.S. Collective entity ID
  const [entities] = await connection.execute(
    "SELECT id FROM business_entities WHERE name LIKE '%L.A.W.S%' LIMIT 1"
  );
  
  const entityId = entities.length > 0 ? entities[0].id : 1;
  console.log("Using entity ID:", entityId);
  
  console.log("Adding identified candidates to database...");
  
  for (const candidate of candidates) {
    try {
      // Check if candidate already exists
      const [existing] = await connection.execute(
        'SELECT id FROM employees WHERE firstName = ? AND lastName = ?',
        [candidate.firstName, candidate.lastName]
      );
      
      if (existing.length > 0) {
        console.log(`Candidate ${candidate.firstName} ${candidate.lastName} already exists, updating...`);
        await connection.execute(
          `UPDATE employees SET 
            jobTitle = ?, department = ?, email = ?, phone = ?,
            positionLevel = ?, status = ?
          WHERE firstName = ? AND lastName = ?`,
          [candidate.jobTitle, candidate.department, candidate.email, 
           candidate.phone, candidate.positionLevel, candidate.status,
           candidate.firstName, candidate.lastName]
        );
      } else {
        console.log(`Adding candidate: ${candidate.firstName} ${candidate.lastName}`);
        await connection.execute(
          `INSERT INTO employees (firstName, lastName, jobTitle, department, email, phone, 
           entityId, positionLevel, status, startDate, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
          [candidate.firstName, candidate.lastName, candidate.jobTitle, 
           candidate.department, candidate.email, candidate.phone,
           entityId, candidate.positionLevel, candidate.status]
        );
      }
      console.log(`✓ ${candidate.firstName} ${candidate.lastName} added successfully`);
    } catch (error) {
      console.error(`Error adding ${candidate.firstName} ${candidate.lastName}:`, error.message);
    }
  }
  
  // Show all employees
  const [employees] = await connection.execute(
    'SELECT firstName, lastName, jobTitle, department, status FROM employees'
  );
  console.log("\nAll employees in database:");
  console.table(employees);
  
  await connection.end();
}

main().catch(console.error);
