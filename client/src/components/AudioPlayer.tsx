import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface AudioPlayerProps {
  title: string;
  artist?: string;
  streamUrl: string;
  onPlay?: () => void;
  onPause?: () => void;
}

export function AudioPlayer({ title, artist, streamUrl, onPlay, onPause }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        onPause?.();
      } else {
        audioRef.current.play().catch(err => {
          console.error("Error playing audio:", err);
        });
        setIsPlaying(true);
        onPlay?.();
      }
    }
  };

  const handleLoadStart = () => {
    setIsLoading(true);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = percent * duration;
    }
  };

  return (
    <Card className="w-full p-6 bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20">
      <audio
        ref={audioRef}
        src={streamUrl}
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        crossOrigin="anonymous"
      />

      <div className="space-y-4">
        {/* Title and Artist */}
        <div>
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          {artist && <p className="text-sm text-muted-foreground">{artist}</p>}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div
            onClick={handleProgressClick}
            className="w-full h-2 bg-muted rounded-full cursor-pointer hover:h-3 transition-all"
          >
            <div
              className="h-full bg-accent rounded-full transition-all"
              style={{
                width: duration ? `${(currentTime / duration) * 100}%` : "0%",
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePlayPause}
              disabled={isLoading}
              className="w-12 h-12 p-0"
            >
              {isLoading ? (
                <div className="animate-spin">⏳</div>
              ) : isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 flex-1">
            {volume === 0 ? (
              <VolumeX className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Volume2 className="w-4 h-4 text-muted-foreground" />
            )}
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="flex-1 h-2 bg-muted rounded-full cursor-pointer"
            />
            <span className="text-xs text-muted-foreground w-8 text-right">{volume}%</span>
          </div>
        </div>

        {/* Status */}
        {isLoading && <p className="text-xs text-muted-foreground">Loading stream...</p>}
        {isPlaying && !isLoading && (
          <p className="text-xs text-accent animate-pulse">● Now playing</p>
        )}
      </div>
    </Card>
  );
}
