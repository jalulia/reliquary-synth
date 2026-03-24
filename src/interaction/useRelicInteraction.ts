import { useRef, useCallback, useState } from 'react';
import type { RelicDragState, SnapBackState, CavityGeometry } from '../types/canvas';
import { canvasPointFromEvent, lerpPoint, distance } from './pointer-utils';
import { hitTestRelic, getEdgeProximity } from '../canvas/hit-testing';
import { buildCavityPaths } from '../canvas/cavity-shapes';
import { getBodyBounds } from '../canvas/body-paths';
import { SPRING_FACTOR, WOBBLE_DECAY_RATE, SNAP_BACK_DURATION } from '../data/tuning';

export function useRelicInteraction(cavities: CavityGeometry[]) {
  const [dragStates, setDragStates] = useState<Map<string, RelicDragState>>(new Map());
  const [snapBacks, setSnapBacks] = useState<Map<string, SnapBackState>>(new Map());
  const dragRef = useRef<Map<number, RelicDragState>>(new Map());
  const snapRef = useRef<Map<string, SnapBackState>>(new Map());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sizeRef = useRef({ width: 800, height: 600 });

  const setCanvasRef = useCallback((canvas: HTMLCanvasElement | null) => {
    canvasRef.current = canvas;
  }, []);

  const updateSize = useCallback((w: number, h: number) => {
    sizeRef.current = { width: w, height: h };
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = e.currentTarget;
      canvasRef.current = canvas;
      const point = canvasPointFromEvent(e, canvas);
      const { width, height } = sizeRef.current;
      const bounds = getBodyBounds(width, height);
      const relicSize = Math.min(bounds.width, bounds.height) * 0.06;

      // Check if we hit any relic that isn't already being dragged
      const activeDragIds = new Set(
        Array.from(dragRef.current.values()).map((d) => d.relicId),
      );

      for (const cavity of cavities) {
        if (activeDragIds.has(cavity.id)) continue;
        if (snapRef.current.has(cavity.id)) continue;

        if (hitTestRelic(point, cavity, width, height, relicSize)) {
          const paths = buildCavityPaths(cavity, width, height);

          const state: RelicDragState = {
            relicId: cavity.id,
            pointerId: e.pointerId,
            startPosition: { ...point },
            currentPosition: { ...point },
            visualPosition: { ...paths.center },
            cavityCenter: { ...paths.center },
            isExtracted: false,
            edgeProximity: 0,
            distanceFromCavity: 0,
            wobblePhase: 0,
            wobbleDecay: 0,
            velocity: { x: 0, y: 0 },
          };

          dragRef.current.set(e.pointerId, state);
          canvas.setPointerCapture(e.pointerId);
          break;
        }
      }
    },
    [cavities],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const state = dragRef.current.get(e.pointerId);
      if (!state) return;

      const canvas = e.currentTarget;
      const point = canvasPointFromEvent(e, canvas);
      const { width, height } = sizeRef.current;

      const prevPos = state.currentPosition;
      state.velocity = {
        x: point.x - prevPos.x,
        y: point.y - prevPos.y,
      };
      state.currentPosition = point;

      // Edge proximity
      const cavity = cavities.find((c) => c.id === state.relicId);
      if (cavity) {
        state.edgeProximity = getEdgeProximity(point, cavity, width, height);
      }

      // Extraction detection
      const dist = distance(point, state.cavityCenter);
      const paths = buildCavityPaths(cavity!, width, height);
      const extractionRadius = Math.max(paths.width, paths.height) * 0.5;
      state.isExtracted = dist > extractionRadius;
      state.distanceFromCavity = Math.max(0, dist - extractionRadius);

      // Wobble
      const speed = Math.sqrt(
        state.velocity.x * state.velocity.x + state.velocity.y * state.velocity.y,
      );
      state.wobbleDecay = Math.min(state.wobbleDecay + speed * 0.02, 1);
    },
    [cavities],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const state = dragRef.current.get(e.pointerId);
      if (!state) return;

      // Start snap-back animation
      const snap: SnapBackState = {
        relicId: state.relicId,
        fromPosition: { ...state.visualPosition },
        toPosition: { ...state.cavityCenter },
        progress: 0,
        startTime: performance.now(),
      };
      snapRef.current.set(state.relicId, snap);

      dragRef.current.delete(e.pointerId);
    },
    [],
  );

  // Called each frame to update physics
  const updatePhysics = useCallback((_time: number, _dt: number) => {
    let changed = false;

    // Update drag visual positions (spring lag)
    for (const state of dragRef.current.values()) {
      const newVisual = lerpPoint(
        state.visualPosition,
        state.currentPosition,
        SPRING_FACTOR,
      );

      if (
        Math.abs(newVisual.x - state.visualPosition.x) > 0.01 ||
        Math.abs(newVisual.y - state.visualPosition.y) > 0.01
      ) {
        state.visualPosition = newVisual;
        changed = true;
      }

      // Wobble physics
      state.wobblePhase += 0.15;
      state.wobbleDecay *= WOBBLE_DECAY_RATE;
      if (state.wobbleDecay < 0.001) state.wobbleDecay = 0;
    }

    // Update snap-back animations
    const now = performance.now();
    const snapsToRemove: string[] = [];

    for (const [id, snap] of snapRef.current) {
      const elapsed = now - snap.startTime;
      // Ease out with overshoot (snap easing)
      const t = Math.min(elapsed / SNAP_BACK_DURATION, 1);
      // cubic-bezier(0.68, -0.6, 0.32, 1.6) approximation
      snap.progress = easeSnapBack(t);

      if (t >= 1) {
        snapsToRemove.push(id);
      }
      changed = true;
    }

    for (const id of snapsToRemove) {
      snapRef.current.delete(id);
    }

    if (changed || dragRef.current.size > 0 || snapRef.current.size > 0) {
      // Build new maps for React state
      const newDrags = new Map<string, RelicDragState>();
      for (const state of dragRef.current.values()) {
        newDrags.set(state.relicId, { ...state });
      }
      setDragStates(newDrags);

      const newSnaps = new Map<string, SnapBackState>();
      for (const [id, snap] of snapRef.current) {
        newSnaps.set(id, { ...snap });
      }
      setSnapBacks(newSnaps);
    }
  }, []);

  return {
    dragStates,
    snapBacks,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    updatePhysics,
    setCanvasRef,
    updateSize,
  };
}

// Attempt a snap-back ease with slight overshoot
function easeSnapBack(t: number): number {
  // Attempt cubic-bezier(0.68, -0.6, 0.32, 1.6)
  // Approximation: overshoot then settle
  const c4 = (2 * Math.PI) / 3;
  if (t < 0.5) {
    return 2 * t * t;
  }
  const p = 2 * t - 1;
  return 0.5 + 0.5 * (1 + Math.sin(p * c4) * Math.pow(1 - p, 2) + p);
}
