// Seed script to add all 32 positions to the database
// Run with: node server/scripts/seed-positions.mjs

import mysql from 'mysql2/promise';

const positions = [
  // Actively Recruiting (5)
  { title: "Outreach Coordinator", department: "Community Outreach", status: "open", classificationType: "w2_employee", compensationType: "salary", salaryAmount: 55000 },
  { title: "Content Creator / Media Assistant", department: "Media Production", status: "open", classificationType: "w2_employee", compensationType: "salary", salaryAmount: 52000 },
  { title: "Academy Instructor", department: "Education", status: "open", classificationType: "w2_employee", compensationType: "salary", salaryAmount: 58000 },
  { title: "Grant Writer / Proposal Specialist", department: "Grants", status: "open", classificationType: "w2_employee", compensationType: "salary", salaryAmount: 65000 },
  { title: "Community Programs Coordinator", department: "Community", status: "open", classificationType: "w2_employee", compensationType: "salary", salaryAmount: 52000 },
  
  // Open Positions - Manager Level
  { title: "HR Manager", department: "Human Resources", status: "open", classificationType: "w2_employee", compensationType: "salary", salaryAmount: 102000 },
  { title: "QA/QC Manager", department: "Quality Assurance", status: "open", classificationType: "w2_employee", compensationType: "salary", salaryAmount: 102000 },
  { title: "Operations Manager", department: "Operations", status: "open", classificationType: "w2_employee", compensationType: "salary", salaryAmount: 102000 },
  { title: "Technology Manager", department: "Technology", status: "open", classificationType: "w2_employee", compensationType: "salary", salaryAmount: 110000 },
  { title: "Legal Manager", department: "Legal", status: "open", classificationType: "w2_employee", compensationType: "salary", salaryAmount: 115000 },
  { title: "Real Estate Manager - SC", department: "Real Estate", status: "open", classificationType: "w2_employee", compensationType: "salary", salaryAmount: 108000 },
  { title: "Real Estate Manager - GA", department: "Real Estate", status: "open", classificationType: "w2_employee", compensationType: "salary", salaryAmount: 108000 },
  
  // Open Positions - Coordinator Level
  { title: "Education Operations Coordinator", department: "Education", status: "open", classificationType: "w2_employee", compensationType: "salary", salaryAmount: 55000 },
  { title: "HR Operations Coordinator", department: "Human Resources", status: "open", classificationType: "w2_employee", compensationType: "salary", salaryAmount: 52000 },
  { title: "QA/QC Operations Coordinator", department: "Quality Assurance", status: "open", classificationType: "w2_employee", compensationType: "salary", salaryAmount: 52000 },
  { title: "Operations Coordinator", department: "Operations", status: "open", classificationType: "w2_employee", compensationType: "salary", salaryAmount: 52000 },
  { title: "Platform Administrator", department: "Technology", status: "open", classificationType: "w2_employee", compensationType: "salary", salaryAmount: 65000 },
  { title: "Legal Operations Coordinator", department: "Legal", status: "open", classificationType: "w2_employee", compensationType: "salary", salaryAmount: 58000 },
  { title: "Real Estate Operations Coordinator - SC", department: "Real Estate", status: "open", classificationType: "w2_employee", compensationType: "salary", salaryAmount: 52000 },
  { title: "Real Estate Operations Coordinator - GA", department: "Real Estate", status: "open", classificationType: "w2_employee", compensationType: "salary", salaryAmount: 52000 },
  
  // Ready to Hire (3)
  { title: "Media Operations Coordinator", department: "Media Production", status: "open", classificationType: "w2_employee", compensationType: "salary", salaryAmount: 52000 },
  { title: "Design Operations Coordinator", department: "Design", status: "open", classificationType: "w2_employee", compensationType: "salary", salaryAmount: 55000 },
  { title: "Health Operations Coordinator", department: "Health & Wellness", status: "open", classificationType: "w2_employee", compensationType: "salary", salaryAmount: 52000 },
  
  // Pending Manager (4)
  { title: "Finance Operations Coordinator", department: "Finance", status: "open", classificationType: "w2_employee", compensationType: "salary", salaryAmount: 58000 },
  { title: "Project Controls Coordinator", department: "Project Controls", status: "open", classificationType: "w2_employee", compensationType: "salary", salaryAmount: 55000 },
  { title: "Contracts Operations Coordinator", department: "Contracts", status: "open", classificationType: "w2_employee", compensationType: "salary", salaryAmount: 55000 },
  { title: "Education Ops Coordinator (Temple)", department: "Education", status: "open", classificationType: "w2_employee", compensationType: "salary", salaryAmount: 52000 },
  
  // Candidate Identified (5)
  { title: "Purchasing Manager", department: "Purchasing", status: "open", classificationType: "w2_employee", compensationType: "salary", salaryAmount: 106000 },
  { title: "Contracts Manager", department: "Contracts", status: "open", classificationType: "w2_employee", compensationType: "salary", salaryAmount: 106000 },
  { title: "Procurement Manager", department: "Procurement", status: "open", classificationType: "w2_employee", compensationType: "salary", salaryAmount: 109500 },
  { title: "Project Controls Manager", department: "Project Controls", status: "open", classificationType: "w2_employee", compensationType: "salary", salaryAmount: 108000 },
  { title: "Property Manager", department: "Property", status: "open", classificationType: "w2_employee", compensationType: "salary", salaryAmount: 109500 },
];

async function seedPositions() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log('Seeding positions...');
  
  for (const pos of positions) {
    // Check if position already exists
    const [existing] = await connection.execute(
      'SELECT id FROM business_positions WHERE title = ? AND department = ?',
      [pos.title, pos.department]
    );
    
    if (existing.length === 0) {
      await connection.execute(
        `INSERT INTO business_positions (businessEntityId, houseId, title, department, classificationType, compensationType, salaryAmount, status, createdAt, updatedAt)
         VALUES (1, 1, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [pos.title, pos.department, pos.classificationType, pos.compensationType, pos.salaryAmount, pos.status]
      );
      console.log(`Added: ${pos.title}`);
    } else {
      console.log(`Skipped (exists): ${pos.title}`);
    }
  }
  
  await connection.end();
  console.log('Done seeding positions!');
}

seedPositions().catch(console.error);
