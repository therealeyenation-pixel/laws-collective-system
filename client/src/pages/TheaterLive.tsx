/**
 * Theater Live - IPTV Live Streaming Interface
 * Free streaming channels for all L.A.W.S. Collective members
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Heart, Share2, Volume2, Maximize, MessageCircle, ArrowLeft } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function TheaterLive() {
  const { user } = useAuth();
  const [selectedChannel, setSelectedChannel] = useState<number | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);

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
          title="Go back to previous page"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      {/* Main Video Player */}
      {selectedChannel && channelDetails ? (
        <div className="w-full bg-black">
          <div className="aspect-video bg-black relative flex items-center justify-center">
            <div className="text-center">
              <Play className="w-16 h-16 text-white mx-auto mb-4" />
              <p className="text-white text-lg">
                {channelDetails.channel?.name || 'Live Stream'}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                {channelDetails.channel?.currentViewers || 0} viewers watching
              </p>
            </div>

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
        <Tabs defaultValue="live" className="w-full">
          <TabsList>
            <TabsTrigger value="live">Live Now</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {channels?.map((channel) => (
                <Card
                  key={channel.id}
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handlePlayChannel(channel.id)}
                >
                  <div className="aspect-video bg-muted relative flex items-center justify-center">
                    {channel.bannerUrl ? (
                      <img
                        src={channel.bannerUrl}
                        alt={channel.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Play className="w-8 h-8 text-muted-foreground" />
                    )}
                    {channel.isLive && (
                      <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                        🔴 LIVE
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      {channel.currentViewers} watching
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-foreground truncate">
                      {channel.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {channel.description}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                        {channel.category}
                      </span>
                      <Button size="sm" variant="ghost" className="h-6">
                        <Play className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="upcoming" className="mt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">No upcoming streams scheduled</p>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {['News', 'Sports', 'Entertainment', 'Music', 'Adult', 'Kids', 'Documentary'].map((cat) => (
                <Card key={cat} className="p-4 cursor-pointer hover:bg-accent transition-colors">
                  <div className="text-center">
                    <p className="font-semibold text-foreground capitalize">{cat}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {channels?.filter((c) => c.category?.toLowerCase() === cat.toLowerCase()).length || 0} channels
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Free Streaming Badge */}
      <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
        <p className="text-sm font-semibold">✓ Free Streaming for All Members</p>
      </div>
    </div>
  );
}
