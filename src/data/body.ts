import type { CavityGeometry } from '../types/canvas';

// All positions normalized 0-1 relative to the body bounding box.
// The body is centered horizontally, with head at top.
// These define the center and size of each cavity.

export const CAVITIES: CavityGeometry[] = [
  {
    id: 'cor-sacrum',
    centerNorm: { x: 0.5, y: 0.38 },
    widthNorm: 0.14,
    heightNorm: 0.09,
    edgeBand: 12,
    labelPosition: { x: 0.75, y: 0.38 },
    labelAnchor: 'left',
  },
  {
    id: 'vox-martyris',
    centerNorm: { x: 0.5, y: 0.22 },
    widthNorm: 0.08,
    heightNorm: 0.05,
    edgeBand: 10,
    labelPosition: { x: 0.72, y: 0.22 },
    labelAnchor: 'left',
  },
  {
    id: 'oculus-prophetae',
    centerNorm: { x: 0.5, y: 0.12 },
    widthNorm: 0.07,
    heightNorm: 0.045,
    edgeBand: 10,
    labelPosition: { x: 0.72, y: 0.12 },
    labelAnchor: 'left',
  },
  {
    id: 'os-confessorum',
    centerNorm: { x: 0.22, y: 0.42 },
    widthNorm: 0.08,
    heightNorm: 0.12,
    edgeBand: 10,
    labelPosition: { x: 0.08, y: 0.42 },
    labelAnchor: 'right',
  },
  {
    id: 'digitus-sancti',
    centerNorm: { x: 0.78, y: 0.55 },
    widthNorm: 0.06,
    heightNorm: 0.06,
    edgeBand: 10,
    labelPosition: { x: 0.9, y: 0.55 },
    labelAnchor: 'left',
  },
  {
    id: 'viscera-beati',
    centerNorm: { x: 0.5, y: 0.52 },
    widthNorm: 0.12,
    heightNorm: 0.08,
    edgeBand: 12,
    labelPosition: { x: 0.75, y: 0.52 },
    labelAnchor: 'left',
  },
  {
    id: 'genu-penitentis',
    centerNorm: { x: 0.42, y: 0.75 },
    widthNorm: 0.07,
    heightNorm: 0.06,
    edgeBand: 10,
    labelPosition: { x: 0.25, y: 0.75 },
    labelAnchor: 'right',
  },
  {
    id: 'lacrima-sancta',
    centerNorm: { x: 0.56, y: 0.14 },
    widthNorm: 0.04,
    heightNorm: 0.035,
    edgeBand: 8,
    labelPosition: { x: 0.72, y: 0.14 },
    labelAnchor: 'left',
  },
  {
    id: 'turris-barbarae',
    centerNorm: { x: 0.58, y: 0.75 },
    widthNorm: 0.07,
    heightNorm: 0.06,
    edgeBand: 10,
    labelPosition: { x: 0.75, y: 0.75 },
    labelAnchor: 'left',
  },
];

export const CAVITY_MAP = new Map(CAVITIES.map((c) => [c.id, c]));
