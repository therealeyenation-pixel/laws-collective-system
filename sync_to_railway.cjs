const mysql = require('mysql2/promise');
require('dotenv').config({ path: '/home/ubuntu/financial_automation_map/.env' });

// Railway database credentials
const RAILWAY_URL = 'mysql://root:BNDgmHoMWbVTCnLNOqhAqvGmqKMPXdYZ@metro.proxy.rlwy.net:53862/railway';

async function main() {
  const manusConn = await mysql.createConnection(process.env.DATABASE_URL);
  const railwayConn = await mysql.createConnection(RAILWAY_URL);
  
  console.log('Connected to both databases');
  
  // 1. Sync Business Entities
  console.log('\n=== SYNCING BUSINESS ENTITIES ===');
  const [entities] = await manusConn.execute('SELECT * FROM business_entities');
  for (const entity of entities) {
    try {
      // Check if exists
      const [existing] = await railwayConn.execute('SELECT id FROM business_entities WHERE id = ?', [entity.id]);
      if (existing.length === 0) {
        await railwayConn.execute(`
          INSERT INTO business_entities (id, userId, name, entityType, status, trustLevel, description, financialStructure, createdAt, updatedAt, ein, stateOfFormation, stateEntityId, formationDate, registeredAddress, physicalAddress, parentEntityId, allocationPercentage)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [entity.id, entity.userId, entity.name, entity.entityType, entity.status, entity.trustLevel, entity.description, entity.financialStructure, entity.createdAt, entity.updatedAt, entity.ein, entity.stateOfFormation, entity.stateEntityId, entity.formationDate, entity.registeredAddress, entity.physicalAddress, entity.parentEntityId, entity.allocationPercentage]);
        console.log('  Added entity: ' + entity.name);
      } else {
        console.log('  Exists: ' + entity.name);
      }
    } catch (err) {
      console.log('  Error with ' + entity.name + ': ' + err.message);
    }
  }
  
  // 2. Sync Employees
  console.log('\n=== SYNCING EMPLOYEES ===');
  const [employees] = await manusConn.execute('SELECT * FROM employees');
  for (const emp of employees) {
    try {
      const [existing] = await railwayConn.execute('SELECT id FROM employees WHERE id = ?', [emp.id]);
      if (existing.length === 0) {
        await railwayConn.execute(`
          INSERT INTO employees (id, firstName, lastName, preferredName, email, phone, entityId, department, jobTitle, positionLevel, reportsTo, employmentType, workLocation, startDate, endDate, workerType, contractStartDate, contractEndDate, hourlyRate, is1099, contractTerms, bio, avatarUrl, linkedinUrl, status, userId, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [emp.id, emp.firstName, emp.lastName, emp.preferredName, emp.email, emp.phone, emp.entityId, emp.department, emp.jobTitle, emp.positionLevel, emp.reportsTo, emp.employmentType, emp.workLocation, emp.startDate, emp.endDate, emp.workerType, emp.contractStartDate, emp.contractEndDate, emp.hourlyRate, emp.is1099, emp.contractTerms, emp.bio, emp.avatarUrl, emp.linkedinUrl, emp.status, emp.userId, emp.createdAt, emp.updatedAt]);
        console.log('  Added employee: ' + emp.firstName + ' ' + emp.lastName);
      } else {
        // Update existing
        await railwayConn.execute(`
          UPDATE employees SET firstName=?, lastName=?, email=?, phone=?, entityId=?, department=?, jobTitle=?, positionLevel=?, status=?, updatedAt=NOW()
          WHERE id=?
        `, [emp.firstName, emp.lastName, emp.email, emp.phone, emp.entityId, emp.department, emp.jobTitle, emp.positionLevel, emp.status, emp.id]);
        console.log('  Updated: ' + emp.firstName + ' ' + emp.lastName);
      }
    } catch (err) {
      console.log('  Error with ' + emp.firstName + ': ' + err.message);
    }
  }
  
  // 3. Sync Agents
  console.log('\n=== SYNCING AGENTS ===');
  const [agents] = await manusConn.execute('SELECT * FROM agents');
  // First clear existing agents on Railway
  await railwayConn.execute('DELETE FROM agents');
  console.log('  Cleared existing agents');
  for (const agent of agents) {
    try {
      await railwayConn.execute(`
        INSERT INTO agents (id, name, type, description, systemPrompt, capabilities, isActive, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [agent.id, agent.name, agent.type, agent.description, agent.systemPrompt, agent.capabilities, agent.isActive, agent.createdAt, agent.updatedAt]);
      console.log('  Added agent: ' + agent.name);
    } catch (err) {
      console.log('  Error with ' + agent.name + ': ' + err.message);
    }
  }
  
  // 4. Sync LuvLedger Accounts
  console.log('\n=== SYNCING LUVLEDGER ACCOUNTS ===');
  const [accounts] = await manusConn.execute('SELECT * FROM luv_ledger_accounts');
  for (const acc of accounts) {
    try {
      const [existing] = await railwayConn.execute('SELECT id FROM luv_ledger_accounts WHERE id = ?', [acc.id]);
      if (existing.length === 0) {
        await railwayConn.execute(`
          INSERT INTO luv_ledger_accounts (id, userId, businessEntityId, accountType, accountName, balance, allocationPercentage, status, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [acc.id, acc.userId, acc.businessEntityId, acc.accountType, acc.accountName, acc.balance, acc.allocationPercentage, acc.status, acc.createdAt, acc.updatedAt]);
        console.log('  Added account: ' + acc.accountName);
      } else {
        console.log('  Exists: ' + acc.accountName);
      }
    } catch (err) {
      console.log('  Error with ' + acc.accountName + ': ' + err.message);
    }
  }
  
  // Summary
  console.log('\n=== SYNC COMPLETE ===');
  const [railwayEntities] = await railwayConn.execute('SELECT COUNT(*) as count FROM business_entities');
  const [railwayEmployees] = await railwayConn.execute('SELECT COUNT(*) as count FROM employees');
  const [railwayAgents] = await railwayConn.execute('SELECT COUNT(*) as count FROM agents');
  const [railwayAccounts] = await railwayConn.execute('SELECT COUNT(*) as count FROM luv_ledger_accounts');
  
  console.log('Railway now has:');
  console.log('  Business Entities: ' + railwayEntities[0].count);
  console.log('  Employees: ' + railwayEmployees[0].count);
  console.log('  Agents: ' + railwayAgents[0].count);
  console.log('  LuvLedger Accounts: ' + railwayAccounts[0].count);
  
  await manusConn.end();
  await railwayConn.end();
}

main().catch(console.error);
