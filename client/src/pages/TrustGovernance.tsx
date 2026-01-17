import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Users,
  TrendingUp,
  PieChart,
  Shield,
  GraduationCap,
  FileText,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Landmark,
  Heart,
  Leaf,
  Wind,
  Droplets,
  User,
  DollarSign,
  Calendar,
  Target,
  BookOpen,
} from "lucide-react";
import { Link } from "wouter";

// Trust allocation policy from business plan
const allocationPolicy = [
  { category: "Operating Reserve", percentage: 20, color: "bg-blue-500", description: "Emergency fund, operating capital" },
  { category: "Wealth Building", percentage: 30, color: "bg-emerald-500", description: "Long-term investments, asset acquisition" },
  { category: "Entity Reinvestment", percentage: 30, color: "bg-amber-500", description: "Capital for subsidiary operations" },
  { category: "Family Distributions", percentage: 10, color: "bg-purple-500", description: "Current generation support" },
  { category: "Community Impact", percentage: 10, color: "bg-rose-500", description: "Charitable activities, community programs" },
];

// Subsidiary entities with allocation percentages
const subsidiaryEntities = [
  {
    id: "luvonpurpose",
    name: "LuvOnPurpose Autonomous Wealth System LLC",
    type: "LLC",
    state: "Delaware",
    allocation: 40,
    function: "Platform operations, technology",
    ein: "Pending",
    status: "active",
    controlNumber: "10252584",
  },
  {
    id: "temple",
    name: "LuvOnPurpose Outreach Temple and Academy Society, Inc.",
    type: "508(c)(1)(a)",
    state: "Georgia",
    allocation: 30,
    function: "Education, training, charitable",
    ein: "Pending",
    status: "active",
    controlNumber: "25132958",
  },
  {
    id: "realeyenation",
    name: "Real-Eye-Nation LLC",
    type: "LLC",
    state: "Georgia",
    allocation: 20,
    function: "Media, content, truth documentation",
    ein: "84-4976416",
    status: "active",
    controlNumber: "20031738",
  },
  {
    id: "laws",
    name: "The L.A.W.S. Collective, LLC",
    type: "LLC",
    state: "Delaware",
    allocation: 10,
    function: "Community programs, membership",
    ein: "39-3122993",
    status: "active",
    controlNumber: "10251122",
  },
];

// Family members and roles
const familyMembers = [
  { name: "Shanna Russell", role: "Founder/Matriarch", department: "Trust Governance", status: "active", certifications: ["Financial Literacy", "Business Operations", "Family Governance"] },
  { name: "Craig", role: "House Member", department: "Finance, Outreach support", status: "active", certifications: ["Financial Literacy"] },
  { name: "Amber", role: "House Member", department: "Operations support", status: "onboarding", certifications: [] },
  { name: "Essence", role: "House Member", department: "Creative support", status: "onboarding", certifications: [] },
  { name: "Amandes", role: "House Member", department: "Administrative support", status: "onboarding", certifications: [] },
  { name: "Cornelius", role: "Education/Training Manager", department: "Education Department, Justice Advisor", status: "active", certifications: ["Financial Literacy", "Education"] },
];

// L.A.W.S. Framework principles
const lawsFramework = [
  { letter: "L", name: "Land", icon: Leaf, description: "Reconnection with roots, stability, and physical assets", color: "text-green-600" },
  { letter: "A", name: "Air", icon: Wind, description: "Education, knowledge, and communication", color: "text-sky-600" },
  { letter: "W", name: "Water", icon: Droplets, description: "Healing, balance, and healthy decision-making", color: "text-blue-600" },
  { letter: "S", name: "Self", icon: User, description: "Purpose, skills, and financial literacy", color: "text-purple-600" },
];

// Succession requirements
const successionRequirements = [
  { requirement: "Demonstrated commitment to family values", status: "ongoing" },
  { requirement: "Financial Literacy certification through Academy", status: "required" },
  { requirement: "Business Operations certification", status: "required" },
  { requirement: "Family Governance training completion", status: "required" },
  { requirement: "Approval by Family Council", status: "required" },
  { requirement: "Minimum 2 years active participation", status: "required" },
];

// Implementation timeline
const implementationTimeline = [
  { phase: "Establishment", timeline: "Year 1", milestones: "Formal Trust document, Trustee designation, initial funding", status: "in-progress" },
  { phase: "Activation", timeline: "Year 2", milestones: "Operating entity transfers, governance implementation", status: "pending" },
  { phase: "Operations", timeline: "Years 3-5", milestones: "Full operations, first distributions, wealth building begins", status: "pending" },
  { phase: "Maturity", timeline: "Years 5+", milestones: "Sustainable operations, next generation preparation", status: "pending" },
];

