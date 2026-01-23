import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Globe,
  Shield,
  Users,
  DollarSign,
  FileText,
  MapPin,
  ArrowRight,
  ArrowDown,
  Layers,
  Crown,
  Landmark,
  Eye,
  Heart,
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
  Briefcase,
} from "lucide-react";

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
  relationships?: { targetId: string; type: string; description: string }[];
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
    { name: "REAL-EYE-NATION", type: "System", state: "—", purpose: "Master governance framework", status: "Active" },
    { name: "The 508", type: "Trust", state: "GA", purpose: "Asset protection & wealth preservation", status: "Active" },
    { name: "LuvOnPurpose AWS", type: "LLC", state: "DE", purpose: "Core operations & IP holding", status: "Active" },
    { name: "L.A.W.S. Collective", type: "Collective", state: "—", purpose: "Public engagement & education", status: "Active" },
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
            Organizational hierarchy and relationships between system entities
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="diagram" className="w-full">
          <TabsList>
            <TabsTrigger value="diagram">
              <Layers className="w-4 h-4 mr-2" />
              Hierarchy Diagram
            </TabsTrigger>
            <TabsTrigger value="cards">
              <FileText className="w-4 h-4 mr-2" />
              Detailed View
            </TabsTrigger>
            <TabsTrigger value="table">
              <BookOpen className="w-4 h-4 mr-2" />
              Summary Table
            </TabsTrigger>
          </TabsList>

          <TabsContent value="diagram" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Entity Hierarchy</CardTitle>
                <CardDescription>
                  Visual representation of the organizational structure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HierarchyDiagram />
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
                  Overview of all entities in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EntitySummaryTable />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Key Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <span className="text-sm text-muted-foreground">The 508 (Trust)</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-mono">DE</Badge>
                  <span className="font-medium">Delaware</span>
                </div>
                <span className="text-sm text-muted-foreground">LuvOnPurpose AWS (LLC)</span>
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
