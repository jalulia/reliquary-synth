import { BUZZ_THRESHOLD } from '../data/tuning';

// Render cavity glow based on edge proximity
export function drawCavityGlow(
  ctx: CanvasRenderingContext2D,
  outer: Path2D,
  proximity: number,
  _time: number,
): void {
  if (proximity <= 0) return;

  ctx.save();

  if (proximity > BUZZ_THRESHOLD) {
    // Danger zone — gold to red transition
    const danger = (proximity - BUZZ_THRESHOLD) / (1 - BUZZ_THRESHOLD);
    const r = Math.floor(200 + danger * 32);
    const g = Math.floor(168 - danger * 120);
    const b = Math.floor(50 - danger * 18);
    ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${0.4 + danger * 0.4})`;
    ctx.shadowBlur = 8 + danger * 16;
    ctx.lineWidth = 1.5 + danger * 1.5;
  } else {
    // Approaching — gilt brightens
    const t = proximity / BUZZ_THRESHOLD;
    ctx.strokeStyle = `rgba(232, 200, 72, ${0.3 + t * 0.5})`;
    ctx.shadowColor = `rgba(200, 168, 50, ${0.2 + t * 0.3})`;
    ctx.shadowBlur = 4 + t * 8;
    ctx.lineWidth = 1.5;
  }

  ctx.stroke(outer);
  ctx.restore();
}

// Render marginalia — decorative corner elements
export function drawMarginalia(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
): void {
  ctx.save();
  ctx.strokeStyle = '#786420';
  ctx.lineWidth = 0.6;
  ctx.globalAlpha = 0.3;

  const m = 20; // margin
  const len = 40;

  // Corner flourishes
  const corners = [
    [m, m, 1, 1],
    [w - m, m, -1, 1],
    [m, h - m, 1, -1],
    [w - m, h - m, -1, -1],
  ] as const;

  for (const [x, y, dx, dy] of corners) {
    ctx.beginPath();
    ctx.moveTo(x, y + dy * len);
    ctx.lineTo(x, y);
    ctx.lineTo(x + dx * len, y);
    ctx.stroke();

    // Small ornamental dot
    ctx.fillStyle = '#786420';
    ctx.beginPath();
    ctx.arc(x + dx * 6, y + dy * 6, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
