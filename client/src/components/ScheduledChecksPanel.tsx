import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { 
  Clock, Play, RefreshCw, Settings2, Bell, Calendar, AlertTriangle, 
  CheckCircle, XCircle, Loader2, Mail, History, TrendingUp, Zap
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";

interface ScheduledChecksPanelProps {
  onClose?: () => void;
}

export default function ScheduledChecksPanel({ onClose }: ScheduledChecksPanelProps) {
  const [showEscalationDialog, setShowEscalationDialog] = useState(false);
  const [escalationForm, setEscalationForm] = useState({
    name: "",
    fromSeverity: "warning" as "info" | "warning",
    toSeverity: "critical" as "warning" | "critical",
    hoursUntilEscalation: 24,
    notifyOnEscalation: true
  });

  // Queries
  const { data: scheduledChecks, isLoading: loadingChecks, refetch: refetchChecks } = 
    trpc.complianceAlerts.getScheduledChecks.useQuery();
  
  const { data: notificationHistory, isLoading: loadingHistory } = 
    trpc.complianceAlerts.getNotificationHistory.useQuery({ limit: 20 });
  
  const { data: notificationStats } = 
    trpc.complianceAlerts.getNotificationStats.useQuery();
  
  const { data: escalationRules, refetch: refetchRules } = 
    trpc.complianceAlerts.getEscalationRules.useQuery();

  // Mutations
  const toggleCheckMutation = trpc.complianceAlerts.toggleScheduledCheck.useMutation({
    onSuccess: () => {
      toast.success("Scheduled check updated");
      refetchChecks();
    },
    onError: () => toast.error("Failed to update scheduled check")
  });

  const runDailyCheckMutation = trpc.complianceAlerts.runDailyCheck.useMutation({
    onSuccess: (result) => {
      toast.success(`Daily check complete: ${result.results.generated || 0} alerts generated`);
      refetchChecks();
    },
    onError: () => toast.error("Failed to run daily check")
  });

  const runEscalationCheckMutation = trpc.complianceAlerts.runEscalationCheck.useMutation({
    onSuccess: (result) => {
      toast.success(`Escalation check complete: ${result.results.escalated || 0} alerts escalated`);
      refetchChecks();
    },
    onError: () => toast.error("Failed to run escalation check")
  });

  const runWeeklyDigestMutation = trpc.complianceAlerts.runWeeklyDigest.useMutation({
    onSuccess: () => {
      toast.success("Weekly digest sent successfully");
      refetchChecks();
    },
    onError: () => toast.error("Failed to send weekly digest")
  });

  const createEscalationRuleMutation = trpc.complianceAlerts.createEscalationRule.useMutation({
    onSuccess: () => {
      toast.success("Escalation rule created");
      setShowEscalationDialog(false);
      setEscalationForm({
        name: "",
        fromSeverity: "warning",
        toSeverity: "critical",
        hoursUntilEscalation: 24,
        notifyOnEscalation: true
      });
      refetchRules();
    },
    onError: () => toast.error("Failed to create escalation rule")
  });

  const toggleEscalationRuleMutation = trpc.complianceAlerts.updateEscalationRule.useMutation({
    onSuccess: () => {
      toast.success("Escalation rule updated");
      refetchRules();
    },
    onError: () => toast.error("Failed to update escalation rule")
  });

  const deleteEscalationRuleMutation = trpc.complianceAlerts.deleteEscalationRule.useMutation({
    onSuccess: () => {
      toast.success("Escalation rule deleted");
      refetchRules();
    },
    onError: () => toast.error("Failed to delete escalation rule")
  });

  const getCheckTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'daily_threshold': 'Daily Threshold Check',
      'weekly_digest': 'Weekly Digest',
      'escalation_check': 'Escalation Check',
      'reminder_processing': 'Reminder Processing'
    };
    return labels[type] || type;
  };

  const getCheckTypeIcon = (type: string) => {
    switch (type) {
      case 'daily_threshold':
        return <TrendingUp className="w-4 h-4" />;
      case 'weekly_digest':
        return <Mail className="w-4 h-4" />;
      case 'escalation_check':
        return <AlertTriangle className="w-4 h-4" />;
      case 'reminder_processing':
        return <Bell className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="secondary">Never Run</Badge>;
    switch (status) {
      case 'success':
        return <Badge variant="secondary" className="bg-green-500 text-white">Success</Badge>;
      case 'partial':
        return <Badge variant="default" className="bg-orange-500">Partial</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getNotificationStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <Badge variant="secondary" className="bg-green-500 text-white">{status}</Badge>;
      case 'pending':
        return <Badge variant="secondary">{status}</Badge>;
      case 'failed':
      case 'bounced':
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="w-5 h-5" />
              Scheduled Compliance Checks
            </CardTitle>
            <CardDescription>Configure automated compliance monitoring and notifications</CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <XCircle className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="scheduled" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scheduled">Scheduled Jobs</TabsTrigger>
            <TabsTrigger value="escalation">Escalation Rules</TabsTrigger>
            <TabsTrigger value="history">Notification History</TabsTrigger>
          </TabsList>

          {/* Scheduled Jobs Tab */}
          <TabsContent value="scheduled" className="space-y-4">
            {loadingChecks ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Last Run</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Enabled</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduledChecks?.map((check: any) => (
                    <TableRow key={check.checkType}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getCheckTypeIcon(check.checkType)}
                          <span className="font-medium">{getCheckTypeLabel(check.checkType)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {check.cronExpression || 'Manual'}
                        </code>
                      </TableCell>
                      <TableCell>
                        {check.lastRunAt ? (
                          <div>
                            <p className="text-sm">{format(new Date(check.lastRunAt), 'MMM d, h:mm a')}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(check.lastRunAt), { addSuffix: true })}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(check.lastRunStatus)}</TableCell>
                      <TableCell>
                        <Switch
                          checked={check.isEnabled}
                          onCheckedChange={(enabled) => 
                            toggleCheckMutation.mutate({ 
                              checkType: check.checkType as any, 
                              enabled 
                            })
                          }
                          disabled={toggleCheckMutation.isPending}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (check.checkType === 'daily_threshold') {
                              runDailyCheckMutation.mutate();
                            } else if (check.checkType === 'escalation_check') {
                              runEscalationCheckMutation.mutate();
                            } else if (check.checkType === 'weekly_digest') {
                              runWeeklyDigestMutation.mutate();
                            }
                          }}
                          disabled={
                            runDailyCheckMutation.isPending || 
                            runEscalationCheckMutation.isPending || 
                            runWeeklyDigestMutation.isPending
                          }
                        >
                          {(runDailyCheckMutation.isPending && check.checkType === 'daily_threshold') ||
                           (runEscalationCheckMutation.isPending && check.checkType === 'escalation_check') ||
                           (runWeeklyDigestMutation.isPending && check.checkType === 'weekly_digest') ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Quick Stats */}
            {notificationStats && (
              <div className="grid grid-cols-4 gap-4 mt-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Sent (30d)</p>
                        <p className="text-lg font-bold">{notificationStats.totalSent}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Failed (30d)</p>
                        <p className="text-lg font-bold">{notificationStats.totalFailed}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Alerts</p>
                        <p className="text-lg font-bold">{notificationStats.byType?.compliance_alert || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-purple-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Digests</p>
                        <p className="text-lg font-bold">{notificationStats.byType?.weekly_digest || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Escalation Rules Tab */}
          <TabsContent value="escalation" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={showEscalationDialog} onOpenChange={setShowEscalationDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Zap className="w-4 h-4" />
                    Add Rule
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Escalation Rule</DialogTitle>
                    <DialogDescription>
                      Define when unacknowledged alerts should be escalated to a higher severity level.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Rule Name</Label>
                      <Input
                        value={escalationForm.name}
                        onChange={(e) => setEscalationForm({ ...escalationForm, name: e.target.value })}
                        placeholder="e.g., Warning to Critical (24h)"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>From Severity</Label>
                        <Select
                          value={escalationForm.fromSeverity}
                          onValueChange={(v) => setEscalationForm({ ...escalationForm, fromSeverity: v as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="info">Info</SelectItem>
                            <SelectItem value="warning">Warning</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>To Severity</Label>
                        <Select
                          value={escalationForm.toSeverity}
                          onValueChange={(v) => setEscalationForm({ ...escalationForm, toSeverity: v as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="warning">Warning</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Hours Until Escalation</Label>
                      <Input
                        type="number"
                        min={1}
                        max={168}
                        value={escalationForm.hoursUntilEscalation}
                        onChange={(e) => setEscalationForm({ ...escalationForm, hoursUntilEscalation: parseInt(e.target.value) || 24 })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Alert will escalate if not acknowledged within this time
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={escalationForm.notifyOnEscalation}
                        onCheckedChange={(v) => setEscalationForm({ ...escalationForm, notifyOnEscalation: v })}
                      />
                      <Label>Send notification on escalation</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowEscalationDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => createEscalationRuleMutation.mutate(escalationForm)}
                      disabled={!escalationForm.name || createEscalationRuleMutation.isPending}
                    >
                      {createEscalationRuleMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      Create Rule
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule Name</TableHead>
                  <TableHead>Escalation Path</TableHead>
                  <TableHead>Time Threshold</TableHead>
                  <TableHead>Notify</TableHead>
                  <TableHead>Enabled</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {escalationRules?.map((rule: any) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={rule.fromSeverity === 'info' ? 'secondary' : 'default'} 
                               className={rule.fromSeverity === 'warning' ? 'bg-orange-500' : ''}>
                          {rule.fromSeverity}
                        </Badge>
                        <span>→</span>
                        <Badge variant={rule.toSeverity === 'critical' ? 'destructive' : 'default'}
                               className={rule.toSeverity === 'warning' ? 'bg-orange-500' : ''}>
                          {rule.toSeverity}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{rule.hoursUntilEscalation}h</TableCell>
                    <TableCell>
                      {rule.notifyOnEscalation ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={rule.isEnabled}
                        onCheckedChange={(enabled) => 
                          toggleEscalationRuleMutation.mutate({ id: rule.id, isEnabled: enabled })
                        }
                        disabled={toggleEscalationRuleMutation.isPending}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this rule?')) {
                            deleteEscalationRuleMutation.mutate({ id: rule.id });
                          }
                        }}
                        disabled={deleteEscalationRuleMutation.isPending}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Notification History Tab */}
          <TabsContent value="history" className="space-y-4">
            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : notificationHistory?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No notifications sent yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notificationHistory?.map((notification: any) => (
                    <TableRow key={notification.id}>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {notification.notificationType?.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {notification.subject}
                      </TableCell>
                      <TableCell className="capitalize">{notification.channel}</TableCell>
                      <TableCell>{getNotificationStatusBadge(notification.status)}</TableCell>
                      <TableCell>
                        {notification.sentAt ? (
                          <span className="text-sm">
                            {format(new Date(notification.sentAt), 'MMM d, h:mm a')}
                          </span>
                        ) : notification.createdAt ? (
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
