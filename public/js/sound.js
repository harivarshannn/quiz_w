/**
 * QuizSpark Audio Synthesis Manager
 * Leveraging browser-native Web Audio API for zero-delay, zero-dependency,
 * high-fidelity game sound synthesis optimized for mobile and desktop browsers.
 */

class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.masterVolume = 0.2; // Keep it premium, pleasant, and atmospheric
  }

  // Lazy initialize AudioContext on user interaction due to browser security policies
  initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Synthesize correct answer sound: A bright, ascending major chord chime
  playCorrect() {
    if (this.muted) return;
    this.initContext();

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Bright C Major)

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      
      osc.type = 'triangle'; // Soft and clean sound
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      
      // Amplitude Envelope: Instant attack, smooth exponential decay
      gainNode.gain.setValueAtTime(0, now + idx * 0.06);
      gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.5, now + idx * 0.06 + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.4);
      
      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);
      
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.4);
    });
  }

  // Synthesize incorrect answer sound: A heavy, low-frequency detuned buzzer
  playWrong() {
    if (this.muted) return;
    this.initContext();

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';

    // Detuned frequencies for a gritty, discordant feel
    osc1.frequency.setValueAtTime(120, now);
    osc2.frequency.setValueAtTime(118.5, now);

    // Filter node to remove harsh high-frequency noise
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);

    gainNode.gain.setValueAtTime(this.masterVolume * 0.8, now);
    gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.8, now + 0.15);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  }

  // Synthesize celebratory completion sound: A beautiful, sparkling fanfare
  playCompletion() {
    if (this.muted) return;
    this.initContext();

    const now = this.ctx.currentTime;
    // Ascending arpeggio notes (C4, G4, C5, E5, G5, C6)
    const notes = [261.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      
      gainNode.gain.setValueAtTime(0, now + idx * 0.08);
      gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.4, now + idx * 0.08 + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.8);
      
      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);
      
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.8);
    });
  }

  // Set volume directly
  setVolume(vol) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
  }

  // Toggle mute state
  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }
}

// Global Sound Instance
const Sound = new SoundManager();
window.Sound = Sound; // Expose globally to debug if needed
