import mysql from 'mysql2/promise';

const academyNeedStatement = `LuvOnPurpose Outreach Temple and Academy Society, Inc. addresses a critical failure in American education: the systematic disconnection between learning and economic empowerment. While traditional schools prepare students for standardized tests, they fail to prepare them for wealth creation, business ownership, or skilled trades that provide family-sustaining careers. The result is generations of graduates with diplomas but no pathway to prosperity—particularly in communities already facing systemic barriers to capital, credit, and career advancement.

The consequences are devastating and measurable. In our target communities, youth unemployment exceeds 25%, while skilled trade positions go unfilled. High school graduates enter a workforce unprepared for either entrepreneurship or the technical certifications that command premium wages. Families cycle through low-wage employment while watching wealth accumulate elsewhere. The education system designed to create opportunity instead perpetuates economic dependency.

Our Academy offers a fundamentally different model: a comprehensive K-12 educational institution that integrates academic excellence with practical skill development, business training, and direct pathways to apprenticeship and employment. Our Divine STEM curriculum weaves cultural identity and ancestral wisdom into rigorous science, technology, engineering, and mathematics instruction. Our House of Many Tongues language program builds multilingual competency essential for global commerce. Our certification programs in skilled trades—electrical, plumbing, HVAC, construction management, healthcare technology—prepare students for careers that cannot be outsourced.

What distinguishes our Academy is the complete ecosystem we provide. Students don't just learn about business—they operate simulated enterprises through our proprietary business simulators, making real decisions with real consequences in a safe learning environment. They don't just study trades—they earn industry-recognized certifications while still in school. And critically, they don't graduate into uncertainty—our apprenticeship partnership pipeline connects graduates directly with employers, unions, and training programs that provide immediate career pathways.

Our funding request of $2,000,000 to $5,000,000 reflects the true cost of building transformational educational infrastructure. We will allocate approximately 45% to staffing (certified teachers, trade instructors, business coaches, counselors, apprenticeship coordinators—a team of 25-35 professionals), 25% to facilities and equipment (classroom technology, trade workshop equipment, simulation lab infrastructure), 20% to program development (curriculum creation, certification partnerships, apprenticeship contracts, employer relationships), and 10% to operations and student support services.

Our pilot programs demonstrate extraordinary results: 94% of students completing our trade certification track pass industry exams on first attempt. 87% of graduates secure employment or apprenticeship placement within 90 days. Students in our business simulator program demonstrate 340% higher financial literacy scores than peers. Within 36 months of full funding, we project serving 500 K-12 students, graduating 150 students annually with trade certifications, placing 120 graduates into apprenticeship programs, launching 50 student-founded businesses, and establishing partnerships with 25 employers and trade organizations. This is not education—this is economic infrastructure for generational transformation.`;

async function updateAcademyNeedStatement() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    // Update the Academy entity's fundingPurpose (Need Statement)
    const [result] = await connection.execute(
      `UPDATE business_plans SET fundingPurpose = ? WHERE entityName LIKE '%Academy%' OR entityName LIKE '%508%' OR entityName LIKE '%Outreach%'`,
      [academyNeedStatement]
    );
    
    console.log('Academy Need Statement updated:', result.affectedRows, 'rows affected');
    
    // Verify the update
    const [rows] = await connection.execute(
      `SELECT entityName, LEFT(fundingPurpose, 200) as preview FROM business_plans WHERE entityName LIKE '%Academy%' OR entityName LIKE '%508%' OR entityName LIKE '%Outreach%'`
    );
    
    console.log('Updated entities:', rows);
    
  } finally {
    await connection.end();
  }
}

updateAcademyNeedStatement().catch(console.error);
