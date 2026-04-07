import { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface VideoPlayerProps {
  streamUrl: string;
  title: string;
  channelName: string;
  onFavoriteToggle?: (isFavorite: boolean) => void;
  isFavorite?: boolean;
}

export function VideoPlayer({
  streamUrl,
  title,
  channelName,
  onFavoriteToggle,
  isFavorite = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [qualityOptions, setQualityOptions] = useState(["Auto", "1080p", "720p", "480p"]);
  const [selectedQuality, setSelectedQuality] = useState("Auto");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize video player with HLS support
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Check if browser supports HLS natively
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (typeof window !== "undefined" && "MediaSource" in window) {
      // For browsers that don't support HLS natively, use HLS.js
      // This would require importing hls.js library
      video.src = streamUrl;
    }

    video.volume = volume / 100;

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleError = () => {
      setError("Failed to load video stream");
      setIsLoading(false);
    };

    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("error", handleError);
    };
  }, [streamUrl, volume]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100;
    }
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume / 100;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!isFullscreen) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleProgressChange = (newTime: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div
      ref={containerRef}
      className="w-full bg-black rounded-lg overflow-hidden group"
    >
      {/* Video Container */}
      <div className="relative w-full bg-black aspect-video flex items-center justify-center">
        {error ? (
          <div className="text-white text-center">
            <p className="text-lg font-semibold">{error}</p>
            <p className="text-sm text-gray-400 mt-2">Stream URL: {streamUrl}</p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              crossOrigin="anonymous"
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="animate-spin">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full" />
                </div>
              </div>
            )}
          </>
        )}

        {/* Overlay Controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Top Info */}
          <div className="absolute top-0 left-0 right-0 p-4">
            <h3 className="text-white font-semibold text-lg">{title}</h3>
            <p className="text-gray-300 text-sm">{channelName}</p>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
            {/* Progress Bar */}
            <div className="flex items-center gap-2">
              <span className="text-white text-xs">{formatTime(currentTime)}</span>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={0.1}
                onValueChange={(value) => handleProgressChange(value[0])}
                className="flex-1"
              />
              <span className="text-white text-xs">{formatTime(duration)}</span>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Play/Pause */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handlePlayPause}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </Button>

                {/* Volume */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleMute}
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={100}
                    step={1}
                    onValueChange={(value) => handleVolumeChange(value[0])}
                    className="w-24"
                  />
                  <span className="text-white text-xs w-8">{isMuted ? 0 : volume}%</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Quality Selector */}
                <select
                  value={selectedQuality}
                  onChange={(e) => setSelectedQuality(e.target.value)}
                  className="bg-black/50 text-white text-xs px-2 py-1 rounded border border-white/20"
                >
                  {qualityOptions.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>

                {/* Fullscreen */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleFullscreen}
                  className="text-white hover:bg-white/20"
                >
                  <Maximize className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-4 bg-gray-900 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold">{title}</h3>
            <p className="text-gray-400 text-sm">{channelName}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFavoriteToggle?.(!isFavorite)}
            className={isFavorite ? "bg-red-500 text-white" : ""}
          >
            {isFavorite ? "★" : "☆"} Favorite
          </Button>
        </div>
      </div>
    </div>
  );
}
