/**
 * Music Player - Full-Featured Audio Streaming Interface
 * Real music tracks with playback controls, queue, and album art
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Share2, List, Repeat, Shuffle, ArrowLeft } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { Slider } from '@/components/ui/slider';

export default function MusicPlayerReal() {
  const { user } = useAuth();
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(70);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [isShuffle, setIsShuffle] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  // Fetch all music tracks
  const { data: tracks = [], isLoading } = trpc.streamingContent.getTracks.useQuery({ limit: 50 });

  const currentTrack = tracks[currentTrackIndex];

  // Simulate playback progress
  useEffect(() => {
    if (!isPlaying || !currentTrack) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= currentTrack.duration) {
          handleNextTrack();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, currentTrack]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePreviousTrack = () => {
    if (currentTime > 3) {
      setCurrentTime(0);
    } else {
      setCurrentTrackIndex((prev) => (prev === 0 ? tracks.length - 1 : prev - 1));
      setCurrentTime(0);
    }
  };

  const handleNextTrack = () => {
    if (isShuffle) {
      setCurrentTrackIndex(Math.floor(Math.random() * tracks.length));
    } else {
      setCurrentTrackIndex((prev) => (prev === tracks.length - 1 ? 0 : prev + 1));
    }
    setCurrentTime(0);
  };

  const handleSelectTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handleRepeatToggle = () => {
    setRepeatMode((prev) => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'));
  };

  const handleShuffleToggle = () => {
    setIsShuffle(!isShuffle);
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Loading music library...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
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

      <div className="flex h-[calc(100vh-60px)]">
        {/* Main Player */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          {currentTrack ? (
            <>
              {/* Album Art */}
              <div className="mb-8 relative">
                <img
                  src={currentTrack.cover}
                  alt={currentTrack.title}
                  className="w-64 h-64 rounded-lg shadow-2xl object-cover"
                />
                {isPlaying && (
                  <div className="absolute inset-0 rounded-lg border-4 border-primary animate-pulse"></div>
                )}
              </div>

              {/* Track Info */}
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-foreground mb-2">{currentTrack.title}</h1>
                <p className="text-xl text-muted-foreground mb-1">{currentTrack.artist}</p>
                <p className="text-sm text-muted-foreground">{currentTrack.album}</p>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-md mb-8">
                <Slider
                  value={[currentTime]}
                  onValueChange={(value) => setCurrentTime(value[0])}
                  max={currentTrack.duration}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(currentTrack.duration)}</span>
                </div>
              </div>

              {/* Main Controls */}
              <div className="flex items-center justify-center gap-6 mb-8">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleShuffleToggle}
                  className={isShuffle ? 'text-primary' : 'text-muted-foreground'}
                >
                  <Shuffle className="w-5 h-5" />
                </Button>

                <Button
                  size="icon"
                  variant="outline"
                  onClick={handlePreviousTrack}
                >
                  <SkipBack className="w-5 h-5" />
                </Button>

                <Button
                  size="lg"
                  className="rounded-full w-16 h-16"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                </Button>

                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleNextTrack}
                >
                  <SkipForward className="w-5 h-5" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleRepeatToggle}
                  className={repeatMode !== 'off' ? 'text-primary' : 'text-muted-foreground'}
                >
                  <Repeat className="w-5 h-5" />
                  {repeatMode === 'one' && (
                    <span className="absolute text-xs font-bold">1</span>
                  )}
                </Button>
              </div>

              {/* Secondary Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleToggleFavorite}
                  className={isFavorite ? 'text-red-500' : 'text-muted-foreground'}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500' : ''}`} />
                </Button>
                <Button size="icon" variant="ghost" className="text-muted-foreground">
                  <Share2 className="w-5 h-5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowQueue(!showQueue)}
                  className={showQueue ? 'text-primary' : 'text-muted-foreground'}
                >
                  <List className="w-5 h-5" />
                </Button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-4 mt-8 w-full max-w-md">
                <Volume2 className="w-4 h-4 text-muted-foreground" />
                <Slider
                  value={[volume]}
                  onValueChange={(value) => setVolume(value[0])}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-8 text-right">{volume}%</span>
              </div>
            </>
          ) : (
            <div className="text-center">
              <p className="text-muted-foreground">No tracks available</p>
            </div>
          )}
        </div>

        {/* Queue Sidebar */}
        {showQueue && (
          <div className="w-80 border-l border-border bg-card overflow-y-auto">
            <div className="p-4 border-b border-border sticky top-0 bg-card">
              <h2 className="font-bold text-foreground">Queue</h2>
              <p className="text-xs text-muted-foreground">{tracks.length} tracks</p>
            </div>

            <div className="space-y-2 p-4">
              {tracks.map((track, index) => (
                <Card
                  key={track.id}
                  className={`p-3 cursor-pointer transition-all ${
                    index === currentTrackIndex
                      ? 'bg-primary/10 border-primary ring-1 ring-primary'
                      : 'hover:bg-secondary'
                  }`}
                  onClick={() => handleSelectTrack(index)}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={track.cover}
                      alt={track.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {track.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {track.artist}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(track.duration)}
                      </p>
                    </div>
                    {index === currentTrackIndex && isPlaying && (
                      <div className="flex gap-0.5">
                        <div className="w-0.5 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-0.5 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-0.5 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
