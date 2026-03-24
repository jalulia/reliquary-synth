export class MasterChain {
  input: GainNode;
  reverbSend: GainNode;
  private compressor: DynamicsCompressorNode;
  private limiter: DynamicsCompressorNode;

  constructor(ctx: AudioContext) {
    this.input = ctx.createGain();
    this.input.gain.value = 0.8;

    this.reverbSend = ctx.createGain();
    this.reverbSend.gain.value = 1;

    this.compressor = ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -24;
    this.compressor.knee.value = 12;
    this.compressor.ratio.value = 4;
    this.compressor.attack.value = 0.003;
    this.compressor.release.value = 0.25;

    this.limiter = ctx.createDynamicsCompressor();
    this.limiter.threshold.value = -3;
    this.limiter.knee.value = 0;
    this.limiter.ratio.value = 20;
    this.limiter.attack.value = 0.001;
    this.limiter.release.value = 0.1;

    // Chain: input → compressor → limiter → destination
    this.input.connect(this.compressor);
    this.compressor.connect(this.limiter);
    this.limiter.connect(ctx.destination);
  }
}
