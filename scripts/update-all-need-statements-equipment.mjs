import mysql from 'mysql2/promise';

// Helper to count words
function countWords(text) {
  return text.trim().split(/\s+/).length;
}

// Real-Eye-Nation LLC - Media Branch (~350 words)
const realEyeNationNeedStatement = `Real-Eye-Nation LLC addresses a critical gap in community wealth building: the absence of media infrastructure owned by the communities whose stories are being told. For generations, external media has controlled narratives of Black, Indigenous, and underserved communities—misrepresenting or ignoring the innovation and economic development happening within them. Without media ownership, communities cannot document their progress, train their own storytellers, or capture the economic value of their narratives.

Communities building generational wealth need professional media to document land acquisitions, construction projects, and economic milestones. They need trained content creators who understand the mission. They need distribution channels that cannot be censored or suppressed.

Real-Eye-Nation provides complete media infrastructure for community wealth building. Our Media Creator Simulator prepares filmmakers, editors, narrators, podcasters, and social media strategists. Our production studio creates documentaries, educational content, and historical archives. We leverage blockchain technology for content ownership verification and creator royalty tracking.

What distinguishes us is integration with a larger ecosystem. As our partners acquire and develop affordable housing, our content creators document every milestone—property acquisition, renovation, families moving in. We are embedded participants in generational transformation.

Our funding request of $750,000 to $2,000,000 builds professional media infrastructure. We allocate 40% to staffing (12-18 professionals), 25% to capital equipment (professional cameras, lighting, sound equipment, editing workstations, mobile production unit), 15% to facilities including climate-controlled storage for media archives, 10% to production and distribution, and 10% to operations.

Phase 1 (24 months): Hire core team of 8-10 professionals, acquire production equipment, secure studio and archive storage space, launch Media Creator Simulator, train 35-40 content creators, produce documentary series on first property acquisitions, generate $150,000 in licensing revenue.

Phase 2 (36 months): Train 100+ content creators, produce 30 documentaries and 150 podcast episodes, reach 1.5 million viewers, generate $800,000 annual revenue, achieve operational sustainability.

This is narrative sovereignty for communities who refuse to let others tell their story.`;

// The L.A.W.S. Collective, LLC - Workforce to Ownership (~380 words)
const lawsCollectiveNeedStatement = `The L.A.W.S. Collective addresses a fundamental failure in workforce development: billions invested training workers for employment while failing to prepare them for business ownership. Communities with highest workforce participation have lowest business ownership rates. Workers gain skills generating wealth for others without accumulating ownership themselves.

The consequences are generational. Families cycle through employment without building equity. Communities export labor value to external owners. Traditional programs perpetuate this by measuring job placements rather than wealth creation.

The L.A.W.S. Collective provides complete workforce-to-ownership infrastructure. Our SaaS platform integrates business planning, financial management, legal compliance, and market access—reducing business formation complexity by 70%. Our Design & Finance Simulator includes blockchain fundamentals, teaching entrepreneurs to leverage smart contracts and tokenized equity structures for the emerging digital economy.

What distinguishes us is ecosystem integration. Our graduates become employers who hire skilled workers from our partner Academy. Our proof of concept: graduate-owned construction and property management businesses will renovate affordable housing acquired by our partner Trust, with ownership tracked transparently on blockchain.

Our funding request of $1,500,000 to $3,500,000 builds transformational infrastructure. We allocate 45% to staffing (15-20 professionals), 20% to technology development including blockchain integration, 20% to capital equipment (building renovation tools, land management equipment, IT infrastructure, work vehicles), 10% to storage and facilities (secure equipment warehouse, materials yard), and 5% to operations.

Capital equipment strategy: Own core tools used daily by graduate businesses, lease heavy equipment for major projects, maintain community tool library accessible to all certified contractors.

Phase 1 (24 months): Hire core team of 10-12 professionals, complete platform with blockchain features, acquire renovation equipment and secure storage facility, enroll 300 participants, launch 180 businesses, establish first construction businesses for community housing, generate $200,000 revenue.

Phase 2 (36 months): Serve 1,500+ workers, launch 800 community-owned businesses, create 1,000-1,500 jobs prioritizing Academy graduates, support renovation of 2-3 properties (50-100 housing units), generate $8 million in community wealth, achieve sustainability.

Track record: 89% of pilot participants launched businesses within 12 months with 78% three-year survival rate. This is ownership infrastructure for communities ready to build their own future.`;

