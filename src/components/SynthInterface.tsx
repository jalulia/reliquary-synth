import { useState, useRef, useCallback, useEffect } from 'react';
import { CAVITIES } from '../data/body';
import { ReliquaryCanvas } from '../canvas/ReliquaryCanvas';
import { AudioUnlockOverlay } from './AudioUnlockOverlay';
import { StatusBar } from './StatusBar';
import { useRelicInteraction } from '../interaction/useRelicInteraction';
import { useAnimationLoop } from '../hooks/useAnimationLoop';
import { AudioEngine } from '../audio/AudioEngine';

export function SynthInterface() {
  const [unlocked, setUnlocked] = useState(false);
  const audioRef = useRef<AudioEngine | null>(null);
  const [canvasHeight, setCanvasHeight] = useState(600);

  const {
    dragStates,
    snapBacks,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    updatePhysics,
    updateSize,
  } = useRelicInteraction(CAVITIES);

  const handleUnlock = useCallback(async () => {
    const engine = new AudioEngine();
    await engine.init();
    audioRef.current = engine;
    setUnlocked(true);
  }, []);

  // Track container size for audio engine
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        updateSize(Math.floor(width), Math.floor(height));
        setCanvasHeight(Math.floor(height));
        audioRef.current?.setCanvasSize(Math.floor(width), Math.floor(height));
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [updateSize]);

  // Animation loop — updates interaction physics and audio engine every frame
  useAnimationLoop(
    useCallback(
      (time: number, dt: number) => {
        updatePhysics(time, dt);
        audioRef.current?.update(dragStates);
      },
      [updatePhysics, dragStates],
    ),
  );

  // Suspend audio on page hide
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        audioRef.current?.suspend();
      } else {
        audioRef.current?.resume();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      audioRef.current?.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 bg-void">
      {!unlocked && <AudioUnlockOverlay onUnlock={handleUnlock} />}

      {unlocked && (
        <>
          {/* Title */}
          <div className="fixed top-0 left-0 right-0 h-10 flex items-center justify-center z-10 pointer-events-none">
            <h1 className="font-display text-gilt-dim text-lg tracking-wide">
              Reliquary Synth
            </h1>
          </div>

          {/* Canvas */}
          <ReliquaryCanvas
            cavities={CAVITIES}
            dragStates={dragStates}
            snapBacks={snapBacks}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          />

          {/* Status bar */}
          <StatusBar dragStates={dragStates} canvasHeight={canvasHeight} />
        </>
      )}
    </div>
  );
}
