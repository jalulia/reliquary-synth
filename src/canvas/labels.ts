import type { CavityGeometry } from '../types/canvas';
import { RELIC_MAP } from '../data/relics';
import { getBodyBounds } from './body-paths';

export function drawLabels(
  ctx: CanvasRenderingContext2D,
  cavities: CavityGeometry[],
  canvasW: number,
  canvasH: number,
): void {
  const bounds = getBodyBounds(canvasW, canvasH);

  ctx.save();
  ctx.font = 'italic 11px "IM Fell English", serif';
  ctx.fillStyle = '#8a8678';
  ctx.strokeStyle = '#5a5750';
  ctx.lineWidth = 0.5;

  for (const cavity of cavities) {
    const relic = RELIC_MAP.get(cavity.id);
    if (!relic) continue;

    const cx = bounds.left + cavity.centerNorm.x * bounds.width;
    const cy = bounds.top + cavity.centerNorm.y * bounds.height;
    const lx = bounds.left + cavity.labelPosition.x * bounds.width;
    const ly = bounds.top + cavity.labelPosition.y * bounds.height;

    // Leader line
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(lx, ly);
    ctx.stroke();

    // Small dot at cavity end
    ctx.fillStyle = '#5a5750';
    ctx.beginPath();
    ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Label text
    ctx.fillStyle = '#8a8678';
    ctx.textBaseline = 'middle';

    if (cavity.labelAnchor === 'right') {
      ctx.textAlign = 'right';
      ctx.fillText(relic.latinName, lx - 4, ly);
    } else {
      ctx.textAlign = 'left';
      ctx.fillText(relic.latinName, lx + 4, ly);
    }
  }

  ctx.restore();
}
