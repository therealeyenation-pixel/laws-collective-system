/**
 * Theater Live - IPTV Live Streaming Interface
 * Uses global MediaPlayerContext so streams persist across page navigation.
 * Includes Picture-in-Picture, auto-skip, favorites, sleep timer, and recently played.
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Play,
  Heart,
  ArrowLeft,
  Search,
  Tv,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  AlertCircle,
  PictureInPicture2,
  SkipForward,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useMediaPlayer, type MediaChannel } from '@/contexts/MediaPlayerContext';
import { useFavorites, useSleepTimer, useRecentlyPlayed } from '@/hooks/useMediaFeatures';
import SleepTimerButton from '@/components/SleepTimerButton';
import RecentlyPlayedBar from '@/components/RecentlyPlayedBar';

export default function TheaterLiveReal() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined);
  const [activeRegion, setActiveRegion] = useState<string>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Global media player context
  const {
    currentChannel,
    isPlaying,
    isLoading,
    hasError,
    volume,
    isMuted,
    isPiP,
    playChannel,
    stopPlayback,
    togglePlayPause,
    setVolume,
    toggleMute,
    togglePiP,
    setTheaterMode,
  } = useMediaPlayer();

  // Favorites, sleep timer, and recently played
  const { isFavorited, toggleFavorite, sortWithFavorites } = useFavorites('tv');
  const sleepTimer = useSleepTimer(stopPlayback);
  const { recentItems, recordPlay } = useRecentlyPlayed('tv');

  // Fetch channels from streaming content API
  const { data: channels = [], isLoading: channelsLoading } =
    trpc.streamingContent.getChannels.useQuery({
      category: activeCategory,
      limit: 50,
    });

  const selectedChannel = currentChannel?.id ?? null;
  const selectedChannelData = currentChannel;

  // Enable theater mode when this page mounts, disable when it unmounts
  useEffect(() => {
    setTheaterMode(true);
    return () => {
      setTheaterMode(false);
    };
  }, [setTheaterMode]);

  // Filter channels by region and search
  const regionFiltered = activeRegion === 'all'
    ? channels
    : channels.filter((c: any) => c.region === activeRegion);

  const searchFiltered = searchQuery
    ? regionFiltered.filter(
        (c: any) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : regionFiltered;

  // Sort with favorites at top
  const filteredChannels = useMemo(
    () => sortWithFavorites(searchFiltered as any[]),
    [searchFiltered, sortWithFavorites]
  );

  // Get unique categories from region-filtered channels
  const categories = Array.from(new Set(regionFiltered.map((c: any) => c.category))).sort();

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Auto-skip: find the next channel in the filtered list
  const getNextChannelId = (currentId: number): number | null => {
    const currentIndex = filteredChannels.findIndex((c: any) => c.id === currentId);
    if (currentIndex === -1 || currentIndex >= filteredChannels.length - 1) return null;
    return filteredChannels[currentIndex + 1]?.id ?? null;
  };

  const autoSkipRef = useRef(0);

  const handlePlayChannel = async (channel: any) => {
    autoSkipRef.current = 0;
    const mediaChannel: MediaChannel = {
      id: channel.id,
      name: channel.name,
      description: channel.description,
      category: channel.category,
      region: channel.region,
      logo: channel.logo,
      streamUrl: channel.streamUrl,
      isLive: channel.isLive,
      viewers: channel.viewers,
    };
    playChannel(mediaChannel);
    // Record in recently played
    recordPlay(channel.id);
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      containerRef.current.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  const handleNextChannel = () => {
    if (!selectedChannel) return;
    const nextId = getNextChannelId(selectedChannel);
    if (nextId) {
      const nextChannel = channels.find((c: any) => c.id === nextId);
      if (nextChannel) handlePlayChannel(nextChannel);
    }
  };

  if (channelsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Tv className="w-12 h-12 animate-pulse mx-auto text-primary" />
          <p className="text-foreground">Loading live channels...</p>
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
          onClick={() => { setLocation('/dashboard'); }}
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
        contentItems={channels as any[]}
        onPlay={handlePlayChannel}
        currentlyPlayingId={selectedChannel}
        label="Recently Watched"
      />

      {/* Video Player Area */}
      {selectedChannelData ? (
        <div className="w-full bg-black" ref={containerRef}>
          <div className="relative group" style={{ aspectRatio: '16/9', maxHeight: '60vh' }}>
            <div id="theater-video-target" className="w-full h-full bg-black" />

            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 pointer-events-none z-40">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-white text-sm">Loading stream...</p>
                </div>
              </div>
            )}

            {/* Error Overlay */}
            {hasError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-40">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-white text-lg font-semibold mb-2">Stream Unavailable</p>
                  <p className="text-gray-400 text-sm mb-4">
                    This channel may be temporarily offline.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (selectedChannelData) handlePlayChannel(selectedChannelData);
                      }}
                      className="text-white border-white hover:bg-white/20"
                    >
                      Retry
                    </Button>
                    {selectedChannel && getNextChannelId(selectedChannel) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextChannel}
                        className="text-white border-white hover:bg-white/20"
                      >
                        Next Channel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Idle state */}
            {!isPlaying && !isLoading && !hasError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-40">
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={() => {
                    if (selectedChannelData) handlePlayChannel(selectedChannelData);
                  }}
                  className="text-white hover:bg-white/20 rounded-full w-20 h-20"
                >
                  <Play className="w-10 h-10" />
                </Button>
              </div>
            )}

            {/* Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity z-40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={togglePlayPause}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleNextChannel}
                    className="text-white hover:bg-white/20"
                    title="Next Channel"
                  >
                    <SkipForward className="w-5 h-5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </Button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-24 h-1 bg-white/30 rounded cursor-pointer accent-white"
                  />
                  {isPlaying && (
                    <span className="inline-flex items-center gap-1 text-xs text-red-500 font-semibold">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      LIVE
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {/* Favorite */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => selectedChannel && toggleFavorite(selectedChannel)}
                    className="text-white hover:bg-white/20"
                  >
                    <Heart
                      className={`w-4 h-4 ${selectedChannel && isFavorited(selectedChannel) ? 'fill-red-500 text-red-500' : ''}`}
                    />
                  </Button>
                  {/* Sleep Timer */}
                  <SleepTimerButton
                    isActive={sleepTimer.isActive}
                    remainingFormatted={sleepTimer.formatRemaining()}
                    onStart={sleepTimer.startTimer}
                    onCancel={sleepTimer.cancelTimer}
                    className="text-white hover:bg-white/20"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={togglePiP}
                    className={`text-white hover:bg-white/20 ${isPiP ? 'text-primary' : ''}`}
                    title="Picture-in-Picture"
                  >
                    <PictureInPicture2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleFullscreen}
                    className="text-white hover:bg-white/20"
                  >
                    {isFullscreen ? (
                      <Minimize className="w-4 h-4" />
                    ) : (
                      <Maximize className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Channel Name Overlay */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity z-40">
              <h2 className="text-white font-semibold text-lg">
                {selectedChannelData.name}
              </h2>
              <p className="text-gray-300 text-sm">
                {selectedChannelData.description}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card p-12 text-center border-b border-border">
          <Tv className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">Select a channel to start watching</p>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-card border-b border-border p-4 space-y-4">
        <div className="container max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Region Tabs */}
          <div className="flex gap-2 mb-3">
            {[
              { key: 'all', label: 'All Channels' },
              { key: 'us', label: '🇺🇸 US' },
              { key: 'international', label: '🌍 International' },
            ].map((r) => (
              <Button
                key={r.key}
                variant={activeRegion === r.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveRegion(r.key)}
              >
                {r.label}
              </Button>
            ))}
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Button
              variant={activeCategory === undefined ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(undefined)}
            >
              All
            </Button>
            {categories.map((cat: string) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(cat)}
                className="capitalize"
              >
                {cat.replace(/_/g, ' ')}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Channels Grid */}
      <div className="container max-w-7xl mx-auto px-4 py-6 pb-24">
        <h2 className="text-xl font-bold text-foreground mb-4">
          {activeCategory
            ? `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1).replace(/_/g, ' ')} Channels`
            : 'All Channels'}
          <span className="text-sm font-normal text-muted-foreground ml-2">
            ({filteredChannels.length} channels)
          </span>
        </h2>

        {filteredChannels.length === 0 ? (
          <div className="text-center py-12">
            <Tv className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No channels found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredChannels.map((channel: any) => {
              const isFav = isFavorited(channel.id);
              return (
                <Card
                  key={channel.id}
                  className={`overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                    selectedChannel === channel.id ? 'ring-2 ring-primary shadow-lg' : ''
                  }`}
                  onClick={() => handlePlayChannel(channel)}
                >
                  <div className="relative aspect-video bg-muted overflow-hidden">
                    <img
                      src={channel.logo}
                      alt={channel.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          `https://via.placeholder.com/200x112/333/FFF?text=${encodeURIComponent(channel.name.substring(0, 8))}`;
                      }}
                    />
                    {channel.isLive && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-0.5 rounded text-xs font-semibold">
                        LIVE
                      </div>
                    )}
                    {/* Favorite badge */}
                    {isFav && (
                      <div className="absolute top-2 left-2">
                        <Heart className="w-4 h-4 fill-red-500 text-red-500 drop-shadow" />
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 flex gap-1">
                      <span className="bg-black/60 text-white px-2 py-0.5 rounded text-xs capitalize">
                        {channel.category.replace(/_/g, ' ')}
                      </span>
                      {channel.region === 'international' && (
                        <span className="bg-blue-600/80 text-white px-2 py-0.5 rounded text-xs">
                          🌍
                        </span>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                    {selectedChannel === channel.id && isPlaying && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        Playing
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm text-foreground truncate">
                        {channel.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {channel.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {channel.viewers.toLocaleString()} viewers
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(channel.id);
                      }}
                      className="flex-shrink-0 p-1 hover:bg-accent rounded transition-colors"
                      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart
                        className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
                      />
                    </button>
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
