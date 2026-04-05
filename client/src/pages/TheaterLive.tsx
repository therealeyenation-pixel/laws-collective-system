/*
 * Theater Live - IPTV Live Streaming Interface
 * Free streaming channels for all L.A.W.S. Collective members
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Heart, Share2, Volume2, Maximize, MessageCircle, Search, X } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import HLS from 'hls.js';

export default function TheaterLive() {
  const { user } = useAuth();
  const [selectedChannel, setSelectedChannel] = useState<number | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<HLS | null>(null);

  const { data: channels, isLoading } = trpc.iptvTheater.getChannels.useQuery({
    isLive: true,
    limit: 50,
  });

  const { data: channelDetails } = trpc.iptvTheater.getChannelDetails.useQuery(
    { channelId: selectedChannel || 0 },
    { enabled: !!selectedChannel }
  );

  const followChannelMutation = trpc.iptvTheater.followChannel.useMutation();
  const startPlaybackMutation = trpc.iptvTheater.startPlayback.useMutation();

  const handlePlayChannel = async (channelId: number) => {
    setSelectedChannel(channelId);
    try {
      await startPlaybackMutation.mutateAsync({ channelId });
    } catch (error) {
      console.error('Failed to start playback:', error);
    }
  };

  const handleFollowChannel = async () => {
    if (!selectedChannel) return;
    try {
      await followChannelMutation.mutateAsync({ channelId: selectedChannel });
      setIsFollowing(true);
    } catch (error) {
      console.error('Failed to follow channel:', error);
    }
  };

  // Initialize HLS.js when channel is selected and stream URL is available
  useEffect(() => {
    if (!videoRef.current || !channelDetails?.channel?.streamUrl) return;

    const streamUrl = channelDetails.channel.streamUrl;
    console.log('Loading stream:', streamUrl);

    if (HLS.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new HLS({
        debug: true,
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(videoRef.current);

      hls.on(HLS.Events.MANIFEST_PARSED, () => {
        console.log('Manifest parsed, starting playback');
        videoRef.current?.play().catch((err) => {
          console.log('Autoplay blocked:', err);
        });
      });

      hls.on(HLS.Events.ERROR, (event, data) => {
        console.error('HLS error:', data);
      });

      hls.on(HLS.Events.LEVEL_SWITCHING, (event, data) => {
        console.log('Quality switched to level:', data.level);
      });
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // Fallback for Safari
      videoRef.current.src = streamUrl;
      videoRef.current.play().catch((err) => {
        console.log('Safari playback blocked:', err);
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channelDetails?.channel?.streamUrl]);

  // Filter channels based on search and category
  const filteredChannels = channels?.filter((channel) => {
    const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         channel.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || channel.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['News', 'Sports', 'Entertainment', 'Music', 'Kids', 'Documentary', 'Adult'];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Loading live channels...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Search Window */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl mx-4">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Search Channels</h2>
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery('');
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <input
                type="text"
                placeholder="Search channels by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {filteredChannels?.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => {
                      handlePlayChannel(channel.id);
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="p-3 text-left bg-card hover:bg-accent/20 rounded-lg transition-colors"
                  >
                    <p className="font-semibold text-foreground text-sm truncate">
                      {channel.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{channel.category}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Video Player */}
      {selectedChannel && channelDetails ? (
        <div className="w-full bg-black">
          <div className="aspect-video bg-black relative flex items-center justify-center">
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              controls
              controlsList="nodownload"
            />

            {/* Player Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                  <Volume2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                  <MessageCircle className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                  <Maximize className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Channel Info & Actions */}
          <div className="bg-card border-b border-border p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground">
                  {channelDetails.channel?.name}
                </h1>
                <p className="text-muted-foreground mt-2">
                  {channelDetails.channel?.description}
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <span className="text-sm text-muted-foreground">
                    🔴 LIVE • {channelDetails.channel?.currentViewers || 0} watching
                  </span>
                  <span className="text-sm text-muted-foreground">
                    📺 {channelDetails.channel?.totalViewers || 0} total viewers
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleFollowChannel}
                  variant={isFollowing ? 'default' : 'outline'}
                  className="gap-2"
                >
                  <Heart className={`w-4 h-4 ${isFollowing ? 'fill-current' : ''}`} />
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-96 bg-muted flex items-center justify-center">
          <p className="text-muted-foreground">Select a channel to watch</p>
        </div>
      )}

      {/* Channels Grid */}
      <div className="container max-w-7xl mx-auto p-6">
        {/* Search & Filter Bar */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => setSearchOpen(true)}
            variant="outline"
            className="gap-2"
          >
            <Search className="w-4 h-4" />
            Search Channels
          </Button>
          <div className="flex-1 flex gap-2 overflow-x-auto pb-2">
            <Button
              onClick={() => setSelectedCategory(null)}
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="sm"
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <Tabs defaultValue="live" className="w-full">
          <TabsList>
            <TabsTrigger value="live">Live Now ({filteredChannels?.length || 0})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredChannels?.map((channel) => (
                <Card
                  key={channel.id}
                  className={`cursor-pointer overflow-hidden transition-all hover:shadow-lg ${
                    selectedChannel === channel.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handlePlayChannel(channel.id)}
                >
                  <div className="aspect-video bg-black relative flex items-center justify-center">
                    <Play className="w-12 h-12 text-white opacity-50" />
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                      LIVE
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground truncate">
                      {channel.name}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {channel.category}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      👥 {channel.currentViewers || 0} watching
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="upcoming" className="mt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">No upcoming broadcasts scheduled</p>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => {
                const categoryCount = channels?.filter((c) => c.category === category).length || 0;
                return (
                  <Card
                    key={category}
                    className="p-6 cursor-pointer hover:shadow-lg transition-all hover:bg-accent/10"
                    onClick={() => setSelectedCategory(category)}
                  >
                    <h3 className="font-semibold text-foreground text-lg">{category}</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      {categoryCount} channels
                    </p>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
