/**
 * Sound Manager - Handles all audio playback for the L.A.W.S. Game Center
 * Uses Web Audio API for low-latency sound effects
 */

type SoundType = 
  | 'achievement'
  | 'levelUp'
  | 'tutorialStep'
  | 'success'
  | 'error'
  | 'click'
  | 'notification'
  | 'chapterComplete';

interface SoundConfig {
  frequency: number;
  duration: number;
  type: OscillatorType;
  volume: number;
  ramp?: 'up' | 'down' | 'none';
  notes?: number[];
}

const SOUND_CONFIGS: Record<SoundType, SoundConfig> = {
  achievement: {
    frequency: 880,
    duration: 0.3,
    type: 'sine',
    volume: 0.3,
    ramp: 'down',
    notes: [523.25, 659.25, 783.99, 1046.50], // C5, E5, G5, C6 - triumphant chord
  },
  levelUp: {
    frequency: 440,
    duration: 0.5,
    type: 'sine',
    volume: 0.25,
    notes: [261.63, 329.63, 392.00, 523.25, 659.25], // C4 to E5 ascending
  },
  tutorialStep: {
    frequency: 600,
    duration: 0.15,
    type: 'sine',
    volume: 0.2,
    ramp: 'down',
  },
  success: {
    frequency: 800,
    duration: 0.2,
    type: 'sine',
    volume: 0.2,
    notes: [523.25, 659.25], // C5, E5 - simple success
  },
  error: {
    frequency: 200,
    duration: 0.3,
    type: 'sawtooth',
    volume: 0.15,
    notes: [300, 200], // Descending error tone
  },
  click: {
    frequency: 1000,
    duration: 0.05,
    type: 'sine',
    volume: 0.1,
  },
  notification: {
    frequency: 700,
    duration: 0.2,
    type: 'sine',
    volume: 0.2,
    notes: [700, 900], // Two-tone notification
  },
  chapterComplete: {
    frequency: 440,
    duration: 0.8,
    type: 'sine',
    volume: 0.3,
    notes: [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50], // Full ascending scale
  },
};

class SoundManager {
  private audioContext: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.5;
  private initialized: boolean = false;

  constructor() {
    // Load preferences from localStorage
    if (typeof window !== 'undefined') {
      const savedMuted = localStorage.getItem('laws_sound_muted');
      const savedVolume = localStorage.getItem('laws_sound_volume');
      
      if (savedMuted !== null) {
        this.isMuted = savedMuted === 'true';
      }
      if (savedVolume !== null) {
        this.volume = parseFloat(savedVolume);
      }
    }
  }

  private initAudioContext(): void {
    if (!this.audioContext && typeof window !== 'undefined') {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.initialized = true;
      } catch (e) {
        console.warn('Web Audio API not supported:', e);
      }
    }
  }

  private playTone(frequency: number, duration: number, type: OscillatorType, volume: number, startTime: number = 0): void {
    if (!this.audioContext || this.isMuted) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime + startTime);

    const adjustedVolume = volume * this.volume;
    gainNode.gain.setValueAtTime(adjustedVolume, this.audioContext.currentTime + startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + startTime + duration);

    oscillator.start(this.audioContext.currentTime + startTime);
    oscillator.stop(this.audioContext.currentTime + startTime + duration);
  }

  play(soundType: SoundType): void {
    if (this.isMuted) return;
    
    this.initAudioContext();
    if (!this.audioContext) return;

    // Resume audio context if suspended (browser autoplay policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const config = SOUND_CONFIGS[soundType];
    
    if (config.notes && config.notes.length > 0) {
      // Play sequence of notes
      const noteDuration = config.duration / config.notes.length;
      config.notes.forEach((note, index) => {
        this.playTone(note, noteDuration * 1.5, config.type, config.volume, index * noteDuration);
      });
    } else {
      // Play single tone
      this.playTone(config.frequency, config.duration, config.type, config.volume);
    }
  }

  playAchievement(rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'): void {
    if (this.isMuted) return;
    
    this.initAudioContext();
    if (!this.audioContext) return;

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    // Different sounds based on rarity
    const rarityNotes: Record<string, number[]> = {
      common: [523.25, 659.25], // Simple two-note
      uncommon: [523.25, 659.25, 783.99], // Three notes
      rare: [523.25, 659.25, 783.99, 1046.50], // Four notes
      epic: [392.00, 523.25, 659.25, 783.99, 1046.50], // Five notes with lower start
      legendary: [261.63, 392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51], // Full fanfare
    };

    const notes = rarityNotes[rarity] || rarityNotes.common;
    const noteDuration = 0.15;
    
    notes.forEach((note, index) => {
      this.playTone(note, noteDuration * 2, 'sine', 0.25 + (index * 0.02), index * noteDuration);
    });
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('laws_sound_muted', String(muted));
    }
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (typeof window !== 'undefined') {
      localStorage.setItem('laws_sound_volume', String(this.volume));
    }
  }

  getVolume(): number {
    return this.volume;
  }

  toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }
}

// Singleton instance
export const soundManager = new SoundManager();

// React hook for sound manager
import { useState, useCallback } from 'react';

export function useSound() {
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());
  const [volume, setVolumeState] = useState(soundManager.getVolume());

  const play = useCallback((soundType: SoundType) => {
    soundManager.play(soundType);
  }, []);

  const playAchievement = useCallback((rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary') => {
    soundManager.playAchievement(rarity);
  }, []);

  const toggleMute = useCallback(() => {
    const newMuted = soundManager.toggleMute();
    setIsMuted(newMuted);
    return newMuted;
  }, []);

  const setVolume = useCallback((vol: number) => {
    soundManager.setVolume(vol);
    setVolumeState(vol);
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    soundManager.setMuted(muted);
    setIsMuted(muted);
  }, []);

  return {
    play,
    playAchievement,
    isMuted,
    volume,
    toggleMute,
    setVolume,
    setMuted,
  };
}

export type { SoundType };
