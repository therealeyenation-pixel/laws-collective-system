import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Play, Share2, Clock, Users, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function TheaterEnhanced() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedChannel, setSelectedChannel] = useState<any>(null);

  // Fetch channels
  const { data: channelsData } = trpc.streamingContent.getChannels.useQuery({ type: "channels" });
  const channels = channelsData?.channels || [];

  // Fetch EPG schedule
  const { data: epgData } = trpc.streamingEpg.getSchedule.useQuery(
    { channelId: selectedChannel?.id || "bbc-news" },
    { enabled: !!selectedChannel }
  );

  // Search functionality
  const { data: searchResults } = trpc.streamingEpg.search.useQuery(
    { query: searchQuery, type: "all" },
    { enabled: searchQuery.length > 0 }
  );

  // Get trending content
  const { data: trendingTracks } = trpc.streamingEpg.getTrending.useQuery({ type: "tracks", limit: 5 });
  const { data: trendingStations } = trpc.streamingEpg.getTrending.useQuery({ type: "stations", limit: 5 });

  // Filter channels by category
  const filteredChannels = useMemo(() => {
    let filtered = channels;
    if (selectedCategory !== "all") {
      filtered = filtered.filter(ch => ch.category === selectedCategory);
    }
    if (searchQuery) {
      filtered = filtered.filter(ch => 
        ch.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [channels, selectedCategory, searchQuery]);

  const categories = ["all", "news", "sports", "entertainment", "music", "kids", "documentary"];

  const handleShare = (channel: any) => {
    const shareUrl = `${window.location.origin}/theater-live?channel=${channel.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success(`Shared: ${channel.name}`);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Live Theater & IPTV</h1>
          <p className="text-muted-foreground">Watch live channels with EPG guide and recommendations</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search channels, programs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>

        <Tabs defaultValue="channels" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="channels">Channels</TabsTrigger>
            <TabsTrigger value="schedule">EPG Schedule</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
          </TabsList>

          {/* Channels Tab */}
          <TabsContent value="channels" className="space-y-4">
            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat)}
                  className="whitespace-nowrap capitalize"
                >
                  {cat}
                </Button>
              ))}
            </div>

            {/* Channels Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredChannels.map(channel => (
                <Card
                  key={channel.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedChannel(channel)}
                >
                  <div className="aspect-video bg-black flex items-center justify-center relative">
                    <Play className="w-12 h-12 text-white opacity-70" />
                    <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                      LIVE
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-foreground">{channel.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{channel.category}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      {channel.viewers?.toLocaleString() || "0"} watching
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(channel);
                      }}
                      className="w-full gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Search Results */}
            {searchQuery && searchResults && (
              <div className="mt-8 space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Search Results</h2>
                {searchResults.channels?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Channels</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {searchResults.channels.map((ch: any) => (
                        <Card key={ch.id} className="p-3 cursor-pointer hover:bg-accent" onClick={() => setSelectedChannel(ch)}>
                          <p className="font-medium">{ch.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">{ch.category}</p>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* EPG Schedule Tab */}
          <TabsContent value="schedule" className="space-y-4">
            {selectedChannel ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-accent/10 rounded-lg">
                  <div className="w-16 h-16 bg-black rounded flex items-center justify-center">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{selectedChannel.name}</h2>
                    <p className="text-muted-foreground capitalize">{selectedChannel.category}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">Today's Schedule</h3>
                  {epgData?.programs?.map((program: any) => (
                    <Card key={program.id} className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{program.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{program.description}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {program.duration} minutes
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Play className="w-4 h-4 mr-2" />
                          Watch
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Select a channel to view its schedule</p>
              </div>
            )}
          </TabsContent>

          {/* Trending Tab */}
          <TabsContent value="trending" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                <h2 className="text-2xl font-bold text-foreground">Trending Now</h2>
              </div>

              {trendingTracks && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Top Tracks</h3>
                  {trendingTracks.slice(0, 5).map((track: any, idx: number) => (
                    <Card key={idx} className="p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{track.title}</p>
                        <p className="text-sm text-muted-foreground">{track.artist}</p>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Play className="w-4 h-4" />
                      </Button>
                    </Card>
                  ))}
                </div>
              )}

              {trendingStations && (
                <div className="space-y-3 mt-6">
                  <h3 className="font-semibold text-foreground">Top Stations</h3>
                  {trendingStations.slice(0, 5).map((station: any, idx: number) => (
                    <Card key={idx} className="p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{station.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">{station.genre}</p>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Play className="w-4 h-4" />
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
