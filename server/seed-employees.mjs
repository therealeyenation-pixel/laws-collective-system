import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function seedEmployees() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    // Get filled position IDs
    const [positions] = await connection.execute(
      "SELECT id, title, salaryAmount FROM business_positions WHERE status = 'filled'"
    );
    
    console.log('Found filled positions:', positions.length);
    
    // Clear existing position holders
    await connection.execute('DELETE FROM position_holders');
    console.log('Cleared existing position holders');
    
    // Employee data matching positions
    const employees = [
      { title: 'CEO/Matriarch', fullName: 'LaShanna Russell', email: 'therealeyenation@gmail.com', relationship: 'family_blood', specific: 'Owner/Founder' },
      { title: 'Finance Manager', fullName: 'Craig', email: 'craig@lawscollective.com', relationship: 'family_blood', specific: 'Family Member' },
      { title: 'Education Manager', fullName: 'Cornelius', email: 'cornelius@lawscollective.com', relationship: 'family_blood', specific: 'Family Member' },
      { title: 'Media Manager', fullName: 'Amandes', email: 'amandes@lawscollective.com', relationship: 'family_blood', specific: 'Family Member' },
      { title: 'Design Manager', fullName: 'Essence', email: 'essence@lawscollective.com', relationship: 'family_blood', specific: 'Family Member' },
      { title: 'Health Manager', fullName: 'Amber S. Hunter', email: 'amber@lawscollective.com', relationship: 'family_blood', specific: 'Family Member' },
    ];
    
    for (const emp of employees) {
      // Find matching position
      const position = positions.find(p => p.title === emp.title);
      if (!position) {
        console.log(`  ⚠ Position not found: ${emp.title}`);
        continue;
      }
      
      await connection.execute(
        `INSERT INTO position_holders 
         (positionId, fullName, email, relationshipType, specificRelationship, startDate, actualSalary, status, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, NOW(), ?, 'active', NOW(), NOW())`,
        [
          position.id,
          emp.fullName,
          emp.email,
          emp.relationship,
          emp.specific,
          position.salaryAmount
        ]
      );
      
      console.log(`  ✓ ${emp.fullName} - ${emp.title} ($${Number(position.salaryAmount).toLocaleString()})`);
    }
    
    console.log(`\n✅ Successfully seeded ${employees.length} employees`);
    
  } catch (error) {
    console.error('Error seeding employees:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

seedEmployees();
