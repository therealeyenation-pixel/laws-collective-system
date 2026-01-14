import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Building2,
  BookOpen,
  Megaphone,
  Server,
  Coins,
  TrendingUp,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  Link2,
  FileCheck,
  Zap,
  Users,
  DollarSign,
  Eye,
  ChevronRight,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

// Company entity data based on the CALEA Freeman Family Trust structure
const companyEntities = [
  {
    id: 1,
    name: "CALEA Freeman Family Trust",
    shortName: "98 Trust",
    type: "trust",
    role: "Root Authority",
    description: "Holds lineage authority, ownership, sovereignty, records",
    allocation: 100,
    icon: Shield,
    color: "from-amber-500/20 to-amber-600/10",
    borderColor: "border-l-amber-500",
    children: [2, 3, 4, 5],
  },
  {
    id: 2,
    name: "LuvOnPurpose Autonomous Wealth System, LLC",
    shortName: "Commercial Engine",
    type: "commercial",
    role: "Commercial Engine",
    description: "Products, licensing, IP monetization",
    allocation: 40,
    icon: Building2,
    color: "from-blue-500/20 to-blue-600/10",
    borderColor: "border-l-blue-500",
    parentId: 1,
  },
  {
    id: 3,
    name: "The L.A.W.S. Collective LLC",
    shortName: "Education Platform",
    type: "education",
    role: "Education & Simulation",
    description: "Curriculum, simulators, training platforms",
    allocation: 30,
    icon: BookOpen,
    color: "from-green-500/20 to-green-600/10",
    borderColor: "border-l-green-500",
    parentId: 1,
  },
  {
    id: 4,
    name: "Real-Eye-Nation",
    shortName: "Media & Truth",
    type: "media",
    role: "Truth Voice",
    description: "Publications, storytelling, documentation, truth-mapping",
    allocation: 20,
    icon: Megaphone,
    color: "from-purple-500/20 to-purple-600/10",
    borderColor: "border-l-purple-500",
    parentId: 1,
  },
  {
    id: 5,
    name: "LuvOnPurpose Academy and Outreach",
    shortName: "508 Nonprofit",
    type: "nonprofit",
    role: "Public Education",
    description: "Nonprofit, grants, community restoration",
    allocation: 10,
    icon: Users,
    color: "from-rose-500/20 to-rose-600/10",
    borderColor: "border-l-rose-500",
    parentId: 1,
  },
];

// Mock autonomous operations data
const autonomousOperations = [
  {
    id: 1,
    entityId: 2,
    type: "licensing_decision",
    description: "Auto-approved licensing agreement for Financial Literacy Module",
    status: "approved",
    tokensGenerated: 500,
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: 2,
    entityId: 3,
    type: "curriculum_generation",
    description: "Generated new course: 'Sovereign Business Structures 101'",
    status: "pending",
    tokensGenerated: 0,
    timestamp: new Date(Date.now() - 7200000),
  },
  {
    id: 3,
    entityId: 4,
    type: "content_publication",
    description: "Scheduled truth-mapping documentation for publication",
    status: "approved",
    tokensGenerated: 200,
    timestamp: new Date(Date.now() - 10800000),
  },
  {
    id: 4,
    entityId: 5,
    type: "scholarship_allocation",
    description: "Allocated scholarship tokens to 3 community members",
    status: "pending",
    tokensGenerated: 0,
    timestamp: new Date(Date.now() - 14400000),
  },
];

// Mock token economy data
const tokenEconomy = {
  totalInCirculation: 125000,
  totalDistributed: 100000,
  totalEarned: 25000,
  entityBalances: [
    { entityId: 1, balance: 50000, earned: 0, distributed: 50000 },
    { entityId: 2, balance: 40000, earned: 15000, distributed: 25000 },
    { entityId: 3, balance: 20000, earned: 8000, distributed: 12000 },
    { entityId: 4, balance: 10000, earned: 2000, distributed: 8000 },
    { entityId: 5, balance: 5000, earned: 0, distributed: 5000 },
  ],
};

