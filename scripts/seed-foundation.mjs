import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

async function seedFoundationData() {
  const connection = await mysql.createConnection(DATABASE_URL);
  
  console.log('Seeding Foundation Layer data...');
  
  try {
    // Seed Requests
    const requests = [
      {
        category: 'equipment',
        itemSpec: 'Dell Latitude 5540 Laptop for Program Director',
        quantity: 2,
        costEstimate: 2400.00,
        justification: 'Program expansion requires additional computing resources for new staff',
        status: 'pending_manager'
      },
      {
        category: 'equipment',
        itemSpec: 'Office supplies bundle (paper, pens, folders, binders)',
        quantity: 10,
        costEstimate: 350.00,
        justification: 'Monthly office supply replenishment for Academy operations',
        status: 'approved'
      },
      {
        category: 'service',
        itemSpec: 'Annual cybersecurity audit and penetration testing',
        quantity: 1,
        costEstimate: 8500.00,
        justification: 'Required for compliance with data protection standards',
        status: 'pending_finance'
      },
      {
        category: 'vehicle',
        itemSpec: '2024 Ford Transit Connect for community outreach',
        quantity: 1,
        costEstimate: 32000.00,
        justification: 'Mobile education unit for underserved communities',
        status: 'pending_executive'
      },
      {
        category: 'equipment',
        itemSpec: 'Conference room AV system upgrade',
        quantity: 1,
        costEstimate: 4500.00,
        justification: 'Current system outdated, needed for virtual board meetings',
        status: 'rejected'
      }
    ];
    
    for (const req of requests) {
      await connection.execute(
        `INSERT INTO requests (requesterId, category, itemSpec, quantity, costEstimate, justification, status, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [1, req.category, req.itemSpec, req.quantity, req.costEstimate, req.justification, req.status]
      );
    }
    console.log('✓ Seeded 5 requests');
    
    // Seed Assets (using correct column names from schema)
    const assets = [
      {
        assetType: 'vehicle',
        makeModel: '2022 Toyota Highlander',
        serialOrVin: '5TDKK4GC3NS123456',
        purchaseDate: '2022-03-15',
        purchasePrice: 42500.00,
        ownerEntity: 'trust',
        status: 'assigned'
      },
      {
        assetType: 'laptop',
        makeModel: 'Apple MacBook Pro 16"',
        serialOrVin: 'C02ZX1234567',
        purchaseDate: '2023-06-01',
        purchasePrice: 2499.00,
        ownerEntity: 'academy',
        status: 'assigned'
      },
      {
        assetType: 'other',
        makeModel: 'HP LaserJet Pro MFP M428fdw',
        serialOrVin: 'VNB3K12345',
        purchaseDate: '2023-01-10',
        purchasePrice: 449.00,
        ownerEntity: 'academy',
        status: 'in_stock'
      },
      {
        assetType: 'furniture',
        makeModel: 'Herman Miller Aeron Chair',
        serialOrVin: 'AE123456789',
        purchaseDate: '2021-08-20',
        purchasePrice: 1395.00,
        ownerEntity: 'business',
        status: 'assigned'
      },
      {
        assetType: 'vehicle',
        makeModel: '2020 Ford E-350 Van',
        serialOrVin: '1FDWE3F69LDA12345',
        purchaseDate: '2020-05-01',
        purchasePrice: 38000.00,
        ownerEntity: 'business',
        status: 'maintenance'
      }
    ];
    
    for (const asset of assets) {
      await connection.execute(
        `INSERT INTO assets (assetType, makeModel, serialOrVin, purchaseDate, purchasePrice, ownerEntity, assetStatus, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [asset.assetType, asset.makeModel, asset.serialOrVin, asset.purchaseDate, asset.purchasePrice, asset.ownerEntity, asset.status]
      );
    }
    console.log('✓ Seeded 5 assets');
    
    // Seed Risks
    const risks = [
      {
        title: 'Data Breach Risk',
        description: 'Potential unauthorized access to student and family personal information stored in the system',
        category: 'security',
        likelihood: 'likely',
        impact: 'catastrophic',
        riskScore: 15,
        mitigationStrategy: 'Implement multi-factor authentication, encrypt all PII at rest and in transit, conduct quarterly security audits',
        mitigationStatus: 'in_progress',
        riskOwner: 'IT Director'
      },
      {
        title: 'Funding Gap Q3',
        description: 'Projected 15% shortfall in operational funding for Q3 due to delayed grant disbursements',
        category: 'financial',
        likelihood: 'likely',
        impact: 'major',
        riskScore: 16,
        mitigationStrategy: 'Diversify funding sources, establish 3-month operating reserve, negotiate payment terms with vendors',
        mitigationStatus: 'monitoring',
        riskOwner: 'CFO'
      },
      {
        title: 'Key Staff Turnover',
        description: 'Risk of losing critical program staff due to competitive market conditions',
        category: 'operational',
        likelihood: 'possible',
        impact: 'moderate',
        riskScore: 9,
        mitigationStrategy: 'Implement retention bonuses, improve benefits package, create succession planning',
        mitigationStatus: 'in_progress',
        riskOwner: 'HR Director'
      },
      {
        title: 'Regulatory Compliance Gap',
        description: 'New state education regulations may require curriculum modifications',
        category: 'compliance',
        likelihood: 'unlikely',
        impact: 'major',
        riskScore: 8,
        mitigationStrategy: 'Engage legal counsel for regulatory review, establish compliance monitoring process',
        mitigationStatus: 'not_started',
        riskOwner: 'Compliance Officer'
      },
      {
        title: 'Technology Infrastructure Failure',
        description: 'Aging server infrastructure poses risk of system downtime affecting online learning',
        category: 'technology',
        likelihood: 'possible',
        impact: 'major',
        riskScore: 12,
        mitigationStrategy: 'Migrate to cloud infrastructure, implement redundancy, establish disaster recovery plan',
        mitigationStatus: 'in_progress',
        riskOwner: 'IT Director'
      }
    ];
    
    for (const risk of risks) {
      await connection.execute(
        `INSERT INTO risks (title, description, riskCategory, likelihood, impact, riskScore, mitigationStrategy, mitigationStatus, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [risk.title, risk.description, risk.category, risk.likelihood, risk.impact, risk.riskScore, risk.mitigationStrategy, risk.mitigationStatus]
      );
    }
    console.log('✓ Seeded 5 risks');
    
    // Seed Incidents
    const incidents = [
      {
        title: 'Phishing Email Attempt',
        description: 'Staff member received sophisticated phishing email impersonating executive director',
        incidentType: 'security_breach',
        severity: 'medium',
        status: 'resolved',
        rootCause: 'External threat actor targeting nonprofit organizations',
        resolution: 'Email blocked, staff training conducted, additional email filters implemented'
      },
      {
        title: 'Server Room Temperature Alert',
        description: 'Temperature in server room exceeded safe threshold',
        incidentType: 'system_outage',
        severity: 'low',
        status: 'resolved',
        rootCause: 'HVAC unit compressor failure due to age',
        resolution: 'Unit replaced with new energy-efficient model'
      },
      {
        title: 'Grant Reporting Delay',
        description: 'Q2 grant report submitted 3 days past deadline due to data collection issues',
        incidentType: 'compliance_violation',
        severity: 'medium',
        status: 'resolved',
        rootCause: 'Manual data collection process caused delays',
        resolution: 'Implemented automated data collection, funder notified and accepted late submission'
      },
      {
        title: 'Website Downtime',
        description: 'Public website unavailable for 4 hours during peak enrollment period',
        incidentType: 'system_outage',
        severity: 'high',
        status: 'investigating',
        rootCause: null,
        resolution: null
      }
    ];
    
    for (const incident of incidents) {
      await connection.execute(
        `INSERT INTO incidents (title, description, incidentType, incidentSeverity, incidentStatus, reportedById, rootCause, resolution, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [incident.title, incident.description, incident.incidentType, incident.severity, incident.status, 1, incident.rootCause, incident.resolution]
      );
    }
    console.log('✓ Seeded 4 incidents');
    
    // Seed Metrics
    const now = new Date();
    const startOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    const endOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0);
    
    const metrics = [
      {
        name: 'Student Enrollment',
        description: 'Total students enrolled in Academy programs',
        category: 'program',
        targetValue: '500',
        actualValue: '423',
        unit: 'students',
        periodStart: startOfQuarter,
        periodEnd: endOfQuarter,
        status: 'on_track'
      },
      {
        name: 'Course Completion Rate',
        description: 'Percentage of enrolled students completing their courses',
        category: 'program',
        targetValue: '85',
        actualValue: '78',
        unit: '%',
        periodStart: startOfQuarter,
        periodEnd: endOfQuarter,
        status: 'at_risk'
      },
      {
        name: 'Grant Funding Secured',
        description: 'Total grant funding secured for fiscal year',
        category: 'financial',
        targetValue: '750000',
        actualValue: '625000',
        unit: 'USD',
        periodStart: startOfQuarter,
        periodEnd: endOfQuarter,
        status: 'on_track'
      },
      {
        name: 'Community Outreach Events',
        description: 'Number of community engagement events held',
        category: 'operational',
        targetValue: '24',
        actualValue: '18',
        unit: 'events',
        periodStart: startOfQuarter,
        periodEnd: endOfQuarter,
        status: 'on_track'
      },
      {
        name: 'Staff Training Hours',
        description: 'Total professional development hours completed by staff',
        category: 'operational',
        targetValue: '200',
        actualValue: '145',
        unit: 'hours',
        periodStart: startOfQuarter,
        periodEnd: endOfQuarter,
        status: 'at_risk'
      },
      {
        name: 'Certificate Issuance',
        description: 'Number of mastery certificates issued',
        category: 'program',
        targetValue: '150',
        actualValue: '167',
        unit: 'certificates',
        periodStart: startOfQuarter,
        periodEnd: endOfQuarter,
        status: 'achieved'
      },
      {
        name: 'System Uptime',
        description: 'Platform availability percentage',
        category: 'operational',
        targetValue: '99.5',
        actualValue: '99.2',
        unit: '%',
        periodStart: startOfQuarter,
        periodEnd: endOfQuarter,
        status: 'on_track'
      },
      {
        name: 'Donor Retention Rate',
        description: 'Percentage of donors who gave again this year',
        category: 'financial',
        targetValue: '70',
        actualValue: '72',
        unit: '%',
        periodStart: startOfQuarter,
        periodEnd: endOfQuarter,
        status: 'achieved'
      }
    ];
    
    for (const metric of metrics) {
      await connection.execute(
        `INSERT INTO metrics (name, description, metricCategory, targetValue, actualValue, unit, periodStart, periodEnd, metricStatus, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [metric.name, metric.description, metric.category, metric.targetValue, metric.actualValue, metric.unit, metric.periodStart, metric.periodEnd, metric.status]
      );
    }
    console.log('✓ Seeded 8 metrics');
    
    console.log('\n✅ Foundation Layer data seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

seedFoundationData().catch(console.error);
