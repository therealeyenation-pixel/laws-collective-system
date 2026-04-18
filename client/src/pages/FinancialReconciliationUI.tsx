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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import DashboardLayout from "@/components/DashboardLayout";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Plus,
  Search,
  Settings,
  TrendingUp,
  Zap,
  Download,
  Edit,
  Trash2,
} from "lucide-react";

export default function FinancialReconciliationUI() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);

  // Dashboard Summary
  const summary = {
    totalTransactions: 5250,
    matchedTransactions: 5180,
    unmatchedTransactions: 70,
    matchingRate: 0.987,
    totalAmount: 425000,
    matchedAmount: 420150,
    discrepancies: 4850,
    pendingActions: 12,
  };

  // Unmatched Transactions
  const unmatchedTransactions = [
    {
      id: "txn_1",
      type: "payment",
      amount: 1500,
      date: "3 days ago",
      reference: "CHK-12345",
      suggestions: ["INV-5001", "INV-5002"],
    },
    {
      id: "txn_2",
      type: "invoice",
      amount: 2000,
      date: "5 days ago",
      reference: "INV-5003",
      suggestions: ["PAY-8001"],
    },
    {
      id: "txn_3",
      type: "payment",
      amount: 750,
      date: "7 days ago",
      reference: "ACH-98765",
      suggestions: ["INV-5004"],
    },
  ];

  // Reconciliation Exceptions
  const exceptions = [
    {
      id: "exc_1",
      type: "amount_mismatch",
      severity: "high",
      invoice: "INV-5001",
      expected: 1000,
      actual: 950,
      difference: 50,
      status: "open",
    },
    {
      id: "exc_2",
      type: "missing_payment",
      severity: "critical",
      invoice: "INV-5002",
      expected: 2000,
      status: "open",
    },
    {
      id: "exc_3",
      type: "duplicate_payment",
      severity: "high",
      invoice: "INV-5003",
      amount: 500,
      status: "resolved",
    },
  ];

  // Metrics Trends
  const metricsData = [
    { month: "Jan", matchingRate: 0.95, automationRate: 0.85, exceptionRate: 0.05 },
    { month: "Feb", matchingRate: 0.96, automationRate: 0.87, exceptionRate: 0.04 },
    { month: "Mar", matchingRate: 0.975, automationRate: 0.90, exceptionRate: 0.025 },
    { month: "Apr", matchingRate: 0.987, automationRate: 0.92, exceptionRate: 0.013 },
  ];

  // Revenue Recognition
  const revenueData = [
    { category: "Subscriptions", amount: 85000, percentage: 68 },
    { category: "One-Time", amount: 30000, percentage: 24 },
    { category: "Services", amount: 10000, percentage: 8 },
  ];

  return (
    <DashboardLayout>
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Financial Reconciliation</h1>
              <p className="text-muted-foreground mt-1">
                Payment matching, discrepancy resolution, and revenue recognition
              </p>
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Match
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Matching Rate</p>
                <p className="text-2xl font-bold text-foreground">
                  {(summary.matchingRate * 100).toFixed(1)}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unmatched</p>
                <p className="text-2xl font-bold text-foreground">
                  {summary.unmatchedTransactions}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold text-foreground">
                  ${(summary.totalAmount / 1000).toFixed(0)}K
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-accent" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Actions</p>
                <p className="text-2xl font-bold text-foreground">{summary.pendingActions}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="unmatched">Unmatched</TabsTrigger>
            <TabsTrigger value="exceptions">Exceptions</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Summary Card */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Reconciliation Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted rounded">
                    <span className="text-sm text-foreground">Total Transactions</span>
                    <span className="font-semibold text-foreground">
                      {summary.totalTransactions.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded">
                    <span className="text-sm text-foreground">Matched</span>
                    <span className="font-semibold text-green-600">
                      {summary.matchedTransactions.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded">
                    <span className="text-sm text-foreground">Unmatched</span>
                    <span className="font-semibold text-yellow-600">
                      {summary.unmatchedTransactions}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded">
                    <span className="text-sm text-foreground">Discrepancies</span>
                    <span className="font-semibold text-red-600">
                      ${summary.discrepancies.toLocaleString()}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                <div className="space-y-3">
                  {[
                    {
                      action: "Payment Matched",
                      detail: "INV-5001 → PAY-8001",
                      time: "1 hour ago",
                      status: "success",
                    },
                    {
                      action: "Discrepancy Resolved",
                      detail: "Write-off: $50",
                      time: "3 hours ago",
                      status: "success",
                    },
                    {
                      action: "Exception Created",
                      detail: "Amount mismatch detected",
                      time: "5 hours ago",
                      status: "warning",
                    },
                  ].map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-muted rounded">
                      {activity.status === "success" ? (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.detail}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Unmatched Transactions Tab */}
          <TabsContent value="unmatched" className="mt-6 space-y-4">
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search transactions..." className="pl-10" />
              </div>
              <Button variant="outline">Filter</Button>
            </div>

            <div className="space-y-3">
              {unmatchedTransactions.map((txn) => (
                <Card
                  key={txn.id}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedTransaction === txn.id ? "bg-accent/10 border-accent" : ""
                  }`}
                  onClick={() => setSelectedTransaction(txn.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground capitalize">{txn.type}</h3>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                          Unmatched
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">Ref: {txn.reference}</p>
                    </div>
                    <span className="text-lg font-semibold text-foreground">
                      ${txn.amount.toLocaleString()}
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-2">Suggested Matches:</p>
                    <div className="flex gap-2 flex-wrap">
                      {txn.suggestions.map((suggestion) => (
                        <Button key={suggestion} size="sm" variant="outline">
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">{txn.date}</p>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Exceptions Tab */}
          <TabsContent value="exceptions" className="mt-6 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Reconciliation Exceptions</h2>

            <div className="space-y-3">
              {exceptions.map((exc) => (
                <Card key={exc.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground capitalize">
                          {exc.type.replace("_", " ")}
                        </h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            exc.severity === "critical"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {exc.severity}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            exc.status === "resolved"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {exc.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">Invoice: {exc.invoice}</p>
                      {exc.difference && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Expected: ${exc.expected} | Actual: ${exc.actual} | Difference: $
                          {exc.difference}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
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

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="mt-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Reconciliation Metrics Trends</h2>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={metricsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${(value * 100).toFixed(1)}%`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="matchingRate"
                    stroke="#10b981"
                    name="Matching Rate"
                  />
                  <Line
                    type="monotone"
                    dataKey="automationRate"
                    stroke="#3b82f6"
                    name="Automation Rate"
                  />
                  <Line
                    type="monotone"
                    dataKey="exceptionRate"
                    stroke="#ef4444"
                    name="Exception Rate"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          {/* Revenue Recognition Tab */}
          <TabsContent value="revenue" className="mt-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Revenue Recognition</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {revenueData.map((item) => (
                    <div key={item.category} className="p-4 bg-muted rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-foreground">{item.category}</h3>
                        <span className="text-sm font-medium text-foreground">
                          {item.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-background rounded-full h-2">
                        <div
                          className="bg-accent h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        ${item.amount.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Total Recognized</p>
                    <p className="text-4xl font-bold text-foreground">
                      $
                      {revenueData
                        .reduce((sum, item) => sum + item.amount, 0)
                        .toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-4">
                      Period: Q1 2024 (Accrual Method)
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </DashboardLayout>
  );
}
