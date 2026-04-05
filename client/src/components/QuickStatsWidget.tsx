import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { ArrowUp, ArrowDown, TrendingUp, Users, Mail, DollarSign } from "lucide-react";

/**
 * Phase 54: Quick Stats Widget Component
 * 
 * Displays key metrics at a glance:
 * - Active campaigns
 * - Total members
 * - Revenue this month
 * - Email open rate
 * - SMS delivery rate
 * - Conversion rate
 */

interface StatMetric {
  label: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  color: string;
}

interface QuickStatsWidgetProps {
  compact?: boolean;
  showTrends?: boolean;
  refreshInterval?: number;
}

export default function QuickStatsWidget({
  compact = false,
  showTrends = true,
  refreshInterval = 60000,
}: QuickStatsWidgetProps) {
  const [stats, setStats] = React.useState<StatMetric[]>([
    {
      label: "Active Campaigns",
      value: 12,
      change: 2,
      icon: <Mail className="w-5 h-5" />,
      trend: "up",
      color: "bg-blue-50 dark:bg-blue-950",
    },
    {
      label: "Total Members",
      value: "2,450",
      change: 125,
      icon: <Users className="w-5 h-5" />,
      trend: "up",
      color: "bg-green-50 dark:bg-green-950",
    },
    {
      label: "Revenue (MTD)",
      value: "$45,230",
      change: 15.2,
      icon: <DollarSign className="w-5 h-5" />,
      trend: "up",
      color: "bg-emerald-50 dark:bg-emerald-950",
    },
    {
      label: "Email Open Rate",
      value: "32.5%",
      change: -2.1,
      icon: <TrendingUp className="w-5 h-5" />,
      trend: "down",
      color: "bg-purple-50 dark:bg-purple-950",
    },
  ]);

  // Simulate real-time updates
  React.useEffect(() => {
    const interval = setInterval(() => {
      setStats((prevStats) =>
        prevStats.map((stat) => ({
          ...stat,
          change: (Math.random() - 0.5) * 10,
          trend: Math.random() > 0.5 ? "up" : "down",
        }))
      );
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case "up":
        return "text-green-600 dark:text-green-400";
      case "down":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case "up":
        return <ArrowUp className="w-4 h-4" />;
      case "down":
        return <ArrowDown className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (compact) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, idx) => (
          <Card
            key={idx}
            className={`p-3 ${stat.color} border-0`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground truncate">
                  {stat.label}
                </p>
                <p className="text-lg font-bold text-foreground mt-1">
                  {stat.value}
                </p>
              </div>
              <div className="text-muted-foreground ml-2">
                {stat.icon}
              </div>
            </div>
            {showTrends && stat.change !== undefined && (
              <div className={`flex items-center gap-1 mt-2 text-xs ${getTrendColor(stat.trend)}`}>
                {getTrendIcon(stat.trend)}
                <span>{Math.abs(stat.change).toFixed(1)}%</span>
              </div>
            )}
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Quick Stats</h3>
        <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card
            key={idx}
            className={`p-4 ${stat.color} border-0 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {stat.value}
                </p>
                {showTrends && stat.change !== undefined && (
                  <div className={`flex items-center gap-1 mt-3 text-sm font-medium ${getTrendColor(stat.trend)}`}>
                    {getTrendIcon(stat.trend)}
                    <span>
                      {stat.change > 0 ? "+" : ""}
                      {stat.change.toFixed(1)}% from last period
                    </span>
                  </div>
                )}
              </div>
              <div className="text-muted-foreground opacity-60">
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Mini Chart Section */}
      <Card className="p-4 bg-background border border-border">
        <h4 className="text-sm font-semibold text-foreground mb-4">
          7-Day Trend
        </h4>
        <div className="flex items-end justify-between gap-2 h-16">
          {[65, 72, 68, 75, 82, 78, 85].map((value, idx) => (
            <div
              key={idx}
              className="flex-1 bg-gradient-to-t from-blue-400 to-blue-600 rounded-t opacity-70 hover:opacity-100 transition-opacity"
              style={{ height: `${(value / 100) * 100}%` }}
              title={`${value}%`}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Campaign Performance
        </p>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 bg-background border border-border text-center">
          <p className="text-xs text-muted-foreground">Avg. Open Rate</p>
          <p className="text-xl font-bold text-foreground mt-1">32.5%</p>
        </Card>
        <Card className="p-3 bg-background border border-border text-center">
          <p className="text-xs text-muted-foreground">Avg. Click Rate</p>
          <p className="text-xl font-bold text-foreground mt-1">8.2%</p>
        </Card>
        <Card className="p-3 bg-background border border-border text-center">
          <p className="text-xs text-muted-foreground">Conversion Rate</p>
          <p className="text-xl font-bold text-foreground mt-1">2.4%</p>
        </Card>
      </div>
    </div>
  );
}
