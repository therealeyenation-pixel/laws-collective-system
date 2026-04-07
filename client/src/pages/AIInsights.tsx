import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrendingUp, AlertTriangle, Zap, BarChart3, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

export default function AIInsights() {
  const { user } = useAuth();
  const [insights, setInsights] = useState([
    { id: 1, type: "anomaly", title: "Unusual Spike in API Errors", description: "Error rate increased by 250% in the last 30 minutes", severity: "high", timestamp: "5 minutes ago" },
    { id: 2, type: "prediction", title: "Predicted Disk Space Issue", description: "Storage will reach 90% capacity in approximately 2 days", severity: "medium", timestamp: "1 hour ago" },
    { id: 3, type: "correlation", title: "Performance Correlation Found", description: "High CPU usage correlates with increased API latency", severity: "low", timestamp: "2 hours ago" },
  ]);

  const [metrics, setMetrics] = useState({
    anomalies: 12,
    predictions: 8,
    correlations: 15,
    accuracy: 94.2,
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">AI Insights</h1>
            <p className="text-muted-foreground mt-2">Machine learning-powered anomaly detection and predictive analytics</p>
          </div>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Anomalies Detected</p>
                <p className="text-3xl font-bold text-red-600">{metrics.anomalies}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Predictions Made</p>
                <p className="text-3xl font-bold text-blue-600">{metrics.predictions}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Correlations Found</p>
                <p className="text-3xl font-bold text-purple-600">{metrics.correlations}</p>
              </div>
              <Zap className="w-8 h-8 text-purple-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Model Accuracy</p>
                <p className="text-3xl font-bold text-green-600">{metrics.accuracy}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </Card>
        </div>

        {/* Recent Insights */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Recent AI Insights</h2>
          <div className="space-y-4">
            {insights.map((insight) => (
              <div key={insight.id} className={`p-4 rounded-lg border-l-4 ${
                insight.severity === "high" ? "border-l-red-600 bg-red-50/50 dark:bg-red-950/20" :
                insight.severity === "medium" ? "border-l-yellow-600 bg-yellow-50/50 dark:bg-yellow-950/20" :
                "border-l-blue-600 bg-blue-50/50 dark:bg-blue-950/20"
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{insight.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        insight.severity === "high" ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-200" :
                        insight.severity === "medium" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-200" :
                        "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-200"
                      }`}>
                        {insight.type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                    <p className="text-xs text-muted-foreground">{insight.timestamp}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ML Model Information */}
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-bold mb-4">ML Model Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Model Type</p>
              <p className="font-semibold">Isolation Forest + LSTM Neural Network</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Last Training</p>
              <p className="font-semibold">2024-04-06 14:32:00 UTC</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Training Data Points</p>
              <p className="font-semibold">2.4M metrics samples</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Update Frequency</p>
              <p className="font-semibold">Every 6 hours</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
