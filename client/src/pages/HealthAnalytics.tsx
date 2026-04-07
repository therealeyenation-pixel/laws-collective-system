import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Download,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

interface UptimeData {
  date: string;
  uptime: number;
  downtime: number;
}

interface ErrorTrendData {
  time: string;
  errors: number;
  resolved: number;
}

interface ComponentHealthData {
  name: string;
  value: number;
  color: string;
}

export default function HealthAnalytics() {
  const [timeRange, setTimeRange] = useState<"30d" | "90d" | "365d">("30d");
  const [uptimeData, setUptimeData] = useState<UptimeData[]>([]);
  const [errorTrendData, setErrorTrendData] = useState<ErrorTrendData[]>([]);
  const [componentHealth, setComponentHealth] = useState<ComponentHealthData[]>(
    []
  );

  const healthQuery = trpc.systemHealth.getHealth.useQuery();
  const statusQuery = trpc.systemHealth.getStatus.useQuery();
  const metricsQuery = trpc.systemHealth.getMetrics.useQuery();

  // Generate mock data for charts
  useEffect(() => {
    // Generate uptime data based on time range
    const days = timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 365;
    const uptimeArray: UptimeData[] = [];

    for (let i = days; i > 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      uptimeArray.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        uptime: 99 + Math.random() * 1,
        downtime: Math.random() * 1,
      });
    }
    setUptimeData(uptimeArray);

    // Generate error trend data
    const errorArray: ErrorTrendData[] = [];
    for (let i = 0; i < 24; i++) {
      errorArray.push({
        time: `${i}:00`,
        errors: Math.floor(Math.random() * 20),
        resolved: Math.floor(Math.random() * 18),
      });
    }
    setErrorTrendData(errorArray);

    // Generate component health data
    setComponentHealth([
      { name: "Database", value: 98, color: "#10b981" },
      { name: "API", value: 99, color: "#3b82f6" },
      { name: "Cache", value: 97, color: "#f59e0b" },
      { name: "Storage", value: 99, color: "#8b5cf6" },
    ]);
  }, [timeRange]);

  const handleExportReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      timeRange,
      metrics: metricsQuery.data,
      status: statusQuery.data,
      uptimeData,
      errorTrendData,
      componentHealth,
    };

    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `health-report-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
  };

  const calculateAverageUptime = () => {
    if (uptimeData.length === 0) return 0;
    const sum = uptimeData.reduce((acc, item) => acc + item.uptime, 0);
    return (sum / uptimeData.length).toFixed(2);
  };

  const calculateTotalErrors = () => {
    return errorTrendData.reduce((acc, item) => acc + item.errors, 0);
  };

  const calculateResolutionRate = () => {
    const totalErrors = calculateTotalErrors();
    const totalResolved = errorTrendData.reduce(
      (acc, item) => acc + item.resolved,
      0
    );
    return totalErrors > 0 ? ((totalResolved / totalErrors) * 100).toFixed(1) : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Health Analytics
          </h1>
          <p className="text-muted-foreground mt-2">
            System performance and reliability metrics
          </p>
        </div>
        <Button onClick={handleExportReport}>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        {(["30d", "90d", "365d"] as const).map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? "default" : "outline"}
            onClick={() => setTimeRange(range)}
          >
            {range === "30d"
              ? "Last 30 Days"
              : range === "90d"
                ? "Last 90 Days"
                : "Last Year"}
          </Button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Average Uptime</p>
              <p className="text-2xl font-bold text-foreground mt-2">
                {calculateAverageUptime()}%
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Errors (24h)</p>
              <p className="text-2xl font-bold text-foreground mt-2">
                {calculateTotalErrors()}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Resolution Rate</p>
              <p className="text-2xl font-bold text-foreground mt-2">
                {calculateResolutionRate()}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">System Status</p>
              <p className="text-2xl font-bold text-foreground mt-2">
                {statusQuery.data?.status || "Loading"}
              </p>
            </div>
            <Activity className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Uptime Chart */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Uptime Trend
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={uptimeData}>
            <defs>
              <linearGradient id="colorUptime" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[98, 100]} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="uptime"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorUptime)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Error Trend Chart */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Error Trend (24h)
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={errorTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="errors"
              stroke="#ef4444"
              name="Errors"
            />
            <Line
              type="monotone"
              dataKey="resolved"
              stroke="#10b981"
              name="Resolved"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Component Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Component Health Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={componentHealth}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {componentHealth.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Component Status Details
          </h2>
          <div className="space-y-3">
            {componentHealth.map((component) => (
              <div
                key={component.name}
                className="flex items-center justify-between p-3 bg-accent/5 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: component.color }}
                  />
                  <span className="font-medium text-foreground">
                    {component.name}
                  </span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {component.value}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Issues and Recommendations */}
      {statusQuery.data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {statusQuery.data.issues && statusQuery.data.issues.length > 0 && (
            <Card className="p-6 border-l-4 border-l-red-600">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Active Issues
              </h2>
              <div className="space-y-2">
                {statusQuery.data.issues.map((issue, idx) => (
                  <div key={idx} className="text-sm text-muted-foreground">
                    • {issue}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {statusQuery.data.recommendations &&
            statusQuery.data.recommendations.length > 0 && (
              <Card className="p-6 border-l-4 border-l-blue-600">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Recommendations
                </h2>
                <div className="space-y-2">
                  {statusQuery.data.recommendations.map((rec, idx) => (
                    <div key={idx} className="text-sm text-muted-foreground">
                      • {rec}
                    </div>
                  ))}
                </div>
              </Card>
            )}
        </div>
      )}
    </div>
  );
}
