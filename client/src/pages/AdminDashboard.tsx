import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Activity,
  Settings,
  Download,
  Filter,
  Search,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

/**
 * Phase 41: Admin Dashboard React UI
 * Comprehensive admin interface with system monitoring, member management,
 * compliance tracking, and analytics visualizations
 */

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [memberSearch, setMemberSearch] = useState("");
  const [memberFilter, setMemberFilter] = useState("all");

  // Fetch admin data
  const systemMetrics = trpc.adminDashboard.getSystemMetrics.useQuery();
  const memberAnalytics = trpc.adminDashboard.getMemberAnalytics.useQuery();
  const complianceStatus = trpc.adminDashboard.getComplianceStatus.useQuery();
  const investmentAnalytics = trpc.adminDashboard.getInvestmentAnalytics.useQuery();
  const conferenceAnalytics = trpc.adminDashboard.getConferenceAnalytics.useQuery();
  const broadcastAnalytics = trpc.adminDashboard.getBroadcastAnalytics.useQuery();
  const revenueAnalytics = trpc.adminDashboard.getRevenueAnalytics.useQuery();
  const members = trpc.adminDashboard.getMembers.useQuery({ page: 1, limit: 20 });

  if (!user?.role || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <p className="text-lg font-semibold">Access Denied</p>
          <p className="text-muted-foreground">You do not have admin privileges.</p>
        </div>
      </div>
    );
  }

  const metrics = systemMetrics.data;
  const analytics = memberAnalytics.data;
  const compliance = complianceStatus.data;
  const investments = investmentAnalytics.data;
  const conferences = conferenceAnalytics.data;
  const broadcasts = broadcastAnalytics.data;
  const revenue = revenueAnalytics.data;

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">System monitoring and management</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-7xl mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="text-3xl font-bold text-foreground mt-2">{metrics?.totalMembers.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-2">↑ {metrics?.newMembersThisMonth} this month</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Members</p>
                <p className="text-3xl font-bold text-foreground mt-2">{metrics?.activeMembers.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {((metrics?.activeMembers ?? 0) / (metrics?.totalMembers ?? 1) * 100).toFixed(1)}% engagement
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Invested</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  ${(metrics?.totalInvested ?? 0 / 1000000).toFixed(1)}M
                </p>
                <p className="text-xs text-green-600 mt-2">↑ {investments?.gainPercent}% gains</p>
              </div>
              <DollarSign className="w-8 h-8 text-amber-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">System Uptime</p>
                <p className="text-3xl font-bold text-foreground mt-2">{metrics?.systemUptime}%</p>
                <p className="text-xs text-green-600 mt-2">✓ Healthy</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Member Distribution */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Member Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Active", value: analytics?.byStatus.active ?? 0 },
                        { name: "Inactive", value: analytics?.byStatus.inactive ?? 0 },
                        { name: "Suspended", value: analytics?.byStatus.suspended ?? 0 },
                        { name: "Pending", value: analytics?.byStatus.pending ?? 0 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              {/* Revenue Trend */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Revenue</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={[
                      { month: "Last Month", revenue: revenue?.lastMonth ?? 0 },
                      { month: "This Month", revenue: revenue?.thisMonth ?? 0 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Compliance Overview */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Compliance Status</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{compliance?.byComplianceStatus.verified}</p>
                  <p className="text-sm text-muted-foreground">Verified</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600">{compliance?.byComplianceStatus.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{compliance?.byComplianceStatus.failed}</p>
                  <p className="text-sm text-muted-foreground">Failed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{compliance?.byComplianceStatus.suspended}</p>
                  <p className="text-sm text-muted-foreground">Suspended</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            <Card className="p-6">
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
                <select
                  value={memberFilter}
                  onChange={(e) => setMemberFilter(e.target.value)}
                  className="px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="all">All Members</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Portfolio</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Compliance</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.data?.members?.map((member) => (
                      <tr key={member.id} className="border-b border-border hover:bg-secondary/50">
                        <td className="py-3 px-4">{member.name}</td>
                        <td className="py-3 px-4 text-muted-foreground">{member.email}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              member.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {member.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">${member.portfolioValue.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className="text-xs font-semibold text-green-600">{member.complianceStatus}</span>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Violations by Type</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { type: "AML", count: compliance?.violations.byType.aml ?? 0 },
                      { type: "KYC", count: compliance?.violations.byType.kyc ?? 0 },
                      { type: "Transaction", count: compliance?.violations.byType.transaction ?? 0 },
                      { type: "Documentation", count: compliance?.violations.byType.documentation ?? 0 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Audit Readiness</h3>
                <div className="space-y-4">
                  {[
                    { name: "Record Keeping", score: compliance?.auditReadiness.recordKeeping ?? 0 },
                    { name: "Documentation", score: compliance?.auditReadiness.documentation ?? 0 },
                    { name: "Audit Trail", score: compliance?.auditReadiness.auditTrail ?? 0 },
                    { name: "Communication", score: compliance?.auditReadiness.communication ?? 0 },
                    { name: "Risk Management", score: compliance?.auditReadiness.riskManagement ?? 0 },
                  ].map((item) => (
                    <div key={item.name}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-semibold text-foreground">{item.name}</span>
                        <span className="text-sm text-muted-foreground">{(item.score * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${item.score * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Asset Class Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Stocks", value: investments?.byAssetClass.stocks.value ?? 0 },
                        { name: "Bonds", value: investments?.byAssetClass.bonds.value ?? 0 },
                        { name: "Crypto", value: investments?.byAssetClass.crypto.value ?? 0 },
                        { name: "Commodities", value: investments?.byAssetClass.commodities.value ?? 0 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Conference & Broadcast Activity</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Conferences</p>
                    <p className="text-2xl font-bold text-blue-600">{conferences?.totalConferences}</p>
                    <p className="text-xs text-muted-foreground">{conferences?.activeConferences} active</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Broadcasts</p>
                    <p className="text-2xl font-bold text-purple-600">{broadcasts?.totalBroadcasts}</p>
                    <p className="text-xs text-muted-foreground">{broadcasts?.activeBroadcasts} active</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Generate Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button className="h-auto flex-col items-start p-4">
                  <span className="font-semibold">Compliance Report</span>
                  <span className="text-xs text-muted-foreground">System compliance status and violations</span>
                </Button>
                <Button className="h-auto flex-col items-start p-4">
                  <span className="font-semibold">Investment Report</span>
                  <span className="text-xs text-muted-foreground">Portfolio performance and analytics</span>
                </Button>
                <Button className="h-auto flex-col items-start p-4">
                  <span className="font-semibold">Member Report</span>
                  <span className="text-xs text-muted-foreground">Member statistics and engagement</span>
                </Button>
                <Button className="h-auto flex-col items-start p-4">
                  <span className="font-semibold">Revenue Report</span>
                  <span className="text-xs text-muted-foreground">Revenue trends and sources</span>
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
