import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const CATEGORY_ICONS: Record<string, string> = {
  investment: "💰",
  music_movies: "🎬",
  ai_assistant: "🤖",
  banking: "🏦",
  business: "💼",
  education: "📚",
  health: "🏥",
  social: "👥",
  other: "⚙️",
};

export default function AppStore() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [connectedAppIds, setConnectedAppIds] = useState<Set<number>>(new Set());

  // Fetch available apps
  const { data: availableApps, isLoading: appsLoading } =
    trpc.appIntegrations.listAvailableApps.useQuery({});

  // Fetch user's connections
  const { data: userConnections, isLoading: connectionsLoading } =
    trpc.appIntegrations.getUserConnections.useQuery();

  // Mutations
  const connectAppMutation = trpc.appIntegrations.connectApp.useMutation({
    onSuccess: () => {
      toast.success("App connected successfully");
      // Refresh connections
      userConnectionsUtils.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to connect app");
    },
  });

  const disconnectAppMutation = trpc.appIntegrations.disconnectApp.useMutation({
    onSuccess: () => {
      toast.success("App disconnected");
      userConnectionsUtils.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to disconnect app");
    },
  });

  const userConnectionsUtils = trpc.useUtils().appIntegrations.getUserConnections;

  // Track connected apps
  useEffect(() => {
    if (userConnections) {
      const connectedIds = new Set(userConnections.map((c) => c.appId));
      setConnectedAppIds(connectedIds);
    }
  }, [userConnections]);

  // Filter apps by category
  const filteredApps = availableApps?.filter((app) => {
    if (!selectedCategory) return true;
    return app.category === selectedCategory;
  });

  // Get unique categories
  const categories = Array.from(
    new Set(availableApps?.map((app) => app.category) || [])
  );

  const handleConnect = (appId: number) => {
    connectAppMutation.mutate({ appId });
  };

  const handleDisconnect = (connectionId: number) => {
    disconnectAppMutation.mutate({ connectionId });
  };

  const getConnectionForApp = (appId: number) => {
    return userConnections?.find((c) => c.appId === appId);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">App Store</h1>
          <p className="text-muted-foreground">
            Connect third-party services to enhance your L.A.W.S. Collective experience
          </p>
        </div>

        {/* Connected Apps Summary */}
        {userConnections && userConnections.length > 0 && (
          <Card className="mb-8 p-6 bg-accent/5 border-accent/20">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Your Connected Apps ({userConnections.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {userConnections.map((connection) => (
                <div
                  key={connection.id}
                  className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
                >
                  <div className="flex items-center gap-2">
                    {connection.app?.logoUrl && (
                      <img
                        src={connection.app.logoUrl}
                        alt={connection.app.name}
                        className="w-6 h-6 rounded"
                      />
                    )}
                    <span className="text-sm font-medium text-foreground">
                      {connection.app?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {connection.status === "connected" ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Category Tabs */}
        <Tabs
          defaultValue={categories[0] || "all"}
          className="mb-8"
          onValueChange={(value) => setSelectedCategory(value === "all" ? null : value)}
        >
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:grid-cols-9">
            <TabsTrigger value="all">All</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                <span className="mr-2">{CATEGORY_ICONS[category] || "⚙️"}</span>
                <span className="hidden sm:inline capitalize">
                  {category.replace("_", " ")}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Apps Grid */}
        {appsLoading || connectionsLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApps?.map((app) => {
              const connection = getConnectionForApp(app.id);
              const isConnected = !!connection;

              return (
                <Card key={app.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {app.logoUrl && (
                        <img
                          src={app.logoUrl}
                          alt={app.name}
                          className="w-12 h-12 rounded-lg"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold text-foreground">{app.name}</h3>
                        <Badge variant="outline" className="mt-1">
                          {CATEGORY_ICONS[app.category]} {app.category.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{app.description}</p>

                  {/* Auth Type Badge */}
                  <div className="mb-4">
                    <Badge variant="secondary" className="text-xs">
                      {app.authType === "oauth" && "🔐 OAuth"}
                      {app.authType === "api_key" && "🔑 API Key"}
                      {app.authType === "username_password" && "👤 Username/Password"}
                      {app.authType === "none" && "✓ No Auth"}
                    </Badge>
                  </div>

                  {/* Connection Status */}
                  {isConnected && (
                    <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span>Connected</span>
                      </div>
                      {connection.lastSyncedAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Last synced: {new Date(connection.lastSyncedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {isConnected ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        onClick={() => handleDisconnect(connection.id)}
                        disabled={disconnectAppMutation.isPending}
                      >
                        {disconnectAppMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Disconnecting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Disconnect
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full"
                        onClick={() => handleConnect(app.id)}
                        disabled={connectAppMutation.isPending}
                      >
                        {connectAppMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Connect
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Website Link */}
                  {app.website && (
                    <a
                      href={app.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent hover:underline mt-3 block"
                    >
                      Visit Website →
                    </a>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!appsLoading && (!filteredApps || filteredApps.length === 0) && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No apps found in this category</p>
            <Button
              variant="outline"
              onClick={() => setSelectedCategory(null)}
            >
              View All Apps
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
