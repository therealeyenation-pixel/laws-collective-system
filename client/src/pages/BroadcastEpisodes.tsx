import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Play, Download, MessageSquare, ThumbsUp } from "lucide-react";
import { toast } from "sonner";

interface Episode {
  id: number;
  title: string;
  description?: string;
  audioDuration: number;
  status: string;
  viewCount: number;
  downloadCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt?: Date;
  guestName?: string;
}

export default function BroadcastEpisodes() {
  const [channelId, setChannelId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    audioUrl: "",
    audioDuration: 0,
    guestName: "",
  });

  const { data: episodesData, isLoading, refetch } = trpc.broadcastRadio.getEpisodes.useQuery(
    { channelId: channelId || 1, limit: 20, offset: 0 },
    { enabled: !!channelId }
  );

  const createEpisodeMutation = trpc.broadcastRadio.createEpisode.useMutation({
    onSuccess: () => {
      toast.success("Episode created successfully");
      setFormData({
        title: "",
        slug: "",
        description: "",
        audioUrl: "",
        audioDuration: 0,
        guestName: "",
      });
      setIsCreating(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Error creating episode: ${error.message}`);
    },
  });

  const publishEpisodeMutation = trpc.broadcastRadio.publishEpisode.useMutation({
    onSuccess: () => {
      toast.success("Episode published successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Error publishing episode: ${error.message}`);
    },
  });

  const handleCreateEpisode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.slug || !formData.audioUrl) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!channelId) {
      toast.error("Please select a channel");
      return;
    }

    await createEpisodeMutation.mutateAsync({
      channelId,
      title: formData.title,
      slug: formData.slug,
      description: formData.description,
      audioUrl: formData.audioUrl,
      audioDuration: formData.audioDuration,
      guestName: formData.guestName,
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Episodes</h1>
        <Button
          onClick={() => setIsCreating(!isCreating)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          New Episode
        </Button>
      </div>

      {/* Create Episode Form */}
      {isCreating && (
        <Card className="p-6 bg-secondary/30">
          <h2 className="text-xl font-semibold mb-4">Create New Episode</h2>
          <form onSubmit={handleCreateEpisode} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Episode Title</label>
                <Input
                  placeholder="e.g., Episode 1: Getting Started"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <Input
                  placeholder="e.g., episode-1-getting-started"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Audio URL</label>
                <Input
                  type="url"
                  placeholder="https://example.com/episode.mp3"
                  value={formData.audioUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, audioUrl: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration (seconds)</label>
                <Input
                  type="number"
                  placeholder="3600"
                  value={formData.audioDuration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      audioDuration: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Guest Name (optional)</label>
              <Input
                placeholder="Guest name"
                value={formData.guestName}
                onChange={(e) =>
                  setFormData({ ...formData, guestName: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                placeholder="Episode description..."
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
                disabled={createEpisodeMutation.isPending}
              >
                {createEpisodeMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Episode"
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

      {/* Episodes List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : episodesData?.episodes && episodesData.episodes.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {episodesData.episodes.map((episode: Episode) => (
            <Card key={episode.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{episode.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(episode.status)}`}>
                      {episode.status}
                    </span>
                  </div>

                  {episode.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {episode.description}
                    </p>
                  )}

                  {episode.guestName && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Guest: {episode.guestName}
                    </p>
                  )}

                  <div className="flex gap-6 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Play className="w-4 h-4" />
                      {formatDuration(episode.audioDuration)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Play className="w-4 h-4" />
                      {episode.viewCount} plays
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      {episode.downloadCount} downloads
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      {episode.likeCount} likes
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {episode.commentCount} comments
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {episode.status === "draft" && (
                    <Button
                      size="sm"
                      onClick={() =>
                        publishEpisodeMutation.mutateAsync({ episodeId: episode.id })
                      }
                      disabled={publishEpisodeMutation.isPending}
                    >
                      Publish
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center text-muted-foreground">
          <p>No episodes yet. Create your first episode!</p>
        </Card>
      )}
    </div>
  );
}
