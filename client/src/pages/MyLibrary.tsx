/**
 * My Library - Centralized media hub
 * Shows favorites, recently played, and playlists across Theater and Radio
 */

import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  Clock,
  ListMusic,
  Play,
  Pause,
  Tv,
  Radio,
  Search,
  ArrowLeft,
  Star,
  Trash2,
  Plus,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useMediaPlayer } from "@/contexts/MediaPlayerContext";
import { useLocation } from "wouter";

export default function MyLibrary() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("favorites");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "channel" | "station">("all");
  const { playChannel, currentChannel, isPlaying } = useMediaPlayer();

  // Fetch all favorites (no content type filter — get both)
  const { data: allFavorites = [], isLoading: favLoading } =
    trpc.streamingFavorites.getFavorites.useQuery(
      { limit: 100 },
      { enabled: !!user }
    );

  // Fetch all history
  const { data: allHistory = [], isLoading: histLoading } =
    trpc.streamingFavorites.getHistory.useQuery(
      { limit: 50 },
      { enabled: !!user }
    );

  // Fetch all channels and stations for name resolution
  const { data: channels = [] } = trpc.streamingContent.getChannels.useQuery({ limit: 100 });
  const { data: stations = [] } = trpc.streamingContent.getStations.useQuery({ limit: 100 });

  // Fetch playlists
  const { data: playlists = [], refetch: refetchPlaylists } =
    trpc.playlists.getMyPlaylists.useQuery(undefined, { enabled: !!user });

  // Remove favorite mutation
  const removeFavMutation = trpc.streamingFavorites.removeFavorite.useMutation({
    onSuccess: () => {
      toast.success("Removed from favorites");
    },
  });

  // Build lookup maps
  const channelMap = useMemo(() => {
    const map = new Map<number, any>();
    channels.forEach((c: any) => map.set(c.id, { ...c, _type: "channel" }));
    return map;
  }, [channels]);

  const stationMap = useMemo(() => {
    const map = new Map<number, any>();
    stations.forEach((s: any) => map.set(s.id, { ...s, _type: "station" }));
    return map;
  }, [stations]);

  // Resolve favorites to content items
  const resolvedFavorites = useMemo(() => {
    return allFavorites
      .map((fav: any) => {
        const content =
          fav.contentType === "channel"
            ? channelMap.get(fav.contentId)
            : stationMap.get(fav.contentId);
        if (!content) return null;
        return { ...content, _favId: fav.id, _favDate: fav.addedAt };
      })
      .filter(Boolean);
  }, [allFavorites, channelMap, stationMap]);

  // Resolve history to content items
  const resolvedHistory = useMemo(() => {
    return allHistory
      .map((h: any) => {
        const content =
          h.contentType === "channel"
            ? channelMap.get(h.contentId)
            : stationMap.get(h.contentId);
        if (!content) return null;
        return { ...content, _histDate: h.lastPlayedAt, _playCount: h.playCount };
      })
      .filter(Boolean);
  }, [allHistory, channelMap, stationMap]);

  // Filter by search and type
  const filterItems = (items: any[]) => {
    let filtered = items;
    if (filterType !== "all") {
      filtered = filtered.filter((item) => item._type === filterType);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q)
      );
    }
    return filtered;
  };

  const filteredFavorites = filterItems(resolvedFavorites);
  const filteredHistory = filterItems(resolvedHistory);

  // Play handler
  const handlePlay = (item: any) => {
    if (item._type === "channel") {
      playChannel(item);
      toast.success(`Now playing: ${item.name}`);
    } else if (item._type === "station") {
      // Navigate to radio page — stations use their own audio element
      setLocation("/broadcast-channels");
      toast.info(`Opening radio — select ${item.name}`);
    }
  };

  // Remove favorite
  const handleRemoveFavorite = async (item: any) => {
    try {
      await removeFavMutation.mutateAsync({ contentId: item.id });
    } catch {
      toast.error("Failed to remove favorite");
    }
  };

  const isCurrentlyPlaying = (item: any) =>
    currentChannel?.id === item.id && isPlaying && item._type === "channel";

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Heart className="w-12 h-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-bold text-foreground">Sign in to access My Library</h2>
          <p className="text-muted-foreground">
            Your favorites, history, and playlists are saved to your account.
          </p>
        </div>
      </div>
    );
  }

  const ContentCard = ({ item, showRemove = false }: { item: any; showRemove?: boolean }) => {
    const playing = isCurrentlyPlaying(item);
    return (
      <Card
        className={`overflow-hidden cursor-pointer transition-all hover:shadow-lg group ${
          playing ? "ring-2 ring-primary shadow-lg" : ""
        }`}
        onClick={() => handlePlay(item)}
      >
        <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden">
          <img
            src={item.logo}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          {/* Type badge */}
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 text-white px-2 py-0.5 rounded text-xs font-medium">
            {item._type === "channel" ? (
              <Tv className="w-3 h-3" />
            ) : (
              <Radio className="w-3 h-3" />
            )}
            {item._type === "channel" ? "TV" : "Radio"}
          </div>
          {/* Category badge */}
          <div className="absolute top-2 right-2 bg-primary/80 text-white px-2 py-0.5 rounded text-xs font-medium capitalize">
            {item.category}
          </div>
          {/* Play overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            {playing ? (
              <Pause className="w-10 h-10 text-white" />
            ) : (
              <Play className="w-10 h-10 text-white" />
            )}
          </div>
          {/* Now playing indicator */}
          {playing && (
            <div className="absolute bottom-2 left-2 right-2 flex justify-center gap-0.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-1 bg-white rounded-full animate-bounce"
                  style={{
                    height: "12px",
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: "0.6s",
                  }}
                />
              ))}
            </div>
          )}
        </div>
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm text-foreground truncate">{item.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 truncate">{item.description}</p>
            </div>
            {showRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFavorite(item);
                }}
                className="flex-shrink-0 p-1 hover:bg-destructive/10 rounded transition-colors"
                title="Remove from favorites"
              >
                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
              </button>
            )}
          </div>
          {item._playCount && (
            <p className="text-xs text-muted-foreground mt-1">
              Played {item._playCount} time{item._playCount > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                <Star className="w-7 h-7 text-primary" />
                My Library
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Your favorites, history, and playlists in one place
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{resolvedFavorites.length}</span>{" "}
                favorites
                <span className="mx-2">·</span>
                <span className="font-semibold text-foreground">{resolvedHistory.length}</span>{" "}
                recently played
                <span className="mx-2">·</span>
                <span className="font-semibold text-foreground">{playlists.length}</span>{" "}
                playlists
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-card border-b border-border p-4">
        <div className="container max-w-7xl mx-auto flex items-center gap-3">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <Input
            placeholder="Search your library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <div className="flex gap-2">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("all")}
            >
              All
            </Button>
            <Button
              variant={filterType === "channel" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("channel")}
              className="gap-1"
            >
              <Tv className="w-3 h-3" />
              TV
            </Button>
            <Button
              variant={filterType === "station" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("station")}
              className="gap-1"
            >
              <Radio className="w-3 h-3" />
              Radio
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="favorites" className="gap-2">
              <Heart className="w-4 h-4" />
              Favorites ({filteredFavorites.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Clock className="w-4 h-4" />
              Recently Played ({filteredHistory.length})
            </TabsTrigger>
            <TabsTrigger value="playlists" className="gap-2">
              <ListMusic className="w-4 h-4" />
              Playlists ({playlists.length})
            </TabsTrigger>
          </TabsList>

          {/* Favorites Tab */}
          <TabsContent value="favorites">
            {favLoading ? (
              <div className="text-center py-12">
                <Heart className="w-8 h-8 animate-pulse text-muted-foreground mx-auto" />
                <p className="text-muted-foreground mt-2">Loading favorites...</p>
              </div>
            ) : filteredFavorites.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground">No favorites yet</h3>
                <p className="text-muted-foreground mt-1">
                  Heart channels and radio stations to save them here
                </p>
                <div className="flex gap-3 justify-center mt-4">
                  <Button variant="outline" onClick={() => setLocation("/theater-live")}>
                    <Tv className="w-4 h-4 mr-2" />
                    Browse Theater
                  </Button>
                  <Button variant="outline" onClick={() => setLocation("/broadcast-channels")}>
                    <Radio className="w-4 h-4 mr-2" />
                    Browse Radio
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredFavorites.map((item: any) => (
                  <ContentCard key={`fav-${item._type}-${item.id}`} item={item} showRemove />
                ))}
              </div>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            {histLoading ? (
              <div className="text-center py-12">
                <Clock className="w-8 h-8 animate-pulse text-muted-foreground mx-auto" />
                <p className="text-muted-foreground mt-2">Loading history...</p>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground">No history yet</h3>
                <p className="text-muted-foreground mt-1">
                  Start watching or listening to build your history
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredHistory.map((item: any) => (
                  <ContentCard key={`hist-${item._type}-${item.id}`} item={item} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Playlists Tab */}
          <TabsContent value="playlists">
            {playlists.length === 0 ? (
              <div className="text-center py-12">
                <ListMusic className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground">No playlists yet</h3>
                <p className="text-muted-foreground mt-1">
                  Create a playlist to organize your favorite channels and stations
                </p>
                <Button
                  className="mt-4 gap-2"
                  onClick={() => setLocation("/playlists/new")}
                >
                  <Plus className="w-4 h-4" />
                  Create Playlist
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {playlists.map((playlist: any) => (
                  <Card
                    key={playlist.id}
                    className="p-4 cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => setLocation(`/playlists/${playlist.id}`)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center flex-shrink-0">
                        <ListMusic className="w-8 h-8 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{playlist.name}</h3>
                        {playlist.description && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {playlist.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {playlist.itemCount} item{playlist.itemCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
                <Card
                  className="p-4 cursor-pointer hover:shadow-lg transition-all border-dashed flex items-center justify-center min-h-[96px]"
                  onClick={() => setLocation("/playlists/new")}
                >
                  <div className="text-center">
                    <Plus className="w-8 h-8 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground mt-1">Create Playlist</p>
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
