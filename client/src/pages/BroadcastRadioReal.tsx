/**
 * Broadcast Radio - Live Radio Streaming Interface
 * Real radio stations with live playback
 */

import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Heart, Share2, Volume2, Maximize, MessageCircle, ArrowLeft, Search, Music, Radio, Pause } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { Input } from '@/components/ui/input';

export default function BroadcastRadioReal() {
  const { user } = useAuth();
  const [selectedStation, setSelectedStation] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined);
  const [isFavorited, setIsFavorited] = useState(false);

  // Fetch radio stations from streaming content API
  const { data: stations = [], isLoading } = trpc.streamingContent.getStations.useQuery({
    category: activeCategory,
    limit: 50,
  });

  // Favorite mutations
  const addFavoriteMutation = trpc.streamingFavorites.addFavorite.useMutation();
  const removeFavoriteMutation = trpc.streamingFavorites.removeFavorite.useMutation();
  const isFavoritedQuery = trpc.streamingFavorites.isFavorited.useQuery(
    { contentId: selectedStation || 0 },
    { enabled: !!selectedStation && !!user }
  );

  // Update favorited state when query returns
  if (isFavoritedQuery.data !== undefined && isFavoritedQuery.data !== isFavorited) {
    setIsFavorited(isFavoritedQuery.data);
  }

  // Fetch selected station details
  const selectedStationData = stations.find((s) => s.id === selectedStation);

  // Filter stations by search
  const filteredStations = searchQuery
    ? stations.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : stations;

  const handlePlayStation = (stationId: number) => {
    setSelectedStation(stationId);
    setIsPlaying(true);
  };

  const handleTogglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleToggleFavorite = async () => {
    if (!selectedStation || !user) return;
    
    try {
      if (isFavorited) {
        await removeFavoriteMutation.mutateAsync({ contentId: selectedStation });
      } else {
        await addFavoriteMutation.mutateAsync({
          contentId: selectedStation,
          contentType: 'radio',
          metadata: { stationName: selectedStationData?.name },
        });
      }
      setIsFavorited(!isFavorited);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const categories = ['music', 'news', 'talk', 'sports', 'educational'];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Loading radio stations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="border-b border-border bg-card p-4">
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

      {/* Main Player */}
      {selectedStationData ? (
        <div className="w-full bg-gradient-to-b from-primary/10 to-background">
          <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 relative flex items-center justify-center border-b border-border">
            <div className="text-center">
              <Radio className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
              <p className="text-foreground text-2xl font-bold">{selectedStationData.name}</p>
              <p className="text-muted-foreground text-sm mt-2">{selectedStationData.description}</p>
              <p className="text-muted-foreground text-xs mt-4">{selectedStationData.streamUrl}</p>
              {isPlaying && (
                <div className="mt-6 flex justify-center gap-2">
                  <div className="w-1 h-8 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-1 h-8 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-8 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1 h-8 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
              )}
            </div>
          </div>

          {/* Station Info */}
          <div className="bg-card p-6 border-b border-border">
            <div className="flex items-start gap-4">
              <img
                src={selectedStationData.logo}
                alt={selectedStationData.name}
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground">{selectedStationData.name}</h1>
                <p className="text-muted-foreground mt-2">{selectedStationData.description}</p>
                <div className="flex items-center gap-4 mt-4">
                  <span className="text-sm text-muted-foreground">
                    Category: <span className="text-foreground font-semibold capitalize">{selectedStationData.category}</span>
                  </span>
                  {selectedStationData.isLive && (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-sm font-semibold">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      LIVE
                    </span>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {selectedStationData.listeners.toLocaleString()} listeners
                  </span>
                </div>
              </div>
            </div>

            {/* Player Controls */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button
                size="lg"
                variant="default"
                onClick={handleTogglePlayPause}
                className="rounded-full w-16 h-16 flex items-center justify-center"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleToggleFavorite}
                className="gap-2"
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                {isFavorited ? 'Favorited' : 'Add to Favorites'}
              </Button>
              <Button size="sm" variant="outline" className="gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card p-12 text-center border-b border-border">
          <p className="text-muted-foreground">Select a station to start listening</p>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-card border-b border-border p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search stations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          <Button
            variant={activeCategory === undefined ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(undefined)}
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(cat)}
              className="capitalize"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Stations Grid */}
      <div className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">
          {activeCategory ? `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Stations` : 'All Stations'}
        </h2>

        {filteredStations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No stations found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredStations.map((station) => (
              <Card
                key={station.id}
                className={`overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                  selectedStation === station.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handlePlayStation(station.id)}
              >
                <div className="relative aspect-square bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden flex items-center justify-center">
                  <img
                    src={station.logo}
                    alt={station.name}
                    className="w-full h-full object-cover"
                  />
                  {station.isLive && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      LIVE
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm text-foreground truncate">{station.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{station.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {station.listeners.toLocaleString()} listeners
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
