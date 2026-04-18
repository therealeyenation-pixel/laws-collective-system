import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Zap, Activity, RefreshCw, AlertCircle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

export default function RealtimeDashboardSync() {
  const [isConnected, setIsConnected] = useState(true);
  const [syncStatus, setSyncStatus] = useState("synced");
  const [metrics, setMetrics] = useState([
    { time: "00:00", latency: 145, updates: 120 },
    { time: "04:00", latency: 152, updates: 135 },
    { time: "08:00", latency: 138, updates: 110 },
    { time: "12:00", latency: 165, updates: 150 },
    { time: "16:00", latency: 142, updates: 125 },
    { time: "20:00", latency: 155, updates: 140 },
  ]);

  const [widgets, setWidgets] = useState([
    { id: 1, name: "Campaign Performance", status: "synced", lastUpdate: "2 seconds ago" },
    { id: 2, name: "Member Activity", status: "syncing", lastUpdate: "syncing..." },
    { id: 3, name: "Revenue Metrics", status: "synced", lastUpdate: "5 seconds ago" },
    { id: 4, name: "Email Engagement", status: "synced", lastUpdate: "3 seconds ago" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) =>
        prev.map((m, i) => ({
          ...m,
          latency: Math.max(120, Math.min(200, m.latency + (Math.random() - 0.5) * 20)),
          updates: Math.max(100, Math.min(160, m.updates + (Math.random() - 0.5) * 10)),
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Real-time Dashboard Sync</h1>
          <p className="text-muted-foreground mt-2">Monitor live metric updates and WebSocket connections</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm">
            <Zap className="w-4 h-4 mr-2" />
            Start Sync
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Connection Status</p>
              <p className="text-2xl font-bold mt-2">{isConnected ? "Connected" : "Disconnected"}</p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isConnected ? "bg-green-100" : "bg-red-100"}`}>
              <Activity className={`w-6 h-6 ${isConnected ? "text-green-600" : "text-red-600"}`} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">Last check: 2 seconds ago</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Sync Status</p>
              <p className="text-2xl font-bold mt-2 capitalize">{syncStatus}</p>
            </div>
            <Badge variant={syncStatus === "synced" ? "default" : "secondary"}>{syncStatus}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-4">4 widgets synced</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Average Latency</p>
              <p className="text-2xl font-bold mt-2">148ms</p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">Within optimal range</p>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Sync Performance Trends</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={metrics}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="latency" stroke="#3b82f6" name="Latency (ms)" />
            <Line yAxisId="right" type="monotone" dataKey="updates" stroke="#10b981" name="Updates/min" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Widget Sync Status */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Widget Sync Status</h2>
        <div className="space-y-3">
          {widgets.map((widget) => (
            <div key={widget.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${widget.status === "synced" ? "bg-green-500" : "bg-yellow-500"}`} />
                <div>
                  <p className="font-medium">{widget.name}</p>
                  <p className="text-sm text-muted-foreground">{widget.lastUpdate}</p>
                </div>
              </div>
              <Badge variant={widget.status === "synced" ? "default" : "secondary"} className="capitalize">
                {widget.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Configuration */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Sync Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium">Sync Interval (ms)</label>
            <input type="number" defaultValue="1000" className="w-full mt-2 px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="text-sm font-medium">Max Batch Size</label>
            <input type="number" defaultValue="100" className="w-full mt-2 px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="text-sm font-medium">Reconnect Timeout (s)</label>
            <input type="number" defaultValue="30" className="w-full mt-2 px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="text-sm font-medium">Max Retries</label>
            <input type="number" defaultValue="5" className="w-full mt-2 px-3 py-2 border rounded-lg" />
          </div>
        </div>
        <Button className="mt-4">Save Configuration</Button>
      </Card>
    </div>
    </DashboardLayout>
  );
}
