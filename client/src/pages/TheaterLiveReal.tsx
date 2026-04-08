/**
 * Theater Live - IPTV Live Streaming Interface
 * Real streaming channels with actual video playback using HLSVideoPlayer
 */

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Play,
  Heart,
  Share2,
  ArrowLeft,
  Search,
  Tv,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  AlertCircle,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function TheaterLiveReal() {
  const { user } = useAuth();
  const [selectedChannel, setSelectedChannel] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined);
  const [activeRegion, setActiveRegion] = useState<string>('all'); // 'all' | 'us' | 'international'
  const [isFollowing, setIsFollowing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch channels from streaming content API
  const { data: channels = [], isLoading: channelsLoading } =
    trpc.streamingContent.getChannels.useQuery({
      category: activeCategory,
      limit: 50,
    });

  const selectedChannelData = channels.find((c: any) => c.id === selectedChannel);

  // Filter channels by region and search
  const regionFiltered = activeRegion === 'all'
    ? channels
    : channels.filter((c: any) => c.region === activeRegion);

  const filteredChannels = searchQuery
    ? regionFiltered.filter(
        (c: any) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : regionFiltered;

  // Get unique categories from region-filtered channels so tabs update with region
  const categories = Array.from(new Set(regionFiltered.map((c: any) => c.category))).sort();

  // Volume control
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume / 100;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
      }
    };
  }, []);

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

  // Auto-skip on error with retry limit
  const autoSkipRef = useRef(0);
  const MAX_AUTO_SKIP = 3;

  const handleStreamError = (channelId: number) => {
    if (autoSkipRef.current < MAX_AUTO_SKIP) {
      const nextId = getNextChannelId(channelId);
      if (nextId) {
        autoSkipRef.current += 1;
        toast.info(`Stream unavailable, trying next channel... (${autoSkipRef.current}/${MAX_AUTO_SKIP})`);
        setTimeout(() => handlePlayChannel(nextId), 500);
        return;
      }
    }
    // If we've exhausted auto-skip attempts or no next channel, show error
    setHasError(true);
    setIsLoading(false);
    autoSkipRef.current = 0;
  };

  const handlePlayChannel = async (channelId: number) => {
    const channel = channels.find((c: any) => c.id === channelId);
    if (!channel) return;

    setSelectedChannel(channelId);
    setHasError(false);
    setIsLoading(true);

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = '';

      const streamUrl = (channel as any).streamUrl;

      // Check if it's an HLS stream
      if (streamUrl.includes('.m3u8')) {
        // Try native HLS first (Safari), then fallback to hls.js
        if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
          videoRef.current.src = streamUrl;
          try {
            await videoRef.current.play();
            setIsPlaying(true);
            autoSkipRef.current = 0; // Reset skip counter on success
          } catch (err) {
            console.error('Native HLS play error:', err);
            handleStreamError(channelId);
          }
        } else {
          // Load hls.js dynamically
          try {
            const Hls = (await import('hls.js')).default;
            if (Hls.isSupported()) {
              const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
              });
              hls.loadSource(streamUrl);
              hls.attachMedia(videoRef.current);
              hls.on(Hls.Events.MANIFEST_PARSED, () => {
                videoRef.current?.play().catch((err) => {
                  console.error('HLS play error:', err);
                  handleStreamError(channelId);
                });
                setIsPlaying(true);
                autoSkipRef.current = 0; // Reset skip counter on success
              });
              hls.on(Hls.Events.ERROR, (_event, data) => {
                if (data.fatal) {
                  console.error('HLS fatal error:', data);
                  hls.destroy();
                  handleStreamError(channelId);
                }
              });
            } else {
              handleStreamError(channelId);
              toast.error('HLS playback is not supported in this browser.');
            }
          } catch (err) {
            console.error('Failed to load hls.js:', err);
            // Try direct playback as fallback
            videoRef.current.src = streamUrl;
            try {
              await videoRef.current.play();
              setIsPlaying(true);
              autoSkipRef.current = 0;
            } catch (playErr) {
              handleStreamError(channelId);
            }
          }
        }
      } else {
        // Direct stream URL (MP4, etc.)
        videoRef.current.src = streamUrl;
        try {
          await videoRef.current.play();
          setIsPlaying(true);
          autoSkipRef.current = 0;
        } catch (err) {
          console.error('Direct play error:', err);
          handleStreamError(channelId);
        }
      }
    }
  };

  const handleTogglePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      containerRef.current.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  const handleFollowChannel = () => {
    setIsFollowing(!isFollowing);
    toast.success(isFollowing ? 'Unfollowed channel' : 'Following channel');
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

      {/* Video Player */}
      {selectedChannelData ? (
        <div className="w-full bg-black" ref={containerRef}>
          <div className="relative group" style={{ aspectRatio: '16/9', maxHeight: '60vh' }}>
            <video
              ref={videoRef}
              className="w-full h-full bg-black"
              onPlay={() => {
                setIsPlaying(true);
                setIsLoading(false);
              }}
              onPause={() => setIsPlaying(false)}
              onLoadStart={() => setIsLoading(true)}
              onCanPlay={() => setIsLoading(false)}
              onError={() => {
                setHasError(true);
                setIsLoading(false);
              }}
              playsInline
            />

            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-white text-sm">Loading stream...</p>
                </div>
              </div>
            )}

            {/* Error Overlay */}
            {hasError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-white text-lg font-semibold mb-2">Stream Unavailable</p>
                  <p className="text-gray-400 text-sm mb-4">
                    This channel may be temporarily offline or geo-restricted.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        autoSkipRef.current = 0;
                        handlePlayChannel(selectedChannel!);
                      }}
                      className="text-white border-white hover:bg-white/20"
                    >
                      Retry
                    </Button>
                    {getNextChannelId(selectedChannel!) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          autoSkipRef.current = 0;
                          handlePlayChannel(getNextChannelId(selectedChannel!)!);
                        }}
                        className="text-white border-white hover:bg-white/20"
                      >
                        Next Channel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Idle state (before play) */}
            {!isPlaying && !isLoading && !hasError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={() => handlePlayChannel(selectedChannel!)}
                  className="text-white hover:bg-white/20 rounded-full w-20 h-20"
                >
                  <Play className="w-10 h-10" />
                </Button>
              </div>
            )}

            {/* Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleTogglePlayPause}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </Button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(Number(e.target.value));
                      if (isMuted) setIsMuted(false);
                    }}
                    className="w-24 h-1 bg-white/30 rounded cursor-pointer accent-white"
                  />
                  {isPlaying && (
                    <span className="inline-flex items-center gap-1 text-xs text-red-500 font-semibold ml-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      LIVE
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleFollowChannel}
                    className="text-white hover:bg-white/20"
                  >
                    <Heart
                      className={`w-4 h-4 ${isFollowing ? 'fill-red-500 text-red-500' : ''}`}
                    />
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
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <h2 className="text-white font-semibold text-lg">
                {(selectedChannelData as any).name}
              </h2>
              <p className="text-gray-300 text-sm">
                {(selectedChannelData as any).description}
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
      <div className="container max-w-7xl mx-auto px-4 py-6">
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
            {filteredChannels.map((channel: any) => (
              <Card
                key={channel.id}
                className={`overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                  selectedChannel === channel.id ? 'ring-2 ring-primary shadow-lg' : ''
                }`}
                onClick={() => handlePlayChannel(channel.id)}
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
                  {/* Now playing indicator */}
                  {selectedChannel === channel.id && isPlaying && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      Playing
                    </div>
                  )}
                </div>
                <div className="p-3">
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
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
