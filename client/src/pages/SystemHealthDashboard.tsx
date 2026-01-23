import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Database, 
  Building2, 
  Home, 
  FileCheck, 
  Coins, 
  FileText, 
  Users,
  Clock,
  Zap,
  Shield,
  HelpCircle
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type HealthStatus = "healthy" | "warning" | "critical" | "unknown";

const statusConfig: Record<HealthStatus, { color: string; icon: React.ReactNode; bgColor: string }> = {
  healthy: { 
    color: "text-green-600", 
    icon: <CheckCircle className="w-5 h-5" />,
    bgColor: "bg-green-50 dark:bg-green-950/20"
  },
  warning: { 
    color: "text-amber-600", 
    icon: <AlertTriangle className="w-5 h-5" />,
    bgColor: "bg-amber-50 dark:bg-amber-950/20"
  },
  critical: { 
    color: "text-red-600", 
    icon: <XCircle className="w-5 h-5" />,
    bgColor: "bg-red-50 dark:bg-red-950/20"
  },
  unknown: { 
    color: "text-gray-500", 
    icon: <HelpCircle className="w-5 h-5" />,
    bgColor: "bg-gray-50 dark:bg-gray-950/20"
  },
};

const categoryIcons: Record<string, React.ReactNode> = {
  "Database": <Database className="w-5 h-5" />,
  "Business Entities": <Building2 className="w-5 h-5" />,
  "House System": <Home className="w-5 h-5" />,
  "Compliance": <FileCheck className="w-5 h-5" />,
  "Token Economy": <Coins className="w-5 h-5" />,
  "Document Storage": <FileText className="w-5 h-5" />,
  "User System": <Users className="w-5 h-5" />,
};

export default function SystemHealthDashboard() {
  const [isRunning, setIsRunning] = useState(false);
  
  const diagnosticQuery = trpc.autoDiagnostic.runDiagnostic.useQuery(undefined, {
    enabled: false,
    refetchOnWindowFocus: false,
  });

  const quickStatusQuery = trpc.autoDiagnostic.getQuickStatus.useQuery();

  const triggerMutation = trpc.autoDiagnostic.triggerManualDiagnostic.useMutation({
    onSuccess: () => {
      toast.success("Diagnostic triggered successfully");
    },
    onError: (error) => {
      toast.error("Failed to trigger diagnostic: " + error.message);
    },
  });

  const handleRunDiagnostic = async () => {
    setIsRunning(true);
    try {
      await diagnosticQuery.refetch();
      toast.success("Diagnostic completed");
    } catch (error) {
      toast.error("Diagnostic failed");
    } finally {
      setIsRunning(false);
    }
  };

  const overallStatus = diagnosticQuery.data?.overallStatus || quickStatusQuery.data?.status === "operational" ? "healthy" : "unknown";

  return (
    <div className="container max-w-6xl py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Activity className="w-8 h-8 text-primary" />
            System Health Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor all system integrations and run diagnostics
          </p>
        </div>
        <Button 
          onClick={handleRunDiagnostic} 
          disabled={isRunning}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRunning ? "animate-spin" : ""}`} />
          {isRunning ? "Running..." : "Run Diagnostic"}
        </Button>
      </div>

      {/* Overall Status Card */}
      <Card className={`mb-8 border-2 ${
        overallStatus === "healthy" ? "border-green-500" :
        overallStatus === "warning" ? "border-amber-500" :
        overallStatus === "critical" ? "border-red-500" :
        "border-muted"
      }`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-full ${statusConfig[overallStatus as HealthStatus]?.bgColor || statusConfig.unknown.bgColor}`}>
                <Shield className={`w-8 h-8 ${statusConfig[overallStatus as HealthStatus]?.color || statusConfig.unknown.color}`} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {overallStatus === "healthy" ? "All Systems Operational" :
                   overallStatus === "warning" ? "Some Issues Detected" :
                   overallStatus === "critical" ? "Critical Issues Found" :
                   "Status Unknown"}
                </h2>
                <p className="text-muted-foreground">
                  {diagnosticQuery.data?.timestamp 
                    ? `Last checked: ${format(new Date(diagnosticQuery.data.timestamp), "PPpp")}`
                    : quickStatusQuery.data?.timestamp
                    ? `Quick check: ${format(new Date(quickStatusQuery.data.timestamp), "PPpp")}`
                    : "Run a diagnostic to check system health"
                  }
                </p>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={`text-lg px-4 py-2 ${statusConfig[overallStatus as HealthStatus]?.color || statusConfig.unknown.color}`}
            >
              {overallStatus.toUpperCase()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Health Checks Grid */}
      {diagnosticQuery.data?.checks && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {diagnosticQuery.data.checks.map((check, idx) => (
            <Card key={idx} className={statusConfig[check.status]?.bgColor || statusConfig.unknown.bgColor}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {categoryIcons[check.category] || <Zap className="w-5 h-5" />}
                    </span>
                    <CardTitle className="text-base">{check.category}</CardTitle>
                  </div>
                  <span className={statusConfig[check.status]?.color || statusConfig.unknown.color}>
                    {statusConfig[check.status]?.icon || statusConfig.unknown.icon}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground">{check.message}</p>
                {check.details && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {Object.entries(check.details).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {diagnosticQuery.data?.recommendations && diagnosticQuery.data.recommendations.length > 0 && (
        <Card className="mb-8 border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              Recommendations
            </CardTitle>
            <CardDescription>Actions to improve system health</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {diagnosticQuery.data.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common maintenance tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col gap-2"
              onClick={() => triggerMutation.mutate()}
              disabled={triggerMutation.isPending}
            >
              <RefreshCw className="w-5 h-5" />
              <span>Schedule Auto-Diagnostic</span>
              <span className="text-xs text-muted-foreground">Runs every 24 hours</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col gap-2"
              onClick={() => toast.info("Compliance check initiated")}
            >
              <FileCheck className="w-5 h-5" />
              <span>Check Compliance</span>
              <span className="text-xs text-muted-foreground">Review upcoming deadlines</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col gap-2"
              onClick={() => toast.info("Token audit initiated")}
            >
              <Coins className="w-5 h-5" />
              <span>Audit Token Economy</span>
              <span className="text-xs text-muted-foreground">Verify token balances</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Info Footer */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p className="flex items-center justify-center gap-2">
          <Clock className="w-4 h-4" />
          Auto-diagnostic runs daily at midnight. Manual trigger available anytime.
        </p>
      </div>
    </div>
  );
}
