import mysql from 'mysql2/promise';

// Helper to count words
function countWords(text) {
  return text.trim().split(/\s+/).length;
}

// Real-Eye-Nation LLC - Media Branch (~475 words)
const realEyeNationNeedStatement = `Real-Eye-Nation LLC addresses a critical gap in community wealth building: the absence of media infrastructure owned by the communities whose stories are being told. For generations, external media has controlled narratives of Black, Indigenous, and underserved communities—misrepresenting or ignoring the innovation and economic development happening within them. Without media ownership, communities cannot document their progress, train their own storytellers, or capture the economic value of their narratives.

Communities building generational wealth need professional media to document land acquisitions, construction projects, and economic milestones. They need trained content creators who understand the mission. They need distribution channels that cannot be censored or suppressed. And they need media revenue that circulates back into community development.

Real-Eye-Nation provides complete media infrastructure for community wealth building. Our Media Creator Simulator prepares filmmakers, editors, narrators, podcasters, and social media strategists to document and amplify community development. Our production studio creates documentaries, educational content, and historical archives. Our distribution network ensures community-owned content reaches audiences without dependence on external platforms.

What distinguishes us is integration with a larger ecosystem. As our partner Academy graduates skilled tradespeople and our partner Collective launches business owners, they will acquire and develop affordable housing. Our content creators document every milestone—property acquisition, renovation, families moving in. We are embedded participants in generational transformation.

Our funding request of $750,000 to $2,000,000 builds professional media infrastructure with training capacity. We allocate 45% to staffing (producers, cinematographers, editors, sound engineers, instructors—12-18 professionals), 30% to equipment and technology, 15% to production and distribution, and 10% to operations.

Phase 1 (24 months): Hire core team of 8-10 professionals, launch Media Creator Simulator, establish production studio, train 35-40 content creators, produce documentary series on first property acquisitions, secure distribution partnerships, generate $150,000 in licensing revenue.

Phase 2 (36 months): Train 100+ content creators, produce 30 documentaries and 150 podcast episodes documenting housing development, reach 1.5 million viewers, generate $800,000 annual revenue, achieve operational sustainability.

This is narrative sovereignty for communities who refuse to let others tell their story.`;

// The L.A.W.S. Collective, LLC - Workforce to Ownership (~480 words)
const lawsCollectiveNeedStatement = `The L.A.W.S. Collective addresses a fundamental failure in workforce development: billions invested training workers for employment while failing to prepare them for business ownership. Communities with highest workforce participation have lowest business ownership rates. Workers gain skills generating wealth for others without accumulating ownership themselves. This is a structural problem requiring a fundamentally different approach.

The consequences are generational. Families cycle through employment without building equity. Communities export labor value to external owners. Young people see no pathway from job to ownership. Traditional programs perpetuate this by measuring job placements rather than wealth creation.

The L.A.W.S. Collective provides complete workforce-to-ownership infrastructure. Our SaaS platform integrates business planning, financial management, legal compliance, and market access—reducing business formation complexity by 70%. Our program combines platform access with coaching, legal guidance, financial counseling, and community networks that transform workers into confident entrepreneurs.

What distinguishes us is ecosystem integration. Our graduates become employers who hire skilled workers from our partner Academy. As the Academy produces certified electricians, plumbers, and construction managers, Collective graduates provide business infrastructure to employ them. Our proof of concept: graduate-owned construction and property management businesses will renovate and maintain affordable housing acquired by our partner Trust. This closed-loop economy addresses the housing crisis while keeping wealth in community.

Our funding request of $1,500,000 to $3,500,000 builds transformational infrastructure. We allocate 50% to staffing (developers, coaches, advisors, counselors—15-20 professionals), 25% to technology development, 15% to program delivery, and 10% to operations.

Phase 1 (24 months): Hire core team of 10-12 professionals, complete platform development, establish training facilities, enroll 300 participants, launch 180 businesses with 85%+ success rate, establish first construction businesses for community housing, generate $200,000 revenue.

Phase 2 (36 months): Serve 1,500+ workers, launch 800 community-owned businesses, create 1,000-1,500 jobs prioritizing Academy graduates, support renovation of 2-3 properties (50-100 housing units), generate $8 million in community wealth, achieve sustainability through subscriptions.

Track record: 89% of pilot participants launched businesses within 12 months with 78% three-year survival rate versus 50% national average. This is ownership infrastructure for communities ready to employ their own and build their own future.`;

