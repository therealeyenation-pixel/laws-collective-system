import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Plug,
  Calculator,
  Calendar,
  CalendarDays,
  MessageSquare,
  HardDrive,
  Cloud,
  CreditCard,
  Wallet,
  Users,
  Building2,
  Mail,
  Receipt,
  RefreshCw,
  Settings,
  Key,
  Webhook,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Search,
  Filter,
} from "lucide-react";
import {
  integrationHubService,
  Integration,
  IntegrationCategory,
  IntegrationHealth,
  WebhookConfig,
  ApiKey,
} from "@/services/integrationHubService";

const iconMap: Record<string, React.ReactNode> = {
  Calculator: <Calculator className="w-6 h-6" />,
  Receipt: <Receipt className="w-6 h-6" />,
  Calendar: <Calendar className="w-6 h-6" />,
  CalendarDays: <CalendarDays className="w-6 h-6" />,
  MessageSquare: <MessageSquare className="w-6 h-6" />,
  HardDrive: <HardDrive className="w-6 h-6" />,
  Cloud: <Cloud className="w-6 h-6" />,
  CreditCard: <CreditCard className="w-6 h-6" />,
  Wallet: <Wallet className="w-6 h-6" />,
  Users: <Users className="w-6 h-6" />,
  Building2: <Building2 className="w-6 h-6" />,
  Mail: <Mail className="w-6 h-6" />,
};

const categoryLabels: Record<IntegrationCategory, string> = {
  accounting: "Accounting",
  calendar: "Calendar",
  communication: "Communication",
  storage: "Storage",
  payment: "Payment",
  crm: "CRM",
};

