import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const positions = [
  // Tier 1 - Executive
  { title: "CEO/Matriarch", department: "Executive", tier: "Tier 1 - Executive", salaryAmount: 153000.00, reportsTo: "Board", status: "filled", filledBy: "LaShanna Russell", isFamily: true },
  { title: "CFO", department: "Finance", tier: "Tier 1 - Executive", salaryAmount: 135000.00, reportsTo: "CEO", status: "open", isFamily: false },
  { title: "COO", department: "Operations", tier: "Tier 1 - Executive", salaryAmount: 135000.00, reportsTo: "CEO", status: "open", isFamily: false },
  
  // Tier 2 - Director
  { title: "Executive Director", department: "Executive", tier: "Tier 2 - Director", salaryAmount: 121500.00, reportsTo: "CEO", status: "open", isFamily: false },
  { title: "Legal/Compliance Director", department: "Legal", tier: "Tier 2 - Director", salaryAmount: 121500.00, reportsTo: "CEO", status: "open", isFamily: false },
  { title: "Operations Director", department: "Operations", tier: "Tier 2 - Director", salaryAmount: 121500.00, reportsTo: "COO", status: "open", isFamily: false },
  
  // Tier 3 - Manager (Filled - Family at 85%)
  { title: "Finance Manager", department: "Finance", tier: "Tier 3 - Manager", salaryAmount: 102000.00, reportsTo: "CEO", status: "filled", filledBy: "Craig", isFamily: true },
  { title: "Education Manager", department: "Education", tier: "Tier 3 - Manager", salaryAmount: 102000.00, reportsTo: "CEO", status: "filled", filledBy: "Cornelius", isFamily: true },
  { title: "Media Manager", department: "Media", tier: "Tier 3 - Manager", salaryAmount: 102000.00, reportsTo: "CEO", status: "filled", filledBy: "Amandes", isFamily: true },
  { title: "Design Manager", department: "Design", tier: "Tier 3 - Manager", salaryAmount: 102000.00, reportsTo: "CEO", status: "filled", filledBy: "Essence", isFamily: true },
  { title: "Health Manager", department: "Health", tier: "Tier 3 - Manager", salaryAmount: 102000.00, reportsTo: "CEO", status: "filled", filledBy: "Amber S. Hunter", isFamily: true },
  
  // Tier 3 - Manager (Candidate Identified)
  { title: "Procurement Manager", department: "Procurement", tier: "Tier 3 - Manager", salaryAmount: 108000.00, reportsTo: "CEO", status: "open", isFamily: false },
  { title: "Contracts Manager", department: "Contracts", tier: "Tier 3 - Manager", salaryAmount: 108000.00, reportsTo: "CEO", status: "open", isFamily: false },
  { title: "Purchasing Manager", department: "Purchasing", tier: "Tier 3 - Manager", salaryAmount: 108000.00, reportsTo: "Procurement Manager", status: "open", isFamily: false },
  { title: "Property Manager", department: "Property", tier: "Tier 3 - Manager", salaryAmount: 103500.00, reportsTo: "Real Estate Manager", status: "open", isFamily: false },
  { title: "Real Estate Manager", department: "Real Estate", tier: "Tier 3 - Manager", salaryAmount: 108000.00, reportsTo: "CEO", status: "open", isFamily: false },
  { title: "Project Controls Manager", department: "Project Controls", tier: "Tier 3 - Manager", salaryAmount: 108000.00, reportsTo: "CEO", status: "open", isFamily: false },
  
  // Tier 3 - Manager (Open)
  { title: "HR Manager", department: "Human Resources", tier: "Tier 3 - Manager", salaryAmount: 108000.00, reportsTo: "CEO", status: "open", isFamily: false },
  { title: "Operations Manager", department: "Operations", tier: "Tier 3 - Manager", salaryAmount: 108000.00, reportsTo: "CEO", status: "open", isFamily: false },
  { title: "QA/QC Manager", department: "Quality Assurance", tier: "Tier 3 - Manager", salaryAmount: 108000.00, reportsTo: "CEO", status: "open", isFamily: false },
  { title: "Grant Manager", department: "Grants", tier: "Tier 3 - Manager", salaryAmount: 103500.00, reportsTo: "CEO", status: "open", isFamily: false },
  { title: "Operations Coordinator Manager", department: "Operations", tier: "Tier 3 - Manager", salaryAmount: 108000.00, reportsTo: "CEO", status: "open", isFamily: false },
  
  // Tier 4 - Coordinator
  { title: "Education Ops Coordinator", department: "Education", tier: "Tier 4 - Coordinator", salaryAmount: 79200.00, reportsTo: "Education Manager", status: "open", isFamily: false },
  { title: "Health Ops Coordinator", department: "Health", tier: "Tier 4 - Coordinator", salaryAmount: 79200.00, reportsTo: "Health Manager", status: "open", isFamily: false },
  { title: "Design Ops Coordinator", department: "Design", tier: "Tier 4 - Coordinator", salaryAmount: 79200.00, reportsTo: "Design Manager", status: "open", isFamily: false },
  { title: "Media Ops Coordinator", department: "Media", tier: "Tier 4 - Coordinator", salaryAmount: 79200.00, reportsTo: "Media Manager", status: "open", isFamily: false },
  { title: "Finance Ops Coordinator", department: "Finance", tier: "Tier 4 - Coordinator", salaryAmount: 79200.00, reportsTo: "Finance Manager", status: "open", isFamily: false },
  { title: "Procurement Ops Coordinator", department: "Procurement", tier: "Tier 4 - Coordinator", salaryAmount: 79200.00, reportsTo: "Procurement Manager", status: "open", isFamily: false },
  { title: "Purchasing Ops Coordinator", department: "Purchasing", tier: "Tier 4 - Coordinator", salaryAmount: 79200.00, reportsTo: "Purchasing Manager", status: "open", isFamily: false },
  { title: "Contracts Coordinator", department: "Contracts", tier: "Tier 4 - Coordinator", salaryAmount: 79200.00, reportsTo: "Contracts Manager", status: "open", isFamily: false },
  { title: "HR Ops Coordinator", department: "Human Resources", tier: "Tier 4 - Coordinator", salaryAmount: 79200.00, reportsTo: "HR Manager", status: "open", isFamily: false },
  { title: "QA/QC Ops Coordinator", department: "Quality Assurance", tier: "Tier 4 - Coordinator", salaryAmount: 79200.00, reportsTo: "QA/QC Manager", status: "open", isFamily: false },
  { title: "Operations Ops Coordinator", department: "Operations", tier: "Tier 4 - Coordinator", salaryAmount: 79200.00, reportsTo: "Operations Manager", status: "open", isFamily: false },
  { title: "Real Estate Ops Coordinator", department: "Real Estate", tier: "Tier 4 - Coordinator", salaryAmount: 79200.00, reportsTo: "Real Estate Manager", status: "open", isFamily: false },
  { title: "Property Ops Coordinator", department: "Property", tier: "Tier 4 - Coordinator", salaryAmount: 79200.00, reportsTo: "Property Manager", status: "open", isFamily: false },
  { title: "Project Controls Coordinator", department: "Project Controls", tier: "Tier 4 - Coordinator", salaryAmount: 79200.00, reportsTo: "Project Controls Manager", status: "open", isFamily: false },
  { title: "Grant Coordinator", department: "Grants", tier: "Tier 4 - Coordinator", salaryAmount: 79200.00, reportsTo: "Grant Manager", status: "open", isFamily: false },
  { title: "Executive Business Coordinator", department: "Executive", tier: "Tier 4 - Coordinator", salaryAmount: 79200.00, reportsTo: "CEO", status: "open", isFamily: false },
  
  // Tier 5 - Specialist
  { title: "Platform Administrator", department: "IT", tier: "Tier 5 - Specialist", salaryAmount: 70200.00, reportsTo: "Design Manager", status: "open", isFamily: false },
  { title: "Vendor Relations Specialist", department: "Procurement", tier: "Tier 5 - Specialist", salaryAmount: 64800.00, reportsTo: "Procurement Manager", status: "open", isFamily: false },
  { title: "Equipment Coordinator", department: "Procurement", tier: "Tier 5 - Specialist", salaryAmount: 64800.00, reportsTo: "Procurement Manager", status: "open", isFamily: false },
  { title: "Benefits Administrator", department: "Human Resources", tier: "Tier 5 - Specialist", salaryAmount: 67500.00, reportsTo: "HR Manager", status: "open", isFamily: false },
  { title: "Supply Chain Analyst", department: "Procurement", tier: "Tier 5 - Specialist", salaryAmount: 70200.00, reportsTo: "Procurement Manager", status: "open", isFamily: false },
  { title: "Grant Writer", department: "Grants", tier: "Tier 5 - Specialist", salaryAmount: 64800.00, reportsTo: "Grant Manager", status: "open", isFamily: false },
  { title: "Project Controls Analyst", department: "Project Controls", tier: "Tier 5 - Specialist", salaryAmount: 70200.00, reportsTo: "Project Controls Manager", status: "open", isFamily: false },
  { title: "Business Support Specialist I", department: "Operations", tier: "Tier 5 - Specialist", salaryAmount: 64800.00, reportsTo: "Any Manager", status: "open", isFamily: false },
  { title: "Business Support Specialist II", department: "Operations", tier: "Tier 5 - Specialist", salaryAmount: 64800.00, reportsTo: "Any Manager", status: "open", isFamily: false },
];

