import type { LungSoundId, PercussionTone } from '../data/respiratoryData';

class RespiAudioEngine {
  private ctx: AudioContext | null = null;
  private muted = false;
  private lungActive = false;
  private lungLoopTimer: number | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private currentSoundId: LungSoundId | null = null;
  private phaseCallback: ((phase: 'inspirasi' | 'ekspirasi' | 'jeda', progress: number) => void) | null = null;
  private phaseRafId: number | null = null;
  private cycleStartTime = 0;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : 0.85;
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
      this.noiseBuffer = this.createPinkNoiseBuffer(this.ctx, 4);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private createPinkNoiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
    const bufferSize = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  public setMuted(mute: boolean) {
    this.muted = mute;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(mute ? 0 : 0.85, this.ctx.currentTime, 0.04);
    }
    if (mute) {
      this.stopLungSound();
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public playClick() {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.055);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.07);
  }

  public playOrganSelect() {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;
    const now = ctx.currentTime;
    [440, 660].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.045);
      gain.gain.setValueAtTime(0.12, now + idx * 0.045);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.045 + 0.14);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now + idx * 0.045);
      osc.stop(now + idx * 0.045 + 0.15);
    });
  }

  public playCorrect() {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.075);
      gain.gain.setValueAtTime(0.16, now + idx * 0.075);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.075 + 0.25);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now + idx * 0.075);
      osc.stop(now + idx * 0.075 + 0.26);
    });
  }

  public playWrong() {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(160, now + 0.18);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.24);
  }

  public playPercussionSound(tone: PercussionTone) {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';

    if (tone === 'sonor') {
      // Resonant healthy lung tap (~130Hz -> 85Hz, 190ms)
      osc.frequency.setValueAtTime(145, now);
      osc.frequency.exponentialRampToValueAtTime(82, now + 0.18);
      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (tone === 'hipersonor') {
      // Booming drum-like pneumothorax (~185Hz -> 95Hz, longer decay 340ms)
      osc.frequency.setValueAtTime(195, now);
      osc.frequency.exponentialRampToValueAtTime(98, now + 0.34);
      gain.gain.setValueAtTime(0.55, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.38);
    } else {
      // Redup / Pekak: short muted high-damped thud (~260Hz -> 140Hz, 75ms)
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(130, now + 0.07);
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.09);
    }
  }

  public startLungSound(
    soundId: LungSoundId,
    onPhase?: (phase: 'inspirasi' | 'ekspirasi' | 'jeda', progress: number) => void
  ) {
    this.stopLungSound();
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || !this.noiseBuffer) return;

    this.lungActive = true;
    this.currentSoundId = soundId;
    this.phaseCallback = onPhase ?? null;

    const cycleMs = 3600;

    const scheduleCycle = () => {
      if (!this.lungActive || !this.ctx || !this.masterGain || !this.noiseBuffer) return;
      const now = this.ctx.currentTime;
      this.cycleStartTime = performance.now();

      if (soundId === 'vesicular') {
        // Inspiration 1.5s soft lowpass, Expiration 0.55s faint
        this.triggerNoiseBreath(now, 1.5, 280, 0.8, 0.36);
        this.triggerNoiseBreath(now + 1.58, 0.65, 220, 0.8, 0.14);
      } else if (soundId === 'bronchovesicular') {
        // Equal Inspiration 1.25s & Expiration 1.25s medium pitch
        this.triggerNoiseBreath(now, 1.25, 420, 1.4, 0.34);
        this.triggerNoiseBreath(now + 1.38, 1.25, 390, 1.4, 0.30);
      } else if (soundId === 'tracheal') {
        // Harsh hollow: Insp 0.9s, clear gap 0.25s, Exp 1.35s louder
        this.triggerNoiseBreath(now, 0.9, 680, 2.2, 0.32);
        this.triggerNoiseBreath(now + 1.22, 1.35, 620, 2.4, 0.38);
      } else if (soundId === 'wheezing') {
        // Soft insp + prominent polyphonic expiratory musical whistles
        this.triggerNoiseBreath(now, 1.0, 320, 1.0, 0.22);
        this.triggerWheeze(now + 1.15, 1.75);
      } else if (soundId === 'crackles') {
        // Normal insp + burst of short fine clicks during second half of inspiration
        this.triggerNoiseBreath(now, 1.45, 300, 0.9, 0.26);
        this.triggerCracklesBurst(now + 0.65, 0.85, 11);
        this.triggerNoiseBreath(now + 1.65, 0.75, 230, 0.8, 0.12);
      } else if (soundId === 'rhonchi') {
        // Low rumbling rattling during both phases
        this.triggerRhonchi(now, 1.2, 130);
        this.triggerRhonchi(now + 1.38, 1.35, 110);
      } else if (soundId === 'stridor') {
        // High-pitched loud inspiratory crowing
        this.triggerStridor(now, 1.35);
        this.triggerNoiseBreath(now + 1.55, 0.9, 320, 1.2, 0.15);
      }
    };

    scheduleCycle();
    this.lungLoopTimer = window.setInterval(scheduleCycle, cycleMs);

    const updatePhase = () => {
      if (!this.lungActive) return;
      const elapsed = (performance.now() - this.cycleStartTime) % cycleMs;
      const ratio = elapsed / cycleMs;
      if (this.phaseCallback) {
        if (ratio < 0.42) {
          this.phaseCallback('inspirasi', ratio / 0.42);
        } else if (ratio < 0.84) {
          this.phaseCallback('ekspirasi', (ratio - 0.42) / 0.42);
        } else {
          this.phaseCallback('jeda', (ratio - 0.84) / 0.16);
        }
      }
      this.phaseRafId = requestAnimationFrame(updatePhase);
    };
    this.phaseRafId = requestAnimationFrame(updatePhase);
  }

  private triggerNoiseBreath(
    startTime: number,
    duration: number,
    freq: number,
    q: number,
    peakGain: number
  ) {
    if (!this.ctx || !this.masterGain || !this.noiseBuffer) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq, startTime);
    filter.Q.setValueAtTime(q, startTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + duration * 0.28);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    src.start(startTime);
    src.stop(startTime + duration + 0.04);
  }

  private triggerWheeze(startTime: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;
    this.triggerNoiseBreath(startTime, duration, 480, 1.5, 0.18);

    const freqs = [440, 585, 740];
    freqs.forEach((f, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, startTime);
      osc.frequency.linearRampToValueAtTime(f * 0.92, startTime + duration);

      const amp = idx === 0 ? 0.08 : idx === 1 ? 0.055 : 0.035;
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(amp, startTime + 0.18);
      gain.gain.setValueAtTime(amp * 0.9, startTime + duration * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(startTime);
      osc.stop(startTime + duration + 0.03);
    });
  }

  private triggerCracklesBurst(startTime: number, span: number, count: number) {
    if (!this.ctx || !this.masterGain || !this.noiseBuffer) return;
    for (let i = 0; i < count; i++) {
      const offset = (i / count) * span + Math.random() * 0.04;
      const t = startTime + offset;
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1400 + Math.random() * 1200, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.32 + Math.random() * 0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.022);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      src.start(t);
      src.stop(t + 0.03);
    }
  }

  private triggerRhonchi(startTime: number, duration: number, baseFreq: number) {
    if (!this.ctx || !this.masterGain) return;
    this.triggerNoiseBreath(startTime, duration, 220, 2.0, 0.28);

    const osc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(baseFreq, startTime);

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(22, startTime);
    lfoGain.gain.setValueAtTime(32, startTime);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(340, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.11, startTime + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    lfo.start(startTime);
    osc.stop(startTime + duration + 0.03);
    lfo.stop(startTime + duration + 0.03);
  }

  private triggerStridor(startTime: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;
    this.triggerNoiseBreath(startTime, duration, 900, 3.0, 0.25);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(520, startTime);
    osc.frequency.linearRampToValueAtTime(610, startTime + duration * 0.5);
    osc.frequency.linearRampToValueAtTime(490, startTime + duration);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(860, startTime);
    filter.Q.setValueAtTime(3.2, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.13, startTime + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.03);
  }

  public stopLungSound() {
    this.lungActive = false;
    this.currentSoundId = null;
    if (this.lungLoopTimer !== null) {
      clearInterval(this.lungLoopTimer);
      this.lungLoopTimer = null;
    }
    if (this.phaseRafId !== null) {
      cancelAnimationFrame(this.phaseRafId);
      this.phaseRafId = null;
    }
    this.phaseCallback = null;
  }

  public getCurrentSoundId(): LungSoundId | null {
    return this.lungActive ? this.currentSoundId : null;
  }
}

export const respiAudio = new RespiAudioEngine();
