import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Shuffle,
  Repeat,
  Heart,
  Share2,
  Music,
  Search,
  Sparkles,
  ListMusic,
} from "lucide-react";
import { toast } from "sonner";

export default function MusicPlayerEnhanced() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off");
  const [volume, setVolume] = useState(70);
  const [progress, setProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedMood, setSelectedMood] = useState("all");

  // Fetch tracks
  const { data: tracks = [] } = trpc.streamingContent.getTracks.useQuery({
    limit: 50,
  });

  // Get recommendations
  const recommendedTracks = trpc.streamingRecommendations.getSimilarContent.useMutation();

  const currentTrack = tracks[currentTrackIndex];

  // Filter tracks by search
  const filteredTracks = useMemo(() => {
    if (!searchQuery) return tracks;
    return tracks.filter(t =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tracks, searchQuery]);

  const moods = ["all", "happy", "sad", "energetic", "chill", "focus", "workout"];

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    toast.success(isPlaying ? "Paused" : "Playing");
  };

  const handleNext = () => {
    if (tracks.length > 0) {
      setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
      setProgress(0);
    }
  };

  const handlePrevious = () => {
    if (tracks.length > 0) {
      setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
      setProgress(0);
    }
  };

  const handleToggleFavorite = (trackId: number) => {
    setFavorites((prev) =>
      prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId]
    );
    toast.success(favorites.includes(trackId) ? "Removed from favorites" : "Added to favorites");
  };

  const handleShare = (track: any) => {
    const shareUrl = `${window.location.origin}/music?track=${track.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success(`Shared: ${track.title}`);
  };

  const handleGetRecommendations = async (track: any) => {
    try {
      const result = await recommendedTracks.mutateAsync({
        contentType: "track",
        title: track.title,
        genre: "music",
        limit: 5
      });
      console.log("Recommendations:", result);
    } catch (error) {
      console.error("Error getting recommendations:", error);
    }
  };

  if (tracks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Loading music tracks...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Music className="w-8 h-8 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">Music Player</h1>
          </div>
          <p className="text-muted-foreground">Stream music with recommendations and sharing</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search tracks, artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>

        <Tabs defaultValue="player" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="player">Now Playing</TabsTrigger>
            <TabsTrigger value="library">Library</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
          </TabsList>

          {/* Now Playing Tab */}
          <TabsContent value="player" className="space-y-6">
            {currentTrack ? (
              <div className="space-y-6">
                {/* Player Card */}
                <Card className="p-8 bg-gradient-to-br from-accent/10 to-accent/5">
                  <div className="text-center space-y-6">
                    <div className="w-48 h-48 mx-auto bg-gradient-to-br from-accent to-accent/50 rounded-lg flex items-center justify-center">
                      <Music className="w-24 h-24 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-foreground">{currentTrack.title}</h2>
                      <p className="text-lg text-muted-foreground mt-2">{currentTrack.artist}</p>
                      <p className="text-sm text-muted-foreground">{currentTrack.album}</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={(e) => setProgress(Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{Math.floor((progress / 100) * currentTrack.duration)}s</span>
                        <span>{currentTrack.duration}s</span>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setIsShuffle(!isShuffle)}
                        className={isShuffle ? "bg-accent text-white" : ""}
                      >
                        <Shuffle className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={handlePrevious}
                      >
                        <SkipBack className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="default"
                        size="lg"
                        onClick={handlePlayPause}
                        className="gap-2 px-8"
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        {isPlaying ? "Pause" : "Play"}
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={handleNext}
                      >
                        <SkipForward className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setRepeatMode(repeatMode === "off" ? "all" : repeatMode === "all" ? "one" : "off")}
                        className={repeatMode !== "off" ? "bg-accent text-white" : ""}
                      >
                        <Repeat className="w-5 h-5" />
                      </Button>
                    </div>

                    {/* Volume */}
                    <div className="flex items-center justify-center gap-4">
                      <Volume2 className="w-5 h-5 text-muted-foreground" />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="w-32"
                      />
                      <span className="text-sm text-muted-foreground">{volume}%</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => handleToggleFavorite(currentTrack.id)}
                        className={favorites.includes(currentTrack.id) ? "bg-red-600 text-white" : ""}
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleShare(currentTrack)}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Queue */}
                <Card className="p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <ListMusic className="w-5 h-5" />
                    Queue
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {tracks.map((track, idx) => (
                      <div
                        key={idx}
                        onClick={() => setCurrentTrackIndex(idx)}
                        className={`p-3 rounded cursor-pointer transition ${
                          idx === currentTrackIndex
                            ? "bg-accent text-white"
                            : "bg-accent/5 hover:bg-accent/10"
                        }`}
                      >
                        <p className="font-medium">{track.title}</p>
                        <p className="text-sm opacity-75">{track.artist}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No tracks available</p>
              </div>
            )}
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTracks.map((track) => (
                <Card
                  key={track.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setCurrentTrackIndex(tracks.indexOf(track))}
                >
                  <div className="aspect-square bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
                    <Music className="w-12 h-12 text-accent" />
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-foreground">{track.title}</h3>
                      <p className="text-sm text-muted-foreground">{track.artist}</p>
                      <p className="text-xs text-muted-foreground mt-1">{track.album}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentTrackIndex(tracks.indexOf(track));
                          setIsPlaying(true);
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
                          handleToggleFavorite(track.id);
                        }}
                        className={favorites.includes(track.id) ? "bg-red-600 text-white" : ""}
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-4">
            {currentTrack ? (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent" />
                    Similar Tracks
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGetRecommendations(currentTrack)}
                  >
                    Get Recommendations
                  </Button>
                </div>
                <div className="space-y-2">
                  {[
                    { title: "Blinding Lights (Remix)", artist: "The Weeknd" },
                    { title: "Levitating (Extended)", artist: "Dua Lipa" },
                    { title: "As It Was (Acoustic)", artist: "Harry Styles" }
                  ].map((track, idx) => (
                    <Card key={idx} className="p-3 flex items-center justify-between hover:bg-accent/5">
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
              </Card>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Select a track to get recommendations</p>
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
                {tracks.slice(0, 6).map((track) => (
                  <Card key={track.id} className="p-4 hover:bg-accent/5 cursor-pointer transition">
                    <p className="font-semibold text-foreground">{track.title}</p>
                    <p className="text-sm text-muted-foreground">{track.artist}</p>
                    <Button size="sm" variant="default" className="mt-3 w-full gap-2">
                      <Play className="w-4 h-4" />
                      Play
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