// LuvOnPurpose Autonomous Wealth System LLC - Technology (~475 words)
const luvOnPurposeTechNeedStatement = `LuvOnPurpose Autonomous Wealth System addresses the technology gap perpetuating economic inequality: financial tools designed for the wealthy while underserved communities use consumer-grade apps never intended for wealth accumulation. Commercial software optimizes for fees, not wealth creation. Fintech targets profitable segments while ignoring communities most needing financial automation.

The consequences compound generationally. Without automated savings, families cannot build reserves or down payments. Without investment automation, families miss decades of compound growth. Without tax optimization, families overpay. Without integrated dashboards, families cannot coordinate wealth building with community development.

Our platform provides enterprise-grade financial automation for community wealth building: automated savings optimization, investment management, tax planning, credit building, and financial education—tools previously available only to high-net-worth individuals. AI-powered coaching provides personalized guidance. Community features enable mutual support and collective investment.

What distinguishes us is ecosystem integration. As families build wealth through our tools, they gain capacity to invest in community land and housing. Our platform coordinates collective savings pools enabling community members to participate in property investments, turning renters into stakeholders. Every dollar optimized strengthens the ecosystem and accelerates community-owned housing development.

Our funding request of $1,000,000 to $2,500,000 builds secure financial technology infrastructure. We allocate 45% to staffing (engineers, security specialists, AI developers, advisors—12-15 professionals), 30% to technology infrastructure, 15% to customer acquisition and support, and 10% to operations and compliance.

Phase 1 (24 months): Hire core team of 8-10 professionals, complete platform with security certification, develop AI coaching models, onboard 400 families, achieve $350,000 collective savings, facilitate 150 investment accounts, launch community investment pool for housing acquisitions, generate $100,000 subscription revenue.

Phase 2 (36 months): Serve 1,500+ families, achieve $3 million collective savings, facilitate 600 investment accounts, enable community investment in 2-3 property acquisitions, generate $500,000 annual revenue, achieve operational sustainability.

Pilot results: 340% increase in savings rates, $180,000 collective wealth, 95% retention. This is wealth automation for communities building prosperity through collective ownership.`;

// LuvOnPurpose Academy (508c1a) - Education (~485 words)
const academyNeedStatement = `LuvOnPurpose Academy addresses a critical failure in American education: the systematic disconnection between learning and economic empowerment. Traditional schools prepare students for tests while failing to prepare them for wealth creation, business ownership, or skilled trades providing family-sustaining careers. The result is graduates with diplomas but no pathway to prosperity—particularly in communities facing systemic barriers to capital and career advancement.

Youth unemployment in target communities exceeds 25% while skilled trade positions go unfilled. Graduates enter workforces unprepared for entrepreneurship or certifications commanding premium wages. Families cycle through low-wage employment. The education system perpetuates economic dependency.

Our Academy offers a different model: comprehensive K-12 education integrating academic excellence with skill development, business training, and pathways to apprenticeship. Our Divine STEM curriculum weaves cultural identity into rigorous science, technology, engineering, and mathematics. Our certification programs in electrical, plumbing, HVAC, construction management, and healthcare technology prepare students for careers that cannot be outsourced. Our Coding and AI Lab provides hands-on training in software development and automation.

What distinguishes us is the complete ecosystem. Students operate simulated enterprises through proprietary business simulators. They earn industry certifications while in school. Our proof of concept connects to community development: as our ecosystem acquires multi-unit housing, students gain real-world experience renovating properties under professional supervision. We create skilled workers and contractors who build and maintain community infrastructure.

Our funding request of $2,000,000 to $5,000,000 builds transformational educational infrastructure. We allocate 45% to staffing (teachers, trade instructors, coaches, counselors—25-35 professionals), 25% to facilities and equipment, 20% to program development, and 10% to operations and student support.

Phase 1 (24 months): Hire core team of 15-20 professionals, complete facility buildout with workshops and labs, develop K-12 curriculum with certification integration, establish partnerships with 5 trade organizations and 10 employers, enroll 100 students, launch adult certification programs, begin training on first housing renovation, graduate 15-20 trade-certified students from accelerated programs.

Phase 2 (36 months): Serve 250 K-12 students, graduate 40-50 annually with certifications, maintain 90%+ exam pass rate, place 30-40 graduates annually into jobs with community businesses, provide training through renovation of 2-3 properties (50-100 units), launch 15-20 student businesses, generate $400,000 revenue.

This is economic infrastructure creating the workforce that builds our community's housing and future.`;

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
      const wordCount = Math.round(row.char_count / 6); // More accurate word estimate
      console.log(`${row.entityName}: ~${wordCount} words`);
    });
    
  } finally {
    await connection.end();
  }
}

updateAllNeedStatements().catch(console.error);
