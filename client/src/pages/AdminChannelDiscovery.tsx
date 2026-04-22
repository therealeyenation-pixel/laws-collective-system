import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Check, X, RefreshCw, Filter } from "lucide-react";
import { toast } from "sonner";

interface DiscoveredChannel {
  id?: number;
  title: string;
  description?: string;
  category: string;
  genre?: string;
  dataSource: string;
  externalId: string;
  status?: "pending" | "approved" | "rejected";
}

export default function AdminChannelDiscovery() {
  const [channels, setChannels] = useState<DiscoveredChannel[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<DiscoveredChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [stats, setStats] = useState<any>(null);

  const triggerDiscovery = trpc.streamingContent.triggerDiscovery.useMutation();
  const getStats = trpc.streamingContent.getDiscoveryStats.useQuery();

  // Fetch discovery stats on mount
  useEffect(() => {
    if (getStats.data) {
      setStats(getStats.data);
    }
  }, [getStats.data]);

  // Mock discovered channels for demo (in production, these would come from DB)
  useEffect(() => {
    const mockChannels: DiscoveredChannel[] = [
      {
        id: 1,
        title: "Jazz Masters Live",
        description: "Live jazz performances and sessions",
        category: "music",
        genre: "jazz",
        dataSource: "manus_api",
        externalId: "manus_jazz_001",
        status: "pending",
      },
      {
        id: 2,
        title: "Broadway Theater Channel",
        description: "Broadway shows and theater performances",
        category: "theater",
        genre: "theater",
        dataSource: "youtube",
        externalId: "youtube_broadway_001",
        status: "pending",
      },
      {
        id: 3,
        title: "Classical Music 24/7",
        description: "24-hour classical music streaming",
        category: "music",
        genre: "classical",
        dataSource: "manus_api",
        externalId: "manus_classical_001",
        status: "pending",
      },
      {
        id: 4,
        title: "Rock Legends",
        description: "Classic rock music channel",
        category: "music",
        genre: "rock",
        dataSource: "youtube",
        externalId: "youtube_rock_001",
        status: "pending",
      },
    ];

    setChannels(mockChannels);
    setFilteredChannels(mockChannels);
    setLoading(false);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = channels;

    if (filterCategory !== "all") {
      filtered = filtered.filter((c) => c.category === filterCategory);
    }

    if (filterSource !== "all") {
      filtered = filtered.filter((c) => c.dataSource === filterSource);
    }

    setFilteredChannels(filtered);
  }, [channels, filterCategory, filterSource]);

  const handleTriggerDiscovery = async () => {
    setTriggering(true);
    try {
      const result = await triggerDiscovery.mutateAsync();
      if (result.success) {
        toast.success(`Discovery completed: ${result.data.added} added, ${result.data.updated} updated`);
        // Refresh stats
        getStats.refetch();
      } else {
        toast.error(result.message || "Discovery failed");
      }
    } catch (error) {
      toast.error("Failed to trigger discovery");
    } finally {
      setTriggering(false);
    }
  };

  const handleSelectChannel = (externalId: string) => {
    const newSelected = new Set(selectedChannels);
    if (newSelected.has(externalId)) {
      newSelected.delete(externalId);
    } else {
      newSelected.add(externalId);
    }
    setSelectedChannels(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedChannels.size === filteredChannels.length) {
      setSelectedChannels(new Set());
    } else {
      setSelectedChannels(new Set(filteredChannels.map((c) => c.externalId)));
    }
  };

  const handleApproveSelected = () => {
    toast.success(`Approved ${selectedChannels.size} channels`);
    setSelectedChannels(new Set());
    // In production, this would call an API to approve channels
  };

  const handleRejectSelected = () => {
    toast.info(`Rejected ${selectedChannels.size} channels`);
    setSelectedChannels(new Set());
    // In production, this would call an API to reject channels
  };

  const categories = Array.from(new Set(channels.map((c) => c.category)));
  const sources = Array.from(new Set(channels.map((c) => c.dataSource)));

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Channel Discovery Management</h1>
          <p className="text-muted-foreground">
            Review and approve/reject auto-discovered theater and music channels
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-6">
              <div className="text-sm text-muted-foreground mb-1">Total Channels</div>
              <div className="text-3xl font-bold text-foreground">{stats.totalChannels}</div>
            </Card>
            <Card className="p-6">
              <div className="text-sm text-muted-foreground mb-1">Pending Review</div>
              <div className="text-3xl font-bold text-yellow-600">{filteredChannels.length}</div>
            </Card>
            <Card className="p-6">
              <div className="text-sm text-muted-foreground mb-1">Data Sources</div>
              <div className="text-sm text-foreground">
                {Object.entries(stats.bySource || {})
                  .map(([source, count]) => `${source}: ${count}`)
                  .join(" • ")}
              </div>
            </Card>
          </div>
        )}

        {/* Controls */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Filters */}
              <div className="flex gap-2">
                <Filter className="w-5 h-5 text-muted-foreground mt-2" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-border rounded bg-background text-foreground text-sm"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>

                <select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value)}
                  className="px-3 py-2 border border-border rounded bg-background text-foreground text-sm"
                >
                  <option value="all">All Sources</option>
                  {sources.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={handleTriggerDiscovery}
                disabled={triggering}
                variant="default"
                className="flex-1 sm:flex-none"
              >
                {triggering ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Trigger Discovery
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Batch Actions */}
        {selectedChannels.size > 0 && (
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8 flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {selectedChannels.size} channel(s) selected
            </span>
            <div className="flex gap-2">
              <Button
                onClick={handleApproveSelected}
                variant="default"
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-1" />
                Approve
              </Button>
              <Button
                onClick={handleRejectSelected}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <X className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </div>
          </div>
        )}

        {/* Channels List */}
        <div className="space-y-4">
          {/* Select All Header */}
          <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg">
            <input
              type="checkbox"
              checked={selectedChannels.size === filteredChannels.length && filteredChannels.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded border-border"
            />
            <span className="text-sm font-medium text-foreground">
              {selectedChannels.size === filteredChannels.length && filteredChannels.length > 0
                ? "Deselect All"
                : "Select All"}
            </span>
          </div>

          {/* Channel Cards */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredChannels.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No channels to review</p>
            </Card>
          ) : (
            filteredChannels.map((channel) => (
              <Card
                key={channel.externalId}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleSelectChannel(channel.externalId)}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedChannels.has(channel.externalId)}
                    onChange={() => handleSelectChannel(channel.externalId)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 rounded border-border mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground truncate">{channel.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {channel.description || "No description"}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">
                          {channel.category}
                        </span>
                        {channel.genre && (
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-secondary/10 text-secondary-foreground rounded">
                            {channel.genre}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                      <span>Source: {channel.dataSource}</span>
                      <span>ID: {channel.externalId}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
