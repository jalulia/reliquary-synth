import type { RelicDragState } from '../types/canvas';
import { RELICS } from '../data/relics';
import { HIJAZ_RATIOS, FREQ_SMOOTH } from '../data/tuning';
import { MasterChain } from './MasterChain';
import { CathedralReverb } from './CathedralReverb';
import { Voice } from './Voice';
import { BuzzGenerator } from './BuzzGenerator';
import { AmbientDrone } from './AmbientDrone';
import { LightningCrackle } from './LightningCrackle';
import { clamp } from '../interaction/pointer-utils';

const BARBARA_ID = 'turris-barbarae';

/** Quantize a frequency to the nearest Hijaz scale tone */
function quantizeToHijaz(freq: number): number {
  // Find the octave and position within it
  const baseFreq = 55; // A1 as reference
  const ratio = freq / baseFreq;
  const octave = Math.floor(Math.log2(ratio));
  const withinOctave = ratio / Math.pow(2, octave);

  // Find the closest Hijaz ratio
  let closest = HIJAZ_RATIOS[0];
  let minDist = Infinity;
  for (const r of HIJAZ_RATIOS) {
    const dist = Math.abs(withinOctave - r);
    if (dist < minDist) {
      minDist = dist;
      closest = r;
    }
  }
  // Also check next octave root
  const distToNext = Math.abs(withinOctave - 2.0);
  if (distToNext < minDist) {
    closest = 2.0;
  }

  return baseFreq * Math.pow(2, octave) * closest;
}

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: MasterChain | null = null;
  private reverb: CathedralReverb | null = null;
  private voices: Map<string, Voice> = new Map();
  private buzz: BuzzGenerator | null = null;
  private drone: AmbientDrone | null = null;
  private lightning: LightningCrackle | null = null;
  private initialized = false;
  private activeVoiceIds: Set<string> = new Set();

  async init(): Promise<void> {
    if (this.initialized) return;

    this.ctx = new AudioContext();

    // Build the signal chain
    this.master = new MasterChain(this.ctx);
    this.reverb = new CathedralReverb(this.ctx);
    this.reverb.output.connect(this.master.input);

    // Create a voice for each relic
    for (const relic of RELICS) {
      const voice = new Voice(
        this.ctx,
        relic,
        this.master.input,
        this.reverb.input,
      );
      this.voices.set(relic.id, voice);
    }

    // Buzz generator
    this.buzz = new BuzzGenerator(this.ctx, this.master.input);

    // Ambient drone
    this.drone = new AmbientDrone(this.ctx, this.master.input);

    // Lightning crackle (Barbara's artillery)
    this.lightning = new LightningCrackle(this.ctx, this.master.input);

    this.initialized = true;
  }

  setCanvasSize(w: number, h: number): void {
    for (const voice of this.voices.values()) {
      voice.setCanvasSize(w, h);
    }
  }

  update(dragStates: Map<string, RelicDragState>): void {
    if (!this.initialized || !this.ctx) return;

    // Resume audio context if suspended
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    // Update each voice based on drag state
    const currentActive = new Set<string>();

    for (const [relicId, state] of dragStates) {
      const voice = this.voices.get(relicId);
      if (!voice) continue;

      if (state.distanceFromCavity > 0 || state.edgeProximity > 0) {
        voice.activate(state);
        currentActive.add(relicId);
      }
    }

    // Deactivate voices that are no longer being dragged
    for (const id of this.activeVoiceIds) {
      if (!currentActive.has(id)) {
        const voice = this.voices.get(id);
        voice?.deactivate();
      }
    }

    this.activeVoiceIds = currentActive;

    // Barbara's grid effect: Hijaz pitch quantization on adjacent voices
    const barbaraState = dragStates.get(BARBARA_ID);
    const barbaraActive = currentActive.has(BARBARA_ID);
    if (barbaraActive && barbaraState && this.ctx) {
      const barbaraIntensity = clamp(
        barbaraState.distanceFromCavity / 300,
        0,
        1,
      );
      // Quantize other active voices to Hijaz scale
      for (const id of currentActive) {
        if (id === BARBARA_ID) continue;
        const voice = this.voices.get(id);
        const osc = voice?.getOscillator();
        if (osc) {
          const currentFreq = osc.frequency.value;
          const quantized = quantizeToHijaz(currentFreq);
          // Blend between natural and quantized based on Barbara's extraction
          const blended =
            currentFreq + (quantized - currentFreq) * barbaraIntensity;
          osc.frequency.setTargetAtTime(
            blended,
            this.ctx.currentTime,
            FREQ_SMOOTH,
          );
        }
      }
      // Lightning crackle intensity
      this.lightning?.setIntensity(barbaraIntensity);
    } else {
      this.lightning?.setIntensity(0);
    }

    // Update buzz
    this.buzz?.update(dragStates);

    // Update drone
    this.drone?.update(currentActive.size);
  }

  suspend(): void {
    this.ctx?.suspend();
  }

  resume(): void {
    this.ctx?.resume();
  }

  dispose(): void {
    for (const voice of this.voices.values()) {
      voice.dispose();
    }
    this.buzz?.dispose();
    this.drone?.dispose();
    this.lightning?.dispose();
    this.ctx?.close();
    this.initialized = false;
  }
}
