import {
  REVERB_COMB_DELAYS,
  REVERB_COMB_FEEDBACK,
  REVERB_ALLPASS_DELAYS,
  REVERB_ALLPASS_FEEDBACK,
  REVERB_WET,
  REVERB_DRY,
} from '../data/tuning';

// Algorithmic Freeverb-style reverb using delay lines.
// No impulse response samples needed.
export class CathedralReverb {
  input: GainNode;
  output: GainNode;

  constructor(ctx: AudioContext) {
    this.input = ctx.createGain();
    this.output = ctx.createGain();

    const wetGain = ctx.createGain();
    wetGain.gain.value = REVERB_WET;

    const dryGain = ctx.createGain();
    dryGain.gain.value = REVERB_DRY;

    // Dry path
    this.input.connect(dryGain);
    dryGain.connect(this.output);

    // Wet path: parallel comb filters → series allpass filters
    const combSum = ctx.createGain();
    combSum.gain.value = 1 / REVERB_COMB_DELAYS.length;

    for (const delayTime of REVERB_COMB_DELAYS) {
      const comb = createCombFilter(ctx, delayTime, REVERB_COMB_FEEDBACK);
      this.input.connect(comb.input);
      comb.output.connect(combSum);
    }

    // Chain allpass filters in series
    let currentNode: AudioNode = combSum;
    for (const delayTime of REVERB_ALLPASS_DELAYS) {
      const allpass = createAllpassFilter(ctx, delayTime, REVERB_ALLPASS_FEEDBACK);
      currentNode.connect(allpass.input);
      currentNode = allpass.output;
    }

    currentNode.connect(wetGain);
    wetGain.connect(this.output);
  }
}

interface FilterNode {
  input: GainNode;
  output: GainNode;
}

function createCombFilter(
  ctx: AudioContext,
  delayTime: number,
  feedback: number,
): FilterNode {
  const input = ctx.createGain();
  const output = ctx.createGain();
  const delay = ctx.createDelay(delayTime + 0.01);
  delay.delayTime.value = delayTime;
  const feedbackGain = ctx.createGain();
  feedbackGain.gain.value = feedback;

  // Lowpass in feedback loop for more natural decay
  const lpf = ctx.createBiquadFilter();
  lpf.type = 'lowpass';
  lpf.frequency.value = 4500;

  // input → delay → output
  // delay → lpf → feedback → delay (feedback loop)
  input.connect(delay);
  delay.connect(output);
  delay.connect(lpf);
  lpf.connect(feedbackGain);
  feedbackGain.connect(delay);

  return { input, output };
}

function createAllpassFilter(
  ctx: AudioContext,
  delayTime: number,
  feedback: number,
): FilterNode {
  const input = ctx.createGain();
  const output = ctx.createGain();
  const delay = ctx.createDelay(delayTime + 0.01);
  delay.delayTime.value = delayTime;
  const feedbackGain = ctx.createGain();
  feedbackGain.gain.value = feedback;
  const feedforwardGain = ctx.createGain();
  feedforwardGain.gain.value = -feedback;

  // Allpass: input → delay → output + feedback loop
  // input → feedforward → output (direct path with -g)
  // delay → feedback → input (feedback path with +g)
  input.connect(delay);
  input.connect(feedforwardGain);
  feedforwardGain.connect(output);
  delay.connect(output);
  delay.connect(feedbackGain);
  feedbackGain.connect(delay);

  return { input, output };
}
