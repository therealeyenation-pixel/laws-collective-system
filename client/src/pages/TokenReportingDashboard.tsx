import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Coins,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Building2,
  Award,
  Crown,
  Sparkles,
  Heart,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  PieChart,
  BarChart3,
  Activity,
  Wallet,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { LiveTicker } from "@/components/LiveTicker";
import { WeatherWidget } from "@/components/WeatherWidget";

// Token type definitions
const TOKEN_TYPES = [
  { id: "LUV", name: "LUV Token", icon: Heart, color: "text-pink-500", bgColor: "bg-pink-500/10", description: "Utility token for platform services" },
  { id: "CROWN", name: "CROWN Token", icon: Crown, color: "text-yellow-500", bgColor: "bg-yellow-500/10", description: "Governance token for voting rights" },
  { id: "SPARK", name: "SPARK Token", icon: Sparkles, color: "text-blue-500", bgColor: "bg-blue-500/10", description: "Achievement token for milestones" },
  { id: "LEGACY", name: "LEGACY Token", icon: Award, color: "text-purple-500", bgColor: "bg-purple-500/10", description: "Generational wealth token" },
];

// Mock data for demonstration
const mockTokenMetrics = {
  totalSupply: {
    LUV: 2000000,
    CROWN: 1000,
    SPARK: 15000,
    LEGACY: 500,
  },
  circulatingSupply: {
    LUV: 1250000,
    CROWN: 750,
    SPARK: 12500,
    LEGACY: 350,
  },
  treasuryBalance: {
    LUV: 750000,
    CROWN: 250,
    SPARK: 2500,
    LEGACY: 150,
  },
  velocity: {
    LUV: 2.5,
    CROWN: 0.3,
    SPARK: 1.8,
    LEGACY: 0.1,
  },
};

const mockDistributionHistory = [
  { date: "2026-01-24", type: "LUV", amount: 5000, recipients: 25, reason: "Weekly distribution" },
  { date: "2026-01-23", type: "SPARK", amount: 150, recipients: 15, reason: "Simulator completions" },
  { date: "2026-01-22", type: "LUV", amount: 3500, recipients: 18, reason: "Course completions" },
  { date: "2026-01-21", type: "CROWN", amount: 10, recipients: 2, reason: "Board member allocation" },
  { date: "2026-01-20", type: "LEGACY", amount: 5, recipients: 1, reason: "Generational milestone" },
];

const mockTopHolders = [
  { name: "98 Trust", type: "Trust", luvBalance: 500000, crownBalance: 500, sparkBalance: 1000, legacyBalance: 200 },
  { name: "L.A.W.S. Collective", type: "Entity", luvBalance: 250000, crownBalance: 100, sparkBalance: 3000, legacyBalance: 50 },
  { name: "508 Academy", type: "Entity", luvBalance: 150000, crownBalance: 50, sparkBalance: 5000, legacyBalance: 25 },
  { name: "Real-Eye-Nation", type: "Entity", luvBalance: 100000, crownBalance: 50, sparkBalance: 2000, legacyBalance: 25 },
  { name: "LuvOnPurpose AWS", type: "Entity", luvBalance: 100000, crownBalance: 50, sparkBalance: 1500, legacyBalance: 25 },
];

const mockEntityDistribution = [
  { entity: "98 Trust", percentage: 40, tokens: 800000 },
  { entity: "L.A.W.S. Collective", percentage: 25, tokens: 500000 },
  { entity: "508 Academy", percentage: 15, tokens: 300000 },
  { entity: "Real-Eye-Nation", percentage: 10, tokens: 200000 },
  { entity: "LuvOnPurpose AWS", percentage: 10, tokens: 200000 },
];

