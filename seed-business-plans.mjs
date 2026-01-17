/**
 * Seed Business Plans into Database
 * This script inserts all 5 business plans directly into the business_plans table
 * so data can auto-populate in the Grant Simulator
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Parse the DATABASE_URL
const url = new URL(DATABASE_URL);
const connection = await mysql.createConnection({
  host: url.hostname,
  port: url.port || 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  ssl: { rejectUnauthorized: true }
});

console.log('Connected to database');

// Business Plan Data for all 5 entities
const businessPlans = [
  {
    entityType: 'llc',
    entityName: 'Real-Eye-Nation LLC',
    missionStatement: 'To illuminate truth through authentic storytelling, empowering families and communities to document their histories, preserve their legacies, and share narratives that inspire generational transformation.',
    visionStatement: 'A world where every family has the tools and platform to tell their authentic story, where truth is documented and preserved for future generations, and where media serves as a vehicle for healing, education, and empowerment.',
    organizationDescription: 'Real-Eye-Nation LLC operates as the media and content division within the LuvOnPurpose family of companies. The organization focuses on three primary areas: documentary content creation, narrative preservation services, and truth-based educational media. The company was established to address the gap in authentic family storytelling and community narrative preservation.',
    yearFounded: 2024,
    productsServices: JSON.stringify([
      { name: 'Documentary Production', description: 'Full-service documentary creation for families and organizations', target: 'Families, nonprofits, community organizations' },
      { name: 'Legacy Documentation', description: 'Oral history recording, family archive digitization, story preservation', target: 'Multi-generational families' },
      { name: 'Media Consulting', description: 'Strategy and guidance for authentic storytelling', target: 'Small businesses, nonprofits' },
      { name: 'Educational Content', description: 'Video courses, tutorials, and training materials', target: 'Academy students, community members' },
      { name: 'Content Licensing', description: 'Licensing of original content for educational and commercial use', target: 'Educational institutions, media companies' },
      { name: 'Brand Storytelling', description: 'Authentic brand narrative development for mission-driven organizations', target: 'Social enterprises, nonprofits' }
    ]),
    uniqueValueProposition: 'Integrated ecosystem with built-in distribution channels, purpose-driven approach prioritizing truth and empowerment, community trust through L.A.W.S. Collective connection, and blockchain-verified documentation for authenticity.',
    targetMarket: 'Primary: Multi-generational families seeking to document histories and preserve oral traditions. Secondary: Mission-driven nonprofits and social enterprises needing authentic storytelling. Tertiary: Educational institutions seeking culturally relevant content.',
    marketSize: 'Growing genealogy market ($3B+), expanding documentary film market, increasing demand for authentic organizational storytelling',
    competitiveAdvantage: 'Operating within LuvOnPurpose ecosystem provides built-in distribution, educational partnerships, and community access. Purpose-driven approach prioritizes truth and healing over entertainment value.',
    teamSize: 4,
    teamDescription: 'Lean team structure leveraging broader LuvOnPurpose family for support functions',
    keyPersonnel: JSON.stringify([
      { name: 'LaShanna Russell', role: 'Founder/Creative Director', bio: 'Vision, strategy, and creative oversight' },
      { name: 'Family Members', role: 'Media Production Support', bio: 'Content creation and editing (training in progress)' },
      { name: 'Cornelius', role: 'Education Liaison', bio: 'Coordination with 508 Academy, Education/Training Manager' }
    ]),
    startupCosts: 20000.00,
    monthlyOperatingCosts: 2500.00,
    projectedRevenueYear1: 17500.00,
    projectedRevenueYear2: 75000.00,
    projectedRevenueYear3: 200000.00,
    breakEvenTimeline: '18-24 months',
    fundingNeeded: 20000.00,
    fundingPurpose: 'Equipment ($5,000-$8,000), Software ($2,000-$3,000), Training ($3,000-$5,000), Marketing ($3,000-$5,000), Operating Reserve ($2,000-$4,000)',
    fundingSources: JSON.stringify([
      { source: 'Small Business Grants (Women-owned)', amount: 10000, status: 'Seeking' },
      { source: 'Small Business Grants (Minority-owned)', amount: 10000, status: 'Seeking' },
      { source: 'Foundation Grants (Media/Storytelling)', amount: 5000, status: 'Seeking' }
    ]),
    shortTermGoals: JSON.stringify([
      'Equipment acquisition and setup',
      'Complete production training',
      'Launch pilot documentary project',
      'Build initial content library'
    ]),
    longTermGoals: JSON.stringify([
      'Establish sustainable revenue from content licensing',
      'Expand team with trained family members',
      'Create distribution partnerships',
      'Build library of 100+ community narratives'
    ]),
    milestones: JSON.stringify([
      { milestone: 'Equipment Acquisition', targetDate: 'Month 3', status: 'pending' },
      { milestone: 'First Pilot Project', targetDate: 'Month 6', status: 'pending' },
      { milestone: 'First Paying Client', targetDate: 'Month 9', status: 'pending' },
      { milestone: 'Content Library (10 pieces)', targetDate: 'Month 12', status: 'pending' }
    ]),
    socialImpact: 'Cultural preservation of family histories, community empowerment through storytelling tools, educational access with culturally relevant content, truth documentation via blockchain verification, healing through narrative processes.',
    communityBenefit: 'Training community members in media production, providing free/reduced-cost services to families in need, creating employment opportunities, building accessible community narrative library.',
    status: 'completed'
  },
  {
    entityType: 'trust',
    entityName: 'Calea Freeman Family Trust',
    missionStatement: 'To preserve, protect, and grow the Freeman family\'s multi-generational wealth while maintaining family unity, cultural identity, and community responsibility through sovereign governance and purpose-driven enterprise.',
    visionStatement: 'A family legacy that spans 100+ years, where each generation inherits not only financial resources but also the wisdom, values, and systems to continue building wealth with purpose and integrity.',
    organizationDescription: 'The Calea Freeman Family Trust operates as the apex entity in a hierarchical business structure designed for multi-generational wealth building. The Trust serves as the ultimate owner of all LuvOnPurpose operating entities, establishes governance policies, and manages resource allocation between operations, wealth building, and community benefit.',
    yearFounded: 2024,
    productsServices: JSON.stringify([
      { name: 'Governance Services', description: 'Policy establishment and enforcement for family businesses', target: 'Family entities' },
      { name: 'Asset Management', description: 'Oversight of Trust assets and investments', target: 'Family wealth' },
      { name: 'Distribution Management', description: 'Allocation of resources per established policy', target: 'Family members, entities' },
      { name: 'Succession Planning', description: 'Leadership transition and knowledge transfer', target: 'Next generation' }
    ]),
    uniqueValueProposition: 'Active governance body that oversees purpose-driven businesses, not just passive asset protection. Extends beyond wealth preservation to include family unity, cultural preservation, and community impact.',
    targetMarket: 'Primary: Freeman family members across generations. Secondary: Operating entities requiring governance oversight. Tertiary: Community beneficiaries of Trust-funded programs.',
    marketSize: 'Internal family ecosystem with 4 operating entities',
    competitiveAdvantage: 'Integrated governance structure preventing wealth loss across generations, L.A.W.S. framework alignment, comprehensive succession planning, multi-party approval controls.',
    teamSize: 6,
    teamDescription: 'Governance structure balancing authority with accountability through defined roles',
    keyPersonnel: JSON.stringify([
      { name: 'Trustee (TBD)', role: 'Trustee', bio: 'Legal administration, fiduciary duties' },
      { name: 'Trust Protector (TBD)', role: 'Trust Protector', bio: 'Oversight, amendment authority' },
      { name: 'Shanna Russell', role: 'Family Council Lead', bio: 'Matriarch, advisory, conflict resolution' },
      { name: 'Craig', role: 'Finance Support', bio: 'Financial oversight, Outreach support' },
      { name: 'Cornelius', role: 'Education/Training Manager', bio: 'Education Department, Justice Advisor' }
    ]),
    startupCosts: 13000.00,
    monthlyOperatingCosts: 500.00,
    projectedRevenueYear1: 0.00,
    projectedRevenueYear2: 25000.00,
    projectedRevenueYear3: 75000.00,
    breakEvenTimeline: '24-36 months',
    fundingNeeded: 13000.00,
    fundingPurpose: 'Legal Fees ($3,000-$5,000) for Trust document preparation, Initial Funding ($5,000-$10,000) for operating reserve, Administrative ($1,000-$2,000) for compliance setup',
    fundingSources: JSON.stringify([
      { source: 'Personal Contributions', amount: 5000, status: 'Planned' },
      { source: 'Operating Entity Grants', amount: 8000, status: 'Seeking' }
    ]),
    shortTermGoals: JSON.stringify([
      'Complete formal Trust document',
      'Designate Trustee and Trust Protector',
      'Establish initial funding',
      'Implement governance framework'
    ]),
    longTermGoals: JSON.stringify([
      'Achieve sustainable distributions from operating entities',
      'Acquire real estate assets',
      'Build diversified investment portfolio',
      'Prepare next generation for leadership'
    ]),
    milestones: JSON.stringify([
      { milestone: 'Trust Document Completion', targetDate: 'Year 1', status: 'pending' },
      { milestone: 'Trustee Designation', targetDate: 'Year 1', status: 'pending' },
      { milestone: 'Operating Entity Transfers', targetDate: 'Year 2', status: 'pending' },
      { milestone: 'First Distributions', targetDate: 'Year 3', status: 'pending' }
    ]),
    socialImpact: 'Family unity across generations, economic empowerment through employment and ownership opportunities, community investment through L.A.W.S. Collective and 508 Academy, replicable model for other families.',
    communityBenefit: 'Funding educational programs through 508 Academy, supporting community development through L.A.W.S. Collective, creating employment opportunities, sharing the LuvOnPurpose model with other families.',
    status: 'completed'
  },
  {
    entityType: 'llc',
    entityName: 'LuvOnPurpose LLC',
    missionStatement: 'To empower families to build multi-generational wealth through purpose-driven enterprise, providing the technology, training, and systems needed to create lasting legacies that span 100+ years.',
    visionStatement: 'A world where every family has access to the tools, knowledge, and systems to build sovereign wealth, where financial literacy is universal, and where generational wealth transfer is the norm rather than the exception.',
    organizationDescription: 'LuvOnPurpose LLC serves as the primary operating company and technology platform within the Freeman family\'s multi-generational wealth system. The company develops and operates the LuvOnPurpose platform—a comprehensive financial automation and family governance system that integrates financial management, business formation, grant tracking, document storage, training simulations, and family governance.',
    yearFounded: 2024,
    productsServices: JSON.stringify([
      { name: 'LuvOnPurpose Platform', description: 'Comprehensive family wealth management system', target: 'Families, family offices' },
      { name: 'Implementation Services', description: 'Setup and customization of platform for new families', target: 'High-net-worth families, family trusts' },
      { name: 'Training Programs', description: 'Financial literacy and system operation training', target: 'Platform users, community members' },
      { name: 'Consulting Services', description: 'Family governance and wealth strategy consulting', target: 'Families seeking generational planning' },
      { name: 'Platform Licensing', description: 'White-label licensing for organizations', target: 'Nonprofits, community organizations' },
      { name: 'API Access', description: 'Integration capabilities for third-party systems', target: 'Financial advisors, accountants' }
    ]),
    uniqueValueProposition: 'Integrated approach covering governance, operations, education, and community. Purpose-driven design built around L.A.W.S. framework. Proven model with Freeman family as proof of concept. Modern technology foundation enabling continuous improvement.',
    targetMarket: 'Primary: Multi-generational families seeking governance and wealth transfer systems. Secondary: Family offices and financial advisors serving high-net-worth clients. Tertiary: Community organizations focused on economic empowerment.',
    marketSize: '70% of wealthy families lose wealth by 2nd generation, 90% by 3rd - massive market for solutions',
    competitiveAdvantage: 'Comprehensive platform vs point solutions, purpose-driven design, proven family model, community connection through L.A.W.S. and 508 Academy, modern technology architecture.',
    teamSize: 6,
    teamDescription: 'Lean team leveraging family members and contractors',
    keyPersonnel: JSON.stringify([
      { name: 'LaShanna Russell', role: 'Founder/CEO', bio: 'Vision, strategy, platform direction' },
      { name: 'Family Members', role: 'Operations Support', bio: 'Day-to-day operations, client support' },
      { name: 'Cornelius', role: 'Education/Training', bio: 'Training program development' },
      { name: 'Craig', role: 'Finance/Outreach', bio: 'Financial management, marketing, partnerships' }
    ]),
    startupCosts: 37500.00,
    monthlyOperatingCosts: 5000.00,
    projectedRevenueYear1: 10000.00,
    projectedRevenueYear2: 75000.00,
    projectedRevenueYear3: 300000.00,
    breakEvenTimeline: '18-24 months',
    fundingNeeded: 37500.00,
    fundingPurpose: 'Platform Development ($10,000-$20,000), Legal/Compliance ($5,000-$8,000), Marketing ($5,000-$10,000), Operations ($3,000-$7,000), Reserve ($2,000-$5,000)',
    fundingSources: JSON.stringify([
      { source: 'Small Business Grants', amount: 20000, status: 'Seeking' },
      { source: 'Foundation Grants (Tech/Economic Empowerment)', amount: 15000, status: 'Seeking' },
      { source: 'Angel Investment', amount: 10000, status: 'Potential' }
    ]),
    shortTermGoals: JSON.stringify([
      'Complete platform development',
      'Document all system processes',
      'Onboard pilot users',
      'Establish first partnerships'
    ]),
    longTermGoals: JSON.stringify([
      'Achieve 1,000+ platform users',
      'Secure licensing deals with major organizations',
      'Expand to international markets',
      'Build sustainable recurring revenue'
    ]),
    milestones: JSON.stringify([
      { milestone: 'Platform Completion', targetDate: 'Month 6', status: 'in_progress' },
      { milestone: 'First Paying Clients', targetDate: 'Month 12', status: 'pending' },
      { milestone: 'Partnership Announcements', targetDate: 'Year 2', status: 'pending' },
      { milestone: '$100K Revenue', targetDate: 'Year 2', status: 'pending' }
    ]),
    socialImpact: 'Wealth gap reduction by providing tools to underserved families, financial literacy delivery through platform and Academy, family strengthening through governance structures, community development through L.A.W.S. integration, model replication multiplying impact.',
    communityBenefit: 'Reduced-cost platform access for qualifying families, partnerships with community organizations, employment opportunities, open educational content, support for other LuvOnPurpose entities.',
    status: 'completed'
  },
  {
    entityType: 'collective',
    entityName: 'L.A.W.S. Collective',
    missionStatement: 'To restore communities by reconnecting people with land, strengthening knowledge through education, facilitating healing and balance, and building practical skills that enable purpose-driven, generational wealth.',
    visionStatement: 'Thriving communities where families are rooted in their heritage, educated in financial and life skills, healed from generational trauma, and equipped with the tools to build lasting legacies.',
    organizationDescription: 'L.A.W.S. Collective is a community-focused organization dedicated to helping individuals and families reconnect with their roots, strengthen their identities, restore balance, and build practical skills for generational wealth. The name L.A.W.S. represents four pillars: Land, Air, Water, and Self. Operating as the community outreach arm of the LuvOnPurpose ecosystem.',
    yearFounded: 2024,
    productsServices: JSON.stringify([
      { name: 'LAND Programs', description: 'Genealogy workshops, land ownership education, family history documentation, Roots Retreats', target: 'Families seeking heritage connection' },
      { name: 'AIR Programs', description: 'Financial literacy series, business fundamentals, communication skills, digital literacy', target: 'Community members seeking education' },
      { name: 'WATER Programs', description: 'Healing circles, wellness workshops, decision-making framework, balance coaching', target: 'Individuals seeking healing and balance' },
      { name: 'SELF Programs', description: 'Purpose discovery, skills assessment, entrepreneurship incubator, career advancement', target: 'Purpose-seeking individuals' }
    ]),
    uniqueValueProposition: 'Integrated L.A.W.S. framework addressing whole person and family. Ecosystem connection with LuvOnPurpose platform, 508 Academy, and Real-Eye-Nation. Community-built trust. Practical wealth-building outcomes. Mutual support model.',
    targetMarket: 'Primary: Community families seeking support for wealth building and healing. Secondary: Diaspora reconnectors seeking heritage connection. Tertiary: Purpose-seeking professionals wanting deeper community connection.',
    marketSize: 'Growing interest in genealogy, financial literacy, trauma-informed approaches, and cooperative models',
    competitiveAdvantage: 'Integrated framework addressing whole person, ecosystem connection providing unique resources, community trust from being built by and for the community, practical wealth-building application.',
    teamSize: 7,
    teamDescription: 'Collaborative leadership model with pillar leads',
    keyPersonnel: JSON.stringify([
      { name: 'LaShanna Russell', role: 'Founder/Director', bio: 'Vision, strategy, community relationships' },
      { name: 'Cornelius', role: 'AIR Pillar Lead', bio: 'Education programs, Education Manager' },
      { name: 'Craig', role: 'Outreach', bio: 'Member recruitment, partnerships' },
      { name: 'TBD', role: 'LAND Pillar Lead', bio: 'Genealogy and land programs' },
      { name: 'TBD', role: 'WATER Pillar Lead', bio: 'Healing and wellness programs' },
      { name: 'TBD', role: 'SELF Pillar Lead', bio: 'Purpose and skills programs' }
    ]),
    startupCosts: 22500.00,
    monthlyOperatingCosts: 2000.00,
    projectedRevenueYear1: 17500.00,
    projectedRevenueYear2: 75000.00,
    projectedRevenueYear3: 200000.00,
    breakEvenTimeline: '18-24 months',
    fundingNeeded: 22500.00,
    fundingPurpose: 'Program Development ($5,000-$10,000), Marketing/Outreach ($3,000-$6,000), Technology ($2,000-$4,000), Venue/Events ($3,000-$6,000), Operations ($2,000-$4,000)',
    fundingSources: JSON.stringify([
      { source: 'Community Development Grants', amount: 15000, status: 'Seeking' },
      { source: 'Foundation Grants (Collective Models)', amount: 10000, status: 'Seeking' },
      { source: 'Crowdfunding', amount: 5000, status: 'Planned' }
    ]),
    shortTermGoals: JSON.stringify([
      'Develop core programs for all 4 pillars',
      'Recruit 50 founding members',
      'Launch community building activities',
      'Establish first partnerships'
    ]),
    longTermGoals: JSON.stringify([
      'Achieve 500+ active members',
      'Sustainable operations through membership and programs',
      'Regional expansion and replication',
      'Train community facilitators'
    ]),
    milestones: JSON.stringify([
      { milestone: 'Core Programs Developed', targetDate: 'Month 6', status: 'pending' },
      { milestone: '50 Founding Members', targetDate: 'Month 6', status: 'pending' },
      { milestone: 'Public Launch', targetDate: 'Month 9', status: 'pending' },
      { milestone: '200 Members', targetDate: 'Year 2', status: 'pending' }
    ]),
    socialImpact: 'Community wealth building through collective advancement, cultural preservation of heritage and knowledge, healing and restoration from generational trauma, leadership development for community sustainability, replicable model for other communities.',
    communityBenefit: 'Accessible programs regardless of ability to pay, gathering spaces for community connection, facilitator and leader training, partnerships with existing organizations, advocacy for community interests, mutual support networks.',
    status: 'completed'
  },
  {
    entityType: 'nonprofit_508',
    entityName: '508 Academy & Outreach',
    missionStatement: 'To educate, equip, and empower individuals and families with the knowledge, skills, and spiritual foundation needed to build purposeful, multi-generational wealth that serves both family and community.',
    visionStatement: 'A community where every family understands the principles of stewardship and wealth building, where financial literacy is universal, and where prosperity is used to bless future generations and serve those in need.',
    organizationDescription: '508 Academy & Outreach is a faith-based educational and charitable organization operating under Section 508(c)(1)(A) of the Internal Revenue Code. The organization provides financial literacy education, business training, and community outreach services grounded in principles of purpose, stewardship, and generational responsibility. Operates two divisions: Academy (educational programs) and Outreach (charitable services).',
    yearFounded: 2024,
    productsServices: JSON.stringify([
      { name: 'Financial Foundations', description: '8-week basic financial literacy, budgeting, saving course', target: 'Beginners, community members' },
      { name: 'Business Simulator Training', description: '6-week entity formation and business planning course', target: 'Aspiring entrepreneurs' },
      { name: 'Grant Writing Mastery', description: '4-week grant research and proposal writing course', target: 'Nonprofit staff, entrepreneurs' },
      { name: 'Wealth Building Intensive', description: '12-week advanced investing and legacy planning course', target: 'Intermediate learners' },
      { name: 'Leadership Development', description: '8-week family governance and succession course', target: 'Family leaders' },
      { name: 'Emergency Financial Assistance', description: 'One-time grants for families in crisis', target: 'Community members facing hardship' },
      { name: 'Youth Financial Literacy', description: 'Age-appropriate money education', target: 'Children and teens' },
      { name: 'Re-Entry Support', description: 'Financial education for formerly incarcerated', target: 'Justice-involved individuals' }
    ]),
    uniqueValueProposition: 'Faith-integrated financial education bridging practical skills with spiritual foundation. 508(c)(1)(A) status provides tax-exempt benefits with regulatory freedom. Progressive certification pathway. Platform integration for immediate application.',
    targetMarket: 'Primary: LuvOnPurpose ecosystem members needing training and certification. Secondary: Faith community seeking spiritually-grounded financial education. Tertiary: Underserved community members lacking access to quality financial education.',
    marketSize: 'Growing demand for faith-integrated financial education, expanding financial literacy market',
    competitiveAdvantage: '508(c)(1)(A) status benefits, integration with LuvOnPurpose platform for practical application, certification and recognition system, community trust through faith connection.',
    teamSize: 5,
    teamDescription: 'Lean team relying on trained volunteers and certified facilitators',
    keyPersonnel: JSON.stringify([
      { name: 'LaShanna Russell', role: 'Founder/Director', bio: 'Vision, strategy, spiritual leadership' },
      { name: 'Cornelius', role: 'Training Manager', bio: 'Curriculum, certification, quality - signs all completion certificates' },
      { name: 'Family Member/Volunteer', role: 'Program Coordinator', bio: 'Scheduling, enrollment, logistics' },
      { name: 'TBD', role: 'Outreach Coordinator', bio: 'Community services, volunteer management' },
      { name: 'Certified Trainers', role: 'Facilitators', bio: 'Program delivery (contract/volunteer)' }
    ]),
    startupCosts: 30000.00,
    monthlyOperatingCosts: 3000.00,
    projectedRevenueYear1: 25000.00,
    projectedRevenueYear2: 112500.00,
    projectedRevenueYear3: 275000.00,
    breakEvenTimeline: '12-18 months',
    fundingNeeded: 30000.00,
    fundingPurpose: 'Curriculum Development ($8,000-$15,000), Technology ($4,000-$8,000), Marketing/Outreach ($3,000-$6,000), Facilitator Training ($3,000-$6,000), Operations ($2,000-$5,000)',
    fundingSources: JSON.stringify([
      { source: 'Faith-Based Grants', amount: 15000, status: 'Seeking' },
      { source: 'Education Grants', amount: 10000, status: 'Seeking' },
      { source: 'Donations', amount: 10000, status: 'Ongoing' },
      { source: 'Community Development Grants', amount: 5000, status: 'Seeking' }
    ]),
    shortTermGoals: JSON.stringify([
      'Complete curriculum for all core programs',
      'Launch pilot programs',
      'Train initial facilitators',
      'Establish outreach services'
    ]),
    longTermGoals: JSON.stringify([
      'Achieve 1,000+ program completions annually',
      'Build certified facilitator network',
      'Establish regional presence',
      'Create replication model for other communities'
    ]),
    milestones: JSON.stringify([
      { milestone: 'Curriculum Complete', targetDate: 'Month 6', status: 'pending' },
      { milestone: 'Pilot Programs Launch', targetDate: 'Month 6', status: 'pending' },
      { milestone: '100 Program Completions', targetDate: 'Year 1', status: 'pending' },
      { milestone: 'Facilitator Certification Program', targetDate: 'Year 2', status: 'pending' }
    ]),
    socialImpact: 'Financial empowerment through knowledge and skills, spiritual integration creating lasting transformation, community service through outreach programs, leadership development multiplying impact, generational change breaking cycles of financial struggle.',
    communityBenefit: 'Free and low-cost financial education, emergency assistance for families in crisis, facilitator training for community members, partnerships with churches and organizations, pathways from poverty to prosperity, support for justice-involved individuals.',
    status: 'completed'
  }
];

async function seedBusinessPlans() {
  try {
    // First, get the owner user ID (assuming user ID 1 is the owner)
    const [users] = await connection.execute('SELECT id FROM users WHERE role = "admin" LIMIT 1');
    const userId = users.length > 0 ? users[0].id : 1;
    
    console.log(`Using user ID: ${userId}`);
    
    // Check if business plans already exist
    const [existing] = await connection.execute('SELECT COUNT(*) as count FROM business_plans');
    if (existing[0].count > 0) {
      console.log(`Found ${existing[0].count} existing business plans. Deleting them first...`);
      await connection.execute('DELETE FROM business_plans');
      console.log('Existing business plans deleted.');
    }
    
    // Insert each business plan
    for (const plan of businessPlans) {
      const query = `
        INSERT INTO business_plans (
          entityType, entityName, createdByUserId,
          missionStatement, visionStatement, organizationDescription, yearFounded,
          productsServices, uniqueValueProposition,
          targetMarket, marketSize, competitiveAdvantage,
          teamSize, teamDescription, keyPersonnel,
          startupCosts, monthlyOperatingCosts,
          projectedRevenueYear1, projectedRevenueYear2, projectedRevenueYear3,
          breakEvenTimeline,
          fundingNeeded, fundingPurpose, fundingSources,
          shortTermGoals, longTermGoals, milestones,
          socialImpact, communityBenefit,
          status, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      
      await connection.execute(query, [
        plan.entityType,
        plan.entityName,
        userId,
        plan.missionStatement,
        plan.visionStatement,
        plan.organizationDescription,
        plan.yearFounded,
        plan.productsServices,
        plan.uniqueValueProposition,
        plan.targetMarket,
        plan.marketSize,
        plan.competitiveAdvantage,
        plan.teamSize,
        plan.teamDescription,
        plan.keyPersonnel,
        plan.startupCosts,
        plan.monthlyOperatingCosts,
        plan.projectedRevenueYear1,
        plan.projectedRevenueYear2,
        plan.projectedRevenueYear3,
        plan.breakEvenTimeline,
        plan.fundingNeeded,
        plan.fundingPurpose,
        plan.fundingSources,
        plan.shortTermGoals,
        plan.longTermGoals,
        plan.milestones,
        plan.socialImpact,
        plan.communityBenefit,
        plan.status
      ]);
      
      console.log(`✓ Inserted business plan for: ${plan.entityName}`);
    }
    
    console.log('\n✅ All 5 business plans seeded successfully!');
    
    // Verify the data
    const [results] = await connection.execute('SELECT id, entityName, entityType, status FROM business_plans');
    console.log('\nSeeded Business Plans:');
    console.table(results);
    
  } catch (error) {
    console.error('Error seeding business plans:', error);
    throw error;
  } finally {
    await connection.end();
    console.log('\nDatabase connection closed.');
  }
}

seedBusinessPlans();
