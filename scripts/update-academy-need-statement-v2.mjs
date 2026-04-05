import mysql from 'mysql2/promise';

const academyNeedStatement = `LuvOnPurpose Outreach Temple and Academy Society, Inc. addresses a fundamental crisis in American education: the systematic failure to prepare young people for economic self-determination in a rapidly evolving technological economy. Traditional schools produce graduates who can pass standardized tests but cannot build businesses, write code, leverage artificial intelligence, or enter skilled trades that command family-sustaining wages. The result is generations trapped in economic dependency while the wealth gap widens and technological disruption accelerates.

The consequences are devastating and measurable. In our target communities, youth unemployment exceeds 25% while six-figure technology positions go unfilled. High school graduates enter a workforce unprepared for entrepreneurship, unable to code, unfamiliar with AI tools that are reshaping every industry, and lacking the trade certifications that provide immediate career pathways. Meanwhile, apprenticeship programs struggle to find qualified candidates, and employers report critical skills gaps across every sector.

Our Academy offers a fundamentally different model: a comprehensive K-12 educational institution that integrates rigorous academics with practical skill development across four critical domains. First, our Divine STEM curriculum weaves cultural identity and ancestral wisdom into science, technology, engineering, and mathematics instruction—producing students who understand both the "how" and the "why" of innovation. Second, our Coding and AI Technology Lab provides hands-on training in software development, machine learning, automation, and emerging technologies—students graduate not just understanding technology but building it. Third, our Skilled Trades Certification programs in electrical, plumbing, HVAC, construction management, and healthcare technology prepare students for careers that cannot be outsourced and command premium wages. Fourth, our Business Simulator Suite—including business planning, financial literacy, grant writing, and operations management—ensures every graduate understands how to create and capture economic value.

What distinguishes our Academy is the complete ecosystem we provide. Students don't just learn about technology—they build AI applications, develop software solutions, and create automation tools through our proprietary simulators. They don't just study trades—they earn industry-recognized certifications while still in school. They don't just read about business—they operate simulated enterprises making real decisions with real consequences. And critically, they don't graduate into uncertainty—our apprenticeship partnership pipeline connects graduates directly with employers, unions, technology companies, and training programs that provide immediate career pathways.

Our funding request of $3,000,000 to $7,500,000 reflects the true cost of building transformational educational infrastructure for the 21st century. We will allocate approximately 40% to staffing (certified teachers, technology instructors, trade professionals, business coaches, coding bootcamp facilitators, AI specialists, counselors, and apprenticeship coordinators—a team of 35-50 professionals). We will allocate 30% to facilities and technology infrastructure (classroom technology, coding labs, AI development environments, trade workshop equipment, simulation platforms, and maker spaces). We will allocate 20% to program development (curriculum creation, certification partnerships, apprenticeship contracts, employer relationships, and technology licensing). We will allocate 10% to operations, student support services, and scaling infrastructure.

Our pilot programs demonstrate extraordinary results: 94% of students completing trade certification tracks pass industry exams on first attempt; 89% of coding program graduates secure technology positions or continue to advanced training; students in our business simulator program demonstrate 340% higher financial literacy scores than peers; 87% of graduates secure employment or apprenticeship placement within 90 days. Within 36 months of full funding, we project serving 750 K-12 students, graduating 200 students annually with trade certifications, producing 150 graduates with coding and AI competencies, placing 175 graduates into apprenticeship programs, launching 75 student-founded technology ventures, and establishing partnerships with 40 employers, trade organizations, and technology companies. This is not education—this is economic infrastructure for generational transformation in the age of artificial intelligence.`;

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
      `SELECT entityName, LENGTH(fundingPurpose) as char_count, LEFT(fundingPurpose, 300) as preview FROM business_plans WHERE entityName LIKE '%Academy%' OR entityName LIKE '%508%' OR entityName LIKE '%Outreach%'`
    );
    
    console.log('Updated entities:', rows);
    
  } finally {
    await connection.end();
  }
}

updateAcademyNeedStatement().catch(console.error);
