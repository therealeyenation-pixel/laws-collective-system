import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const candidates = [
  {
    name: "Maia Rylandlesesene",
    position: "Procurement Manager",
    department: "Procurement",
    entity: "The L.A.W.S. Collective LLC",
    status: "identified",
    location: "GA",
    email: "mrylandlesesene@gmail.com",
    phone: "404-697-0903"
  },
  {
    name: "Latisha Cox",
    position: "Purchasing Manager",
    department: "Purchasing",
    entity: "The L.A.W.S. Collective LLC",
    status: "identified",
    location: "GA",
    email: "latishacox@yahoo.com",
    phone: "404-697-0903"
  },
  {
    name: "Roshonda Parker",
    position: "Contracts Manager",
    department: "Contracts",
    entity: "The L.A.W.S. Collective LLC",
    status: "identified",
    location: "GA",
    email: "roshondaparker@gmail.com",
    phone: "404-697-0903"
  },
  {
    name: "Talbert Cox",
    position: "Property Manager",
    department: "Property",
    entity: "The L.A.W.S. Collective LLC",
    status: "identified",
    location: "GA",
    email: "talbertcox@gmail.com",
    phone: "404-697-0903"
  },
  {
    name: "Christopher Battle Sr.",
    position: "Project Controls Manager",
    department: "Project Controls",
    entity: "The L.A.W.S. Collective LLC",
    status: "identified",
    location: "GA",
    email: "christopherbattle@gmail.com",
    phone: "404-697-0903"
  },
  {
    name: "Treiva Hunter",
    position: "Real Estate Manager - SC",
    department: "Real Estate",
    entity: "The L.A.W.S. Collective LLC",
    status: "identified",
    location: "SC",
    email: "treivahunter@gmail.com",
    phone: "803-555-0000"
  },
  {
    name: "Kenneth Coleman",
    position: "Real Estate Manager - GA",
    department: "Real Estate",
    entity: "The L.A.W.S. Collective LLC",
    status: "identified",
    location: "GA",
    email: "kennethcoleman@gmail.com",
    phone: "404-555-0000"
  }
];

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log("Adding identified candidates to database...");
  
  for (const candidate of candidates) {
    try {
      // Check if candidate already exists
      const [existing] = await connection.execute(
        'SELECT id FROM employees WHERE name = ?',
        [candidate.name]
      );
      
      if (existing.length > 0) {
        console.log(`Candidate ${candidate.name} already exists, updating...`);
        await connection.execute(
          `UPDATE employees SET 
            position = ?, department = ?, entity = ?, status = ?, 
            location = ?, email = ?, phone = ?
          WHERE name = ?`,
          [candidate.position, candidate.department, candidate.entity, 
           candidate.status, candidate.location, candidate.email, 
           candidate.phone, candidate.name]
        );
      } else {
        console.log(`Adding candidate: ${candidate.name}`);
        await connection.execute(
          `INSERT INTO employees (name, position, department, entity, status, location, email, phone, role, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'user', NOW(), NOW())`,
          [candidate.name, candidate.position, candidate.department, 
           candidate.entity, candidate.status, candidate.location, 
           candidate.email, candidate.phone]
        );
      }
    } catch (error) {
      console.error(`Error adding ${candidate.name}:`, error.message);
    }
  }
  
  // Show all employees
  const [employees] = await connection.execute('SELECT name, position, department, status FROM employees');
  console.log("\nAll employees in database:");
  console.table(employees);
  
  await connection.end();
}

main().catch(console.error);
