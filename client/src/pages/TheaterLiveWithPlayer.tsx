import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { HLSVideoPlayer } from "@/components/HLSVideoPlayer";
import { Play, Grid, List } from "lucide-react";

export default function TheaterLiveWithPlayer() {
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: channels, isLoading } = trpc.iptvTheater.getChannels.useQuery();

  const categories = [
    { id: "all", name: "All Channels" },
    { id: "news", name: "News" },
    { id: "sports", name: "Sports" },
    { id: "entertainment", name: "Entertainment" },
    { id: "music", name: "Music" },
    { id: "kids", name: "Kids" },
    { id: "educational", name: "Educational" },
  ];

  const filteredChannels =
    selectedCategory === "all"
      ? channels
      : channels?.filter(
          (ch: any) =>
            ch.category?.toLowerCase().includes(selectedCategory.toLowerCase())
        );

  return (
    <div className="min-h-screen bg-background">
      {/* Video Player */}
      {selectedChannel && (
        <div className="bg-black p-6">
          <div className="max-w-6xl mx-auto">
            <HLSVideoPlayer
              streamUrl={selectedChannel.streamUrl}
              title={selectedChannel.name}
              poster={selectedChannel.bannerUrl}
            />
            <div className="mt-4">
              <h2 className="text-2xl font-bold text-white mb-2">
                {selectedChannel.name}
              </h2>
              <p className="text-gray-300">{selectedChannel.description}</p>
              <div className="flex gap-4 mt-4">
                <div className="text-sm text-gray-400">
                  Viewers: {selectedChannel.currentViewers?.toLocaleString() || 0}
                </div>
                <div className="text-sm text-gray-400">
                  Rating: {selectedChannel.contentRating}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Channel Browser */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-foreground">
              Theater Live
            </h1>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={viewMode === "grid" ? "default" : "outline"}
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === "list" ? "default" : "outline"}
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                size="sm"
                variant={selectedCategory === cat.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
              </Button>
            ))}
          </div>

          {/* Channels Display */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : !filteredChannels || filteredChannels.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No channels available</p>
              <Button variant="outline">Import M3U Playlist</Button>
            </Card>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredChannels.map((channel: any) => (
                <Card
                  key={channel.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedChannel(channel)}
                >
                  <div className="aspect-video bg-gray-900 relative group">
                    {channel.bannerUrl ? (
                      <img
                        src={channel.bannerUrl}
                        alt={channel.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-primary/50">
                        <Play className="w-8 h-8 text-white" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-foreground truncate">
                      {channel.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {channel.category}
                    </p>
                    <div className="text-xs text-muted-foreground mt-2">
                      {channel.currentViewers?.toLocaleString() || 0} viewers
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredChannels.map((channel: any) => (
                <Card
                  key={channel.id}
                  className="p-4 hover:bg-secondary/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedChannel(channel)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-16 bg-gray-900 rounded flex-shrink-0">
                      {channel.bannerUrl ? (
                        <img
                          src={channel.bannerUrl}
                          alt={channel.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-primary/50 rounded">
                          <Play className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {channel.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {channel.description}
                      </p>
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{channel.category}</span>
                        <span>
                          {channel.currentViewers?.toLocaleString() || 0} viewers
                        </span>
                        <span>{channel.contentRating}</span>
                      </div>
                    </div>
                    <Button size="sm">
                      <Play className="w-4 h-4 mr-2" />
                      Watch
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
