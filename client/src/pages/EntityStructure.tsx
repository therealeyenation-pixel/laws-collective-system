import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Shield,
  Users,
  DollarSign,
  FileText,
  MapPin,
  ArrowRight,
  ArrowDown,
  Layers,
  Eye,
  Leaf,
  Wind,
  Droplets,
  User,
  Network,
  ChevronDown,
  ChevronRight,
  Info,
  Scale,
  BookOpen,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
} from "lucide-react";

interface ComplianceDeadline {
  name: string;
  dueDate: string;
  frequency: string;
  status: "upcoming" | "due-soon" | "overdue" | "completed";
}

interface Entity {
  id: string;
  name: string;
  shortName?: string;
  type: "trust" | "llc" | "nonprofit" | "collective" | "system";
  state?: string;
  jurisdiction?: string;
  description: string;
  purpose: string;
  icon: React.ReactNode;
  color: string;
  children?: Entity[];
  compliance?: ComplianceDeadline[];
}

const entities: Entity[] = [
  {
    id: "real-eye-nation",
    name: "REAL-EYE-NATION",
    type: "system",
    description: "Master governance and vision system",
    purpose: "Overarching framework for multi-generational wealth building and sovereign system architecture",
    icon: <Eye className="w-6 h-6" />,
    color: "from-purple-500 to-indigo-600",
    children: [
      {
        id: "the-508",
        name: "The 508",
        type: "trust",
        state: "GA",
        jurisdiction: "Georgia",
        description: "Georgia-based trust entity",
        purpose: "Asset protection and generational wealth preservation",
        icon: <Shield className="w-5 h-5" />,
        color: "from-amber-500 to-orange-600",
        compliance: [
          { name: "GA Annual Registration", dueDate: "April 1", frequency: "Annual", status: "upcoming" },
          { name: "Trust Tax Return (Form 1041)", dueDate: "April 15", frequency: "Annual", status: "upcoming" },
          { name: "Beneficiary Statements", dueDate: "March 15", frequency: "Annual", status: "completed" },
        ],
      },
      {
        id: "luvonpurpose-aws",
        name: "LuvOnPurpose Autonomous Wealth System",
        shortName: "LuvOnPurpose AWS",
        type: "llc",
        state: "DE",
        jurisdiction: "Delaware",
        description: "Delaware LLC - Core operational entity",
        purpose: "Primary business operations, intellectual property holding, and system management",
        icon: <Building2 className="w-5 h-5" />,
        color: "from-blue-500 to-cyan-600",
        compliance: [
          { name: "DE Franchise Tax", dueDate: "June 1", frequency: "Annual", status: "upcoming" },
          { name: "DE Annual Report", dueDate: "June 1", frequency: "Annual", status: "upcoming" },
          { name: "Federal Tax Return", dueDate: "March 15", frequency: "Annual", status: "completed" },
          { name: "Registered Agent Fee", dueDate: "January 1", frequency: "Annual", status: "completed" },
        ],
        children: [
          {
            id: "laws-collective",
            name: "L.A.W.S. Collective",
            type: "collective",
            description: "Public-facing community organization",
            purpose: "Community engagement, education, and public services through Land, Air, Water, and Self framework",
            icon: <Users className="w-5 h-5" />,
            color: "from-green-500 to-emerald-600",
            children: [
              {
                id: "laws-land",
                name: "LAND - Reconnection & Stability",
                type: "collective",
                description: "Land pillar of L.A.W.S.",
                purpose: "Understanding roots, migrations, and family history",
                icon: <MapPin className="w-4 h-4" />,
                color: "from-amber-600 to-yellow-500",
              },
              {
                id: "laws-air",
                name: "AIR - Education & Knowledge",
                type: "collective",
                description: "Air pillar of L.A.W.S.",
                purpose: "Learning, personal development, and communication",
                icon: <Wind className="w-4 h-4" />,
                color: "from-sky-500 to-blue-400",
              },
              {
                id: "laws-water",
                name: "WATER - Healing & Balance",
                type: "collective",
                description: "Water pillar of L.A.W.S.",
                purpose: "Emotional resilience, healing cycles, and healthy decision-making",
                icon: <Droplets className="w-4 h-4" />,
                color: "from-cyan-500 to-teal-400",
              },
              {
                id: "laws-self",
                name: "SELF - Purpose & Skills",
                type: "collective",
                description: "Self pillar of L.A.W.S.",
                purpose: "Financial literacy, business readiness, and purposeful growth",
                icon: <User className="w-4 h-4" />,
                color: "from-rose-500 to-pink-400",
              },
            ],
          },
        ],
      },
    ],
  },
];

