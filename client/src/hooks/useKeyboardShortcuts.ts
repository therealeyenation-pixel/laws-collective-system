import { useEffect } from 'react';
import { useRadioPlayer } from '@/contexts/RadioPlayerContext';
import { useMediaPlayer } from '@/contexts/MediaPlayerContext';

/**
 * Custom hook for keyboard shortcuts for both Radio and Theater players.
 * Detects which player is active and routes shortcuts accordingly.
 *
 * Shift+N: Next track
 * Shift+P: Previous track
 * Shift+R: Cycle repeat mode (off → one → all)
 * Shift+S: Toggle shuffle (Theater only)
 * Shift+Space: Toggle play/pause on active player
 * Shift+M: Toggle mute on active player
 */
export function useKeyboardShortcuts() {
  const radioPlayer = useRadioPlayer();
  const mediaPlayer = useMediaPlayer();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if Shift is held
      if (!e.shiftKey) return;

      // Ignore if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      // Determine which player is active (Radio takes priority if both somehow active)
      const radioActive = !!radioPlayer.currentStation;
      const theaterActive = !!mediaPlayer.currentChannel;

      switch (e.key.toUpperCase()) {
        case 'N':
          // Next track
          e.preventDefault();
          if (radioActive) {
            radioPlayer.playNext();
          } else if (theaterActive) {
            mediaPlayer.nextTrack();
          }
          break;

        case 'P':
          // Previous track
          e.preventDefault();
          if (radioActive) {
            radioPlayer.playPrevious();
          } else if (theaterActive) {
            mediaPlayer.previousTrack();
          }
          break;

        case 'R':
          // Cycle repeat mode
          e.preventDefault();
          if (radioActive) {
            const radioModes: Array<'off' | 'one' | 'all'> = ['off', 'one', 'all'];
            const rIdx = radioModes.indexOf(radioPlayer.repeatMode);
            radioPlayer.setRepeatMode(radioModes[(rIdx + 1) % radioModes.length]);
          } else if (theaterActive) {
            const theaterModes: Array<'off' | 'one' | 'all'> = ['off', 'one', 'all'];
            const tIdx = theaterModes.indexOf(mediaPlayer.repeatMode);
            mediaPlayer.setRepeatMode(theaterModes[(tIdx + 1) % theaterModes.length]);
          }
          break;

        case 'S':
          // Toggle shuffle (Theater only — Radio doesn't have shuffle)
          e.preventDefault();
          if (theaterActive) {
            mediaPlayer.toggleShuffle();
          }
          break;

        case ' ':
          // Toggle play/pause
          e.preventDefault();
          if (radioActive) {
            radioPlayer.togglePlayPause();
          } else if (theaterActive) {
            mediaPlayer.togglePlayPause();
          }
          break;

        case 'M':
          // Toggle mute
          e.preventDefault();
          if (radioActive) {
            radioPlayer.toggleMute();
          } else if (theaterActive) {
            mediaPlayer.toggleMute();
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [radioPlayer, mediaPlayer]);
}
