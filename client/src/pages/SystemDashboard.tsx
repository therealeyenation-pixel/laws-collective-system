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
  Loader2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

// Icon mapping for entity types
const entityIcons: Record<string, any> = {
  trust: Shield,
  llc: Building2,
  collective: BookOpen,
  corporation: Server,
};

// Color mapping for entity types
const entityColors: Record<string, { color: string; borderColor: string }> = {
  trust: { color: "from-amber-500/20 to-amber-600/10", borderColor: "border-l-amber-500" },
  llc: { color: "from-blue-500/20 to-blue-600/10", borderColor: "border-l-blue-500" },
  collective: { color: "from-green-500/20 to-green-600/10", borderColor: "border-l-green-500" },
  corporation: { color: "from-purple-500/20 to-purple-600/10", borderColor: "border-l-purple-500" },
};

// Role mapping based on financial structure
const getRoleFromStructure = (structure: any): string => {
  if (!structure) return "Entity";
  const role = structure.role;
  switch (role) {
    case "root_authority": return "Root Authority";
    case "commercial_engine": return "Commercial Engine";
    case "education_platform": return "Education & Simulation";
    case "media_truth": return "Media & Truth";
    case "nonprofit_outreach": return "Nonprofit Outreach";
    default: return "Entity";
  }
};

