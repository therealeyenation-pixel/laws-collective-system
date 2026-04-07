import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Play, Share2, Radio, Users, Sparkles, Volume2 } from "lucide-react";
import { toast } from "sonner";

export default function BroadcastRadioEnhanced() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Fetch stations
  const { data: stations = [] } = trpc.streamingContent.getStations.useQuery({
    category: selectedCategory !== "all" ? selectedCategory : undefined,
    limit: 50,
  });

  // Get recommendations for selected station
  const recommendedStations = trpc.streamingRecommendations.getSimilarContent.useMutation();

  // Filter stations by search
  const filteredStations = useMemo(() => {
    if (!searchQuery) return stations;
    return stations.filter(st => 
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [stations, searchQuery]);

  const categories = ["all", "news", "music", "talk", "sports", "jazz", "classical", "indie"];

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat === "all" ? undefined : cat);
  };

  const handlePlay = (station: any) => {
    setSelectedStation(station);
    setIsPlaying(true);
    toast.success(`Now playing: ${station.name}`);
  };

  const handleShare = (station: any) => {
    const shareUrl = `${window.location.origin}/broadcast-channels?station=${station.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success(`Shared: ${station.name}`);
  };

  const handleGetRecommendations = async (station: any) => {
    try {
      const result = await recommendedStations.mutateAsync({
        contentType: "station",
        title: station.name,
        genre: station.genre,
        limit: 5
      });
      console.log("Recommendations:", result);
    } catch (error) {
      console.error("Error getting recommendations:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Radio className="w-8 h-8 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">Broadcast Radio</h1>
          </div>
          <p className="text-muted-foreground">Listen to live radio stations with recommendations and sharing</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search stations, genres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>

        <Tabs defaultValue="stations" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stations">Stations</TabsTrigger>
            <TabsTrigger value="player">Now Playing</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
          </TabsList>

          {/* Stations Tab */}
          <TabsContent value="stations" className="space-y-4">
            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={(selectedCategory === undefined && cat === "all") || selectedCategory === cat ? "default" : "outline"}
                  onClick={() => handleCategoryChange(cat)}
                  className="whitespace-nowrap capitalize"
                >
                  {cat}
                </Button>
              ))}
            </div>

            {/* Stations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStations.map(station => (
                <Card
                  key={station.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="aspect-square bg-gradient-to-br from-accent/20 to-accent/10 flex flex-col items-center justify-center relative p-6">
                    <Radio className="w-16 h-16 text-accent mb-2" />
                    <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                      LIVE
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-foreground text-lg">{station.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{station.category}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      {station.listeners?.toLocaleString() || "0"} listening
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handlePlay(station)}
                        className="flex-1 gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Play
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShare(station)}
                        className="gap-2"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {filteredStations.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No stations found matching your search</p>
              </div>
            )}
          </TabsContent>

          {/* Now Playing Tab */}
          <TabsContent value="player" className="space-y-4">
            {selectedStation ? (
              <div className="space-y-6">
                {/* Player Card */}
                <Card className="p-8 bg-gradient-to-br from-accent/10 to-accent/5">
                  <div className="text-center space-y-6">
                    <div className="w-32 h-32 mx-auto bg-gradient-to-br from-accent to-accent/50 rounded-lg flex items-center justify-center">
                      <Radio className="w-16 h-16 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-foreground">{selectedStation.name}</h2>
                      <p className="text-lg text-muted-foreground capitalize mt-2">{selectedStation.category}</p>
                    </div>
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="gap-2"
                      >
                        {isPlaying ? "Pause" : "Play"}
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => handleShare(selectedStation)}
                        className="gap-2"
                      >
                        <Share2 className="w-5 h-5" />
                        Share
                      </Button>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Volume2 className="w-5 h-5" />
                      <input type="range" min="0" max="100" defaultValue="70" className="w-32" />
                    </div>
                  </div>
                </Card>

                {/* Station Info */}
                <Card className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Station Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Listeners</p>
                      <p className="text-lg font-bold text-foreground">
                        {selectedStation.listeners?.toLocaleString() || "0"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="text-lg font-bold text-foreground capitalize">{selectedStation.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Bitrate</p>
                      <p className="text-lg font-bold text-foreground">128 kbps</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="text-lg font-bold text-green-600">Live</p>
                    </div>
                  </div>
                </Card>

                {/* Recommendations */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-accent" />
                      Similar Stations
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGetRecommendations(selectedStation)}
                    >
                      Get Recommendations
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: "BBC Radio 2", genre: "music" },
                      { name: "NPR", genre: "news" },
                      { name: "SiriusXM", genre: "music" }
                    ].map((station, idx) => (
                      <Card key={idx} className="p-3 flex items-center justify-between hover:bg-accent/5">
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
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Select a station to start playing</p>
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

              {stations && stations.length > 0 ? (
                <div className="space-y-3">
                  {stations.slice(0, 5).map((station: any, idx: number) => (
                    <Card key={idx} className="p-4 flex items-center justify-between hover:bg-accent/5">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/50 rounded flex items-center justify-center">
                            <Radio className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{station.name}</p>
                            <p className="text-sm text-muted-foreground capitalize">{station.category}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right mr-4">
                        <p className="text-sm text-muted-foreground">Listeners</p>
                        <p className="font-bold text-foreground">{station.listeners?.toLocaleString() || "0"}</p>
                      </div>
                      <Button size="sm" variant="default" onClick={() => handlePlay(station)}>
                        <Play className="w-4 h-4" />
                      </Button>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No trending stations available</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
