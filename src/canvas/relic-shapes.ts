import { RELIC_MAP } from '../data/relics';

// Draw a relic at the given canvas position.
// scale: 1.0 = resting size, 1.08 = lifted/dragging
// rotation: degrees of wobble
// glow: 0-1 intensity of edge proximity glow
export function drawRelic(
  ctx: CanvasRenderingContext2D,
  relicId: string,
  x: number,
  y: number,
  size: number,
  scale: number,
  rotation: number,
  glow: number,
): void {
  const relic = RELIC_MAP.get(relicId);
  if (!relic) return;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(scale, scale);

  const s = size;

  // Glow effect
  if (glow > 0) {
    ctx.shadowColor = relic.hex;
    ctx.shadowBlur = 8 + glow * 16;
  }

  ctx.fillStyle = relic.hex;
  ctx.strokeStyle = relic.hex;
  ctx.lineWidth = 1.2;

  switch (relicId) {
    case 'cor-sacrum':
      drawHeart(ctx, s);
      break;
    case 'vox-martyris':
      drawFlame(ctx, s);
      break;
    case 'oculus-prophetae':
      drawEye(ctx, s);
      break;
    case 'os-confessorum':
      drawBone(ctx, s);
      break;
    case 'digitus-sancti':
      drawFinger(ctx, s);
      break;
    case 'viscera-beati':
      drawEntrails(ctx, s);
      break;
    case 'genu-penitentis':
      drawKnee(ctx, s);
      break;
    case 'lacrima-sancta':
      drawTear(ctx, s);
      break;
    case 'turris-barbarae':
      drawTower(ctx, s);
      break;
  }

  ctx.restore();
}

function drawHeart(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath();
  ctx.moveTo(0, s * 0.3);
  ctx.bezierCurveTo(-s * 0.5, -s * 0.2, -s * 0.5, -s * 0.5, 0, -s * 0.25);
  ctx.bezierCurveTo(s * 0.5, -s * 0.5, s * 0.5, -s * 0.2, 0, s * 0.3);
  ctx.fill();
}

function drawFlame(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.45);
  ctx.bezierCurveTo(s * 0.15, -s * 0.3, s * 0.25, -s * 0.1, s * 0.15, s * 0.2);
  ctx.bezierCurveTo(s * 0.1, s * 0.35, s * 0.05, s * 0.4, 0, s * 0.45);
  ctx.bezierCurveTo(-s * 0.05, s * 0.4, -s * 0.1, s * 0.35, -s * 0.15, s * 0.2);
  ctx.bezierCurveTo(-s * 0.25, -s * 0.1, -s * 0.15, -s * 0.3, 0, -s * 0.45);
  ctx.fill();
}

function drawEye(ctx: CanvasRenderingContext2D, s: number) {
  // Vesica piscis / almond eye
  ctx.beginPath();
  ctx.moveTo(-s * 0.35, 0);
  ctx.bezierCurveTo(-s * 0.2, -s * 0.25, s * 0.2, -s * 0.25, s * 0.35, 0);
  ctx.bezierCurveTo(s * 0.2, s * 0.25, -s * 0.2, s * 0.25, -s * 0.35, 0);
  ctx.fill();
  // Pupil
  ctx.fillStyle = '#0d1540';
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.08, 0, Math.PI * 2);
  ctx.fill();
}

function drawBone(ctx: CanvasRenderingContext2D, s: number) {
  // Elongated bone shape with rounded ends
  const len = s * 0.4;
  const knobR = s * 0.1;
  const shaft = s * 0.04;

  ctx.beginPath();
  // Top knob
  ctx.arc(0, -len, knobR, Math.PI, 0);
  // Right shaft
  ctx.lineTo(shaft, len);
  // Bottom knob
  ctx.arc(0, len, knobR, 0, Math.PI);
  // Left shaft
  ctx.lineTo(-shaft, -len);
  ctx.fill();
}

