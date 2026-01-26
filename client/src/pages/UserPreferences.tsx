import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  MapPin,
  Thermometer,
  Clock,
  Palette,
  Bell,
  Mail,
  LayoutDashboard,
  Save,
  RotateCcw,
  Loader2,
  Check,
} from "lucide-react";
import { toast } from "sonner";

const popularCities = [
  "New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX", "Phoenix, AZ",
  "Philadelphia, PA", "San Antonio, TX", "San Diego, CA", "Dallas, TX", "San Jose, CA",
  "Austin, TX", "Jacksonville, FL", "Fort Worth, TX", "Columbus, OH", "Charlotte, NC",
  "San Francisco, CA", "Indianapolis, IN", "Seattle, WA", "Denver, CO", "Washington, DC",
  "Boston, MA", "Nashville, TN", "Detroit, MI", "Oklahoma City, OK", "Portland, OR",
  "Las Vegas, NV", "Memphis, TN", "Louisville, KY", "Baltimore, MD", "Milwaukee, WI",
  "Atlanta, GA", "Miami, FL",
];

const timezones = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HT)" },
  { value: "America/Phoenix", label: "Arizona (no DST)" },
  { value: "UTC", label: "UTC" },
];

export default function UserPreferences() {
  const { user, loading: authLoading } = useAuth();
  const utils = trpc.useUtils();

  const [weatherLocation, setWeatherLocation] = useState("Atlanta, GA");
  const [weatherUnit, setWeatherUnit] = useState<"fahrenheit" | "celsius">("fahrenheit");
  const [timezone, setTimezone] = useState("America/New_York");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [dashboardLayout, setDashboardLayout] = useState("default");
  const [hasChanges, setHasChanges] = useState(false);

  const { data: preferences, isLoading: preferencesLoading } = trpc.userPreferences.getPreferences.useQuery(
    undefined,
    { enabled: !!user, staleTime: 0 }
  );

  const updateMutation = trpc.userPreferences.updatePreferences.useMutation({
    onSuccess: () => {
      toast.success("Preferences saved successfully");
      utils.userPreferences.getPreferences.invalidate();
      setHasChanges(false);
    },
    onError: (error) => toast.error(`Failed to save preferences: ${error.message}`),
  });

  const resetMutation = trpc.userPreferences.resetPreferences.useMutation({
    onSuccess: () => {
      toast.success("Preferences reset to defaults");
      utils.userPreferences.getPreferences.invalidate();
      setHasChanges(false);
    },
    onError: (error) => toast.error(`Failed to reset preferences: ${error.message}`),
  });

  useEffect(() => {
    if (preferences) {
      setWeatherLocation(preferences.weatherLocation || "Atlanta, GA");
      setWeatherUnit((preferences.weatherUnit as "fahrenheit" | "celsius") || "fahrenheit");
      setTimezone(preferences.timezone || "America/New_York");
      setTheme((preferences.theme as "light" | "dark" | "system") || "system");
      setNotificationsEnabled(preferences.notificationsEnabled ?? true);
      setEmailNotifications(preferences.emailNotifications ?? true);
      setDashboardLayout(preferences.dashboardLayout || "default");
    }
  }, [preferences]);

  useEffect(() => {
    if (preferences) {
      const changed =
        weatherLocation !== (preferences.weatherLocation || "Atlanta, GA") ||
        weatherUnit !== (preferences.weatherUnit || "fahrenheit") ||
        timezone !== (preferences.timezone || "America/New_York") ||
        theme !== (preferences.theme || "system") ||
        notificationsEnabled !== (preferences.notificationsEnabled ?? true) ||
        emailNotifications !== (preferences.emailNotifications ?? true) ||
        dashboardLayout !== (preferences.dashboardLayout || "default");
      setHasChanges(changed);
    }
  }, [weatherLocation, weatherUnit, timezone, theme, notificationsEnabled, emailNotifications, dashboardLayout, preferences]);

  const handleSave = () => {
    updateMutation.mutate({
      weatherLocation, weatherUnit, timezone, theme,
      notificationsEnabled, emailNotifications, dashboardLayout,
    });
  };

  if (authLoading || preferencesLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Settings className="w-8 h-8 text-primary" />
              User Preferences
            </h1>
            <p className="text-muted-foreground mt-1">Customize your experience across the platform</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => resetMutation.mutate()} disabled={resetMutation.isPending}>
              {resetMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RotateCcw className="w-4 h-4 mr-2" />}
              Reset to Defaults
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges || updateMutation.isPending}>
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : hasChanges ? <Save className="w-4 h-4 mr-2" /> : <Check className="w-4 h-4 mr-2" />}
              {hasChanges ? "Save Changes" : "Saved"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-500" />Weather Settings</CardTitle>
              <CardDescription>Configure your weather display preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="weatherLocation">Location</Label>
                <Select value={weatherLocation} onValueChange={setWeatherLocation}>
                  <SelectTrigger id="weatherLocation"><SelectValue placeholder="Select a city" /></SelectTrigger>
                  <SelectContent>
                    {popularCities.map((city) => (<SelectItem key={city} value={city}>{city}</SelectItem>))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Or enter a custom location:</p>
                <Input placeholder="Enter city, state or zip code" value={weatherLocation} onChange={(e) => setWeatherLocation(e.target.value)} />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Thermometer className="w-4 h-4" />Temperature Unit</Label>
                <div className="flex gap-4">
                  <Button variant={weatherUnit === "fahrenheit" ? "default" : "outline"} size="sm" onClick={() => setWeatherUnit("fahrenheit")}>°F Fahrenheit</Button>
                  <Button variant={weatherUnit === "celsius" ? "default" : "outline"} size="sm" onClick={() => setWeatherUnit("celsius")}>°C Celsius</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-purple-500" />Time & Display</CardTitle>
              <CardDescription>Set your timezone and visual preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger id="timezone"><SelectValue placeholder="Select timezone" /></SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (<SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Palette className="w-4 h-4" />Theme</Label>
                <div className="flex gap-2">
                  <Button variant={theme === "light" ? "default" : "outline"} size="sm" onClick={() => setTheme("light")}>Light</Button>
                  <Button variant={theme === "dark" ? "default" : "outline"} size="sm" onClick={() => setTheme("dark")}>Dark</Button>
                  <Button variant={theme === "system" ? "default" : "outline"} size="sm" onClick={() => setTheme("system")}>System</Button>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><LayoutDashboard className="w-4 h-4" />Dashboard Layout</Label>
                <Select value={dashboardLayout} onValueChange={setDashboardLayout}>
                  <SelectTrigger><SelectValue placeholder="Select layout" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="expanded">Expanded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5 text-amber-500" />Notification Settings</CardTitle>
              <CardDescription>Control how you receive notifications and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2"><Bell className="w-4 h-4" />Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive in-app notifications for important updates</p>
                  </div>
                  <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2"><Mail className="w-4 h-4" />Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive email alerts for critical events</p>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {hasChanges && (
          <div className="fixed bottom-4 right-4 bg-amber-100 dark:bg-amber-900/50 border border-amber-300 dark:border-amber-700 rounded-lg p-4 shadow-lg">
            <p className="text-sm text-amber-800 dark:text-amber-200">You have unsaved changes. Don't forget to save!</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
