import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Building, 
  Users, 
  Settings,
  Plus,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertTriangle,
  Palette,
  Globe,
  Mail,
  CreditCard,
  HardDrive,
  Activity
} from "lucide-react";
import { toast } from "sonner";
import { multiTenantService, Tenant, TenantInvite, TenantUsageStats } from "@/services/multiTenantService";
import { format } from "date-fns";

export default function MultiTenantManagementPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [usageStats, setUsageStats] = useState<TenantUsageStats | null>(null);
  const [invites, setInvites] = useState<TenantInvite[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [newTenant, setNewTenant] = useState({
    name: '',
    slug: '',
    plan: 'starter' as const,
    primaryColor: '#4F46E5',
  });
  const [newInvite, setNewInvite] = useState({
    email: '',
    role: 'user' as const,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const tenantsData = multiTenantService.getTenants();
    setTenants(tenantsData);
    if (tenantsData.length > 0 && !selectedTenant) {
      selectTenant(tenantsData[0]);
    }
  };

  const selectTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setUsageStats(multiTenantService.getUsageStats(tenant.id));
    setInvites(multiTenantService.getInvites(tenant.id));
  };

  const handleCreateTenant = () => {
    if (!newTenant.name || !newTenant.slug) {
      toast.error("Please fill in required fields");
      return;
    }

    const tenant = multiTenantService.createTenant({
      name: newTenant.name,
      slug: newTenant.slug,
      ownerUserId: 'current-user',
      plan: newTenant.plan,
      branding: { primaryColor: newTenant.primaryColor },
    });

    toast.success(`Organization "${tenant.name}" created`);
    setShowCreateDialog(false);
    setNewTenant({ name: '', slug: '', plan: 'starter', primaryColor: '#4F46E5' });
    loadData();
    selectTenant(tenant);
  };

  const handleInviteMember = () => {
    if (!selectedTenant || !newInvite.email) {
      toast.error("Please enter an email address");
      return;
    }

    multiTenantService.createInvite(selectedTenant.id, newInvite.email, newInvite.role, 'current-user');
    toast.success(`Invitation sent to ${newInvite.email}`);
    setShowInviteDialog(false);
    setNewInvite({ email: '', role: 'user' });
    setInvites(multiTenantService.getInvites(selectedTenant.id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'trial': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'suspended': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'canceled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'professional': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'starter': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
      case 'custom': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 GB';
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  const totalMembers = tenants.reduce((sum, t) => sum + t.memberCount, 0);
  const totalStorage = tenants.reduce((sum, t) => sum + t.storageUsed, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Building className="w-8 h-8 text-primary" />
              Multi-Tenant Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage organizations, branding, and franchise deployments
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Organization
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Organization</DialogTitle>
                <DialogDescription>
                  Set up a new organization with isolated data and custom branding
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Organization Name *</Label>
                  <Input
                    value={newTenant.name}
                    onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                    placeholder="e.g., Atlanta Community Foundation"
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL Slug *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={newTenant.slug}
                      onChange={(e) => setNewTenant({ ...newTenant, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                      placeholder="atlanta-cf"
                    />
                    <span className="text-sm text-muted-foreground">.laws.space</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Plan</Label>
                    <Select value={newTenant.plan} onValueChange={(v) => setNewTenant({ ...newTenant, plan: v as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="starter">Starter ($99/mo)</SelectItem>
                        <SelectItem value="professional">Professional ($499/mo)</SelectItem>
                        <SelectItem value="enterprise">Enterprise ($1,999/mo)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Brand Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={newTenant.primaryColor}
                        onChange={(e) => setNewTenant({ ...newTenant, primaryColor: e.target.value })}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={newTenant.primaryColor}
                        onChange={(e) => setNewTenant({ ...newTenant, primaryColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                <Button onClick={handleCreateTenant}>Create Organization</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{tenants.length}</p>
                  <p className="text-xs text-muted-foreground">Organizations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalMembers}</p>
                  <p className="text-xs text-muted-foreground">Total Members</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <HardDrive className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatBytes(totalStorage)}</p>
                  <p className="text-xs text-muted-foreground">Storage Used</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Activity className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{tenants.filter(t => t.status === 'active').length}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tenant List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Organizations</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {tenants.map((tenant) => (
                    <div
                      key={tenant.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedTenant?.id === tenant.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => selectTenant(tenant)}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: tenant.branding.primaryColor }}
                        >
                          {tenant.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{tenant.name}</p>
                          <p className="text-xs text-muted-foreground">{tenant.memberCount} members</p>
                        </div>
                      </div>
                      <div className="flex gap-1 mt-2">
                        <Badge className={getStatusColor(tenant.status)} variant="outline">
                          {tenant.status}
                        </Badge>
                        <Badge className={getPlanColor(tenant.subscription.plan)} variant="outline">
                          {tenant.subscription.plan}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Tenant Details */}
          <div className="lg:col-span-3 space-y-4">
            {selectedTenant ? (
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="branding">Branding</TabsTrigger>
                  <TabsTrigger value="members">Members</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                  <TabsTrigger value="billing">Billing</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold"
                            style={{ backgroundColor: selectedTenant.branding.primaryColor }}
                          >
                            {selectedTenant.name.charAt(0)}
                          </div>
                          <div>
                            <CardTitle>{selectedTenant.name}</CardTitle>
                            <CardDescription>
                              {selectedTenant.domain || `${selectedTenant.slug}.laws.space`}
                            </CardDescription>
                          </div>
                        </div>
                        <Button variant="outline">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Visit Site
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {usageStats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-4 bg-muted/50 rounded-lg">
                            <p className="text-2xl font-bold">{usageStats.activeUsers}</p>
                            <p className="text-sm text-muted-foreground">Active Users</p>
                          </div>
                          <div className="p-4 bg-muted/50 rounded-lg">
                            <p className="text-2xl font-bold">{usageStats.documentsCreated}</p>
                            <p className="text-sm text-muted-foreground">Documents</p>
                          </div>
                          <div className="p-4 bg-muted/50 rounded-lg">
                            <p className="text-2xl font-bold">{usageStats.workflowsRun}</p>
                            <p className="text-sm text-muted-foreground">Workflows Run</p>
                          </div>
                          <div className="p-4 bg-muted/50 rounded-lg">
                            <p className="text-2xl font-bold">{formatBytes(usageStats.storageUsed)}</p>
                            <p className="text-sm text-muted-foreground">Storage</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Limits */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Usage Limits</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Users</span>
                          <span>
                            {selectedTenant.memberCount} / {selectedTenant.settings.limits.maxUsers === -1 ? '∞' : selectedTenant.settings.limits.maxUsers}
                          </span>
                        </div>
                        <Progress 
                          value={selectedTenant.settings.limits.maxUsers === -1 ? 10 : (selectedTenant.memberCount / selectedTenant.settings.limits.maxUsers) * 100} 
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Storage</span>
                          <span>
                            {formatBytes(selectedTenant.storageUsed)} / {selectedTenant.settings.limits.maxStorage === -1 ? '∞' : `${selectedTenant.settings.limits.maxStorage} GB`}
                          </span>
                        </div>
                        <Progress 
                          value={selectedTenant.settings.limits.maxStorage === -1 ? 10 : (selectedTenant.storageUsed / (selectedTenant.settings.limits.maxStorage * 1024 * 1024 * 1024)) * 100} 
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Branding Tab */}
                <TabsContent value="branding">
                  <Card>
                    <CardHeader>
                      <CardTitle>Branding Settings</CardTitle>
                      <CardDescription>Customize the look and feel for this organization</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Company Name</Label>
                            <Input value={selectedTenant.branding.companyName} readOnly />
                          </div>
                          <div className="space-y-2">
                            <Label>Tagline</Label>
                            <Input value={selectedTenant.branding.tagline || ''} placeholder="Enter tagline..." />
                          </div>
                          <div className="space-y-2">
                            <Label>Support Email</Label>
                            <Input value={selectedTenant.branding.supportEmail || ''} placeholder="support@example.com" />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Primary Color</Label>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-10 h-10 rounded-lg border"
                                style={{ backgroundColor: selectedTenant.branding.primaryColor }}
                              />
                              <Input value={selectedTenant.branding.primaryColor} className="flex-1" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Secondary Color</Label>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-10 h-10 rounded-lg border"
                                style={{ backgroundColor: selectedTenant.branding.secondaryColor }}
                              />
                              <Input value={selectedTenant.branding.secondaryColor} className="flex-1" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Logo</Label>
                            <Button variant="outline" className="w-full">
                              <Palette className="w-4 h-4 mr-2" />
                              Upload Logo
                            </Button>
                          </div>
                        </div>
                      </div>
                      <Button>Save Branding</Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Members Tab */}
                <TabsContent value="members">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Members</CardTitle>
                          <CardDescription>{selectedTenant.memberCount} members in this organization</CardDescription>
                        </div>
                        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                          <DialogTrigger asChild>
                            <Button>
                              <Mail className="w-4 h-4 mr-2" />
                              Invite Member
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Invite Member</DialogTitle>
                              <DialogDescription>Send an invitation to join {selectedTenant.name}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Email Address</Label>
                                <Input
                                  type="email"
                                  value={newInvite.email}
                                  onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                                  placeholder="member@example.com"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Role</Label>
                                <Select value={newInvite.role} onValueChange={(v) => setNewInvite({ ...newInvite, role: v as any })}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="staff">Staff</SelectItem>
                                    <SelectItem value="user">User</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>Cancel</Button>
                              <Button onClick={handleInviteMember}>Send Invitation</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {invites.map((invite) => (
                          <div key={invite.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Mail className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{invite.email}</p>
                                <p className="text-xs text-muted-foreground">
                                  Invited {format(invite.createdAt, 'MMM d, yyyy')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{invite.role}</Badge>
                              <Badge className={invite.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}>
                                {invite.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                        {invites.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No pending invitations</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Features Tab */}
                <TabsContent value="features">
                  <Card>
                    <CardHeader>
                      <CardTitle>Enabled Features</CardTitle>
                      <CardDescription>Features available for this organization based on their plan</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(selectedTenant.settings.features).map(([feature, enabled]) => (
                          <div 
                            key={feature}
                            className={`p-4 border rounded-lg ${enabled ? 'bg-green-50 dark:bg-green-950/20 border-green-200' : 'bg-gray-50 dark:bg-gray-950/20 border-gray-200 opacity-60'}`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              {enabled ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <Clock className="w-5 h-5 text-gray-400" />
                              )}
                              <span className="font-medium capitalize">
                                {feature.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {enabled ? 'Enabled' : 'Not included in plan'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Billing Tab */}
                <TabsContent value="billing">
                  <Card>
                    <CardHeader>
                      <CardTitle>Subscription</CardTitle>
                      <CardDescription>Billing and subscription details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium capitalize">{selectedTenant.subscription.plan} Plan</p>
                          <p className="text-sm text-muted-foreground">
                            ${selectedTenant.subscription.amount}/{selectedTenant.subscription.billingCycle === 'monthly' ? 'mo' : 'yr'}
                          </p>
                        </div>
                        <Badge className={getPlanColor(selectedTenant.subscription.plan)}>
                          {selectedTenant.subscription.plan}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">Current Period Ends</p>
                          <p className="font-medium">{format(selectedTenant.subscription.currentPeriodEnd, 'MMM d, yyyy')}</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">Billing Cycle</p>
                          <p className="font-medium capitalize">{selectedTenant.subscription.billingCycle}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Update Payment
                        </Button>
                        <Button variant="outline">Change Plan</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Building className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Select an organization to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
