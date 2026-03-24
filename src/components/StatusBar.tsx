import { useState } from 'react';
import type { RelicDragState } from '../types/canvas';
import { RELIC_MAP } from '../data/relics';
import { clamp } from '../interaction/pointer-utils';

interface Props {
  dragStates: Map<string, RelicDragState>;
  canvasHeight: number;
}

function sendToMarket(dragStates: Map<string, RelicDragState>, canvasHeight: number) {
  const activeRelics = Array.from(dragStates.values()).filter(
    (s) => s.distanceFromCavity > 0,
  );

  const beat = activeRelics.map((state) => {
    const relic = RELIC_MAP.get(state.relicId);
    if (!relic) return null;
    const normalizedY = clamp(1 - state.currentPosition.y / canvasHeight, 0, 1);
    return {
      id: relic.id,
      waveform: relic.waveform,
      freqMin: relic.freqMin,
      freqMax: relic.freqMax,
      filterMax: relic.filterMax,
      maxGain: relic.maxGain,
      pitch: normalizedY, // 0-1, maps to freq range
      distance: state.distanceFromCavity,
    };
  }).filter(Boolean);

  const payload = { voices: beat, timestamp: Date.now() };
  localStorage.setItem('holyops-beat', JSON.stringify(payload));
  return payload;
}

export function StatusBar({ dragStates, canvasHeight }: Props) {
  const [sent, setSent] = useState(false);

  const activeRelics = Array.from(dragStates.values()).filter(
    (s) => s.distanceFromCavity > 0,
  );

  const handleSend = () => {
    sendToMarket(dragStates, canvasHeight);
    setSent(true);
    setTimeout(() => setSent(false), 2000);
  };

  if (activeRelics.length === 0) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-8 flex items-center justify-center bg-abyss/60 border-t border-muted/30 backdrop-blur-sm">
        <span className="font-data text-xs text-faded tracking-widest">
          EXTRACT A RELIC TO BEGIN
        </span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-8 flex items-center gap-6 px-4 bg-abyss/60 border-t border-muted/30 backdrop-blur-sm">
      {activeRelics.map((state) => {
        const relic = RELIC_MAP.get(state.relicId);
        if (!relic) return null;

        const normalizedY = 1 - state.currentPosition.y / canvasHeight;
        const freq =
          relic.freqMin +
          clamp(normalizedY, 0, 1) * (relic.freqMax - relic.freqMin);

        return (
          <div key={state.relicId} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: relic.hex }}
            />
            <span className="font-system text-xs text-vellum">
              {relic.latinName}
            </span>
            <span className="font-data text-xs text-ink">
              {Math.round(freq)} Hz
            </span>
          </div>
        );
      })}
      <button
        onClick={handleSend}
        className="ml-auto font-data text-xs tracking-widest px-3 py-1 border transition-colors"
        style={{
          borderColor: sent ? '#3ddc84' : '#402a08',
          color: sent ? '#3ddc84' : '#d4a828',
          background: 'transparent',
        }}
      >
        {sent ? 'SENT ✓' : 'SEND TO MARKET'}
      </button>
    </div>
  );
}
