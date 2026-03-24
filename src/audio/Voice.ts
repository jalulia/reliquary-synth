import type { RelicConfig } from '../types/synth';
import type { RelicDragState } from '../types/canvas';
import { FREQ_SMOOTH, PAN_SMOOTH, GAIN_SMOOTH, FILTER_SMOOTH, MAX_EXTRACTION_DISTANCE } from '../data/tuning';
import { clamp } from '../interaction/pointer-utils';

export class Voice {
  private ctx: AudioContext;
  private config: RelicConfig;
  private osc: OscillatorNode | null = null;
  private modOsc: OscillatorNode | null = null; // for FM synthesis
  private modGain: GainNode | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  private distortion: WaveShaperNode | null = null; // for acid synthesis
  private filter: BiquadFilterNode;
  private gain: GainNode;
  private panner: StereoPannerNode;
  private reverbSend: GainNode;
  private active = false;
  private canvasWidth = 800;
  private canvasHeight = 600;

  constructor(
    ctx: AudioContext,
    config: RelicConfig,
    masterInput: AudioNode,
    reverbInput: AudioNode,
  ) {
    this.ctx = ctx;
    this.config = config;

    this.filter = ctx.createBiquadFilter();
    this.filter.type = config.waveform === 'noise' ? 'bandpass' : 'lowpass';
    this.filter.frequency.value = 200;
    this.filter.Q.value = config.waveform === 'noise' ? 4 : config.waveform === 'acid' ? 12 : 1;

    this.gain = ctx.createGain();
    this.gain.gain.value = 0;

    this.panner = ctx.createStereoPanner();

    this.reverbSend = ctx.createGain();
    this.reverbSend.gain.value = 0.4;

    // Chain: [source] → filter → gain → panner → master
    this.filter.connect(this.gain);
    this.gain.connect(this.panner);
    this.panner.connect(masterInput);
    this.gain.connect(this.reverbSend);
    this.reverbSend.connect(reverbInput);
  }

  setCanvasSize(w: number, h: number) {
    this.canvasWidth = w;
    this.canvasHeight = h;
  }

  activate(state: RelicDragState): void {
    const now = this.ctx.currentTime;

    if (!this.active) {
      this.startSource();
      this.active = true;
    }

    // Y-axis → pitch (higher on screen = higher pitch, inverted because canvas Y goes down)
    const normalizedY = 1 - state.currentPosition.y / this.canvasHeight;
    const freq =
      this.config.freqMin +
      clamp(normalizedY, 0, 1) * (this.config.freqMax - this.config.freqMin);

    if (this.osc) {
      this.osc.frequency.setTargetAtTime(freq, now, FREQ_SMOOTH);
    }
    if (this.modOsc && this.modGain) {
      // FM: modulator at carrier * 1.4 ratio
      this.modOsc.frequency.setTargetAtTime(freq * 1.4, now, FREQ_SMOOTH);
      // Modulation index increases with distance
      const modIndex = clamp(state.distanceFromCavity / MAX_EXTRACTION_DISTANCE, 0, 1) * freq * 2;
      this.modGain.gain.setTargetAtTime(modIndex, now, FREQ_SMOOTH);
    }

    // Filter frequency for noise voice maps to Y
    if (this.config.waveform === 'noise') {
      this.filter.frequency.setTargetAtTime(freq, now, FILTER_SMOOTH);
    }

    // X-axis → panning
    const normalizedX = clamp(
      (state.currentPosition.x / this.canvasWidth) * 2 - 1,
      -1,
      1,
    );
    this.panner.pan.setTargetAtTime(normalizedX, now, PAN_SMOOTH);

    // Distance → volume + filter cutoff
    const distNorm = clamp(state.distanceFromCavity / MAX_EXTRACTION_DISTANCE, 0, 1);
    const targetGain = distNorm * this.config.maxGain;
    this.gain.gain.setTargetAtTime(targetGain, now, GAIN_SMOOTH);

    if (this.config.waveform !== 'noise') {
      const filterFreq = 200 + distNorm * (this.config.filterMax - 200);
      this.filter.frequency.setTargetAtTime(filterFreq, now, FILTER_SMOOTH);
    }
  }

  deactivate(): void {
    if (!this.active) return;
    const now = this.ctx.currentTime;
    this.gain.gain.setTargetAtTime(0, now, 0.1);

    // Schedule source stop after fadeout
    setTimeout(() => {
      this.stopSource();
      this.active = false;
    }, 500);
  }

  private startSource(): void {
    if (this.config.waveform === 'noise') {
      this.startNoise();
    } else if (this.config.waveform === 'fm') {
      this.startFM();
    } else if (this.config.waveform === 'acid') {
      this.startAcid();
    } else {
      this.startOscillator();
    }
  }

  private startOscillator(): void {
    this.osc = this.ctx.createOscillator();
    this.osc.type = this.config.waveform as OscillatorType;
    this.osc.frequency.value = this.config.freqMin;
    this.osc.connect(this.filter);
    this.osc.start();
  }

  private startFM(): void {
    // Carrier
    this.osc = this.ctx.createOscillator();
    this.osc.type = 'sine';
    this.osc.frequency.value = this.config.freqMin;
    this.osc.connect(this.filter);
    this.osc.start();

    // Modulator
    this.modOsc = this.ctx.createOscillator();
    this.modOsc.type = 'sine';
    this.modOsc.frequency.value = this.config.freqMin * 1.4;

    this.modGain = this.ctx.createGain();
    this.modGain.gain.value = 0;

    this.modOsc.connect(this.modGain);
    this.modGain.connect(this.osc.frequency);
    this.modOsc.start();
  }

  private startAcid(): void {
    // Acid: sawtooth → waveshaper distortion → high-Q resonant filter
    this.osc = this.ctx.createOscillator();
    this.osc.type = 'sawtooth';
    this.osc.frequency.value = this.config.freqMin;

    // Waveshaper for overdrive/distortion
    this.distortion = this.ctx.createWaveShaper();
    const curve = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) {
      const x = (i * 2) / 1023 - 1;
      // Aggressive tanh-style clipping
      curve[i] = Math.tanh(x * 3.5);
    }
    this.distortion.curve = curve;
    this.distortion.oversample = '4x';

    this.osc.connect(this.distortion);
    this.distortion.connect(this.filter);
    this.osc.start();
  }

  private startNoise(): void {
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseSource = this.ctx.createBufferSource();
    this.noiseSource.buffer = buffer;
    this.noiseSource.loop = true;
    this.noiseSource.connect(this.filter);
    this.noiseSource.start();
  }

  private stopSource(): void {
    try {
      this.osc?.stop();
    } catch { /* already stopped */ }
    try {
      this.modOsc?.stop();
    } catch { /* already stopped */ }
    try {
      this.noiseSource?.stop();
    } catch { /* already stopped */ }
    this.osc = null;
    this.modOsc = null;
    this.modGain = null;
    this.noiseSource = null;
    try {
      this.distortion?.disconnect();
    } catch { /* already disconnected */ }
    this.distortion = null;
  }

  dispose(): void {
    this.stopSource();
    this.filter.disconnect();
    this.gain.disconnect();
    this.panner.disconnect();
    this.reverbSend.disconnect();
    try {
      this.distortion?.disconnect();
    } catch { /* already disconnected */ }
  }

  /** Expose the oscillator frequency for external pitch quantization */
  getOscillator(): OscillatorNode | null {
    return this.osc;
  }

  isActive(): boolean {
    return this.active;
  }

  getConfig(): RelicConfig {
    return this.config;
  }
}