export default function TrustGovernance() {
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  const totalAllocation = subsidiaryEntities.reduce((sum, e) => sum + e.allocation, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-7xl py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Landmark className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Trust Governance Dashboard</h1>
                  <p className="text-sm text-muted-foreground">Calea Freeman Family Trust | EIN: 98-6109577</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/business-formation">
                <Button variant="outline" size="sm" className="gap-2">
                  <Building2 className="w-4 h-4" />
                  Entity Management
                </Button>
              </Link>
              <Link href="/document-vault">
                <Button variant="outline" size="sm" className="gap-2">
                  <FileText className="w-4 h-4" />
                  Document Vault
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl py-8 space-y-8">
        {/* Trust Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                  <Building2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subsidiary Entities</p>
                  <p className="text-2xl font-bold">{subsidiaryEntities.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Family Members</p>
                  <p className="text-2xl font-bold">{familyMembers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <Shield className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trust Status</p>
                  <p className="text-2xl font-bold">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Legacy Vision</p>
                  <p className="text-2xl font-bold">100+ Years</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="allocation" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="allocation" className="gap-2">
              <PieChart className="w-4 h-4" />
              Allocation
            </TabsTrigger>
            <TabsTrigger value="subsidiaries" className="gap-2">
              <Building2 className="w-4 h-4" />
              Subsidiaries
            </TabsTrigger>
            <TabsTrigger value="succession" className="gap-2">
              <GraduationCap className="w-4 h-4" />
              Succession
            </TabsTrigger>
            <TabsTrigger value="governance" className="gap-2">
              <Shield className="w-4 h-4" />
              Governance
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-2">
              <Calendar className="w-4 h-4" />
              Timeline
            </TabsTrigger>
          </TabsList>

          {/* Allocation Tab */}
          <TabsContent value="allocation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Allocation Policy */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Trust Income Allocation Policy
                  </CardTitle>
                  <CardDescription>
                    How Trust income is distributed across categories
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {allocationPolicy.map((item) => (
                    <div key={item.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.category}</span>
                        <span className="text-sm font-bold">{item.percentage}%</span>
                      </div>
                      <Progress value={item.percentage} className="h-3" />
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Visual Allocation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Allocation Visualization
                  </CardTitle>
                  <CardDescription>
                    Visual breakdown of Trust resource distribution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex h-8 rounded-lg overflow-hidden mb-6">
                    {allocationPolicy.map((item) => (
                      <div
                        key={item.category}
                        className={`${item.color} transition-all hover:opacity-80`}
                        style={{ width: `${item.percentage}%` }}
                        title={`${item.category}: ${item.percentage}%`}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {allocationPolicy.map((item) => (
                      <div key={item.category} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="text-sm">{item.category}</span>
                        <span className="text-sm font-bold ml-auto">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Entity Allocation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Subsidiary Entity Resource Allocation
                </CardTitle>
                <CardDescription>
                  Distribution of Trust resources and attention across operating entities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subsidiaryEntities.map((entity) => (
                    <div key={entity.id} className="p-4 border rounded-lg hover:bg-secondary/30 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{entity.type}</Badge>
                          <span className="font-medium">{entity.name}</span>
                        </div>
                        <span className="text-lg font-bold text-primary">{entity.allocation}%</span>
                      </div>
                      <Progress value={entity.allocation} className="h-2 mb-2" />
                      <p className="text-sm text-muted-foreground">{entity.function}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subsidiaries Tab */}
          <TabsContent value="subsidiaries" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subsidiaryEntities.map((entity) => (
                <Card key={entity.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{entity.name}</CardTitle>
                        <CardDescription>{entity.function}</CardDescription>
                      </div>
                      <Badge className={entity.status === "active" ? "bg-emerald-500" : "bg-amber-500"}>
                        {entity.status === "active" ? "Active" : "Pending"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Entity Type</span>
                        <span className="font-medium">{entity.type}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">State</span>
                        <span className="font-medium">{entity.state}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Control Number</span>
                        <span className="font-medium">{entity.controlNumber}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">EIN</span>
                        <span className="font-medium">{entity.ein}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Trust Allocation</span>
                        <span className="font-bold text-primary">{entity.allocation}%</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <Link href="/business-formation">
                        <Button variant="outline" size="sm" className="w-full gap-2">
                          View Entity Details
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Succession Tab */}
          <TabsContent value="succession" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Family Members */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Family Members & Roles
                  </CardTitle>
                  <CardDescription>
                    Current family member assignments and certification status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {familyMembers.map((member) => (
                      <div key={member.name} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                          </div>
                          <Badge variant={member.status === "active" ? "default" : "secondary"}>
                            {member.status === "active" ? "Active" : "Onboarding"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{member.department}</p>
                        {member.certifications.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {member.certifications.map((cert) => (
                              <Badge key={cert} variant="outline" className="text-xs">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {member.certifications.length === 0 && (
                          <p className="text-xs text-amber-600">Certifications pending</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Succession Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Leadership Succession Requirements
                  </CardTitle>
                  <CardDescription>
                    Requirements for Trust leadership positions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {successionRequirements.map((req, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                        {req.status === "ongoing" ? (
                          <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{req.requirement}</p>
                          <p className="text-xs text-muted-foreground capitalize">{req.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-secondary/30 rounded-lg">
                    <p className="text-sm font-medium mb-2">Academy Certification Path</p>
                    <p className="text-xs text-muted-foreground">
                      Completion of Academy programs is required for all leadership positions. 
                      The Business Simulator and training programs prepare the next generation for leadership roles.
                    </p>
                    <Link href="/academy">
                      <Button variant="outline" size="sm" className="mt-3 gap-2">
                        <BookOpen className="w-4 h-4" />
                        View Academy Programs
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Governance Tab */}
          <TabsContent value="governance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Governance Structure */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Governance Structure
                  </CardTitle>
                  <CardDescription>
                    Trust governance roles and responsibilities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Trustee</span>
                        <Badge variant="secondary">To be designated</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Legal administration, fiduciary duties</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Trust Protector</span>
                        <Badge variant="secondary">To be designated</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Oversight, amendment authority</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Family Council</span>
                        <Badge>Active</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Advisory, conflict resolution</p>
                      <p className="text-xs text-muted-foreground mt-1">Shanna Russell (Matriarch), Craig, Family Members</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Board of Directors</span>
                        <Badge>Active</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Operating entity oversight</p>
                      <p className="text-xs text-muted-foreground mt-1">Family members with assigned roles</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* L.A.W.S. Framework */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    L.A.W.S. Governance Framework
                  </CardTitle>
                  <CardDescription>
                    All Trust decisions must align with these principles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {lawsFramework.map((principle) => (
                      <div key={principle.letter} className="p-4 border rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-full bg-secondary ${principle.color}`}>
                            <principle.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-bold text-lg">{principle.letter}</span>
                            <span className="text-muted-foreground"> - </span>
                            <span className="font-medium">{principle.name}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground ml-12">{principle.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Risk Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Risk Management & Protection
                </CardTitle>
                <CardDescription>
                  Multiple layers of protection for Trust assets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <Shield className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    <p className="font-medium">Asset Protection</p>
                    <p className="text-xs text-muted-foreground mt-1">Protected from creditors, divorce, business liabilities</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                    <p className="font-medium">Diversification</p>
                    <p className="text-xs text-muted-foreground mt-1">Multiple entities and investment types</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                    <p className="font-medium">Insurance</p>
                    <p className="text-xs text-muted-foreground mt-1">Appropriate coverage for assets and family</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <Users className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                    <p className="font-medium">Governance Controls</p>
                    <p className="text-xs text-muted-foreground mt-1">Multi-party approval for major decisions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Implementation Timeline
                </CardTitle>
                <CardDescription>
                  Multi-year roadmap for Trust establishment and growth
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {implementationTimeline.map((phase, idx) => (
                    <div key={phase.phase} className="relative pl-8 pb-6 border-l-2 border-border last:pb-0">
                      <div className={`absolute -left-3 w-6 h-6 rounded-full flex items-center justify-center ${
                        phase.status === "in-progress" ? "bg-blue-500" : 
                        phase.status === "completed" ? "bg-emerald-500" : "bg-secondary"
                      }`}>
                        {phase.status === "completed" ? (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        ) : phase.status === "in-progress" ? (
                          <Clock className="w-4 h-4 text-white" />
                        ) : (
                          <span className="text-xs font-bold text-muted-foreground">{idx + 1}</span>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-bold text-lg">{phase.phase}</h4>
                          <Badge variant={
                            phase.status === "in-progress" ? "default" : 
                            phase.status === "completed" ? "secondary" : "outline"
                          }>
                            {phase.timeline}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{phase.milestones}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Funding Needs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Initial Funding Requirements
                </CardTitle>
                <CardDescription>
                  Resources needed for complete Trust establishment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Legal Fees</p>
                      <p className="text-sm text-muted-foreground">Trust document preparation, entity structuring</p>
                    </div>
                    <span className="font-bold">$3,000 - $5,000</span>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Initial Funding</p>
                      <p className="text-sm text-muted-foreground">Operating reserve, initial investments</p>
                    </div>
                    <span className="font-bold">$5,000 - $10,000</span>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Administrative</p>
                      <p className="text-sm text-muted-foreground">Record keeping, compliance setup</p>
                    </div>
                    <span className="font-bold">$1,000 - $2,000</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <div>
                      <p className="font-bold">Total Establishment Cost</p>
                      <p className="text-sm text-muted-foreground">Complete Trust establishment</p>
                    </div>
                    <span className="font-bold text-primary text-lg">$9,000 - $17,000</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Mission & Vision Footer */}
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/20 border-primary/20">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-lg mb-2">Mission Statement</h3>
                <p className="text-muted-foreground">
                  To preserve, protect, and grow the Freeman family's multi-generational wealth while 
                  maintaining family unity, cultural identity, and community responsibility through 
                  sovereign governance and purpose-driven enterprise.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Vision Statement</h3>
                <p className="text-muted-foreground">
                  A family legacy that spans 100+ years, where each generation inherits not only 
                  financial resources but also the wisdom, values, and systems to continue building 
                  wealth with purpose and integrity.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
