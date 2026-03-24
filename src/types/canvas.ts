export interface Point {
  x: number;
  y: number;
}

export interface CavityGeometry {
  id: string;
  centerNorm: Point;       // normalized 0-1 relative to body bounds
  widthNorm: number;       // normalized width
  heightNorm: number;      // normalized height
  edgeBand: number;        // pixel width of danger zone
  labelPosition: Point;    // normalized label position
  labelAnchor: 'left' | 'right' | 'center';
}

export interface HitTestResult {
  relicId: string | null;
  cavityId: string | null;
}

export interface RelicDragState {
  relicId: string;
  pointerId: number;
  startPosition: Point;
  currentPosition: Point;
  visualPosition: Point;    // lagged position for rendering
  cavityCenter: Point;      // in canvas pixels
  isExtracted: boolean;
  edgeProximity: number;    // 0 = center, 1 = touching edge
  distanceFromCavity: number;
  wobblePhase: number;
  wobbleDecay: number;
  velocity: Point;
}

export interface SnapBackState {
  relicId: string;
  fromPosition: Point;
  toPosition: Point;
  progress: number;         // 0-1
  startTime: number;
}
