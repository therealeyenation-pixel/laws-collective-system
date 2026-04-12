/**
 * RadioMiniBar — Persistent bottom mini-player for radio with queue preview
 *
 * Appears at the bottom of every page when a radio station is playing.
 * Survives navigation because it's rendered inside DashboardLayout which
 * wraps the entire app.
 */

import { useRadioPlayer } from '@/contexts/RadioPlayerContext';
import { Button } from '@/components/ui/button';
import { Play, Pause, X, Radio, Volume2, VolumeX, ExternalLink, List, Repeat, Repeat1 } from 'lucide-react';
import { useLocation } from 'wouter';
import { useState } from 'react';

export default function RadioMiniBar() {
  const {
    currentStation,
    isPlaying,
    isLoading,
    hasError,
    volume,
    isMuted,
    currentQueue,
    currentQueueIndex,
    repeatMode,
    togglePlayPause,
    stopPlayback,
    setVolume,
    toggleMute,
    playNext,
    playPrevious,
    setRepeatMode,
  } = useRadioPlayer();

  const [showQueue, setShowQueue] = useState(false);
  const [, navigate] = useLocation();

  // Only show when a station is loaded
  if (!currentStation) return null;

  // Get next items in queue (max 5)
  const nextItems = currentQueue.slice(currentQueueIndex + 1, currentQueueIndex + 6);

  return (
    <>
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg"
        style={{ height: '64px' }}
      >
        <div className="h-full flex items-center gap-3 px-4 max-w-full">
          {/* Station Logo */}
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
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
              <Radio className="w-5 h-5 text-muted-foreground" />
            )}
          </div>

          {/* Station Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground truncate leading-tight">
                {currentStation.name}
              </p>
              {isPlaying && !isLoading && (
                <span className="flex-shrink-0 inline-flex items-center gap-1 text-xs text-green-500 font-medium">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  LIVE
                </span>
              )}
              {isLoading && (
                <span className="flex-shrink-0 text-xs text-muted-foreground">Buffering…</span>
              )}
              {hasError && (
                <span className="flex-shrink-0 text-xs text-red-500">Stream error</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate capitalize">
              {currentStation.category} · {currentStation.description}
            </p>
          </div>

          {/* Audio Visualizer — only on desktop */}
          {isPlaying && !isLoading && (
            <div className="hidden md:flex items-end gap-0.5 h-6 flex-shrink-0">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-primary rounded-full"
                  style={{
                    height: `${8 + Math.random() * 16}px`,
                    animation: `pulse ${0.4 + i * 0.07}s ease-in-out infinite alternate`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Volume — desktop only */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleMute}
              className="h-8 w-8 p-0"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-20 h-1.5 bg-muted rounded-full cursor-pointer accent-primary"
            />
          </div>

          {/* Repeat Mode Toggle */}
          <Button
            size="sm"
            variant={repeatMode !== 'off' ? 'default' : 'ghost'}
            onClick={() => {
              const modes: Array<'off' | 'one' | 'all'> = ['off', 'one', 'all'];
              const nextMode = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
              setRepeatMode(nextMode);
            }}
            className="h-8 w-8 p-0 flex-shrink-0"
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-4 h-4" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
          </Button>

          {/* Queue Preview Button */}
          {currentQueue.length > 0 && (
            <Button
              size="sm"
              variant={showQueue ? 'default' : 'ghost'}
              onClick={() => setShowQueue(!showQueue)}
              className="h-8 w-8 p-0 flex-shrink-0 relative"
              title="Show queue"
            >
              <List className="w-4 h-4" />
              {nextItems.length > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {nextItems.length}
                </span>
              )}
            </Button>
          )}

          {/* Play / Pause */}
          <Button
            size="sm"
            variant="default"
            onClick={togglePlayPause}
            disabled={isLoading}
            className="h-10 w-10 rounded-full p-0 flex-shrink-0"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </Button>

          {/* Go to Radio page */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate('/broadcast-radio')}
            className="h-8 w-8 p-0 flex-shrink-0"
            title="Open Radio"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>

          {/* Stop / Close */}
          <Button
            size="sm"
            variant="ghost"
            onClick={stopPlayback}
            className="h-8 w-8 p-0 flex-shrink-0 text-muted-foreground hover:text-destructive"
            title="Stop radio"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Queue Preview Drawer */}
      {showQueue && nextItems.length > 0 && (
        <div
          className="fixed bottom-16 left-0 right-0 z-40 bg-card border-t border-border shadow-lg max-h-64 overflow-y-auto"
        >
          <div className="p-3">
            <p className="text-xs font-semibold text-muted-foreground mb-2 px-2">
              Next in Queue ({nextItems.length})
            </p>
            <div className="space-y-1">
              {nextItems.map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer text-sm"
                >
                  <div className="w-8 h-8 rounded bg-muted flex-shrink-0 flex items-center justify-center">
                    {item.logo ? (
                      <img
                        src={item.logo}
                        alt={item.name}
                        className="w-full h-full object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Radio className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground truncate font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