export default function IntegrationHub() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [healthStatuses, setHealthStatuses] = useState<Map<string, IntegrationHealth>>(new Map());
  const [selectedCategory, setSelectedCategory] = useState<IntegrationCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [connecting, setConnecting] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(false);

  // Dialogs
  const [configDialog, setConfigDialog] = useState<Integration | null>(null);
  const [webhookDialog, setWebhookDialog] = useState(false);
  const [apiKeyDialog, setApiKeyDialog] = useState(false);
  const [showApiKey, setShowApiKey] = useState<string | null>(null);

  // Form states
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookEvents, setWebhookEvents] = useState<string[]>([]);
  const [apiKeyName, setApiKeyName] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setIntegrations(integrationHubService.getAllIntegrations());
    setWebhooks(integrationHubService.getWebhooks());
    setApiKeys(integrationHubService.getApiKeys());

    // Load cached health statuses
    const connected = integrationHubService.getConnectedIntegrations();
    const healthMap = new Map<string, IntegrationHealth>();
    connected.forEach(i => {
      const health = integrationHubService.getHealthStatus(i.id);
      if (health) healthMap.set(i.id, health);
    });
    setHealthStatuses(healthMap);
  };

  const handleConnect = async (integration: Integration) => {
    if (integration.apiKeyRequired) {
      setConfigDialog(integration);
      return;
    }

    setConnecting(integration.id);
    try {
      const result = await integrationHubService.connectIntegration(integration.id);
      if (result.success) {
        toast.success(result.message);
        loadData();
      } else {
        toast.error(result.message);
      }
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = (integration: Integration) => {
    const result = integrationHubService.disconnectIntegration(integration.id);
    if (result.success) {
      toast.success(result.message);
      loadData();
    } else {
      toast.error(result.message);
    }
  };

  const handleSync = async (integration: Integration) => {
    setSyncing(integration.id);
    try {
      const result = await integrationHubService.syncIntegration(integration.id);
      if (result.success) {
        toast.success(result.message);
        loadData();
      } else {
        toast.error(result.message);
      }
    } finally {
      setSyncing(null);
    }
  };

  const handleCheckAllHealth = async () => {
    setCheckingHealth(true);
    try {
      const results = await integrationHubService.checkAllHealth();
      const healthMap = new Map<string, IntegrationHealth>();
      results.forEach(h => healthMap.set(h.integrationId, h));
      setHealthStatuses(healthMap);
      toast.success(`Health check completed for ${results.length} integrations`);
    } finally {
      setCheckingHealth(false);
    }
  };

  const handleConfigSubmit = async () => {
    if (!configDialog) return;

    setConnecting(configDialog.id);
    try {
      const result = await integrationHubService.connectIntegration(configDialog.id, {
        apiKey: (document.getElementById('api-key-input') as HTMLInputElement)?.value
      });
      if (result.success) {
        toast.success(result.message);
        setConfigDialog(null);
        loadData();
      } else {
        toast.error(result.message);
      }
    } finally {
      setConnecting(null);
    }
  };

  const handleCreateWebhook = () => {
    if (!webhookUrl) {
      toast.error("Please enter a webhook URL");
      return;
    }

    const webhook = integrationHubService.createWebhook('system', webhookUrl, webhookEvents);
    toast.success("Webhook created successfully");
    setWebhookDialog(false);
    setWebhookUrl("");
    setWebhookEvents([]);
    loadData();
  };

  const handleDeleteWebhook = (id: string) => {
    integrationHubService.deleteWebhook(id);
    toast.success("Webhook deleted");
    loadData();
  };

  const handleCreateApiKey = () => {
    if (!apiKeyName) {
      toast.error("Please enter a name for the API key");
      return;
    }

    const apiKey = integrationHubService.createApiKey(apiKeyName);
    toast.success("API key created. Make sure to copy it now - you won't be able to see it again!");
    setShowApiKey(apiKey.id);
    setApiKeyDialog(false);
    setApiKeyName("");
    loadData();
  };

  const handleRevokeApiKey = (id: string) => {
    integrationHubService.revokeApiKey(id);
    toast.success("API key revoked");
    loadData();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const filteredIntegrations = integrations.filter(i => {
    const matchesCategory = selectedCategory === 'all' || i.category === selectedCategory;
    const matchesSearch = i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const stats = integrationHubService.getStatistics();

  const getStatusBadge = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800">Connected</Badge>;
      case 'disconnected':
        return <Badge variant="outline">Disconnected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'expired':
        return <Badge className="bg-orange-100 text-orange-800">Expired</Badge>;
      default:
        return null;
    }
  };

  const getHealthBadge = (health?: IntegrationHealth) => {
    if (!health) return null;
    switch (health.status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Healthy</Badge>;
      case 'degraded':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />Degraded</Badge>;
      case 'down':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Down</Badge>;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Plug className="w-6 h-6" />
              Integration Hub
            </h1>
            <p className="text-muted-foreground">
              Manage external service integrations and API connections
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCheckAllHealth}
              disabled={checkingHealth}
            >
              <Activity className={`w-4 h-4 mr-2 ${checkingHealth ? 'animate-pulse' : ''}`} />
              {checkingHealth ? 'Checking...' : 'Health Check'}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Integrations</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Connected</div>
            <div className="text-2xl font-bold text-green-600">{stats.connected}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Healthy</div>
            <div className="text-2xl font-bold text-green-600">{stats.healthy}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Issues</div>
            <div className="text-2xl font-bold text-amber-600">{stats.degraded}</div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="integrations" className="w-full">
          <TabsList>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          </TabsList>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search integrations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                >
                  All
                </Button>
                {(Object.keys(categoryLabels) as IntegrationCategory[]).map(cat => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {categoryLabels[cat]}
                  </Button>
                ))}
              </div>
            </div>

            {/* Integration Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredIntegrations.map(integration => {
                const health = healthStatuses.get(integration.id);
                return (
                  <Card key={integration.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          {iconMap[integration.icon] || <Plug className="w-6 h-6" />}
                        </div>
                        <div>
                          <h3 className="font-semibold">{integration.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {categoryLabels[integration.category]}
                          </Badge>
                        </div>
                      </div>
                      {getStatusBadge(integration.status)}
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {integration.description}
                    </p>

                    {integration.status === 'connected' && (
                      <div className="mb-3 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Health:</span>
                          {getHealthBadge(health)}
                        </div>
                        {integration.lastSyncAt && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            Last sync: {new Date(integration.lastSyncAt).toLocaleString()}
                          </div>
                        )}
                        {health?.latency && (
                          <div className="text-xs text-muted-foreground">
                            Latency: {health.latency}ms
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      {integration.status === 'connected' ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSync(integration)}
                            disabled={syncing === integration.id}
                          >
                            <RefreshCw className={`w-4 h-4 mr-1 ${syncing === integration.id ? 'animate-spin' : ''}`} />
                            Sync
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setConfigDialog(integration)}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDisconnect(integration)}
                          >
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleConnect(integration)}
                          disabled={connecting === integration.id}
                        >
                          {connecting === integration.id ? 'Connecting...' : 'Connect'}
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">
                Configure webhooks to receive real-time notifications
              </p>
              <Button onClick={() => setWebhookDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Webhook
              </Button>
            </div>

            {webhooks.length === 0 ? (
              <Card className="p-8 text-center">
                <Webhook className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No webhooks configured</h3>
                <p className="text-muted-foreground mb-4">
                  Create a webhook to receive real-time event notifications
                </p>
                <Button onClick={() => setWebhookDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Webhook
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {webhooks.map(webhook => (
                  <Card key={webhook.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {webhook.url}
                          </code>
                          <Badge variant={webhook.enabled ? 'default' : 'outline'}>
                            {webhook.enabled ? 'Active' : 'Disabled'}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Events: {webhook.events.length > 0 ? webhook.events.join(', ') : 'All events'}
                        </div>
                        {webhook.lastTriggered && (
                          <div className="text-xs text-muted-foreground">
                            Last triggered: {new Date(webhook.lastTriggered).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(webhook.secret || '')}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteWebhook(webhook.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api-keys" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">
                Manage API keys for external service access
              </p>
              <Button onClick={() => setApiKeyDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create API Key
              </Button>
            </div>

            {apiKeys.length === 0 ? (
              <Card className="p-8 text-center">
                <Key className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No API keys</h3>
                <p className="text-muted-foreground mb-4">
                  Create an API key to enable programmatic access
                </p>
                <Button onClick={() => setApiKeyDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create API Key
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {apiKeys.map(apiKey => (
                  <Card key={apiKey.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{apiKey.name}</span>
                          {apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date() && (
                            <Badge variant="destructive">Expired</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {showApiKey === apiKey.id ? apiKey.key : apiKey.maskedKey}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowApiKey(showApiKey === apiKey.id ? null : apiKey.id)}
                          >
                            {showApiKey === apiKey.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Created: {new Date(apiKey.createdAt).toLocaleDateString()} • 
                          Used: {apiKey.usageCount} times
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(apiKey.key)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRevokeApiKey(apiKey.id)}
                        >
                          Revoke
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Config Dialog */}
        <Dialog open={!!configDialog} onOpenChange={() => setConfigDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configure {configDialog?.name}</DialogTitle>
              <DialogDescription>
                {configDialog?.apiKeyRequired
                  ? 'Enter your API key to connect this integration'
                  : 'Configure integration settings'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {configDialog?.apiKeyRequired && (
                <div className="space-y-2">
                  <Label htmlFor="api-key-input">API Key</Label>
                  <Input
                    id="api-key-input"
                    type="password"
                    placeholder="Enter your API key"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfigDialog(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleConfigSubmit}
                disabled={connecting === configDialog?.id}
              >
                {connecting === configDialog?.id ? 'Connecting...' : 'Connect'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Webhook Dialog */}
        <Dialog open={webhookDialog} onOpenChange={setWebhookDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Webhook</DialogTitle>
              <DialogDescription>
                Configure a webhook endpoint to receive event notifications
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://your-server.com/webhook"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Events (leave empty for all)</Label>
                <div className="flex flex-wrap gap-2">
                  {['payment.completed', 'user.created', 'document.signed', 'task.completed'].map(event => (
                    <Badge
                      key={event}
                      variant={webhookEvents.includes(event) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => {
                        setWebhookEvents(prev =>
                          prev.includes(event)
                            ? prev.filter(e => e !== event)
                            : [...prev, event]
                        );
                      }}
                    >
                      {event}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setWebhookDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateWebhook}>Create Webhook</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* API Key Dialog */}
        <Dialog open={apiKeyDialog} onOpenChange={setApiKeyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>
                Create a new API key for programmatic access
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="api-key-name">Key Name</Label>
                <Input
                  id="api-key-name"
                  placeholder="e.g., Production Server"
                  value={apiKeyName}
                  onChange={(e) => setApiKeyName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApiKeyDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateApiKey}>Create Key</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
