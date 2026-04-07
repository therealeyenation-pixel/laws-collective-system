import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Smartphone, Apple, Download, Zap, CheckCircle, Trash2, Wifi, WifiOff, Bell, Clock } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Device {
  id: string;
  name: string;
  platform: 'iOS' | 'Android' | 'Web';
  version: string;
  lastSync: number;
  status: 'active' | 'inactive';
  osVersion: string;
  appVersion: string;
  pushEnabled: boolean;
}

interface NotificationPreference {
  category: string;
  enabled: boolean;
  criticalOnly: boolean;
  quietHours: { start: string; end: string } | null;
}

export default function MobileIntegration() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([
    { id: '1', name: "iPhone 15 Pro", platform: "iOS", version: "17.2", lastSync: Date.now() - 7200000, status: "active", osVersion: "17.2.1", appVersion: "2.5.1", pushEnabled: true },
    { id: '2', name: "Samsung Galaxy S24", platform: "Android", version: "14", lastSync: Date.now() - 300000, status: "active", osVersion: "14.0.1", appVersion: "2.5.0", pushEnabled: true },
    { id: '3', name: "iPad Air", platform: "iOS", version: "17.1", lastSync: Date.now() - 86400000, status: "inactive", osVersion: "17.1.2", appVersion: "2.5.0", pushEnabled: false },
  ]);

  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreference[]>([
    { category: "Critical Alerts", enabled: true, criticalOnly: false, quietHours: null },
    { category: "System Updates", enabled: true, criticalOnly: false, quietHours: { start: "22:00", end: "07:00" } },
    { category: "Broadcast Notifications", enabled: true, criticalOnly: false, quietHours: { start: "22:00", end: "07:00" } },
    { category: "Conference Invites", enabled: true, criticalOnly: false, quietHours: null },
  ]);

  // Fetch devices from backend
  const { data: backendDevices } = trpc.system.getDevices.useQuery(
    { userId: user?.id || '' },
    { enabled: !!user?.id, refetchInterval: 60000 }
  );

  // Register device mutation
  const registerDeviceMutation = trpc.system.registerDevice.useMutation({
    onSuccess: () => toast.success('Device registered successfully'),
    onError: () => toast.error('Failed to register device'),
  });

  // Update notification preferences mutation
  const updatePrefsMutation = trpc.system.updateNotificationPreferences.useMutation({
    onSuccess: () => toast.success('Preferences updated'),
    onError: () => toast.error('Failed to update preferences'),
  });

  const appVersions = [
    { platform: "iOS", version: "2.5.1", released: "2024-04-05", status: "latest", downloads: "125K" },
    { platform: "Android", version: "2.5.0", released: "2024-04-03", status: "latest", downloads: "89K" },
    { platform: "Web", version: "3.0.0", released: "2024-04-06", status: "latest", downloads: "N/A" },
  ];

  const handleRemoveDevice = (id: string) => {
    setDevices(devices.filter(d => d.id !== id));
    toast.success('Device removed');
  };

  const handleTogglePushNotifications = (id: string) => {
    setDevices(devices.map(d => d.id === id ? { ...d, pushEnabled: !d.pushEnabled } : d));
  };

  const handleUpdatePreference = (index: number, updates: Partial<NotificationPreference>) => {
    const newPrefs = [...notificationPrefs];
    newPrefs[index] = { ...newPrefs[index], ...updates };
    setNotificationPrefs(newPrefs);
    updatePrefsMutation.mutate({
      userId: user?.id || '',
      preferences: newPrefs,
    });
  };

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-200"
      : "bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-200";
  };

  const getLastSyncText = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Mobile Integration</h1>
          <p className="text-muted-foreground mt-2">Manage mobile devices, apps, and push notifications</p>
        </div>

        {/* Download Apps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
            <div className="flex items-center gap-3 mb-4">
              <Apple className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="font-bold">iOS App</h3>
                <p className="text-sm text-muted-foreground">v2.5.1</p>
              </div>
            </div>
            <Button className="w-full" onClick={() => window.open('https://apps.apple.com', '_blank')}>
              <Download className="w-4 h-4 mr-2" />
              App Store
            </Button>
            <p className="text-xs text-muted-foreground mt-2">125K downloads</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <div className="flex items-center gap-3 mb-4">
              <Smartphone className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="font-bold">Android App</h3>
                <p className="text-sm text-muted-foreground">v2.5.0</p>
              </div>
            </div>
            <Button className="w-full" onClick={() => window.open('https://play.google.com', '_blank')}>
              <Download className="w-4 h-4 mr-2" />
              Play Store
            </Button>
            <p className="text-xs text-muted-foreground mt-2">89K downloads</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-8 h-8 text-purple-600" />
              <div>
                <h3 className="font-bold">Web App</h3>
                <p className="text-sm text-muted-foreground">v3.0.0</p>
              </div>
            </div>
            <Button className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Open Web
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Always available</p>
          </Card>
        </div>

        {/* Connected Devices */}
        <Card className="p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Connected Devices ({devices.length})</h2>
            <span className="text-sm text-muted-foreground">{devices.filter(d => d.status === 'active').length} active</span>
          </div>
          <div className="space-y-3">
            {devices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-2 rounded-lg ${device.status === 'active' ? 'bg-green-100 dark:bg-green-950/30' : 'bg-gray-100 dark:bg-gray-950/30'}`}>
                    {device.platform === 'iOS' ? (
                      <Apple className="w-6 h-6 text-blue-600" />
                    ) : device.platform === 'Android' ? (
                      <Smartphone className="w-6 h-6 text-green-600" />
                    ) : (
                      <Zap className="w-6 h-6 text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{device.name}</h3>
                    <p className="text-sm text-muted-foreground">{device.platform} {device.osVersion} • App v{device.appVersion}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {device.status === 'active' ? (
                        <><Wifi className="w-3 h-3 text-green-600" /><span className="text-xs text-green-600">Synced {getLastSyncText(device.lastSync)}</span></>
                      ) : (
                        <><WifiOff className="w-3 h-3 text-gray-500" /><span className="text-xs text-gray-500">Last sync {getLastSyncText(device.lastSync)}</span></>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleTogglePushNotifications(device.id)}
                      className={device.pushEnabled ? 'text-green-600' : 'text-gray-500'}
                    >
                      <Bell className="w-4 h-4" />
                    </Button>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(device.status)}`}>
                    {device.status}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDevice(device.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Notification Preferences */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Notification Preferences</h2>
          <div className="space-y-3">
            {notificationPrefs.map((pref, idx) => (
              <div key={idx} className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={pref.enabled}
                      onChange={(e) => handleUpdatePreference(idx, { enabled: e.target.checked })}
                      className="w-5 h-5 rounded"
                    />
                    <h3 className="font-semibold">{pref.category}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {pref.quietHours && (
                      <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-950/30 px-2 py-1 rounded flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {pref.quietHours.start} - {pref.quietHours.end}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 ml-8">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={pref.criticalOnly}
                      onChange={(e) => handleUpdatePreference(idx, { criticalOnly: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    Critical only
                  </label>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* App Versions */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">App Versions</h2>
          <div className="space-y-3">
            {appVersions.map((app, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <h3 className="font-semibold">{app.platform}</h3>
                    <p className="text-sm text-muted-foreground">Released {app.released}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">{app.downloads}</span>
                  <span className="font-mono font-semibold">{app.version}</span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-200">
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