const entityTypeLabels: Record<string, { label: string; color: string }> = {
  trust: { label: "Trust", color: "bg-amber-100 text-amber-800" },
  llc: { label: "LLC", color: "bg-blue-100 text-blue-800" },
  nonprofit: { label: "Nonprofit", color: "bg-green-100 text-green-800" },
  collective: { label: "Collective", color: "bg-emerald-100 text-emerald-800" },
  system: { label: "System", color: "bg-purple-100 text-purple-800" },
};

const statusColors: Record<string, string> = {
  upcoming: "bg-blue-100 text-blue-800",
  "due-soon": "bg-yellow-100 text-yellow-800",
  overdue: "bg-red-100 text-red-800",
  completed: "bg-green-100 text-green-800",
};

function ComplianceSection({ compliance }: { compliance: ComplianceDeadline[] }) {
  return (
    <div className="mt-4 pt-4 border-t">
      <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-primary" />
        Compliance Deadlines
      </h4>
      <div className="space-y-2">
        {compliance.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-sm">
            <div className="flex items-center gap-2">
              {item.status === "completed" ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : item.status === "overdue" ? (
                <AlertCircle className="w-4 h-4 text-red-600" />
              ) : (
                <Clock className="w-4 h-4 text-blue-600" />
              )}
              <span>{item.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs">{item.dueDate}</span>
              <Badge className={statusColors[item.status]} variant="secondary">
                {item.status === "due-soon" ? "Due Soon" : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EntityCard({ entity, depth = 0 }: { entity: Entity; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = entity.children && entity.children.length > 0;
  const typeInfo = entityTypeLabels[entity.type];

  return (
    <div className={`${depth > 0 ? "ml-6 mt-4" : ""}`}>
      <Card className={`border-l-4 ${depth === 0 ? "border-l-purple-500" : depth === 1 ? "border-l-blue-500" : "border-l-green-500"}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${entity.color} text-white`}>
                {entity.icon}
              </div>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {entity.shortName || entity.name}
                  {hasChildren && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => setExpanded(!expanded)}
                    >
                      {expanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </CardTitle>
                {entity.shortName && (
                  <p className="text-xs text-muted-foreground">{entity.name}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
              {entity.state && (
                <Badge variant="outline" className="font-mono">
                  <MapPin className="w-3 h-3 mr-1" />
                  {entity.state}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">{entity.description}</p>
          <div className="flex items-start gap-2 text-sm">
            <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <span className="text-foreground">{entity.purpose}</span>
          </div>
          {entity.jurisdiction && (
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Scale className="w-3 h-3" />
              <span>Jurisdiction: {entity.jurisdiction}</span>
            </div>
          )}
          {entity.compliance && <ComplianceSection compliance={entity.compliance} />}
        </CardContent>
      </Card>

      {hasChildren && expanded && (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
          {entity.children!.map((child) => (
            <EntityCard key={child.id} entity={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function FinancialFlowDiagram() {
  return (
    <div className="p-6 bg-muted/30 rounded-lg overflow-x-auto">
      <div className="min-w-[900px]">
        {/* Title */}
        <div className="text-center mb-8">
          <h3 className="text-lg font-bold text-foreground">Financial Flow Architecture</h3>
          <p className="text-sm text-muted-foreground">How funds move between entities</p>
        </div>

        {/* Flow Diagram */}
        <div className="relative">
          {/* External Revenue Sources */}
          <div className="flex justify-center gap-8 mb-6">
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 text-white px-4 py-3 rounded-xl shadow-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                <div>
                  <p className="font-semibold text-sm">Revenue Sources</p>
                  <p className="text-xs text-emerald-100">Services, Products, Grants</p>
                </div>
              </div>
            </div>
          </div>

          {/* Arrow Down */}
          <div className="flex justify-center mb-4">
            <div className="flex flex-col items-center">
              <ArrowDown className="w-6 h-6 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Income</span>
            </div>
          </div>

          {/* LuvOnPurpose AWS - Central Hub */}
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white px-8 py-4 rounded-xl shadow-lg relative">
              <div className="flex items-center gap-3">
                <Building2 className="w-8 h-8" />
                <div>
                  <h4 className="font-bold text-lg">LuvOnPurpose AWS</h4>
                  <p className="text-sm text-blue-100">Central Operations Hub (DE)</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-400/30">
                <div className="grid grid-cols-3 gap-4 text-center text-xs">
                  <div>
                    <p className="text-blue-200">Operations</p>
                    <p className="font-semibold">40%</p>
                  </div>
                  <div>
                    <p className="text-blue-200">Reserves</p>
                    <p className="font-semibold">30%</p>
                  </div>
                  <div>
                    <p className="text-blue-200">Distribution</p>
                    <p className="font-semibold">30%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Distribution Arrows */}
          <div className="flex justify-center gap-32 mb-4">
            <div className="flex flex-col items-center">
              <ArrowDownRight className="w-6 h-6 text-amber-500 rotate-[-45deg]" />
              <span className="text-xs text-muted-foreground">Asset Protection</span>
            </div>
            <div className="flex flex-col items-center">
              <ArrowDown className="w-6 h-6 text-green-500" />
              <span className="text-xs text-muted-foreground">Community Programs</span>
            </div>
          </div>

          {/* Second Level - The 508 and L.A.W.S. */}
          <div className="flex justify-center gap-16">
            {/* The 508 */}
            <div className="text-center">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white px-6 py-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-2">
                  <Shield className="w-6 h-6" />
                  <div className="text-left">
                    <h4 className="font-bold">The 508</h4>
                    <p className="text-xs text-amber-100">Trust • Georgia</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-amber-400/30 text-xs">
                  <div className="flex justify-between">
                    <span className="text-amber-200">Long-term Assets</span>
                    <span className="font-semibold">Protected</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg text-xs">
                <p className="font-semibold text-amber-800 dark:text-amber-200">Wealth Preservation</p>
                <ul className="text-amber-700 dark:text-amber-300 mt-1 space-y-1">
                  <li>• Real Estate Holdings</li>
                  <li>• Investment Portfolio</li>
                  <li>• Generational Assets</li>
                </ul>
              </div>
            </div>

            {/* L.A.W.S. Collective */}
            <div className="text-center">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  <div className="text-left">
                    <h4 className="font-bold">L.A.W.S. Collective</h4>
                    <p className="text-xs text-green-100">Public Programs</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-green-400/30 text-xs">
                  <div className="flex justify-between">
                    <span className="text-green-200">Community Impact</span>
                    <span className="font-semibold">Active</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg text-xs">
                <p className="font-semibold text-green-800 dark:text-green-200">Program Funding</p>
                <ul className="text-green-700 dark:text-green-300 mt-1 space-y-1">
                  <li>• Education (AIR)</li>
                  <li>• Community (LAND)</li>
                  <li>• Wellness (WATER)</li>
                  <li>• Development (SELF)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* REAL-EYE-NATION Governance Overlay */}
          <div className="mt-8 p-4 border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-xl">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Eye className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-purple-700 dark:text-purple-300">REAL-EYE-NATION Governance</span>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Master oversight ensuring all financial flows align with multi-generational wealth building objectives
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HierarchyDiagram() {
  return (
    <div className="p-6 bg-muted/30 rounded-lg overflow-x-auto">
      <div className="min-w-[800px]">
        {/* REAL-EYE-NATION - Top Level */}
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white px-6 py-4 rounded-xl shadow-lg">
            <div className="flex items-center gap-3">
              <Eye className="w-8 h-8" />
              <div>
                <h3 className="font-bold text-lg">REAL-EYE-NATION</h3>
                <p className="text-sm text-purple-100">Master Governance System</p>
              </div>
            </div>
          </div>
        </div>

        {/* Connector */}
        <div className="flex justify-center mb-4">
          <div className="w-px h-8 bg-border" />
        </div>

        {/* Second Level - The 508 and LuvOnPurpose AWS */}
        <div className="flex justify-center gap-16 mb-8">
          {/* The 508 */}
          <div className="text-center">
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white px-5 py-3 rounded-xl shadow-lg">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6" />
                <div className="text-left">
                  <h4 className="font-bold">The 508</h4>
                  <p className="text-xs text-amber-100">Trust • Georgia</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 max-w-[150px]">
              Asset Protection & Wealth Preservation
            </p>
            <div className="mt-2 text-xs">
              <Badge variant="outline" className="text-amber-600">
                <Calendar className="w-3 h-3 mr-1" />
                Annual: Apr 1
              </Badge>
            </div>
          </div>

          {/* LuvOnPurpose AWS */}
          <div className="text-center">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white px-5 py-3 rounded-xl shadow-lg">
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6" />
                <div className="text-left">
                  <h4 className="font-bold">LuvOnPurpose AWS</h4>
                  <p className="text-xs text-blue-100">LLC • Delaware</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 max-w-[150px]">
              Core Operations & IP Holding
            </p>
            <div className="mt-2 text-xs">
              <Badge variant="outline" className="text-blue-600">
                <Calendar className="w-3 h-3 mr-1" />
                Franchise Tax: Jun 1
              </Badge>
            </div>

            {/* Connector to L.A.W.S. */}
            <div className="flex justify-center my-4">
              <div className="w-px h-8 bg-border" />
            </div>

            {/* L.A.W.S. Collective */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg">
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6" />
                <div className="text-left">
                  <h4 className="font-bold">L.A.W.S. Collective</h4>
                  <p className="text-xs text-green-100">Public-Facing Entity</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 max-w-[200px]">
              Community Engagement & Education
            </p>

            {/* Connector to Pillars */}
            <div className="flex justify-center my-4">
              <div className="w-px h-6 bg-border" />
            </div>

            {/* L.A.W.S. Pillars */}
            <div className="flex justify-center gap-3">
              <div className="bg-gradient-to-br from-amber-600 to-yellow-500 text-white px-3 py-2 rounded-lg text-center">
                <MapPin className="w-4 h-4 mx-auto mb-1" />
                <span className="text-xs font-medium">LAND</span>
              </div>
              <div className="bg-gradient-to-br from-sky-500 to-blue-400 text-white px-3 py-2 rounded-lg text-center">
                <Wind className="w-4 h-4 mx-auto mb-1" />
                <span className="text-xs font-medium">AIR</span>
              </div>
              <div className="bg-gradient-to-br from-cyan-500 to-teal-400 text-white px-3 py-2 rounded-lg text-center">
                <Droplets className="w-4 h-4 mx-auto mb-1" />
                <span className="text-xs font-medium">WATER</span>
              </div>
              <div className="bg-gradient-to-br from-rose-500 to-pink-400 text-white px-3 py-2 rounded-lg text-center">
                <User className="w-4 h-4 mx-auto mb-1" />
                <span className="text-xs font-medium">SELF</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EntitySummaryTable() {
  const allEntities = [
    { name: "REAL-EYE-NATION", type: "System", state: "—", purpose: "Master governance framework", status: "Active", nextDeadline: "—" },
    { name: "The 508", type: "Trust", state: "GA", purpose: "Asset protection & wealth preservation", status: "Active", nextDeadline: "Apr 1 - Annual Registration" },
    { name: "LuvOnPurpose AWS", type: "LLC", state: "DE", purpose: "Core operations & IP holding", status: "Active", nextDeadline: "Jun 1 - Franchise Tax" },
    { name: "L.A.W.S. Collective", type: "Collective", state: "—", purpose: "Public engagement & education", status: "Active", nextDeadline: "—" },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left p-3 font-semibold">Entity Name</th>
            <th className="text-left p-3 font-semibold">Type</th>
            <th className="text-left p-3 font-semibold">State</th>
            <th className="text-left p-3 font-semibold">Purpose</th>
            <th className="text-left p-3 font-semibold">Next Deadline</th>
            <th className="text-left p-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {allEntities.map((entity, idx) => (
            <tr key={idx} className="border-b hover:bg-muted/30">
              <td className="p-3 font-medium">{entity.name}</td>
              <td className="p-3">
                <Badge variant="outline">{entity.type}</Badge>
              </td>
              <td className="p-3">
                {entity.state !== "—" ? (
                  <Badge variant="secondary" className="font-mono">
                    {entity.state}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="p-3 text-sm text-muted-foreground">{entity.purpose}</td>
              <td className="p-3 text-sm">
                {entity.nextDeadline !== "—" ? (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-primary" />
                    {entity.nextDeadline}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="p-3">
                <Badge className="bg-green-100 text-green-800">{entity.status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function EntityStructure() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Network className="w-7 h-7 text-primary" />
            Entity Structure
          </h1>
          <p className="text-muted-foreground mt-1">
            Organizational hierarchy, compliance deadlines, and financial flows
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="diagram" className="w-full">
          <TabsList>
            <TabsTrigger value="diagram">
              <Layers className="w-4 h-4 mr-2" />
              Hierarchy
            </TabsTrigger>
            <TabsTrigger value="financial">
              <Banknote className="w-4 h-4 mr-2" />
              Financial Flow
            </TabsTrigger>
            <TabsTrigger value="cards">
              <FileText className="w-4 h-4 mr-2" />
              Detailed View
            </TabsTrigger>
            <TabsTrigger value="table">
              <BookOpen className="w-4 h-4 mr-2" />
              Summary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="diagram" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Entity Hierarchy</CardTitle>
                <CardDescription>
                  Visual representation of the organizational structure with compliance deadlines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HierarchyDiagram />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Flow</CardTitle>
                <CardDescription>
                  How funds move between entities in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FinancialFlowDiagram />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cards" className="mt-6">
            <div className="space-y-4">
              {entities.map((entity) => (
                <EntityCard key={entity.id} entity={entity} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="table" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Entity Summary</CardTitle>
                <CardDescription>
                  Overview of all entities with compliance deadlines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EntitySummaryTable />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Key Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Jurisdictions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-mono">GA</Badge>
                  <span className="font-medium">Georgia</span>
                </div>
                <span className="text-sm text-muted-foreground">The 508</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-mono">DE</Badge>
                  <span className="font-medium">Delaware</span>
                </div>
                <span className="text-sm text-muted-foreground">LuvOnPurpose AWS</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                <span className="text-sm font-medium">GA Annual Registration</span>
                <Badge variant="outline" className="text-amber-600">Apr 1</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <span className="text-sm font-medium">DE Franchise Tax</span>
                <Badge variant="outline" className="text-blue-600">Jun 1</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <span className="text-sm font-medium">DE Annual Report</span>
                <Badge variant="outline" className="text-blue-600">Jun 1</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Leaf className="w-5 h-5 text-green-600" />
                L.A.W.S. Framework
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-3 p-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">LAND</p>
                  <p className="text-xs text-muted-foreground">Reconnection & Stability</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2">
                <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center">
                  <Wind className="w-4 h-4 text-sky-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">AIR</p>
                  <p className="text-xs text-muted-foreground">Education & Knowledge</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2">
                <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center">
                  <Droplets className="w-4 h-4 text-cyan-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">WATER</p>
                  <p className="text-xs text-muted-foreground">Healing & Balance</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-rose-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">SELF</p>
                  <p className="text-xs text-muted-foreground">Purpose & Skills</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
