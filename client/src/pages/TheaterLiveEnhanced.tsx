import { useState, useMemo } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgeVerificationModal } from '@/components/AgeVerificationModal';
import { HLSVideoPlayer } from '@/components/HLSVideoPlayer';
import { Play, Heart, Share2, Search, Filter, Lock } from 'lucide-react';
import { toast } from 'sonner';

const CONTENT_RATINGS = {
  G: { label: 'General Audiences', minAge: 0 },
  PG: { label: 'Parental Guidance', minAge: 0 },
  'PG-13': { label: 'Parents Strongly Cautioned', minAge: 13 },
  R: { label: 'Restricted', minAge: 17 },
  'NC-17': { label: 'Adults Only', minAge: 17 },
  X: { label: 'Adult Content', minAge: 18 },
  UNRATED: { label: 'Unrated', minAge: 18 },
};

export default function TheaterLiveEnhanced() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [ageVerificationOpen, setAgeVerificationOpen] = useState(false);
  const [pendingRestrictedChannel, setPendingRestrictedChannel] = useState<any>(null);

  // Queries
  const { data: channels, isLoading } = trpc.iptvTheater.getChannels.useQuery({
    limit: 1000,
    offset: 0,
  });

  const { data: userAccess } = trpc.auth.me.useQuery();

  // Mutations
  const startPlaybackMutation = trpc.iptvTheater.startPlayback.useMutation({
    onSuccess: () => {
      toast.success('Playback started');
    },
  });

  // Check if user can access restricted content
  const canAccessAdultContent = useMemo(() => {
    if (!userAccess?.user) return false;
    // In a real app, check userContentAccess table
    return userAccess.user.role === 'admin' || userAccess.user.role === 'staff';
  }, [userAccess]);

  // Filter channels based on access level and content rating
  const accessibleChannels = useMemo(() => {
    if (!channels) return [];

    return channels.filter((channel) => {
      // Check access level
      if (channel.accessLevel === 'public') return true;
      if (channel.accessLevel === 'members' && user) return true;
      if (channel.accessLevel === 'verified_18' && canAccessAdultContent) return true;
      if (channel.accessLevel === 'verified_21' && canAccessAdultContent) return true;
      if (channel.accessLevel === 'premium' && user?.role === 'admin') return true;
      return false;
    });
  }, [channels, user, canAccessAdultContent]);

  // Filter by search and category
  const filteredChannels = useMemo(() => {
    return accessibleChannels.filter((channel) => {
      const matchesSearch =
        channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        channel.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || channel.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [accessibleChannels, searchQuery, categoryFilter]);

  const handlePlayChannel = (channel: any) => {
    // Check if content requires age verification
    if (channel.requiresAgeVerification && !canAccessAdultContent) {
      setPendingRestrictedChannel(channel);
      setAgeVerificationOpen(true);
      return;
    }

    setSelectedChannel(channel);
    startPlaybackMutation.mutate({
      channelId: channel.id,
    });
  };

  const handleAgeVerification = (age: number, method: string) => {
    if (pendingRestrictedChannel) {
      setSelectedChannel(pendingRestrictedChannel);
      toast.success(`Age verified (${age} years old). Access granted.`);
      setAgeVerificationOpen(false);
      setPendingRestrictedChannel(null);
    }
  };

  const handleFollowChannel = () => {
    if (!selectedChannel) return;
    setIsFollowing(!isFollowing);
    toast.success(isFollowing ? 'Unfollowed channel' : 'Following channel');
  };

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(channels?.map((ch) => ch.category) || []);
    return Array.from(cats).sort();
  }, [channels]);

  return (
    <div className="min-h-screen bg-background">
      {/* Video Player Section */}
      {selectedChannel ? (
        <div className="bg-black">
          <HLSVideoPlayer
            streamUrl={selectedChannel.streamUrl || selectedChannel.url}
            title={selectedChannel.name}
            poster={selectedChannel.logo}
            autoplay={true}
            onError={(error) => {
              console.error('Video playback error:', error);
              toast.error('Failed to load video stream');
            }}
          />



          {/* Channel Info */}
          <div className="bg-card border-b border-border p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-2">{selectedChannel.name}</h2>
                <p className="text-muted-foreground mb-4">{selectedChannel.description}</p>
              </div>
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
          <p className="text-muted-foreground text-lg">Select a channel to watch</p>
        </div>
      )}

      {/* Channels Grid */}
      <div className="container max-w-7xl mx-auto p-6">
        <Tabs defaultValue="live" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="live">Live Now ({filteredChannels.length})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="space-y-4">
            {/* Search and Filter */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search channels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Channels Grid */}
            {isLoading ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Loading channels...</p>
              </Card>
            ) : filteredChannels.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredChannels.map((channel) => (
                  <Card
                    key={channel.id}
                    className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handlePlayChannel(channel)}
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

                      {channel.requiresAgeVerification && (
                        <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          18+
                        </div>
                      )}

                      <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                        {channel.currentViewers} watching
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-foreground truncate">{channel.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {channel.description}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                          {channel.category}
                        </span>
                        {channel.isAdultContent && (
                          <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">
                            Adult
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Play className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold text-foreground mb-2">No Channels Available</p>
                <p className="text-muted-foreground">
                  {searchQuery || categoryFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Check back soon for live content'}
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="mt-6">
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No upcoming streams scheduled</p>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.map((category) => (
                <Card
                  key={category}
                  className="p-4 cursor-pointer hover:shadow-lg transition-shadow text-center"
                  onClick={() => {
                    setCategoryFilter(category);
                  }}
                >
                  <p className="font-semibold text-foreground capitalize">{category}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {accessibleChannels.filter((ch) => ch.category === category).length} channels
                  </p>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Age Verification Modal */}
      <AgeVerificationModal
        isOpen={ageVerificationOpen}
        onClose={() => {
          setAgeVerificationOpen(false);
          setPendingRestrictedChannel(null);
        }}
        onVerify={handleAgeVerification}
        requiredAge={18}
        contentTitle={pendingRestrictedChannel?.name}
      />
    </div>
  );
}
