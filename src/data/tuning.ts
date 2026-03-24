// Buzz: inharmonic partial ratios for edge-proximity dissonance
export const BUZZ_RATIOS = [1.0, 1.059, 1.414, 1.618, 2.059, 2.718];

// Proximity thresholds
export const BUZZ_THRESHOLD = 0.3;   // edge proximity where buzz begins
export const BUZZ_FULL = 0.9;        // edge proximity for full buzz

// Drone
export const DRONE_BASE_FREQ = 55;   // Hz
export const DRONE_DETUNE_SPREAD = 3; // cents per oscillator per extracted relic
export const DRONE_MIN_GAIN = 0.02;
export const DRONE_MAX_GAIN = 0.15;

// Reverb (algorithmic Freeverb)
export const REVERB_COMB_DELAYS = [0.030, 0.033, 0.037, 0.041, 0.043, 0.047, 0.051, 0.053];
export const REVERB_COMB_FEEDBACK = 0.84;
export const REVERB_ALLPASS_DELAYS = [0.005, 0.0073, 0.011, 0.0137];
export const REVERB_ALLPASS_FEEDBACK = 0.5;
export const REVERB_WET = 0.35;
export const REVERB_DRY = 0.65;

// Interaction physics
export const SPRING_FACTOR = 0.15;    // lerp factor per frame
export const WOBBLE_AMPLITUDE = 5;    // degrees
export const WOBBLE_DECAY_RATE = 0.92;
export const SNAP_BACK_DURATION = 400; // ms

// Audio smoothing (setTargetAtTime time constants)
export const FREQ_SMOOTH = 0.02;
export const PAN_SMOOTH = 0.02;
export const GAIN_SMOOTH = 0.05;
export const FILTER_SMOOTH = 0.03;
export const BUZZ_GAIN_SMOOTH = 0.02;

// Distance mapping
export const MAX_EXTRACTION_DISTANCE = 300; // pixels — full volume at this distance

// Hijaz maqam scale — semitone intervals from root
// 0, 1, 4, 5, 7, 8, 11 (classic Hijaz)
// Frequency ratios from equal temperament
export const HIJAZ_RATIOS = [
  1.0,          // 0 semitones (root)
  1.05946,      // 1 semitone  (minor 2nd)
  1.25992,      // 4 semitones (major 3rd)
  1.33484,      // 5 semitones (perfect 4th)
  1.49831,      // 7 semitones (perfect 5th)
  1.58740,      // 8 semitones (minor 6th)
  1.88775,      // 11 semitones (major 7th)
];
