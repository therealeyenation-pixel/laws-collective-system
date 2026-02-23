/**
 * Seed script for CALEA Freeman Family Trust company structure
 * 
 * Companies:
 * 1. 98 Trust - CALEA Freeman Family Trust (Root Authority)
 * 2. LuvOnPurpose Autonomous Wealth System, LLC (Commercial Engine - 40%)
 * 3. The L.A.W.S. Collective LLC (Education & Simulation - 30%)
 * 4. Real-Eye-Nation (Media & Truth - 20%)
 * 5. 508-LuvOnPurpose Academy and Outreach (Nonprofit - 10%)
 */

import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

async function seed() {
  const connection = await mysql.createConnection(DATABASE_URL);
  
  try {
    console.log('🌱 Starting company seed...\n');
    
    // First, get the owner user ID (LaShanna Russell)
    const [users] = await connection.execute(
      "SELECT id FROM users WHERE email = 'therealeyenation@gmail.com' LIMIT 1"
    );
    
    let userId;
    if (users.length === 0) {
      console.log('⚠️  Owner user not found, using ID 1');
      userId = 1;
    } else {
      userId = users[0].id;
      console.log(`✓ Found owner user ID: ${userId}`);
    }
    
    // Check if companies already exist
    const [existing] = await connection.execute(
      "SELECT COUNT(*) as count FROM business_entities WHERE userId = ?",
      [userId]
    );
    
    if (existing[0].count > 0) {
      console.log(`\n⚠️  ${existing[0].count} companies already exist for this user.`);
      console.log('Clearing existing companies to re-seed...\n');
      await connection.execute("DELETE FROM business_entities WHERE userId = ?", [userId]);
      await connection.execute("DELETE FROM luv_ledger_accounts WHERE userId = ?", [userId]);
    }
    
    // Define the company structure
    const companies = [
      {
        name: "98 Trust - CALEA Freeman Family Trust",
        entityType: "trust",
        status: "active",
        trustLevel: 5,
        description: "Root holding authority and lineage anchor. Holds lineage authority, ownership, sovereignty, and records. Owns the system logic, assets, and intellectual sovereignty.",
        financialStructure: JSON.stringify({
          role: "root_authority",
          allocation: 100,
          children: ["commercial", "education", "media", "nonprofit"],
          capabilities: ["governance", "sovereignty", "asset_protection", "lineage_records"]
        })
      },
      {
        name: "LuvOnPurpose Autonomous Wealth System, LLC",
        entityType: "llc",
        status: "active",
        trustLevel: 4,
        description: "Commercial Engine - Products, licensing, IP monetization. Handles product development, licensing agreements, and intellectual property revenue generation.",
        financialStructure: JSON.stringify({
          role: "commercial_engine",
          allocation: 40,
          parent: "trust",
          capabilities: ["product_licensing", "ip_monetization", "revenue_generation", "pricing_optimization"]
        })
      },
      {
        name: "The L.A.W.S. Collective LLC",
        entityType: "collective",
        status: "active",
        trustLevel: 4,
        description: "Education & Simulation - Curriculum, simulators, training platforms. Delivers the L.A.W.S. framework (Land, Air, Water, Self) through interactive learning experiences.",
        financialStructure: JSON.stringify({
          role: "education_platform",
          allocation: 30,
          parent: "trust",
          capabilities: ["curriculum_generation", "simulator_management", "certificate_issuance", "student_tracking"]
        })
      },
      {
        name: "Real-Eye-Nation",
        entityType: "llc",
        status: "active",
        trustLevel: 4,
        description: "Media & Truth - Publications, storytelling, documentation, truth-mapping. Speaks the case, holds the narrative, and asserts sovereignty through media.",
        financialStructure: JSON.stringify({
          role: "media_truth",
          allocation: 20,
          parent: "trust",
          capabilities: ["content_generation", "narrative_tracking", "truth_mapping", "publication_scheduling"]
        })
      },
      {
        name: "508-LuvOnPurpose Academy and Outreach",
        entityType: "collective",
        status: "active",
        trustLevel: 4,
        description: "Nonprofit - Grants, community restoration, public education. Teaching, restoration work, curriculum delivery, and outreach programs for community impact.",
        financialStructure: JSON.stringify({
          role: "nonprofit_outreach",
          allocation: 10,
          parent: "trust",
          capabilities: ["grant_management", "community_programs", "scholarship_distribution", "impact_tracking"]
        })
      }
    ];
    
    // Insert companies
    console.log('📦 Creating business entities...\n');
    const companyIds = [];
    
    for (const company of companies) {
      const [result] = await connection.execute(
        `INSERT INTO business_entities (userId, name, entityType, status, trustLevel, description, financialStructure)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, company.name, company.entityType, company.status, company.trustLevel, company.description, company.financialStructure]
      );
      companyIds.push(result.insertId);
      console.log(`  ✓ Created: ${company.name} (ID: ${result.insertId})`);
    }
    
    // Create LuvLedger accounts for each entity
    console.log('\n💰 Creating LuvLedger accounts...\n');
    
    const ledgerAccounts = [
      { businessEntityId: companyIds[0], accountType: "trust", accountName: "98 Trust Master Account", balance: "1000000.00", allocation: "100.00" },
      { businessEntityId: companyIds[1], accountType: "entity", accountName: "Commercial Engine Account", balance: "400000.00", allocation: "40.00" },
      { businessEntityId: companyIds[2], accountType: "collective", accountName: "Education Platform Account", balance: "300000.00", allocation: "30.00" },
      { businessEntityId: companyIds[3], accountType: "entity", accountName: "Media & Truth Account", balance: "200000.00", allocation: "20.00" },
      { businessEntityId: companyIds[4], accountType: "collective", accountName: "Nonprofit Outreach Account", balance: "100000.00", allocation: "10.00" }
    ];
    
    for (const account of ledgerAccounts) {
      await connection.execute(
        `INSERT INTO luv_ledger_accounts (userId, businessEntityId, accountType, accountName, balance, allocationPercentage, status)
         VALUES (?, ?, ?, ?, ?, ?, 'active')`,
        [userId, account.businessEntityId, account.accountType, account.accountName, account.balance, account.allocation]
      );
      console.log(`  ✓ Created: ${account.accountName} (${account.allocation}%)`);
    }
    
    // Create initial token balances
    console.log('\n🪙 Creating token accounts...\n');
    
    const tokenBalances = [
      { balance: "1000000.00000000" },
      { balance: "400000.00000000" },
      { balance: "300000.00000000" },
      { balance: "200000.00000000" },
      { balance: "100000.00000000" }
    ];
    
    // Check if token account already exists for user
    const [existingToken] = await connection.execute(
      "SELECT id FROM token_accounts WHERE userId = ?",
      [userId]
    );
    
    if (existingToken.length === 0) {
      // Create single token account for user with total balance
      await connection.execute(
        `INSERT INTO token_accounts (userId, tokenBalance, totalEarned, totalSpent)
         VALUES (?, '2000000.00000000', '2000000.00000000', '0.00000000')`,
        [userId]
      );
      console.log(`  ✓ Token account created with 2,000,000 tokens`);
    } else {
      // Update existing token account
      await connection.execute(
        `UPDATE token_accounts SET tokenBalance = '2000000.00000000', totalEarned = '2000000.00000000' WHERE userId = ?`,
        [userId]
      );
      console.log(`  ✓ Token account updated with 2,000,000 tokens`);
    }
    
    console.log('\n✅ Seed completed successfully!\n');
    console.log('Summary:');
    console.log(`  - ${companies.length} business entities created`);
    console.log(`  - ${ledgerAccounts.length} LuvLedger accounts created`);
    console.log(`  - 1 token account created/updated`);
    console.log(`  - Total tokens in circulation: 2,000,000`);
    
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

seed().catch(console.error);
