import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Calendar,
  Bell,
  BellOff,
  Clock,
  Play,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Loader2,
  RefreshCw,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import {
  getSchedules,
  getSettings,
  saveSettings,
  updateSchedule,
  toggleSchedule,
  getUnacknowledgedAlerts,
  acknowledgeAlert,
  acknowledgeAllAlerts,
  clearAlerts,
  runDiagnostic,
  formatInterval,
  getSeverityColor,
  getDiagnosticSummary,
  type DiagnosticSchedule,
  type DiagnosticAlert,
  type DiagnosticSettings,
  type DiagnosticInterval,
  type AlertSeverity,
  type AlertChannel,
} from "@/services/scheduledDiagnosticsService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function ScheduledDiagnosticsPanel() {
  const [schedules, setSchedules] = useState<DiagnosticSchedule[]>([]);
  const [alerts, setAlerts] = useState<DiagnosticAlert[]>([]);
  const [settings, setSettings] = useState<DiagnosticSettings>(getSettings());
  const [showSettings, setShowSettings] = useState(false);
  const [runningSchedule, setRunningSchedule] = useState<string | null>(null);
  const [summary, setSummary] = useState(getDiagnosticSummary());

  useEffect(() => {
    setSchedules(getSchedules());
    setAlerts(getUnacknowledgedAlerts());
    setSummary(getDiagnosticSummary());
  }, []);

  const handleToggleSchedule = (scheduleId: string) => {
    toggleSchedule(scheduleId);
    setSchedules(getSchedules());
    toast.success("Schedule updated");
  };

  const handleRunNow = async (scheduleId: string) => {
    setRunningSchedule(scheduleId);
    try {
      const result = await runDiagnostic(scheduleId);
      setSchedules(getSchedules());
      setAlerts(getUnacknowledgedAlerts());
      setSummary(getDiagnosticSummary());
      
      if (result.issuesFound > 0) {
        toast.warning(`Diagnostic found ${result.issuesFound} issue(s)`);
      } else {
        toast.success("Diagnostic completed - no issues found");
      }
    } catch (error) {
      toast.error("Failed to run diagnostic");
    } finally {
      setRunningSchedule(null);
    }
  };

  const handleUpdateSchedule = (scheduleId: string, updates: Partial<DiagnosticSchedule>) => {
    updateSchedule(scheduleId, updates);
    setSchedules(getSchedules());
    toast.success("Schedule updated");
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    acknowledgeAlert(alertId);
    setAlerts(getUnacknowledgedAlerts());
    setSummary(getDiagnosticSummary());
    toast.success("Alert acknowledged");
  };

  const handleAcknowledgeAll = () => {
    acknowledgeAllAlerts();
    setAlerts([]);
    setSummary(getDiagnosticSummary());
    toast.success("All alerts acknowledged");
  };

  const handleClearAlerts = () => {
    clearAlerts();
    setAlerts([]);
    setSummary(getDiagnosticSummary());
    toast.success("Alerts cleared");
  };

  const handleSaveSettings = (newSettings: Partial<DiagnosticSettings>) => {
    saveSettings(newSettings);
    setSettings(getSettings());
    toast.success("Settings saved");
  };

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'info':
        return <Info className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'critical':
        return <XCircle className="w-4 h-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Scheduled Diagnostics
            </CardTitle>
            <CardDescription>
              Automatic system health checks at configurable intervals
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={settings.globalEnabled}
                onCheckedChange={(checked) => handleSaveSettings({ globalEnabled: checked })}
              />
              <span className="text-sm text-muted-foreground">
                {settings.globalEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
              <Settings className="w-4 h-4 mr-1" />
              Settings
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="schedules">
          <TabsList className="mb-4">
            <TabsTrigger value="schedules">
              Schedules ({summary.activeSchedules}/{summary.totalSchedules})
            </TabsTrigger>
            <TabsTrigger value="alerts" className="relative">
              Alerts
              {alerts.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 px-1.5">
                  {alerts.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedules" className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-2xl font-bold">{summary.activeSchedules}</p>
                <p className="text-xs text-muted-foreground">Active Schedules</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-2xl font-bold">{summary.unacknowledgedAlerts}</p>
                <p className="text-xs text-muted-foreground">Pending Alerts</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-sm font-medium">
                  {summary.nextRunTime 
                    ? formatDistanceToNow(summary.nextRunTime, { addSuffix: true })
                    : "N/A"
                  }
                </p>
                <p className="text-xs text-muted-foreground">Next Run</p>
              </div>
            </div>

            {/* Schedule List */}
            <div className="space-y-3">
              {schedules.map(schedule => (
                <div 
                  key={schedule.id}
                  className={`p-4 border rounded-lg ${schedule.enabled ? 'bg-background' : 'bg-muted/30'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{schedule.name}</h4>
                        <Badge variant={schedule.enabled ? "default" : "secondary"}>
                          {schedule.enabled ? "Active" : "Paused"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatInterval(schedule.interval)}
                        </span>
                        {schedule.lastRun && (
                          <span>
                            Last: {formatDistanceToNow(schedule.lastRun, { addSuffix: true })}
                          </span>
                        )}
                        {schedule.alertOnIssues && (
                          <span className="flex items-center gap-1">
                            <Bell className="w-3 h-3" />
                            Alerts on {schedule.alertThreshold}+
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={schedule.interval}
                        onValueChange={(value) => handleUpdateSchedule(schedule.id, { interval: value as DiagnosticInterval })}
                      >
                        <SelectTrigger className="w-[140px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="every_6_hours">Every 6 hours</SelectItem>
                          <SelectItem value="every_12_hours">Every 12 hours</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRunNow(schedule.id)}
                        disabled={runningSchedule === schedule.id}
                      >
                        {runningSchedule === schedule.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                      <Switch
                        checked={schedule.enabled}
                        onCheckedChange={() => handleToggleSchedule(schedule.id)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <p>No pending alerts</p>
                <p className="text-sm">All systems operating normally</p>
              </div>
            ) : (
              <>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={handleAcknowledgeAll}>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Acknowledge All
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleClearAlerts}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                </div>
                <div className="space-y-2">
                  {alerts.map(alert => (
                    <div 
                      key={alert.id}
                      className={`p-4 rounded-lg border-l-4 ${
                        alert.severity === 'critical' ? 'border-l-red-500 bg-red-50 dark:bg-red-950/20' :
                        alert.severity === 'warning' ? 'border-l-amber-500 bg-amber-50 dark:bg-amber-950/20' :
                        'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <span className={getSeverityColor(alert.severity)}>
                            {getSeverityIcon(alert.severity)}
                          </span>
                          <div>
                            <h4 className="font-medium">{alert.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {alert.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {format(alert.timestamp, "MMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAcknowledgeAlert(alert.id)}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Settings Dialog */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Diagnostic Settings</DialogTitle>
              <DialogDescription>
                Configure scheduled diagnostic behavior
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Global Enable */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Global Enable</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable or disable all scheduled diagnostics
                  </p>
                </div>
                <Switch
                  checked={settings.globalEnabled}
                  onCheckedChange={(checked) => handleSaveSettings({ globalEnabled: checked })}
                />
              </div>

              {/* Quiet Hours */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Quiet Hours</Label>
                    <p className="text-xs text-muted-foreground">
                      Pause diagnostics during specified hours
                    </p>
                  </div>
                  <Switch
                    checked={settings.quietHoursEnabled}
                    onCheckedChange={(checked) => handleSaveSettings({ quietHoursEnabled: checked })}
                  />
                </div>
                {settings.quietHoursEnabled && (
                  <div className="flex items-center gap-2 pl-4">
                    <Input
                      type="time"
                      value={settings.quietHoursStart}
                      onChange={(e) => handleSaveSettings({ quietHoursStart: e.target.value })}
                      className="w-32"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={settings.quietHoursEnd}
                      onChange={(e) => handleSaveSettings({ quietHoursEnd: e.target.value })}
                      className="w-32"
                    />
                  </div>
                )}
              </div>

              {/* Max Alerts */}
              <div className="space-y-2">
                <Label>Max Alerts Per Day</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={settings.maxAlertsPerDay}
                  onChange={(e) => handleSaveSettings({ maxAlertsPerDay: parseInt(e.target.value) || 10 })}
                />
                <p className="text-xs text-muted-foreground">
                  Limit alerts to prevent notification fatigue
                </p>
              </div>

              {/* Auto Acknowledge */}
              <div className="space-y-2">
                <Label>Auto-Acknowledge After (hours)</Label>
                <Input
                  type="number"
                  min={1}
                  max={168}
                  value={settings.autoAcknowledgeAfterHours}
                  onChange={(e) => handleSaveSettings({ autoAcknowledgeAfterHours: parseInt(e.target.value) || 48 })}
                />
                <p className="text-xs text-muted-foreground">
                  Automatically acknowledge old alerts
                </p>
              </div>

              {/* Retry on Failure */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Retry on Failure</Label>
                  <p className="text-xs text-muted-foreground">
                    Retry failed diagnostics automatically
                  </p>
                </div>
                <Switch
                  checked={settings.retryOnFailure}
                  onCheckedChange={(checked) => handleSaveSettings({ retryOnFailure: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowSettings(false)}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
