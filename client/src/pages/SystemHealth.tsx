import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  RefreshCw,
  Database,
  Server,
  HardDrive,
  Shield,
  Plug,
  Clock,
  Zap,
  Users,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { systemHealthService, HealthReport, HealthCheck, ErrorLog } from "@/services/systemHealthService";
import { format } from "date-fns";

export default function SystemHealthPage() {
  const [report, setReport] = useState<HealthReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    loadReport();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(loadReport, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const data = await systemHealthService.generateReport();
      setReport(data);
    } catch (error) {
      toast.error("Failed to load health report");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'unhealthy':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Healthy</Badge>;
      case 'degraded':
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Degraded</Badge>;
      case 'unhealthy':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Unhealthy</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'database':
        return <Database className="w-4 h-4" />;
      case 'api':
        return <Server className="w-4 h-4" />;
      case 'storage':
        return <HardDrive className="w-4 h-4" />;
      case 'auth':
        return <Shield className="w-4 h-4" />;
      case 'integration':
        return <Plug className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const formatUptime = (ms: number) => {
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor((ms % 86400000) / 3600000);
    return `${days}d ${hours}h`;
  };

  if (!report) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading system health...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const storagePercent = (report.metrics.storageUsed / report.metrics.storageLimit) * 100;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Activity className="w-8 h-8 text-primary" />
              System Health
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor system status and diagnose issues
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <Clock className="w-4 h-4 mr-2" />
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </Button>
            <Button onClick={loadReport} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Overall Status */}
        <Card className={`border-2 ${
          report.overallStatus === 'healthy' ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20' :
          report.overallStatus === 'degraded' ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20' :
          'border-red-500 bg-red-50/50 dark:bg-red-950/20'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getStatusIcon(report.overallStatus)}
                <div>
                  <h2 className="text-2xl font-bold capitalize">{report.overallStatus}</h2>
                  <p className="text-sm text-muted-foreground">
                    Last checked: {format(report.generatedAt, 'MMM d, yyyy h:mm:ss a')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  {report.checks.filter(c => c.status === 'healthy').length} / {report.checks.length} checks passing
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatUptime(report.metrics.uptime)}</p>
                  <p className="text-xs text-muted-foreground">Uptime</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{report.metrics.avgResponseTime}ms</p>
                  <p className="text-xs text-muted-foreground">Avg Response</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{report.metrics.activeUsers}</p>
                  <p className="text-xs text-muted-foreground">Active Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{report.metrics.errorRate.toFixed(2)}%</p>
                  <p className="text-xs text-muted-foreground">Error Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Storage Usage */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <HardDrive className="w-5 h-5" />
              Storage Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{formatBytes(report.metrics.storageUsed)} used</span>
                <span>{formatBytes(report.metrics.storageLimit)} total</span>
              </div>
              <Progress value={storagePercent} className={storagePercent > 80 ? 'bg-amber-200' : ''} />
              <p className="text-xs text-muted-foreground text-right">
                {storagePercent.toFixed(1)}% used
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="checks" className="space-y-4">
          <TabsList>
            <TabsTrigger value="checks">Health Checks</TabsTrigger>
            <TabsTrigger value="errors">Error Logs</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          {/* Health Checks Tab */}
          <TabsContent value="checks">
            <Card>
              <CardHeader>
                <CardTitle>Component Health</CardTitle>
                <CardDescription>Status of all system components</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.checks.map((check) => (
                    <div
                      key={check.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        {getStatusIcon(check.status)}
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(check.category)}
                          <div>
                            <p className="font-medium">{check.name}</p>
                            <p className="text-sm text-muted-foreground">{check.message}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {check.latency && (
                          <span className="text-sm text-muted-foreground">
                            {check.latency}ms
                          </span>
                        )}
                        {getStatusBadge(check.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Error Logs Tab */}
          <TabsContent value="errors">
            <Card>
              <CardHeader>
                <CardTitle>Recent Errors</CardTitle>
                <CardDescription>System errors and warnings</CardDescription>
              </CardHeader>
              <CardContent>
                {report.recentErrors.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    <p>No recent errors</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {report.recentErrors.map((error) => (
                        <div
                          key={error.id}
                          className={`p-4 border rounded-lg ${
                            error.level === 'error' ? 'border-red-200 bg-red-50/50 dark:bg-red-950/20' :
                            error.level === 'warning' ? 'border-amber-200 bg-amber-50/50 dark:bg-amber-950/20' :
                            'border-blue-200 bg-blue-50/50 dark:bg-blue-950/20'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant={
                                  error.level === 'error' ? 'destructive' :
                                  error.level === 'warning' ? 'default' : 'secondary'
                                }>
                                  {error.level}
                                </Badge>
                                <span className="text-sm font-medium">{error.component}</span>
                              </div>
                              <p className="text-sm mt-1">{error.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(error.timestamp, 'MMM d, yyyy h:mm:ss a')}
                              </p>
                            </div>
                            {error.resolved && (
                              <Badge variant="outline" className="text-green-600">Resolved</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>Suggested actions to improve system health</CardDescription>
              </CardHeader>
              <CardContent>
                {report.recommendations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    <p>No recommendations - system is healthy</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {report.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-4 border rounded-lg">
                        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p>{rec}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
