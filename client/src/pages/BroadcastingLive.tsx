import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { Radio, Podcast, Play, Pause, Volume2, Share2, Heart, Menu } from 'lucide-react';
import { ChannelGuideMenu } from '@/components/ChannelGuideMenu';

type BroadcastType = 'radio' | 'podcast';

export default function BroadcastingLive() {
  const [broadcastType, setBroadcastType] = useState<BroadcastType>('radio');
  const [selectedBroadcast, setSelectedBroadcast] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);

  // Fetch radio channels
  const { data: radioChannels = [] } = trpc.broadcastRadio.getChannels.useQuery({
    type: 'radio',
  });

  // Fetch podcasts
  const { data: podcasts = [] } = trpc.broadcastRadio.getChannels.useQuery({
    type: 'podcast',
  });

  const broadcasts = broadcastType === 'radio' ? radioChannels : podcasts;

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Player Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-foreground">Broadcasting Live</h1>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setGuideOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>

          {/* Broadcast Type Selector */}
          <div className="flex gap-2">
            <Button
              variant={broadcastType === 'radio' ? 'default' : 'outline'}
              onClick={() => setBroadcastType('radio')}
              className="gap-2"
            >
              <Radio className="h-4 w-4" />
              Live Radio
            </Button>
            <Button
              variant={broadcastType === 'podcast' ? 'default' : 'outline'}
              onClick={() => setBroadcastType('podcast')}
              className="gap-2"
            >
              <Podcast className="h-4 w-4" />
              Podcasts
            </Button>
          </div>
        </div>
      </div>

      {/* Now Playing */}
      {selectedBroadcast && (
        <div className="bg-black text-white p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex gap-6 items-start">
              {/* Album Art / Logo */}
              <div className="w-48 h-48 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0">
                {broadcastType === 'radio' ? (
                  <Radio className="w-24 h-24 opacity-50" />
                ) : (
                  <Podcast className="w-24 h-24 opacity-50" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {isPlaying && (
                    <div className="flex gap-1">
                      <div className="w-1 h-4 bg-accent rounded animate-pulse" />
                      <div className="w-1 h-4 bg-accent rounded animate-pulse delay-100" />
                      <div className="w-1 h-4 bg-accent rounded animate-pulse delay-200" />
                    </div>
                  )}
                  <span className="text-sm text-gray-400">
                    {isPlaying ? 'Now Playing' : 'Select to Play'}
                  </span>
                </div>

                <h2 className="text-4xl font-bold mb-2">{selectedBroadcast.name}</h2>
                <p className="text-gray-300 mb-4">{selectedBroadcast.description}</p>

                {/* Metadata */}
                <div className="flex gap-6 text-sm text-gray-400 mb-6">
                  <div>
                    <span className="text-gray-500">Category:</span>{' '}
                    {selectedBroadcast.category}
                  </div>
                  <div>
                    <span className="text-gray-500">Language:</span>{' '}
                    {selectedBroadcast.language || 'English'}
                  </div>
                  {broadcastType === 'radio' && (
                    <div>
                      <span className="text-gray-500">Listeners:</span>{' '}
                      {selectedBroadcast.currentListeners?.toLocaleString() || 0}
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex gap-4">
                  <Button
                    size="lg"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="gap-2"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-5 w-5" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5" />
                        Play
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => toggleFavorite(selectedBroadcast.id)}
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        favorites.includes(selectedBroadcast.id)
                          ? 'fill-red-500 text-red-500'
                          : ''
                      }`}
                    />
                  </Button>
                  <Button variant="outline" size="lg">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Browse Section */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {broadcastType === 'radio' ? 'Live Radio Stations' : 'Featured Podcasts'}
          </h2>

          {broadcasts.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                No {broadcastType} content available
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {broadcasts.map((broadcast: any) => (
                <Card
                  key={broadcast.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => setSelectedBroadcast(broadcast)}
                >
                  <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 relative flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/30 transition-colors">
                    {broadcastType === 'radio' ? (
                      <Radio className="w-16 h-16 text-primary opacity-50 group-hover:opacity-70 transition-opacity" />
                    ) : (
                      <Podcast className="w-16 h-16 text-primary opacity-50 group-hover:opacity-70 transition-opacity" />
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-foreground truncate">
                      {broadcast.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {broadcast.category}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {broadcast.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {broadcastType === 'radio'
                          ? `${broadcast.currentListeners?.toLocaleString() || 0} listening`
                          : `${broadcast.episodeCount || 0} episodes`}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(broadcast.id);
                        }}
                        className="text-muted-foreground hover:text-accent transition-colors"
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            favorites.includes(broadcast.id)
                              ? 'fill-red-500 text-red-500'
                              : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Channel Guide */}
      <ChannelGuideMenu
        channels={broadcasts}
        isOpen={guideOpen}
        onClose={() => setGuideOpen(false)}
        onSelectChannel={(broadcast) => {
          setSelectedBroadcast(broadcast);
          setGuideOpen(false);
        }}
      />
    </div>
  );
}
