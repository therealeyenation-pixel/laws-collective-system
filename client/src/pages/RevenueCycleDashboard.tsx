import { useState } from "react";
import { DepartmentNewsWidget } from "@/components/DepartmentNewsWidget";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { LiveTicker } from "@/components/LiveTicker";
import { WeatherWidget } from "@/components/WeatherWidget";
import {
  DollarSign,
  TrendingUp,
  ArrowRight,
  Building2,
  Users,
  ShoppingBag,
  GraduationCap,
  Leaf,
  RefreshCw,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  PiggyBank,
  Home,
} from "lucide-react";

interface RevenueSource {
  id: string;
  name: string;
  type: string;
  amount: number;
  status: "completed" | "pending" | "processing";
  timestamp: Date;
}

interface SplitDistribution {
  familyPortion: number;
  networkPool: number;
  totalRevenue: number;
}

export default function RevenueCycleDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock data - would come from trpc queries
  const revenueData: SplitDistribution = {
    familyPortion: 42000,
    networkPool: 28000,
    totalRevenue: 70000,
  };

  const recentTransactions: RevenueSource[] = [
    { id: "1", name: "Merchandise Sale", type: "merchandise", amount: 150, status: "completed", timestamp: new Date() },
    { id: "2", name: "Builder Membership", type: "membership", amount: 29, status: "completed", timestamp: new Date(Date.now() - 3600000) },
    { id: "3", name: "Academy Course", type: "education", amount: 199, status: "processing", timestamp: new Date(Date.now() - 7200000) },
    { id: "4", name: "Legacy Membership", type: "membership", amount: 99, status: "completed", timestamp: new Date(Date.now() - 10800000) },
    { id: "5", name: "Consulting Session", type: "service", amount: 500, status: "pending", timestamp: new Date(Date.now() - 14400000) },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "processing":
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      case "pending":
        return <Clock className="w-4 h-4 text-amber-600" />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "merchandise":
        return <ShoppingBag className="w-4 h-4" />;
      case "membership":
        return <Users className="w-4 h-4" />;
      case "education":
        return <GraduationCap className="w-4 h-4" />;
      case "service":
        return <Building2 className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Revenue Cycle Dashboard</h1>
            <p className="text-muted-foreground">
              Real-time view of revenue flow through the 60/40 trust model
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Revenue Flow Visualization */}
        <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <h2 className="text-lg font-semibold text-foreground mb-6">Revenue Flow Pipeline</h2>
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Step 1: Revenue Sources */}
            <div className="flex-1 text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Leaf className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-foreground">The The L.A.W.S. Collective</h3>
              <p className="text-sm text-muted-foreground">Revenue Generation</p>
              <p className="text-lg font-bold text-blue-600 mt-2">
                ${revenueData.totalRevenue.toLocaleString()}
              </p>
            </div>

            <ArrowRight className="w-8 h-8 text-muted-foreground hidden lg:block" />

            {/* Step 2: Trust */}
            <div className="flex-1 text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <PiggyBank className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-foreground">Trust Container</h3>
              <p className="text-sm text-muted-foreground">60/40 Split Engine</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                  60%
                </Badge>
                <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                  40%
                </Badge>
              </div>
            </div>

            <ArrowRight className="w-8 h-8 text-muted-foreground hidden lg:block" />

            {/* Step 3: Distribution */}
            <div className="flex-1">
              <div className="space-y-4">
                <div className="bg-white dark:bg-background rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3 mb-2">
                    <Home className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-foreground">Family Portion</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    ${revenueData.familyPortion.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">60% - Protected & Immutable</p>
                </div>
                
                <div className="bg-white dark:bg-background rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-amber-600" />
                    <span className="font-semibold text-foreground">Network Pool</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-600">
                    ${revenueData.networkPool.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">40% - Shared with Affiliates</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Revenue (MTD)</span>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">$70,000</p>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
              <ArrowUpRight className="w-4 h-4" />
              <span>+12.5% from last month</span>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Active Members</span>
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">1,247</p>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
              <ArrowUpRight className="w-4 h-4" />
              <span>+89 new this month</span>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Merchandise Sales</span>
              <ShoppingBag className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">$8,450</p>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
              <ArrowUpRight className="w-4 h-4" />
              <span>+23% from last month</span>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Membership Revenue</span>
              <Wallet className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">$45,230</p>
            <div className="flex items-center gap-1 text-sm text-amber-600 mt-1">
              <ArrowDownRight className="w-4 h-4" />
              <span>-2.1% from last month</span>
            </div>
          </Card>
        {/* Live Ticker and Weather */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <LiveTicker department="revenue" />
          </div>
          <div className="lg:col-span-1">
            <WeatherWidget compact />
          </div>
        </div>

        </div>

        {/* Tabs */}
        <Tabs defaultValue="transactions" className="w-full">
          <TabsList>
            <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
            <TabsTrigger value="sources">Revenue Sources</TabsTrigger>
            <TabsTrigger value="distribution">Distribution History</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="mt-4">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Recent Revenue Transactions</h3>
              <div className="space-y-3">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center">
                        {getTypeIcon(tx.type)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{tx.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{tx.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-foreground">${tx.amount.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">
                          {tx.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      {getStatusIcon(tx.status)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="sources" className="mt-4">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Revenue by Source</h3>
              <div className="space-y-4">
                {[
                  { name: "Memberships", amount: 45230, percentage: 65, icon: Users },
                  { name: "Merchandise", amount: 8450, percentage: 12, icon: ShoppingBag },
                  { name: "Academy Courses", amount: 12000, percentage: 17, icon: GraduationCap },
                  { name: "Consulting", amount: 4320, percentage: 6, icon: Building2 },
                ].map((source) => (
                  <div key={source.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <source.icon className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{source.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-foreground">
                          ${source.amount.toLocaleString()}
                        </span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({source.percentage}%)
                        </span>
                      </div>
                    </div>
                    <Progress value={source.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="distribution" className="mt-4">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Distribution History</h3>
              <div className="space-y-3">
                {[
                  { date: "Jan 2026", family: 42000, network: 28000 },
                  { date: "Dec 2025", family: 38500, network: 25667 },
                  { date: "Nov 2025", family: 41200, network: 27467 },
                  { date: "Oct 2025", family: 35800, network: 23867 },
                ].map((dist) => (
                  <div
                    key={dist.date}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <span className="font-medium text-foreground">{dist.date}</span>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Family (60%)</p>
                        <p className="font-semibold text-green-600">
                          ${dist.family.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Network (40%)</p>
                        <p className="font-semibold text-amber-600">
                          ${dist.network.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
