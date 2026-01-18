/**
 * LuvOnPurpose System Diagnostic Test
 * Verifies legal structure, entity mappings, position tiers, and data consistency
 */

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const DATABASE_URL = process.env.DATABASE_URL;

// Expected family managers
const EXPECTED_FAMILY_MANAGERS = [
  { name: 'Shanna Russell', role: 'CEO/Matriarch', department: 'Executive', entity: 'CALEA Freeman Family Trust' },
  { name: 'Craig Russell', role: 'Finance Manager', department: 'Finance', entity: 'The L.A.W.S. Collective' },
  { name: 'Cornelius Christopher', role: 'Education Manager', department: 'Education', entity: '508-LuvOnPurpose Academy' },
  { name: 'Amber Russell', role: 'Health Manager', department: 'Health', entity: 'The L.A.W.S. Collective' },
  { name: 'Essence Russell', role: 'Design Manager', department: 'Design', entity: 'Real-Eye-Nation' },
  { name: 'Amandes Russell', role: 'Media Manager', department: 'Media', entity: 'Real-Eye-Nation' }
];

// Expected business entities
const EXPECTED_ENTITIES = [
  { name: '98 Trust - CALEA Freeman Family Trust', type: 'Trust', role: 'Governance' },
  { name: 'LuvOnPurpose Autonomous Wealth System LLC', type: 'LLC', role: 'Holding Company' },
  { name: 'The L.A.W.S. Collective, LLC', type: 'LLC', role: 'Operations' },
  { name: 'Real-Eye-Nation, LLC', type: 'LLC', role: 'Media/Creative' },
  { name: '508-LuvOnPurpose Academy and Outreach', type: '508(c)(1)(a)', role: 'Education' }
];

// Position tiers
const POSITION_TIERS = {
  tier1_family: 'Family Managers (Filled)',
  tier2_identified: 'Candidates Identified (Not Approached)',
  tier3_open: 'Open Manager Positions (Future Hiring)',
  tier4_coordinator: 'Operations Coordinators (External Hires)'
};

