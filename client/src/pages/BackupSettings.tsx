import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Archive, Clock, Download, Play, Plus, Settings, Trash2, CheckCircle, XCircle, RefreshCw, Calendar, HardDrive, Cloud } from "lucide-react";
import { toast } from "sonner";
import { backupSchedulerService, BackupConfig, BackupRecord, BackupStats } from "@/services/backupSchedulerService";
import { format } from "date-fns";

export default function BackupSettingsPage() {
  const [configs, setConfigs] = useState<BackupConfig[]>([]);
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [isRunning, setIsRunning] = useState<string | null>(null);
  const [showNewConfig, setShowNewConfig] = useState(false);
  const [newConfig, setNewConfig] = useState({
    name: '',
    schedule: 'daily' as const,
    time: '02:00',
    retention: 7,
    includeDatabase: true,
    includeFiles: true,
    includeSettings: true,
    destination: 's3' as const,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setConfigs(backupSchedulerService.getConfigs());
    setBackups(backupSchedulerService.getBackups(20));
    setStats(backupSchedulerService.getStats());
  };

  const handleRunBackup = async (configId: string) => {
    setIsRunning(configId);
    try {
      await backupSchedulerService.runBackup(configId);
      toast.success("Backup completed successfully");
      loadData();
    } catch (error) {
      toast.error("Backup failed");
    } finally {
      setIsRunning(null);
    }
  };

  const handleToggleConfig = (configId: string, enabled: boolean) => {
    backupSchedulerService.updateConfig(configId, { enabled });
    loadData();
    toast.success(enabled ? "Backup schedule enabled" : "Backup schedule disabled");
  };

  const handleDeleteConfig = (configId: string) => {
    backupSchedulerService.deleteConfig(configId);
    loadData();
    toast.success("Backup configuration deleted");
  };

  const handleCreateConfig = () => {
    if (!newConfig.name) {
      toast.error("Please enter a name");
      return;
    }
    backupSchedulerService.createConfig({ ...newConfig, enabled: true });
    setShowNewConfig(false);
    setNewConfig({ name: '', schedule: 'daily', time: '02:00', retention: 7, includeDatabase: true, includeFiles: true, includeSettings: true, destination: 's3' });
    loadData();
    toast.success("Backup configuration created");
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const getScheduleLabel = (config: BackupConfig) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    if (config.schedule === 'daily') return `Daily at ${config.time}`;
    if (config.schedule === 'weekly') return `Weekly on ${days[config.dayOfWeek || 0]} at ${config.time}`;
    if (config.schedule === 'monthly') return `Monthly on day ${config.dayOfMonth || 1} at ${config.time}`;
    return 'Manual';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3"><Archive className="w-8 h-8 text-primary" />Backup Settings</h1>
            <p className="text-muted-foreground mt-1">Configure automated backups and manage history</p>
          </div>
          <Dialog open={showNewConfig} onOpenChange={setShowNewConfig}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Schedule</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Backup Schedule</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2"><Label>Name</Label><Input value={newConfig.name} onChange={(e) => setNewConfig({ ...newConfig, name: e.target.value })} placeholder="Daily Backup" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Schedule</Label><Select value={newConfig.schedule} onValueChange={(v: any) => setNewConfig({ ...newConfig, schedule: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="monthly">Monthly</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><Label>Time</Label><Input type="time" value={newConfig.time} onChange={(e) => setNewConfig({ ...newConfig, time: e.target.value })} /></div>
                </div>
                <div className="space-y-2"><Label>Retention (days)</Label><Input type="number" value={newConfig.retention} onChange={(e) => setNewConfig({ ...newConfig, retention: parseInt(e.target.value) })} min={1} /></div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setShowNewConfig(false)}>Cancel</Button><Button onClick={handleCreateConfig}>Create</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><Archive className="w-5 h-5 text-blue-600" /></div><div><p className="text-2xl font-bold">{stats.totalBackups}</p><p className="text-xs text-muted-foreground">Total</p></div></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div><div><p className="text-2xl font-bold">{stats.successfulBackups}</p><p className="text-xs text-muted-foreground">Successful</p></div></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg"><HardDrive className="w-5 h-5 text-purple-600" /></div><div><p className="text-2xl font-bold">{formatBytes(stats.totalSize)}</p><p className="text-xs text-muted-foreground">Total Size</p></div></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg"><Calendar className="w-5 h-5 text-amber-600" /></div><div><p className="text-2xl font-bold">{stats.nextScheduled ? format(stats.nextScheduled, 'MMM d') : 'None'}</p><p className="text-xs text-muted-foreground">Next</p></div></div></CardContent></Card>
          </div>
        )}

        <Tabs defaultValue="schedules" className="space-y-4">
          <TabsList><TabsTrigger value="schedules"><Settings className="w-4 h-4 mr-2" />Schedules</TabsTrigger><TabsTrigger value="history"><Clock className="w-4 h-4 mr-2" />History</TabsTrigger></TabsList>

          <TabsContent value="schedules">
            <div className="space-y-4">
              {configs.map((config) => (
                <Card key={config.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${config.enabled ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100'}`}><Cloud className={`w-6 h-6 ${config.enabled ? 'text-green-600' : 'text-gray-400'}`} /></div>
                        <div>
                          <div className="flex items-center gap-2"><h3 className="font-semibold">{config.name}</h3>{config.enabled ? <Badge className="bg-green-100 text-green-800">Active</Badge> : <Badge variant="outline">Disabled</Badge>}</div>
                          <p className="text-sm text-muted-foreground mt-1">{getScheduleLabel(config)}</p>
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground"><span>Retention: {config.retention}d</span>{config.lastRun && <span>Last: {format(config.lastRun, 'MMM d')}</span>}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch checked={config.enabled} onCheckedChange={(c) => handleToggleConfig(config.id, c)} />
                        <Button variant="outline" size="sm" onClick={() => handleRunBackup(config.id)} disabled={isRunning === config.id}>{isRunning === config.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}</Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteConfig(config.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader><CardTitle>Backup History</CardTitle></CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {backups.map((backup) => (
                      <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          {backup.status === 'completed' ? <CheckCircle className="w-5 h-5 text-green-500" /> : backup.status === 'failed' ? <XCircle className="w-5 h-5 text-red-500" /> : <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />}
                          <div><p className="font-medium">{format(backup.timestamp, 'MMM d, yyyy h:mm a')}</p><p className="text-sm text-muted-foreground">{formatBytes(backup.size)} • {backup.duration}s</p></div>
                        </div>
                        {backup.status === 'completed' && <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Download</Button>}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
