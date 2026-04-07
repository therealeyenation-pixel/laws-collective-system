import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  AlertCircle,
  Bell,
  Clock,
  Mail,
  MessageSquare,
  Save,
  Smartphone,
  Trash2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type NotificationCategory =
  | "emergency"
  | "broadcast"
  | "conference"
  | "system"
  | "music"
  | "theater"
  | "general";

interface NotificationPreference {
  category: NotificationCategory;
  enabled: boolean;
  icon: React.ReactNode;
  label: string;
  description: string;
}

interface QuietHours {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

interface DeliveryPreferences {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
}

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      category: "emergency",
      enabled: true,
      icon: <AlertCircle className="w-5 h-5" />,
      label: "Emergency Alerts",
      description: "Critical system alerts and SOS notifications",
    },
    {
      category: "broadcast",
      enabled: true,
      icon: <MessageSquare className="w-5 h-5" />,
      label: "Broadcast Notifications",
      description: "New broadcasts and channel updates",
    },
    {
      category: "conference",
      enabled: true,
      icon: <MessageSquare className="w-5 h-5" />,
      label: "Conference Invitations",
      description: "Meeting invites and conference updates",
    },
    {
      category: "system",
      enabled: true,
      icon: <AlertCircle className="w-5 h-5" />,
      label: "System Alerts",
      description: "Maintenance and system status updates",
    },
    {
      category: "music",
      enabled: true,
      icon: <MessageSquare className="w-5 h-5" />,
      label: "Music & Podcasts",
      description: "New releases and playlist updates",
    },
    {
      category: "theater",
      enabled: true,
      icon: <MessageSquare className="w-5 h-5" />,
      label: "Theater Updates",
      description: "New channels and program schedules",
    },
    {
      category: "general",
      enabled: true,
      icon: <Bell className="w-5 h-5" />,
      label: "General Notifications",
      description: "General app updates and announcements",
    },
  ]);

  const [quietHours, setQuietHours] = useState<QuietHours>({
    enabled: false,
    startTime: "22:00",
    endTime: "08:00",
  });

  const [deliveryPrefs, setDeliveryPrefs] = useState<DeliveryPreferences>({
    pushEnabled: true,
    emailEnabled: false,
    smsEnabled: false,
  });

  const [saving, setSaving] = useState(false);

  const subscriptionsQuery = trpc.pushNotifications.getSubscriptions.useQuery();
  const testNotificationMutation =
    trpc.pushNotifications.sendTestNotification.useMutation();

  const handleCategoryToggle = (category: NotificationCategory) => {
    setPreferences((prefs) =>
      prefs.map((p) =>
        p.category === category ? { ...p, enabled: !p.enabled } : p
      )
    );
  };

  const handleQuietHoursToggle = () => {
    setQuietHours((qh) => ({ ...qh, enabled: !qh.enabled }));
  };

  const handleQuietHourChange = (field: "startTime" | "endTime", value: string) => {
    setQuietHours((qh) => ({ ...qh, [field]: value }));
  };

  const handleDeliveryPrefChange = (
    method: keyof DeliveryPreferences,
    value: boolean
  ) => {
    setDeliveryPrefs((dp) => ({ ...dp, [method]: value }));
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      // In a real scenario, you would save these to the database
      localStorage.setItem(
        "notificationPreferences",
        JSON.stringify({
          categories: preferences,
          quietHours,
          deliveryPrefs,
        })
      );
      toast.success("Preferences saved successfully");
    } catch (error) {
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestNotification = async (category: NotificationCategory) => {
    try {
      await testNotificationMutation.mutateAsync({ category });
      toast.success(`Test ${category} notification sent`);
    } catch (error) {
      toast.error("Failed to send test notification");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Notification Preferences
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage how and when you receive notifications
        </p>
      </div>

      {/* Notification Categories */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Notification Categories
        </h2>
        <div className="space-y-4">
          {preferences.map((pref) => (
            <div
              key={pref.category}
              className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="text-accent mt-1">{pref.icon}</div>
                <div>
                  <h3 className="font-medium text-foreground">{pref.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {pref.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleSendTestNotification(pref.category)
                  }
                  disabled={testNotificationMutation.isPending}
                >
                  Test
                </Button>
                <Switch
                  checked={pref.enabled}
                  onCheckedChange={() =>
                    handleCategoryToggle(pref.category)
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quiet Hours */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold text-foreground">
              Quiet Hours
            </h2>
          </div>
          <Switch
            checked={quietHours.enabled}
            onCheckedChange={handleQuietHoursToggle}
          />
        </div>

        {quietHours.enabled && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={quietHours.startTime}
                onChange={(e) =>
                  handleQuietHourChange("startTime", e.target.value)
                }
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                End Time
              </label>
              <input
                type="time"
                value={quietHours.endTime}
                onChange={(e) =>
                  handleQuietHourChange("endTime", e.target.value)
                }
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>
          </div>
        )}
        <p className="text-sm text-muted-foreground mt-4">
          {quietHours.enabled
            ? `Notifications will be silenced from ${quietHours.startTime} to ${quietHours.endTime}`
            : "Quiet hours are disabled"}
        </p>
      </Card>

      {/* Delivery Methods */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Delivery Methods
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-accent" />
              <div>
                <h3 className="font-medium text-foreground">
                  Push Notifications
                </h3>
                <p className="text-sm text-muted-foreground">
                  Receive notifications on your device
                </p>
              </div>
            </div>
            <Switch
              checked={deliveryPrefs.pushEnabled}
              onCheckedChange={(checked) =>
                handleDeliveryPrefChange("pushEnabled", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-accent" />
              <div>
                <h3 className="font-medium text-foreground">Email</h3>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications
                </p>
              </div>
            </div>
            <Switch
              checked={deliveryPrefs.emailEnabled}
              onCheckedChange={(checked) =>
                handleDeliveryPrefChange("emailEnabled", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-accent" />
              <div>
                <h3 className="font-medium text-foreground">SMS</h3>
                <p className="text-sm text-muted-foreground">
                  Receive SMS text messages
                </p>
              </div>
            </div>
            <Switch
              checked={deliveryPrefs.smsEnabled}
              onCheckedChange={(checked) =>
                handleDeliveryPrefChange("smsEnabled", checked)
              }
            />
          </div>
        </div>
      </Card>

      {/* Active Subscriptions */}
      {subscriptionsQuery.data && subscriptionsQuery.data.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Active Subscriptions
          </h2>
          <div className="space-y-2">
            {subscriptionsQuery.data.map((sub, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-accent/5 rounded-lg text-sm"
              >
                <span className="text-foreground truncate">
                  {sub.endpoint.substring(0, 50)}...
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Handle unsubscribe
                    toast.info("Unsubscribe feature coming soon");
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleSavePreferences} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}
