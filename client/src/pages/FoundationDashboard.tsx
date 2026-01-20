import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  BarChart3, 
  Building2, 
  ClipboardList, 
  FileText, 
  Map, 
  Package, 
  Shield, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { DepartmentProcedures } from "@/components/DepartmentProcedures";

export default function FoundationDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch dashboard summary
  const { data: summary, isLoading: summaryLoading } = trpc.foundationLayer.getDashboardSummary.useQuery();
  
  // Fetch lists
  const { data: requests } = trpc.foundationLayer.getRequests.useQuery({ limit: 5 });
  const { data: assets } = trpc.foundationLayer.getAssets.useQuery({ limit: 5 });
  const { data: risks } = trpc.foundationLayer.getRisks.useQuery({ limit: 5 });
  const { data: incidents } = trpc.foundationLayer.getIncidents.useQuery({ limit: 5 });
  const { data: metricsData } = trpc.foundationLayer.getMetrics.useQuery({ limit: 10 });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "achieved":
      case "on_track":
      case "resolved":
        return "bg-green-500";
      case "pending_manager":
      case "pending_finance":
      case "pending_executive":
      case "at_risk":
      case "investigating":
        return "bg-yellow-500";
      case "rejected":
      case "off_track":
      case "critical":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRiskSeverityColor = (score: number) => {
    if (score >= 20) return "text-red-600 bg-red-100";
    if (score >= 15) return "text-orange-600 bg-orange-100";
    if (score >= 10) return "text-yellow-600 bg-yellow-100";
    return "text-green-600 bg-green-100";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Building2 className="w-8 h-8 text-primary" />
          Foundation Layer Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Monitoring & Evaluation, Risk Management, Asset Tracking, and Operational Metrics
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {summaryLoading ? "..." : summary?.requests?.total ?? 0}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              {summary?.requests?.pending ?? 0} pending
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              {summaryLoading ? "..." : summary?.assets?.total ?? 0}
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              {summary?.assets?.assigned ?? 0} assigned
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 border-red-200 dark:border-red-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Risks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900 dark:text-red-100">
              {summaryLoading ? "..." : summary?.risks?.total ?? 0}
            </div>
            <p className="text-xs text-red-600 dark:text-red-400">
              {summary?.risks?.highRisk ?? 0} high risk
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {summaryLoading ? "..." : summary?.incidents?.total ?? 0}
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400">
              {summary?.incidents?.active ?? 0} active
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {summaryLoading ? "..." : summary?.metrics?.total ?? 0}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400">
              {summary?.metrics?.onTrack ?? 0} on track
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="risks">Risks</TabsTrigger>
          <TabsTrigger value="metrics">M&E</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" />
                  Recent Requests
                </CardTitle>
                <CardDescription>Latest procurement and service requests</CardDescription>
              </CardHeader>
              <CardContent>
                {requests && requests.length > 0 ? (
                  <div className="space-y-3">
                    {requests.map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{req.itemSpec}</p>
                          <p className="text-xs text-muted-foreground capitalize">{req.category}</p>
                        </div>
                        <Badge className={getStatusColor(req.status)}>
                          {req.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No requests yet</p>
                )}
              </CardContent>
            </Card>

            {/* Risk Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Risk Overview
                </CardTitle>
                <CardDescription>Active risks requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                {risks && risks.length > 0 ? (
                  <div className="space-y-3">
                    {risks.map((risk) => (
                      <div key={risk.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{risk.title}</p>
                          <p className="text-xs text-muted-foreground capitalize">{risk.category}</p>
                        </div>
                        <Badge className={getRiskSeverityColor(risk.riskScore ?? 0)}>
                          Score: {risk.riskScore}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No risks registered</p>
                )}
              </CardContent>
            </Card>

            {/* Active Incidents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Active Incidents
                </CardTitle>
                <CardDescription>Incidents requiring resolution</CardDescription>
              </CardHeader>
              <CardContent>
                {incidents && incidents.length > 0 ? (
                  <div className="space-y-3">
                    {incidents.map((incident) => (
                      <div key={incident.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{incident.title}</p>
                          <p className="text-xs text-muted-foreground capitalize">{incident.incidentType.replace(/_/g, " ")}</p>
                        </div>
                        <Badge variant={incident.severity === "critical" ? "destructive" : "secondary"}>
                          {incident.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No active incidents</p>
                )}
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Key Performance Metrics
                </CardTitle>
                <CardDescription>M&E tracking indicators</CardDescription>
              </CardHeader>
              <CardContent>
                {metricsData && metricsData.length > 0 ? (
                  <div className="space-y-4">
                    {metricsData.slice(0, 4).map((metric) => {
                      const target = parseFloat(metric.targetValue ?? "100");
                      const actual = parseFloat(metric.actualValue ?? "0");
                      const progress = Math.min((actual / target) * 100, 100);
                      return (
                        <div key={metric.id} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{metric.name}</span>
                            <span className="text-muted-foreground">
                              {actual} / {target} {metric.unit}
                            </span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No metrics defined</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Request Management</CardTitle>
              <CardDescription>
                Track procurement requests, approvals, and fulfillment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requests && requests.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 text-sm font-medium">Item</th>
                          <th className="text-left p-2 text-sm font-medium">Category</th>
                          <th className="text-left p-2 text-sm font-medium">Quantity</th>
                          <th className="text-left p-2 text-sm font-medium">Status</th>
                          <th className="text-left p-2 text-sm font-medium">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.map((req) => (
                          <tr key={req.id} className="border-b hover:bg-secondary/20">
                            <td className="p-2 text-sm">{req.itemSpec}</td>
                            <td className="p-2 text-sm capitalize">{req.category}</td>
                            <td className="p-2 text-sm">{req.quantity}</td>
                            <td className="p-2">
                              <Badge className={getStatusColor(req.status)} variant="secondary">
                                {req.status.replace(/_/g, " ")}
                              </Badge>
                            </td>
                            <td className="p-2 text-sm text-muted-foreground">
                              {new Date(req.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No requests found</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Requests will appear here when submitted through the system
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assets Tab */}
        <TabsContent value="assets">
          <Card>
            <CardHeader>
              <CardTitle>Asset Management</CardTitle>
              <CardDescription>
                Track equipment, vehicles, and property owned by the organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assets && assets.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 text-sm font-medium">Type</th>
                          <th className="text-left p-2 text-sm font-medium">Make/Model</th>
                          <th className="text-left p-2 text-sm font-medium">Serial/VIN</th>
                          <th className="text-left p-2 text-sm font-medium">Owner</th>
                          <th className="text-left p-2 text-sm font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assets.map((asset) => (
                          <tr key={asset.id} className="border-b hover:bg-secondary/20">
                            <td className="p-2 text-sm capitalize">{asset.assetType.replace(/_/g, " ")}</td>
                            <td className="p-2 text-sm">{asset.makeModel || "-"}</td>
                            <td className="p-2 text-sm font-mono text-xs">{asset.serialOrVin || "-"}</td>
                            <td className="p-2 text-sm capitalize">{asset.ownerEntity}</td>
                            <td className="p-2">
                              <Badge className={getStatusColor(asset.status)} variant="secondary">
                                {asset.status.replace(/_/g, " ")}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No assets registered</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Assets will appear here when added to the system
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risks Tab */}
        <TabsContent value="risks">
          <Card>
            <CardHeader>
              <CardTitle>Risk & Contingency Management</CardTitle>
              <CardDescription>
                Identify, assess, and mitigate organizational risks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {risks && risks.length > 0 ? (
                  <div className="grid gap-4">
                    {risks.map((risk) => (
                      <Card key={risk.id} className="border-l-4" style={{ borderLeftColor: risk.riskScore && risk.riskScore >= 15 ? "#ef4444" : risk.riskScore && risk.riskScore >= 10 ? "#f59e0b" : "#22c55e" }}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold">{risk.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{risk.description}</p>
                              <div className="flex gap-2 mt-3">
                                <Badge variant="outline" className="capitalize">{risk.category}</Badge>
                                <Badge variant="outline">Likelihood: {risk.likelihood}</Badge>
                                <Badge variant="outline">Impact: {risk.impact}</Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={getRiskSeverityColor(risk.riskScore ?? 0)}>
                                Risk Score: {risk.riskScore}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-2 capitalize">
                                Mitigation: {risk.mitigationStatus?.replace(/_/g, " ")}
                              </p>
                            </div>
                          </div>
                          {risk.mitigationStrategy && (
                            <div className="mt-3 p-3 bg-secondary/30 rounded">
                              <p className="text-xs font-medium">Mitigation Strategy:</p>
                              <p className="text-sm text-muted-foreground">{risk.mitigationStrategy}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No risks registered</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Risks will appear here when identified and logged
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>Monitoring & Evaluation</CardTitle>
              <CardDescription>
                Track key performance indicators and program outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metricsData && metricsData.length > 0 ? (
                  <div className="grid gap-4">
                    {metricsData.map((metric) => {
                      const target = parseFloat(metric.targetValue ?? "100");
                      const actual = parseFloat(metric.actualValue ?? "0");
                      const progress = Math.min((actual / target) * 100, 100);
                      
                      return (
                        <Card key={metric.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-semibold">{metric.name}</h4>
                                {metric.description && (
                                  <p className="text-sm text-muted-foreground">{metric.description}</p>
                                )}
                              </div>
                              <Badge className={getStatusColor(metric.status)}>
                                {metric.status.replace(/_/g, " ")}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span className="font-medium">
                                  {actual} / {target} {metric.unit}
                                </span>
                              </div>
                              <Progress value={progress} className="h-3" />
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Badge variant="outline" className="capitalize">{metric.category}</Badge>
                              <Badge variant="outline">
                                {new Date(metric.periodStart).toLocaleDateString()} - {new Date(metric.periodEnd).toLocaleDateString()}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No metrics defined</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Metrics will appear here when added to the M&E framework
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <DepartmentProcedures 
            department="Foundation" 
            title="Foundation Document Repository"
            description="Governance documents, bylaws, compliance records, and foundation policies"
            showCategories={true}
            showSearch={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
