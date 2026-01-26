import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { 
  FileSignature, CheckCircle, Clock, AlertTriangle, TrendingUp, TrendingDown,
  Minus, RefreshCw, Bell, Loader2, BarChart3, PieChart, Calendar, Users,
  Building2, FileText, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ComplianceDashboard() {
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "1y" | "all">("30d");

  // Queries
  const { data: overviewStats, isLoading: loadingOverview, refetch: refetchOverview } = 
    trpc.complianceDashboard.getOverviewStats.useQuery({ dateRange });
  
  const { data: departmentData, isLoading: loadingDepartments } = 
    trpc.complianceDashboard.getByDepartment.useQuery();
  
  const { data: monthlyTrend, isLoading: loadingTrend } = 
    trpc.complianceDashboard.getMonthlyTrend.useQuery({ months: 6 });
  
  const { data: topPending, isLoading: loadingPending, refetch: refetchPending } = 
    trpc.complianceDashboard.getTopPending.useQuery({ limit: 10 });
  
  const { data: documentTypes } = 
    trpc.complianceDashboard.getByDocumentType.useQuery();
  
  const { data: weeklySummary } = 
    trpc.complianceDashboard.getWeeklySummary.useQuery();

  // Mutations
  const sendReminderMutation = trpc.complianceDashboard.sendReminder.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetchPending();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send reminder");
    },
  });

  const handleRefresh = () => {
    refetchOverview();
    refetchPending();
    toast.success("Dashboard refreshed");
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "overdue":
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Overdue</Badge>;
      case "urgent":
        return <Badge variant="default" className="bg-orange-500"><Clock className="w-3 h-3 mr-1" />Urgent</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const getComplianceColor = (rate: number) => {
    if (rate >= 90) return "text-green-600 dark:text-green-400";
    if (rate >= 70) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 90) return "bg-green-500";
    if (rate >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Compliance Dashboard</h1>
            <p className="text-muted-foreground">Monitor signature compliance across the organization</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
              <SelectTrigger className="w-32">
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
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Weekly Summary Banner */}
        {weeklySummary && (
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/20 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Weekly Compliance Rate</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${getComplianceColor(weeklySummary.thisWeek.complianceRate)}`}>
                        {weeklySummary.thisWeek.complianceRate}%
                      </span>
                      <span className={`flex items-center text-sm ${
                        weeklySummary.trend === "up" ? "text-green-600" : 
                        weeklySummary.trend === "down" ? "text-red-600" : "text-muted-foreground"
                      }`}>
                        {weeklySummary.trend === "up" && <ArrowUpRight className="w-4 h-4" />}
                        {weeklySummary.trend === "down" && <ArrowDownRight className="w-4 h-4" />}
                        {weeklySummary.trend === "stable" && <Minus className="w-4 h-4" />}
                        {Math.abs(weeklySummary.rateChange)}% vs last week
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">This week: {weeklySummary.thisWeek.signed}/{weeklySummary.thisWeek.total} signed</p>
                  <p className="text-xs text-muted-foreground">Last week: {weeklySummary.lastWeek.signed}/{weeklySummary.lastWeek.total} signed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FileSignature className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Signatures</p>
                  <p className="text-2xl font-bold">
                    {loadingOverview ? <Loader2 className="w-5 h-5 animate-spin" /> : overviewStats?.totalSignatures || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Signed</p>
                  <p className="text-2xl font-bold">
                    {loadingOverview ? <Loader2 className="w-5 h-5 animate-spin" /> : overviewStats?.signedCount || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">
                    {loadingOverview ? <Loader2 className="w-5 h-5 animate-spin" /> : overviewStats?.pendingCount || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold">
                    {loadingOverview ? <Loader2 className="w-5 h-5 animate-spin" /> : overviewStats?.overdueCount || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Compliance Rate</p>
                  <p className={`text-2xl font-bold ${getComplianceColor(overviewStats?.complianceRate || 100)}`}>
                    {loadingOverview ? <Loader2 className="w-5 h-5 animate-spin" /> : `${overviewStats?.complianceRate || 100}%`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Compliance by Department
              </CardTitle>
              <CardDescription>Signature completion rates across departments</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingDepartments ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-4">
                  {departmentData?.departments.map((dept, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{dept.department}</span>
                        <span className={getComplianceColor(dept.complianceRate)}>
                          {dept.complianceRate}% ({dept.signed}/{dept.total})
                        </span>
                      </div>
                      <div className="relative">
                        <Progress value={dept.complianceRate} className="h-3" />
                        <div 
                          className={`absolute top-0 left-0 h-3 rounded-full ${getProgressColor(dept.complianceRate)}`}
                          style={{ width: `${dept.complianceRate}%` }}
                        />
                      </div>
                      {dept.overdue > 0 && (
                        <p className="text-xs text-red-500">{dept.overdue} overdue</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Monthly Trend
              </CardTitle>
              <CardDescription>Compliance rate over the past 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTrend ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-4">
                  {monthlyTrend?.trend.map((month, idx) => {
                    const monthName = format(new Date(month.month + "-01"), "MMM yyyy");
                    return (
                      <div key={idx} className="flex items-center gap-4">
                        <span className="w-20 text-sm text-muted-foreground">{monthName}</span>
                        <div className="flex-1">
                          <div className="relative h-6 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className={`absolute top-0 left-0 h-full ${getProgressColor(month.complianceRate)} transition-all`}
                              style={{ width: `${month.complianceRate}%` }}
                            />
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                              {month.complianceRate}%
                            </span>
                          </div>
                        </div>
                        <span className="w-16 text-sm text-right text-muted-foreground">
                          {month.signed}/{month.total}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Document Types and Pending Signatures */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                By Document Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documentTypes?.types.map((type, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium capitalize">{type.type}</span>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold ${getComplianceColor(type.complianceRate)}`}>
                        {type.complianceRate}%
                      </span>
                      <p className="text-xs text-muted-foreground">{type.signed}/{type.total}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Pending Signatures */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Top Pending Signatures
              </CardTitle>
              <CardDescription>Users with pending signature requests requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPending ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : topPending?.pending.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mb-2 text-green-500" />
                  <p>All signatures are up to date!</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Document</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topPending?.pending.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.userName}</p>
                            <p className="text-xs text-muted-foreground">{item.userEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{item.articleTitle}</p>
                            <p className="text-xs text-muted-foreground capitalize">{item.articleType}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.dueDate ? (
                            <span className="text-sm">
                              {format(new Date(item.dueDate), "MMM d, yyyy")}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">No due date</span>
                          )}
                        </TableCell>
                        <TableCell>{getPriorityBadge(item.priority)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => sendReminderMutation.mutate({ acknowledgmentId: item.id })}
                            disabled={sendReminderMutation.isPending}
                          >
                            {sendReminderMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Bell className="w-4 h-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
