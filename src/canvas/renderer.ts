import type { CavityGeometry, RelicDragState, SnapBackState } from '../types/canvas';
import { drawBodyOutline, getBodyBounds } from './body-paths';
import { buildCavityPaths } from './cavity-shapes';
import { drawRelic } from './relic-shapes';
import { drawLabels } from './labels';
import { drawCavityGlow, drawMarginalia } from './effects';

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  cavities: CavityGeometry[],
  dragStates: Map<string, RelicDragState>,
  snapBacks: Map<string, SnapBackState>,
  time: number,
): void {
  // Clear to void
  ctx.clearRect(0, 0, canvasW, canvasH);
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Marginalia
  drawMarginalia(ctx, canvasW, canvasH);

  // Body outline
  drawBodyOutline(ctx, canvasW, canvasH);

  const bounds = getBodyBounds(canvasW, canvasH);
  const baseRelicSize = Math.min(bounds.width, bounds.height) * 0.06;

  // Draw each cavity and its relic
  for (const cavity of cavities) {
    const paths = buildCavityPaths(cavity, canvasW, canvasH);
    const drag = dragStates.get(cavity.id);
    const snap = snapBacks.get(cavity.id);

    // Draw cavity recess
    ctx.save();
    ctx.fillStyle = '#0a0a0a';
    ctx.fill(paths.outer);

    // Cavity gilt border
    ctx.strokeStyle = '#786420';
    ctx.lineWidth = 1.2;
    ctx.shadowColor = 'rgba(200, 168, 50, 0.15)';
    ctx.shadowBlur = 4;
    ctx.stroke(paths.outer);

    // Inner bevel
    ctx.strokeStyle = 'rgba(120, 100, 32, 0.3)';
    ctx.lineWidth = 0.5;
    ctx.shadowBlur = 0;
    ctx.stroke(paths.inner);
    ctx.restore();

    // Edge glow (if dragging)
    if (drag) {
      drawCavityGlow(ctx, paths.outer, drag.edgeProximity, time);
    }

    // Draw relic
    if (drag) {
      // Relic is being dragged — draw at visual position with lift effect
      drawRelic(
        ctx,
        cavity.id,
        drag.visualPosition.x,
        drag.visualPosition.y,
        baseRelicSize,
        1.08,
        Math.sin(drag.wobblePhase) * drag.wobbleDecay * 5,
        drag.edgeProximity,
      );
    } else if (snap) {
      // Relic is snapping back
      const x = snap.fromPosition.x + (snap.toPosition.x - snap.fromPosition.x) * snap.progress;
      const y = snap.fromPosition.y + (snap.toPosition.y - snap.fromPosition.y) * snap.progress;
      const wobble = (1 - snap.progress) * 3;
      drawRelic(
        ctx,
        cavity.id,
        x,
        y,
        baseRelicSize,
        1 + (1 - snap.progress) * 0.08,
        Math.sin(time * 0.01) * wobble,
        0,
      );
    } else {
      // Relic at rest in cavity
      drawRelic(
        ctx,
        cavity.id,
        paths.center.x,
        paths.center.y,
        baseRelicSize,
        1.0,
        0,
        0,
      );
    }
  }

  // Labels (drawn last, on top)
  drawLabels(ctx, cavities, canvasW, canvasH);
}
