import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Edit2, Trash2, Radio, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function BroadcastChannels() {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category: "education" as const,
    description: "",
    broadcastFormat: "podcast" as const,
  });

  const { data: channels, isLoading, refetch } = trpc.broadcast.channels.getAll.useQuery();

  const createChannelMutation = trpc.broadcast.channels.create.useMutation({
    onSuccess: () => {
      toast.success("Channel created successfully");
      setFormData({
        name: "",
        slug: "",
        category: "education",
        description: "",
        broadcastFormat: "podcast",
      });
      setIsCreating(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Error creating channel: ${error.message}`);
    },
  });

  const seedMutation = trpc.broadcast.seed.useMutation({
    onSuccess: (result) => {
      toast.success(
        `Seeded ${result.counts.channels} channels, ${result.counts.episodes} episodes, and ${result.counts.liveBroadcasts} live broadcasts!`
      );
      refetch();
    },
    onError: (error) => {
      toast.error(`Error seeding data: ${error.message}`);
    },
  });

  const updateChannelMutation = trpc.broadcast.channels.update.useMutation({
    onSuccess: () => {
      toast.success("Channel updated successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Error updating channel: ${error.message}`);
    },
  });

  const deleteChannelMutation = trpc.broadcast.channels.delete.useMutation({
    onSuccess: () => {
      toast.success("Channel deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Error deleting channel: ${error.message}`);
    },
  });

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.slug) {
      toast.error("Please fill in all required fields");
      return;
    }

    await createChannelMutation.mutateAsync({
      name: formData.name,
      slug: formData.slug,
      category: formData.category,
      description: formData.description || undefined,
      broadcastFormat: formData.broadcastFormat,
    });
  };

  const handleSeedData = async () => {
    if (channels && channels.length > 0) {
      const confirmed = window.confirm(
        "This will add 10 channels, 10 episodes, and 5 live broadcasts. Continue?"
      );
      if (!confirmed) return;
    }
    await seedMutation.mutateAsync();
  };

  const handleDeleteChannel = async (channelId: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this channel?");
    if (!confirmed) return;
    await deleteChannelMutation.mutateAsync({ id: channelId });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Radio className="w-8 h-8 text-accent" />
          <div>
            <h1 className="text-3xl font-bold">Broadcast Channels</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {channels?.length || 0} channels available
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSeedData}
            variant="outline"
            disabled={seedMutation.isPending}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${seedMutation.isPending ? "animate-spin" : ""}`} />
            {seedMutation.isPending ? "Seeding..." : "Seed Data"}
          </Button>
          <Button
            onClick={() => setIsCreating(!isCreating)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            New Channel
          </Button>
        </div>
      </div>

      {/* Create Channel Form */}
      {isCreating && (
        <Card className="p-6 bg-secondary/30">
          <h2 className="text-xl font-semibold mb-4">Create New Channel</h2>
          <form onSubmit={handleCreateChannel} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Channel Name *</label>
                <Input
                  placeholder="e.g., Tech Talk Daily"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug *</label>
                <Input
                  placeholder="e.g., tech-talk-daily"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      category: value as "education" | "business" | "finance" | "health" | "entertainment" | "news" | "technology" | "culture" | "other",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="news">News</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="culture">Culture</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Format</label>
                <Select
                  value={formData.broadcastFormat}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      broadcastFormat: value as "podcast" | "live_radio" | "hybrid",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="podcast">Podcast</SelectItem>
                    <SelectItem value="live_radio">Live Radio</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                placeholder="Channel description..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={createChannelMutation.isPending}
              >
                {createChannelMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Channel"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreating(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {channels && channels.length > 0 ? (
          channels.map((channel) => (
            <Card key={channel.id} className="p-6 flex flex-col">
              {channel.coverImageUrl && (
                <img
                  src={channel.coverImageUrl}
                  alt={channel.name}
                  className="w-full h-40 object-cover rounded mb-4"
                />
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{channel.name}</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {channel.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-2 py-1 bg-accent/10 text-accent rounded text-xs font-medium">
                    {channel.category}
                  </span>
                  <span className="px-2 py-1 bg-secondary/50 rounded text-xs font-medium">
                    {channel.broadcastFormat.replace("_", " ")}
                  </span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-medium">
                    {channel.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-muted-foreground">
                  <div>Episodes: {channel.totalEpisodes}</div>
                  <div>Listeners: {channel.totalListeners}</div>
                  <div>Downloads: {channel.totalDownloads}</div>
                  <div>{channel.isMonetized ? "💰 Monetized" : "Free"}</div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() =>
                    updateChannelMutation.mutateAsync({
                      id: channel.id,
                      status: channel.status === "active" ? "paused" : "active",
                    })
                  }
                >
                  {channel.status === "active" ? "Pause" : "Activate"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteChannel(channel.id)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card className="p-12 text-center text-muted-foreground">
              <Radio className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg mb-4">No channels yet</p>
              <Button onClick={handleSeedData} disabled={seedMutation.isPending}>
                {seedMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Seeding...
                  </>
                ) : (
                  "Seed Sample Channels"
                )}
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
