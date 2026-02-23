import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Settings,
  Layout,
  Bell,
  Zap,
  RotateCcw,
  Save,
  Eye,
  Users,
  Shield,
  UserCheck,
  User
} from "lucide-react";
import { toast } from "sonner";
import { 
  roleDashboardService,
  RoleDashboard,
  UserRole,
  DashboardWidget,
  QuickAction,
  NotificationPreference
} from "@/services/roleDashboardService";

export default function RoleDashboardPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [dashboard, setDashboard] = useState<RoleDashboard | null>(null);
  const [allDashboards, setAllDashboards] = useState<RoleDashboard[]>([]);
  const [editedNotifications, setEditedNotifications] = useState<NotificationPreference[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setAllDashboards(roleDashboardService.getAllRoleDashboards());
  }, []);

  useEffect(() => {
    const d = roleDashboardService.getDashboardForRole(selectedRole);
    setDashboard(d);
    setEditedNotifications(d.notifications);
    setHasChanges(false);
  }, [selectedRole]);

  const handleNotificationChange = (index: number, field: keyof NotificationPreference, value: boolean) => {
    const updated = [...editedNotifications];
    updated[index] = { ...updated[index], [field]: value };
    setEditedNotifications(updated);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!dashboard) return;
    roleDashboardService.saveCustomizations(selectedRole, {
      notifications: editedNotifications
    });
    toast.success(`${dashboard.name} settings saved`);
    setHasChanges(false);
  };

  const handleReset = () => {
    const d = roleDashboardService.resetToDefault(selectedRole);
    setDashboard(d);
    setEditedNotifications(d.notifications);
    setHasChanges(false);
    toast.success(`${d.name} reset to defaults`);
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'staff': return <Users className="w-4 h-4" />;
      case 'guardian': return <UserCheck className="w-4 h-4" />;
      case 'member': return <User className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getWidgetSizeClass = (size: string) => {
    switch (size) {
      case 'small': return 'col-span-1';
      case 'medium': return 'col-span-2';
      case 'large': return 'col-span-3';
      case 'full': return 'col-span-4';
      default: return 'col-span-1';
    }
  };

  if (!dashboard) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Role-Based Dashboards</h1>
            <p className="text-muted-foreground mt-1">
              Configure default dashboards for different user roles
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Default
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Role Selector */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Label>Select Role:</Label>
              <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as UserRole)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allDashboards.map((d) => (
                    <SelectItem key={d.role} value={d.role}>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(d.role)}
                        <span className="capitalize">{d.role}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex-1" />
              <Badge variant="outline" className="text-sm">
                {dashboard.widgets.length} widgets
              </Badge>
              <Badge variant="outline" className="text-sm">
                {dashboard.quickActions.length} quick actions
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              {getRoleIcon(selectedRole)}
              <div>
                <CardTitle>{dashboard.name}</CardTitle>
                <CardDescription>{dashboard.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="layout">
          <TabsList>
            <TabsTrigger value="layout">
              <Layout className="w-4 h-4 mr-2" />
              Layout Preview
            </TabsTrigger>
            <TabsTrigger value="actions">
              <Zap className="w-4 h-4 mr-2" />
              Quick Actions
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="layout" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Widget Layout</CardTitle>
                <CardDescription>Preview of the default dashboard layout for this role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {dashboard.widgets.map((widget) => (
                    <div
                      key={widget.id}
                      className={`${getWidgetSizeClass(widget.size)} p-4 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/20`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{widget.title}</span>
                        <Badge variant="secondary" className="text-xs">
                          {widget.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="h-20 bg-muted rounded flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">
                          {widget.size} widget
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Shortcuts available to users with this role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {dashboard.quickActions.map((action) => (
                    <div
                      key={action.id}
                      className="p-4 bg-muted/50 rounded-lg text-center"
                    >
                      <div 
                        className={`w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center bg-${action.color}-100 dark:bg-${action.color}-900/30`}
                      >
                        <Zap className={`w-6 h-6 text-${action.color}-600`} />
                      </div>
                      <p className="font-medium text-sm">{action.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{action.path}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Default notification settings for this role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {editedNotifications.map((pref, index) => (
                    <div
                      key={pref.type}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium capitalize">
                          {pref.type.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={pref.email}
                            onCheckedChange={(v) => handleNotificationChange(index, 'email', v)}
                          />
                          <Label className="text-sm">Email</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={pref.inApp}
                            onCheckedChange={(v) => handleNotificationChange(index, 'inApp', v)}
                          />
                          <Label className="text-sm">In-App</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={pref.push}
                            onCheckedChange={(v) => handleNotificationChange(index, 'push', v)}
                          />
                          <Label className="text-sm">Push</Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* All Roles Overview */}
        <Card>
          <CardHeader>
            <CardTitle>All Role Dashboards</CardTitle>
            <CardDescription>Overview of configured dashboards for each role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allDashboards.map((d) => (
                <div
                  key={d.role}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedRole === d.role 
                      ? 'border-primary bg-primary/5' 
                      : 'border-transparent bg-muted/50 hover:border-muted-foreground/20'
                  }`}
                  onClick={() => setSelectedRole(d.role)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {getRoleIcon(d.role)}
                    <span className="font-medium capitalize">{d.role}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{d.description}</p>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{d.widgets.length} widgets</Badge>
                    <Badge variant="secondary">{d.quickActions.length} actions</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
