/**
 * Broadcast Radio - Live Radio Streaming Interface
 * Real radio stations with actual audio playback
 * Organized by American music genres
 * Includes favorites, sleep timer, and recently played
 * Audio persists across navigation via RadioPlayerContext
 */

import { useState, useMemo } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Play,
  Heart,
  ArrowLeft,
  Search,
  Radio,
  Pause,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useFavorites, useSleepTimer, useRecentlyPlayed } from '@/hooks/useMediaFeatures';
import SleepTimerButton from '@/components/SleepTimerButton';
import RecentlyPlayedBar from '@/components/RecentlyPlayedBar';
import { AddToPlaylistButton } from '@/components/AddToPlaylistButton';
import { useRadioPlayer } from '@/contexts/RadioPlayerContext';

export default function BroadcastRadioReal() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState<string | undefined>(undefined);

  // Global persistent radio player — survives navigation
  const {
    currentStation,
    isPlaying,
    isLoading,
    volume,
    isMuted,
    playStation,
    stopPlayback: stopRadio,
    togglePlayPause,
    setVolume,
    toggleMute,
  } = useRadioPlayer();

  // Fetch radio stations from streaming content API
  const { data: stations = [], isLoading: stationsLoading } =
    trpc.streamingContent.getStations.useQuery({
      category: activeGenre,
      limit: 50,
    });

  // Fetch available genres
  const { data: genres = [] } = trpc.streamingContent.getGenres.useQuery();

  // ─── New hooks: favorites, sleep timer, recently played ───
  const { isFavorited, toggleFavorite, sortWithFavorites } = useFavorites('radio');
  const { recentItems, recordPlay } = useRecentlyPlayed('radio');

  // Stop playback callback for sleep timer
  const sleepTimer = useSleepTimer(stopRadio);

  const selectedStation = currentStation?.id ?? null;
  const selectedStationData = stations.find((s: any) => s.id === selectedStation);

  // Filter stations by search
  const searchFiltered = searchQuery
    ? stations.filter(
        (s: any) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : stations;

  // Sort with favorites at top
  const filteredStations = useMemo(
    () => sortWithFavorites(searchFiltered as any[]),
    [searchFiltered, sortWithFavorites]
  );

  const handlePlayStation = (stationId: number) => {
    const station = stations.find((s: any) => s.id === stationId);
    if (!station) return;

    // If clicking the same station that's playing, toggle play/pause
    if (selectedStation === stationId && isPlaying) {
      togglePlayPause();
      return;
    }

    playStation({
      id: (station as any).id,
      name: (station as any).name,
      description: (station as any).description,
      category: (station as any).category,
      streamUrl: (station as any).streamUrl,
      logo: (station as any).logo,
    });

    // Record in recently played
    recordPlay(stationId);
  };

  const genreLabels: Record<string, string> = {
    'hip-hop': 'Hip-Hop',
    rnb: 'R&B / Soul',
    jazz: 'Jazz',
    gospel: 'Gospel',
    blues: 'Blues',
    country: 'Country',
    funk: 'Funk',
    reggae: 'Reggae',
    chill: 'Chill',
    pop: 'Pop',
  };

  if (stationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Radio className="w-12 h-12 animate-pulse mx-auto text-primary" />
          <p className="text-foreground">Loading radio stations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button + Sleep Timer */}
      <div className="border-b border-border bg-card p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.history.back()}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <SleepTimerButton
          isActive={sleepTimer.isActive}
          remainingFormatted={sleepTimer.formatRemaining()}
          onStart={sleepTimer.startTimer}
          onCancel={sleepTimer.cancelTimer}
        />
      </div>

      {/* Recently Played Bar */}
      <RecentlyPlayedBar
        recentItems={recentItems}
        contentItems={stations as any[]}
        onPlay={(item: any) => handlePlayStation(item.id)}
        currentlyPlayingId={selectedStation}
        label="Recently Listened"
      />

      {/* Now Playing Bar */}
      {selectedStationData && (
        <div className="bg-gradient-to-r from-primary/15 to-accent/10 border-b border-border">
          <div className="container max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center gap-6">
              {/* Station Logo */}
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                <img
                  src={(selectedStationData as any).logo}
                  alt={(selectedStationData as any).name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://via.placeholder.com/100/333/FFF?text=Radio';
                  }}
                />
              </div>

              {/* Station Info */}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-foreground truncate">
                  {(selectedStationData as any).name}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {(selectedStationData as any).description}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full capitalize font-medium">
                    {genreLabels[(selectedStationData as any).category] ||
                      (selectedStationData as any).category}
                  </span>
                  {(selectedStationData as any).isLive && (
                    <span className="inline-flex items-center gap-1 text-xs text-red-500 font-semibold">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      LIVE
                    </span>
                  )}
                  {isPlaying && !isLoading && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-500 font-semibold">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      NOW PLAYING
                    </span>
                  )}
                  {isLoading && (
                    <span className="text-xs text-muted-foreground">Loading stream...</span>
                  )}
                  {sleepTimer.isActive && (
                    <span className="text-xs text-amber-500 font-mono tabular-nums">
                      ⏱ {sleepTimer.formatRemaining()}
                    </span>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Volume */}
                <div className="hidden md:flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={toggleMute}
                    className="p-2"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </Button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-20 h-1.5 bg-muted rounded-full cursor-pointer accent-primary"
                  />
                </div>

                {/* Play/Pause */}
                <Button
                  size="lg"
                  variant="default"
                  onClick={togglePlayPause}
                  disabled={isLoading}
                  className="rounded-full w-14 h-14 flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-0.5" />
                  )}
                </Button>

                {/* Favorite */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => selectedStation && toggleFavorite(selectedStation)}
                  className="p-2"
                >
                  <Heart
                    className={`w-5 h-5 ${selectedStation && isFavorited(selectedStation) ? 'fill-red-500 text-red-500' : ''}`}
                  />
                </Button>

                {/* Sleep Timer in controls */}
                <SleepTimerButton
                  isActive={sleepTimer.isActive}
                  remainingFormatted={sleepTimer.formatRemaining()}
                  onStart={sleepTimer.startTimer}
                  onCancel={sleepTimer.cancelTimer}
                  variant="ghost"
                  size="sm"
                />
              </div>
            </div>

            {/* Audio Visualizer */}
            {isPlaying && !isLoading && (
              <div className="flex justify-center gap-1 mt-4">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-primary rounded-full"
                    style={{
                      height: `${Math.random() * 24 + 8}px`,
                      animation: `pulse ${0.5 + Math.random() * 0.5}s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.05}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search and Genre Filters */}
      <div className="bg-card border-b border-border p-4 space-y-4">
        <div className="container max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search stations by name, genre, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Genre Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Button
              variant={activeGenre === undefined ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveGenre(undefined)}
            >
              All Genres
            </Button>
            {genres.map((genre: string) => (
              <Button
                key={genre}
                variant={activeGenre === genre ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveGenre(genre)}
              >
                {genreLabels[genre] || genre}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Stations Grid */}
      <div className="container max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-xl font-bold text-foreground mb-4">
          {activeGenre
            ? `${genreLabels[activeGenre] || activeGenre} Stations`
            : 'All Stations'}
          <span className="text-sm font-normal text-muted-foreground ml-2">
            ({filteredStations.length} stations)
          </span>
        </h2>

        {filteredStations.length === 0 ? (
          <div className="text-center py-12">
            <Radio className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No stations found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredStations.map((station: any) => {
              const isFav = isFavorited(station.id);
              return (
                <Card
                  key={station.id}
                  className={`overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                    selectedStation === station.id
                      ? 'ring-2 ring-primary shadow-lg'
                      : ''
                  }`}
                  onClick={() => handlePlayStation(station.id)}
                >
                  <div className="relative aspect-square bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden flex items-center justify-center">
                    <img
                      src={station.logo}
                      alt={station.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    {/* Favorite badge */}
                    {isFav && (
                      <div className="absolute top-2 right-10">
                        <Heart className="w-4 h-4 fill-red-500 text-red-500 drop-shadow" />
                      </div>
                    )}
                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      {selectedStation === station.id && isPlaying ? (
                        <Pause className="w-10 h-10 text-white" />
                      ) : (
                        <Play className="w-10 h-10 text-white" />
                      )}
                    </div>
                    {/* Now playing indicator */}
                    {selectedStation === station.id && isPlaying && (
                      <div className="absolute bottom-2 left-2 right-2 flex justify-center gap-0.5">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="w-1 bg-white rounded-full animate-bounce"
                            style={{
                              height: '12px',
                              animationDelay: `${i * 0.1}s`,
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm text-foreground truncate">
                          {station.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {station.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <AddToPlaylistButton contentId={station.id} contentType="station" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(station.id);
                          }}
                          className="p-1 hover:bg-accent rounded transition-colors"
                          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Heart
                            className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
