import { useRef, useEffect, useCallback } from 'react';
import type { CavityGeometry, RelicDragState, SnapBackState } from '../types/canvas';
import { useCanvasResize } from '../hooks/useCanvasResize';
import { renderFrame } from './renderer';

interface Props {
  cavities: CavityGeometry[];
  dragStates: Map<string, RelicDragState>;
  snapBacks: Map<string, SnapBackState>;
  onPointerDown: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLCanvasElement>) => void;
}

export function ReliquaryCanvas({
  cavities,
  dragStates,
  snapBacks,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { width, height, dpr } = useCanvasResize(containerRef);

  // Expose canvas ref for hit testing
  const getCanvas = useCallback(() => canvasRef.current, []);

  // Set canvas dimensions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }, [width, height, dpr]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;

    const draw = (time: number) => {
      ctx.save();
      ctx.scale(dpr, dpr);
      renderFrame(ctx, width, height, cavities, dragStates, snapBacks, time);
      ctx.restore();
      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [width, height, dpr, cavities, dragStates, snapBacks]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full riso-grain"
      data-canvas-getter={getCanvas}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        style={{ touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
    </div>
  );
}