async function seedPositions() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    console.log('Clearing existing positions...');
    await connection.execute('DELETE FROM business_positions');
    
    console.log('Inserting new positions...');
    
    for (const pos of positions) {
      const status = pos.status === 'filled' ? 'filled' : 'open';
      const currentHolders = pos.status === 'filled' ? 1 : 0;
      
      // Determine classification and compensation type based on tier
      let classificationType = 'w2_employee';
      let employmentType = 'full_time';
      let exemptionStatus = 'exempt';
      let compensationType = 'salary';
      
      if (pos.tier === 'Tier 1 - Executive') {
        classificationType = 'w2_officer';
      }
      
      const description = pos.filledBy 
        ? `${pos.tier} position - Currently held by ${pos.filledBy}${pos.isFamily ? ' (Family - 85% rate)' : ''}`
        : `${pos.tier} position - Reports to ${pos.reportsTo}`;
      
      await connection.execute(
        `INSERT INTO business_positions 
         (businessEntityId, houseId, title, department, description, classificationType, employmentType, exemptionStatus, compensationType, salaryAmount, payFrequency, benefitsEligible, status, maxHolders, currentHolders, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          1, // businessEntityId
          1, // houseId
          pos.title,
          pos.department,
          description,
          classificationType,
          employmentType,
          exemptionStatus,
          compensationType,
          pos.salaryAmount,
          'biweekly',
          true,
          status,
          1,
          currentHolders
        ]
      );
      
      console.log(`  ✓ ${pos.title} - $${pos.salaryAmount.toLocaleString()} (${status})`);
    }
    
    console.log(`\n✅ Successfully seeded ${positions.length} positions`);
    
    // Summary
    const filled = positions.filter(p => p.status === 'filled').length;
    const open = positions.filter(p => p.status === 'open').length;
    console.log(`   Filled: ${filled}`);
    console.log(`   Open: ${open}`);
    
  } catch (error) {
    console.error('Error seeding positions:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

seedPositions();
