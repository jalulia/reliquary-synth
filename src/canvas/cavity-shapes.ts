import type { CavityGeometry } from '../types/canvas';
import { getBodyBounds } from './body-paths';

interface CavityPaths {
  outer: Path2D;
  inner: Path2D;
  center: { x: number; y: number };
  width: number;
  height: number;
}

// Convert normalized cavity geometry to pixel-space Path2D objects
export function buildCavityPaths(
  cavity: CavityGeometry,
  canvasW: number,
  canvasH: number,
): CavityPaths {
  const bounds = getBodyBounds(canvasW, canvasH);

  const cx = bounds.left + cavity.centerNorm.x * bounds.width;
  const cy = bounds.top + cavity.centerNorm.y * bounds.height;
  const halfW = (cavity.widthNorm * bounds.width) / 2;
  const halfH = (cavity.heightNorm * bounds.height) / 2;

  // Outer path — rounded rectangle (the cavity edge / danger zone)
  const outer = new Path2D();
  const r = Math.min(halfW, halfH) * 0.4; // corner radius
  roundedRect(outer, cx - halfW, cy - halfH, halfW * 2, halfH * 2, r);

  // Inner path — inset by edgeBand (the safe zone)
  const inset = cavity.edgeBand;
  const inner = new Path2D();
  const ri = Math.max(r - inset * 0.5, 2);
  roundedRect(
    inner,
    cx - halfW + inset,
    cy - halfH + inset,
    (halfW - inset) * 2,
    (halfH - inset) * 2,
    ri,
  );

  return {
    outer,
    inner,
    center: { x: cx, y: cy },
    width: halfW * 2,
    height: halfH * 2,
  };
}

function roundedRect(
  path: Path2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  path.moveTo(x + r, y);
  path.lineTo(x + w - r, y);
  path.arcTo(x + w, y, x + w, y + r, r);
  path.lineTo(x + w, y + h - r);
  path.arcTo(x + w, y + h, x + w - r, y + h, r);
  path.lineTo(x + r, y + h);
  path.arcTo(x, y + h, x, y + h - r, r);
  path.lineTo(x, y + r);
  path.arcTo(x, y, x + r, y, r);
  path.closePath();
}
