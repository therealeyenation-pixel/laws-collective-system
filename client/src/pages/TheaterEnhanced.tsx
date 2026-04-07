import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Play, Share2, Clock, Users, Sparkles, Heart } from "lucide-react";
import { toast } from "sonner";

export default function TheaterEnhanced() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  // Fetch channels - using working pattern from TheaterLiveReal
  const { data: channels = [], isLoading } = trpc.streamingContent.getChannels.useQuery({
    category: selectedCategory,
    limit: 50,
  });

  // Filter channels by search
  const filteredChannels = useMemo(() => {
    if (!searchQuery) return channels;
    return channels.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [channels, searchQuery]);

  const categories = ["news", "sports", "entertainment", "music", "kids", "documentary"];

  const handleToggleFavorite = (channelId: number) => {
    setFavorites((prev) =>
      prev.includes(channelId) ? prev.filter((id) => id !== channelId) : [...prev, channelId]
    );
    toast.success(favorites.includes(channelId) ? "Removed from favorites" : "Added to favorites");
  };

  const handleShare = (channel: any) => {
    const shareUrl = `${window.location.origin}/theater-live?channel=${channel.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success(`Shared: ${channel.name}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Loading channels...</p>
      </div>
    );
  }

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
              <Button
                variant={selectedCategory === undefined ? "default" : "outline"}
                onClick={() => setSelectedCategory(undefined)}
                className="whitespace-nowrap"
              >
                All
              </Button>
              {categories.map((cat) => (
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
            {filteredChannels.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredChannels.map((channel) => (
                  <Card
                    key={channel.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedChannel(channel)}
                  >
                    <div className="aspect-video bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center relative">
                      <Play className="w-12 h-12 text-accent" />
                      {channel.isLive && (
                        <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
                          LIVE
                        </div>
                      )}
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-bold text-foreground">{channel.name}</h3>
                        <p className="text-sm text-muted-foreground">{channel.category}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{channel.viewers?.toLocaleString() || "0"} watching</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedChannel(channel);
                          }}
                          className="flex-1 gap-2"
                        >
                          <Play className="w-4 h-4" />
                          Play
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(channel.id);
                          }}
                          className={favorites.includes(channel.id) ? "bg-red-600 text-white" : ""}
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(channel);
                          }}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No channels found</p>
              </div>
            )}
          </TabsContent>

          {/* EPG Schedule Tab */}
          <TabsContent value="schedule" className="space-y-4">
            {selectedChannel ? (
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Schedule for {selectedChannel.name}
                </h3>
                <div className="space-y-3">
                  {[
                    { time: "12:00 PM", program: "Morning News", duration: "1h" },
                    { time: "1:00 PM", program: "Lunch Break Show", duration: "1h" },
                    { time: "2:00 PM", program: "Afternoon Special", duration: "2h" },
                    { time: "4:00 PM", program: "Sports Update", duration: "1h" },
                    { time: "5:00 PM", program: "Evening News", duration: "1h" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-accent/5 rounded">
                      <div>
                        <p className="font-medium text-foreground">{item.program}</p>
                        <p className="text-sm text-muted-foreground">{item.time}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">{item.duration}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Select a channel to view its schedule</p>
              </div>
            )}
          </TabsContent>

          {/* Trending Tab */}
          <TabsContent value="trending" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                <h2 className="text-2xl font-bold text-foreground">Trending Now</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {channels.slice(0, 6).map((channel) => (
                  <Card key={channel.id} className="p-4 hover:bg-accent/5 cursor-pointer transition">
                    <p className="font-semibold text-foreground">{channel.name}</p>
                    <p className="text-sm text-muted-foreground">{channel.category}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{channel.viewers?.toLocaleString() || "0"} watching</span>
                    </div>
                    <Button size="sm" variant="default" className="mt-3 w-full gap-2">
                      <Play className="w-4 h-4" />
                      Watch
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
