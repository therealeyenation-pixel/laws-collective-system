import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeftRight, Clock, CheckCircle, Users, BarChart3, PieChart, Calendar, Award, Target, RefreshCw,
  ArrowUpRight, ArrowDownRight, Minus
} from "lucide-react";
import { toast } from "sonner";
import {
  calculateDelegationMetrics,
  calculateDelegationTrends,
  analyzeReasons,
  getTopDelegators,
  getTopDelegates,
  generateMockDelegationRecords,
  formatDuration,
} from "@/services/delegationAnalyticsService";

export default function DelegationAnalytics() {
  const [timeRange, setTimeRange] = useState<string>("30");
  const [records] = useState(() => generateMockDelegationRecords(100));

  const filteredRecords = useMemo(() => {
    const days = parseInt(timeRange);
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return records.filter((r) => new Date(r.delegatedAt) >= cutoff);
  }, [records, timeRange]);

  const metrics = useMemo(() => calculateDelegationMetrics(filteredRecords), [filteredRecords]);
  const trends = useMemo(() => calculateDelegationTrends(filteredRecords, "weekly"), [filteredRecords]);
  const reasonAnalysis = useMemo(() => analyzeReasons(filteredRecords), [filteredRecords]);
  const topDelegators = useMemo(() => getTopDelegators(filteredRecords, 5), [filteredRecords]);
  const topDelegates = useMemo(() => getTopDelegates(filteredRecords, 5), [filteredRecords]);

  const MetricCard = ({
    title, value, suffix = "", trend, icon: Icon,
  }: {
    title: string; value: number | string; suffix?: string;
    trend?: "up" | "down" | "stable"; icon: any;
  }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">
              {typeof value === "number" ? value.toFixed(1) : value}{suffix}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
        {trend && (
          <div className="mt-3 flex items-center gap-1 text-sm">
            {trend === "up" && <><ArrowUpRight className="w-4 h-4 text-green-600" /><span className="text-green-600">Increasing</span></>}
            {trend === "down" && <><ArrowDownRight className="w-4 h-4 text-red-600" /><span className="text-red-600">Decreasing</span></>}
            {trend === "stable" && <><Minus className="w-4 h-4 text-gray-400" /><span className="text-muted-foreground">Stable</span></>}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Delegation Analytics</h1>
            <p className="text-muted-foreground">Track delegation patterns, acceptance rates, and completion metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => toast.info("Refreshing analytics...")}>
              <RefreshCw className="w-4 h-4 mr-2" />Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total Delegations" value={metrics.totalDelegations} icon={ArrowLeftRight} trend="up" />
          <MetricCard title="Acceptance Rate" value={metrics.acceptanceRate} suffix="%" icon={CheckCircle} trend="stable" />
          <MetricCard title="Completion Rate" value={metrics.completionRate} suffix="%" icon={Target} trend="up" />
          <MetricCard title="Avg Response Time" value={formatDuration(metrics.avgResponseTime)} icon={Clock} />
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="reasons">Reasons</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" />Performance Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Acceptance Rate</span>
                      <span className="font-medium">{metrics.acceptanceRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.acceptanceRate} className="h-2 [&>div]:bg-green-500" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Decline Rate</span>
                      <span className="font-medium">{metrics.declineRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.declineRate} className="h-2 [&>div]:bg-red-500" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Completion Rate</span>
                      <span className="font-medium">{metrics.completionRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.completionRate} className="h-2 [&>div]:bg-blue-500" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">On-Time Completion</span>
                      <span className="font-medium">{metrics.onTimeCompletionRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.onTimeCompletionRate} className="h-2 [&>div]:bg-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5" />Time Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-3xl font-bold text-primary">{formatDuration(metrics.avgResponseTime)}</p>
                      <p className="text-sm text-muted-foreground mt-1">Avg Response Time</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-3xl font-bold text-blue-600">{formatDuration(metrics.avgCompletionTime)}</p>
                      <p className="text-sm text-muted-foreground mt-1">Avg Completion Time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" />Weekly Delegation Trends</CardTitle>
                <CardDescription>Delegation activity over the selected time period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trends.map((trend, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium">{trend.period}</span>
                        <Badge variant="outline">{trend.delegations} total</Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="text-lg font-bold">{trend.delegations}</p>
                          <p className="text-xs text-muted-foreground">Created</p>
                        </div>
                        <div className="p-2 bg-green-50 rounded">
                          <p className="text-lg font-bold text-green-600">{trend.accepted}</p>
                          <p className="text-xs text-muted-foreground">Accepted</p>
                        </div>
                        <div className="p-2 bg-red-50 rounded">
                          <p className="text-lg font-bold text-red-600">{trend.declined}</p>
                          <p className="text-xs text-muted-foreground">Declined</p>
                        </div>
                        <div className="p-2 bg-blue-50 rounded">
                          <p className="text-lg font-bold text-blue-600">{trend.completed}</p>
                          <p className="text-xs text-muted-foreground">Completed</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reasons" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><PieChart className="w-5 h-5" />Delegation Reasons Analysis</CardTitle>
                <CardDescription>Understanding why tasks are being delegated</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reasonAnalysis.map((reason, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">{reason.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {reason.count} delegation{reason.count !== 1 ? "s" : ""} ({reason.percentage.toFixed(1)}%)
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Acceptance Rate</p>
                          <p className={`font-bold ${reason.avgAcceptanceRate >= 70 ? "text-green-600" : reason.avgAcceptanceRate >= 50 ? "text-amber-600" : "text-red-600"}`}>
                            {reason.avgAcceptanceRate.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      <Progress value={reason.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" />Top Delegators</CardTitle>
                  <CardDescription>Users who delegate the most tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topDelegators.map((user, index) => (
                      <div key={user.userId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${index === 0 ? "bg-amber-100 text-amber-700" : index === 1 ? "bg-gray-200 text-gray-700" : index === 2 ? "bg-orange-100 text-orange-700" : "bg-muted text-muted-foreground"}`}>
                            {index + 1}
                          </div>
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">{user.userName.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.userName}</span>
                        </div>
                        <Badge variant="secondary">{user.count} delegations</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Award className="w-5 h-5" />Top Delegates</CardTitle>
                  <CardDescription>Users who receive and complete the most delegations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topDelegates.map((user, index) => (
                      <div key={user.userId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${index === 0 ? "bg-amber-100 text-amber-700" : index === 1 ? "bg-gray-200 text-gray-700" : index === 2 ? "bg-orange-100 text-orange-700" : "bg-muted text-muted-foreground"}`}>
                            {index + 1}
                          </div>
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">{user.userName.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.userName}</p>
                            <p className="text-xs text-muted-foreground">{user.completionRate.toFixed(0)}% completion rate</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{user.count} received</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
