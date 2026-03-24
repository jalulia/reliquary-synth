export type BodyRegion =
  | 'chest'
  | 'throat'
  | 'forehead'
  | 'left-arm'
  | 'right-hand'
  | 'gut'
  | 'left-leg'
  | 'right-eye'
  | 'right-leg';

export type WaveformType = 'sine' | 'sawtooth' | 'triangle' | 'square' | 'noise' | 'fm' | 'acid';

export interface RelicConfig {
  id: string;
  name: string;
  latinName: string;
  region: BodyRegion;
  hex: string;
  hexDim: string;
  waveform: WaveformType;
  freqMin: number;
  freqMax: number;
  filterMax: number;
  maxGain: number;
}
