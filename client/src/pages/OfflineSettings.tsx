import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WifiOff, Wifi, RefreshCw, Trash2, FileText, Clock, AlertTriangle, CheckCircle, HardDrive, CloudOff } from "lucide-react";
import { toast } from "sonner";
import { offlineModeService, SyncStatus, CachedDocument, PendingAction, ConflictResolution } from "@/services/offlineModeService";
import { format } from "date-fns";

export default function OfflineSettingsPage() {
  const [status, setStatus] = useState<SyncStatus>(offlineModeService.getSyncStatus());
  const [cachedDocs, setCachedDocs] = useState<CachedDocument[]>([]);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [conflicts, setConflicts] = useState<ConflictResolution[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoSync, setAutoSync] = useState(true);

  useEffect(() => {
    loadData();
    const unsubscribe = offlineModeService.onStatusChange(setStatus);
    return () => unsubscribe();
  }, []);

  const loadData = () => {
    setStatus(offlineModeService.getSyncStatus());
    setCachedDocs(offlineModeService.getCachedDocuments());
    setPendingActions(offlineModeService.getPendingActions());
    setConflicts(offlineModeService.getConflicts());
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await offlineModeService.syncPendingActions();
      toast.success(`Synced ${result.synced} actions, ${result.failed} failed`);
      loadData();
    } catch (error) {
      toast.error("Sync failed");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearCache = async () => {
    await offlineModeService.clearAllData();
    loadData();
    toast.success("Offline cache cleared");
  };

  const handleRemoveDoc = async (id: string) => {
    await offlineModeService.removeCachedDocument(id);
    loadData();
    toast.success("Document removed from cache");
  };

  const handleResolveConflict = (id: string, resolution: 'local' | 'server') => {
    offlineModeService.resolveConflict(id, resolution);
    loadData();
    toast.success("Conflict resolved");
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const storagePercent = (status.storageUsed / status.storageLimit) * 100;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              {status.isOnline ? <Wifi className="w-8 h-8 text-green-500" /> : <WifiOff className="w-8 h-8 text-amber-500" />}
              Offline Mode
            </h1>
            <p className="text-muted-foreground mt-1">Manage offline data and sync settings</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleClearCache}><Trash2 className="w-4 h-4 mr-2" />Clear Cache</Button>
            <Button onClick={handleSync} disabled={isSyncing || !status.isOnline}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync Now
            </Button>
          </div>
        </div>

        {/* Status Card */}
        <Card className={`border-2 ${status.isOnline ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20' : 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {status.isOnline ? <CheckCircle className="w-8 h-8 text-green-500" /> : <CloudOff className="w-8 h-8 text-amber-500" />}
                <div>
                  <h2 className="text-2xl font-bold">{status.isOnline ? 'Online' : 'Offline'}</h2>
                  <p className="text-sm text-muted-foreground">{status.isOnline ? 'All changes syncing automatically' : 'Changes will sync when back online'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label>Auto-sync</Label>
                <Switch checked={autoSync} onCheckedChange={setAutoSync} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><FileText className="w-5 h-5 text-blue-600" /></div><div><p className="text-2xl font-bold">{status.cachedDocuments}</p><p className="text-xs text-muted-foreground">Cached Docs</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg"><Clock className="w-5 h-5 text-amber-600" /></div><div><p className="text-2xl font-bold">{status.pendingActions}</p><p className="text-xs text-muted-foreground">Pending</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-600" /></div><div><p className="text-2xl font-bold">{conflicts.length}</p><p className="text-xs text-muted-foreground">Conflicts</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg"><HardDrive className="w-5 h-5 text-purple-600" /></div><div><p className="text-2xl font-bold">{formatBytes(status.storageUsed)}</p><p className="text-xs text-muted-foreground">Storage Used</p></div></div></CardContent></Card>
        </div>

        {/* Storage Progress */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-lg">Storage Usage</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span>{formatBytes(status.storageUsed)}</span><span>{formatBytes(status.storageLimit)}</span></div>
              <Progress value={storagePercent} />
              <p className="text-xs text-muted-foreground text-right">{storagePercent.toFixed(1)}% used</p>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="cached" className="space-y-4">
          <TabsList>
            <TabsTrigger value="cached"><FileText className="w-4 h-4 mr-2" />Cached Documents</TabsTrigger>
            <TabsTrigger value="pending"><Clock className="w-4 h-4 mr-2" />Pending Actions</TabsTrigger>
            <TabsTrigger value="conflicts"><AlertTriangle className="w-4 h-4 mr-2" />Conflicts</TabsTrigger>
          </TabsList>

          <TabsContent value="cached">
            <Card>
              <CardHeader><CardTitle>Cached Documents</CardTitle><CardDescription>Documents available offline</CardDescription></CardHeader>
              <CardContent>
                {cachedDocs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground"><FileText className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>No documents cached</p></div>
                ) : (
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {cachedDocs.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{doc.title}</p>
                              <p className="text-xs text-muted-foreground">{formatBytes(doc.size)} • Cached {format(doc.cachedAt, 'MMM d')}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => handleRemoveDoc(doc.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card>
              <CardHeader><CardTitle>Pending Actions</CardTitle><CardDescription>Changes waiting to sync</CardDescription></CardHeader>
              <CardContent>
                {pendingActions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground"><CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" /><p>All changes synced</p></div>
                ) : (
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {pendingActions.map((action) => (
                        <div key={action.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant={action.type === 'create' ? 'default' : action.type === 'update' ? 'secondary' : 'destructive'}>{action.type}</Badge>
                              <span className="font-medium">{action.entity}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Created {format(action.createdAt, 'MMM d, h:mm a')} • Retries: {action.retryCount}</p>
                            {action.lastError && <p className="text-xs text-red-500 mt-1">{action.lastError}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conflicts">
            <Card>
              <CardHeader><CardTitle>Sync Conflicts</CardTitle><CardDescription>Resolve data conflicts</CardDescription></CardHeader>
              <CardContent>
                {conflicts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground"><CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" /><p>No conflicts</p></div>
                ) : (
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {conflicts.map((conflict) => (
                        <div key={conflict.id} className="p-4 border border-amber-200 rounded-lg bg-amber-50/50 dark:bg-amber-950/20">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /><span className="font-medium">{conflict.entity}</span><Badge variant="outline">{conflict.conflictType}</Badge></div>
                              <p className="text-xs text-muted-foreground mt-1">Detected {format(conflict.detectedAt, 'MMM d, h:mm a')}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleResolveConflict(conflict.id, 'local')}>Keep Local</Button>
                              <Button size="sm" onClick={() => handleResolveConflict(conflict.id, 'server')}>Use Server</Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
