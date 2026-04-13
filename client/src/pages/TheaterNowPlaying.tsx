import React from 'react';
import { useMediaPlayer, MediaQueueItem } from '@/contexts/MediaPlayerContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Repeat1,
  Volume2, VolumeX, Tv, Video, ListMusic, Trash2, X
} from 'lucide-react';
import { toast } from 'sonner';

export default function TheaterNowPlaying() {
  const {
    currentChannel,
    isPlaying,
    isLoading,
    hasError,
    volume,
    isMuted,
    currentQueue,
    currentQueueIndex,
    shuffleEnabled,
    repeatMode,
    togglePlayPause,
    playNext,
    playPrevious,
    setVolume,
    toggleMute,
    toggleShuffle,
    setRepeatMode,
    removeFromQueue,
    jumpToTrack,
    clearQueue,
    expandToTheater,
  } = useMediaPlayer();

  const cycleRepeatMode = () => {
    const modes: Array<'off' | 'one' | 'all'> = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);
    toast.info(`Repeat: ${nextMode === 'off' ? 'Off' : nextMode === 'one' ? 'Repeat One' : 'Repeat All'}`);
  };

  const repeatIcon = repeatMode === 'one' ? (
    <Repeat1 className="w-5 h-5" />
  ) : (
    <Repeat className="w-5 h-5" />
  );

  if (!currentChannel) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-8">Now Playing</h1>
          <Card className="p-12 text-center">
            <Tv className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground mb-2">Nothing playing</p>
            <p className="text-sm text-muted-foreground">
              Go to Live Theater or VOD Library to start watching
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">Now Playing</h1>

        {/* Current Channel Card */}
        <Card className="p-6 mb-8">
          <div className="flex items-start gap-6">
            {currentChannel.logo ? (
              <img
                src={currentChannel.logo}
                alt={currentChannel.name}
                className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                {currentChannel.isLive ? (
                  <Tv className="w-10 h-10 text-muted-foreground" />
                ) : (
                  <Video className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-foreground truncate">{currentChannel.name}</h2>
              <p className="text-muted-foreground mt-1">{currentChannel.description || currentChannel.category}</p>
              <div className="flex items-center gap-2 mt-2">
                {currentChannel.isLive && (
                  <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-xs font-semibold rounded">LIVE</span>
                )}
                <span className="text-xs text-muted-foreground capitalize">{currentChannel.category}</span>
                {currentChannel.region && (
                  <span className="text-xs text-muted-foreground">· {currentChannel.region}</span>
                )}
              </div>

              {isLoading && <p className="text-sm text-amber-500 mt-2">Loading stream...</p>}
              {hasError && <p className="text-sm text-red-500 mt-2">Stream error — try another channel</p>}

              {/* Playback Controls */}
              <div className="flex items-center gap-3 mt-4">
                <Button
                  size="icon"
                  variant={shuffleEnabled ? 'default' : 'ghost'}
                  onClick={toggleShuffle}
                  title="Shuffle"
                >
                  <Shuffle className="w-5 h-5" />
                </Button>

                <Button size="icon" variant="ghost" onClick={playPrevious} title="Previous">
                  <SkipBack className="w-5 h-5" />
                </Button>

                <Button size="icon" onClick={togglePlayPause} title={isPlaying ? 'Pause' : 'Play'}>
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>

                <Button size="icon" variant="ghost" onClick={playNext} title="Next">
                  <SkipForward className="w-5 h-5" />
                </Button>

                <Button
                  size="icon"
                  variant={repeatMode !== 'off' ? 'default' : 'ghost'}
                  onClick={cycleRepeatMode}
                  title={`Repeat: ${repeatMode}`}
                >
                  {repeatIcon}
                </Button>

                <div className="flex items-center gap-2 ml-4">
                  <Button size="icon" variant="ghost" onClick={toggleMute} title={isMuted ? 'Unmute' : 'Mute'}>
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </Button>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-24 accent-primary"
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={expandToTheater}
                  className="ml-auto gap-2"
                >
                  <Tv className="w-4 h-4" />
                  Full Theater
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Queue Section */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">Queue</h3>
            <span className="text-sm text-muted-foreground">({currentQueue.length} items)</span>
          </div>
          {currentQueue.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearQueue} className="gap-2 text-muted-foreground">
              <Trash2 className="w-4 h-4" />
              Clear
            </Button>
          )}
        </div>

        {currentQueue.length === 0 ? (
          <Card className="p-8 text-center">
            <ListMusic className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Queue is empty</p>
            <p className="text-sm text-muted-foreground mt-1">Add channels or VOD items to build a queue</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {currentQueue.map((item, index) => (
              <Card
                key={`${item.id}-${index}`}
                className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-accent/50 transition-colors ${
                  index === currentQueueIndex ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => jumpToTrack(index)}
              >
                <span className="text-sm text-muted-foreground w-6 text-right flex-shrink-0">
                  {index === currentQueueIndex && isPlaying ? '▶' : index + 1}
                </span>

                {item.logo ? (
                  <img src={item.logo} alt={item.name} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                    {item.type === 'channel' ? <Tv className="w-5 h-5 text-muted-foreground" /> : <Video className="w-5 h-5 text-muted-foreground" />}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${index === currentQueueIndex ? 'font-semibold text-foreground' : 'text-foreground'}`}>
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">{item.type === 'channel' ? 'Live' : 'VOD'}</p>
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  className="flex-shrink-0 h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromQueue(index);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
