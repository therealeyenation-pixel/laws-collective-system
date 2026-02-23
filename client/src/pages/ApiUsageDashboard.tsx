import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Server,
  Zap,
  RefreshCw,
  Bell,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { 
  apiUsageDashboardService,
  ApiRateLimit,
  ApiCostSummary,
  ApiHealthStatus,
  UsageAlert
} from "@/services/apiUsageDashboardService";

export default function ApiUsageDashboardPage() {
  const [rateLimits, setRateLimits] = useState<ApiRateLimit[]>([]);
  const [costs, setCosts] = useState<ApiCostSummary[]>([]);
  const [health, setHealth] = useState<ApiHealthStatus[]>([]);
  const [alerts, setAlerts] = useState<UsageAlert[]>([]);
  const [usageByHour, setUsageByHour] = useState<{ hour: string; calls: number }[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<string>('all');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setUsageByHour(apiUsageDashboardService.getUsageByHour(
      selectedIntegration === 'all' ? undefined : selectedIntegration
    ));
  }, [selectedIntegration]);

  const loadData = () => {
    setRateLimits(apiUsageDashboardService.getRateLimits());
    setCosts(apiUsageDashboardService.getCostSummary());
    setHealth(apiUsageDashboardService.getHealthStatus());
    setAlerts(apiUsageDashboardService.getAlerts());
    setUsageByHour(apiUsageDashboardService.getUsageByHour());
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    apiUsageDashboardService.acknowledgeAlert(alertId);
    loadData();
    toast.success("Alert acknowledged");
  };

  const stats = apiUsageDashboardService.getStats();
  const maxCalls = Math.max(...usageByHour.map(u => u.calls), 1);

  const getStatusIcon = (status: ApiHealthStatus['status']) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'degraded': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'down': return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: ApiHealthStatus['status']) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'down': return 'bg-red-500';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">API Usage Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Monitor API usage, rate limits, and costs across all integrations
            </p>
          </div>
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalCalls.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Calls (24h)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.successRate}%</p>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.avgResponseTime}ms</p>
                  <p className="text-sm text-muted-foreground">Avg Response</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">${stats.totalCost.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Cost (MTD)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Bell className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeAlerts}</p>
                  <p className="text-sm text-muted-foreground">Active Alerts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>API Calls (Last 24 Hours)</CardTitle>
                <CardDescription>Hourly breakdown of API usage</CardDescription>
              </div>
              <Select value={selectedIntegration} onValueChange={setSelectedIntegration}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Integrations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Integrations</SelectItem>
                  {health.map(h => (
                    <SelectItem key={h.integrationId} value={h.integrationId}>
                      {h.integrationName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-[150px]">
              {usageByHour.map((data, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className="w-full bg-primary/80 rounded-t transition-all hover:bg-primary"
                    style={{ height: `${(data.calls / maxCalls) * 100}%`, minHeight: data.calls > 0 ? '4px' : '0' }}
                  />
                  {i % 4 === 0 && (
                    <span className="text-xs text-muted-foreground">{data.hour}</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="health">
          <TabsList>
            <TabsTrigger value="health">Health Status</TabsTrigger>
            <TabsTrigger value="limits">Rate Limits</TabsTrigger>
            <TabsTrigger value="costs">Costs</TabsTrigger>
            <TabsTrigger value="alerts">Alerts ({alerts.filter(a => !a.acknowledged).length})</TabsTrigger>
          </TabsList>

          <TabsContent value="health" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {health.map((h) => (
                <Card key={h.integrationId}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(h.status)}`} />
                        <span className="font-medium">{h.integrationName}</span>
                      </div>
                      {getStatusIcon(h.status)}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Uptime</span>
                        <span className="font-medium">{h.uptime.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg Response</span>
                        <span className="font-medium">{h.avgResponseTime}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Error Rate</span>
                        <span className={`font-medium ${h.errorRate > 5 ? 'text-red-500' : ''}`}>
                          {h.errorRate}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="limits" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Rate Limit Status</CardTitle>
                <CardDescription>Current usage against rate limits per integration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rateLimits.map((limit) => {
                    const percentage = (limit.used / limit.limit) * 100;
                    return (
                      <div key={limit.integrationId} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{limit.integrationName}</span>
                          <span className="text-sm text-muted-foreground">
                            {limit.used.toLocaleString()} / {limit.limit.toLocaleString()} per {limit.period}
                          </span>
                        </div>
                        <Progress 
                          value={percentage} 
                          className={`h-2 ${percentage > 80 ? '[&>div]:bg-red-500' : percentage > 60 ? '[&>div]:bg-yellow-500' : ''}`}
                        />
                        <p className="text-xs text-muted-foreground">
                          Resets at {limit.resetAt.toLocaleTimeString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="costs" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
                <CardDescription>API costs by integration (current month)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {costs.filter(c => c.currentPeriodCost > 0 || c.budget).map((cost) => (
                    <div key={cost.integrationId} className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{cost.integrationName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">
                            ${cost.currentPeriodCost.toFixed(2)}
                          </span>
                          {cost.previousPeriodCost > 0 && (
                            <Badge variant={cost.currentPeriodCost > cost.previousPeriodCost ? "destructive" : "secondary"}>
                              {cost.currentPeriodCost > cost.previousPeriodCost ? '+' : ''}
                              {((cost.currentPeriodCost - cost.previousPeriodCost) / cost.previousPeriodCost * 100).toFixed(0)}%
                            </Badge>
                          )}
                        </div>
                      </div>
                      {cost.budget && (
                        <>
                          <Progress 
                            value={(cost.currentPeriodCost / cost.budget) * 100} 
                            className="h-2"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            ${cost.currentPeriodCost.toFixed(2)} of ${cost.budget.toFixed(2)} budget
                          </p>
                        </>
                      )}
                    </div>
                  ))}
                  {costs.filter(c => c.currentPeriodCost > 0).length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      No billable API usage this month
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Alerts</CardTitle>
                <CardDescription>Notifications for rate limits, costs, and errors</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div 
                        key={alert.id} 
                        className={`p-4 rounded-lg ${
                          alert.acknowledged 
                            ? 'bg-muted/30' 
                            : alert.severity === 'critical' 
                              ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' 
                              : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                              alert.severity === 'critical' ? 'text-red-500' : 'text-yellow-500'
                            }`} />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{alert.integrationName}</span>
                                <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                                  {alert.type.replace('_', ' ')}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {alert.createdAt.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          {!alert.acknowledged && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleAcknowledgeAlert(alert.id)}
                            >
                              Acknowledge
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    {alerts.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        No alerts at this time
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
