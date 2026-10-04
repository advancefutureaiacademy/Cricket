/**
 * Cricket Hit Master - Web Audio API Synthesizer
 * No external audio files needed; 100% synthesized, lightweight, instant playback.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled = true;
  private crowdEnabled = true;
  private crowdGainNode: GainNode | null = null;
  private crowdSourceNode: AudioBufferSourceNode | null = null;

  constructor() {
    // Initialized on first user gesture
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public setCrowdEnabled(enabled: boolean) {
    this.crowdEnabled = enabled;
    if (!enabled && this.crowdGainNode && this.ctx) {
      this.crowdGainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }

  // Crisp wooden bat crack
  public playBatHit(quality: 'PERFECT' | 'EXCELLENT' | 'GOOD' | 'EARLY' | 'LATE') {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 1. High frequency wood click
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'triangle';
    const startFreq = quality === 'PERFECT' ? 1200 : quality === 'EXCELLENT' ? 1000 : 800;
    osc1.frequency.setValueAtTime(startFreq, t);
    osc1.frequency.exponentialRampToValueAtTime(140, t + 0.08);

    gain1.gain.setValueAtTime(quality === 'PERFECT' ? 0.9 : 0.6, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.12);

    // 2. Resonant willow body impact
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(260, t);
    osc2.frequency.exponentialRampToValueAtTime(70, t + 0.18);

    gain2.gain.setValueAtTime(0.7, t);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(t);
    osc2.stop(t + 0.2);

    // Short burst of white noise for the leather friction
    this.playNoiseBurst(0.04, 0.4, 2500);
  }

  // Wicket crashing: wood timbers and bails clattering
  public playWicket() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Deep wood crash
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.35);

    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.4);

    // High wood splinter / bail clatter
    this.playNoiseBurst(0.25, 0.6, 1200);

    setTimeout(() => {
      this.playTone(520, 0.08, 'sine', 0.3);
      this.playTone(380, 0.12, 'sine', 0.25);
    }, 80);
  }

  // Six roar & energetic fanfare
  public playSix() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    // Crowd surge noise
    this.playCrowdCheer(1.6, 0.6);

    // Triumphant chord fanfare
    const notes = [440, 554.37, 659.25, 880]; // A major
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.35, 'triangle', 0.25);
      }, idx * 60);
    });
  }

  // Four boundary sound
  public playFour() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    this.playCrowdCheer(1.0, 0.4);

    // Uptempo 3-note jingle
    const notes = [523.25, 659.25, 783.99]; // C - E - G
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.22, 'triangle', 0.2);
      }, idx * 75);
    });
  }

  // Dot ball thud
  public playDot() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.14);
  }

  // Button click blip
  public playClick() {
    if (!this.soundEnabled) return;
    this.initContext();
    this.playTone(600, 0.04, 'sine', 0.15);
  }

  // Coin pickup chime
  public playCoin() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, t); // B5
    osc.frequency.setValueAtTime(1318.51, t + 0.06); // E6

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  // Combo multiplier sound
  public playCombo(level: number) {
    if (!this.soundEnabled) return;
    this.initContext();
    const baseFreq = 440 + level * 110;
    this.playTone(baseFreq, 0.15, 'sawtooth', 0.2);
    setTimeout(() => {
      this.playTone(baseFreq * 1.5, 0.25, 'triangle', 0.25);
    }, 80);
  }

  // Powerup activated
  public playPowerUp() {
    if (!this.soundEnabled) return;
    this.initContext();
    const notes = [330, 440, 550, 660, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.12, 'sine', 0.22);
      }, idx * 45);
    });
  }

  // Helper: Play a synthesized tone
  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.2) {
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + duration);
    } catch {
      // Audio node failure fallback
    }
  }

  // Helper: Noise burst for ball leather or splinter
  private playNoiseBurst(duration: number, volume: number, filterFreq: number) {
    if (!this.ctx) return;
    try {
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = filterFreq;
      filter.Q.value = 1.8;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
    } catch {
      // Audio buffer failure fallback
    }
  }

  // Helper: Crowd cheering synthesized through filtered noise
  private playCrowdCheer(duration = 1.2, volume = 0.4) {
    if (!this.crowdEnabled || !this.ctx) return;
    try {
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Pink-ish noise filter
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.5;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(1400, this.ctx.currentTime + duration * 0.4);
      filter.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + duration);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + duration * 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
    } catch {
      // Audio buffer failure fallback
    }
  }
}

export const soundEngine = new SoundEngine();
