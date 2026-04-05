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
import { Loader2, Plus, Edit2, Trash2, Radio } from "lucide-react";
import { toast } from "sonner";

export default function BroadcastChannels() {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category: "education",
    description: "",
    broadcastFormat: "podcast",
  });

  const { data: channelsData, isLoading, refetch } = trpc.broadcastRadio.getChannels.useQuery({
    limit: 20,
    offset: 0,
  });

  const createChannelMutation = trpc.broadcastRadio.createChannel.useMutation({
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

  const updateChannelMutation = trpc.broadcastRadio.updateChannel.useMutation({
    onSuccess: () => {
      toast.success("Channel updated successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Error updating channel: ${error.message}`);
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
      category: formData.category as any,
      description: formData.description,
      broadcastFormat: formData.broadcastFormat as any,
    });
  };

  const handleToggleMonetization = async (channelId: number, isMonetized: boolean) => {
    await updateChannelMutation.mutateAsync({
      channelId,
      isMonetized: !isMonetized,
      monetizationTier: !isMonetized ? "basic" : "free",
    });
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
          <h1 className="text-3xl font-bold">Broadcast Channels</h1>
        </div>
        <Button
          onClick={() => setIsCreating(!isCreating)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          New Channel
        </Button>
      </div>

      {/* Create Channel Form */}
      {isCreating && (
        <Card className="p-6 bg-secondary/30">
          <h2 className="text-xl font-semibold mb-4">Create New Channel</h2>
          <form onSubmit={handleCreateChannel} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Channel Name</label>
                <Input
                  placeholder="e.g., Tech Talk Daily"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <Input
                  placeholder="e.g., tech-talk-daily"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
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
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Format</label>
                <Select
                  value={formData.broadcastFormat}
                  onValueChange={(value) =>
                    setFormData({ ...formData, broadcastFormat: value })
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

      {/* Channels List */}
      <div className="grid grid-cols-1 gap-4">
        {channelsData?.channels && channelsData.channels.length > 0 ? (
          channelsData.channels.map((channel) => (
            <Card key={channel.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{channel.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {channel.description}
                  </p>
                  <div className="flex gap-4 mt-3 text-sm">
                    <span className="px-2 py-1 bg-accent/10 text-accent rounded">
                      {channel.category}
                    </span>
                    <span className="px-2 py-1 bg-secondary/50 rounded">
                      {channel.broadcastFormat}
                    </span>
                    <span className="text-muted-foreground">
                      {channel.totalEpisodes} episodes
                    </span>
                    <span className="text-muted-foreground">
                      {channel.totalListeners} listeners
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleToggleMonetization(channel.id, channel.isMonetized)
                    }
                  >
                    {channel.isMonetized ? "Monetized" : "Monetize"}
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center text-muted-foreground">
            <Radio className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No channels yet. Create your first broadcast channel!</p>
          </Card>
        )}
      </div>

      {/* Pagination Info */}
      {channelsData && (
        <div className="text-sm text-muted-foreground text-center">
          Showing {channelsData.channels.length} of {channelsData.total} channels
        </div>
      )}
    </div>
  );
}
