import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

async function seedDepartmentOnboarding() {
  const connection = await mysql.createConnection(DATABASE_URL);
  
  try {
    console.log('Creating department-specific onboarding checklists...');
    
    // ============================================
    // FINANCE DEPARTMENT CHECKLIST
    // ============================================
    const [financeResult] = await connection.execute(
      `INSERT INTO onboarding_checklists (name, description, department, positionLevel, isDefault) VALUES (?, ?, ?, ?, ?)`,
      [
        'Finance Department Onboarding',
        'Specialized onboarding for Finance team members covering financial systems, compliance, and grant management.',
        'Finance',
        'coordinator',
        false
      ]
    );
    const financeChecklistId = financeResult.insertId;
    console.log(`Created Finance checklist with ID: ${financeChecklistId}`);
    
    const financeItems = [
      // Financial Systems Access
      { title: 'QuickBooks/Accounting Software Training', description: 'Complete training on primary accounting software', category: 'training', dueWithinDays: 7, assignedTo: 'manager', isRequired: true, sortOrder: 1 },
      { title: 'Grant Management System Access', description: 'Set up access to grant tracking and reporting systems', category: 'access', dueWithinDays: 3, assignedTo: 'it', isRequired: true, sortOrder: 2 },
      { title: 'Banking Portal Access', description: 'Configure access to organizational banking platforms', category: 'access', dueWithinDays: 5, assignedTo: 'manager', isRequired: true, sortOrder: 3 },
      { title: 'Expense Reporting System Training', description: 'Learn expense submission and approval workflows', category: 'training', dueWithinDays: 5, assignedTo: 'hr', isRequired: true, sortOrder: 4 },
      
      // Compliance & Procedures
      { title: 'Review Financial Policies SOP', description: 'Read and acknowledge SOP-FIN-001 Financial Policies', category: 'compliance', dueWithinDays: 3, assignedTo: 'employee', isRequired: true, sortOrder: 5 },
      { title: 'Review Grant Compliance SOP', description: 'Read and acknowledge SOP-FIN-002 Grant Compliance', category: 'compliance', dueWithinDays: 3, assignedTo: 'employee', isRequired: true, sortOrder: 6 },
      { title: 'GAAP/FASB Standards Overview', description: 'Review applicable accounting standards', category: 'training', dueWithinDays: 14, assignedTo: 'manager', isRequired: true, sortOrder: 7 },
      { title: 'Internal Controls Training', description: 'Understand segregation of duties and approval workflows', category: 'compliance', dueWithinDays: 7, assignedTo: 'manager', isRequired: true, sortOrder: 8 },
      
      // Entity-Specific Knowledge
      { title: 'Multi-Entity Structure Overview', description: 'Understand the 5 business entities and their financial relationships', category: 'training', dueWithinDays: 5, assignedTo: 'manager', isRequired: true, sortOrder: 9 },
      { title: 'Trust Allocation Procedures', description: 'Learn the 40/30/20/10 allocation model', category: 'training', dueWithinDays: 7, assignedTo: 'manager', isRequired: true, sortOrder: 10 },
      { title: '508(c)(1)(a) Nonprofit Compliance', description: 'Understand nonprofit financial requirements for Academy entity', category: 'compliance', dueWithinDays: 14, assignedTo: 'manager', isRequired: true, sortOrder: 11 },
      
      // Reporting & Documentation
      { title: 'Monthly Close Process Training', description: 'Learn month-end closing procedures', category: 'training', dueWithinDays: 14, assignedTo: 'manager', isRequired: true, sortOrder: 12 },
      { title: 'Financial Reporting Templates', description: 'Review standard financial report formats', category: 'documentation', dueWithinDays: 7, assignedTo: 'manager', isRequired: false, sortOrder: 13 },
      { title: 'Audit Preparation Procedures', description: 'Understand documentation requirements for audits', category: 'compliance', dueWithinDays: 21, assignedTo: 'manager', isRequired: true, sortOrder: 14 },
    ];
    
    for (const item of financeItems) {
      await connection.execute(
        `INSERT INTO onboarding_checklist_items 
         (checklistId, title, description, category, dueWithinDays, assignedTo, isRequired, sortOrder) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [financeChecklistId, item.title, item.description, item.category, item.dueWithinDays, item.assignedTo, item.isRequired, item.sortOrder]
      );
    }
    console.log(`Added ${financeItems.length} Finance checklist items`);
    
    // ============================================
    // EDUCATION DEPARTMENT CHECKLIST
    // ============================================
    const [educationResult] = await connection.execute(
      `INSERT INTO onboarding_checklists (name, description, department, positionLevel, isDefault) VALUES (?, ?, ?, ?, ?)`,
      [
        'Education Department Onboarding',
        'Specialized onboarding for Education team members covering curriculum, LMS, and student management.',
        'Education',
        'coordinator',
        false
      ]
    );
    const educationChecklistId = educationResult.insertId;
    console.log(`Created Education checklist with ID: ${educationChecklistId}`);
    
    const educationItems = [
      // Learning Management Systems
      { title: 'LMS Administrator Training', description: 'Complete training on learning management system administration', category: 'training', dueWithinDays: 7, assignedTo: 'manager', isRequired: true, sortOrder: 1 },
      { title: 'Course Creation Tools Training', description: 'Learn to create and manage course content', category: 'training', dueWithinDays: 10, assignedTo: 'manager', isRequired: true, sortOrder: 2 },
      { title: 'Student Portal Access Setup', description: 'Configure access to student management systems', category: 'access', dueWithinDays: 3, assignedTo: 'it', isRequired: true, sortOrder: 3 },
      { title: 'Assessment Tools Training', description: 'Learn quiz, test, and certification creation', category: 'training', dueWithinDays: 14, assignedTo: 'manager', isRequired: true, sortOrder: 4 },
      
      // Curriculum & Content
      { title: 'Review Divine STEM Curriculum Framework', description: 'Understand the 7 pillars of Divine STEM education', category: 'training', dueWithinDays: 7, assignedTo: 'manager', isRequired: true, sortOrder: 5 },
      { title: 'House of Many Tongues Overview', description: 'Learn the language learning program structure', category: 'training', dueWithinDays: 10, assignedTo: 'manager', isRequired: false, sortOrder: 6 },
      { title: 'Three Learning Houses Structure', description: 'Understand Wonder (K-5), Form (6-8), Mastery (9-12) frameworks', category: 'training', dueWithinDays: 7, assignedTo: 'manager', isRequired: true, sortOrder: 7 },
      { title: 'Content Accessibility Standards', description: 'Review ADA compliance for educational content', category: 'compliance', dueWithinDays: 14, assignedTo: 'employee', isRequired: true, sortOrder: 8 },
      
      // Student Support
      { title: 'Student Progress Tracking Training', description: 'Learn to monitor and report student progress', category: 'training', dueWithinDays: 10, assignedTo: 'manager', isRequired: true, sortOrder: 9 },
      { title: 'Mastery Scrolls Certification Process', description: 'Understand blockchain certificate issuance', category: 'training', dueWithinDays: 14, assignedTo: 'manager', isRequired: true, sortOrder: 10 },
      { title: 'Parent/Guardian Communication Protocols', description: 'Learn family engagement procedures', category: 'training', dueWithinDays: 7, assignedTo: 'manager', isRequired: true, sortOrder: 11 },
      
      // Compliance & Procedures
      { title: 'Review Education Department SOPs', description: 'Read and acknowledge SOP-EDU-001 and SOP-EDU-002', category: 'compliance', dueWithinDays: 5, assignedTo: 'employee', isRequired: true, sortOrder: 12 },
      { title: 'FERPA Compliance Training', description: 'Complete student privacy protection training', category: 'compliance', dueWithinDays: 7, assignedTo: 'employee', isRequired: true, sortOrder: 13 },
      { title: 'Child Safety Protocols', description: 'Review child protection and safety procedures', category: 'compliance', dueWithinDays: 3, assignedTo: 'hr', isRequired: true, sortOrder: 14 },
    ];
    
    for (const item of educationItems) {
      await connection.execute(
        `INSERT INTO onboarding_checklist_items 
         (checklistId, title, description, category, dueWithinDays, assignedTo, isRequired, sortOrder) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [educationChecklistId, item.title, item.description, item.category, item.dueWithinDays, item.assignedTo, item.isRequired, item.sortOrder]
      );
    }
    console.log(`Added ${educationItems.length} Education checklist items`);
    
    // ============================================
    // TECHNOLOGY DEPARTMENT CHECKLIST
    // ============================================
    const [techResult] = await connection.execute(
      `INSERT INTO onboarding_checklists (name, description, department, positionLevel, isDefault) VALUES (?, ?, ?, ?, ?)`,
      [
        'Technology Department Onboarding',
        'Specialized onboarding for Technology team members covering development tools, security, and platform administration.',
        'Technology',
        'coordinator',
        false
      ]
    );
    const techChecklistId = techResult.insertId;
    console.log(`Created Technology checklist with ID: ${techChecklistId}`);
    
    const techItems = [
      // Development Environment
      { title: 'Development Environment Setup', description: 'Configure local development environment (IDE, tools, dependencies)', category: 'equipment', dueWithinDays: 2, assignedTo: 'it', isRequired: true, sortOrder: 1 },
      { title: 'GitHub/Version Control Access', description: 'Set up repository access and SSH keys', category: 'access', dueWithinDays: 1, assignedTo: 'it', isRequired: true, sortOrder: 2 },
      { title: 'CI/CD Pipeline Training', description: 'Learn deployment and testing workflows', category: 'training', dueWithinDays: 7, assignedTo: 'manager', isRequired: true, sortOrder: 3 },
      { title: 'Database Access Setup', description: 'Configure database credentials and access', category: 'access', dueWithinDays: 3, assignedTo: 'it', isRequired: true, sortOrder: 4 },
      
      // Security & Compliance
      { title: 'Security Best Practices Training', description: 'Complete secure coding and data protection training', category: 'compliance', dueWithinDays: 5, assignedTo: 'employee', isRequired: true, sortOrder: 5 },
      { title: 'Review Technology SOPs', description: 'Read and acknowledge SOP-TECH-001 and SOP-TECH-002', category: 'compliance', dueWithinDays: 3, assignedTo: 'employee', isRequired: true, sortOrder: 6 },
      { title: 'API Security Standards', description: 'Review API authentication and authorization patterns', category: 'training', dueWithinDays: 7, assignedTo: 'manager', isRequired: true, sortOrder: 7 },
      { title: 'Incident Response Procedures', description: 'Learn security incident handling protocols', category: 'compliance', dueWithinDays: 10, assignedTo: 'manager', isRequired: true, sortOrder: 8 },
      
      // Platform Knowledge
      { title: 'System Architecture Overview', description: 'Understand the LuvOnPurpose platform architecture', category: 'training', dueWithinDays: 5, assignedTo: 'manager', isRequired: true, sortOrder: 9 },
      { title: 'Autonomous Engine Documentation', description: 'Review autonomous business operation system', category: 'training', dueWithinDays: 10, assignedTo: 'manager', isRequired: true, sortOrder: 10 },
      { title: 'Token Economy Integration', description: 'Understand cryptocurrency and token systems', category: 'training', dueWithinDays: 14, assignedTo: 'manager', isRequired: false, sortOrder: 11 },
      { title: 'Blockchain/LuvLedger Training', description: 'Learn blockchain logging and verification', category: 'training', dueWithinDays: 14, assignedTo: 'manager', isRequired: true, sortOrder: 12 },
      
      // Operations
      { title: 'Monitoring & Alerting Setup', description: 'Configure access to system monitoring tools', category: 'access', dueWithinDays: 5, assignedTo: 'it', isRequired: true, sortOrder: 13 },
      { title: 'On-Call Procedures', description: 'Review escalation and on-call rotation', category: 'training', dueWithinDays: 14, assignedTo: 'manager', isRequired: false, sortOrder: 14 },
    ];
    
    for (const item of techItems) {
      await connection.execute(
        `INSERT INTO onboarding_checklist_items 
         (checklistId, title, description, category, dueWithinDays, assignedTo, isRequired, sortOrder) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [techChecklistId, item.title, item.description, item.category, item.dueWithinDays, item.assignedTo, item.isRequired, item.sortOrder]
      );
    }
    console.log(`Added ${techItems.length} Technology checklist items`);
    
    // ============================================
    // LEGAL/CONTRACTS DEPARTMENT CHECKLIST
    // ============================================
    const [legalResult] = await connection.execute(
      `INSERT INTO onboarding_checklists (name, description, department, positionLevel, isDefault) VALUES (?, ?, ?, ?, ?)`,
      [
        'Legal & Contracts Department Onboarding',
        'Specialized onboarding for Legal team members covering contract management, compliance, and entity governance.',
        'Legal',
        'coordinator',
        false
      ]
    );
    const legalChecklistId = legalResult.insertId;
    console.log(`Created Legal checklist with ID: ${legalChecklistId}`);
    
    const legalItems = [
      // Contract Management
      { title: 'Contract Management System Training', description: 'Learn to use contract lifecycle management tools', category: 'training', dueWithinDays: 7, assignedTo: 'manager', isRequired: true, sortOrder: 1 },
      { title: 'Document Management Access', description: 'Set up access to legal document repository', category: 'access', dueWithinDays: 3, assignedTo: 'it', isRequired: true, sortOrder: 2 },
      { title: 'Contract Template Library Review', description: 'Review standard contract templates', category: 'training', dueWithinDays: 10, assignedTo: 'manager', isRequired: true, sortOrder: 3 },
      { title: 'E-Signature Platform Training', description: 'Learn DocuSign/electronic signature workflows', category: 'training', dueWithinDays: 5, assignedTo: 'manager', isRequired: true, sortOrder: 4 },
      
      // Entity Structure
      { title: 'Multi-Entity Legal Structure', description: 'Understand Trust and subsidiary entity relationships', category: 'training', dueWithinDays: 7, assignedTo: 'manager', isRequired: true, sortOrder: 5 },
      { title: 'Trust Governance Procedures', description: 'Review Trust authority and decision-making protocols', category: 'training', dueWithinDays: 10, assignedTo: 'manager', isRequired: true, sortOrder: 6 },
      { title: '508(c)(1)(a) Nonprofit Requirements', description: 'Understand nonprofit compliance for Academy entity', category: 'compliance', dueWithinDays: 14, assignedTo: 'manager', isRequired: true, sortOrder: 7 },
      { title: 'LLC Operating Agreement Review', description: 'Review operating agreements for each LLC entity', category: 'training', dueWithinDays: 14, assignedTo: 'manager', isRequired: true, sortOrder: 8 },
      
      // Compliance
      { title: 'Review Legal Department SOPs', description: 'Read and acknowledge SOP-LEG-001 and SOP-LEG-002', category: 'compliance', dueWithinDays: 5, assignedTo: 'employee', isRequired: true, sortOrder: 9 },
      { title: 'Conflict of Interest Policy', description: 'Review and sign conflict of interest disclosure', category: 'compliance', dueWithinDays: 3, assignedTo: 'employee', isRequired: true, sortOrder: 10 },
      { title: 'Attorney-Client Privilege Training', description: 'Understand privilege and confidentiality requirements', category: 'compliance', dueWithinDays: 7, assignedTo: 'manager', isRequired: true, sortOrder: 11 },
      { title: 'Regulatory Compliance Overview', description: 'Review applicable federal and state regulations', category: 'training', dueWithinDays: 21, assignedTo: 'manager', isRequired: true, sortOrder: 12 },
      
      // Risk Management
      { title: 'Risk Assessment Procedures', description: 'Learn contract and legal risk evaluation', category: 'training', dueWithinDays: 14, assignedTo: 'manager', isRequired: true, sortOrder: 13 },
      { title: 'Insurance Coverage Review', description: 'Understand organizational insurance policies', category: 'training', dueWithinDays: 21, assignedTo: 'manager', isRequired: false, sortOrder: 14 },
    ];
    
    for (const item of legalItems) {
      await connection.execute(
        `INSERT INTO onboarding_checklist_items 
         (checklistId, title, description, category, dueWithinDays, assignedTo, isRequired, sortOrder) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [legalChecklistId, item.title, item.description, item.category, item.dueWithinDays, item.assignedTo, item.isRequired, item.sortOrder]
      );
    }
    console.log(`Added ${legalItems.length} Legal checklist items`);
    
    // ============================================
    // DESIGN & MEDIA DEPARTMENT CHECKLIST
    // ============================================
    const [designResult] = await connection.execute(
      `INSERT INTO onboarding_checklists (name, description, department, positionLevel, isDefault) VALUES (?, ?, ?, ?, ?)`,
      [
        'Design & Media Department Onboarding',
        'Specialized onboarding for Design and Media team members covering creative tools, brand guidelines, and content production.',
        'Design',
        'coordinator',
        false
      ]
    );
    const designChecklistId = designResult.insertId;
    console.log(`Created Design & Media checklist with ID: ${designChecklistId}`);
    
    const designItems = [
      // Creative Tools
      { title: 'Adobe Creative Suite Access', description: 'Set up Photoshop, Illustrator, Premiere, After Effects', category: 'access', dueWithinDays: 2, assignedTo: 'it', isRequired: true, sortOrder: 1 },
      { title: 'Figma/Design Tool Access', description: 'Configure collaborative design tool access', category: 'access', dueWithinDays: 2, assignedTo: 'it', isRequired: true, sortOrder: 2 },
      { title: 'Digital Asset Management Training', description: 'Learn to use asset library and file organization', category: 'training', dueWithinDays: 5, assignedTo: 'manager', isRequired: true, sortOrder: 3 },
      { title: 'Video Editing Platform Training', description: 'Complete video production tool training', category: 'training', dueWithinDays: 10, assignedTo: 'manager', isRequired: false, sortOrder: 4 },
      
      // Brand & Guidelines
      { title: 'Brand Guidelines Review', description: 'Study LuvOnPurpose brand identity and standards', category: 'training', dueWithinDays: 3, assignedTo: 'manager', isRequired: true, sortOrder: 5 },
      { title: 'Entity-Specific Branding', description: 'Learn branding for each of the 5 entities', category: 'training', dueWithinDays: 7, assignedTo: 'manager', isRequired: true, sortOrder: 6 },
      { title: 'L.A.W.S. Framework Visual Language', description: 'Understand Land, Air, Water, Self visual representations', category: 'training', dueWithinDays: 7, assignedTo: 'manager', isRequired: true, sortOrder: 7 },
      { title: 'Template Library Access', description: 'Review and access design templates', category: 'access', dueWithinDays: 5, assignedTo: 'manager', isRequired: true, sortOrder: 8 },
      
      // Content Production
      { title: 'Content Calendar System', description: 'Learn content planning and scheduling tools', category: 'training', dueWithinDays: 7, assignedTo: 'manager', isRequired: true, sortOrder: 9 },
      { title: 'Social Media Platform Access', description: 'Set up access to social media management tools', category: 'access', dueWithinDays: 3, assignedTo: 'it', isRequired: true, sortOrder: 10 },
      { title: 'Review Design/Media SOPs', description: 'Read and acknowledge SOP-DES-001, SOP-DES-002, SOP-MED-001, SOP-MED-002', category: 'compliance', dueWithinDays: 5, assignedTo: 'employee', isRequired: true, sortOrder: 11 },
      { title: 'Copyright and Licensing Training', description: 'Understand intellectual property and usage rights', category: 'compliance', dueWithinDays: 10, assignedTo: 'manager', isRequired: true, sortOrder: 12 },
      
      // Collaboration
      { title: 'Creative Review Process', description: 'Learn approval workflows for creative assets', category: 'training', dueWithinDays: 7, assignedTo: 'manager', isRequired: true, sortOrder: 13 },
      { title: 'Stakeholder Communication', description: 'Understand feedback and revision processes', category: 'training', dueWithinDays: 10, assignedTo: 'manager', isRequired: false, sortOrder: 14 },
    ];
    
    for (const item of designItems) {
      await connection.execute(
        `INSERT INTO onboarding_checklist_items 
         (checklistId, title, description, category, dueWithinDays, assignedTo, isRequired, sortOrder) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [designChecklistId, item.title, item.description, item.category, item.dueWithinDays, item.assignedTo, item.isRequired, item.sortOrder]
      );
    }
    console.log(`Added ${designItems.length} Design & Media checklist items`);
    
    // ============================================
    // HR DEPARTMENT CHECKLIST
    // ============================================
    const [hrResult] = await connection.execute(
      `INSERT INTO onboarding_checklists (name, description, department, positionLevel, isDefault) VALUES (?, ?, ?, ?, ?)`,
      [
        'HR Department Onboarding',
        'Specialized onboarding for HR team members covering HRIS systems, compliance, and employee relations.',
        'Human Resources',
        'coordinator',
        false
      ]
    );
    const hrChecklistId = hrResult.insertId;
    console.log(`Created HR checklist with ID: ${hrChecklistId}`);
    
    const hrItems = [
      // HR Systems
      { title: 'HRIS System Training', description: 'Complete training on HR information system', category: 'training', dueWithinDays: 7, assignedTo: 'manager', isRequired: true, sortOrder: 1 },
      { title: 'Applicant Tracking System Access', description: 'Set up access to recruitment platform', category: 'access', dueWithinDays: 3, assignedTo: 'it', isRequired: true, sortOrder: 2 },
      { title: 'Payroll System Overview', description: 'Understand payroll processing workflows', category: 'training', dueWithinDays: 10, assignedTo: 'manager', isRequired: true, sortOrder: 3 },
      { title: 'Benefits Administration Training', description: 'Learn benefits enrollment and management', category: 'training', dueWithinDays: 14, assignedTo: 'manager', isRequired: true, sortOrder: 4 },
      
      // Compliance & Legal
      { title: 'Employment Law Fundamentals', description: 'Review federal and state employment regulations', category: 'compliance', dueWithinDays: 14, assignedTo: 'manager', isRequired: true, sortOrder: 5 },
      { title: 'Review HR Department SOPs', description: 'Read and acknowledge SOP-HR-001 and SOP-HR-002', category: 'compliance', dueWithinDays: 5, assignedTo: 'employee', isRequired: true, sortOrder: 6 },
      { title: 'EEO and Anti-Discrimination Training', description: 'Complete equal opportunity compliance training', category: 'compliance', dueWithinDays: 7, assignedTo: 'employee', isRequired: true, sortOrder: 7 },
      { title: 'I-9 Verification Training', description: 'Learn employment eligibility verification procedures', category: 'compliance', dueWithinDays: 5, assignedTo: 'manager', isRequired: true, sortOrder: 8 },
      
      // Employee Relations
      { title: 'Performance Management System', description: 'Learn performance review and feedback processes', category: 'training', dueWithinDays: 14, assignedTo: 'manager', isRequired: true, sortOrder: 9 },
      { title: 'Disciplinary Procedures', description: 'Understand progressive discipline and documentation', category: 'training', dueWithinDays: 10, assignedTo: 'manager', isRequired: true, sortOrder: 10 },
      { title: 'Conflict Resolution Training', description: 'Learn mediation and conflict management', category: 'training', dueWithinDays: 21, assignedTo: 'manager', isRequired: false, sortOrder: 11 },
      { title: 'Exit Interview Procedures', description: 'Understand offboarding and exit processes', category: 'training', dueWithinDays: 14, assignedTo: 'manager', isRequired: true, sortOrder: 12 },
      
      // Organizational Knowledge
      { title: 'Multi-Entity HR Structure', description: 'Understand HR across all 5 business entities', category: 'training', dueWithinDays: 7, assignedTo: 'manager', isRequired: true, sortOrder: 13 },
      { title: 'Hiring Process and Panel Requirements', description: 'Learn tiered interview and hiring procedures', category: 'training', dueWithinDays: 10, assignedTo: 'manager', isRequired: true, sortOrder: 14 },
    ];
    
    for (const item of hrItems) {
      await connection.execute(
        `INSERT INTO onboarding_checklist_items 
         (checklistId, title, description, category, dueWithinDays, assignedTo, isRequired, sortOrder) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [hrChecklistId, item.title, item.description, item.category, item.dueWithinDays, item.assignedTo, item.isRequired, item.sortOrder]
      );
    }
    console.log(`Added ${hrItems.length} HR checklist items`);
    
    console.log('\n=== Department Onboarding Checklists Summary ===');
    console.log(`Finance: ${financeItems.length} items`);
    console.log(`Education: ${educationItems.length} items`);
    console.log(`Technology: ${techItems.length} items`);
    console.log(`Legal: ${legalItems.length} items`);
    console.log(`Design & Media: ${designItems.length} items`);
    console.log(`HR: ${hrItems.length} items`);
    console.log(`Total: ${financeItems.length + educationItems.length + techItems.length + legalItems.length + designItems.length + hrItems.length} department-specific items`);
    console.log('\nDepartment onboarding checklist seeding complete!');
    
  } catch (error) {
    console.error('Error seeding department onboarding checklists:', error);
  } finally {
    await connection.end();
  }
}

seedDepartmentOnboarding();