export default function SystemDashboard() {
  const [selectedEntity, setSelectedEntity] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isRunningCycle, setIsRunningCycle] = useState(false);

  // Fetch real data from database
  const { data: entities, isLoading: entitiesLoading, refetch: refetchEntities } = trpc.companySetup.getAllEntities.useQuery();
  const { data: tokenData, isLoading: tokenLoading } = trpc.tokenEconomy.getSystemTokens.useQuery();
  const { data: operations, isLoading: opsLoading, refetch: refetchOps } = trpc.autonomousEngine.getRecentOperations.useQuery();
  
  // Run autonomous cycle mutation
  const runCycleMutation = trpc.autonomousEngine.runAutonomousCycle.useMutation({
    onSuccess: () => {
      refetchEntities();
      refetchOps();
      setIsRunningCycle(false);
    },
    onError: () => {
      setIsRunningCycle(false);
    }
  });

  const handleRunCycle = () => {
    setIsRunningCycle(true);
    runCycleMutation.mutate({});
  };

  // Process entities data
  const processedEntities = entities?.map((entity: any) => {
    const structure = entity.financialStructure as any;
    const Icon = entityIcons[entity.entityType] || Building2;
    const colors = entityColors[entity.entityType] || entityColors.llc;
    
    return {
      id: entity.id,
      name: entity.name,
      shortName: entity.name.split(' - ')[0] || entity.name.split(',')[0] || entity.name,
      type: entity.entityType,
      role: getRoleFromStructure(structure),
      description: entity.description || "",
      allocation: structure?.allocation || 0,
      icon: Icon,
      color: colors.color,
      borderColor: colors.borderColor,
      parentId: structure?.parent === "trust" ? entities?.find((e: any) => e.entityType === "trust")?.id : null,
      status: entity.status,
      trustLevel: entity.trustLevel,
    };
  }) || [];

  // Get trust entity (root)
  const trustEntity = processedEntities.find(e => e.type === "trust");
  const childEntities = processedEntities.filter(e => e.type !== "trust");

  // Calculate totals
  const totalTokens = tokenData?.totalTokens || 0;
  const totalOperations = operations?.length || 0;
  const pendingOperations = operations?.filter((op: any) => op.status === "pending").length || 0;

  const formatTimeAgo = (date: Date | string) => {
    const d = new Date(date);
    const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toLocaleString();
  };

  if (entitiesLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading company data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {trustEntity?.name || "CALEA Freeman Family Trust"}
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
            <Button 
              size="sm" 
              className="gap-2" 
              onClick={handleRunCycle}
              disabled={isRunningCycle}
            >
              {isRunningCycle ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {isRunningCycle ? "Running..." : "Run Autonomous Cycle"}
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
                <p className="text-xl font-bold">{processedEntities.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Coins className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Tokens</p>
                <p className="text-xl font-bold">{formatNumber(totalTokens)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Operations</p>
                <p className="text-xl font-bold">{totalOperations}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-xl font-bold">{pendingOperations}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="entities">Entities</TabsTrigger>
            <TabsTrigger value="tokens">Tokens</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Company Structure */}
            <Card className="p-4 md:p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Link2 className="w-5 h-5" />
                Company Structure
              </h3>
              <div className="space-y-3">
                {/* Trust (Root) */}
                {trustEntity && (
                  <div className={`p-4 rounded-lg bg-gradient-to-r ${trustEntity.color} border-l-4 ${trustEntity.borderColor}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <trustEntity.icon className="w-6 h-6 text-amber-600" />
                        <div>
                          <p className="font-semibold">{trustEntity.shortName}</p>
                          <p className="text-sm text-muted-foreground">{trustEntity.role}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{trustEntity.role}</Badge>
                    </div>
                  </div>
                )}

                {/* Child Entities */}
                <div className="ml-6 space-y-2 border-l-2 border-dashed border-muted pl-4">
                  {childEntities.map((entity) => (
                    <div
                      key={entity.id}
                      className={`p-3 rounded-lg bg-gradient-to-r ${entity.color} border-l-4 ${entity.borderColor} cursor-pointer hover:shadow-md transition-shadow`}
                      onClick={() => setSelectedEntity(entity.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <entity.icon className="w-5 h-5" />
                          <div>
                            <p className="font-medium">{entity.shortName}</p>
                            <p className="text-xs text-muted-foreground">{entity.allocation}% allocation</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Recent Operations */}
            <Card className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Autonomous Operations
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab("operations")}>
                  View All
                </Button>
              </div>
              <div className="space-y-3">
                {operations && operations.length > 0 ? (
                  operations.slice(0, 4).map((op: any) => {
                    const entity = processedEntities.find(e => e.id === op.businessEntityId);
                    const decision = op.decision as any;
                    return (
                      <div key={op.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        {op.status === "executed" ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        ) : op.status === "pending" ? (
                          <Clock className="w-5 h-5 text-orange-500 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{decision?.action || op.operationType}</p>
                          <p className="text-xs text-muted-foreground">
                            {entity?.shortName || "Unknown"} • {formatTimeAgo(op.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No operations yet</p>
                    <p className="text-sm">Click "Run Autonomous Cycle" to generate operations</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Entities Tab */}
          <TabsContent value="entities" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {processedEntities.map((entity) => (
                <Card key={entity.id} className={`p-4 border-l-4 ${entity.borderColor}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${entity.color}`}>
                        <entity.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{entity.shortName}</h4>
                        <p className="text-xs text-muted-foreground">{entity.role}</p>
                      </div>
                    </div>
                    <Badge variant={entity.status === "active" ? "default" : "secondary"}>
                      {entity.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{entity.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Allocation</span>
                    <span className="font-semibold">{entity.allocation}%</span>
                  </div>
                  <Progress value={entity.allocation} className="mt-2" />
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tokens Tab */}
          <TabsContent value="tokens" className="space-y-4 mt-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Coins className="w-5 h-5" />
                Token Economy Overview
              </h3>
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <div className="p-4 rounded-lg bg-green-500/10">
                  <p className="text-sm text-muted-foreground">Total Balance</p>
                  <p className="text-2xl font-bold text-green-600">{formatNumber(totalTokens)}</p>
                </div>
                <div className="p-4 rounded-lg bg-blue-500/10">
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatNumber(totalTokens * 0.6)}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-orange-500/10">
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatNumber(totalTokens * 0.1)}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium">Entity Allocations</h4>
                {childEntities.map((entity) => (
                  <div key={entity.id} className="flex items-center gap-3">
                    <entity.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1 text-sm">{entity.shortName}</span>
                    <span className="text-sm font-medium">{entity.allocation}%</span>
                    <span className="text-sm text-muted-foreground w-24 text-right">
                      {formatNumber(totalTokens * (entity.allocation / 100))} tokens
                    </span>
                  </div>
                ))}
              </div>
            </Card>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Distribute Tokens
              </Button>
              <Button variant="outline" className="gap-2">
                <DollarSign className="w-4 h-4" />
                Convert to Crypto
              </Button>
            </div>
          </TabsContent>

          {/* Operations Tab */}
          <TabsContent value="operations" className="space-y-4 mt-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileCheck className="w-5 h-5" />
                All Autonomous Operations
              </h3>
              <div className="space-y-3">
                {operations && operations.length > 0 ? (
                  operations.map((op: any) => {
                    const entity = processedEntities.find(e => e.id === op.businessEntityId);
                    const decision = op.decision as any;
                    return (
                      <div key={op.id} className="flex items-start gap-3 p-4 rounded-lg border">
                        {op.status === "executed" ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        ) : op.status === "pending" ? (
                          <Clock className="w-5 h-5 text-orange-500 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{decision?.action || op.operationType}</p>
                            <Badge variant={op.status === "executed" ? "default" : "secondary"}>
                              {op.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {entity?.shortName || "Unknown"} • {formatTimeAgo(op.createdAt)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {op.status === "pending" && (
                            <>
                              <Button size="sm" variant="outline" className="text-green-600">
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600">
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium">No operations yet</p>
                    <p className="text-sm mb-4">Click "Run Autonomous Cycle" to generate your first operations</p>
                    <Button onClick={handleRunCycle} disabled={isRunningCycle}>
                      {isRunningCycle ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4 mr-2" />
                      )}
                      Run Autonomous Cycle
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
