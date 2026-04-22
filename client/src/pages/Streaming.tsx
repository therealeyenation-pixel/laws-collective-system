import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaPlayer } from "@/components/MediaPlayer";
import { trpc } from "@/lib/trpc";
import { Play, Music, Radio, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Channel {
  id: number;
  title: string;
  category: string;
  description?: string;
  contentType: string;
  streamUrl?: string;
  artist?: string;
}

export default function Streaming() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedChannel, setSelectedChannel] = useState<any>(null);

  // Fetch approved channels
  const { data: channelsData, isLoading, error } = trpc.streamingContent.getApprovedChannels.useQuery(
    { category: selectedCategory !== "all" ? selectedCategory : undefined },
    { staleTime: 5 * 60 * 1000 } // Cache for 5 minutes
  );

  const channels = channelsData?.channels || [];
  
  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(channels.map((c: any) => c.category || "Other"));
    return Array.from(cats).sort();
  }, [channels]);

  // Filter by search query
  const filteredChannels = useMemo(() => {
    if (!searchQuery) return channels;
    return channels.filter((c: any) =>
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [channels, searchQuery]);

  const handlePlayChannel = (channel: any) => {
    if (!channel.streamUrl) {
      toast.error("Stream URL not available for this channel");
      return;
    }
    setSelectedChannel(channel);
  };

  return (
    <DashboardLayout>
      {selectedChannel && (
        <MediaPlayer
          channel={selectedChannel}
          onClose={() => setSelectedChannel(null)}
        />
      )}
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Streaming Hub</h1>
          <p className="text-muted-foreground mt-1">Discover and stream approved channels</p>
        </div>

        {/* Search and Filter */}
        <div className="space-y-4">
          <Input
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              size="sm"
            >
              All Categories
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat)}
                size="sm"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <CardContent className="flex items-center gap-2 py-4">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700 dark:text-red-400">Failed to load channels</span>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && filteredChannels.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">No channels available in this category</p>
            </CardContent>
          </Card>
        )}

        {/* Channels Grid */}
        {!isLoading && filteredChannels.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChannels.map((channel: any) => (
              <Card key={channel.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-base line-clamp-2">{channel.title}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">{channel.category}</p>
                    </div>
                    {channel.contentType === "music_track" ? (
                      <Music className="w-5 h-5 text-accent flex-shrink-0" />
                    ) : (
                      <Radio className="w-5 h-5 text-accent flex-shrink-0" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {channel.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{channel.description}</p>
                  )}
                  {channel.artist && (
                    <p className="text-xs text-muted-foreground">Artist: {channel.artist}</p>
                  )}
                  <Button
                    onClick={() => handlePlayChannel(channel)}
                    className="w-full gap-2"
                    size="sm"
                  >
                    <Play className="w-4 h-4" />
                    Play
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {!isLoading && (
          <div className="text-sm text-muted-foreground text-center">
            Showing {filteredChannels.length} of {channels.length} channels
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
