import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Check,
  CheckCheck,
  X,
  AlertCircle,
  Clock,
  RefreshCw,
  Filter,
  Settings,
  BarChart3,
  Inbox,
  Archive,
  Trash2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type NotificationType = 
  | 'compliance_reminder'
  | 'deadline_alert'
  | 'document_expiration'
  | 'overdue_task'
  | 'weekly_digest'
  | 'system_alert'
  | 'approval_request'
  | 'task_assignment'
  | 'payment_notification'
  | 'security_alert';

type NotificationChannel = 'email' | 'in_app' | 'sms' | 'push';
type DeliveryStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced' | 'read';

const notificationTypeLabels: Record<NotificationType, string> = {
  compliance_reminder: 'Compliance Reminder',
  deadline_alert: 'Deadline Alert',
  document_expiration: 'Document Expiration',
  overdue_task: 'Overdue Task',
  weekly_digest: 'Weekly Digest',
  system_alert: 'System Alert',
  approval_request: 'Approval Request',
  task_assignment: 'Task Assignment',
  payment_notification: 'Payment Notification',
  security_alert: 'Security Alert',
};

const channelIcons: Record<NotificationChannel, React.ReactNode> = {
  email: <Mail className="h-4 w-4" />,
  in_app: <Bell className="h-4 w-4" />,
  sms: <Smartphone className="h-4 w-4" />,
  push: <MessageSquare className="h-4 w-4" />,
};

const statusIcons: Record<DeliveryStatus, React.ReactNode> = {
  pending: <Clock className="h-4 w-4 text-yellow-500" />,
  sent: <Check className="h-4 w-4 text-blue-500" />,
  delivered: <CheckCheck className="h-4 w-4 text-green-500" />,
  failed: <X className="h-4 w-4 text-red-500" />,
  bounced: <AlertCircle className="h-4 w-4 text-orange-500" />,
  read: <CheckCheck className="h-4 w-4 text-green-600" />,
};

const statusColors: Record<DeliveryStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  bounced: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  read: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
};

