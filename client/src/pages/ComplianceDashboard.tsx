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
  Building2, FileText, ArrowUpRight, ArrowDownRight, Target, Plus, Settings2,
  AlertCircle, XCircle, Info, CheckCheck, Play
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import ScheduledChecksPanel from "@/components/ScheduledChecksPanel";
import { DepartmentNewsWidget } from "@/components/DepartmentNewsWidget";

export default function ComplianceDashboard() {
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "1y" | "all">("30d");
  const [showAlertsPanel, setShowAlertsPanel] = useState(false);
  const [showScheduledChecks, setShowScheduledChecks] = useState(false);

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

  // Targets queries
  const { data: targetsWithProgress, isLoading: loadingTargets, refetch: refetchTargets } = 
    trpc.complianceTargets.getWithProgress.useQuery();
  
  const { data: targetsSummary } = 
    trpc.complianceTargets.getSummary.useQuery();

  // Alerts queries
  const { data: activeAlerts, isLoading: loadingAlerts, refetch: refetchAlerts } = 
    trpc.complianceAlerts.getActive.useQuery();
  
  const { data: alertStats } = 
    trpc.complianceAlerts.getStats.useQuery();

  // Alerts mutations
  const acknowledgeMutation = trpc.complianceAlerts.acknowledge.useMutation({
    onSuccess: () => {
      toast.success("Alert acknowledged");
      refetchAlerts();
    },
    onError: () => toast.error("Failed to acknowledge alert")
  });

  const runCheckMutation = trpc.complianceAlerts.runCheck.useMutation({
    onSuccess: (result) => {
      toast.success(`Compliance check complete: ${result.generated} new alerts generated`);
      refetchAlerts();
    },
    onError: () => toast.error("Failed to run compliance check")
  });

  // Target management state
  const [showTargetDialog, setShowTargetDialog] = useState(false);
  const [targetForm, setTargetForm] = useState({
    department: "",
    targetPercentage: 95,
    effectiveDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

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

  const upsertTargetMutation = trpc.complianceTargets.upsert.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setShowTargetDialog(false);
      setTargetForm({ department: "", targetPercentage: 95, effectiveDate: new Date().toISOString().split("T")[0], notes: "" });
      refetchTargets();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save target");
    },
  });

  const handleSaveTarget = () => {
    if (!targetForm.department) {
      toast.error("Please enter a department name");
      return;
    }
    upsertTargetMutation.mutate(targetForm);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "behind":
        return <Badge variant="destructive">Behind</Badge>;
      case "at-risk":
        return <Badge variant="default" className="bg-orange-500">At Risk</Badge>;
      default:
        return <Badge variant="secondary" className="bg-green-500 text-white">On Track</Badge>;
    }
  };

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
            <Button 
              variant="outline" 
              onClick={() => setShowScheduledChecks(!showScheduledChecks)}
              className={showScheduledChecks ? 'bg-accent' : ''}
            >
              <Settings2 className="w-4 h-4 mr-2" />
              Scheduled Checks
            </Button>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Alerts Banner */}
        {activeAlerts && activeAlerts.length > 0 && (
          <Card className={`border-2 ${
            activeAlerts.some((a: any) => a.severity === 'critical') ? 'border-red-500 bg-red-50 dark:bg-red-950/20' :
            activeAlerts.some((a: any) => a.severity === 'warning') ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' :
            'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
          }`}>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${
                    activeAlerts.some((a: any) => a.severity === 'critical') ? 'bg-red-500/20' :
                    activeAlerts.some((a: any) => a.severity === 'warning') ? 'bg-orange-500/20' :
                    'bg-blue-500/20'
                  }`}>
                    {activeAlerts.some((a: any) => a.severity === 'critical') ? (
                      <XCircle className="w-6 h-6 text-red-600" />
                    ) : activeAlerts.some((a: any) => a.severity === 'warning') ? (
                      <AlertCircle className="w-6 h-6 text-orange-600" />
                    ) : (
                      <Info className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {alertStats?.critical || 0} Critical, {alertStats?.warning || 0} Warning, {alertStats?.info || 0} Info Alerts
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activeAlerts[0]?.title}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => runCheckMutation.mutate({})}
                    disabled={runCheckMutation.isPending}
                  >
                    {runCheckMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    Run Check
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => setShowAlertsPanel(!showAlertsPanel)}
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    View All ({activeAlerts.length})
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alerts Panel */}
        {showAlertsPanel && activeAlerts && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Active Compliance Alerts
                  </CardTitle>
                  <CardDescription>Alerts requiring attention</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowAlertsPanel(false)}>
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeAlerts.map((alert: any) => (
                  <div 
                    key={alert.id} 
                    className={`p-4 rounded-lg border ${
                      alert.severity === 'critical' ? 'border-red-300 bg-red-50 dark:bg-red-950/20' :
                      alert.severity === 'warning' ? 'border-orange-300 bg-orange-50 dark:bg-orange-950/20' :
                      'border-blue-300 bg-blue-50 dark:bg-blue-950/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {alert.severity === 'critical' ? (
                          <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        ) : alert.severity === 'warning' ? (
                          <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                        ) : (
                          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{alert.title}</span>
                            <Badge variant={alert.severity === 'critical' ? 'destructive' : alert.severity === 'warning' ? 'default' : 'secondary'} className={alert.severity === 'warning' ? 'bg-orange-500' : ''}>
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {alert.department} • {alert.createdAt ? format(new Date(alert.createdAt), 'MMM d, yyyy h:mm a') : 'Just now'}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => acknowledgeMutation.mutate({ alertId: alert.id })}
                        disabled={acknowledgeMutation.isPending}
                      >
                        <CheckCheck className="w-4 h-4 mr-1" />
                        Acknowledge
                      </Button>
                    </div>
                  </div>
                ))}
                {activeAlerts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                    <p>No active alerts</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scheduled Checks Panel */}
        {showScheduledChecks && (
          <ScheduledChecksPanel onClose={() => setShowScheduledChecks(false)} />
        )}

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

        {/* Compliance Targets Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Compliance Targets
                </CardTitle>
                <CardDescription>Department-specific compliance goals and progress</CardDescription>
              </div>
              <Dialog open={showTargetDialog} onOpenChange={setShowTargetDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Set Target
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Set Compliance Target</DialogTitle>
                    <DialogDescription>
                      Define a compliance target percentage for a department
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        placeholder="e.g., Finance, HR, Legal"
                        value={targetForm.department}
                        onChange={(e) => setTargetForm({ ...targetForm, department: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="targetPercentage">Target Percentage</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="targetPercentage"
                          type="number"
                          min={1}
                          max={100}
                          value={targetForm.targetPercentage}
                          onChange={(e) => setTargetForm({ ...targetForm, targetPercentage: parseInt(e.target.value) || 95 })}
                        />
                        <span className="text-muted-foreground">%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="effectiveDate">Effective Date</Label>
                      <Input
                        id="effectiveDate"
                        type="date"
                        value={targetForm.effectiveDate}
                        onChange={(e) => setTargetForm({ ...targetForm, effectiveDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Additional context for this target..."
                        value={targetForm.notes}
                        onChange={(e) => setTargetForm({ ...targetForm, notes: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowTargetDialog(false)}>Cancel</Button>
                    <Button onClick={handleSaveTarget} disabled={upsertTargetMutation.isPending}>
                      {upsertTargetMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Save Target
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {/* Summary Stats */}
            {targetsSummary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-secondary/30 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Overall Rate</p>
                  <p className={`text-2xl font-bold ${getComplianceColor(targetsSummary.overallRate)}`}>
                    {targetsSummary.overallRate}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Depts Meeting Target</p>
                  <p className="text-2xl font-bold">
                    {targetsSummary.departmentsMeetingTarget}/{targetsSummary.totalDepartments}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Target Achievement</p>
                  <p className={`text-2xl font-bold ${getComplianceColor(targetsSummary.targetAchievementRate)}`}>
                    {targetsSummary.targetAchievementRate}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Signatures</p>
                  <p className="text-2xl font-bold">
                    {targetsSummary.signedCount}/{targetsSummary.totalSignatures}
                  </p>
                </div>
              </div>
            )}

            {/* Targets Table */}
            {loadingTargets ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : targetsWithProgress?.targets && targetsWithProgress.targets.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Current</TableHead>
                    <TableHead>Gap</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {targetsWithProgress.targets.map((target, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{target.department}</TableCell>
                      <TableCell>{target.targetPercentage}%</TableCell>
                      <TableCell className={getComplianceColor(target.currentRate)}>
                        {target.currentRate}%
                      </TableCell>
                      <TableCell>
                        {target.gap > 0 ? (
                          <span className="text-red-500 flex items-center gap-1">
                            <ArrowDownRight className="w-3 h-3" />
                            -{target.gap}%
                          </span>
                        ) : (
                          <span className="text-green-500 flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" />
                            +{Math.abs(target.gap)}%
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="w-32">
                        <div className="relative">
                          <Progress value={target.currentRate} className="h-2" />
                          <div 
                            className={`absolute top-0 left-0 h-2 rounded-full ${getProgressColor(target.currentRate)}`}
                            style={{ width: `${Math.min(target.currentRate, 100)}%` }}
                          />
                          {/* Target marker */}
                          <div 
                            className="absolute top-0 w-0.5 h-4 -mt-1 bg-foreground"
                            style={{ left: `${target.targetPercentage}%` }}
                            title={`Target: ${target.targetPercentage}%`}
                          />
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(target.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No compliance targets set yet</p>
                <p className="text-sm">Click "Set Target" to define department goals</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Government Actions & Compliance News */}
        <DepartmentNewsWidget department="compliance" />
      </div>
    </DashboardLayout>
  );
}
