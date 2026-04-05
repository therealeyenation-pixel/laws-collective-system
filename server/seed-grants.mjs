import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

async function seedGrants() {
  const url = new URL(DATABASE_URL);
  
  const connection = await mysql.createConnection({
    host: url.hostname,
    port: parseInt(url.port) || 4000,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    ssl: { rejectUnauthorized: true }
  });

  try {
    // Insert WomensNet Amber Grant opportunity
    const [amberResult] = await connection.execute(`
      INSERT INTO grant_opportunities 
      (funder_name, grant_name, description, funding_amount_min, funding_amount_max, deadline, application_url, eligibility_requirements, focus_areas, grant_type, status, priority, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      'WomensNet',
      'Amber Grant for Women',
      'Monthly $10,000 grants to women-owned businesses. Winners eligible for $50,000 year-end grant. $15 application fee.',
      10000.00,
      50000.00,
      '2026-01-31',
      'https://ambergrantsforwomen.com/get-an-amber-grant/apply-now/',
      'Open to women (18+) who own at least 50% of a business in US or Canada. Pre-revenue startups and established businesses eligible.',
      'Women-Owned Business, Small Business, Entrepreneurship',
      'foundation',
      'applied',
      'high',
      'Applied Jan 19, 2026. Receipt #1532-9613. $15 fee paid via VISA-7274.'
    ]);
    console.log('Inserted Amber Grant opportunity, ID:', amberResult.insertId);
    const amberOpportunityId = amberResult.insertId;

    // Insert Freed Fellowship Grant opportunity
    const [freedResult] = await connection.execute(`
      INSERT INTO grant_opportunities 
      (funder_name, grant_name, description, funding_amount_min, funding_amount_max, deadline, application_url, eligibility_requirements, focus_areas, grant_type, status, priority, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      'Freed Fellowship',
      'Freed Fellowship Grant',
      'Monthly $500 grants for US small business owners. No strings attached. Includes feedback, mentoring, and eligibility for $2,500 year-end grant. $19 application fee.',
      500.00,
      2500.00,
      '2026-01-31',
      'https://freedfellowship.com/',
      'US-based small business owners. No LLC or EIN required. Targets underrepresented founders.',
      'Small Business, Underrepresented Founders, Entrepreneurship',
      'foundation',
      'applied',
      'high',
      'Applied Jan 19, 2026. Receipt #1168-6343. $19 fee paid via VISA-7274.'
    ]);
    console.log('Inserted Freed Fellowship opportunity, ID:', freedResult.insertId);
    const freedOpportunityId = freedResult.insertId;

    // Insert Amber Grant application
    const [amberAppResult] = await connection.execute(`
      INSERT INTO grant_applications 
      (opportunity_id, application_name, status, submitted_date, requested_amount, project_title, project_description, submission_method, confirmation_number, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      amberOpportunityId,
      'L.A.W.S. Collective - Amber Grant Application',
      'submitted',
      '2026-01-19',
      10000.00,
      'L.A.W.S. Collective Multi-Generational Wealth Building',
      'The L.A.W.S. Collective is a family enterprise helping individuals and families create lasting prosperity through education, business development, and community support.',
      'online',
      '1532-9613',
      'Application fee: $15 paid via VISA-7274 on Jan 19, 2026'
    ]);
    console.log('Inserted Amber Grant application, ID:', amberAppResult.insertId);

    // Insert Freed Fellowship application
    const [freedAppResult] = await connection.execute(`
      INSERT INTO grant_applications 
      (opportunity_id, application_name, status, submitted_date, requested_amount, project_title, project_description, submission_method, confirmation_number, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      freedOpportunityId,
      'L.A.W.S. Collective - Freed Fellowship Application',
      'submitted',
      '2026-01-19',
      500.00,
      'L.A.W.S. Collective Business Development',
      'The L.A.W.S. Collective is a family enterprise focused on multi-generational wealth building through education, business development, and community support.',
      'online',
      '1168-6343',
      'Application fee: $19 paid via VISA-7274 on Jan 19, 2026'
    ]);
    console.log('Inserted Freed Fellowship application, ID:', freedAppResult.insertId);

    console.log('\n✅ Successfully added both grant opportunities and applications!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

seedGrants();