async function runDiagnostic() {
  const report = {
    timestamp: new Date().toISOString(),
    status: 'PASS',
    checks: [],
    warnings: [],
    errors: []
  };

  console.log('\\n========================================');
  console.log('LuvOnPurpose System Diagnostic Test');
  console.log('========================================\\n');

  // 1. Check Business Entities
  console.log('1. Checking Business Entities...');
  try {
    const connection = await mysql.createConnection(DATABASE_URL);
    const [entities] = await connection.execute('SELECT * FROM business_entities');
    
    report.checks.push({
      name: 'Business Entities Count',
      expected: EXPECTED_ENTITIES.length,
      actual: entities.length,
      status: entities.length >= EXPECTED_ENTITIES.length ? 'PASS' : 'WARN'
    });

    for (const expected of EXPECTED_ENTITIES) {
      const found = entities.find(e => e.name && e.name.includes(expected.name.split(' ')[0]));
      if (found) {
        console.log(`  ✓ Found: ${found.name}`);
      } else {
        console.log(`  ✗ Missing: ${expected.name}`);
        report.warnings.push(`Missing entity: ${expected.name}`);
      }
    }
    await connection.end();
  } catch (err) {
    report.errors.push(`Database connection error: ${err.message}`);
    console.log(`  ✗ Database error: ${err.message}`);
  }

  // 2. Check Employee Directory - Family Managers
  console.log('\\n2. Checking Family Managers in Employee Directory...');
  try {
    const connection = await mysql.createConnection(DATABASE_URL);
    const [employees] = await connection.execute(
      "SELECT e.*, be.name as entityName FROM employees e LEFT JOIN business_entities be ON e.entityId = be.id WHERE e.department IN ('Executive', 'Finance', 'Education', 'Health', 'Design', 'Media')"
    );

    for (const expected of EXPECTED_FAMILY_MANAGERS) {
      const found = employees.find(e => 
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(expected.name.split(' ')[0].toLowerCase())
      );
      if (found) {
        console.log(`  ✓ ${found.firstName} ${found.lastName} - ${found.jobTitle} (${found.department})`);
        if (found.entityName) {
          console.log(`    Entity: ${found.entityName}`);
        } else {
          report.warnings.push(`${found.firstName} ${found.lastName} has no entity assigned`);
        }
      } else {
        console.log(`  ✗ Missing: ${expected.name}`);
        report.errors.push(`Missing family manager: ${expected.name}`);
        report.status = 'FAIL';
      }
    }
    await connection.end();
  } catch (err) {
    report.errors.push(`Employee check error: ${err.message}`);
  }

  // 3. Check Organizational Structure JSON
  console.log('\\n3. Checking Organizational Structure JSON...');
  try {
    const orgPath = path.join(process.cwd(), 'client/public/organizational_structure.json');
    const orgData = JSON.parse(fs.readFileSync(orgPath, 'utf8'));
    
    if (orgData.position_tiers) {
      console.log('  ✓ Position tiers defined');
      for (const tier of Object.keys(orgData.position_tiers)) {
        console.log(`    - ${tier}: ${orgData.position_tiers[tier].description || 'defined'}`);
      }
    } else {
      report.warnings.push('Position tiers not defined in organizational structure');
    }

    if (orgData.family_assignments) {
      console.log('  ✓ Family assignments defined');
      report.checks.push({
        name: 'Family Assignments in Org Structure',
        status: 'PASS'
      });
    }
  } catch (err) {
    report.warnings.push(`Org structure check: ${err.message}`);
  }

  // 4. Check Job Postings JSON
  console.log('\\n4. Checking Job Postings Structure...');
  try {
    const jobsPath = path.join(process.cwd(), 'client/public/job_postings.json');
    const jobsData = JSON.parse(fs.readFileSync(jobsPath, 'utf8'));
    
    if (jobsData.hiring_structure) {
      console.log('  ✓ Hiring structure defined');
      console.log(`    Philosophy: ${jobsData.hiring_structure.philosophy?.substring(0, 50)}...`);
    }
    
    if (jobsData.position_tiers) {
      console.log('  ✓ Position tiers in job postings');
      for (const [tier, info] of Object.entries(jobsData.position_tiers)) {
        console.log(`    - ${tier}: ${info.description?.substring(0, 40)}...`);
      }
    }
  } catch (err) {
    report.warnings.push(`Job postings check: ${err.message}`);
  }

  // 5. Check Careers Page Positions (via file read)
  console.log('\\n5. Checking Careers Page Positions...');
  try {
    const careersPath = path.join(process.cwd(), 'client/src/pages/Careers.tsx');
    const careersContent = fs.readFileSync(careersPath, 'utf8');
    
    const familyFilledCount = (careersContent.match(/Filled - Family/g) || []).length;
    console.log(`  ✓ Family-filled positions in Careers: ${familyFilledCount}`);
    
    const tier1Count = (careersContent.match(/tier1_family/g) || []).length;
    const tier2Count = (careersContent.match(/tier2_identified/g) || []).length;
    const tier3Count = (careersContent.match(/tier3_open/g) || []).length;
    const tier4Count = (careersContent.match(/tier4_coordinator/g) || []).length;
    
    console.log(`  Position Tiers:`);
    console.log(`    - Tier 1 (Family): ${tier1Count} positions`);
    console.log(`    - Tier 2 (Identified): ${tier2Count} positions`);
    console.log(`    - Tier 3 (Open): ${tier3Count} positions`);
    console.log(`    - Tier 4 (Coordinator): ${tier4Count} positions`);
    
    report.checks.push({
      name: 'Careers Page Position Tiers',
      tier1: tier1Count,
      tier2: tier2Count,
      tier3: tier3Count,
      tier4: tier4Count,
      status: 'PASS'
    });
  } catch (err) {
    report.warnings.push(`Careers page check: ${err.message}`);
  }

  // 6. Check Navigation/Sidebar Structure
  console.log('\\n6. Checking Navigation Structure...');
  try {
    const layoutPath = path.join(process.cwd(), 'client/src/components/DashboardLayout.tsx');
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');
    
    const menuItems = layoutContent.match(/label:\s*["']([^"']+)["']/g) || [];
    console.log(`  ✓ Sidebar menu items: ${menuItems.length}`);
    
    // Check for key sections
    const hasEmployeeDirectory = layoutContent.includes('Employee Directory');
    const hasProjectControls = layoutContent.includes('Project Controls');
    const hasOperatingProcedures = layoutContent.includes('Operating Procedures');
    const hasOnboarding = layoutContent.includes('Onboarding');
    
    console.log(`    - Employee Directory: ${hasEmployeeDirectory ? '✓' : '✗'}`);
    console.log(`    - Project Controls: ${hasProjectControls ? '✓' : '✗'}`);
    console.log(`    - Operating Procedures: ${hasOperatingProcedures ? '✓' : '✗'}`);
    console.log(`    - Onboarding: ${hasOnboarding ? '✓' : '✗'}`);
  } catch (err) {
    report.warnings.push(`Navigation check: ${err.message}`);
  }

  // 7. Check Database Tables
  console.log('\\n7. Checking Database Tables...');
  try {
    const connection = await mysql.createConnection(DATABASE_URL);
    const [tables] = await connection.execute("SHOW TABLES");
    const tableNames = tables.map(t => Object.values(t)[0]);
    
    const requiredTables = [
      'users', 'business_entities', 'employees', 'job_applications',
      'onboarding_checklists', 'onboarding_tasks', 'operating_procedures',
      'projects', 'project_milestones', 'project_risks'
    ];
    
    console.log(`  Total tables: ${tableNames.length}`);
    for (const table of requiredTables) {
      const exists = tableNames.includes(table);
      console.log(`    - ${table}: ${exists ? '✓' : '✗'}`);
      if (!exists) {
        report.warnings.push(`Missing table: ${table}`);
      }
    }
    await connection.end();
  } catch (err) {
    report.errors.push(`Database tables check: ${err.message}`);
  }

  // Summary
  console.log('\\n========================================');
  console.log('DIAGNOSTIC SUMMARY');
  console.log('========================================');
  console.log(`Status: ${report.status}`);
  console.log(`Checks: ${report.checks.length}`);
  console.log(`Warnings: ${report.warnings.length}`);
  console.log(`Errors: ${report.errors.length}`);
  
  if (report.warnings.length > 0) {
    console.log('\\nWarnings:');
    report.warnings.forEach(w => console.log(`  ⚠ ${w}`));
  }
  
  if (report.errors.length > 0) {
    console.log('\\nErrors:');
    report.errors.forEach(e => console.log(`  ✗ ${e}`));
  }

  // Save report
  const reportPath = path.join(process.cwd(), 'diagnostic-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\\nReport saved to: ${reportPath}`);
  
  return report;
}

runDiagnostic().catch(console.error);
