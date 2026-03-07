import { useState } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Award,
  ChevronRight,
  GraduationCap,
  Shield,
  DollarSign,
  Eye,
  Package,
  Settings,
  CheckCircle,
  Users,
  Target,
  FileText,
} from "lucide-react";

interface CurriculumModule {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  topics: string[];
  activities: string[];
  assessments: string[];
  duration: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  prerequisites?: string[];
  certificationTitle?: string;
}

interface EntityCurriculumData {
  entityId: string;
  entityName: string;
  curriculumName: string;
  description: string;
  targetAudience: string;
  modules: CurriculumModule[];
  totalDuration: string;
  certificationPath: string;
  icon: React.ReactNode;
  color: string;
}

// Entity Curricula Data
const curricula: EntityCurriculumData[] = [
  {
    entityId: "trust",
    entityName: "CALEA Freeman Family Trust",
    curriculumName: "Lineage & Sovereignty",
    description: "Understanding family legacy, trust structures, asset protection, and generational wealth transfer for sovereign operations.",
    targetAudience: "Family members, trustees, beneficiaries, and administrators",
    totalDuration: "40 hours",
    certificationPath: "Certified Trust Administrator",
    icon: <Shield className="w-6 h-6" />,
    color: "text-amber-600",
    modules: [
      {
        id: "ls-101",
        title: "Foundations of Family Legacy",
        description: "Understanding the purpose and structure of family trusts for generational wealth preservation.",
        objectives: [
          "Understand the historical context of family trusts",
          "Identify the core components of a family trust structure",
          "Recognize the role of trustees and beneficiaries",
          "Articulate the vision for multi-generational wealth"
        ],
        topics: [
          "History of family trusts and wealth preservation",
          "Trust structures: revocable vs irrevocable",
          "Roles: Grantor, Trustee, Beneficiary",
          "The CALEA Freeman Family Trust vision",
          "Generational wealth principles"
        ],
        activities: [
          "Family tree mapping exercise",
          "Trust document review workshop",
          "Vision statement drafting",
          "Legacy letter writing"
        ],
        assessments: [
          "Trust structure identification quiz",
          "Role-play: Trustee decision scenarios",
          "Written reflection on family legacy"
        ],
        duration: "8 hours",
        difficulty: "beginner",
        certificationTitle: "Legacy Foundation Certificate"
      },
      {
        id: "ls-102",
        title: "Asset Protection Strategies",
        description: "Legal and structural methods for protecting family assets across generations.",
        objectives: [
          "Understand asset protection legal frameworks",
          "Identify liability separation techniques",
          "Apply asset titling best practices",
          "Implement protection strategies"
        ],
        topics: [
          "Legal entity structures (LLC, Trust, Corporation)",
          "Liability separation and charging order protection",
          "Asset titling and ownership structures",
          "Insurance as a protection layer",
          "Fraudulent transfer laws and compliance"
        ],
        activities: [
          "Entity structure mapping",
          "Asset inventory and titling review",
          "Protection gap analysis",
          "Strategy implementation planning"
        ],
        assessments: [
          "Entity selection case study",
          "Asset protection plan presentation",
          "Compliance checklist completion"
        ],
        duration: "8 hours",
        difficulty: "intermediate",
        prerequisites: ["ls-101"],
        certificationTitle: "Asset Protection Specialist"
      },
      {
        id: "ls-103",
        title: "Governance & Decision Making",
        description: "Establishing governance structures and decision-making processes for family enterprises.",
        objectives: [
          "Design effective governance frameworks",
          "Implement decision-making protocols",
          "Manage family dynamics in business",
          "Create succession planning processes"
        ],
        topics: [
          "Family governance models",
          "Decision authority and escalation paths",
          "Conflict resolution mechanisms",
          "Succession planning fundamentals",
          "Family council and meeting structures"
        ],
        activities: [
          "Governance charter drafting",
          "Decision matrix creation",
          "Conflict resolution simulation",
          "Succession plan outline"
        ],
        assessments: [
          "Governance framework design project",
          "Decision scenario role-play",
          "Succession plan presentation"
        ],
        duration: "8 hours",
        difficulty: "intermediate",
        prerequisites: ["ls-101"],
        certificationTitle: "Governance Specialist"
      },
      {
        id: "ls-104",
        title: "Sovereignty & Self-Determination",
        description: "Principles of sovereign operations, self-governance, and autonomous wealth systems.",
        objectives: [
          "Understand sovereignty in the context of family wealth",
          "Apply self-determination principles to financial decisions",
          "Build autonomous systems for wealth management",
          "Maintain independence from external dependencies"
        ],
        topics: [
          "Sovereignty principles and philosophy",
          "Self-determination in financial matters",
          "Autonomous wealth system design",
          "Reducing external dependencies",
          "Building resilient family systems"
        ],
        activities: [
          "Sovereignty assessment exercise",
          "Dependency mapping and reduction planning",
          "Autonomous system design workshop",
          "Resilience stress testing"
        ],
        assessments: [
          "Sovereignty philosophy essay",
          "Autonomous system design project",
          "Resilience plan presentation"
        ],
        duration: "8 hours",
        difficulty: "advanced",
        prerequisites: ["ls-102", "ls-103"],
        certificationTitle: "Sovereignty Master"
      },
      {
        id: "ls-105",
        title: "Generational Transfer & Legacy",
        description: "Executing wealth transfer across generations while preserving family values and vision.",
        objectives: [
          "Plan effective wealth transfer strategies",
          "Prepare next generation for stewardship",
          "Document and preserve family values",
          "Ensure continuity of family enterprises"
        ],
        topics: [
          "Wealth transfer mechanisms and timing",
          "Next generation preparation programs",
          "Family values documentation",
          "Enterprise continuity planning",
          "Legacy preservation techniques"
        ],
        activities: [
          "Transfer strategy workshop",
          "Next-gen mentorship program design",
          "Family values documentation project",
          "Continuity plan development"
        ],
        assessments: [
          "Comprehensive transfer plan",
          "Mentorship program proposal",
          "Legacy documentation portfolio"
        ],
        duration: "8 hours",
        difficulty: "advanced",
        prerequisites: ["ls-104"],
        certificationTitle: "Legacy Transfer Master"
      }
    ]
  },
  {
    entityId: "academy",
    entityName: "LuvOnPurpose Academy & Outreach",
    curriculumName: "Financial Literacy",
    description: "Comprehensive financial education covering personal finance, business finance, and wealth building strategies.",
    targetAudience: "Community members, students, entrepreneurs, and families",
    totalDuration: "60 hours",
    certificationPath: "Certified Financial Literacy Educator",
    icon: <DollarSign className="w-6 h-6" />,
    color: "text-green-600",
    modules: [
      {
        id: "fl-101",
        title: "Personal Finance Foundations",
        description: "Building a solid foundation in personal financial management.",
        objectives: ["Create and maintain a personal budget", "Understand income, expenses, and cash flow", "Establish emergency fund strategies", "Set and track financial goals"],
        topics: ["Budgeting methods", "Income streams and expense categories", "Emergency fund building", "Financial goal setting", "Tracking tools"],
        activities: ["Personal budget creation", "Expense tracking challenge", "Emergency fund calculator", "Financial vision board"],
        assessments: ["Budget presentation", "Expense analysis report", "Financial goal plan"],
        duration: "10 hours",
        difficulty: "beginner",
        certificationTitle: "Personal Finance Foundation Certificate"
      },
      {
        id: "fl-102",
        title: "Banking & Credit Management",
        description: "Understanding banking systems, credit, and debt management strategies.",
        objectives: ["Navigate banking products", "Build and maintain good credit", "Manage and eliminate debt", "Protect against fraud"],
        topics: ["Bank accounts", "Credit scores and reports", "Debt management strategies", "Credit building", "Fraud prevention"],
        activities: ["Credit report review", "Debt payoff calculator", "Bank account comparison", "Fraud prevention checklist"],
        assessments: ["Credit improvement plan", "Debt elimination strategy", "Banking case study"],
        duration: "10 hours",
        difficulty: "beginner",
        certificationTitle: "Credit & Banking Specialist"
      },
      {
        id: "fl-103",
        title: "Investing Fundamentals",
        description: "Introduction to investing principles and wealth building through investments.",
        objectives: ["Understand investment vehicles", "Apply risk assessment", "Create investment strategy", "Evaluate performance"],
        topics: ["Stocks, bonds, mutual funds, ETFs", "Risk tolerance", "Diversification", "Compound interest", "Retirement accounts"],
        activities: ["Risk tolerance questionnaire", "Mock portfolio creation", "Compound interest calculator", "Investment research"],
        assessments: ["Investment strategy presentation", "Portfolio analysis", "Retirement planning worksheet"],
        duration: "12 hours",
        difficulty: "intermediate",
        prerequisites: ["fl-101"],
        certificationTitle: "Investment Foundations Certificate"
      },
      {
        id: "fl-104",
        title: "Business Finance Essentials",
        description: "Financial management principles for entrepreneurs and business owners.",
        objectives: ["Read financial statements", "Manage business cash flow", "Make informed decisions", "Plan for growth"],
        topics: ["Financial statements", "Business budgeting", "Pricing strategies", "Business credit", "Tax planning"],
        activities: ["Financial statement analysis", "Business budget creation", "Pricing strategy exercise", "Financing comparison"],
        assessments: ["Financial statement test", "Business financial plan", "Cash flow projection"],
        duration: "12 hours",
        difficulty: "intermediate",
        prerequisites: ["fl-102"],
        certificationTitle: "Business Finance Specialist"
      },
      {
        id: "fl-105",
        title: "Wealth Building Strategies",
        description: "Advanced strategies for building and preserving generational wealth.",
        objectives: ["Develop multiple income streams", "Implement tax optimization", "Create wealth transfer plans", "Build sustainable systems"],
        topics: ["Multiple income streams", "Real estate investing", "Tax-advantaged building", "Estate planning", "Generational wealth"],
        activities: ["Income stream brainstorming", "Real estate analysis", "Tax optimization planning", "Estate planning checklist"],
        assessments: ["Wealth building strategy", "Income diversification plan", "Estate planning outline"],
        duration: "10 hours",
        difficulty: "advanced",
        prerequisites: ["fl-103", "fl-104"],
        certificationTitle: "Wealth Builder Certificate"
      },
      {
        id: "fl-106",
        title: "Teaching Financial Literacy",
        description: "Preparing educators to teach financial literacy in their communities.",
        objectives: ["Adapt concepts for audiences", "Create engaging materials", "Facilitate workshops", "Measure outcomes"],
        topics: ["Adult learning principles", "Curriculum adaptation", "Facilitation skills", "Assessment methods", "Community outreach"],
        activities: ["Lesson plan development", "Practice teaching", "Material creation", "Workshop planning"],
        assessments: ["Teaching demonstration", "Curriculum adaptation project", "Community workshop execution"],
        duration: "6 hours",
        difficulty: "advanced",
        prerequisites: ["fl-105"],
        certificationTitle: "Certified Financial Literacy Educator"
      }
    ]
  },
  {
    entityId: "media",
    entityName: "Real-Eye-Nation",
    curriculumName: "Truth & Narrative",
    description: "Media literacy, storytelling, and truth-seeking in the digital age. Creating authentic narratives that empower communities.",
    targetAudience: "Content creators, journalists, community storytellers, and media professionals",
    totalDuration: "48 hours",
    certificationPath: "Certified Truth Narrator",
    icon: <Eye className="w-6 h-6" />,
    color: "text-purple-600",
    modules: [
      {
        id: "tn-101",
        title: "Media Literacy Foundations",
        description: "Critical analysis of media, identifying bias, and understanding information ecosystems.",
        objectives: ["Analyze media sources", "Understand information spread", "Identify misinformation", "Develop critical habits"],
        topics: ["Media landscape", "Source evaluation", "Bias identification", "Verification methods", "Digital literacy"],
        activities: ["Source credibility analysis", "Bias detection workshop", "Fact-checking challenge", "Media consumption audit"],
        assessments: ["Source evaluation portfolio", "Bias analysis report", "Misinformation case study"],
        duration: "8 hours",
        difficulty: "beginner",
        certificationTitle: "Media Literacy Foundation Certificate"
      },
      {
        id: "tn-102",
        title: "Authentic Storytelling",
        description: "Crafting genuine narratives that connect with audiences and convey truth.",
        objectives: ["Develop authentic voice", "Structure compelling narratives", "Connect to universal themes", "Maintain integrity"],
        topics: ["Finding your voice", "Narrative structure", "Character development", "Emotional truth", "Ethics in storytelling"],
        activities: ["Personal story development", "Narrative structure workshop", "Voice finding exercises", "Story ethics discussion"],
        assessments: ["Personal narrative presentation", "Story structure analysis", "Authentic voice portfolio"],
        duration: "10 hours",
        difficulty: "beginner",
        certificationTitle: "Authentic Storyteller Certificate"
      },
      {
        id: "tn-103",
        title: "Digital Content Creation",
        description: "Creating impactful content across digital platforms while maintaining authenticity.",
        objectives: ["Produce quality content", "Optimize for platforms", "Build audiences", "Measure impact"],
        topics: ["Video production", "Podcast creation", "Written content", "Platform optimization", "Analytics"],
        activities: ["Video production workshop", "Podcast episode creation", "Multi-platform strategy", "Analytics interpretation"],
        assessments: ["Content portfolio", "Platform strategy presentation", "Impact analysis report"],
        duration: "12 hours",
        difficulty: "intermediate",
        prerequisites: ["tn-102"],
        certificationTitle: "Digital Content Creator"
      },
      {
        id: "tn-104",
        title: "Community Journalism",
        description: "Reporting on community issues with accuracy, fairness, and impact.",
        objectives: ["Apply journalistic principles", "Conduct ethical interviews", "Present balanced stories", "Amplify community voices"],
        topics: ["Journalism ethics", "Interview techniques", "Research and fact-checking", "Balanced reporting", "Voice amplification"],
        activities: ["Community story development", "Interview practice", "Fact-checking workshop", "Community reporting project"],
        assessments: ["Community story publication", "Interview portfolio", "Ethics case study analysis"],
        duration: "10 hours",
        difficulty: "intermediate",
        prerequisites: ["tn-101"],
        certificationTitle: "Community Journalist Certificate"
      },
      {
        id: "tn-105",
        title: "Counter-Narrative Development",
        description: "Creating narratives that challenge dominant stories and empower marginalized voices.",
        objectives: ["Analyze dominant narratives", "Develop counter-narratives", "Amplify marginalized perspectives", "Build movements"],
        topics: ["Dominant narrative analysis", "Counter-narrative strategies", "Voice amplification", "Movement building", "Historical reclamation"],
        activities: ["Narrative deconstruction", "Counter-narrative creation", "Voice amplification project", "Movement narrative planning"],
        assessments: ["Counter-narrative campaign", "Voice amplification portfolio", "Movement narrative presentation"],
        duration: "8 hours",
        difficulty: "advanced",
        prerequisites: ["tn-103", "tn-104"],
        certificationTitle: "Counter-Narrative Specialist"
      }
    ]
  },
  {
    entityId: "commercial",
    entityName: "The L.A.W.S. Collective - Services",
    curriculumName: "Product Development",
    description: "From idea to market: developing products and services that create value and generate sustainable revenue.",
    targetAudience: "Entrepreneurs, product managers, business developers, and innovators",
    totalDuration: "50 hours",
    certificationPath: "Certified Product Developer",
    icon: <Package className="w-6 h-6" />,
    color: "text-blue-600",
    modules: [
      {
        id: "pd-101",
        title: "Ideation & Validation",
        description: "Generating, evaluating, and validating product ideas before investment.",
        objectives: ["Generate innovative ideas", "Evaluate against market needs", "Validate with minimal investment", "Pivot or proceed based on data"],
        topics: ["Ideation techniques", "Problem-solution fit", "Market validation", "MVP concepts", "Pivot frameworks"],
        activities: ["Ideation workshop", "Problem interviews", "MVP planning", "Validation experiment design"],
        assessments: ["Idea pitch presentation", "Validation report", "MVP specification"],
        duration: "10 hours",
        difficulty: "beginner",
        certificationTitle: "Idea Validation Specialist"
      },
      {
        id: "pd-102",
        title: "Product Design & Development",
        description: "Designing and building products that solve real problems effectively.",
        objectives: ["Apply user-centered design", "Create specifications and roadmaps", "Manage development", "Iterate based on feedback"],
        topics: ["User-centered design", "Product specifications", "Agile methodologies", "Prototyping", "Iteration cycles"],
        activities: ["User research project", "Specification writing", "Prototype development", "User testing sessions"],
        assessments: ["Product specification document", "Prototype demonstration", "User testing report"],
        duration: "12 hours",
        difficulty: "intermediate",
        prerequisites: ["pd-101"],
        certificationTitle: "Product Designer Certificate"
      },
      {
        id: "pd-103",
        title: "Go-to-Market Strategy",
        description: "Launching products successfully with effective market entry strategies.",
        objectives: ["Develop go-to-market plans", "Identify target customers", "Create value propositions", "Execute launches"],
        topics: ["Market segmentation", "Value proposition", "Pricing strategies", "Channel selection", "Launch planning"],
        activities: ["Market segmentation exercise", "Value proposition canvas", "Pricing strategy workshop", "Launch plan development"],
        assessments: ["Go-to-market plan", "Value proposition pitch", "Launch execution simulation"],
        duration: "10 hours",
        difficulty: "intermediate",
        prerequisites: ["pd-102"],
        certificationTitle: "Go-to-Market Strategist"
      },
      {
        id: "pd-104",
        title: "IP Protection & Licensing",
        description: "Protecting intellectual property and creating licensing revenue streams.",
        objectives: ["Understand IP protection", "Develop IP strategies", "Create licensing agreements", "Monetize IP assets"],
        topics: ["Types of IP", "Protection strategies", "Licensing models", "IP valuation", "Enforcement"],
        activities: ["IP audit exercise", "Protection strategy development", "Licensing agreement review", "IP monetization planning"],
        assessments: ["IP protection plan", "Licensing strategy presentation", "IP portfolio valuation"],
        duration: "8 hours",
        difficulty: "advanced",
        prerequisites: ["pd-103"],
        certificationTitle: "IP Protection Specialist"
      },
      {
        id: "pd-105",
        title: "Product Scaling & Growth",
        description: "Scaling products from initial success to sustainable growth.",
        objectives: ["Identify scaling opportunities", "Build scalable systems", "Manage growth sustainably", "Expand into new markets"],
        topics: ["Scaling frameworks", "Operational scalability", "Growth metrics", "Market expansion", "Sustainable growth"],
        activities: ["Scaling readiness assessment", "Growth plan development", "Metrics dashboard creation", "Expansion strategy workshop"],
        assessments: ["Scaling strategy presentation", "Growth metrics report", "Expansion plan document"],
        duration: "10 hours",
        difficulty: "advanced",
        prerequisites: ["pd-104"],
        certificationTitle: "Product Scaling Master"
      }
    ]
  },
  {
    entityId: "platform",
    entityName: "The L.A.W.S. Collective - Platform",
    curriculumName: "Platform Administration",
    description: "Managing and administering the L.A.W.S. platform, including simulators, member tools, and infrastructure.",
    targetAudience: "Platform administrators, system operators, and technical staff",
    totalDuration: "45 hours",
    certificationPath: "Certified Platform Administrator",
    icon: <Settings className="w-6 h-6" />,
    color: "text-slate-600",
    modules: [
      {
        id: "pa-101",
        title: "Platform Overview & Architecture",
        description: "Understanding the L.A.W.S. platform structure, components, and how they work together.",
        objectives: ["Understand platform architecture", "Navigate administrative interfaces", "Identify system dependencies", "Monitor platform health"],
        topics: ["Platform architecture", "Component relationships", "Administrative interfaces", "Health monitoring", "System documentation"],
        activities: ["Architecture mapping", "Admin interface exploration", "Health check procedures", "Documentation review"],
        assessments: ["Architecture diagram creation", "Admin task completion checklist", "Health monitoring report"],
        duration: "8 hours",
        difficulty: "beginner",
        certificationTitle: "Platform Foundations Certificate"
      },
      {
        id: "pa-102",
        title: "User & Access Management",
        description: "Managing users, roles, permissions, and access control across the platform.",
        objectives: ["Manage user accounts", "Configure roles and permissions", "Implement access control", "Audit user activities"],
        topics: ["User account lifecycle", "Role-based access control", "Permission configuration", "Access audit", "Security best practices"],
        activities: ["User provisioning exercise", "Role configuration workshop", "Access audit simulation", "Security review checklist"],
        assessments: ["User management scenario test", "Role configuration project", "Access audit report"],
        duration: "8 hours",
        difficulty: "intermediate",
        prerequisites: ["pa-101"],
        certificationTitle: "Access Management Specialist"
      },
      {
        id: "pa-103",
        title: "Simulator Management",
        description: "Administering training simulators, scenarios, and learning pathways.",
        objectives: ["Configure simulator modules", "Create training scenarios", "Track learner progress", "Optimize effectiveness"],
        topics: ["Simulator architecture", "Scenario creation", "Progress tracking", "Performance optimization", "Content versioning"],
        activities: ["Simulator configuration", "Scenario creation workshop", "Progress report generation", "Performance analysis"],
        assessments: ["Simulator setup project", "Scenario development portfolio", "Effectiveness analysis report"],
        duration: "10 hours",
        difficulty: "intermediate",
        prerequisites: ["pa-102"],
        certificationTitle: "Simulator Administrator"
      },
      {
        id: "pa-104",
        title: "Token Economy Administration",
        description: "Managing the platform's token economy, distributions, and conversions.",
        objectives: ["Understand token economy", "Manage distributions", "Monitor circulation", "Handle support issues"],
        topics: ["Token economy fundamentals", "Distribution management", "Circulation monitoring", "Conversion processes", "Troubleshooting"],
        activities: ["Token distribution simulation", "Allocation configuration", "Circulation report analysis", "Support scenario role-play"],
        assessments: ["Token management scenario test", "Distribution plan project", "Economy health report"],
        duration: "8 hours",
        difficulty: "advanced",
        prerequisites: ["pa-103"],
        certificationTitle: "Token Economy Administrator"
      },
      {
        id: "pa-105",
        title: "System Maintenance & Troubleshooting",
        description: "Maintaining platform health, resolving issues, and ensuring continuous operation.",
        objectives: ["Perform routine maintenance", "Diagnose and resolve issues", "Implement backup and recovery", "Escalate complex issues"],
        topics: ["Routine maintenance", "Troubleshooting methodologies", "Backup and recovery", "Incident management", "Documentation"],
        activities: ["Maintenance checklist execution", "Troubleshooting simulation", "Backup/recovery drill", "Incident response exercise"],
        assessments: ["Maintenance procedure demonstration", "Troubleshooting scenario test", "Incident response evaluation"],
        duration: "11 hours",
        difficulty: "advanced",
        prerequisites: ["pa-104"],
        certificationTitle: "Certified Platform Administrator"
      }
    ]
  }
];

