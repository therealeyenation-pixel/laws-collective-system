import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle, Clock, Search, Filter, ArrowUp, CheckCircle, XCircle,
  Settings, Bell, RefreshCw, User, Calendar, Shield, Zap, TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import {
  EscalationRule,
  PendingEscalation,
  EscalationHistory,
  defaultEscalationRules,
  generateMockPendingEscalations,
  generateMockEscalationHistory,
  formatHoursToReadable,
  getEscalationUrgencyColor,
  getEscalationTargetLabel,
} from "@/services/delegationEscalationService";

export default function DelegationEscalation() {
  const [rules, setRules] = useState<EscalationRule[]>(defaultEscalationRules);
  const [pendingEscalations] = useState<PendingEscalation[]>(() => generateMockPendingEscalations());
  const [escalationHistory] = useState<EscalationHistory[]>(() => generateMockEscalationHistory());
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [showRulesDialog, setShowRulesDialog] = useState(false);
  const [selectedRule, setSelectedRule] = useState<EscalationRule | null>(null);

  const filteredPending = useMemo(() => {
    return pendingEscalations.filter((esc) => {
      const matchesSearch =
        esc.taskTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        esc.fromUser.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = priorityFilter === "all" || esc.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [pendingEscalations, searchTerm, priorityFilter]);

  const criticalCount = pendingEscalations.filter((e) => e.priority === "critical" && e.status === "escalated").length;
  const highCount = pendingEscalations.filter((e) => e.priority === "high" && e.status === "escalated").length;

  const handleManualEscalate = (escalation: PendingEscalation) => {
    toast.success(`Manually escalated: ${escalation.taskTitle}`);
  };

  const handleResolve = (escalation: PendingEscalation, action: "approve" | "reject") => {
    toast.success(`${action === "approve" ? "Approved" : "Rejected"}: ${escalation.taskTitle}`);
  };

  const toggleRule = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, isActive: !r.isActive } : r))
    );
    toast.info("Escalation rule updated");
  };

  const getPriorityBadge = (priority: "high" | "critical") => {
    return (
      <Badge
        variant="outline"
        className={priority === "critical" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}
      >
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status: PendingEscalation["status"]) => {
    const config: Record<string, { color: string; icon: any }> = {
      pending: { color: "bg-amber-100 text-amber-700", icon: Clock },
      escalated: { color: "bg-orange-100 text-orange-700", icon: ArrowUp },
      resolved: { color: "bg-green-100 text-green-700", icon: CheckCircle },
    };
    const { color, icon: Icon } = config[status];
    return (
      <Badge variant="outline" className={`${color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Zap className="w-6 h-6" />
              Delegation Escalation
            </h1>
            <p className="text-muted-foreground">
              Manage automatic escalation of overdue delegation approvals
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowRulesDialog(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Escalation Rules
            </Button>
            <Button variant="outline" onClick={() => toast.info("Refreshing escalations...")}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Alert for critical escalations */}
        {criticalCount > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Critical Escalations Active</AlertTitle>
            <AlertDescription>
              {criticalCount} critical priority delegation(s) have been escalated and require immediate attention.
            </AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical Escalated</p>
                  <p className="text-3xl font-bold text-red-600">{criticalCount}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">High Priority Escalated</p>
                  <p className="text-3xl font-bold text-amber-600">{highCount}</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-full">
                  <ArrowUp className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {pendingEscalations.filter((e) => e.status === "pending").length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Rules</p>
                  <p className="text-3xl font-bold text-green-600">
                    {rules.filter((r) => r.isActive).length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">
              Pending Escalations ({pendingEscalations.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              Escalation History ({escalationHistory.length})
            </TabsTrigger>
          </TabsList>

          {/* Pending Escalations Tab */}
          <TabsContent value="pending" className="mt-4 space-y-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by task or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Escalation Cards */}
            <div className="space-y-4">
              {filteredPending.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                    <p className="text-muted-foreground">No pending escalations</p>
                  </CardContent>
                </Card>
              ) : (
                filteredPending.map((escalation) => (
                  <Card
                    key={escalation.id}
                    className={`border-l-4 ${
                      escalation.priority === "critical" ? "border-l-red-500" : "border-l-amber-500"
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-foreground">{escalation.taskTitle}</h3>
                              <p className="text-sm text-muted-foreground">
                                {escalation.delegationId} • {escalation.taskType}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {getPriorityBadge(escalation.priority)}
                              {getStatusBadge(escalation.status)}
                            </div>
                          </div>

                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {escalation.fromUser.name.split(" ").map((n) => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span>{escalation.fromUser.name}</span>
                              <span className="text-muted-foreground">→</span>
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {escalation.toUser.name.split(" ").map((n) => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span>{escalation.toUser.name}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className={`px-2 py-1 rounded ${getEscalationUrgencyColor(escalation.hoursOverdue, escalation.priority)}`}>
                              <Clock className="w-4 h-4 inline mr-1" />
                              Overdue: {formatHoursToReadable(escalation.hoursOverdue)}
                            </div>
                            <div className="text-muted-foreground">
                              <User className="w-4 h-4 inline mr-1" />
                              Current Approver: {escalation.currentApprover.name} ({escalation.currentApprover.role})
                            </div>
                          </div>

                          {/* Escalation Progress */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                Escalation Level: {escalation.currentEscalationLevel} / {escalation.maxEscalationLevel}
                              </span>
                              {escalation.nextEscalationIn !== undefined && (
                                <span className="text-muted-foreground">
                                  Next escalation in: {formatHoursToReadable(escalation.nextEscalationIn)}
                                </span>
                              )}
                            </div>
                            <Progress
                              value={(escalation.currentEscalationLevel / escalation.maxEscalationLevel) * 100}
                              className="h-2"
                            />
                          </div>
                        </div>

                        <div className="flex lg:flex-col gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleResolve(escalation, "approve")}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleResolve(escalation, "reject")}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                          {escalation.currentEscalationLevel < escalation.maxEscalationLevel && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleManualEscalate(escalation)}
                            >
                              <ArrowUp className="w-4 h-4 mr-1" />
                              Escalate
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {escalationHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start justify-between pb-4 border-b border-border last:border-0"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{entry.taskTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          {entry.escalatedFrom.name} → {entry.escalatedTo.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            Level {entry.escalationLevel}
                          </Badge>
                          <span>Reason: {entry.reason.replace("_", " ")}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {entry.escalatedAt.toLocaleString()}
                        </p>
                        {entry.resolution && (
                          <Badge
                            variant="outline"
                            className={
                              entry.resolution === "approved"
                                ? "bg-green-100 text-green-700"
                                : entry.resolution === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-orange-100 text-orange-700"
                            }
                          >
                            {entry.resolution.replace("_", " ")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Rules Dialog */}
        <Dialog open={showRulesDialog} onOpenChange={setShowRulesDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Escalation Rules</DialogTitle>
              <DialogDescription>
                Configure automatic escalation rules for delegation approvals
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {rules.map((rule) => (
                <Card key={rule.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{rule.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Priority: {rule.priority} • Threshold: {rule.thresholdHours} hours
                        </p>
                      </div>
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={() => toggleRule(rule.id)}
                      />
                    </div>
                    <div className="space-y-2">
                      {rule.escalationLevels.map((level) => (
                        <div
                          key={level.level}
                          className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Level {level.level}</Badge>
                            <span>+{level.hoursAfterThreshold}h</span>
                            <span className="text-muted-foreground">→</span>
                            <span>{getEscalationTargetLabel(level.escalateTo)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {level.notificationMethod.map((method) => (
                              <Badge key={method} variant="secondary" className="text-xs">
                                {method}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRulesDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
