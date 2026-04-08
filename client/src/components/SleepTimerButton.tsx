/**
 * SleepTimerButton - Dropdown button for setting a sleep timer
 * Reusable across Theater and Radio pages
 */

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Timer, TimerOff } from 'lucide-react';
import type { SleepTimerDuration } from '@/hooks/useMediaFeatures';

interface SleepTimerButtonProps {
  isActive: boolean;
  remainingFormatted: string;
  onStart: (minutes: SleepTimerDuration) => void;
  onCancel: () => void;
  variant?: 'ghost' | 'outline' | 'default';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export default function SleepTimerButton({
  isActive,
  remainingFormatted,
  onStart,
  onCancel,
  variant = 'ghost',
  size = 'sm',
  className = '',
}: SleepTimerButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`gap-1.5 ${isActive ? 'text-primary' : ''} ${className}`}
          title={isActive ? `Sleep timer: ${remainingFormatted}` : 'Set sleep timer'}
        >
          {isActive ? <TimerOff className="w-4 h-4" /> : <Timer className="w-4 h-4" />}
          {isActive && (
            <span className="text-xs font-mono tabular-nums">{remainingFormatted}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={() => onStart(15)} className="cursor-pointer">
          <Timer className="w-4 h-4 mr-2" />
          15 minutes
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStart(30)} className="cursor-pointer">
          <Timer className="w-4 h-4 mr-2" />
          30 minutes
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStart(60)} className="cursor-pointer">
          <Timer className="w-4 h-4 mr-2" />
          60 minutes
        </DropdownMenuItem>
        {isActive && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onCancel}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <TimerOff className="w-4 h-4 mr-2" />
              Cancel timer
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
