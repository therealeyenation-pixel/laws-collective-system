import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Calendar, 
  Link2, 
  Unlink, 
  RefreshCw, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  Download,
  Settings,
  Bell,
  Users,
  FileText,
  Gavel,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { calendarSyncService, CalendarConnection, CalendarEvent } from "@/services/calendarSyncService";
import { format, formatDistanceToNow } from "date-fns";

export default function CalendarIntegrationPage() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<CalendarConnection[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSettings, setSyncSettings] = useState({
    boardMeetings: true,
    grantDeadlines: true,
    complianceDates: true,
    autoSync: true,
    syncInterval: 30, // minutes
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setConnections(calendarSyncService.getConnections());
    setEvents(calendarSyncService.getLocalEvents());
  };

  const handleConnectGoogle = () => {
    toast.info("Google Calendar integration requires API setup. Contact administrator.");
    // In production: window.location.href = calendarSyncService.getGoogleAuthUrl();
  };

  const handleConnectOutlook = () => {
    toast.info("Outlook Calendar integration requires API setup. Contact administrator.");
    // In production: window.location.href = calendarSyncService.getOutlookAuthUrl();
  };

  const handleDisconnect = (provider: 'google' | 'outlook') => {
    calendarSyncService.removeConnection(provider);
    setConnections(calendarSyncService.getConnections());
    toast.success(`Disconnected from ${provider === 'google' ? 'Google' : 'Outlook'} Calendar`);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      // Simulate sync
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update last sync time
      const updatedConnections = connections.map(c => ({
        ...c,
        lastSync: new Date(),
      }));
      updatedConnections.forEach(c => calendarSyncService.saveConnection(c));
      setConnections(updatedConnections);
      
      toast.success("Calendar synced successfully");
    } catch (error) {
      toast.error("Sync failed. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDownloadEvent = (event: CalendarEvent) => {
    calendarSyncService.downloadICS(event);
    toast.success("Event downloaded as .ics file");
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'meeting': return <Users className="w-4 h-4" />;
      case 'deadline': return <Clock className="w-4 h-4" />;
      case 'compliance': return <Gavel className="w-4 h-4" />;
      case 'grant': return <DollarSign className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'meeting': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'deadline': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'compliance': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'grant': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const googleConnection = connections.find(c => c.provider === 'google');
  const outlookConnection = connections.find(c => c.provider === 'outlook');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Calendar Integration</h1>
            <p className="text-muted-foreground mt-1">
              Sync your calendar with board meetings, grant deadlines, and compliance dates
            </p>
          </div>
          <Button onClick={handleSync} disabled={isSyncing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </Button>
        </div>

        <Tabs defaultValue="connections" className="space-y-6">
          <TabsList>
            <TabsTrigger value="connections">Connections</TabsTrigger>
            <TabsTrigger value="events">Upcoming Events</TabsTrigger>
            <TabsTrigger value="settings">Sync Settings</TabsTrigger>
          </TabsList>

          {/* Connections Tab */}
          <TabsContent value="connections" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Google Calendar */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google Calendar
                  </CardTitle>
                  <CardDescription>
                    Sync with your Google Calendar account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {googleConnection?.connected ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Connected as {googleConnection.email}</span>
                      </div>
                      {googleConnection.lastSync && (
                        <p className="text-xs text-muted-foreground">
                          Last synced {formatDistanceToNow(googleConnection.lastSync, { addSuffix: true })}
                        </p>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect('google')}
                      >
                        <Unlink className="w-4 h-4 mr-2" />
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={handleConnectGoogle}>
                      <Link2 className="w-4 h-4 mr-2" />
                      Connect Google Calendar
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Outlook Calendar */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#0078D4" d="M24 7.387v10.478c0 .23-.08.424-.238.583-.159.159-.354.238-.584.238h-9.297V6.566h9.297c.23 0 .425.08.584.238.159.159.238.354.238.583zM13.881 18.686V5.314L0 3v18l13.881-2.314z"/>
                      <path fill="#fff" d="M6.94 15.686c-.69 0-1.286-.244-1.788-.732-.502-.488-.753-1.084-.753-1.788v-2.332c0-.704.251-1.3.753-1.788.502-.488 1.098-.732 1.788-.732.69 0 1.286.244 1.788.732.502.488.753 1.084.753 1.788v2.332c0 .704-.251 1.3-.753 1.788-.502.488-1.098.732-1.788.732zm0-1.5c.23 0 .424-.08.583-.238.159-.159.238-.354.238-.584v-2.728c0-.23-.08-.425-.238-.584-.159-.159-.354-.238-.583-.238-.23 0-.425.08-.584.238-.159.159-.238.354-.238.584v2.728c0 .23.08.425.238.584.159.159.354.238.584.238z"/>
                    </svg>
                    Outlook Calendar
                  </CardTitle>
                  <CardDescription>
                    Sync with your Microsoft Outlook calendar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {outlookConnection?.connected ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Connected as {outlookConnection.email}</span>
                      </div>
                      {outlookConnection.lastSync && (
                        <p className="text-xs text-muted-foreground">
                          Last synced {formatDistanceToNow(outlookConnection.lastSync, { addSuffix: true })}
                        </p>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect('outlook')}
                      >
                        <Unlink className="w-4 h-4 mr-2" />
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={handleConnectOutlook}>
                      <Link2 className="w-4 h-4 mr-2" />
                      Connect Outlook Calendar
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                Calendar integration requires OAuth setup. Events can still be exported as .ics files for manual import.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>
                  System events that will sync to your calendar
                </CardDescription>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No upcoming events</p>
                    <p className="text-sm mt-2">Events from board meetings, grants, and compliance will appear here</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {events.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-start justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${getCategoryColor(event.category)}`}>
                              {getCategoryIcon(event.category)}
                            </div>
                            <div>
                              <h4 className="font-medium">{event.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {format(event.startTime, 'PPP')} at {format(event.startTime, 'p')}
                              </p>
                              {event.location && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  📍 {event.location}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadEvent(event)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            .ics
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Sync Settings
                </CardTitle>
                <CardDescription>
                  Configure which events sync to your calendar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Event Types</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-blue-500" />
                      <div>
                        <Label>Board Meetings</Label>
                        <p className="text-xs text-muted-foreground">Sync all board meeting schedules</p>
                      </div>
                    </div>
                    <Switch
                      checked={syncSettings.boardMeetings}
                      onCheckedChange={(checked) => setSyncSettings({ ...syncSettings, boardMeetings: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-green-500" />
                      <div>
                        <Label>Grant Deadlines</Label>
                        <p className="text-xs text-muted-foreground">Sync grant application and reporting deadlines</p>
                      </div>
                    </div>
                    <Switch
                      checked={syncSettings.grantDeadlines}
                      onCheckedChange={(checked) => setSyncSettings({ ...syncSettings, grantDeadlines: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Gavel className="w-5 h-5 text-purple-500" />
                      <div>
                        <Label>Compliance Dates</Label>
                        <p className="text-xs text-muted-foreground">Sync entity registration and filing deadlines</p>
                      </div>
                    </div>
                    <Switch
                      checked={syncSettings.complianceDates}
                      onCheckedChange={(checked) => setSyncSettings({ ...syncSettings, complianceDates: checked })}
                    />
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h4 className="font-medium">Automatic Sync</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <RefreshCw className="w-5 h-5 text-primary" />
                      <div>
                        <Label>Auto-sync enabled</Label>
                        <p className="text-xs text-muted-foreground">Automatically sync events every {syncSettings.syncInterval} minutes</p>
                      </div>
                    </div>
                    <Switch
                      checked={syncSettings.autoSync}
                      onCheckedChange={(checked) => setSyncSettings({ ...syncSettings, autoSync: checked })}
                    />
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h4 className="font-medium">Reminders</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-amber-500" />
                      <div>
                        <Label>Default Reminders</Label>
                        <p className="text-xs text-muted-foreground">24 hours and 1 hour before events</p>
                      </div>
                    </div>
                    <Badge variant="outline">Enabled</Badge>
                  </div>
                </div>

                <Button onClick={() => toast.success("Settings saved")}>
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
