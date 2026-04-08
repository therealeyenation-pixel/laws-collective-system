/**
 * MiniPlayer - Persistent bottom bar for theater stream playback.
 * 
 * The <video> element lives in #media-portal (outside React).
 * This component ONLY renders the mini-bar UI controls.
 * Video positioning is handled by MediaPlayerContext.
 */

import { useMediaPlayer } from '@/contexts/MediaPlayerContext';
import { Button } from '@/components/ui/button';
import {
  Play,
  Pause,
  X,
  Volume2,
  VolumeX,
  PictureInPicture2,
  Maximize2,
} from 'lucide-react';

export default function MiniPlayer() {
  const {
    currentChannel,
    isPlaying,
    isLoading,
    hasError,
    volume,
    isMuted,
    miniPlayerVisible,
    isPiP,
    theaterMode,
    togglePlayPause,
    setVolume,
    toggleMute,
    togglePiP,
    dismissMiniPlayer,
    expandToTheater,
  } = useMediaPlayer();

  // Only show mini-bar when playing and NOT in theater mode
  if (!miniPlayerVisible || !currentChannel || theaterMode) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg">
      <div className="max-w-full mx-auto px-3 py-2">
        <div className="flex items-center gap-3">
          {/* Channel logo thumbnail */}
          <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-muted relative">
            <img
              src={currentChannel.logo}
              alt={currentChannel.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  `https://via.placeholder.com/48x48/333/FFF?text=${encodeURIComponent(currentChannel.name.substring(0, 3))}`;
              }}
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {isPlaying && !isLoading && (
              <div className="absolute top-0.5 right-0.5">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse block" />
              </div>
            )}
          </div>

          {/* Channel info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {currentChannel.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {hasError ? 'Stream unavailable' : isPlaying ? '● LIVE' : currentChannel.description}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              size="sm"
              variant="ghost"
              onClick={togglePlayPause}
              className="h-8 w-8 p-0"
              disabled={hasError}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={toggleMute}
              className="h-8 w-8 p-0 hidden sm:flex"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>

            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-16 h-1 bg-muted rounded cursor-pointer accent-primary hidden md:block"
            />

            <Button
              size="sm"
              variant="ghost"
              onClick={togglePiP}
              className={`h-8 w-8 p-0 hidden sm:flex ${isPiP ? 'text-primary' : ''}`}
              title="Picture-in-Picture"
            >
              <PictureInPicture2 className="w-4 h-4" />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={expandToTheater}
              className="h-8 w-8 p-0"
              title="Open in Theater"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={dismissMiniPlayer}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              title="Stop & Close"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
