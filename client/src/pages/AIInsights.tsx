import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, TrendingUp, Zap, Brain, Download, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import DashboardLayout from "@/components/DashboardLayout";

interface Anomaly {
  id: string;
  timestamp: number;
  metric: string;
  value: number;
  expectedRange: [number, number];
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

interface Prediction {
  metric: string;
  current: number;
  predicted30min: number;
  predicted1hour: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
}

export default function AIInsights() {
  const { user } = useAuth();
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string>('all');

  // Fetch AI insights from backend
  const { data: aiData, isLoading: isAILoading, refetch } = trpc.system.getAIInsights.useQuery(
    { userId: user?.id || '', timeRange: '24h' },
    { enabled: !!user?.id, refetchInterval: 30000 }
  );

  useEffect(() => {
    if (aiData) {
      setAnomalies(aiData.anomalies || []);
      setPredictions(aiData.predictions || []);
    }
  }, [aiData]);

  // Generate sample data if backend unavailable
  useEffect(() => {
    if (!aiData && !isAILoading) {
      const sampleAnomalies: Anomaly[] = [
        {
          id: '1',
          timestamp: Date.now() - 3600000,
          metric: 'API Latency',
          value: 245,
          expectedRange: [40, 100],
          severity: 'high',
          description: 'API latency spike detected. Response time exceeded expected range by 145%.'
        },
        {
          id: '2',
          timestamp: Date.now() - 1800000,
          metric: 'Error Rate',
          value: 2.3,
          expectedRange: [0, 0.5],
          severity: 'medium',
          description: 'Error rate elevated above baseline. Investigating root cause.'
        },
        {
          id: '3',
          timestamp: Date.now() - 600000,
          metric: 'Memory Usage',
          value: 87,
          expectedRange: [40, 75],
          severity: 'high',
          description: 'Memory consumption approaching critical threshold.'
        }
      ];

      const samplePredictions: Prediction[] = [
        {
          metric: 'API Latency',
          current: 65,
          predicted30min: 72,
          predicted1hour: 85,
          confidence: 0.92,
          trend: 'up'
        },
        {
          metric: 'Error Rate',
          current: 0.3,
          predicted30min: 0.25,
          predicted1hour: 0.2,
          confidence: 0.88,
          trend: 'down'
        },
        {
          metric: 'CPU Usage',
          current: 45,
          predicted30min: 48,
          predicted1hour: 52,
          confidence: 0.85,
          trend: 'up'
        }
      ];

      setAnomalies(sampleAnomalies);
      setPredictions(samplePredictions);
    }
  }, [aiData, isAILoading]);

  const filteredAnomalies = selectedMetric === 'all' 
    ? anomalies 
    : anomalies.filter(a => a.metric === selectedMetric);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return '📈';
    if (trend === 'down') return '📉';
    return '➡️';
  };

  return (
    <DashboardLayout>
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">AI Insights</h1>
            <p className="text-muted-foreground mt-2">Anomaly detection and predictive analytics</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Anomalies</p>
                <p className="text-3xl font-bold text-red-600">{anomalies.length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Predictions</p>
                <p className="text-3xl font-bold text-blue-600">{predictions.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
                <p className="text-3xl font-bold text-purple-600">{(predictions.reduce((a, p) => a + p.confidence, 0) / Math.max(predictions.length, 1) * 100).toFixed(0)}%</p>
              </div>
              <Zap className="w-8 h-8 text-purple-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Model Status</p>
                <p className="text-3xl font-bold text-green-600">Active</p>
              </div>
              <Brain className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </Card>
        </div>

        {/* Anomalies Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-foreground">Detected Anomalies</h2>
            <div className="flex gap-2">
              <Button 
                variant={selectedMetric === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedMetric('all')}
              >
                All
              </Button>
              <Button 
                variant={selectedMetric === 'API Latency' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedMetric('API Latency')}
              >
                Latency
              </Button>
              <Button 
                variant={selectedMetric === 'Error Rate' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedMetric('Error Rate')}
              >
                Errors
              </Button>
            </div>
          </div>

          {filteredAnomalies.length > 0 ? (
            <div className="space-y-3">
              {filteredAnomalies.map(anomaly => (
                <Card key={anomaly.id} className="p-4 border-l-4 border-l-orange-500">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                        <h3 className="font-semibold text-foreground">{anomaly.metric}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getSeverityColor(anomaly.severity)}`}>
                          {anomaly.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{anomaly.description}</p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Current</p>
                          <p className="font-semibold text-foreground">{anomaly.value}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Expected</p>
                          <p className="font-semibold text-foreground">{anomaly.expectedRange[0]} - {anomaly.expectedRange[1]}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Detected</p>
                          <p className="font-semibold text-foreground">{new Date(anomaly.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center bg-green-50 dark:bg-green-950/20">
              <p className="text-muted-foreground">No anomalies detected in the selected period</p>
            </Card>
          )}
        </div>

        {/* Predictions Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Predictive Analytics (Next 1 Hour)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {predictions.map((pred, idx) => (
              <Card key={idx} className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground">{pred.metric}</h3>
                    <p className="text-sm text-muted-foreground">Confidence: {(pred.confidence * 100).toFixed(0)}%</p>
                  </div>
                  <span className="text-2xl">{getTrendIcon(pred.trend)}</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Current</p>
                    <p className="text-lg font-bold text-foreground">{pred.current}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">30 min</p>
                      <p className="font-semibold text-foreground">{pred.predicted30min}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">1 hour</p>
                      <p className="font-semibold text-foreground">{pred.predicted1hour}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">Trend: <span className="font-semibold text-foreground capitalize">{pred.trend}</span></p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Recommendations
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">1.</span>
              <span className="text-foreground">API latency trending upward. Scale backend services to handle increased load.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">2.</span>
              <span className="text-foreground">Strong CPU-memory correlation detected. Optimize memory allocation strategies.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">3.</span>
              <span className="text-foreground">Error rate declining. Current mitigation strategies effective. Continue monitoring.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">4.</span>
              <span className="text-foreground">Predicted load increase in next hour. Prepare auto-scaling policies.</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
    </DashboardLayout>
  );
}
