import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Database, Download, Upload, Clock, Shield, CheckCircle, XCircle,
  AlertTriangle, Play, Pause, Trash2, RefreshCw, HardDrive, Calendar,
  Lock, Archive, Settings, History, RotateCcw, FileCheck, Plus
} from "lucide-react";
import {
  backupRestoreService,
  BackupConfig,
  BackupRecord,
  RestorePoint,
  BackupStats,
  BACKUP_MODULES,
} from "@/services/backupRestoreService";

export default function BackupRestore() {
  const [activeTab, setActiveTab] = useState("overview");
  const [configs, setConfigs] = useState<BackupConfig[]>([]);
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [restorePoints, setRestorePoints] = useState<RestorePoint[]>([]);
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [backupInProgress, setBackupInProgress] = useState<string | null>(null);
  const [restoreInProgress, setRestoreInProgress] = useState(false);

  // New config form state
  const [newConfig, setNewConfig] = useState<Partial<BackupConfig>>({
    name: '',
    type: 'full',
    schedule: 'daily',
    scheduledTime: '02:00',
    encryption: true,
    compression: true,
    retentionDays: 30,
    includedModules: BACKUP_MODULES.map(m => m.id),
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setConfigs(backupRestoreService.getConfigs());
    setBackups(backupRestoreService.getBackups());
    setRestorePoints(backupRestoreService.getRestorePoints());
    setStats(backupRestoreService.getStats());
    setLoading(false);
  };

  const handleStartBackup = async (configId: string) => {
    setBackupInProgress(configId);
    try {
      await backupRestoreService.startBackup(configId);
      toast.success("Backup started successfully");
      
      // Poll for completion
      const interval = setInterval(() => {
        const updatedBackups = backupRestoreService.getBackups();
        setBackups(updatedBackups);
        const latest = updatedBackups.find(b => b.configId === configId);
        if (latest && latest.status !== 'in_progress') {
          clearInterval(interval);
          setBackupInProgress(null);
          setStats(backupRestoreService.getStats());
          setRestorePoints(backupRestoreService.getRestorePoints());
          if (latest.status === 'completed') {
            toast.success("Backup completed successfully");
          }
        }
      }, 1000);
    } catch (error) {
      toast.error("Failed to start backup");
      setBackupInProgress(null);
    }
  };

  const handleVerifyBackup = async (backupId: string) => {
    try {
      const result = await backupRestoreService.verifyBackup(backupId);
      if (result.valid) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
      loadData();
    } catch (error) {
      toast.error("Verification failed");
    }
  };

  const handleDeleteBackup = (backupId: string) => {
    if (backupRestoreService.deleteBackup(backupId)) {
      toast.success("Backup deleted");
      loadData();
    }
  };

  const handleStartRestore = async () => {
    if (!selectedBackup) return;
    
    setRestoreInProgress(true);
    try {
      await backupRestoreService.startRestore(selectedBackup);
      toast.success("Restore started - this may take several minutes");
      setShowRestoreDialog(false);
      
      // Poll for completion
      const interval = setInterval(() => {
        const jobs = backupRestoreService.getRestoreJobs();
        const latest = jobs[0];
        if (latest && latest.status !== 'in_progress') {
          clearInterval(interval);
          setRestoreInProgress(false);
          if (latest.status === 'completed') {
            toast.success(`Restore completed - ${latest.recordsRestored.toLocaleString()} records restored`);
          }
        }
      }, 1000);
    } catch (error) {
      toast.error("Failed to start restore");
      setRestoreInProgress(false);
    }
  };

  const handleSaveConfig = () => {
    backupRestoreService.saveConfig(newConfig);
    toast.success("Backup configuration saved");
    setShowConfigDialog(false);
    setNewConfig({
      name: '',
      type: 'full',
      schedule: 'daily',
      scheduledTime: '02:00',
      encryption: true,
      compression: true,
      retentionDays: 30,
      includedModules: BACKUP_MODULES.map(m => m.id),
      isActive: true,
    });
    loadData();
  };

  const handleToggleConfig = (configId: string) => {
    backupRestoreService.toggleConfig(configId);
    loadData();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
      pending: { variant: "secondary", icon: <Clock className="w-3 h-3" /> },
      in_progress: { variant: "default", icon: <RefreshCw className="w-3 h-3 animate-spin" /> },
      completed: { variant: "outline", icon: <CheckCircle className="w-3 h-3 text-green-500" /> },
      verified: { variant: "outline", icon: <Shield className="w-3 h-3 text-blue-500" /> },
      failed: { variant: "destructive", icon: <XCircle className="w-3 h-3" /> },
      rolled_back: { variant: "secondary", icon: <RotateCcw className="w-3 h-3" /> },
    };
    
    const config = variants[status] || variants.pending;
    return (
      <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Backup & Restore</h1>
            <p className="text-muted-foreground mt-1">
              Manage data backups and restore points for disaster recovery
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Schedule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create Backup Schedule</DialogTitle>
                  <DialogDescription>
                    Configure a new automated backup schedule
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={newConfig.name}
                      onChange={(e) => setNewConfig({ ...newConfig, name: e.target.value })}
                      placeholder="Daily Production Backup"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={newConfig.type}
                        onValueChange={(v) => setNewConfig({ ...newConfig, type: v as 'full' | 'incremental' })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">Full Backup</SelectItem>
                          <SelectItem value="incremental">Incremental</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Schedule</Label>
                      <Select
                        value={newConfig.schedule}
                        onValueChange={(v) => setNewConfig({ ...newConfig, schedule: v as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual Only</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Input
                        type="time"
                        value={newConfig.scheduledTime}
                        onChange={(e) => setNewConfig({ ...newConfig, scheduledTime: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Retention (days)</Label>
                      <Input
                        type="number"
                        value={newConfig.retentionDays}
                        onChange={(e) => setNewConfig({ ...newConfig, retentionDays: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={newConfig.encryption}
                        onCheckedChange={(c) => setNewConfig({ ...newConfig, encryption: !!c })}
                      />
                      <Label className="cursor-pointer">Encrypt</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={newConfig.compression}
                        onCheckedChange={(c) => setNewConfig({ ...newConfig, compression: !!c })}
                      />
                      <Label className="cursor-pointer">Compress</Label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveConfig}>Create Schedule</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Database className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Backups</p>
                    <p className="text-2xl font-bold">{stats.totalBackups}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Successful</p>
                    <p className="text-2xl font-bold">{stats.successfulBackups}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <HardDrive className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Storage Used</p>
                    <p className="text-2xl font-bold">{backupRestoreService.formatBytes(stats.totalStorageUsed)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Backup</p>
                    <p className="text-lg font-bold">
                      {stats.lastBackupAt 
                        ? new Date(stats.lastBackupAt).toLocaleDateString()
                        : 'Never'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview" className="gap-2">
              <Database className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="schedules" className="gap-2">
              <Calendar className="w-4 h-4" />
              Schedules
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="restore" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Restore
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                  <CardDescription>Run backups manually or verify existing ones</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {configs.filter(c => c.isActive).slice(0, 3).map(config => (
                    <div key={config.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Archive className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{config.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {config.type} • {config.schedule}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleStartBackup(config.id)}
                        disabled={backupInProgress === config.id}
                      >
                        {backupInProgress === config.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Backups */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Backups</CardTitle>
                  <CardDescription>Latest backup operations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {backups.slice(0, 4).map(backup => (
                    <div key={backup.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <p className="font-medium text-sm">{backup.configName}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(backup.startedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {backupRestoreService.formatBytes(backup.size)}
                        </span>
                        {getStatusBadge(backup.status)}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Modules Coverage */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Backup Coverage</CardTitle>
                <CardDescription>Modules included in active backup schedules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {BACKUP_MODULES.map(module => {
                    const isIncluded = configs.some(c => c.isActive && c.includedModules.includes(module.id));
                    return (
                      <div
                        key={module.id}
                        className={`p-3 rounded-lg border ${
                          isIncluded 
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                            : 'bg-muted/30 border-muted'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isIncluded ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className="text-sm font-medium">{module.name}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedules Tab */}
          <TabsContent value="schedules" className="space-y-4">
            {configs.map(config => (
              <Card key={config.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${config.isActive ? 'bg-green-100 dark:bg-green-900/30' : 'bg-muted'}`}>
                        <Archive className={`w-6 h-6 ${config.isActive ? 'text-green-600' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{config.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Database className="w-3 h-3" />
                            {config.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {config.schedule} {config.scheduledTime && `@ ${config.scheduledTime}`}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {config.retentionDays} days retention
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {config.encryption && (
                          <Badge variant="outline" className="gap-1">
                            <Lock className="w-3 h-3" />
                            Encrypted
                          </Badge>
                        )}
                        {config.compression && (
                          <Badge variant="outline" className="gap-1">
                            <Archive className="w-3 h-3" />
                            Compressed
                          </Badge>
                        )}
                      </div>
                      <Switch
                        checked={config.isActive}
                        onCheckedChange={() => handleToggleConfig(config.id)}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleStartBackup(config.id)}
                        disabled={backupInProgress === config.id}
                      >
                        {backupInProgress === config.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-1" />
                            Run Now
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  {config.lastRun && (
                    <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Last run: {new Date(config.lastRun).toLocaleString()}
                      </span>
                      {config.nextRun && config.isActive && (
                        <span className="text-muted-foreground">
                          Next run: {new Date(config.nextRun).toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Backup History</CardTitle>
                <CardDescription>Complete history of all backup operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {backups.map(backup => (
                    <div key={backup.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          backup.status === 'verified' ? 'bg-blue-100 dark:bg-blue-900/30' :
                          backup.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' :
                          backup.status === 'failed' ? 'bg-red-100 dark:bg-red-900/30' :
                          'bg-muted'
                        }`}>
                          {backup.status === 'verified' ? <Shield className="w-5 h-5 text-blue-600" /> :
                           backup.status === 'completed' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                           backup.status === 'failed' ? <XCircle className="w-5 h-5 text-red-600" /> :
                           <RefreshCw className="w-5 h-5 animate-spin" />}
                        </div>
                        <div>
                          <p className="font-medium">{backup.configName}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(backup.startedAt).toLocaleString()}
                            {backup.completedAt && ` • ${backupRestoreService.formatDuration(backup.completedAt - backup.startedAt)}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">{backupRestoreService.formatBytes(backup.size)}</p>
                          <p className="text-sm text-muted-foreground">{backup.recordCount.toLocaleString()} records</p>
                        </div>
                        {getStatusBadge(backup.status)}
                        <div className="flex gap-1">
                          {backup.status === 'completed' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleVerifyBackup(backup.id)}
                            >
                              <FileCheck className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteBackup(backup.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Restore Tab */}
          <TabsContent value="restore" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Available Restore Points</CardTitle>
                <CardDescription>Select a backup to restore your system to a previous state</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {restorePoints.map(point => (
                    <div key={point.backupId} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <RotateCcw className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{point.backupName}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(point.createdAt).toLocaleString()}
                          </p>
                          {point.restoreWarnings && point.restoreWarnings.length > 0 && (
                            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {point.restoreWarnings[0]}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">{backupRestoreService.formatBytes(point.size)}</p>
                          <p className="text-sm text-muted-foreground">{point.recordCount.toLocaleString()} records</p>
                        </div>
                        <Dialog open={showRestoreDialog && selectedBackup === point.backupId} onOpenChange={(open) => {
                          setShowRestoreDialog(open);
                          if (!open) setSelectedBackup(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              onClick={() => setSelectedBackup(point.backupId)}
                              disabled={!point.canRestore}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Restore
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirm Restore</DialogTitle>
                              <DialogDescription>
                                This will restore your system to the state from {new Date(point.createdAt).toLocaleString()}.
                                This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                <div className="flex items-start gap-3">
                                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                                  <div>
                                    <p className="font-medium text-amber-800 dark:text-amber-200">Warning</p>
                                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                      All data created after this backup will be lost. Make sure you have a current backup before proceeding.
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-4">
                                <p className="text-sm font-medium mb-2">Modules to restore:</p>
                                <div className="flex flex-wrap gap-2">
                                  {point.modules.map(m => (
                                    <Badge key={m} variant="secondary">{m}</Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={handleStartRestore}
                                disabled={restoreInProgress}
                              >
                                {restoreInProgress ? (
                                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                  <RotateCcw className="w-4 h-4 mr-2" />
                                )}
                                Confirm Restore
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
