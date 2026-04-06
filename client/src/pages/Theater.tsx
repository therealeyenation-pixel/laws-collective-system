import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Play, Heart, Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Channel {
  id: string;
  name: string;
  category: string;
  logo?: string;
  streamUrl: string;
  isLive: boolean;
  quality?: string;
  viewers?: number;
}

export default function Theater() {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Fetch all channels
  const { data: allChannelsData, isLoading: loadingChannels } =
    trpc.iptv.getAllChannels.useQuery({
      limit: 100,
      offset: 0,
    });

  // Fetch categories
  const { data: categoriesData } = trpc.iptv.getCategories.useQuery();

  // Fetch trending channels
  const { data: trendingData } = trpc.iptv.getTrending.useQuery({
    limit: 10,
  });

  // Search channels
  const { data: searchData, isLoading: searchLoading } =
    trpc.iptv.searchChannels.useQuery(
      { query: searchQuery, category: selectedCategory || undefined },
      { enabled: searchQuery.length > 0 }
    );

  // Get channels by category
  const { data: categoryData } = trpc.iptv.getByCategory.useQuery(
    { category: selectedCategory || "" },
    { enabled: !!selectedCategory }
  );

  const channels = searchQuery
    ? searchData?.channels || []
    : selectedCategory
      ? categoryData?.channels || []
      : allChannelsData?.channels || [];

  const categories = categoriesData?.categories || [];

  const toggleFavorite = (channelId: string) => {
    setFavorites((prev) =>
      prev.includes(channelId)
        ? prev.filter((id) => id !== channelId)
        : [...prev, channelId]
    );
    toast.success(
      favorites.includes(channelId)
        ? "Removed from favorites"
        : "Added to favorites"
    );
  };

  const handlePlayChannel = (channel: Channel) => {
    setSelectedChannel(channel);
    toast.success(`Now playing: ${channel.name}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Theater</h1>
        <p className="text-muted-foreground">
          Stream 11,000+ live channels from around the world
        </p>
      </div>

      {/* Search & Filter */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Search channels..."
            className="pl-10 h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={!selectedCategory ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Player */}
        <div className="lg:col-span-3">
          {selectedChannel ? (
            <Card className="p-0 overflow-hidden bg-black">
              <div className="relative w-full bg-black aspect-video flex items-center justify-center">
                <video
                  key={selectedChannel.id}
                  className="w-full h-full"
                  controls
                  autoPlay
                >
                  <source src={selectedChannel.streamUrl} type="application/x-mpegURL" />
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Player Controls */}
              <div className="p-4 bg-card border-t border-border">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {selectedChannel.name}
                    </h2>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-muted-foreground">
                        {selectedChannel.category}
                      </span>
                      {selectedChannel.isLive && (
                        <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">
                          LIVE
                        </span>
                      )}
                      {selectedChannel.quality && (
                        <span className="text-sm text-muted-foreground">
                          {selectedChannel.quality}
                        </span>
                      )}
                      {selectedChannel.viewers && (
                        <span className="text-sm text-muted-foreground">
                          {selectedChannel.viewers.toLocaleString()} watching
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toggleFavorite(selectedChannel.id)
                      }
                    >
                      <Heart
                        size={18}
                        className={
                          favorites.includes(selectedChannel.id)
                            ? "fill-red-600 text-red-600"
                            : ""
                        }
                      />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 size={18} />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-12 flex items-center justify-center bg-secondary/30 aspect-video">
              <div className="text-center">
                <Play size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Select a channel to start watching
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar - Playlist */}
        <div className="lg:col-span-1">
          <Card className="p-4 h-fit max-h-96 overflow-y-auto">
            <h3 className="font-bold text-foreground mb-4">
              {selectedCategory ? `${selectedCategory} Channels` : "All Channels"}
            </h3>

            {loadingChannels || searchLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-muted-foreground" />
              </div>
            ) : channels.length === 0 ? (
              <p className="text-sm text-muted-foreground">No channels found</p>
            ) : (
              <div className="space-y-2">
                {channels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => handlePlayChannel(channel)}
                    className={`
                      w-full text-left p-2 rounded-lg transition-colors
                      ${
                        selectedChannel?.id === channel.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-secondary text-foreground"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      {channel.logo && (
                        <img
                          src={channel.logo}
                          alt={channel.name}
                          className="w-8 h-8 rounded object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {channel.name}
                        </p>
                        {channel.isLive && (
                          <span className="text-xs text-red-600 font-bold">
                            LIVE
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Trending Section */}
      {!selectedCategory && !searchQuery && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Trending Now</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {trendingData?.channels.map((channel) => (
              <Card
                key={channel.id}
                className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                onClick={() => handlePlayChannel(channel)}
              >
                {channel.logo && (
                  <img
                    src={channel.logo}
                    alt={channel.name}
                    className="w-full h-32 object-cover"
                  />
                )}
                <div className="p-3">
                  <h3 className="font-semibold text-foreground text-sm truncate">
                    {channel.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {channel.category}
                  </p>
                  {channel.isLive && (
                    <span className="inline-block mt-2 px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">
                      LIVE
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
