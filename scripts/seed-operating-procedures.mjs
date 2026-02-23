/**
 * Seed Operating Procedures for All Departments
 * Based on LuvOnPurpose organizational structure and L.A.W.S. framework
 */

import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

const OPERATING_PROCEDURES = [
  // ============================================
  // EXECUTIVE/BUSINESS SOPs
  // ============================================
  {
    title: "Strategic Planning Process",
    department: "Executive",
    category: "sop",
    description: "Annual and quarterly strategic planning procedures for organizational direction and goal setting.",
    content: `## Purpose
Establish a consistent process for strategic planning across all LuvOnPurpose entities.

## Scope
Applies to Executive leadership and all Department Managers.

## Procedure
1. **Annual Planning (Q4)**
   - Review previous year performance against goals
   - Conduct SWOT analysis for each entity
   - Set organizational priorities for coming year
   - Allocate resources across departments

2. **Quarterly Reviews**
   - Review progress on annual goals
   - Adjust tactics as needed
   - Report to Trust governance

3. **Documentation**
   - All strategic plans documented in Project Controls
   - Progress tracked via milestones
   - Quarterly reports to stakeholders`,
    version: "1.0",
    status: "approved",
    createdBy: 1,
    effectiveDate: new Date().toISOString().split('T')[0]
  },
  {
    title: "Entity Governance Protocol",
    department: "Executive",
    category: "sop",
    description: "Procedures for maintaining proper governance across all five business entities.",
    content: `## Purpose
Ensure proper governance and compliance across all LuvOnPurpose entities under the Trust structure.

## Scope
All business entities: Trust, Holding LLC, L.A.W.S. Collective, Real-Eye-Nation, 508 Academy.

## Procedure
1. **Trust Oversight**
   - Quarterly Trust meetings
   - Annual compliance review
   - Asset protection verification

2. **Entity Compliance**
   - Maintain separate books for each entity
   - Annual state filings
   - Operating agreement reviews

3. **Decision Authority**
   - Trust-level decisions: Asset transfers, major contracts
   - Entity-level decisions: Daily operations, hiring
   - Department-level decisions: Project execution`,
    version: "1.0",
    status: "approved",
    createdBy: 1,
    effectiveDate: new Date().toISOString().split('T')[0]
  },

  // ============================================
  // FINANCE DEPARTMENT SOPs
  // ============================================
  {
    title: "Accounts Payable Process",
    department: "Finance",
    category: "sop",
    description: "Standard procedures for processing vendor invoices and payments.",
    content: `## Purpose
Establish consistent accounts payable procedures across all entities.

## Scope
All vendor payments, contractor payments, and recurring expenses.

## Procedure
1. **Invoice Receipt**
   - Log invoice in accounting system
   - Verify against purchase order or contract
   - Route for department approval

2. **Approval Workflow**
   - Under $500: Department Manager approval
   - $500-$5,000: Finance Manager approval
   - Over $5,000: CEO approval required

3. **Payment Processing**
   - Schedule payments per vendor terms
   - Maintain payment documentation
   - Reconcile monthly`,
    version: "1.0",
    status: "approved",
    createdBy: 1,
    effectiveDate: new Date().toISOString().split('T')[0]
  },
  {
    title: "Grant Financial Management",
    department: "Finance",
    category: "sop",
    description: "Procedures for tracking and reporting grant funds across entities.",
    content: `## Purpose
Ensure proper tracking, allocation, and reporting of grant funds.

## Scope
All grants received by any LuvOnPurpose entity.

## Procedure
1. **Grant Setup**
   - Create separate tracking codes
   - Document allowable expenses
   - Set up reporting calendar

2. **Expense Tracking**
   - Code all expenses to grant
   - Maintain supporting documentation
   - Track match requirements

3. **Reporting**
   - Prepare reports per grant schedule
   - Finance Manager review before submission
   - Archive all submitted reports`,
    version: "1.0",
    status: "approved",
    createdBy: 1,
    effectiveDate: new Date().toISOString().split('T')[0]
  },
  {
    title: "Monthly Financial Close",
    department: "Finance",
    category: "sop",
    description: "End-of-month procedures for financial reconciliation and reporting.",
    content: `## Purpose
Ensure accurate monthly financial statements for all entities.

## Procedure
1. **By 5th of Month**
   - Reconcile all bank accounts
   - Review outstanding receivables
   - Verify payables are recorded

2. **By 10th of Month**
   - Generate financial statements
   - Prepare variance analysis
   - Review with Finance Manager

3. **By 15th of Month**
   - Present to CEO
   - File in document management
   - Update dashboards`,
    version: "1.0",
    status: "approved",
    createdBy: 1,
    effectiveDate: new Date().toISOString().split('T')[0]
  },

  // ============================================
  // EDUCATION DEPARTMENT SOPs
  // ============================================
  {
    title: "Course Development Process",
    department: "Education",
    category: "sop",
    description: "Standard procedures for developing new Academy courses.",
    content: `## Purpose
Ensure consistent, high-quality course development for the 508 Academy.

## Procedure
1. **Course Proposal**
   - Submit course outline to Education Manager
   - Include learning objectives
   - Identify target audience

2. **Development Phase**
   - Create curriculum outline
   - Develop lesson content
   - Build assessments
   - Review for L.A.W.S. alignment

3. **Quality Review**
   - Peer review of content
   - Education Manager approval
   - Pilot with test group

4. **Launch**
   - Add to course catalog
   - Create marketing materials
   - Schedule initial sessions`,
    version: "1.0",
    status: "approved",
    createdBy: 1,
    effectiveDate: new Date().toISOString().split('T')[0]
  },
  {
    title: "Student Enrollment Process",
    department: "Education",
    category: "sop",
    description: "Procedures for enrolling students in Academy programs.",
    content: `## Purpose
Streamline student enrollment and ensure proper tracking.

## Procedure
1. **Application**
   - Receive application via website
   - Verify eligibility requirements
   - Process any fees

2. **Enrollment**
   - Add to learning management system
   - Send welcome materials
   - Assign to cohort if applicable

3. **Tracking**
   - Monitor progress
   - Send reminders for incomplete work
   - Issue certificates upon completion`,
    version: "1.0",
    status: "approved",
    createdBy: 1,
    effectiveDate: new Date().toISOString().split('T')[0]
  },

  // ============================================
  // HEALTH DEPARTMENT SOPs
  // ============================================
  {
    title: "Community Health Program Development",
    department: "Health",
    category: "sop",
    description: "Procedures for developing health and wellness programs under the WATER pillar.",
    content: `## Purpose
Develop community health programs aligned with the L.A.W.S. WATER pillar (Healing & Balance).

## Procedure
1. **Needs Assessment**
   - Survey community health needs
   - Review health data
   - Identify priority areas

2. **Program Design**
   - Define program objectives
   - Identify partners (healthcare providers, wellness experts)
   - Create program curriculum

3. **Implementation**
   - Recruit participants
   - Deliver program
   - Track outcomes

4. **Evaluation**
   - Measure against objectives
   - Gather participant feedback
   - Report to stakeholders`,
    version: "1.0",
    status: "approved",
    createdBy: 1,
    effectiveDate: new Date().toISOString().split('T')[0]
  },
  {
    title: "Wellness Resource Coordination",
    department: "Health",
    category: "sop",
    description: "Procedures for coordinating wellness resources and referrals.",
    content: `## Purpose
Connect community members with appropriate health and wellness resources.

## Procedure
1. **Resource Database**
   - Maintain list of vetted providers
   - Update quarterly
   - Include cost and eligibility info

2. **Referral Process**
   - Assess individual needs
   - Match to appropriate resources
   - Follow up on referrals

3. **Partnership Management**
   - Build relationships with providers
   - Negotiate community rates
   - Track utilization`,
    version: "1.0",
    status: "approved",
    createdBy: 1,
    effectiveDate: new Date().toISOString().split('T')[0]
  },

  // ============================================
  // DESIGN DEPARTMENT SOPs
  // ============================================
  {
    title: "Brand Guidelines Compliance",
    department: "Design",
    category: "sop",
    description: "Procedures for maintaining brand consistency across all entities.",
    content: `## Purpose
Ensure visual consistency across all LuvOnPurpose entities and materials.

## Procedure
1. **Brand Assets**
   - Maintain master brand guide
   - Entity-specific variations documented
   - Asset library updated quarterly

2. **Design Review**
   - All external materials reviewed by Design Manager
   - Check logo usage, colors, typography
   - Verify messaging alignment

3. **Approval Process**
   - Internal materials: Design Manager approval
   - External/public materials: CEO + Design Manager approval
   - Legal review for contracts/official documents`,
    version: "1.0",
    status: "approved",
    createdBy: 1,
    effectiveDate: new Date().toISOString().split('T')[0]
  },
  {
    title: "Design Request Process",
    department: "Design",
    category: "sop",
    description: "Standard procedures for submitting and fulfilling design requests.",
    content: `## Purpose
Streamline design requests and ensure quality deliverables.

## Procedure
1. **Request Submission**
   - Submit via design request form
   - Include purpose, audience, deadline
   - Provide content/copy

2. **Prioritization**
   - Design Manager reviews weekly
   - Prioritize by deadline and impact
   - Communicate timeline to requester

3. **Delivery**
   - Present draft for feedback
   - Incorporate revisions
   - Deliver final files
   - Archive in asset library`,
    version: "1.0",
    status: "approved",
    createdBy: 1,
    effectiveDate: new Date().toISOString().split('T')[0]
  },

  // ============================================
  // MEDIA DEPARTMENT SOPs
  // ============================================
  {
    title: "Content Production Workflow",
    department: "Media",
    category: "sop",
    description: "Standard procedures for producing media content at Real-Eye-Nation.",
    content: `## Purpose
Ensure consistent, high-quality media production for all entities.

## Procedure
1. **Pre-Production**
   - Content brief approval
   - Script/outline development
   - Resource scheduling

2. **Production**
   - Follow brand guidelines
   - Capture quality footage/audio
   - Document all assets

3. **Post-Production**
   - Edit per content brief
   - Review with Media Manager
   - Incorporate feedback

4. **Distribution**
   - Format for each platform
   - Schedule publication
   - Track engagement`,
    version: "1.0",
    status: "approved",
    createdBy: 1,
    effectiveDate: new Date().toISOString().split('T')[0]
  },
  {
    title: "Social Media Management",
    department: "Media",
    category: "sop",
    description: "Procedures for managing social media presence across entities.",
    content: `## Purpose
Maintain consistent, engaging social media presence.

## Procedure
1. **Content Calendar**
   - Plan content monthly
   - Align with organizational events
   - Balance entity promotion

2. **Posting**
   - Follow brand voice guidelines
   - Use approved hashtags
   - Tag appropriately

3. **Engagement**
   - Respond to comments within 24 hours
   - Escalate issues to Media Manager
   - Track metrics weekly`,
    version: "1.0",
    status: "approved",
    createdBy: 1,
    effectiveDate: new Date().toISOString().split('T')[0]
  },

  // ============================================
  // OPERATIONS DEPARTMENT SOPs
  // ============================================
  {
    title: "Vendor Management Process",
    department: "Operations",
    category: "sop",
    description: "Procedures for selecting, onboarding, and managing vendors.",
    content: `## Purpose
Ensure proper vendor selection and management across all entities.

## Procedure
1. **Vendor Selection**
   - Define requirements
   - Solicit quotes (3+ for purchases over $5,000)
   - Evaluate and select

2. **Onboarding**
   - Execute contract/agreement
   - Collect W-9 and insurance
   - Set up in accounting system

3. **Management**
   - Monitor performance
   - Annual review
   - Address issues promptly`,
    version: "1.0",
    status: "approved",
    createdBy: 1,
    effectiveDate: new Date().toISOString().split('T')[0]
  },
  {
    title: "Facility Management",
    department: "Operations",
    category: "sop",
    description: "Procedures for managing physical facilities and equipment.",
    content: `## Purpose
Maintain safe, functional facilities for all operations.

## Procedure
1. **Routine Maintenance**
   - Weekly facility inspections
   - Schedule preventive maintenance
   - Document all work

2. **Equipment Management**
   - Maintain equipment inventory
   - Schedule regular servicing
   - Track warranties

3. **Safety**
   - Monthly safety checks
   - Emergency procedure updates
   - Staff training`,
    version: "1.0",
    status: "approved",
    createdBy: 1,
    effectiveDate: new Date().toISOString().split('T')[0]
  },

  // ============================================
  // PROJECT CONTROLS SOPs
  // ============================================
  {
    title: "Project Initiation Process",
    department: "Project Controls",
    category: "sop",
    description: "Standard procedures for initiating new projects.",
    content: `## Purpose
Ensure proper project setup and documentation.

## Procedure
1. **Project Request**
   - Submit project request form
   - Define objectives and scope
   - Identify stakeholders

2. **Approval**
   - Review by Project Controls Manager
   - Budget approval from Finance
   - Executive approval for major projects

3. **Setup**
   - Create project in system
   - Assign project manager
   - Establish milestones
   - Kick-off meeting`,
    version: "1.0",
    status: "approved",
    createdBy: 1,
    effectiveDate: new Date().toISOString().split('T')[0]
  },
  {
    title: "Project Status Reporting",
    department: "Project Controls",
    category: "sop",
    description: "Procedures for regular project status updates and reporting.",
    content: `## Purpose
Maintain visibility into project progress across all initiatives.

## Procedure
1. **Weekly Updates**
   - Project managers update status
   - Flag risks and issues
   - Update milestone progress

2. **Monthly Reports**
   - Compile portfolio report
   - Budget vs. actual analysis
   - Present to leadership

3. **Escalation**
   - Red status projects reviewed immediately
   - Mitigation plans required
   - Executive notification for critical issues`,
    version: "1.0",
    status: "approved",
    createdBy: 1,
    effectiveDate: new Date().toISOString().split('T')[0]
  },

  // ============================================
  // LEGAL/COMPLIANCE SOPs
  // ============================================
  {
    title: "Contract Review Process",
    department: "Legal",
    category: "policy",
    description: "Procedures for reviewing and approving contracts.",
    content: `## Purpose
Ensure all contracts protect organizational interests and comply with regulations.

## Procedure
1. **Initial Review**
   - Department submits contract for review
   - Legal reviews terms and conditions
   - Identify risks and concerns

2. **Negotiation**
   - Propose modifications
   - Track changes
   - Document negotiations

3. **Approval**
   - Legal sign-off
   - Finance review for budget impact
   - Executive signature per authority matrix

4. **Execution**
   - Obtain all signatures
   - File executed copy
   - Set up monitoring/renewal reminders`,
    version: "1.0",
    status: "approved",
    createdBy: 1,
    effectiveDate: new Date().toISOString().split('T')[0]
  },
  {
    title: "Compliance Monitoring",
    department: "Legal",
    category: "policy",
    description: "Procedures for monitoring regulatory compliance across entities.",
    content: `## Purpose
Ensure ongoing compliance with all applicable regulations.

## Procedure
1. **Compliance Calendar**
   - Maintain filing deadlines
   - Track license renewals
   - Monitor regulatory changes

2. **Audits**
   - Annual internal compliance review
   - Address findings promptly
   - Document corrective actions

3. **Training**
   - Annual compliance training
   - Policy acknowledgments
   - Track completion`,
    version: "1.0",
    status: "approved",
    createdBy: 1,
    effectiveDate: new Date().toISOString().split('T')[0]
  },

  // ============================================
  // HR/PEOPLE OPERATIONS SOPs
  // ============================================
  {
    title: "Employee Onboarding Process",
    department: "Human Resources",
    category: "sop",
    description: "Standard procedures for onboarding new employees.",
    content: `## Purpose
Ensure consistent, thorough onboarding for all new hires.

## Procedure
1. **Pre-Start**
   - Send offer letter
   - Collect required documents
   - Set up accounts and equipment

2. **First Day**
   - Welcome and orientation
   - Complete paperwork
   - Introduce to team

3. **First Week**
   - Department training
   - System access and training
   - Assign mentor/buddy

4. **First 90 Days**
   - Regular check-ins
   - Complete onboarding checklist
   - 90-day review`,
    version: "1.0",
    status: "approved",
    createdBy: 1,
    effectiveDate: new Date().toISOString().split('T')[0]
  },
  {
    title: "Performance Review Process",
    department: "Human Resources",
    category: "sop",
    description: "Procedures for conducting employee performance reviews.",
    content: `## Purpose
Provide consistent feedback and development opportunities.

## Procedure
1. **Preparation**
   - Employee self-assessment
   - Manager assessment
   - Gather 360 feedback if applicable

2. **Review Meeting**
   - Discuss performance
   - Set goals for next period
   - Identify development needs

3. **Documentation**
   - Complete review form
   - Employee acknowledgment
   - File in personnel record

4. **Follow-Up**
   - Create development plan
   - Schedule check-ins
   - Track goal progress`,
    version: "1.0",
    status: "approved",
    createdBy: 1,
    effectiveDate: new Date().toISOString().split('T')[0]
  }
];

