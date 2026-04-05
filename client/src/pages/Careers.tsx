import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { 
  Building2, 
  MapPin, 
  Clock, 
  Briefcase,
  Heart,
  Users,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  Send,
  FileText,
  Upload,
  Sparkles,
  Target,
  Globe,
  DollarSign,
  Wifi,
  Laptop,
  Shirt,
  X,
  Loader2
} from "lucide-react";
import { Link } from "wouter";
import OrgChart from "@/components/OrgChart";

// Position Tiers:
// tier1_family: Family members confirmed in roles - NOT open for external hiring
// tier2_identified: Candidates identified but not yet approached - NOT actively recruiting  
// tier3_open: Manager positions truly open for recruitment (future hiring)
// tier4_coordinator: Primary external hire positions - selected by department Managers

const POSITIONS = [
  // ============================================
  // TIER 1: FAMILY MANAGER POSITIONS (Filled)
  // ============================================
  { 
    id: "finance-manager", 
    title: "Finance Manager", 
    entity: "The L.A.W.S. Collective, LLC",
    entityShort: "L.A.W.S.",
    department: "Finance",
    type: "Full-Time",
    location: "Hybrid",
    salaryRange: "$85,000 - $115,000",
    description: "Lead all financial operations across the organization including budgeting, accounting, financial reporting, grant financial management, and cash flow optimization. Ensure financial compliance and support strategic decision-making with accurate financial data.",
    requirements: ["5+ years financial management", "Accounting/bookkeeping proficiency", "Grant financial management", "QuickBooks/financial software expertise"],
    category: "finance",
    tier: "tier1_family",
    hiringStatus: "Filled - Family (Craig)"
  },
  { 
    id: "education-manager", 
    title: "Education Manager", 
    entity: "508-LuvOnPurpose Academy and Outreach",
    entityShort: "508 Academy",
    department: "Education",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$85,000 - $115,000",
    description: "Lead all educational programming and curriculum development for the Academy. Oversee course creation, instructor coordination, student progress tracking, and ensure educational content aligns with organizational values and community needs.",
    requirements: ["5+ years education/training management", "Curriculum development experience", "Learning management systems", "Community education background"],
    category: "education",
    tier: "tier1_family",
    hiringStatus: "Filled - Family (Cornelius)"
  },
  { 
    id: "ops-coordinator-education", 
    title: "Education Operations Coordinator", 
    entity: "508-LuvOnPurpose Academy and Outreach",
    entityShort: "508 Academy",
    department: "Education",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$55,000 - $75,000",
    description: "Support the Education Manager with curriculum administration, student enrollment, course scheduling, and learning management system operations. Reports to Cornelius Christopher (Education Manager). Coordinate with instructors, track student progress, and ensure smooth delivery of educational programs.",
    requirements: ["2+ years education administration", "LMS experience preferred", "Strong organizational skills", "Student support orientation"],
    category: "education",
    tier: "tier4_coordinator",
    hiringStatus: "Open Position",
    reportsTo: "Cornelius Christopher"
  },
  // ============================================
  // TIER 3: OPEN MANAGER POSITIONS (Future Hiring)
  // ============================================
  { 
    id: "hr-lead", 
    title: "HR Manager", 
    entity: "The L.A.W.S. Collective, LLC",
    entityShort: "L.A.W.S.",
    department: "Human Resources",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$85,000 - $115,000",
    description: "Build and maintain the human capital infrastructure across all five subsidiary entities. Oversee talent acquisition, onboarding, training coordination, performance management, and employee relations.",
    requirements: ["3+ years HR experience", "Strong interpersonal skills", "HR systems proficiency", "Employment law knowledge"],
    category: "operations",
    tier: "tier3_open",
    hiringStatus: "Open Position"
  },
  { 
    id: "qaqc-lead", 
    title: "QA/QC Manager", 
    entity: "The L.A.W.S. Collective, LLC",
    entityShort: "L.A.W.S.",
    department: "Quality Assurance",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$85,000 - $115,000",
    description: "Establish and maintain quality standards across all subsidiary entities. Ensure deliverables meet organizational standards and grant compliance requirements are satisfied.",
    requirements: ["3+ years QA/compliance experience", "Strong attention to detail", "Technical writing skills", "Process documentation"],
    category: "operations",
    tier: "tier3_open",
    hiringStatus: "Open Position"
  },
  { 
    id: "it-manager", 
    title: "IT Manager", 
    entity: "The L.A.W.S. Collective, LLC",
    entityShort: "L.A.W.S.",
    department: "Information Technology",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$90,000 - $120,000",
    description: "Lead all technology infrastructure, security, and support operations across the organization. Manage system security, troubleshooting, communications systems (email, Teams, phone), and helpdesk support. Ensure cybersecurity compliance and maintain reliable technology services for all remote employees.",
    requirements: ["5+ years IT management experience", "Strong cybersecurity knowledge", "Cloud infrastructure experience (AWS/Azure)", "Helpdesk and user support management", "Network administration", "Remote team technology support"],
    category: "technology",
    tier: "tier3_open",
    hiringStatus: "Open Position - Priority"
  },
  // ============================================
  // TIER 2: IDENTIFIED CANDIDATES (Pending Funding)
  // ============================================
  { 
    id: "purchasing-lead", 
    title: "Purchasing Manager", 
    entity: "The L.A.W.S. Collective, LLC",
    entityShort: "L.A.W.S.",
    department: "Purchasing",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$80,000 - $110,000",
    description: "Manage day-to-day purchasing operations across all subsidiary entities. Handle vendor relationships, purchase orders, cost control, inventory tracking, and grant compliance for purchasing activities. Reports to Procurement Manager.",
    requirements: ["3+ years purchasing experience", "Negotiation skills", "Spreadsheet proficiency", "Vendor management"],
    category: "operations",
    tier: "tier2_identified",
    hiringStatus: "Candidate Identified - Latisha Cox",
  },
  { 
    id: "operations-manager", 
    title: "Operations Manager", 
    entity: "LuvOnPurpose Autonomous Wealth System LLC",
    entityShort: "LAWS LLC",
    department: "Operations",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$85,000 - $115,000",
    description: "Ensure smooth day-to-day operations across all subsidiary entities. Coordinate workflows, monitor business systems, identify bottlenecks, and provide support to team members.",
    requirements: ["3+ years operations experience", "Strong organizational skills", "Excellent communication", "Problem-solving mindset"],
    category: "operations",
    tier: "tier3_open",
    hiringStatus: "Future Hiring"
  },
  // ============================================
  // TIER 4: OPERATIONS COORDINATORS (Primary External Hires)
  // Selected by respective department Managers
  // ============================================
  { 
    id: "finance-ops-coordinator", 
    title: "Finance Operations Coordinator", 
    entity: "The L.A.W.S. Collective, LLC",
    entityShort: "L.A.W.S.",
    department: "Finance",
    type: "Full-Time",
    location: "Hybrid",
    salaryRange: "$55,000 - $75,000",
    description: "Support the Finance Manager in daily financial operations including accounts payable/receivable, expense tracking, financial data entry, report preparation, and grant financial documentation. Assist with budgeting, reconciliations, and financial compliance tasks.",
    requirements: ["2+ years accounting/bookkeeping experience", "QuickBooks or similar software proficiency", "Excel/spreadsheet expertise", "Attention to detail", "Basic understanding of grant accounting"],
    category: "finance",
    tier: "tier4_coordinator",
    hiringStatus: "Pending Manager"
  },
  { 
    id: "outreach-coordinator", 
    title: "Outreach Coordinator", 
    entity: "LuvOnPurpose Outreach Temple and Academy Society, Inc.",
    entityShort: "Temple/508",
    department: "Community Outreach",
    type: "Full-Time",
    location: "Hybrid",
    salaryRange: "$65,000 - $85,000",
    description: "Connect the organization with the broader community through events, partnerships, and relationship building. Plan community events, build partner relationships, and coordinate volunteers.",
    requirements: ["2+ years outreach experience", "Strong interpersonal skills", "Event planning ability", "Public speaking comfort"],
    category: "community",
    tier: "tier4_coordinator",
    hiringStatus: "Actively Recruiting"
  },
  { 
    id: "content-creator", 
    title: "Content Creator / Media Assistant", 
    entity: "Real-Eye-Nation LLC",
    entityShort: "Real-Eye",
    department: "Media Production",
    type: "Part-Time to Full-Time",
    location: "Remote + On-location",
    salaryRange: "$35,000 - $55,000",
    description: "Support the media production mission by creating social media content, documenting events, editing videos, and writing copy for marketing materials.",
    requirements: ["Portfolio required", "Photography/videography skills", "Video editing ability", "Social media knowledge"],
    category: "media",
    tier: "tier4_coordinator",
    hiringStatus: "Actively Recruiting"
  },
  { 
    id: "academy-instructor", 
    title: "Academy Instructor / Curriculum Developer", 
    entity: "LuvOnPurpose Outreach Temple and Academy Society, Inc.",
    entityShort: "Temple/508",
    department: "Education",
    type: "Part-Time to Full-Time",
    location: "Remote + Occasional In-Person",
    salaryRange: "$75,000 - $100,000",
    description: "Deliver educational content and develop new courses for the LuvOnPurpose Academy. Teach courses, create curriculum, develop assessments, and track student progress.",
    requirements: ["Subject matter expertise", "Teaching experience", "Clear communication", "Online teaching comfort"],
    category: "education",
    tier: "tier4_coordinator",
    hiringStatus: "Actively Recruiting"
  },
  { 
    id: "grant-writer", 
    title: "Grant Writer / Proposal Specialist", 
    entity: "The L.A.W.S. Collective, LLC",
    entityShort: "L.A.W.S.",
    department: "Grants & Proposals",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$85,000 - $115,000",
    description: "Identify funding opportunities and write compelling proposals to secure grants for all subsidiary entities. Research opportunities, develop narratives, create budgets, and manage deadlines.",
    requirements: ["2+ years grant writing", "Strong writing skills", "Deadline management", "Research abilities"],
    category: "operations",
    tier: "tier3_open",
    hiringStatus: "Future Hiring"
  },
  { 
    id: "platform-admin", 
    title: "Platform Administrator", 
    entity: "LuvOnPurpose Autonomous Wealth System LLC",
    entityShort: "LAWS LLC",
    department: "Technology",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$95,000 - $130,000",
    description: "Maintain and improve the technology infrastructure of the organization. Monitor system health, manage user accounts, implement new features, and ensure security.",
    requirements: ["2+ years IT administration", "Tech-savvy", "Security-conscious", "User support patience"],
    category: "technology",
    tier: "tier3_open",
    hiringStatus: "Future Hiring"
  },
  { 
    id: "programs-coordinator", 
    title: "Community Programs Coordinator", 
    entity: "The L.A.W.S. Collective, LLC",
    entityShort: "L.A.W.S.",
    department: "Community Programs",
    type: "Full-Time",
    location: "Hybrid",
    salaryRange: "$80,000 - $110,000",
    description: "Develop and manage programs based on the L.A.W.S. framework (Land, Air, Water, Self) that help community members reconnect with their roots, gain knowledge, find balance, and discover purpose.",
    requirements: ["2+ years program management", "Community development passion", "Organizational skills", "Cultural sensitivity"],
    category: "community",
    tier: "tier4_coordinator",
    hiringStatus: "Actively Recruiting"
  },
  { 
    id: "lead-ops-coordinator", 
    title: "Lead Operations Coordinator", 
    entity: "The L.A.W.S. Collective, LLC",
    entityShort: "L.A.W.S.",
    department: "Operations",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$68,000 - $88,000",
    description: "Oversee all department Operations Coordinator staff across the organization. Serve as the primary support to the executive team while supervising HR, QA/QC, Purchasing, Operations, and Education Operations Coordinator staff.",
    requirements: ["3+ years operations/admin leadership", "Team leadership experience", "Process management skills", "Remote team coordination"],
    category: "operations",
    tier: "tier4_coordinator",
    hiringStatus: "Actively Recruiting"
  },
  { 
    id: "ops-coordinator-business", 
    title: "Business Operations Coordinator", 
    entity: "The L.A.W.S. Collective, LLC",
    entityShort: "L.A.W.S.",
    department: "Business Management",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$60,000 - $80,000",
    description: "Support the Business Manager with executive-level operations across all subsidiary entities. Handle scheduling, communications, project tracking, meeting coordination, and administrative tasks. Serve as the primary administrative support for strategic business initiatives.",
    requirements: ["2+ years executive/business admin support", "Strong organizational skills", "Excellent communication", "Multi-entity coordination experience", "Discretion with confidential matters"],
    category: "operations",
    tier: "tier4_coordinator",
    hiringStatus: "Open Position"
  },
  { 
    id: "ops-coordinator-hr", 
    title: "HR Operations Coordinator", 
    entity: "The L.A.W.S. Collective, LLC",
    entityShort: "L.A.W.S.",
    department: "Human Resources",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$52,000 - $68,000",
    description: "Provide day-to-day administrative assistance to the HR Department. Handle scheduling, document management, candidate coordination, and employee record maintenance.",
    requirements: ["1+ years admin/HR support", "Organization skills", "Microsoft Office/Google Workspace", "Data entry proficiency"],
    category: "operations",
    tier: "tier4_coordinator",
    hiringStatus: "Open Position"
  },
  { 
    id: "ops-coordinator-qaqc", 
    title: "QA/QC Operations Coordinator", 
    entity: "The L.A.W.S. Collective, LLC",
    entityShort: "L.A.W.S.",
    department: "Quality Assurance",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$52,000 - $68,000",
    description: "Assist the Quality Department with documentation, tracking, and compliance activities. Maintain quality records, track audit findings, and support process improvement initiatives.",
    requirements: ["1+ years admin/quality support", "Attention to detail", "Documentation skills", "Process tracking"],
    category: "operations",
    tier: "tier4_coordinator",
    hiringStatus: "Open Position"
  },
  { 
    id: "ops-coordinator-it", 
    title: "IT Operations Coordinator", 
    entity: "The L.A.W.S. Collective, LLC",
    entityShort: "L.A.W.S.",
    department: "Information Technology",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$55,000 - $75,000",
    description: "Provide day-to-day IT support to the organization. Handle helpdesk tickets, user account management, software installations, and basic troubleshooting. Assist the IT Manager with system maintenance, security monitoring, and documentation. Reports to IT Manager.",
    requirements: ["2+ years IT support experience", "Helpdesk/ticketing system experience", "Windows/Mac troubleshooting", "Cloud platform familiarity", "Strong communication skills", "Remote support experience"],
    category: "technology",
    tier: "tier4_coordinator",
    hiringStatus: "Open Position",
    reportsTo: "IT Manager"
  },
  { 
    id: "ops-coordinator-purchasing", 
    title: "Purchasing Operations Coordinator", 
    entity: "The L.A.W.S. Collective, LLC",
    entityShort: "L.A.W.S.",
    department: "Purchasing",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$52,000 - $68,000",
    description: "Assist the Purchasing Manager with day-to-day purchasing operations including order processing, vendor communications, and inventory tracking. Ensure accurate records and timely processing of purchases.",
    requirements: ["1+ years admin/purchasing support", "Data entry skills", "Vendor communication", "Invoice processing"],
    category: "operations",
    tier: "tier4_coordinator",
    hiringStatus: "Open Position"
  },
  { 
    id: "ops-coordinator-operations", 
    title: "Operations Operations Coordinator", 
    entity: "LuvOnPurpose Autonomous Wealth System LLC",
    entityShort: "LAWS LLC",
    department: "Operations",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$52,000 - $68,000",
    description: "Provide day-to-day assistance to the Operations team. Handle scheduling, project tracking, communications, and general administrative tasks to keep operations running smoothly.",
    requirements: ["1+ years admin/operations support", "Organization skills", "Multitasking ability", "Project tracking"],
    category: "operations",
    tier: "tier4_coordinator",
    hiringStatus: "Pending Manager"
  },
  { 
    id: "ops-coordinator-education-temple", 
    title: "Education Operations Coordinator (Temple)", 
    entity: "LuvOnPurpose Outreach Temple and Academy Society, Inc.",
    entityShort: "Temple/508",
    department: "Education",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$52,000 - $68,000",
    description: "Provide administrative support to the Education Department and Academy. Reports to Cornelius Christopher (Education Manager). Assist with student enrollment, course scheduling, materials preparation, and instructor coordination.",
    requirements: ["1+ years admin/education support", "Organization skills", "Student communication", "LMS familiarity preferred"],
    category: "education",
    tier: "tier4_coordinator",
    hiringStatus: "Pending Manager",
    reportsTo: "Cornelius Christopher"
  },
  { 
    id: "health-manager", 
    title: "Health Manager", 
    entity: "The L.A.W.S. Collective, LLC",
    entityShort: "L.A.W.S.",
    department: "Health & Wellness",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$85,000 - $115,000",
    description: "Lead community health and wellness initiatives within the L.A.W.S. framework (WATER pillar - Healing & Balance). Develop health programs, coordinate with healthcare partners, and ensure community members have access to quality health resources and support.",
    requirements: ["5+ years health/wellness management", "Healthcare program development", "Community health experience", "Team leadership skills"],
    category: "health",
    tier: "tier1_family",
    hiringStatus: "Filled - Family (Amber Hunter)"
  },
  { 
    id: "procurement-manager", 
    title: "Procurement Manager", 
    entity: "The L.A.W.S. Collective, LLC",
    entityShort: "L.A.W.S.",
    department: "Procurement",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$95,000 - $130,000",
    description: "Provide strategic oversight of all procurement-related functions including Purchasing and Contracts departments. Develop vendor relationships, negotiate major contracts, implement cost-saving initiatives, and ensure compliance with grant requirements and organizational policies across all subsidiary entities.",
    requirements: ["5+ years procurement/supply chain management", "Contract negotiation skills", "Vendor management experience", "Professional certification preferred (CPM, CPSM)"],
    category: "operations",
    tier: "tier2_identified",
    hiringStatus: "Candidate Identified - Maia Rylandlesesene"
  },
  { 
    id: "ops-coordinator-procurement", 
    title: "Procurement Operations Coordinator", 
    entity: "The L.A.W.S. Collective, LLC",
    entityShort: "L.A.W.S.",
    department: "Procurement",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$55,000 - $75,000",
    description: "Support the Procurement Manager with strategic procurement activities, vendor analysis, contract tracking, and compliance documentation. Coordinate between Purchasing and Contracts departments to ensure alignment with organizational procurement strategy.",
    requirements: ["2+ years procurement/supply chain support", "Analytical skills", "Vendor coordination experience", "Excel/reporting proficiency"],
    category: "operations",
    tier: "tier4_coordinator",
    hiringStatus: "Open Position"
  },
  { 
    id: "ops-coordinator-health", 
    title: "Health Operations Coordinator", 
    entity: "The L.A.W.S. Collective, LLC",
    entityShort: "L.A.W.S.",
    department: "Health",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$55,000 - $72,000",
    description: "Support community wellness initiatives within the L.A.W.S. framework (WATER pillar - Healing & Balance). Coordinate health programs, track wellness metrics, and help community members access health resources.",
    requirements: ["1+ years health/wellness coordination", "Organization skills", "Compassionate approach", "Health resource knowledge"],
    category: "health",
    tier: "tier4_coordinator",
    hiringStatus: "Ready to Hire (reports to Amber Hunter)"
  },
  { 
    id: "contracts-manager", 
    title: "Contracts Manager", 
    entity: "The L.A.W.S. Collective, LLC",
    entityShort: "L.A.W.S.",
    department: "Contracts",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$95,000 - $130,000",
    description: "Oversee all contract administration, negotiations, and compliance across our family of entities. Draft, review, and negotiate contracts while ensuring legal compliance and protecting organizational interests. Reports to Procurement Manager for strategic alignment.",
    requirements: ["5+ years contract management", "Contract law knowledge", "Negotiation skills", "Professional certification preferred"],
    category: "contracts",
    tier: "tier2_identified",
    hiringStatus: "Candidate Identified - Roshonda Parker"
  },
  { 
    id: "ops-coordinator-contracts", 
    title: "Contracts Operations Coordinator", 
    entity: "The L.A.W.S. Collective, LLC",
    entityShort: "L.A.W.S.",
    department: "Contracts",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$52,000 - $72,000",
    description: "Support the Contracts Manager with document management, compliance tracking, and administrative tasks. Maintain contract files, track deadlines, and coordinate approvals.",
    requirements: ["2+ years admin/legal support", "Organization skills", "Document management", "Confidentiality handling"],
    category: "contracts",
    tier: "tier4_coordinator",
    hiringStatus: "Open Position"
  },
  { 
    id: "design-manager", 
    title: "Design Manager", 
    entity: "Real-Eye-Nation, LLC",
    entityShort: "Real-Eye-Nation",
    department: "Design & Creative",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$85,000 - $115,000",
    description: "Lead all visual design and branding initiatives across our organization. Establish brand identity, create design systems, and ensure visual consistency across all entities, marketing materials, and digital platforms.",
    requirements: ["5+ years graphic design/brand management", "Adobe Creative Suite proficiency", "Strong portfolio", "Team leadership experience"],
    category: "design",
    tier: "tier1_family",
    hiringStatus: "Filled - Family (Essence Hunter)"
  },
  { 
    id: "ops-coordinator-design", 
    title: "Design Operations Coordinator", 
    entity: "Real-Eye-Nation, LLC",
    entityShort: "Real-Eye-Nation",
    department: "Design & Creative",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$52,000 - $72,000",
    description: "Support the design function with design production, asset management, and coordination of creative projects across all organizational entities.",
    requirements: ["2+ years graphic design", "Adobe Creative Suite proficiency", "File organization skills", "Multi-project management"],
    category: "design",
    tier: "tier4_coordinator",
    hiringStatus: "Ready to Hire (reports to Essence Hunter)"
  },
  { 
    id: "media-manager", 
    title: "Media Manager", 
    entity: "Real-Eye-Nation, LLC",
    entityShort: "Real-Eye-Nation",
    department: "Media Production",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$85,000 - $115,000",
    description: "Lead all media production and content creation initiatives. Oversee video production, podcasts, social media content, and ensure consistent messaging across all media channels.",
    requirements: ["5+ years media/video production", "Video editing proficiency", "Strong portfolio/reel", "Content team management"],
    category: "media",
    tier: "tier1_family",
    hiringStatus: "Filled - Family (Amandes Pearsall IV)"
  },
  { 
    id: "ops-coordinator-media", 
    title: "Media Operations Coordinator", 
    entity: "Real-Eye-Nation, LLC",
    entityShort: "Real-Eye-Nation",
    department: "Media Production",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$52,000 - $72,000",
    description: "Support media production with video editing, social media management, and coordination of media projects across all platforms.",
    requirements: ["2+ years video/content creation", "Video editing software proficiency", "Social media management", "Project coordination"],
    category: "media",
    tier: "tier4_coordinator",
    hiringStatus: "Ready to Hire (reports to Amandes Pearsall IV)"
  },
  // ============================================
  // PROJECT CONTROLS DEPARTMENT
  // ============================================
  { 
    id: "project-controls-manager", 
    title: "Project Controls Manager", 
    entity: "The L.A.W.S. Collective, LLC",
    entityShort: "L.A.W.S.",
    department: "Project Controls",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$90,000 - $120,000",
    description: "Lead project scheduling, cost control, and progress reporting across all subsidiary entities. Develop and maintain master schedules, perform earned value analysis for grants and contracts, manage change orders, and implement risk mitigation strategies. Ensure all projects stay on track, within budget, and meet deliverable requirements.",
    requirements: ["5+ years project controls/scheduling experience", "Primavera P6 or MS Project proficiency", "Earned value management knowledge", "Cost control and budgeting experience", "PMP or similar certification preferred"],
    category: "project_controls",
    tier: "tier2_identified",
    hiringStatus: "Candidate Identified - Christopher Battle Sr."
  },
  { 
    id: "ops-coordinator-project-controls", 
    title: "Project Controls Operations Coordinator", 
    entity: "The L.A.W.S. Collective, LLC",
    entityShort: "L.A.W.S.",
    department: "Project Controls",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$68,000 - $88,000",
    description: "Support the Project Controls function with schedule updates, cost tracking, change order processing, and progress report compilation. Maintain project documentation, track action items, and assist with risk register maintenance.",
    requirements: ["2+ years project coordination/admin", "Scheduling software familiarity", "Excel/spreadsheet proficiency", "Document control experience", "Attention to detail"],
    category: "project_controls",
    tier: "tier4_coordinator",
    hiringStatus: "Pending Manager",
  },
  // ============================================
  // LEGAL DEPARTMENT
  // ============================================
  { 
    id: "legal-manager", 
    title: "Legal Manager", 
    entity: "The L.A.W.S. Collective, LLC",
    entityShort: "L.A.W.S.",
    department: "Legal",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$95,000 - $130,000",
    description: "Oversee all legal matters across our family of entities. Manage corporate governance, regulatory compliance, intellectual property, and provide legal guidance on business decisions. Coordinate with external counsel as needed and ensure all entities operate within legal requirements.",
    requirements: ["JD or equivalent legal education", "5+ years corporate/nonprofit legal experience", "Multi-entity governance knowledge", "Contract review expertise", "Bar admission preferred"],
    category: "legal",
    tier: "tier3_open",
    hiringStatus: "Open Position",
  },
  { 
    id: "ops-coordinator-legal", 
    title: "Legal Operations Coordinator", 
    entity: "The L.A.W.S. Collective, LLC",
    entityShort: "L.A.W.S.",
    department: "Legal",
    type: "Full-Time",
    location: "Remote",
    salaryRange: "$55,000 - $75,000",
    description: "Support the Legal Manager with document management, compliance tracking, and administrative tasks. Maintain legal files, track deadlines, coordinate with external counsel, and assist with corporate governance documentation.",
    requirements: ["2+ years legal admin/paralegal experience", "Document management skills", "Confidentiality handling", "Legal research basics", "Paralegal certification preferred"],
    category: "legal",
    tier: "tier4_coordinator",
    hiringStatus: "Open Position",
  },
  // ============================================
  // REAL ESTATE DEPARTMENT (Two Managers due to state jurisdiction limits)
  // ============================================
  { 
    id: "real-estate-manager-sc", 
    title: "Real Estate Manager - South Carolina", 
    entity: "The L.A.W.S. Collective, LLC",
    entityShort: "L.A.W.S.",
    department: "Real Estate",
    type: "Full-Time",
    location: "South Carolina",
    salaryRange: "$90,000 - $125,000",
    description: "Lead all real estate acquisition, development, and management activities in South Carolina. Identify property opportunities, manage existing holdings, oversee tenant relations, and develop strategies for building generational wealth through real estate within SC jurisdiction.",
    requirements: ["5+ years real estate management/development", "Property acquisition experience", "Tenant management skills", "South Carolina real estate license required", "Investment analysis capability"],
    category: "real_estate",
    tier: "tier2_identified",
    hiringStatus: "Candidate Identified - Treiva Hunter",
  },
  { 
    id: "real-estate-manager-ga", 
    title: "Real Estate Manager - Georgia", 
    entity: "The L.A.W.S. Collective, LLC",
    entityShort: "L.A.W.S.",
    department: "Real Estate",
    type: "Full-Time",
    location: "Georgia",
    salaryRange: "$90,000 - $125,000",
    description: "Lead all real estate acquisition, development, and management activities in Georgia. Identify property opportunities, manage existing holdings, oversee tenant relations, and develop strategies for building generational wealth through real estate within GA jurisdiction.",
    requirements: ["5+ years real estate management/development", "Property acquisition experience", "Tenant management skills", "Georgia real estate license required", "Investment analysis capability"],
    category: "real_estate",
    tier: "tier2_identified",
    hiringStatus: "Candidate Identified - Kenneth Coleman",
  },
  { 
    id: "ops-coordinator-real-estate-sc", 
    title: "Real Estate Operations Coordinator - South Carolina", 
    entity: "The L.A.W.S. Collective, LLC",
    entityShort: "L.A.W.S.",
    department: "Real Estate",
    type: "Full-Time",
    location: "South Carolina",
    salaryRange: "$52,000 - $72,000",
    description: "Support the SC Real Estate Manager (Treiva Hunter) with property documentation, tenant communications, lease administration, and coordination of maintenance activities for South Carolina properties. Maintain property records, track lease renewals, and assist with property showings.",
    requirements: ["2+ years property management/admin", "Lease administration knowledge", "Tenant communication skills", "Document organization", "Real estate software familiarity"],
    category: "real_estate",
    tier: "tier4_coordinator",
    hiringStatus: "Open Position",
  },
  { 
    id: "ops-coordinator-real-estate-ga", 
    title: "Real Estate Operations Coordinator - Georgia", 
    entity: "The L.A.W.S. Collective, LLC",
    entityShort: "L.A.W.S.",
    department: "Real Estate",
    type: "Full-Time",
    location: "Georgia",
    salaryRange: "$52,000 - $72,000",
    description: "Support the GA Real Estate Manager (Kenneth Coleman) with property documentation, tenant communications, lease administration, and coordination of maintenance activities for Georgia properties. Maintain property records, track lease renewals, and assist with property showings.",
    requirements: ["2+ years property management/admin", "Lease administration knowledge", "Tenant communication skills", "Document organization", "Real estate software familiarity"],
    category: "real_estate",
    tier: "tier4_coordinator",
    hiringStatus: "Open Position",
  },
];

