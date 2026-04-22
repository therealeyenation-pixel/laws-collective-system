import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  Maximize,
  Minimize,
} from "lucide-react";

interface MediaPlayerProps {
  channel: {
    id: number;
    title: string;
    category: string;
    streamUrl?: string;
    description?: string;
    contentType: string;
  };
  onClose: () => void;
}

export function MediaPlayer({ channel, onClose }: MediaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playbackLoggedRef = useRef(false);

  const isAudio = channel.contentType === "radio_station" || channel.contentType === "music_track";
  const { mutate: logPlayback } = trpc.streamingContent.logPlayback.useMutation();

  useEffect(() => {
    const mediaElement = isAudio ? audioRef.current : videoRef.current;
    if (!mediaElement) return;

    mediaElement.volume = volume;
  }, [volume, isAudio]);

  const handlePlayPause = () => {
    const mediaElement = isAudio ? audioRef.current : videoRef.current;
    if (!mediaElement) return;

    if (isPlaying) {
      mediaElement.pause();
    } else {
      mediaElement.play().catch((err) => console.error("Playback error:", err));
      
      // Log playback on first play
      if (!playbackLoggedRef.current) {
        logPlayback({ 
          contentId: String(channel.id), 
          contentType: channel.contentType as 'channel' | 'station' | 'track'
        });
        playbackLoggedRef.current = true;
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleTimeUpdate = () => {
    const mediaElement = isAudio ? audioRef.current : videoRef.current;
    if (mediaElement) {
      setCurrentTime(mediaElement.currentTime);
      setDuration(mediaElement.duration);
    }
  };

  const handleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      try {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error("Fullscreen error:", err);
      }
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const mediaElement = isAudio ? audioRef.current : videoRef.current;
    if (!mediaElement || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    mediaElement.currentTime = percent * duration;
  };

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 ${
        isFullscreen ? "fullscreen" : ""
      }`}
    >
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-lg">{channel.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{channel.category}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Media Element */}
          {isAudio ? (
            <audio
              ref={audioRef}
              src={channel.streamUrl}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              crossOrigin="anonymous"
            />
          ) : (
            <video
              ref={videoRef}
              src={channel.streamUrl}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              crossOrigin="anonymous"
              className="w-full bg-black rounded"
              controls={false}
            />
          )}

          {/* Video Player Display */}
          {!isAudio && (
            <div className="bg-black rounded overflow-hidden">
              <video
                ref={videoRef}
                src={channel.streamUrl}
                className="w-full"
                crossOrigin="anonymous"
              />
            </div>
          )}

          {/* Description */}
          {channel.description && (
            <p className="text-sm text-muted-foreground">{channel.description}</p>
          )}

          {/* Progress Bar */}
          <div className="space-y-2">
            <div
              onClick={handleProgressClick}
              className="h-2 bg-secondary rounded cursor-pointer hover:h-3 transition-all"
            >
              <div
                className="h-full bg-accent rounded"
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
              {/* Play/Pause */}
              <Button
                onClick={handlePlayPause}
                size="icon"
                className="h-10 w-10"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </Button>

              {/* Volume Control */}
              <div className="flex items-center gap-2">
                {volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                )}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-2 bg-secondary rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Fullscreen Button */}
            {!isAudio && (
              <Button
                onClick={handleFullscreen}
                variant="ghost"
                size="icon"
                className="h-10 w-10"
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
              </Button>
            )}
          </div>

          {/* Stream Status */}
          {!channel.streamUrl && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded text-sm text-amber-700 dark:text-amber-400">
              Stream URL not available for this channel
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