export default function EntityCurriculum() {
  const [selectedCurriculum, setSelectedCurriculum] = useState<EntityCurriculumData | null>(null);
  const [selectedModule, setSelectedModule] = useState<CurriculumModule | null>(null);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-yellow-100 text-yellow-800";
      case "advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (selectedModule && selectedCurriculum) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-5xl mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => setSelectedModule(null)}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {selectedCurriculum.curriculumName}
          </Button>

          <Card className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <Badge className={getDifficultyColor(selectedModule.difficulty)} variant="outline">
                  {selectedModule.difficulty}
                </Badge>
                <h1 className="text-2xl font-bold text-foreground mt-2">{selectedModule.title}</h1>
                <p className="text-muted-foreground mt-1">{selectedModule.description}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{selectedModule.duration}</span>
                </div>
                {selectedModule.certificationTitle && (
                  <div className="flex items-center gap-2 text-primary mt-2">
                    <Award className="w-4 h-4" />
                    <span className="text-sm">{selectedModule.certificationTitle}</span>
                  </div>
                )}
              </div>
            </div>

            {selectedModule.prerequisites && selectedModule.prerequisites.length > 0 && (
              <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm font-medium text-amber-800">Prerequisites:</p>
                <p className="text-sm text-amber-700">{selectedModule.prerequisites.join(", ")}</p>
              </div>
            )}

            <Tabs defaultValue="objectives" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="objectives">Objectives</TabsTrigger>
                <TabsTrigger value="topics">Topics</TabsTrigger>
                <TabsTrigger value="activities">Activities</TabsTrigger>
                <TabsTrigger value="assessments">Assessments</TabsTrigger>
              </TabsList>

              <TabsContent value="objectives" className="mt-6">
                <div className="space-y-3">
                  {selectedModule.objectives.map((obj, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Target className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{obj}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="topics" className="mt-6">
                <div className="space-y-3">
                  {selectedModule.topics.map((topic, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <BookOpen className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{topic}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="activities" className="mt-6">
                <div className="space-y-3">
                  {selectedModule.activities.map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Users className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{activity}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="assessments" className="mt-6">
                <div className="space-y-3">
                  {selectedModule.assessments.map((assessment, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <FileText className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{assessment}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-8 flex justify-center">
              <Button className="gap-2">
                <GraduationCap className="w-4 h-4" />
                Start This Module
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (selectedCurriculum) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-5xl mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => setSelectedCurriculum(null)}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Curricula
          </Button>

          <Card className="p-8 mb-8">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg bg-muted ${selectedCurriculum.color}`}>
                {selectedCurriculum.icon}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground">{selectedCurriculum.curriculumName}</h1>
                <p className="text-sm text-muted-foreground">{selectedCurriculum.entityName}</p>
                <p className="text-foreground mt-2">{selectedCurriculum.description}</p>
                <div className="flex flex-wrap gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{selectedCurriculum.targetAudience}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{selectedCurriculum.totalDuration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-primary">
                    <Award className="w-4 h-4" />
                    <span>{selectedCurriculum.certificationPath}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <h2 className="text-xl font-semibold text-foreground mb-4">Modules ({selectedCurriculum.modules.length})</h2>
          <div className="space-y-4">
            {selectedCurriculum.modules.map((module, idx) => (
              <Card
                key={module.id}
                className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedModule(module)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{module.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <Badge className={getDifficultyColor(module.difficulty)} variant="outline">
                          {module.difficulty}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {module.duration}
                        </span>
                        {module.certificationTitle && (
                          <span className="text-xs text-primary flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            {module.certificationTitle}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/training-hub">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Training Hub
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Entity-Specific Curricula</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive training programs designed for each entity within the L.A.W.S. ecosystem.
            Complete modules to earn certifications and advance your expertise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {curricula.map((curriculum) => (
            <Card
              key={curriculum.entityId}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedCurriculum(curriculum)}
            >
              <div className={`p-3 rounded-lg bg-muted w-fit ${curriculum.color}`}>
                {curriculum.icon}
              </div>
              <h3 className="text-lg font-semibold text-foreground mt-4">{curriculum.curriculumName}</h3>
              <p className="text-sm text-muted-foreground">{curriculum.entityName}</p>
              <p className="text-sm text-foreground mt-3 line-clamp-2">{curriculum.description}</p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="w-4 h-4" />
                  <span>{curriculum.modules.length} modules</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{curriculum.totalDuration}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 text-sm text-primary">
                <Award className="w-4 h-4" />
                <span>{curriculum.certificationPath}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
