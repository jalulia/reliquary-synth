/**
 * LightningCrackle — explosive white noise bursts on a periodic downbeat.
 * Fires while Saint Barbara is extracted from her cavity.
 * Each burst is a short (30-60ms) envelope of high-pass filtered white noise,
 * hitting like artillery on the downbeat of a ~130 BPM pulse.
 */
export class LightningCrackle {
  private ctx: AudioContext;
  private masterGain: GainNode;
  private filter: BiquadFilterNode;
  private noiseBuffer: AudioBuffer;
  private intervalId: number | null = null;
  private active = false;
  private intensity = 0;

  // ~130 BPM pulse
  private readonly BEAT_MS = 460;

  constructor(ctx: AudioContext, output: AudioNode) {
    this.ctx = ctx;

    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'highpass';
    this.filter.frequency.value = 6000;
    this.filter.Q.value = 2;

    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = 0;

    this.filter.connect(this.masterGain);
    this.masterGain.connect(output);

    // Pre-generate noise buffer
    const bufferSize = ctx.sampleRate; // 1 second
    this.noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }

  setIntensity(intensity: number): void {
    this.intensity = intensity;
    if (intensity > 0 && !this.active) {
      this.start();
    } else if (intensity <= 0 && this.active) {
      this.stop();
    }
  }

  private start(): void {
    this.active = true;
    this.scheduleBurst();
    this.intervalId = window.setInterval(() => {
      if (this.active && this.intensity > 0) {
        this.scheduleBurst();
      }
    }, this.BEAT_MS);
  }

  private stop(): void {
    this.active = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.02);
  }

  private scheduleBurst(): void {
    const now = this.ctx.currentTime;
    // Random duration 30-60ms
    const duration = 0.03 + Math.random() * 0.03;

    const source = this.ctx.createBufferSource();
    source.buffer = this.noiseBuffer;

    const burstGain = this.ctx.createGain();
    // Sharp attack, quick decay
    burstGain.gain.setValueAtTime(0, now);
    burstGain.gain.linearRampToValueAtTime(this.intensity * 0.18, now + 0.003);
    burstGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    burstGain.gain.setValueAtTime(0, now + duration + 0.001);

    source.connect(burstGain);
    burstGain.connect(this.filter);
    source.start(now);
    source.stop(now + duration + 0.01);
  }

  dispose(): void {
    this.stop();
    this.masterGain.disconnect();
    this.filter.disconnect();
  }
}