// Add hiring status filter categories
const HIRING_STATUSES = [
  { id: "all", label: "All Positions" },
  { id: "actively_recruiting", label: "Actively Recruiting", filter: (p: typeof POSITIONS[0]) => p.hiringStatus?.includes("Actively") || p.hiringStatus?.includes("Ready to Hire") },
  { id: "open_position", label: "Open Position", filter: (p: typeof POSITIONS[0]) => p.hiringStatus === "Open Position" },
  { id: "future_hiring", label: "Future Hiring", filter: (p: typeof POSITIONS[0]) => p.hiringStatus === "Future Hiring" },
  { id: "pending_manager", label: "Pending Manager", filter: (p: typeof POSITIONS[0]) => p.hiringStatus === "Pending Manager" },
  { id: "filled_family", label: "Filled (Family)", filter: (p: typeof POSITIONS[0]) => p.hiringStatus?.includes("Filled") },
  { id: "candidate_identified", label: "Candidate Identified", filter: (p: typeof POSITIONS[0]) => p.hiringStatus?.includes("Candidate Identified") },
];

const CATEGORIES = [
  { id: "all", label: "All Positions", count: POSITIONS.length },
  { id: "operations", label: "Operations", count: POSITIONS.filter(p => p.category === "operations").length },
  { id: "finance", label: "Finance", count: POSITIONS.filter(p => p.category === "finance" || p.department === "Finance").length },
  { id: "project_controls", label: "Project Controls", count: POSITIONS.filter(p => p.category === "project_controls").length },
  { id: "contracts", label: "Contracts", count: POSITIONS.filter(p => p.category === "contracts").length },
  { id: "community", label: "Community", count: POSITIONS.filter(p => p.category === "community").length },
  { id: "education", label: "Education", count: POSITIONS.filter(p => p.category === "education").length },
  { id: "health", label: "Health", count: POSITIONS.filter(p => p.category === "health").length },
  { id: "design", label: "Design", count: POSITIONS.filter(p => p.category === "design").length },
  { id: "media", label: "Media", count: POSITIONS.filter(p => p.category === "media").length },
  { id: "technology", label: "Technology", count: POSITIONS.filter(p => p.category === "technology").length },
  { id: "legal", label: "Legal", count: POSITIONS.filter(p => p.category === "legal").length },
  { id: "real_estate", label: "Real Estate", count: POSITIONS.filter(p => p.category === "real_estate").length },
];