function drawFinger(ctx: CanvasRenderingContext2D, s: number) {
  // Tapered cylinder
  ctx.beginPath();
  ctx.moveTo(-s * 0.06, s * 0.3);
  ctx.lineTo(-s * 0.05, -s * 0.25);
  ctx.bezierCurveTo(-s * 0.04, -s * 0.35, s * 0.04, -s * 0.35, s * 0.05, -s * 0.25);
  ctx.lineTo(s * 0.06, s * 0.3);
  ctx.bezierCurveTo(s * 0.05, s * 0.38, -s * 0.05, s * 0.38, -s * 0.06, s * 0.3);
  ctx.fill();
  // Joint lines
  ctx.strokeStyle = ctx.fillStyle;
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-s * 0.05, -s * 0.05);
  ctx.lineTo(s * 0.05, -s * 0.05);
  ctx.moveTo(-s * 0.055, s * 0.12);
  ctx.lineTo(s * 0.055, s * 0.12);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawEntrails(ctx: CanvasRenderingContext2D, s: number) {
  // Amorphous blob
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.3);
  ctx.bezierCurveTo(s * 0.3, -s * 0.3, s * 0.35, -s * 0.05, s * 0.25, s * 0.1);
  ctx.bezierCurveTo(s * 0.35, s * 0.25, s * 0.15, s * 0.35, 0, s * 0.3);
  ctx.bezierCurveTo(-s * 0.2, s * 0.35, -s * 0.35, s * 0.2, -s * 0.3, s * 0.05);
  ctx.bezierCurveTo(-s * 0.35, -s * 0.15, -s * 0.25, -s * 0.3, 0, -s * 0.3);
  ctx.fill();
}

function drawKnee(ctx: CanvasRenderingContext2D, s: number) {
  // Rounded triangle (patella)
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.25);
  ctx.bezierCurveTo(s * 0.15, -s * 0.2, s * 0.25, s * 0.05, s * 0.2, s * 0.2);
  ctx.bezierCurveTo(s * 0.15, s * 0.28, -s * 0.15, s * 0.28, -s * 0.2, s * 0.2);
  ctx.bezierCurveTo(-s * 0.25, s * 0.05, -s * 0.15, -s * 0.2, 0, -s * 0.25);
  ctx.fill();
}

function drawTear(ctx: CanvasRenderingContext2D, s: number) {
  // Teardrop
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.35);
  ctx.bezierCurveTo(s * 0.02, -s * 0.3, s * 0.18, -s * 0.05, s * 0.18, s * 0.08);
  ctx.bezierCurveTo(s * 0.18, s * 0.25, s * 0.1, s * 0.35, 0, s * 0.35);
  ctx.bezierCurveTo(-s * 0.1, s * 0.35, -s * 0.18, s * 0.25, -s * 0.18, s * 0.08);
  ctx.bezierCurveTo(-s * 0.18, -s * 0.05, -s * 0.02, -s * 0.3, 0, -s * 0.35);
  ctx.fill();
  // Inner refraction line
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(s * 0.04, -s * 0.15);
  ctx.bezierCurveTo(s * 0.08, 0, s * 0.06, s * 0.1, s * 0.02, s * 0.18);
  ctx.stroke();
}

function drawTower(ctx: CanvasRenderingContext2D, s: number) {
  // Stone tower — Barbara's prison
  const tw = s * 0.16; // tower half-width
  const th = s * 0.4;  // tower height
  const crenW = s * 0.06;
  const crenH = s * 0.06;

  ctx.beginPath();
  // Left wall up
  ctx.moveTo(-tw, th * 0.6);
  ctx.lineTo(-tw, -th + crenH);
  // Crenellations
  ctx.lineTo(-tw, -th);
  ctx.lineTo(-tw + crenW, -th);
  ctx.lineTo(-tw + crenW, -th + crenH);
  ctx.lineTo(-tw + crenW * 2, -th + crenH);
  ctx.lineTo(-tw + crenW * 2, -th);
  ctx.lineTo(tw - crenW * 2, -th);
  ctx.lineTo(tw - crenW * 2, -th + crenH);
  ctx.lineTo(tw - crenW, -th + crenH);
  ctx.lineTo(tw - crenW, -th);
  ctx.lineTo(tw, -th);
  ctx.lineTo(tw, -th + crenH);
  // Right wall down
  ctx.lineTo(tw, th * 0.6);
  // Base — slightly wider
  ctx.lineTo(tw + s * 0.04, th * 0.6);
  ctx.lineTo(-tw - s * 0.04, th * 0.6);
  ctx.closePath();
  ctx.fill();

  // Lightning bolt overlay
  ctx.fillStyle = '#ffe060';
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.moveTo(s * 0.02, -th * 0.7);
  ctx.lineTo(-s * 0.06, -th * 0.05);
  ctx.lineTo(-s * 0.01, -th * 0.05);
  ctx.lineTo(-s * 0.04, th * 0.45);
  ctx.lineTo(s * 0.06, -th * 0.15);
  ctx.lineTo(s * 0.01, -th * 0.15);
  ctx.lineTo(s * 0.02, -th * 0.7);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}
