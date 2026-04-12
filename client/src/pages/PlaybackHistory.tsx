import React, { useState } from 'react';
import { useRadioPlayer, PlaybackHistoryItem } from '@/contexts/RadioPlayerContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Trash2, Clock, RotateCcw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function PlaybackHistory() {
  const { playbackHistory, clearHistory, playStation } = useRadioPlayer();
  const [isClearing, setIsClearing] = useState(false);

  const handleReplay = (item: PlaybackHistoryItem) => {
    playStation({
      id: parseInt(item.id.split('-')[0], 10),
      name: item.name,
      description: '',
      category: item.type,
      streamUrl: item.streamUrl,
      logo: item.logo,
    });
    toast.success(`Now playing: ${item.name}`);
  };

  const handleClearHistory = async () => {
    if (window.confirm('Clear all playback history? This cannot be undone.')) {
      setIsClearing(true);
      try {
        clearHistory();
        toast.success('Playback history cleared');
      } catch (error) {
        console.error('Error clearing history:', error);
        toast.error('Failed to clear history');
      } finally {
        setIsClearing(false);
      }
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Playback History</h1>
            <p className="text-muted-foreground">
              {playbackHistory.length} item{playbackHistory.length !== 1 ? 's' : ''} in history
            </p>
          </div>
          {playbackHistory.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearHistory}
              disabled={isClearing}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Clear History
            </Button>
          )}
        </div>

        {/* History List */}
        {playbackHistory.length === 0 ? (
          <Card className="p-12 text-center">
            <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No playback history yet</p>
            <p className="text-sm text-muted-foreground">
              Start playing radio stations or TV channels to build your history
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {playbackHistory.map((item, index) => (
              <Card
                key={item.id}
                className="p-4 hover:bg-accent/50 transition-colors flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Logo */}
                  {item.logo && (
                    <img
                      src={item.logo}
                      alt={item.name}
                      className="w-12 h-12 rounded object-cover flex-shrink-0"
                    />
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatDistanceToNow(new Date(item.playedAt), { addSuffix: true })}</span>
                      <span>•</span>
                      <span>{formatDuration(item.duration)}</span>
                      <span>•</span>
                      <span className="capitalize">{item.type}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleReplay(item)}
                  className="gap-2 flex-shrink-0"
                >
                  <Play className="w-4 h-4" />
                  Play
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
