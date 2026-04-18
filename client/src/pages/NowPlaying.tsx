/**
 * NowPlaying — Full-screen queue viewer with drag-to-reorder and controls
 *
 * Shows the current queue, allows users to:
 * - Jump to any track
 * - Remove items from queue
 * - Reorder items via drag-and-drop
 * - Clear entire queue
 * - View current playing track highlighted
 */

import { useRadioPlayer } from '@/contexts/RadioPlayerContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Radio, Trash2, X, Music, Play, Pause } from 'lucide-react';
import { useState } from 'react';
import DashboardLayout from "@/components/DashboardLayout";

export default function NowPlaying() {
  const {
    currentStation,
    isPlaying,
    currentQueue,
    currentQueueIndex,
    removeFromQueue,
    reorderQueue,
    jumpToTrack,
    clearQueue,
    togglePlayPause,
    playNext,
    playPrevious,
  } = useRadioPlayer();

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  if (!currentStation || currentQueue.length === 0) {
    return (
      <DashboardLayout>
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-8">Now Playing</h1>
          <Card className="p-8 text-center">
            <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No queue active</p>
            <p className="text-sm text-muted-foreground mt-2">
              Start playing a radio station or create a playlist to see the queue here.
            </p>
          </Card>
        </div>
      </div>
      </DashboardLayout>
    );
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (toIndex: number) => {
    if (draggedIndex !== null && draggedIndex !== toIndex) {
      reorderQueue(draggedIndex, toIndex);
    }
    setDraggedIndex(null);
   };
  return (
    <DashboardLayout>
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Now Playing Queue</h1>
          <p className="text-muted-foreground">
            {currentQueue.length} item{currentQueue.length !== 1 ? 's' : ''} in queue
          </p>
        </div>

        {/* Current Track */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
              {currentStation.logo ? (
                <img
                  src={currentStation.logo}
                  alt={currentStation.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <Radio className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Currently Playing
              </p>
              <h2 className="text-2xl font-bold text-foreground truncate">
                {currentStation.name}
              </h2>
              <p className="text-sm text-muted-foreground capitalize">
                {currentStation.category}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="default"
                onClick={togglePlayPause}
                className="h-10 w-10 rounded-full p-0"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Queue Controls */}
        <div className="flex gap-2 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={playPrevious}
            disabled={currentQueueIndex === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={playNext}
            disabled={currentQueueIndex >= currentQueue.length - 1}
          >
            Next
          </Button>
          <div className="flex-1" />
          <Button
            variant="destructive"
            size="sm"
            onClick={clearQueue}
          >
            Clear Queue
          </Button>
        </div>

        {/* Queue List */}
        <div className="space-y-2">
          {currentQueue.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(idx)}
              className={`
                flex items-center gap-3 p-4 rounded-lg border transition-all cursor-move
                ${draggedIndex === idx ? 'opacity-50 bg-muted' : ''}
                ${idx === currentQueueIndex
                  ? 'bg-primary/10 border-primary/50'
                  : 'bg-card border-border hover:bg-muted'
                }
              `}
            >
              {/* Drag Handle */}
              <div className="flex-shrink-0 text-muted-foreground text-sm font-semibold w-8 text-center">
                {idx + 1}
              </div>

              {/* Item Logo */}
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                {item.logo ? (
                  <img
                    src={item.logo}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Radio className="w-5 h-5 text-muted-foreground" />
                )}
              </div>

              {/* Item Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
              </div>

              {/* Current Indicator */}
              {idx === currentQueueIndex && (
                <div className="flex-shrink-0">
                  {isPlaying ? (
                    <div className="flex items-center gap-1 text-xs text-primary font-medium">
                      <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      Playing
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">Paused</div>
                  )}
                </div>
              )}

              {/* Jump Button */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => jumpToTrack(idx)}
                disabled={idx === currentQueueIndex}
                className="h-8 px-2 flex-shrink-0"
              >
                Jump
              </Button>

              {/* Remove Button */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeFromQueue(idx)}
                className="h-8 w-8 p-0 flex-shrink-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Drag Hint */}
        <p className="text-xs text-muted-foreground text-center mt-8">
          Drag items to reorder the queue
        </p>
      </div>
    </div>
    </DashboardLayout>
  );
}