export default function SystemDashboard() {
  const [selectedEntity, setSelectedEntity] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const getEntityById = (id: number) => companyEntities.find((e) => e.id === id);
  const getOperationsForEntity = (id: number) =>
    autonomousOperations.filter((op) => op.entityId === id);

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              CALEA Freeman Family Trust
            </h1>
            <p className="text-muted-foreground mt-1">
              Autonomous Wealth System Dashboard
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Eye className="w-4 h-4" />
              Audit Trail
            </Button>
            <Button size="sm" className="gap-2">
              <Zap className="w-4 h-4" />
              Run Autonomous Cycle
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Shield className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Entities</p>
                <p className="text-xl font-bold">{companyEntities.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Coins className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Tokens</p>
                <p className="text-xl font-bold">
                  {tokenEconomy.totalInCirculation.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Operations</p>
                <p className="text-xl font-bold">{autonomousOperations.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-xl font-bold">
                  {autonomousOperations.filter((op) => op.status === "pending").length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-4 h-auto">
            <TabsTrigger value="overview" className="text-xs md:text-sm py-2">
              Overview
            </TabsTrigger>
            <TabsTrigger value="entities" className="text-xs md:text-sm py-2">
              Entities
            </TabsTrigger>
            <TabsTrigger value="tokens" className="text-xs md:text-sm py-2">
              Tokens
            </TabsTrigger>
            <TabsTrigger value="operations" className="text-xs md:text-sm py-2">
              Operations
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            {/* Entity Hierarchy */}
            <Card className="p-4 md:p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Company Structure
              </h3>
              <div className="space-y-3">
                {/* Trust (Root) */}
                <div
                  className={`p-4 rounded-lg bg-gradient-to-r ${companyEntities[0].color} border-l-4 ${companyEntities[0].borderColor}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="w-6 h-6 text-amber-600" />
                      <div>
                        <p className="font-semibold">{companyEntities[0].shortName}</p>
                        <p className="text-xs text-muted-foreground">
                          {companyEntities[0].role}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">Root Authority</Badge>
                  </div>
                </div>

                {/* Child Entities */}
                <div className="ml-4 md:ml-8 space-y-2 border-l-2 border-dashed border-muted pl-4">
                  {companyEntities.slice(1).map((entity) => {
                    const Icon = entity.icon;
                    return (
                      <div
                        key={entity.id}
                        className={`p-3 rounded-lg bg-gradient-to-r ${entity.color} border-l-4 ${entity.borderColor} cursor-pointer hover:shadow-md transition-shadow`}
                        onClick={() => setSelectedEntity(entity.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5" />
                            <div>
                              <p className="font-medium text-sm">{entity.shortName}</p>
                              <p className="text-xs text-muted-foreground">
                                {entity.allocation}% allocation
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Recent Operations */}
            <Card className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Recent Autonomous Operations
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab("operations")}>
                  View All
                </Button>
              </div>
              <div className="space-y-3">
                {autonomousOperations.slice(0, 3).map((op) => {
                  const entity = getEntityById(op.entityId);
                  return (
                    <div
                      key={op.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <div
                        className={`p-2 rounded-full ${
                          op.status === "approved"
                            ? "bg-green-100 text-green-600"
                            : "bg-yellow-100 text-yellow-600"
                        }`}
                      >
                        {op.status === "approved" ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{op.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {entity?.shortName} • {formatTimeAgo(op.timestamp)}
                        </p>
                      </div>
                      {op.tokensGenerated > 0 && (
                        <Badge variant="secondary" className="shrink-0">
                          +{op.tokensGenerated} tokens
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          {/* Entities Tab */}
          <TabsContent value="entities" className="mt-6 space-y-4">
            {companyEntities.map((entity) => {
              const Icon = entity.icon;
              const operations = getOperationsForEntity(entity.id);
              const tokenBalance =
                tokenEconomy.entityBalances.find((b) => b.entityId === entity.id)?.balance || 0;

              return (
                <Card key={entity.id} className={`p-4 md:p-6 border-l-4 ${entity.borderColor}`}>
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${entity.color} shrink-0`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-semibold">{entity.name}</h3>
                          <p className="text-sm text-muted-foreground">{entity.role}</p>
                        </div>
                        <Badge variant="outline">{entity.allocation}% allocation</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{entity.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Token Balance</p>
                          <p className="font-semibold">{tokenBalance.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Operations</p>
                          <p className="font-semibold">{operations.length}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Status</p>
                          <Badge variant="default" className="bg-green-500">
                            Active
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Health</p>
                          <Progress value={95} className="h-2 mt-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </TabsContent>

          {/* Tokens Tab */}
          <TabsContent value="tokens" className="mt-6 space-y-6">
            {/* Token Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5">
                <div className="flex items-center gap-3 mb-4">
                  <Coins className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total in Circulation</p>
                    <p className="text-2xl font-bold">
                      {tokenEconomy.totalInCirculation.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/5">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Distributed</p>
                    <p className="text-2xl font-bold">
                      {tokenEconomy.totalDistributed.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/5">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Earned</p>
                    <p className="text-2xl font-bold">
                      {tokenEconomy.totalEarned.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Entity Token Balances */}
            <Card className="p-4 md:p-6">
              <h3 className="font-semibold mb-4">Entity Token Balances</h3>
              <div className="space-y-4">
                {tokenEconomy.entityBalances.map((balance) => {
                  const entity = getEntityById(balance.entityId);
                  if (!entity) return null;
                  const Icon = entity.icon;
                  const percentage = (balance.balance / tokenEconomy.totalInCirculation) * 100;

                  return (
                    <div key={balance.entityId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{entity.shortName}</span>
                        </div>
                        <span className="text-sm font-semibold">
                          {balance.balance.toLocaleString()} tokens
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Distributed: {balance.distributed.toLocaleString()}</span>
                        <span>Earned: {balance.earned.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Token Distribution Action */}
            <Card className="p-4 md:p-6 border-dashed">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="p-3 rounded-full bg-amber-500/10">
                  <Shield className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h4 className="font-semibold">Trust Authority Distribution</h4>
                  <p className="text-sm text-muted-foreground">
                    Distribute tokens from the Trust to child entities based on allocation
                    percentages
                  </p>
                </div>
                <Button className="gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Distribute Tokens
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Operations Tab */}
          <TabsContent value="operations" className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Autonomous Operations</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  Export
                </Button>
              </div>
            </div>

            {autonomousOperations.map((op) => {
              const entity = getEntityById(op.entityId);
              const Icon = entity?.icon || Activity;

              return (
                <Card key={op.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-2 rounded-lg ${
                        op.status === "approved"
                          ? "bg-green-100"
                          : op.status === "pending"
                          ? "bg-yellow-100"
                          : "bg-red-100"
                      }`}
                    >
                      {op.status === "approved" ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : op.status === "pending" ? (
                        <Clock className="w-5 h-5 text-yellow-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-1">
                        <h4 className="font-medium">{op.description}</h4>
                        <Badge
                          variant={op.status === "approved" ? "default" : "secondary"}
                          className={op.status === "approved" ? "bg-green-500" : ""}
                        >
                          {op.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Icon className="w-3 h-3" />
                          {entity?.shortName}
                        </span>
                        <span>•</span>
                        <span>{op.type.replace(/_/g, " ")}</span>
                        <span>•</span>
                        <span>{formatTimeAgo(op.timestamp)}</span>
                        {op.tokensGenerated > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-green-600">
                              +{op.tokensGenerated} tokens
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {op.status === "pending" && (
                      <div className="flex gap-2 shrink-0">
                        <Button size="sm" variant="outline">
                          Reject
                        </Button>
                        <Button size="sm">Approve</Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