export default function NotificationHistory() {
  const [selectedTypes, setSelectedTypes] = useState<NotificationType[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<NotificationChannel[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<DeliveryStatus[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("history");

  // Queries
  const { data: historyData, isLoading: historyLoading, refetch: refetchHistory } = trpc.notificationHistory.getHistory.useQuery({
    types: selectedTypes.length > 0 ? selectedTypes : undefined,
    channels: selectedChannels.length > 0 ? selectedChannels : undefined,
    statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
    unreadOnly,
    page,
    pageSize: 20,
  });

  const { data: unreadCount } = trpc.notificationHistory.getUnreadCount.useQuery();
  const { data: statistics, isLoading: statsLoading } = trpc.notificationHistory.getStatistics.useQuery({});
  const { data: preferences, isLoading: prefsLoading } = trpc.notificationHistory.getPreferences.useQuery();
  const { data: notificationTypes } = trpc.notificationHistory.getNotificationTypes.useQuery();

  // Mutations
  const markAsReadMutation = trpc.notificationHistory.markAsRead.useMutation({
    onSuccess: () => {
      refetchHistory();
      toast.success("Notification marked as read");
    },
  });

  const markAllAsReadMutation = trpc.notificationHistory.markAllAsRead.useMutation({
    onSuccess: (data) => {
      refetchHistory();
      toast.success(`${data.count} notifications marked as read`);
    },
  });

  const updatePreferencesMutation = trpc.notificationHistory.updatePreferences.useMutation({
    onSuccess: () => {
      toast.success("Preferences updated");
    },
  });

  const resendMutation = trpc.notificationHistory.resend.useMutation({
    onSuccess: () => {
      refetchHistory();
      toast.success("Notification queued for resend");
    },
  });

  const handleTypeToggle = (type: NotificationType) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
    setPage(1);
  };

  const handleChannelToggle = (channel: NotificationChannel) => {
    setSelectedChannels(prev =>
      prev.includes(channel)
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
    setPage(1);
  };

  const handleStatusToggle = (status: DeliveryStatus) => {
    setSelectedStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedChannels([]);
    setSelectedStatuses([]);
    setUnreadOnly(false);
    setPage(1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notification Center</h1>
            <p className="text-muted-foreground">
              View notification history, manage preferences, and track delivery status
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount !== undefined && unreadCount > 0 && (
              <Badge variant="destructive" className="text-sm">
                {unreadCount} unread
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending || !unreadCount}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="history" className="gap-2">
              <Inbox className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="statistics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Statistics
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Settings className="h-4 w-4" />
              Preferences
            </TabsTrigger>
          </TabsList>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Type Filters */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Notification Type</Label>
                  <div className="flex flex-wrap gap-2">
                    {(notificationTypes || []).map((type) => (
                      <Badge
                        key={type}
                        variant={selectedTypes.includes(type as NotificationType) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleTypeToggle(type as NotificationType)}
                      >
                        {notificationTypeLabels[type as NotificationType] || type}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Channel Filters */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Channel</Label>
                  <div className="flex gap-2">
                    {(['email', 'in_app', 'sms', 'push'] as NotificationChannel[]).map((channel) => (
                      <Badge
                        key={channel}
                        variant={selectedChannels.includes(channel) ? "default" : "outline"}
                        className="cursor-pointer flex items-center gap-1"
                        onClick={() => handleChannelToggle(channel)}
                      >
                        {channelIcons[channel]}
                        {channel.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Status Filters */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Status</Label>
                  <div className="flex gap-2">
                    {(['pending', 'sent', 'delivered', 'failed', 'bounced', 'read'] as DeliveryStatus[]).map((status) => (
                      <Badge
                        key={status}
                        variant={selectedStatuses.includes(status) ? "default" : "outline"}
                        className={`cursor-pointer flex items-center gap-1 ${selectedStatuses.includes(status) ? '' : statusColors[status]}`}
                        onClick={() => handleStatusToggle(status)}
                      >
                        {statusIcons[status]}
                        {status}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Unread Only Toggle */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="unread-only"
                    checked={unreadOnly}
                    onCheckedChange={(checked) => {
                      setUnreadOnly(checked);
                      setPage(1);
                    }}
                  />
                  <Label htmlFor="unread-only">Show unread only</Label>
                </div>
              </CardContent>
            </Card>

            {/* Notification List */}
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  {historyData?.total || 0} notifications found
                </CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : historyData?.notifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No notifications found</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {historyData?.notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 rounded-lg border ${
                            notification.status !== 'read' ? 'bg-accent/50' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="mt-1">
                                {channelIcons[notification.channel as NotificationChannel]}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{notification.title}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {notificationTypeLabels[notification.type as NotificationType] || notification.type}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {notification.content}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <span>
                                    {new Date(notification.sentAt).toLocaleString()}
                                  </span>
                                  <Badge className={statusColors[notification.status as DeliveryStatus]}>
                                    {statusIcons[notification.status as DeliveryStatus]}
                                    <span className="ml-1">{notification.status}</span>
                                  </Badge>
                                </div>
                                {notification.errorMessage && (
                                  <p className="text-xs text-red-500 mt-1">
                                    Error: {notification.errorMessage}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {notification.status !== 'read' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsReadMutation.mutate({ notificationId: notification.id })}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              {(notification.status === 'failed' || notification.status === 'bounced') && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => resendMutation.mutate({ notificationId: notification.id })}
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}

                {/* Pagination */}
                {historyData && historyData.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Page {historyData.page} of {historyData.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(historyData.totalPages, p + 1))}
                        disabled={page === historyData.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="space-y-4">
            {statsLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : statistics ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Total Sent</CardDescription>
                      <CardTitle className="text-3xl">{statistics.totalSent}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Delivered</CardDescription>
                      <CardTitle className="text-3xl text-green-600">{statistics.totalDelivered}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {statistics.deliveryRate.toFixed(1)}% delivery rate
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Failed</CardDescription>
                      <CardTitle className="text-3xl text-red-600">{statistics.totalFailed}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Read</CardDescription>
                      <CardTitle className="text-3xl text-blue-600">{statistics.totalRead}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {statistics.readRate.toFixed(1)}% read rate
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* By Type */}
                <Card>
                  <CardHeader>
                    <CardTitle>By Notification Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {Object.entries(statistics.byType).map(([type, count]) => (
                        <div key={type} className="text-center p-3 rounded-lg bg-accent/50">
                          <p className="text-2xl font-bold">{count}</p>
                          <p className="text-xs text-muted-foreground">
                            {notificationTypeLabels[type as NotificationType] || type}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* By Channel */}
                <Card>
                  <CardHeader>
                    <CardTitle>By Channel</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(statistics.byChannel).map(([channel, count]) => (
                        <div key={channel} className="flex items-center gap-3 p-4 rounded-lg bg-accent/50">
                          {channelIcons[channel as NotificationChannel]}
                          <div>
                            <p className="text-2xl font-bold">{count}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {channel.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle>7-Day Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {statistics.recentTrend.map((day) => (
                        <div key={day.date} className="flex items-center gap-4">
                          <span className="w-24 text-sm text-muted-foreground">{day.date}</span>
                          <div className="flex-1 flex items-center gap-2">
                            <div 
                              className="h-4 bg-blue-500 rounded"
                              style={{ width: `${Math.max(4, (day.sent / Math.max(...statistics.recentTrend.map(d => d.sent), 1)) * 100)}%` }}
                            />
                            <span className="text-sm">{day.sent} sent</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-green-600">{day.delivered} delivered</span>
                            {day.failed > 0 && (
                              <span className="text-red-600">{day.failed} failed</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-4">
            {prefsLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : preferences ? (
              <>
                {/* Channel Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Channels</CardTitle>
                    <CardDescription>
                      Choose how you want to receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5" />
                        <div>
                          <Label>Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications via email
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={preferences.emailEnabled}
                        onCheckedChange={(checked) =>
                          updatePreferencesMutation.mutate({ emailEnabled: checked })
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bell className="h-5 w-5" />
                        <div>
                          <Label>In-App Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Show notifications in the app
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={preferences.inAppEnabled}
                        onCheckedChange={(checked) =>
                          updatePreferencesMutation.mutate({ inAppEnabled: checked })
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5" />
                        <div>
                          <Label>SMS Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive text message alerts
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={preferences.smsEnabled}
                        onCheckedChange={(checked) =>
                          updatePreferencesMutation.mutate({ smsEnabled: checked })
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="h-5 w-5" />
                        <div>
                          <Label>Push Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Browser push notifications
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={preferences.pushEnabled}
                        onCheckedChange={(checked) =>
                          updatePreferencesMutation.mutate({ pushEnabled: checked })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Quiet Hours */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quiet Hours</CardTitle>
                    <CardDescription>
                      Set times when you don't want to receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={preferences.quietHoursStart || ''}
                          onChange={(e) =>
                            updatePreferencesMutation.mutate({
                              quietHoursStart: e.target.value || null,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={preferences.quietHoursEnd || ''}
                          onChange={(e) =>
                            updatePreferencesMutation.mutate({
                              quietHoursEnd: e.target.value || null,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="urgent-override"
                        checked={preferences.urgentOverrideQuietHours}
                        onCheckedChange={(checked) =>
                          updatePreferencesMutation.mutate({ urgentOverrideQuietHours: checked })
                        }
                      />
                      <Label htmlFor="urgent-override">
                        Allow urgent notifications during quiet hours
                      </Label>
                    </div>
                  </CardContent>
                </Card>

                {/* Digest Frequency */}
                <Card>
                  <CardHeader>
                    <CardTitle>Digest Frequency</CardTitle>
                    <CardDescription>
                      How often to receive summary digests
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Select
                      value={preferences.digestFrequency}
                      onValueChange={(value: 'daily' | 'weekly' | 'never') =>
                        updatePreferencesMutation.mutate({ digestFrequency: value })
                      }
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Excluded Types */}
                <Card>
                  <CardHeader>
                    <CardTitle>Excluded Notification Types</CardTitle>
                    <CardDescription>
                      Select notification types you don't want to receive
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {(notificationTypes || []).map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={`exclude-${type}`}
                            checked={preferences.excludedTypes.includes(type as NotificationType)}
                            onCheckedChange={(checked) => {
                              const newExcluded = checked
                                ? [...preferences.excludedTypes, type as NotificationType]
                                : preferences.excludedTypes.filter(t => t !== type);
                              updatePreferencesMutation.mutate({ excludedTypes: newExcluded });
                            }}
                          />
                          <Label htmlFor={`exclude-${type}`} className="text-sm">
                            {notificationTypeLabels[type as NotificationType] || type}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
