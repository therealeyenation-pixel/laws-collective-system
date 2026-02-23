import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

async function seedOnboardingChecklist() {
  const connection = await mysql.createConnection(DATABASE_URL);
  
  try {
    console.log('Creating default onboarding checklist...');
    
    // Create default checklist
    const [checklistResult] = await connection.execute(
      `INSERT INTO onboarding_checklists (name, description, isDefault) VALUES (?, ?, ?)`,
      [
        'Standard Employee Onboarding',
        'Default onboarding checklist for all new employees covering documentation, equipment, access, training, and introductions.',
        true
      ]
    );
    
    const checklistId = checklistResult.insertId;
    console.log(`Created checklist with ID: ${checklistId}`);
    
    // Define checklist items
    const items = [
      // Documentation (Day 1-3)
      { title: 'Complete I-9 Form', description: 'Verify employment eligibility', category: 'documentation', dueWithinDays: 3, assignedTo: 'hr', isRequired: true, sortOrder: 1 },
      { title: 'Complete W-4 Form', description: 'Federal tax withholding form', category: 'documentation', dueWithinDays: 3, assignedTo: 'hr', isRequired: true, sortOrder: 2 },
      { title: 'Sign Employee Handbook Acknowledgment', description: 'Review and acknowledge company policies', category: 'documentation', dueWithinDays: 3, assignedTo: 'employee', isRequired: true, sortOrder: 3 },
      { title: 'Complete Direct Deposit Form', description: 'Set up payroll direct deposit', category: 'documentation', dueWithinDays: 3, assignedTo: 'employee', isRequired: false, sortOrder: 4 },
      { title: 'Sign Confidentiality Agreement', description: 'Non-disclosure and confidentiality terms', category: 'compliance', dueWithinDays: 1, assignedTo: 'employee', isRequired: true, sortOrder: 5 },
      
      // Equipment (Day 1-5)
      { title: 'Laptop/Computer Setup', description: 'Provision and configure work computer', category: 'equipment', dueWithinDays: 1, assignedTo: 'it', isRequired: true, sortOrder: 6 },
      { title: 'Phone/Communication Setup', description: 'Set up work phone or communication tools', category: 'equipment', dueWithinDays: 3, assignedTo: 'it', isRequired: false, sortOrder: 7 },
      { title: 'Office Supplies', description: 'Provide necessary office supplies', category: 'equipment', dueWithinDays: 5, assignedTo: 'manager', isRequired: false, sortOrder: 8 },
      
      // Access (Day 1-3)
      { title: 'Create Email Account', description: 'Set up company email address', category: 'access', dueWithinDays: 1, assignedTo: 'it', isRequired: true, sortOrder: 9 },
      { title: 'System Access Setup', description: 'Grant access to required systems and tools', category: 'access', dueWithinDays: 2, assignedTo: 'it', isRequired: true, sortOrder: 10 },
      { title: 'Building/Security Access', description: 'Issue badge or access credentials', category: 'access', dueWithinDays: 1, assignedTo: 'hr', isRequired: false, sortOrder: 11 },
      { title: 'Add to Team Communication Channels', description: 'Add to Slack/Teams channels and email groups', category: 'access', dueWithinDays: 1, assignedTo: 'manager', isRequired: true, sortOrder: 12 },
      
      // Training (Day 1-14)
      { title: 'Company Overview Training', description: 'Introduction to company mission, values, and structure', category: 'training', dueWithinDays: 3, assignedTo: 'hr', isRequired: true, sortOrder: 13 },
      { title: 'Role-Specific Training', description: 'Training specific to job responsibilities', category: 'training', dueWithinDays: 14, assignedTo: 'manager', isRequired: true, sortOrder: 14 },
      { title: 'Security Awareness Training', description: 'Complete cybersecurity and data protection training', category: 'compliance', dueWithinDays: 7, assignedTo: 'employee', isRequired: true, sortOrder: 15 },
      { title: 'HR Policies Training', description: 'Review harassment prevention and workplace policies', category: 'compliance', dueWithinDays: 7, assignedTo: 'employee', isRequired: true, sortOrder: 16 },
      
      // Introductions (Day 1-7)
      { title: 'Meet Direct Manager', description: 'One-on-one meeting with direct supervisor', category: 'introduction', dueWithinDays: 1, assignedTo: 'manager', isRequired: true, sortOrder: 17 },
      { title: 'Team Introduction Meeting', description: 'Meet immediate team members', category: 'introduction', dueWithinDays: 3, assignedTo: 'manager', isRequired: true, sortOrder: 18 },
      { title: 'Department Tour', description: 'Introduction to department and key contacts', category: 'introduction', dueWithinDays: 5, assignedTo: 'manager', isRequired: false, sortOrder: 19 },
      { title: 'Buddy/Mentor Assignment', description: 'Assign a buddy or mentor for questions', category: 'introduction', dueWithinDays: 3, assignedTo: 'manager', isRequired: false, sortOrder: 20 },
      
      // Benefits (Day 1-30)
      { title: 'Benefits Enrollment', description: 'Complete health insurance and benefits enrollment', category: 'benefits', dueWithinDays: 30, assignedTo: 'employee', isRequired: false, sortOrder: 21 },
      { title: 'Retirement Plan Enrollment', description: 'Set up 401(k) or retirement contributions', category: 'benefits', dueWithinDays: 30, assignedTo: 'employee', isRequired: false, sortOrder: 22 },
      
      // Other (Day 7-30)
      { title: '30-Day Check-in', description: 'First month review with manager', category: 'other', dueWithinDays: 30, assignedTo: 'manager', isRequired: true, sortOrder: 23 },
      { title: 'Set Initial Goals', description: 'Establish first 90-day objectives', category: 'other', dueWithinDays: 14, assignedTo: 'manager', isRequired: true, sortOrder: 24 },
    ];
    
    // Insert all items
    for (const item of items) {
      await connection.execute(
        `INSERT INTO onboarding_checklist_items 
         (checklistId, title, description, category, dueWithinDays, assignedTo, isRequired, sortOrder) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [checklistId, item.title, item.description, item.category, item.dueWithinDays, item.assignedTo, item.isRequired, item.sortOrder]
      );
    }
    
    console.log(`Added ${items.length} checklist items`);
    console.log('Onboarding checklist seeding complete!');
    
  } catch (error) {
    console.error('Error seeding onboarding checklist:', error);
  } finally {
    await connection.end();
  }
}

seedOnboardingChecklist();
