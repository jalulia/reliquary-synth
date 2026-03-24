import type { RelicDragState } from '../types/canvas';
import { BUZZ_RATIOS, BUZZ_THRESHOLD, BUZZ_GAIN_SMOOTH } from '../data/tuning';
import { RELIC_MAP } from '../data/relics';

export class BuzzGenerator {
  private ctx: AudioContext;
  private partials: OscillatorNode[];
  private gains: GainNode[];
  private masterGain: GainNode;

  constructor(ctx: AudioContext, output: AudioNode) {
    this.ctx = ctx;
    this.partials = [];
    this.gains = [];

    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = 1;
    this.masterGain.connect(output);

    for (let i = 0; i < BUZZ_RATIOS.length; i++) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 150 * BUZZ_RATIOS[i];

      const gain = ctx.createGain();
      gain.gain.value = 0;

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();

      this.partials.push(osc);
      this.gains.push(gain);
    }
  }

  update(dragStates: Map<string, RelicDragState>): void {
    const now = this.ctx.currentTime;

    let maxProximity = 0;
    let buzzFreqBase = 150;

    for (const state of dragStates.values()) {
      if (state.edgeProximity > maxProximity) {
        maxProximity = state.edgeProximity;
        const relic = RELIC_MAP.get(state.relicId);
        if (relic) {
          buzzFreqBase = (relic.freqMin + relic.freqMax) / 2;
        }
      }
    }

    if (maxProximity > BUZZ_THRESHOLD) {
      const intensity = (maxProximity - BUZZ_THRESHOLD) / (1 - BUZZ_THRESHOLD);
      for (let i = 0; i < this.partials.length; i++) {
        this.partials[i].frequency.setTargetAtTime(
          buzzFreqBase * BUZZ_RATIOS[i],
          now,
          0.01,
        );
        const partialGain = intensity * 0.06 * (1 - i * 0.1);
        this.gains[i].gain.setTargetAtTime(
          Math.max(partialGain, 0),
          now,
          BUZZ_GAIN_SMOOTH,
        );
      }
    } else {
      for (const g of this.gains) {
        g.gain.setTargetAtTime(0, now, BUZZ_GAIN_SMOOTH);
      }
    }
  }

  dispose(): void {
    for (const osc of this.partials) {
      try { osc.stop(); } catch { /* already stopped */ }
    }
    this.masterGain.disconnect();
  }
}
