/**
 * Seed sample employees for the Employee Directory
 * Run with: node scripts/seed-employees.mjs
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const sampleEmployees = [
  // Executive Leadership - Entity ID 1 (Calea Freeman Family Trust)
  {
    firstName: "Shanna",
    lastName: "Russell",
    preferredName: null,
    email: "shanna@luvonpurpose.com",
    phone: "(555) 100-0001",
    entityId: 1,
    department: "Executive",
    jobTitle: "Matriarch/CEO",
    positionLevel: "executive",
    reportsTo: null,
    employmentType: "full_time",
    workLocation: "hybrid",
    startDate: "2024-01-01",
    bio: "Visionary leader and founder of the LuvOnPurpose Family Enterprise. Responsible for strategic direction and trust governance.",
    status: "active"
  },
  {
    firstName: "Craig",
    lastName: "Freeman",
    preferredName: null,
    email: "craig@luvonpurpose.com",
    phone: "(555) 100-0002",
    entityId: 5, // L.A.W.S. Collective
    department: "Finance",
    jobTitle: "Chief Financial Officer",
    positionLevel: "executive",
    reportsTo: null,
    employmentType: "full_time",
    workLocation: "hybrid",
    startDate: "2024-01-01",
    bio: "Oversees financial strategy, budgeting, and grant compliance across all entities.",
    status: "active"
  },
  {
    firstName: "Cornelius",
    lastName: "Johnson",
    preferredName: null,
    email: "cornelius@luvonpurpose.com",
    phone: "(555) 100-0003",
    entityId: 5, // L.A.W.S. Collective
    department: "Education",
    jobTitle: "Chief Education Officer",
    positionLevel: "executive",
    reportsTo: null,
    employmentType: "full_time",
    workLocation: "remote",
    startDate: "2024-02-01",
    bio: "Strategic oversight of all education and training programs. Criminal Justice expertise for legal advisory support.",
    status: "active"
  },
  
  // HR Department - Entity ID 5 (L.A.W.S. Collective)
  {
    firstName: "Maya",
    lastName: "Thompson",
    preferredName: null,
    email: "maya.thompson@luvonpurpose.com",
    phone: "(555) 200-0001",
    entityId: 5,
    department: "Human Resources",
    jobTitle: "HR Manager",
    positionLevel: "manager",
    reportsTo: null,
    employmentType: "full_time",
    workLocation: "hybrid",
    startDate: "2024-03-15",
    bio: "Leads talent acquisition, employee relations, and organizational culture initiatives.",
    status: "active"
  },
  {
    firstName: "Jordan",
    lastName: "Williams",
    preferredName: "JW",
    email: "jordan.williams@luvonpurpose.com",
    phone: "(555) 200-0002",
    entityId: 5,
    department: "Human Resources",
    jobTitle: "HR Operations Coordinator",
    positionLevel: "coordinator",
    reportsTo: null,
    employmentType: "full_time",
    workLocation: "remote",
    startDate: "2024-04-01",
    bio: "Handles interview scheduling, onboarding paperwork, and HR metrics tracking.",
    status: "active"
  },

  // Operations - Entity ID 3 (LAWS LLC)
  {
    firstName: "Marcus",
    lastName: "Chen",
    preferredName: null,
    email: "marcus.chen@luvonpurpose.com",
    phone: "(555) 300-0001",
    entityId: 3,
    department: "Operations",
    jobTitle: "Operations Manager",
    positionLevel: "manager",
    reportsTo: null,
    employmentType: "full_time",
    workLocation: "hybrid",
    startDate: "2024-03-01",
    bio: "Manages platform operations, cross-entity coordination, and autonomous system monitoring.",
    status: "active"
  },
  {
    firstName: "Aisha",
    lastName: "Patel",
    preferredName: null,
    email: "aisha.patel@luvonpurpose.com",
    phone: "(555) 300-0002",
    entityId: 3,
    department: "Operations",
    jobTitle: "Operations Coordinator",
    positionLevel: "coordinator",
    reportsTo: null,
    employmentType: "full_time",
    workLocation: "remote",
    startDate: "2024-05-01",
    bio: "Coordinates meetings, tracks project milestones, and maintains operational documentation.",
    status: "active"
  },

  // Technology - Entity ID 3 (LAWS LLC)
  {
    firstName: "David",
    lastName: "Kim",
    preferredName: "Dave",
    email: "david.kim@luvonpurpose.com",
    phone: "(555) 400-0001",
    entityId: 3,
    department: "Technology",
    jobTitle: "Platform Administrator",
    positionLevel: "lead",
    reportsTo: null,
    employmentType: "full_time",
    workLocation: "remote",
    startDate: "2024-02-15",
    bio: "Manages technical infrastructure, security, and system maintenance for the autonomous wealth platform.",
    status: "active"
  },
  {
    firstName: "Sarah",
    lastName: "Martinez",
    preferredName: null,
    email: "sarah.martinez@luvonpurpose.com",
    phone: "(555) 400-0002",
    entityId: 3,
    department: "Technology",
    jobTitle: "Software Developer",
    positionLevel: "specialist",
    reportsTo: null,
    employmentType: "full_time",
    workLocation: "remote",
    startDate: "2024-06-01",
    bio: "Full-stack developer focused on platform features and AI integration.",
    status: "active"
  },

  // Education - Entity ID 2 (508 Academy)
  {
    firstName: "Dr. Angela",
    lastName: "Washington",
    preferredName: "Dr. Angela",
    email: "angela.washington@luvonpurpose.com",
    phone: "(555) 500-0001",
    entityId: 2,
    department: "Education",
    jobTitle: "Academy Director",
    positionLevel: "manager",
    reportsTo: null,
    employmentType: "full_time",
    workLocation: "hybrid",
    startDate: "2024-04-15",
    bio: "Leads curriculum development and instructor management for the LuvOnPurpose Academy.",
    status: "active"
  },
  {
    firstName: "Michael",
    lastName: "Brown",
    preferredName: "Mike",
    email: "michael.brown@luvonpurpose.com",
    phone: "(555) 500-0002",
    entityId: 2,
    department: "Education",
    jobTitle: "Education Operations Coordinator",
    positionLevel: "coordinator",
    reportsTo: null,
    employmentType: "full_time",
    workLocation: "remote",
    startDate: "2024-05-15",
    bio: "Manages student enrollment, progress tracking, and certificate issuance.",
    status: "active"
  },
  {
    firstName: "Lisa",
    lastName: "Jackson",
    preferredName: null,
    email: "lisa.jackson@luvonpurpose.com",
    phone: "(555) 500-0003",
    entityId: 2,
    department: "Education",
    jobTitle: "Curriculum Specialist",
    positionLevel: "specialist",
    reportsTo: null,
    employmentType: "part_time",
    workLocation: "remote",
    startDate: "2024-07-01",
    bio: "Develops Divine STEM curriculum and learning materials.",
    status: "active"
  },

  // Media - Entity ID 4 (Real-Eye-Nation)
  {
    firstName: "Jasmine",
    lastName: "Taylor",
    preferredName: "Jazz",
    email: "jasmine.taylor@luvonpurpose.com",
    phone: "(555) 600-0001",
    entityId: 4,
    department: "Media",
    jobTitle: "Media Manager",
    positionLevel: "manager",
    reportsTo: null,
    employmentType: "full_time",
    workLocation: "hybrid",
    startDate: "2024-03-01",
    bio: "Leads content creation, social media strategy, and brand storytelling.",
    status: "active"
  },
  {
    firstName: "Tyler",
    lastName: "Robinson",
    preferredName: null,
    email: "tyler.robinson@luvonpurpose.com",
    phone: "(555) 600-0002",
    entityId: 4,
    department: "Media",
    jobTitle: "Media Operations Coordinator",
    positionLevel: "coordinator",
    reportsTo: null,
    employmentType: "full_time",
    workLocation: "remote",
    startDate: "2024-06-15",
    bio: "Coordinates content calendar, asset management, and publication scheduling.",
    status: "active"
  },
  {
    firstName: "Kevin",
    lastName: "Davis",
    preferredName: null,
    email: "kevin.davis@luvonpurpose.com",
    phone: "(555) 600-0003",
    entityId: 4,
    department: "Media",
    jobTitle: "Content Creator",
    positionLevel: "specialist",
    reportsTo: null,
    employmentType: "contract",
    workLocation: "remote",
    startDate: "2024-08-01",
    bio: "Creates video content, podcasts, and multimedia educational materials.",
    status: "active"
  },

  // Design - Entity ID 5 (L.A.W.S. Collective)
  {
    firstName: "Nicole",
    lastName: "Adams",
    preferredName: "Nikki",
    email: "nicole.adams@luvonpurpose.com",
    phone: "(555) 700-0001",
    entityId: 5,
    department: "Design",
    jobTitle: "Design Manager",
    positionLevel: "manager",
    reportsTo: null,
    employmentType: "full_time",
    workLocation: "hybrid",
    startDate: "2024-04-01",
    bio: "Leads visual design, brand identity, and user experience across all platforms.",
    status: "active"
  },
  {
    firstName: "Brandon",
    lastName: "Lee",
    preferredName: null,
    email: "brandon.lee@luvonpurpose.com",
    phone: "(555) 700-0002",
    entityId: 5,
    department: "Design",
    jobTitle: "Design Operations Coordinator",
    positionLevel: "coordinator",
    reportsTo: null,
    employmentType: "full_time",
    workLocation: "remote",
    startDate: "2024-07-15",
    bio: "Manages design asset library, project workflows, and design system documentation.",
    status: "active"
  },

  // Finance - Entity ID 5 (L.A.W.S. Collective)
  {
    firstName: "Robert",
    lastName: "Garcia",
    preferredName: "Rob",
    email: "robert.garcia@luvonpurpose.com",
    phone: "(555) 800-0001",
    entityId: 5,
    department: "Finance",
    jobTitle: "Grant Writer",
    positionLevel: "specialist",
    reportsTo: null,
    employmentType: "full_time",
    workLocation: "remote",
    startDate: "2024-05-01",
    bio: "Researches and writes grant applications for nonprofit funding opportunities.",
    status: "active"
  },
  {
    firstName: "Patricia",
    lastName: "Moore",
    preferredName: "Patty",
    email: "patricia.moore@luvonpurpose.com",
    phone: "(555) 800-0002",
    entityId: 5,
    department: "Finance",
    jobTitle: "Bookkeeper",
    positionLevel: "specialist",
    reportsTo: null,
    employmentType: "part_time",
    workLocation: "remote",
    startDate: "2024-06-01",
    bio: "Maintains financial records, processes invoices, and prepares financial reports.",
    status: "active"
  },

  // Legal/Contracts - Entity ID 5 (L.A.W.S. Collective)
  {
    firstName: "Jennifer",
    lastName: "White",
    preferredName: "Jen",
    email: "jennifer.white@luvonpurpose.com",
    phone: "(555) 900-0001",
    entityId: 5,
    department: "Legal",
    jobTitle: "Contracts Manager",
    positionLevel: "manager",
    reportsTo: null,
    employmentType: "full_time",
    workLocation: "hybrid",
    startDate: "2024-04-15",
    bio: "Manages contract lifecycle, vendor agreements, and legal compliance.",
    status: "active"
  },
  {
    firstName: "Christopher",
    lastName: "Harris",
    preferredName: "Chris",
    email: "christopher.harris@luvonpurpose.com",
    phone: "(555) 900-0002",
    entityId: 5,
    department: "Legal",
    jobTitle: "Contracts Operations Coordinator",
    positionLevel: "coordinator",
    reportsTo: null,
    employmentType: "full_time",
    workLocation: "remote",
    startDate: "2024-08-01",
    bio: "Tracks contract deadlines, maintains document repository, and coordinates approvals.",
    status: "active"
  },

  // Quality Assurance - Entity ID 5 (L.A.W.S. Collective)
  {
    firstName: "Amanda",
    lastName: "Clark",
    preferredName: null,
    email: "amanda.clark@luvonpurpose.com",
    phone: "(555) 950-0001",
    entityId: 5,
    department: "Quality Assurance",
    jobTitle: "QA/QC Manager",
    positionLevel: "manager",
    reportsTo: null,
    employmentType: "full_time",
    workLocation: "hybrid",
    startDate: "2024-05-15",
    bio: "Develops quality standards, monitors compliance, and conducts internal audits.",
    status: "active"
  },

  // Intern
  {
    firstName: "Alex",
    lastName: "Rivera",
    preferredName: null,
    email: "alex.rivera@luvonpurpose.com",
    phone: "(555) 999-0001",
    entityId: 3,
    department: "Technology",
    jobTitle: "Software Development Intern",
    positionLevel: "intern",
    reportsTo: null,
    employmentType: "intern",
    workLocation: "remote",
    startDate: "2025-01-15",
    bio: "Computer Science student learning full-stack development and AI integration.",
    status: "active"
  }
];

async function seedEmployees() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log('Connected to database');
  console.log(`Seeding ${sampleEmployees.length} employees...`);

  for (const emp of sampleEmployees) {
    try {
      await connection.execute(
        `INSERT INTO employees (firstName, lastName, preferredName, email, phone, entityId, department, jobTitle, positionLevel, reportsTo, employmentType, workLocation, startDate, bio, status, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          emp.firstName,
          emp.lastName,
          emp.preferredName,
          emp.email,
          emp.phone,
          emp.entityId,
          emp.department,
          emp.jobTitle,
          emp.positionLevel,
          emp.reportsTo,
          emp.employmentType,
          emp.workLocation,
          emp.startDate,
          emp.bio,
          emp.status
        ]
      );
      console.log(`✓ Added: ${emp.firstName} ${emp.lastName} - ${emp.jobTitle}`);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log(`⊘ Skipped (exists): ${emp.firstName} ${emp.lastName}`);
      } else {
        console.error(`✗ Error adding ${emp.firstName} ${emp.lastName}:`, error.message);
      }
    }
  }

  await connection.end();
  console.log('\\nSeeding complete!');
}

seedEmployees().catch(console.error);
