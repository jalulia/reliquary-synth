import {
  DRONE_BASE_FREQ,
  DRONE_DETUNE_SPREAD,
  DRONE_MIN_GAIN,
  DRONE_MAX_GAIN,
} from '../data/tuning';

export class AmbientDrone {
  private ctx: AudioContext;
  private oscs: OscillatorNode[];
  private gain: GainNode;
  private filter: BiquadFilterNode;

  constructor(ctx: AudioContext, output: AudioNode) {
    this.ctx = ctx;
    this.oscs = [];

    this.gain = ctx.createGain();
    this.gain.gain.value = DRONE_MIN_GAIN;

    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 200;
    this.filter.Q.value = 0.5;

    // 3 detuned sine oscillators
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = DRONE_BASE_FREQ;
      osc.detune.value = (i - 1) * DRONE_DETUNE_SPREAD;
      osc.connect(this.filter);
      osc.start();
      this.oscs.push(osc);
    }

    this.filter.connect(this.gain);
    this.gain.connect(output);
  }

  update(extractedCount: number): void {
    const now = this.ctx.currentTime;
    const t = Math.min(extractedCount / 6, 1);

    // Gain swells with extraction count
    const targetGain = DRONE_MIN_GAIN + t * (DRONE_MAX_GAIN - DRONE_MIN_GAIN);
    this.gain.gain.setTargetAtTime(targetGain, now, 0.5);

    // Filter opens with more extractions
    const filterFreq = 200 + t * 600;
    this.filter.frequency.setTargetAtTime(filterFreq, now, 0.3);

    // Detune increases (more "anxious")
    for (let i = 0; i < this.oscs.length; i++) {
      const detune = (i - 1) * (DRONE_DETUNE_SPREAD + extractedCount * 2);
      this.oscs[i].detune.setTargetAtTime(detune, now, 0.3);
    }
  }

  dispose(): void {
    for (const osc of this.oscs) {
      try { osc.stop(); } catch { /* already stopped */ }
    }
    this.gain.disconnect();
    this.filter.disconnect();
  }
}