async function seedOperatingProcedures() {
  console.log('Seeding Operating Procedures...\n');
  
  const connection = await mysql.createConnection(DATABASE_URL);
  
  let inserted = 0;
  let skipped = 0;
  
  for (const proc of OPERATING_PROCEDURES) {
    try {
      // Check if procedure already exists
      const [existing] = await connection.execute(
        'SELECT id FROM operating_procedures WHERE title = ? AND department = ?',
        [proc.title, proc.department]
      );
      
      if (existing.length > 0) {
        console.log(`  ⏭ Skipped (exists): ${proc.department} - ${proc.title}`);
        skipped++;
        continue;
      }
      
      // Insert new procedure
      await connection.execute(
        `INSERT INTO operating_procedures 
         (title, department, category, description, content, version, status, effectiveDate, createdBy, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [proc.title, proc.department, proc.category, proc.description, proc.content, proc.version, proc.status, proc.effectiveDate, proc.createdBy]
      );
      
      console.log(`  ✓ Added: ${proc.department} - ${proc.title}`);
      inserted++;
    } catch (err) {
      console.log(`  ✗ Error: ${proc.title} - ${err.message}`);
    }
  }
  
  await connection.end();
  
  console.log(`\n========================================`);
  console.log(`Operating Procedures Seeding Complete`);
  console.log(`========================================`);
  console.log(`Inserted: ${inserted}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Total: ${OPERATING_PROCEDURES.length}`);
}

seedOperatingProcedures().catch(console.error);