export default function TokenReportingDashboard() {
  const [selectedToken, setSelectedToken] = useState("LUV");
  const [timeRange, setTimeRange] = useState("30d");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Token data refreshed");
    }, 1500);
  };

  const handleExport = (format: string) => {
    toast.success(`Exporting token report as ${format.toUpperCase()}`);
  };

  const selectedTokenInfo = TOKEN_TYPES.find(t => t.id === selectedToken) || TOKEN_TYPES[0];
  const TokenIcon = selectedTokenInfo.icon;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Token Reporting Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Monitor token economy metrics, distributions, and holder analytics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[130px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
            <Select onValueChange={handleExport}>
              <SelectTrigger className="w-[120px]">
                <Download className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Export" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Report</SelectItem>
                <SelectItem value="csv">CSV Data</SelectItem>
                <SelectItem value="json">JSON Export</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Token Type Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TOKEN_TYPES.map((token) => {
            const Icon = token.icon;
            const isSelected = selectedToken === token.id;
            return (
              <Card
                key={token.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedToken(token.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${token.bgColor}`}>
                      <Icon className={`w-5 h-5 ${token.color}`} />
                    </div>
                    <div>
                      <p className="font-semibold">{token.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {mockTokenMetrics.circulatingSupply[token.id as keyof typeof mockTokenMetrics.circulatingSupply].toLocaleString()} circulating
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Supply</p>
                  <p className="text-2xl font-bold">
                    {mockTokenMetrics.totalSupply[selectedToken as keyof typeof mockTokenMetrics.totalSupply].toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${selectedTokenInfo.bgColor}`}>
                  <TokenIcon className={`w-6 h-6 ${selectedTokenInfo.color}`} />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm text-muted-foreground">
                <span>Fixed supply</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Circulating Supply</p>
                  <p className="text-2xl font-bold">
                    {mockTokenMetrics.circulatingSupply[selectedToken as keyof typeof mockTokenMetrics.circulatingSupply].toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-500/10">
                  <Activity className="w-6 h-6 text-green-500" />
                </div>
              </div>
              <div className="mt-2">
                <Progress 
                  value={(mockTokenMetrics.circulatingSupply[selectedToken as keyof typeof mockTokenMetrics.circulatingSupply] / 
                    mockTokenMetrics.totalSupply[selectedToken as keyof typeof mockTokenMetrics.totalSupply]) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {((mockTokenMetrics.circulatingSupply[selectedToken as keyof typeof mockTokenMetrics.circulatingSupply] / 
                    mockTokenMetrics.totalSupply[selectedToken as keyof typeof mockTokenMetrics.totalSupply]) * 100).toFixed(1)}% of total supply
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Treasury Balance</p>
                  <p className="text-2xl font-bold">
                    {mockTokenMetrics.treasuryBalance[selectedToken as keyof typeof mockTokenMetrics.treasuryBalance].toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-500/10">
                  <Wallet className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500">+2.5%</span>
                <span className="text-muted-foreground ml-1">from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Token Velocity</p>
                  <p className="text-2xl font-bold">
                    {mockTokenMetrics.velocity[selectedToken as keyof typeof mockTokenMetrics.velocity].toFixed(2)}x
                  </p>
                </div>
                <div className="p-3 rounded-full bg-purple-500/10">
                  <TrendingUp className="w-6 h-6 text-purple-500" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm text-muted-foreground">
                <span>Transactions per token per period</span>
              </div>
            </CardContent>
          </Card>
        {/* Live Ticker and Weather */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <LiveTicker department="tokens" />
          </div>
          <div className="lg:col-span-1">
            <WeatherWidget compact />
          </div>
        </div>

        </div>

        {/* Tabs for detailed views */}
        <Tabs defaultValue="distribution" className="space-y-4">
          <TabsList>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="holders">Top Holders</TabsTrigger>
            <TabsTrigger value="history">Transaction History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Distribution Tab */}
          <TabsContent value="distribution" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Entity Distribution
                  </CardTitle>
                  <CardDescription>Token allocation across business entities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockEntityDistribution.map((entity, index) => (
                      <div key={entity.entity} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{entity.entity}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold">{entity.percentage}%</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              ({entity.tokens.toLocaleString()} tokens)
                            </span>
                          </div>
                        </div>
                        <Progress value={entity.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Distribution Schedule
                  </CardTitle>
                  <CardDescription>Upcoming and recent token distributions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockDistributionHistory.map((dist, index) => {
                      const tokenInfo = TOKEN_TYPES.find(t => t.id === dist.type);
                      const Icon = tokenInfo?.icon || Coins;
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${tokenInfo?.bgColor || "bg-gray-500/10"}`}>
                              <Icon className={`w-4 h-4 ${tokenInfo?.color || "text-gray-500"}`} />
                            </div>
                            <div>
                              <p className="font-medium">{dist.reason}</p>
                              <p className="text-sm text-muted-foreground">{dist.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{dist.amount.toLocaleString()} {dist.type}</p>
                            <p className="text-sm text-muted-foreground">{dist.recipients} recipients</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Top Holders Tab */}
          <TabsContent value="holders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Top Token Holders
                </CardTitle>
                <CardDescription>Entities and individuals with the largest token holdings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Holder</th>
                        <th className="text-left py-3 px-4">Type</th>
                        <th className="text-right py-3 px-4">LUV</th>
                        <th className="text-right py-3 px-4">CROWN</th>
                        <th className="text-right py-3 px-4">SPARK</th>
                        <th className="text-right py-3 px-4">LEGACY</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockTopHolders.map((holder, index) => (
                        <tr key={holder.name} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-bold">{index + 1}</span>
                              </div>
                              <span className="font-medium">{holder.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{holder.type}</Badge>
                          </td>
                          <td className="py-3 px-4 text-right font-mono">
                            {holder.luvBalance.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-mono">
                            {holder.crownBalance.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-mono">
                            {holder.sparkBalance.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-mono">
                            {holder.legacyBalance.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transaction History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Transaction History
                    </CardTitle>
                    <CardDescription>Recent token transactions and transfers</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: "distribution", from: "Treasury", to: "L.A.W.S. Collective", amount: 5000, token: "LUV", time: "2 hours ago" },
                    { type: "reward", from: "System", to: "User: Craig R.", amount: 50, token: "SPARK", time: "4 hours ago" },
                    { type: "transfer", from: "508 Academy", to: "Real-Eye-Nation", amount: 1000, token: "LUV", time: "6 hours ago" },
                    { type: "mint", from: "System", to: "User: Essence H.", amount: 1, token: "LEGACY", time: "1 day ago" },
                    { type: "distribution", from: "Treasury", to: "All Members", amount: 10000, token: "LUV", time: "2 days ago" },
                  ].map((tx, index) => {
                    const tokenInfo = TOKEN_TYPES.find(t => t.id === tx.token);
                    const Icon = tokenInfo?.icon || Coins;
                    return (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${
                            tx.type === "distribution" ? "bg-green-500/10" :
                            tx.type === "reward" ? "bg-blue-500/10" :
                            tx.type === "mint" ? "bg-purple-500/10" :
                            "bg-gray-500/10"
                          }`}>
                            {tx.type === "distribution" ? <ArrowDownRight className="w-5 h-5 text-green-500" /> :
                             tx.type === "reward" ? <Award className="w-5 h-5 text-blue-500" /> :
                             tx.type === "mint" ? <Sparkles className="w-5 h-5 text-purple-500" /> :
                             <ArrowUpRight className="w-5 h-5 text-gray-500" />}
                          </div>
                          <div>
                            <p className="font-medium capitalize">{tx.type}</p>
                            <p className="text-sm text-muted-foreground">
                              {tx.from} → {tx.to}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Icon className={`w-4 h-4 ${tokenInfo?.color}`} />
                            <span className="font-semibold">{tx.amount.toLocaleString()} {tx.token}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{tx.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Token Economy Health</CardTitle>
                  <CardDescription>Key metrics indicating system health</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Circulation Rate</span>
                      <div className="flex items-center gap-2">
                        <Progress value={62.5} className="w-24 h-2" />
                        <span className="font-semibold">62.5%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Active Holders</span>
                      <span className="font-semibold">156</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Avg. Holding Period</span>
                      <span className="font-semibold">45 days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Distribution Events (30d)</span>
                      <span className="font-semibold">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Treasury Runway</span>
                      <span className="font-semibold text-green-500">18 months</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Token Utility Breakdown</CardTitle>
                  <CardDescription>How tokens are being used</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { use: "Simulator Access", percentage: 35 },
                      { use: "Course Enrollment", percentage: 25 },
                      { use: "Service Payments", percentage: 20 },
                      { use: "Governance Voting", percentage: 10 },
                      { use: "Staking/Holding", percentage: 10 },
                    ].map((item) => (
                      <div key={item.use} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{item.use}</span>
                          <span className="text-sm font-semibold">{item.percentage}%</span>
                        </div>
                        <Progress value={item.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>AI-generated insights for token economy optimization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-700 dark:text-green-300">Healthy Velocity</p>
                        <p className="text-sm text-muted-foreground">
                          Token velocity is within optimal range. Current circulation supports active economy without inflation concerns.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-700 dark:text-yellow-300">Increase SPARK Distribution</p>
                        <p className="text-sm text-muted-foreground">
                          Consider increasing SPARK token rewards for simulator completions to drive engagement.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-700 dark:text-blue-300">Expand Holder Base</p>
                        <p className="text-sm text-muted-foreground">
                          Top 5 holders control 65% of tokens. Consider distribution programs to broaden ownership.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
