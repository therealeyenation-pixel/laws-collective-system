import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Plus,
  TrendingUp,
  Users,
  Target,
  Settings,
  Zap,
  AlertCircle,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

export default function AdvancedSegmentationUI() {
  const [activeTab, setActiveTab] = useState("rfm");

  // RFM Analysis Data
  const rfmData = [
    { segment: "Champions", members: 450, ltv: 5200, churn: 0.02, color: "#10b981" },
    { segment: "Loyal", members: 680, ltv: 4800, churn: 0.05, color: "#3b82f6" },
    { segment: "At Risk", members: 220, ltv: 4500, churn: 0.45, color: "#f59e0b" },
    { segment: "Need Attention", members: 380, ltv: 1200, churn: 0.65, color: "#ef4444" },
  ];

  // Behavioral Triggers
  const triggers = [
    {
      id: "trigger_1",
      name: "High Engagement",
      event: "campaign_opened",
      executions: 1250,
      status: "active",
    },
    {
      id: "trigger_2",
      name: "Inactive Member",
      event: "no_activity",
      executions: 340,
      status: "active",
    },
    {
      id: "trigger_3",
      name: "High Spender",
      event: "purchase_completed",
      executions: 85,
      status: "active",
    },
  ];

  // Predictive Scores
  const scores = [
    { model: "Churn Prediction", accuracy: 0.87, members: 2500, status: "active" },
    { model: "LTV Estimation", accuracy: 0.82, members: 2500, status: "active" },
    { model: "Engagement", accuracy: 0.85, members: 2500, status: "active" },
  ];

  // Segment Performance Trends
  const trendData = [
    { month: "Jan", champions: 420, loyal: 650, atRisk: 240, needAttention: 420 },
    { month: "Feb", champions: 435, loyal: 665, atRisk: 235, needAttention: 410 },
    { month: "Mar", champions: 450, loyal: 680, atRisk: 220, needAttention: 380 },
    { month: "Apr", champions: 465, loyal: 695, atRisk: 210, needAttention: 370 },
  ];

  // Segment Overlap
  const overlapData = [
    { segments: "Champions ∩ Loyal", overlap: 25, recommendation: "Consolidate" },
    { segments: "At Risk ∩ High Value", overlap: 15, recommendation: "Retention" },
    { segments: "New ∩ Engaged", overlap: 35, recommendation: "Upsell" },
  ];

  return (
    <DashboardLayout>
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Segmentation Rules Engine</h1>
              <p className="text-muted-foreground mt-1">
                RFM analysis, behavioral triggers, and predictive scoring
              </p>
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Segment
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold text-foreground">5,000</p>
              </div>
              <Users className="w-8 h-8 text-accent" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Segments</p>
                <p className="text-2xl font-bold text-foreground">12</p>
              </div>
              <Target className="w-8 h-8 text-accent" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Segmentation Coverage</p>
                <p className="text-2xl font-bold text-foreground">97%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-accent" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Model Accuracy</p>
                <p className="text-2xl font-bold text-foreground">85%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-accent" />
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="rfm">RFM Analysis</TabsTrigger>
            <TabsTrigger value="triggers">Triggers</TabsTrigger>
            <TabsTrigger value="scoring">Scoring</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="overlap">Overlap</TabsTrigger>
          </TabsList>

          {/* RFM Analysis Tab */}
          <TabsContent value="rfm" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* RFM Segments */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">RFM Segments</h2>
                <div className="space-y-3">
                  {rfmData.map((segment) => (
                    <div key={segment.segment} className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: segment.color }}
                          />
                          <h3 className="font-semibold text-foreground">{segment.segment}</h3>
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {segment.members.toLocaleString()} members
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Avg LTV</p>
                          <p className="font-semibold text-foreground">${segment.ltv.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Churn Risk</p>
                          <p className="font-semibold text-foreground">
                            {(segment.churn * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* RFM Distribution */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Member Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={rfmData}
                      dataKey="members"
                      nameKey="segment"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {rfmData.map((entry) => (
                        <Cell key={`cell-${entry.segment}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </TabsContent>

          {/* Behavioral Triggers Tab */}
          <TabsContent value="triggers" className="mt-6 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Behavioral Triggers</h2>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Trigger
              </Button>
            </div>

            <div className="space-y-3">
              {triggers.map((trigger) => (
                <Card key={trigger.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground">{trigger.name}</h3>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {trigger.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">Event: {trigger.event}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Executions: {trigger.executions.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Scoring Models Tab */}
          <TabsContent value="scoring" className="mt-6 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Predictive Scoring Models</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {scores.map((score) => (
                <Card key={score.model} className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">{score.model}</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Accuracy</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="bg-accent h-2 rounded-full"
                            style={{ width: `${score.accuracy * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {(score.accuracy * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Members Scored</p>
                      <p className="text-lg font-semibold text-foreground">
                        {score.members.toLocaleString()}
                      </p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full w-fit">
                      {score.status}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="mt-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Segment Growth Trends</h2>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="champions"
                    stroke="#10b981"
                    name="Champions"
                  />
                  <Line type="monotone" dataKey="loyal" stroke="#3b82f6" name="Loyal" />
                  <Line type="monotone" dataKey="atRisk" stroke="#f59e0b" name="At Risk" />
                  <Line
                    type="monotone"
                    dataKey="needAttention"
                    stroke="#ef4444"
                    name="Need Attention"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          {/* Overlap Analysis Tab */}
          <TabsContent value="overlap" className="mt-6 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Segment Overlap Analysis</h2>

            <div className="space-y-3">
              {overlapData.map((overlap, idx) => (
                <Card key={idx} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-2">{overlap.segments}</h3>
                      <p className="text-sm text-muted-foreground">
                        {overlap.overlap} members in overlap
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground mb-2">
                        {overlap.overlap}%
                      </p>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {overlap.recommendation}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </DashboardLayout>
  );
}
