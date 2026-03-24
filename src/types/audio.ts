export interface VoiceConfig {
  waveform: OscillatorType | 'noise' | 'fm';
  freqMin: number;
  freqMax: number;
  filterMax: number;
  maxGain: number;
}

export interface AudioEngineState {
  initialized: boolean;
  activeVoices: string[];
}
