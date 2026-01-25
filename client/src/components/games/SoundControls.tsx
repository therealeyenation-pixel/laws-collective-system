import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Volume2, VolumeX, Volume1 } from "lucide-react";
import { useSound } from "@/lib/soundManager";

interface SoundControlsProps {
  className?: string;
  showLabel?: boolean;
}

export function SoundControls({ className = "", showLabel = false }: SoundControlsProps) {
  const { isMuted, volume, toggleMute, setVolume, play } = useSound();
  const [isOpen, setIsOpen] = useState(false);

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    // Play a click sound to preview the volume
    if (!isMuted && value[0] > 0) {
      play('click');
    }
  };

  const handleToggleMute = () => {
    toggleMute();
    // Play a sound when unmuting to confirm
    if (isMuted) {
      setTimeout(() => play('click'), 50);
    }
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <VolumeX className="w-4 h-4" />;
    }
    if (volume < 0.5) {
      return <Volume1 className="w-4 h-4" />;
    }
    return <Volume2 className="w-4 h-4" />;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`gap-2 ${className}`}
        >
          {getVolumeIcon()}
          {showLabel && <span>{isMuted ? "Muted" : "Sound"}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Sound Effects</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleMute}
              className="h-8 px-2"
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-4 h-4 mr-1" />
                  Unmute
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 mr-1" />
                  Mute
                </>
              )}
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Volume</span>
              <span className="text-muted-foreground">{Math.round(volume * 100)}%</span>
            </div>
            <Slider
              value={[volume]}
              onValueChange={handleVolumeChange}
              max={1}
              step={0.05}
              disabled={isMuted}
              className={isMuted ? "opacity-50" : ""}
            />
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Sound effects play for achievements, level ups, and game events.
            </p>
          </div>

          {/* Test sounds */}
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-2">Test sounds:</p>
            <div className="flex flex-wrap gap-1">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => play('achievement')}
                disabled={isMuted}
              >
                Achievement
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => play('levelUp')}
                disabled={isMuted}
              >
                Level Up
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => play('success')}
                disabled={isMuted}
              >
                Success
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => play('error')}
                disabled={isMuted}
              >
                Error
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default SoundControls;
