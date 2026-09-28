/**
 * Tactile Haptic & Deep Mechanical "Thud / Thock" Audio Synthesis (Web Audio API)
 * Synthesizes deep, punchy, acoustic weighted sensations ("အသံ ထုံထုံ နဲ့ အားရစရာ ကောင်းသော အသံ")
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Generates a deep, rich, satisfying mechanical thud / tactile thock ("အသံ ထုံထုံ")
   * Blends low-frequency punch, acoustic resonance, and a subtle tactile contact pop.
   */
  public playDeepThud(baseFreq = 135, duration = 0.065, intensity = 0.28) {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // 1. Primary Low-Frequency Mechanical Hammer (Sub-bass punch)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      const lowFilter = this.ctx.createBiquadFilter();

      // Warm low-pass filter for the solid "muffled thud" texture
      lowFilter.type = 'lowpass';
      lowFilter.frequency.setValueAtTime(360, now);
      lowFilter.frequency.exponentialRampToValueAtTime(120, now + duration);
      lowFilter.Q.setValueAtTime(2.8, now);

      osc1.type = 'triangle';
      // Fast downward pitch glide that characterizes a solid physical impact
      osc1.frequency.setValueAtTime(baseFreq * 1.35, now);
      osc1.frequency.exponentialRampToValueAtTime(baseFreq * 0.45, now + duration);

      gain1.gain.setValueAtTime(intensity, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc1.connect(lowFilter);
      lowFilter.connect(gain1);
      gain1.connect(this.ctx.destination);

      osc1.start(now);
      osc1.stop(now + duration);

      // 2. Micro Tactile Contact Pop (2.5ms initial crispness)
      const oscPop = this.ctx.createOscillator();
      const gainPop = this.ctx.createGain();
      oscPop.type = 'sine';
      oscPop.frequency.setValueAtTime(750, now);
      oscPop.frequency.exponentialRampToValueAtTime(180, now + 0.009);

      gainPop.gain.setValueAtTime(intensity * 0.35, now);
      gainPop.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);

      oscPop.connect(gainPop);
      gainPop.connect(this.ctx.destination);

      oscPop.start(now);
      oscPop.stop(now + 0.012);
    } catch {
      // Audio context might be restricted before interaction
    }
  }

  /**
   * Number key tap: Satisfying weighted thud with subtle pitch nuances
   */
  public playNumberTap(digit: string) {
    this.triggerHaptic(8);
    const num = parseInt(digit, 10);
    // Base frequency tuned between 115Hz and 145Hz for warm tactile feedback
    const baseFreq = isNaN(num) ? 130 : 115 + (num % 5) * 6;
    this.playDeepThud(baseFreq, 0.065, 0.26);
  }

  /**
   * Operator key tap: Deeper, heavier tactile punch
   */
  public playOperatorTap() {
    this.triggerHaptic(14);
    this.playDeepThud(108, 0.075, 0.3);
  }

  /**
   * Equals key: Deep double-action solid thock with subtle crystalline resonance
   */
  public playEqualsChime() {
    this.triggerHaptic(22);
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      // Heavy initial impact
      this.playDeepThud(95, 0.09, 0.32);

      const now = this.ctx.currentTime;
      // Warm euphoric harmonic resolution
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + 0.02 + idx * 0.025);
        gain.gain.setValueAtTime(0.08 / (idx + 1), now + 0.02 + idx * 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02 + idx * 0.025 + 0.28);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + 0.02 + idx * 0.025);
        osc.stop(now + 0.02 + idx * 0.025 + 0.28);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Haptic vibration feedback for mobile and tablet touchscreens
   */
  public triggerHaptic(duration = 12) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(duration);
      } catch {
        // Ignore unsupported environments
      }
    }
  }

  /**
   * Clear (AC/C) key: Swift acoustic drop
   */
  public playClearSound() {
    this.triggerHaptic(20);
    this.playDeepThud(88, 0.08, 0.28);
  }

  /**
   * General glass tap for toggles and navigation
   */
  public playGlassTap(frequency = 550, duration = 0.045, intensity = 0.16) {
    this.triggerHaptic(10);
    this.playDeepThud(frequency * 0.3, duration, intensity);
  }
}

export const sound = new SoundEngine();
