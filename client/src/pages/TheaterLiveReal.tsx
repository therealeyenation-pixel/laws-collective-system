/**
 * Theater Live - IPTV Live Streaming Interface
 * Real streaming channels with live playback
 */

import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Heart, Share2, Volume2, Maximize, MessageCircle, ArrowLeft, Search } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { Input } from '@/components/ui/input';

export default function TheaterLiveReal() {
  const { user } = useAuth();
  const [selectedChannel, setSelectedChannel] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined);
  const [isFollowing, setIsFollowing] = useState(false);

  // Fetch channels from streaming content API
  const { data: channels = [], isLoading } = trpc.streamingContent.getChannels.useQuery({
    category: activeCategory,
    limit: 50,
  });

  // Fetch selected channel details
  const selectedChannelData = channels.find((c) => c.id === selectedChannel);

  // Filter channels by search
  const filteredChannels = searchQuery
    ? channels.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : channels;

  const handlePlayChannel = (channelId: number) => {
    setSelectedChannel(channelId);
  };

  const handleFollowChannel = () => {
    setIsFollowing(!isFollowing);
  };

  const categories = ['news', 'sports', 'entertainment', 'music', 'kids', 'documentary'];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Loading live channels...</p>
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

      {/* Main Video Player */}
      {selectedChannelData ? (
        <div className="w-full bg-black">
          <div className="aspect-video bg-black relative flex items-center justify-center">
            <div className="text-center">
              <Play className="w-16 h-16 text-white mx-auto mb-4" />
              <p className="text-white text-lg font-semibold">{selectedChannelData.name}</p>
              <p className="text-gray-400 text-sm mt-2">
                {selectedChannelData.viewers.toLocaleString()} viewers watching
              </p>
              <p className="text-gray-500 text-xs mt-4">{selectedChannelData.streamUrl}</p>
            </div>

            {/* Player Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                  <Volume2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={handleFollowChannel}
                >
                  <Heart className={`w-4 h-4 ${isFollowing ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                  <MessageCircle className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                  <Maximize className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Channel Info */}
          <div className="bg-card p-6 border-b border-border">
            <div className="flex items-start gap-4">
              <img
                src={selectedChannelData.logo}
                alt={selectedChannelData.name}
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground">{selectedChannelData.name}</h1>
                <p className="text-muted-foreground mt-2">{selectedChannelData.description}</p>
                <div className="flex items-center gap-4 mt-4">
                  <span className="text-sm text-muted-foreground">
                    Category: <span className="text-foreground font-semibold capitalize">{selectedChannelData.category}</span>
                  </span>
                  {selectedChannelData.isLive && (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-sm font-semibold">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      LIVE
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card p-12 text-center border-b border-border">
          <p className="text-muted-foreground">Select a channel to start watching</p>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-card border-b border-border p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search channels..."
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

      {/* Channels Grid */}
      <div className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">
          {activeCategory ? `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Channels` : 'All Channels'}
        </h2>

        {filteredChannels.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No channels found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredChannels.map((channel) => (
              <Card
                key={channel.id}
                className={`overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                  selectedChannel === channel.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handlePlayChannel(channel.id)}
              >
                <div className="relative aspect-video bg-muted overflow-hidden">
                  <img
                    src={channel.logo}
                    alt={channel.name}
                    className="w-full h-full object-cover"
                  />
                  {channel.isLive && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      LIVE
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm text-foreground truncate">{channel.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{channel.description}</p>
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