// LuvOnPurpose Autonomous Wealth System LLC - Technology (~360 words)
const luvOnPurposeTechNeedStatement = `LuvOnPurpose Autonomous Wealth System addresses the technology gap perpetuating economic inequality: financial tools designed for the wealthy while underserved communities use consumer-grade apps never intended for wealth accumulation. Commercial software optimizes for fees, not wealth creation. Fintech targets profitable segments while ignoring communities most needing financial automation.

The consequences compound generationally. Without automated savings, families cannot build reserves or down payments. Without investment automation, families miss decades of compound growth. Without transparent ownership tracking, community investments lack accountability.

Our platform provides enterprise-grade financial automation built on blockchain infrastructure. We integrate automated savings optimization, investment management, tax planning, and credit building with blockchain-powered features: smart contracts for automated revenue sharing, tokenized ownership stakes in community properties, and immutable wealth accumulation records.

What distinguishes us is ecosystem integration. As families build wealth, they gain capacity to invest in community land and housing. Our blockchain-enabled platform coordinates collective investment pools, enabling community members to hold verifiable ownership stakes in property acquisitions.

Our funding request of $1,000,000 to $2,500,000 builds secure blockchain-enabled financial infrastructure. We allocate 40% to staffing (engineers, blockchain developers, security specialists—12-15 professionals), 25% to technology infrastructure (secure cloud hosting, smart contract development, API integrations), 20% to IT capital equipment (development workstations, security hardware, backup systems, network infrastructure for community properties), 10% to facilities including secure data storage, and 5% to operations and compliance.

Phase 1 (24 months): Hire core team of 8-10 professionals, deploy secure IT infrastructure, complete platform with blockchain integration, deploy smart contracts for community investment pools, onboard 400 families, achieve $350,000 collective savings, facilitate 150 investment accounts, generate $100,000 subscription revenue.

Phase 2 (36 months): Serve 1,500+ families, achieve $3 million collective savings, facilitate 600 investment accounts with tokenized community ownership, enable investment in 2-3 property acquisitions, generate $500,000 annual revenue, achieve sustainability.

Pilot results: 340% increase in savings rates, $180,000 collective wealth, 95% retention. This is blockchain-powered wealth automation for communities building prosperity through verifiable collective ownership.`;

// LuvOnPurpose Academy (508c1a) - Education (~400 words)
const academyNeedStatement = `LuvOnPurpose Academy addresses a critical failure in American education: the systematic disconnection between learning and economic empowerment. Traditional schools prepare students for tests while failing to prepare them for wealth creation, business ownership, or skilled trades providing family-sustaining careers. Graduates receive diplomas but no pathway to prosperity.

Youth unemployment in target communities exceeds 25% while skilled trade positions go unfilled. Graduates enter workforces unprepared for entrepreneurship or certifications commanding premium wages. The education system perpetuates economic dependency.

Our Academy offers comprehensive K-12 education integrating academic excellence with skill development, business training, and pathways to apprenticeship. Our Divine STEM curriculum weaves cultural identity into rigorous science, technology, engineering, and mathematics. Our certification programs in electrical, plumbing, HVAC, construction management, and healthcare technology prepare students for careers that cannot be outsourced. Our Coding and AI Lab includes blockchain fundamentals. All certifications are blockchain-verified, creating tamper-proof records.

What distinguishes us is the complete ecosystem. Students operate simulated enterprises through proprietary business simulators. Our proof of concept: as our ecosystem acquires multi-unit housing, students gain real-world experience renovating properties under professional supervision. We create skilled workers and contractors who build community infrastructure.

Our funding request of $2,000,000 to $5,000,000 builds transformational educational infrastructure. We allocate 40% to staffing (teachers, trade instructors, coaches—25-35 professionals), 25% to capital equipment (trade workshop tools, electrical training panels, plumbing fixtures, HVAC equipment, construction tools, computer lab systems, land management equipment), 20% to facilities including workshop space and secure equipment storage, 10% to program development including blockchain credentialing, and 5% to operations.

Capital equipment strategy: Own training equipment for daily instruction, maintain tool library for student projects, share heavy equipment with L.A.W.S. graduate businesses for real-world training on community properties.

Phase 1 (24 months): Hire core team of 15-20 professionals, build out workshops with trade equipment, secure storage facility, develop K-12 curriculum with certification integration, establish partnerships with 5 trade organizations, enroll 100 students, begin training on first housing renovation, graduate 15-20 trade-certified students.

Phase 2 (36 months): Serve 250 K-12 students, graduate 40-50 annually with blockchain-verified certifications, maintain 90%+ exam pass rate, place 30-40 graduates annually into community businesses, provide training through renovation of 2-3 properties (50-100 units), generate $400,000 revenue.

This is economic infrastructure creating the workforce that builds our community's future.`;

async function updateAllNeedStatements() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  const statements = [
    { name: 'Real-Eye-Nation', text: realEyeNationNeedStatement, pattern: '%Real-Eye%' },
    { name: 'L.A.W.S. Collective', text: lawsCollectiveNeedStatement, pattern: '%L.A.W.S%' },
    { name: 'LuvOnPurpose Tech', text: luvOnPurposeTechNeedStatement, pattern: '%Autonomous Wealth%' },
    { name: 'Academy', text: academyNeedStatement, pattern: '%Academy%' }
  ];
  
  console.log('=== Word Count Verification ===');
  for (const stmt of statements) {
    const words = countWords(stmt.text);
    const status = words >= 250 && words <= 500 ? '✓ COMPLIANT' : '✗ OUT OF RANGE';
    console.log(`${stmt.name}: ${words} words ${status}`);
  }
  console.log('');
  
  try {
    for (const stmt of statements) {
      const [result] = await connection.execute(
        `UPDATE business_plans SET fundingPurpose = ? WHERE entityName LIKE ?`,
        [stmt.text, stmt.pattern]
      );
      console.log(`${stmt.name} updated: ${result.affectedRows} rows`);
    }

    // Verify all updates
    const [rows] = await connection.execute(
      `SELECT entityName, LENGTH(fundingPurpose) as char_count FROM business_plans WHERE fundingPurpose IS NOT NULL AND LENGTH(fundingPurpose) > 100`
    );
    
    console.log('\n=== Final Database Verification ===');
    rows.forEach(row => {
      const wordCount = Math.round(row.char_count / 6);
      console.log(`${row.entityName}: ~${wordCount} words`);
    });
    
  } finally {
    await connection.end();
  }
}

updateAllNeedStatements().catch(console.error);
