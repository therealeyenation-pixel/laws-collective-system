import { useEffect } from 'react';
import { useRadioPlayer } from '@/contexts/RadioPlayerContext';

/**
 * Custom hook for keyboard shortcuts in the radio player
 * Shift+N: Next track
 * Shift+P: Previous track
 * Shift+R: Cycle repeat mode (off → repeat-one → repeat-all)
 */
export function useKeyboardShortcuts() {
  const radioPlayer = useRadioPlayer();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if Shift is held
      if (!e.shiftKey) return;

      // Ignore if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      switch (e.key.toUpperCase()) {
        case 'N':
          // Next track
          e.preventDefault();
          radioPlayer.nextTrack();
          break;

        case 'P':
          // Previous track
          e.preventDefault();
          radioPlayer.previousTrack();
          break;

        case 'R':
          // Cycle repeat mode
          e.preventDefault();
          const modes = ['off', 'repeat-one', 'repeat-all'] as const;
          const currentIndex = modes.indexOf(radioPlayer.repeatMode);
          const nextMode = modes[(currentIndex + 1) % modes.length];
          radioPlayer.setRepeatMode(nextMode);
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [radioPlayer]);
}