const BENEFITS = [
  { icon: Heart, title: "Ownership Stake", description: "Become a true stakeholder in the organization you help build" },
  { icon: GraduationCap, title: "Free Certifications", description: "Access to all Academy courses and certifications at no cost" },
  { icon: Clock, title: "Flexible Schedule", description: "Work arrangements that fit your life and responsibilities" },
  { icon: Users, title: "Governance Voice", description: "Participate in decisions that shape the organization's future" },
  { icon: Target, title: "Purpose-Driven Work", description: "Make a real impact on families and communities" },
  { icon: Globe, title: "Remote-First", description: "Work from anywhere with occasional in-person gatherings" },
  { icon: Wifi, title: "Utilities Stipend", description: "Monthly support for internet and electricity costs" },
  { icon: Laptop, title: "Equipment Provided", description: "Laptop, phone, and software licenses included" },
  { icon: Shirt, title: "Wardrobe Budget", description: "Professional appearance allowance for public-facing roles" },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export default function Careers() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedHiringStatus, setSelectedHiringStatus] = useState("all");
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<typeof POSITIONS[0] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [application, setApplication] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    currentRole: "",
    yearsExperience: "",
    relevantSkills: "",
    whyInterested: "",
    coverLetter: ""
  });

  const submitMutation = trpc.jobApplications.submit.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setShowApplyDialog(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit application. Please try again.");
      setIsSubmitting(false);
    }
  });

  const filteredPositions = POSITIONS.filter(p => {
    const categoryMatch = selectedCategory === "all" || p.category === selectedCategory;
    const statusFilter = HIRING_STATUSES.find(s => s.id === selectedHiringStatus);
    const statusMatch = selectedHiringStatus === "all" || (statusFilter?.filter && statusFilter.filter(p));
    return categoryMatch && statusMatch;
  });

  const handleApply = (position: typeof POSITIONS[0]) => {
    setSelectedPosition(position);
    setShowApplyDialog(true);
  };

  const resetForm = () => {
    setApplication({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      currentRole: "",
      yearsExperience: "",
      relevantSkills: "",
      whyInterested: "",
      coverLetter: ""
    });
    setResumeFile(null);
    setIsSubmitting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error("Please upload a PDF or Word document");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setResumeFile(file);
  };

  const removeResume = () => {
    setResumeFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmitApplication = async () => {
    if (!application.firstName || !application.lastName || !application.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      let resumeData: string | undefined;
      let resumeFileName: string | undefined;
      let resumeMimeType: string | undefined;

      // Convert resume file to base64 if provided
      if (resumeFile) {
        const reader = new FileReader();
        resumeData = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(resumeFile);
        });
        resumeFileName = resumeFile.name;
        resumeMimeType = resumeFile.type;
      }

      await submitMutation.mutateAsync({
        positionId: selectedPosition?.id || "general-interest",
        positionTitle: selectedPosition?.title || "General Interest",
        entity: selectedPosition?.entity || "LuvOnPurpose Family Enterprise",
        firstName: application.firstName,
        lastName: application.lastName,
        email: application.email,
        phone: application.phone || undefined,
        currentRole: application.currentRole || undefined,
        yearsExperience: application.yearsExperience || undefined,
        relevantSkills: application.relevantSkills || undefined,
        whyInterested: application.whyInterested || undefined,
        coverLetter: application.coverLetter || undefined,
        resumeData,
        resumeFileName,
        resumeMimeType,
      });
    } catch (error) {
      // Error handled by mutation onError
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-primary" />
                <div>
                  <span className="font-bold text-foreground">The L.A.W.S. Collective, LLC</span>
                  <span className="text-xs text-muted-foreground block">Land • Air • Water • Self</span>
                </div>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
              <Link href="/academy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Academy</Link>
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Services</Link>
              <span className="text-sm font-medium text-primary">Careers</span>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4">We're Hiring</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Join Our Mission to Build
              <span className="text-primary"> Generational Wealth</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              We're building something different—a family enterprise focused on community development, 
              education, and creating lasting prosperity. Join us and become a true stakeholder in our shared success.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" onClick={() => document.getElementById('positions')?.scrollIntoView({ behavior: 'smooth' })}>
                View Open Positions
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/getting-started">Learn About Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">Why Join LuvOnPurpose?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((benefit, idx) => (
              <Card key={idx} className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <benefit.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Organization Chart Section */}
      <section className="py-16">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-4">Our Organization</h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            See how our team is structured and where you might fit in. Click on positions to expand their reporting structure.
          </p>
          <OrgChart />
        </div>
      </section>

      {/* Positions Section */}
      <section id="positions" className="py-16 bg-muted/30">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-4">Position Directory</h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            Our family-based management structure means Manager positions are filled by family members, while Operations Coordinator roles are our primary external hires.
          </p>

          {/* Hiring Status Filter */}
          <div className="mb-6">
            <p className="text-sm text-center text-muted-foreground mb-2">Filter by Hiring Status:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {HIRING_STATUSES.map((status) => (
                <Button
                  key={status.id}
                  variant={selectedHiringStatus === status.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setSelectedHiringStatus(status.id); setSelectedCategory("all"); }}
                >
                  {status.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-4">
            <p className="text-sm text-center text-muted-foreground mb-2">Filter by Department:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setSelectedCategory(cat.id); setSelectedHiringStatus("all"); }}
                >
                  {cat.label} ({cat.count})
                </Button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <p className="text-center text-sm text-muted-foreground mb-8">
            Showing {filteredPositions.length} of {POSITIONS.length} positions
          </p>

          {/* Position Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPositions.map((position) => (
              <Card key={position.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{position.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Building2 className="w-4 h-4" />
                        {position.entity}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <Badge variant="outline">{position.entityShort}</Badge>
                      {position.hiringStatus && (
                        <Badge 
                          variant={position.hiringStatus.includes("Actively") || position.hiringStatus.includes("Ready") ? "default" : 
                                   position.hiringStatus.includes("Filled") ? "secondary" : "outline"}
                          className={`text-xs ${position.hiringStatus.includes("Actively") || position.hiringStatus.includes("Ready") ? "bg-green-600" : 
                                      position.hiringStatus.includes("Filled") ? "bg-purple-600 text-white" : ""}`}
                        >
                          {position.hiringStatus}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{position.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {position.type}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      <MapPin className="w-3 h-3 mr-1" />
                      {position.location}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      <Briefcase className="w-3 h-3 mr-1" />
                      {position.department}
                    </Badge>
                    <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-700">
                      <DollarSign className="w-3 h-3 mr-1" />
                      {position.salaryRange}
                    </Badge>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Requirements:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {position.requirements.slice(0, 3).map((req, idx) => (
                        <li key={idx} className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {position.hiringStatus?.includes("Filled") ? (
                    <Button className="w-full" variant="secondary" disabled>
                      Position Filled
                    </Button>
                  ) : position.hiringStatus === "Candidate Identified" ? (
                    <Button className="w-full" variant="outline" disabled>
                      Candidate Identified - Not Recruiting
                    </Button>
                  ) : position.hiringStatus === "Future Hiring" ? (
                    <Button className="w-full" variant="outline" onClick={() => {
                      setSelectedPosition(null);
                      setShowApplyDialog(true);
                    }}>
                      Express Interest
                      <Send className="w-4 h-4 ml-2" />
                    </Button>
                  ) : position.hiringStatus === "Pending Manager" ? (
                    <Button className="w-full" variant="outline" onClick={() => {
                      setSelectedPosition(null);
                      setShowApplyDialog(true);
                    }}>
                      Express Interest (Pending Manager)
                      <Send className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button className="w-full" onClick={() => handleApply(position)}>
                      Apply Now
                      <Send className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Don't See the Right Fit?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            We're always looking for talented individuals who share our vision. 
            Send us your information and we'll keep you in mind for future opportunities.
          </p>
          <Button variant="outline" size="lg" onClick={() => {
            setSelectedPosition(null);
            setShowApplyDialog(true);
          }}>
            <FileText className="w-4 h-4 mr-2" />
            Submit General Interest
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 LuvOnPurpose Family Enterprise. Building Multi-Generational Wealth Through Purpose & Community.
            </p>
            <div className="flex gap-4">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">Home</Link>
              <Link href="/academy" className="text-sm text-muted-foreground hover:text-foreground">Academy</Link>
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">Services</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Apply Dialog */}
      <Dialog open={showApplyDialog} onOpenChange={(open) => {
        setShowApplyDialog(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPosition ? `Apply for ${selectedPosition.title}` : "Express Interest"}
            </DialogTitle>
            <DialogDescription>
              {selectedPosition 
                ? `Submit your application for the ${selectedPosition.title} position at ${selectedPosition.entity}.`
                : "Tell us about yourself and we'll keep you in mind for future opportunities."
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  placeholder="Your first name"
                  value={application.firstName}
                  onChange={(e) => setApplication({ ...application, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  placeholder="Your last name"
                  value={application.lastName}
                  onChange={(e) => setApplication({ ...application, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={application.email}
                  onChange={(e) => setApplication({ ...application, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 555-5555"
                  value={application.phone}
                  onChange={(e) => setApplication({ ...application, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentRole">Current Role</Label>
                <Input
                  id="currentRole"
                  placeholder="Your current job title"
                  value={application.currentRole}
                  onChange={(e) => setApplication({ ...application, currentRole: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearsExperience">Years of Experience</Label>
                <Input
                  id="yearsExperience"
                  placeholder="e.g., 5 years"
                  value={application.yearsExperience}
                  onChange={(e) => setApplication({ ...application, yearsExperience: e.target.value })}
                />
              </div>
            </div>

            {/* Resume Upload Section */}
            <div className="space-y-2">
              <Label htmlFor="resume">Resume / CV</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4">
                {resumeFile ? (
                  <div className="flex items-center justify-between bg-muted/50 p-3 rounded-md">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{resumeFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(resumeFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeResume}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag and drop your resume, or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      PDF or Word document, max 5MB
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Select File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="relevantSkills">Relevant Skills</Label>
              <Textarea
                id="relevantSkills"
                placeholder="List your relevant skills and experience..."
                value={application.relevantSkills}
                onChange={(e) => setApplication({ ...application, relevantSkills: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whyInterested">Why are you interested?</Label>
              <Textarea
                id="whyInterested"
                placeholder="Tell us why you're interested in joining LuvOnPurpose..."
                value={application.whyInterested}
                onChange={(e) => setApplication({ ...application, whyInterested: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
              <Textarea
                id="coverLetter"
                placeholder="Add a brief cover letter..."
                value={application.coverLetter}
                onChange={(e) => setApplication({ ...application, coverLetter: e.target.value })}
                rows={4}
              />
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Your application will be reviewed by our HR team. 
                We typically respond within 5-7 business days if there's a good fit.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApplyDialog(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmitApplication} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
