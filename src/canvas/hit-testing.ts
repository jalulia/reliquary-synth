import type { Point, CavityGeometry } from '../types/canvas';
import { buildCavityPaths } from './cavity-shapes';
import { distance } from '../interaction/pointer-utils';

// Test if a point hits a relic (sitting in its cavity, not currently dragged)
export function hitTestRelic(
  point: Point,
  cavity: CavityGeometry,
  canvasW: number,
  canvasH: number,
  relicSize: number,
): boolean {
  const paths = buildCavityPaths(cavity, canvasW, canvasH);
  const dist = distance(point, paths.center);
  return dist <= relicSize * 0.6;
}

// Calculate edge proximity: 0 = deep inside cavity, 1 = touching/outside edge
export function getEdgeProximity(
  point: Point,
  cavity: CavityGeometry,
  canvasW: number,
  canvasH: number,
): number {
  const paths = buildCavityPaths(cavity, canvasW, canvasH);

  // Use an offscreen canvas to check path containment
  // For performance, approximate with elliptical distance
  const dx = (point.x - paths.center.x) / (paths.width / 2);
  const dy = (point.y - paths.center.y) / (paths.height / 2);
  const normalizedDist = Math.sqrt(dx * dx + dy * dy);

  // 0 at center, 1 at edge
  // The inner safe zone ends at ~0.6 of the way to the edge
  const edgeRatio = cavity.edgeBand / Math.min(paths.width, paths.height);
  const safeZone = 1 - edgeRatio * 2;

  if (normalizedDist <= safeZone) return 0;
  if (normalizedDist >= 1) return 1;

  return (normalizedDist - safeZone) / (1 - safeZone);
}

// Check if point is inside the cavity outer boundary
export function isInsideCavity(
  ctx: CanvasRenderingContext2D,
  point: Point,
  cavity: CavityGeometry,
  canvasW: number,
  canvasH: number,
): boolean {
  const paths = buildCavityPaths(cavity, canvasW, canvasH);
  return ctx.isPointInPath(paths.outer, point.x, point.y);
}
