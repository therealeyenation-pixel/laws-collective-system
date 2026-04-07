/**
 * Listening History - Track and manage recently played content
 * View history for tracks, channels, and stations
 */

import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Music, Radio, Tv, Clock, ArrowLeft, Trash2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

type HistoryType = 'track' | 'channel' | 'station';

interface HistoryEntry {
  type: HistoryType;
  id: number;
  title: string;
  artist?: string;
  duration?: number;
  playedAt: Date;
}

export default function ListeningHistory() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<HistoryType>('track');

  // Fetch history
  const { data: history = [], refetch } = trpc.streamingUserData.getHistory.useQuery({
    limit: 50,
    type: activeTab,
  });

  // Fetch stats
  const { data: stats } = trpc.streamingUserData.getStats.useQuery();

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  const getIcon = (type: HistoryType) => {
    switch (type) {
      case 'track':
        return <Music className="w-5 h-5" />;
      case 'channel':
        return <Tv className="w-5 h-5" />;
      case 'station':
        return <Radio className="w-5 h-5" />;
    }
  };

  const getTitle = (type: HistoryType) => {
    switch (type) {
      case 'track':
        return 'Recently Played Tracks';
      case 'channel':
        return 'Recently Watched Channels';
      case 'station':
        return 'Recently Listened Stations';
    }
  };

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

      <div className="p-6 max-w-4xl mx-auto">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {stats.totalPlays}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Total Plays</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {stats.tracksPlayed}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Tracks</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {stats.channelsWatched}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Channels</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {stats.stationsListened}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Stations</p>
            </Card>
          </div>
        )}

        {/* History Tabs */}
        <Card className="p-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as HistoryType)}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="track" className="gap-2">
                <Music className="w-4 h-4" />
                Tracks
              </TabsTrigger>
              <TabsTrigger value="channel" className="gap-2">
                <Tv className="w-4 h-4" />
                Channels
              </TabsTrigger>
              <TabsTrigger value="station" className="gap-2">
                <Radio className="w-4 h-4" />
                Stations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="track" className="space-y-2">
              <h3 className="font-semibold text-foreground mb-4">
                {getTitle('track')}
              </h3>
              {history.length === 0 ? (
                <div className="text-center py-12">
                  <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No tracks played yet</p>
                </div>
              ) : (
                history.map((entry) => (
                  <Card key={`${entry.id}-${entry.playedAt}`} className="p-4 hover:bg-secondary transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <Music className="w-5 h-5 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">
                            {entry.title}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {entry.artist}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(entry.playedAt)}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="channel" className="space-y-2">
              <h3 className="font-semibold text-foreground mb-4">
                {getTitle('channel')}
              </h3>
              {history.length === 0 ? (
                <div className="text-center py-12">
                  <Tv className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No channels watched yet</p>
                </div>
              ) : (
                history.map((entry) => (
                  <Card key={`${entry.id}-${entry.playedAt}`} className="p-4 hover:bg-secondary transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <Tv className="w-5 h-5 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">
                            {entry.title}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(entry.playedAt)}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="station" className="space-y-2">
              <h3 className="font-semibold text-foreground mb-4">
                {getTitle('station')}
              </h3>
              {history.length === 0 ? (
                <div className="text-center py-12">
                  <Radio className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No stations listened yet</p>
                </div>
              ) : (
                history.map((entry) => (
                  <Card key={`${entry.id}-${entry.playedAt}`} className="p-4 hover:bg-secondary transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <Radio className="w-5 h-5 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">
                            {entry.title}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(entry.playedAt)}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
