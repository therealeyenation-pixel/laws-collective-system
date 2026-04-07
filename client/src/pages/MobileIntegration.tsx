import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Smartphone, Apple, Download, Zap, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function MobileIntegration() {
  const { user } = useAuth();
  const [devices, setDevices] = useState([
    { id: 1, name: "iPhone 15 Pro", platform: "iOS", version: "17.2", lastSync: "2 hours ago", status: "active" },
    { id: 2, name: "Samsung Galaxy S24", platform: "Android", version: "14", lastSync: "5 minutes ago", status: "active" },
    { id: 3, name: "iPad Air", platform: "iOS", version: "17.1", lastSync: "1 day ago", status: "inactive" },
  ]);

  const appVersions = [
    { platform: "iOS", version: "2.5.1", released: "2024-04-05", status: "latest" },
    { platform: "Android", version: "2.5.0", released: "2024-04-03", status: "latest" },
    { platform: "Web", version: "3.0.0", released: "2024-04-06", status: "latest" },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Mobile Integration</h1>
          <p className="text-muted-foreground mt-2">Manage mobile devices and app versions</p>
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
            <Button className="w-full">
              <Download className="w-4 h-4 mr-2" />
              App Store
            </Button>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <div className="flex items-center gap-3 mb-4">
              <Smartphone className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="font-bold">Android App</h3>
                <p className="text-sm text-muted-foreground">v2.5.0</p>
              </div>
            </div>
            <Button className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Play Store
            </Button>
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
          </Card>
        </div>

        {/* Connected Devices */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Connected Devices</h2>
          <div className="space-y-3">
            {devices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-4 flex-1">
                  <Smartphone className="w-6 h-6 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold">{device.name}</h3>
                    <p className="text-sm text-muted-foreground">{device.platform} {device.version}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">Last Sync</p>
                    <p className="text-xs text-muted-foreground">{device.lastSync}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    device.status === "active"
                      ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-200"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-200"
                  }`}>
                    {device.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* App Versions */}
        <Card className="p-6 mb-8">
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
                  <span className="font-mono font-semibold">{app.version}</span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-200">
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Push Notifications */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Push Notifications</h2>
          <div className="space-y-3">
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Enable Push Notifications</h3>
                <input type="checkbox" defaultChecked className="w-5 h-5" />
              </div>
              <p className="text-sm text-muted-foreground">Receive real-time alerts and updates on your mobile device</p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Critical Alerts Only</h3>
                <input type="checkbox" className="w-5 h-5" />
              </div>
              <p className="text-sm text-muted-foreground">Only receive notifications for critical system events</p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Quiet Hours (10 PM - 7 AM)</h3>
                <input type="checkbox" className="w-5 h-5" />
              </div>
              <p className="text-sm text-muted-foreground">Disable notifications during specified hours</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
