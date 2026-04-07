import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BarChart3, TrendingUp, AlertCircle, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

export default function RealtimeDashboards() {
  const { user } = useAuth();
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [metrics, setMetrics] = useState({
    systemHealth: 98.5,
    activeUsers: 1247,
    apiLatency: 45,
    errorRate: 0.2,
    throughput: 15420,
    uptime: 99.99,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        systemHealth: Math.min(100, prev.systemHealth + (Math.random() - 0.4)),
        activeUsers: Math.max(0, prev.activeUsers + Math.floor((Math.random() - 0.5) * 50)),
        apiLatency: Math.max(10, prev.apiLatency + (Math.random() - 0.5) * 10),
        errorRate: Math.max(0, prev.errorRate + (Math.random() - 0.5) * 0.05),
        throughput: Math.max(0, prev.throughput + Math.floor((Math.random() - 0.5) * 1000)),
        uptime: Math.min(100, prev.uptime + (Math.random() - 0.4) * 0.01),
      }));
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Real-time Dashboards</h1>
            <p className="text-muted-foreground mt-2">Live system metrics and performance monitoring</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setRefreshInterval(5000)}>
              <RefreshCw className="w-4 h-4 mr-2" />
              5s Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => setRefreshInterval(10000)}>
              10s Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">System Health</p>
                <p className="text-3xl font-bold text-green-600">{metrics.systemHealth.toFixed(1)}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-3xl font-bold text-blue-600">{metrics.activeUsers.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">API Latency</p>
                <p className="text-3xl font-bold text-purple-600">{metrics.apiLatency.toFixed(0)}ms</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Error Rate</p>
                <p className="text-3xl font-bold text-red-600">{metrics.errorRate.toFixed(2)}%</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Throughput</p>
                <p className="text-3xl font-bold text-amber-600">{(metrics.throughput / 1000).toFixed(1)}K req/s</p>
              </div>
              <TrendingUp className="w-8 h-8 text-amber-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="text-3xl font-bold text-indigo-600">{metrics.uptime.toFixed(2)}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-indigo-600 opacity-50" />
            </div>
          </Card>
        </div>

        {/* Alerts Section */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Active Alerts</h2>
          <div className="space-y-3">
            {metrics.errorRate > 0.5 && (
              <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-900 dark:text-red-100">High Error Rate</p>
                  <p className="text-sm text-red-700 dark:text-red-200">Error rate exceeds threshold</p>
                </div>
              </div>
            )}
            {metrics.apiLatency > 100 && (
              <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-yellow-900 dark:text-yellow-100">High Latency</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-200">API response time is elevated</p>
                </div>
              </div>
            )}
            {metrics.systemHealth > 95 && metrics.errorRate < 0.5 && metrics.apiLatency < 100 && (
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-100">All Systems Normal</p>
                  <p className="text-sm text-green-700 dark:text-green-200">No active alerts</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
