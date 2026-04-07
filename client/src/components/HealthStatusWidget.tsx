import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  Clock,
  Zap,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

interface HealthMetrics {
  status: "healthy" | "degraded" | "critical";
  uptime: number;
  errorCount: number;
  memoryUsage: number;
  cpuUsage: number;
  components: {
    database: "healthy" | "degraded" | "critical";
    api: "healthy" | "degraded" | "critical";
    cache: "healthy" | "degraded" | "critical";
    storage: "healthy" | "degraded" | "critical";
  };
}

export function HealthStatusWidget() {
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const healthQuery = trpc.systemHealth.getHealth.useQuery(undefined, {
    refetchInterval: autoRefresh ? 30000 : false, // 30 seconds
  });

  useEffect(() => {
    if (healthQuery.data) {
      setMetrics({
        status: healthQuery.data.status,
        uptime: healthQuery.data.metrics.uptime,
        errorCount: healthQuery.data.metrics.errorCount,
        memoryUsage: healthQuery.data.metrics.memoryUsage,
        cpuUsage: healthQuery.data.metrics.cpuUsage,
        components: healthQuery.data.components,
      });
    }
  }, [healthQuery.data]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await healthQuery.refetch();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600";
      case "degraded":
        return "text-yellow-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-50 border-green-200";
      case "degraded":
        return "bg-yellow-50 border-yellow-200";
      case "critical":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "degraded":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case "critical":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  if (!metrics) {
    return (
      <Card className="p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            System Health
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-center py-8">
          <Activity className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-muted-foreground">Loading health data...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 border ${getStatusBgColor(metrics.status)}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {getStatusIcon(metrics.status)}
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              System Health
            </h3>
            <p className={`text-sm font-medium ${getStatusColor(metrics.status)}`}>
              {metrics.status.charAt(0).toUpperCase() + metrics.status.slice(1)}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-muted-foreground">Uptime</span>
          </div>
          <p className="text-lg font-semibold text-foreground">
            {formatUptime(metrics.uptime)}
          </p>
        </div>

        <div className="bg-white/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-xs text-muted-foreground">Errors (1h)</span>
          </div>
          <p className="text-lg font-semibold text-foreground">
            {metrics.errorCount}
          </p>
        </div>

        <div className="bg-white/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-yellow-600" />
            <span className="text-xs text-muted-foreground">Memory</span>
          </div>
          <p className="text-lg font-semibold text-foreground">
            {metrics.memoryUsage.toFixed(1)} MB
          </p>
        </div>

        <div className="bg-white/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span className="text-xs text-muted-foreground">CPU</span>
          </div>
          <p className="text-lg font-semibold text-foreground">
            {metrics.cpuUsage.toFixed(2)}s
          </p>
        </div>
      </div>

      {/* Component Status */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-foreground mb-3">
          Component Status
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(metrics.components).map(([name, status]) => (
            <div
              key={name}
              className="flex items-center gap-2 text-sm p-2 bg-white/50 rounded"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  status === "healthy"
                    ? "bg-green-600"
                    : status === "degraded"
                      ? "bg-yellow-600"
                      : "bg-red-600"
                }`}
              />
              <span className="text-foreground capitalize">
                {name.replace(/_/g, " ")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Auto-refresh Toggle */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="rounded"
          />
          Auto-refresh (30s)
        </label>
        <span className="text-xs text-muted-foreground">
          Last updated: {new Date().toLocaleTimeString()}
        </span>
      </div>
    </Card>
  );
}
