import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  Globe,
  Play,
  RefreshCw,
  Server,
  Shield,
  XCircle,
  Zap,
  History,
  Settings,
  Wrench,
} from "lucide-react";

export default function SystemDiagnostics() {
  const [isRunning, setIsRunning] = useState(false);
  
  const { data: healthStatus, refetch: refetchHealth } = trpc.systemDiagnostics.getHealthStatus.useQuery();
  const { data: runHistory, refetch: refetchHistory } = trpc.systemDiagnostics.getRunHistory.useQuery({ limit: 10 });
  const { data: corrections } = trpc.systemDiagnostics.getCorrectionHistory.useQuery({ limit: 10 });
  const { data: schedules, refetch: refetchSchedules } = trpc.systemDiagnostics.getSchedules.useQuery();
  
  const runDiagnostics = trpc.systemDiagnostics.runDiagnostics.useMutation({
    onMutate: () => setIsRunning(true),
    onSuccess: (result) => {
      setIsRunning(false);
      refetchHealth();
      refetchHistory();
      toast.success(`Diagnostics complete: ${result.passed} passed, ${result.warnings} warnings, ${result.failed} critical`);
    },
    onError: (error) => {
      setIsRunning(false);
      toast.error(`Diagnostics failed: ${error.message}`);
    },
  });
  
  const updateSchedule = trpc.systemDiagnostics.updateSchedule.useMutation({
    onSuccess: () => {
      refetchSchedules();
      toast.success("Schedule updated");
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "critical":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      healthy: "default",
      warning: "secondary",
      critical: "destructive",
      unknown: "outline",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "database":
        return <Database className="w-4 h-4" />;
      case "api":
        return <Globe className="w-4 h-4" />;
      case "entity":
        return <Server className="w-4 h-4" />;
      case "token":
        return <Zap className="w-4 h-4" />;
      case "compliance":
        return <Shield className="w-4 h-4" />;
      case "security":
        return <Shield className="w-4 h-4" />;
      case "performance":
        return <Activity className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  return (
    <div className="container max-w-7xl py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Diagnostics</h1>
          <p className="text-muted-foreground mt-1">
            Monitor system health, run diagnostics, and view self-corrections
          </p>
        </div>
        <Button
          onClick={() => runDiagnostics.mutate({ runType: "manual" })}
          disabled={isRunning}
          size="lg"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Run Diagnostics
            </>
          )}
        </Button>
      </div>

      {/* Overall Status Card */}
      <Card className={`border-2 ${
        healthStatus?.overallStatus === "healthy" ? "border-green-500/50 bg-green-500/5" :
        healthStatus?.overallStatus === "warning" ? "border-yellow-500/50 bg-yellow-500/5" :
        healthStatus?.overallStatus === "critical" ? "border-red-500/50 bg-red-500/5" :
        "border-border"
      }`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {getStatusIcon(healthStatus?.overallStatus || "unknown")}
              <div>
                <h2 className="text-xl font-semibold">System Status: {healthStatus?.overallStatus?.toUpperCase() || "UNKNOWN"}</h2>
                <p className="text-sm text-muted-foreground">
                  {healthStatus?.summary?.healthy || 0} healthy, {healthStatus?.summary?.warning || 0} warnings, {healthStatus?.summary?.critical || 0} critical
                </p>
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              Last checked: {healthStatus?.diagnostics?.[0]?.lastCheckedAt 
                ? new Date(healthStatus.diagnostics[0].lastCheckedAt).toLocaleString()
                : "Never"}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="health" className="space-y-6">
        <TabsList>
          <TabsTrigger value="health" className="gap-2">
            <Activity className="w-4 h-4" />
            Health Checks
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" />
            Run History
          </TabsTrigger>
          <TabsTrigger value="corrections" className="gap-2">
            <Wrench className="w-4 h-4" />
            Self-Corrections
          </TabsTrigger>
          <TabsTrigger value="schedules" className="gap-2">
            <Clock className="w-4 h-4" />
            Schedules
          </TabsTrigger>
        </TabsList>

        {/* Health Checks Tab */}
        <TabsContent value="health" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {healthStatus?.diagnostics?.map((diagnostic) => (
              <Card key={diagnostic.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(diagnostic.category)}
                      <CardTitle className="text-base">{diagnostic.checkName}</CardTitle>
                    </div>
                    {getStatusBadge(diagnostic.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{diagnostic.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Category: {diagnostic.category}
                  </p>
                </CardContent>
              </Card>
            ))}
            {(!healthStatus?.diagnostics || healthStatus.diagnostics.length === 0) && (
              <Card className="col-span-full">
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No diagnostics have been run yet. Click "Run Diagnostics" to start.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Run History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Diagnostic Run History</CardTitle>
              <CardDescription>Recent diagnostic runs and their results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {runHistory?.runs?.map((run) => (
                  <div key={run.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(run.status === "completed" ? 
                        (run.failedChecks && run.failedChecks > 0 ? "critical" : 
                         run.warningChecks && run.warningChecks > 0 ? "warning" : "healthy") 
                        : "unknown")}
                      <div>
                        <p className="font-medium">
                          {run.runType === "scheduled" ? "Scheduled Run" : "Manual Run"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {run.startedAt ? new Date(run.startedAt).toLocaleString() : "Unknown"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex gap-2">
                        <Badge variant="default">{run.passedChecks} passed</Badge>
                        {run.warningChecks && run.warningChecks > 0 && (
                          <Badge variant="secondary">{run.warningChecks} warnings</Badge>
                        )}
                        {run.failedChecks && run.failedChecks > 0 && (
                          <Badge variant="destructive">{run.failedChecks} failed</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Duration: {run.durationMs}ms
                      </p>
                    </div>
                  </div>
                ))}
                {(!runHistory?.runs || runHistory.runs.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">
                    No diagnostic runs recorded yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Self-Corrections Tab */}
        <TabsContent value="corrections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Self-Correction History</CardTitle>
              <CardDescription>Automatic fixes applied by the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {corrections?.map((correction) => (
                  <div key={correction.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4" />
                        <span className="font-medium">{correction.issueType}</span>
                      </div>
                      <Badge variant={
                        correction.status === "applied" ? "default" :
                        correction.status === "failed" ? "destructive" :
                        correction.status === "rolled_back" ? "secondary" : "outline"
                      }>
                        {correction.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{correction.issueDescription}</p>
                    <p className="text-sm mt-2">
                      <span className="font-medium">Action:</span> {correction.correctionAction}
                    </p>
                    {correction.appliedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Applied: {new Date(correction.appliedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
                {(!corrections || corrections.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">
                    No self-corrections have been applied yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedules Tab */}
        <TabsContent value="schedules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Diagnostic Schedules</CardTitle>
              <CardDescription>Configure automatic diagnostic runs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schedules?.map((schedule) => (
                  <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{schedule.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Cron: {schedule.cronExpression}
                      </p>
                      {schedule.lastRunAt && (
                        <p className="text-xs text-muted-foreground">
                          Last run: {new Date(schedule.lastRunAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Enabled</span>
                        <Switch
                          checked={schedule.enabled ?? false}
                          onCheckedChange={(enabled) => 
                            updateSchedule.mutate({ id: schedule.id, enabled })
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {(!schedules || schedules.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">
                    No diagnostic schedules configured.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
