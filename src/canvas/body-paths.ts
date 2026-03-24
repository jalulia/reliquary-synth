// Golden reliquary figure — flat, frontal, ornamental.
// Defined as normalized coordinates (0-1), scaled at render time.
// Style: medieval reliquary casket lid / manuscript anatomical diagram.

export function drawBodyOutline(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
): void {
  const cx = w * 0.5;

  // Scale factors — body occupies ~55% width, ~85% height, centered
  const bodyW = w * 0.55;
  const bodyH = h * 0.85;
  const top = h * 0.05;

  ctx.save();

  // Gilt stroke style
  ctx.strokeStyle = '#c8a832';
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(200, 168, 50, 0.25)';
  ctx.shadowBlur = 6;

  // ---- Head (oval) ----
  const headCx = cx;
  const headCy = top + bodyH * 0.08;
  const headRx = bodyW * 0.09;
  const headRy = bodyW * 0.11;

  ctx.beginPath();
  ctx.ellipse(headCx, headCy, headRx, headRy, 0, 0, Math.PI * 2);
  ctx.stroke();

  // ---- Neck ----
  const neckTop = headCy + headRy;
  const neckBot = top + bodyH * 0.23;
  const neckW = bodyW * 0.04;

  ctx.beginPath();
  ctx.moveTo(cx - neckW, neckTop);
  ctx.lineTo(cx - neckW, neckBot);
  ctx.moveTo(cx + neckW, neckTop);
  ctx.lineTo(cx + neckW, neckBot);
  ctx.stroke();

  // ---- Shoulders & torso ----
  const shoulderY = neckBot;
  const shoulderW = bodyW * 0.42;
  const waistY = top + bodyH * 0.58;
  const waistW = bodyW * 0.28;
  const hipY = top + bodyH * 0.63;
  const hipW = bodyW * 0.32;

  // Left shoulder + torso
  ctx.beginPath();
  ctx.moveTo(cx - neckW, shoulderY);
  ctx.bezierCurveTo(
    cx - neckW - bodyW * 0.08, shoulderY,
    cx - shoulderW, shoulderY + bodyH * 0.02,
    cx - shoulderW, shoulderY + bodyH * 0.04,
  );
  // Arm socket
  ctx.lineTo(cx - shoulderW, shoulderY + bodyH * 0.08);
  // Torso side
  ctx.bezierCurveTo(
    cx - shoulderW + bodyW * 0.04, shoulderY + bodyH * 0.15,
    cx - waistW, waistY - bodyH * 0.05,
    cx - waistW, waistY,
  );
  // Waist to hip
  ctx.bezierCurveTo(
    cx - waistW, waistY + bodyH * 0.02,
    cx - hipW, hipY - bodyH * 0.01,
    cx - hipW, hipY,
  );
  ctx.stroke();

  // Right shoulder + torso (mirror)
  ctx.beginPath();
  ctx.moveTo(cx + neckW, shoulderY);
  ctx.bezierCurveTo(
    cx + neckW + bodyW * 0.08, shoulderY,
    cx + shoulderW, shoulderY + bodyH * 0.02,
    cx + shoulderW, shoulderY + bodyH * 0.04,
  );
  ctx.lineTo(cx + shoulderW, shoulderY + bodyH * 0.08);
  ctx.bezierCurveTo(
    cx + shoulderW - bodyW * 0.04, shoulderY + bodyH * 0.15,
    cx + waistW, waistY - bodyH * 0.05,
    cx + waistW, waistY,
  );
  ctx.bezierCurveTo(
    cx + waistW, waistY + bodyH * 0.02,
    cx + hipW, hipY - bodyH * 0.01,
    cx + hipW, hipY,
  );
  ctx.stroke();

  // ---- Arms ----
  const armStartY = shoulderY + bodyH * 0.04;

  // Left arm
  ctx.beginPath();
  ctx.moveTo(cx - shoulderW, armStartY);
  ctx.bezierCurveTo(
    cx - shoulderW - bodyW * 0.08, armStartY + bodyH * 0.06,
    cx - shoulderW - bodyW * 0.12, armStartY + bodyH * 0.15,
    cx - shoulderW - bodyW * 0.10, armStartY + bodyH * 0.24,
  );
  // Forearm
  ctx.bezierCurveTo(
    cx - shoulderW - bodyW * 0.08, armStartY + bodyH * 0.30,
    cx - shoulderW - bodyW * 0.04, armStartY + bodyH * 0.36,
    cx - shoulderW + bodyW * 0.02, armStartY + bodyH * 0.38,
  );
  ctx.stroke();

  // Left arm inner edge
  ctx.beginPath();
  ctx.moveTo(cx - shoulderW, armStartY + bodyH * 0.04);
  ctx.bezierCurveTo(
    cx - shoulderW - bodyW * 0.04, armStartY + bodyH * 0.10,
    cx - shoulderW - bodyW * 0.07, armStartY + bodyH * 0.18,
    cx - shoulderW - bodyW * 0.05, armStartY + bodyH * 0.24,
  );
  ctx.bezierCurveTo(
    cx - shoulderW - bodyW * 0.03, armStartY + bodyH * 0.30,
    cx - shoulderW + bodyW * 0.01, armStartY + bodyH * 0.34,
    cx - shoulderW + bodyW * 0.05, armStartY + bodyH * 0.36,
  );
  ctx.stroke();

  // Right arm
  ctx.beginPath();
  ctx.moveTo(cx + shoulderW, armStartY);
  ctx.bezierCurveTo(
    cx + shoulderW + bodyW * 0.08, armStartY + bodyH * 0.06,
    cx + shoulderW + bodyW * 0.12, armStartY + bodyH * 0.15,
    cx + shoulderW + bodyW * 0.10, armStartY + bodyH * 0.24,
  );
  ctx.bezierCurveTo(
    cx + shoulderW + bodyW * 0.08, armStartY + bodyH * 0.30,
    cx + shoulderW + bodyW * 0.04, armStartY + bodyH * 0.36,
    cx + shoulderW - bodyW * 0.02, armStartY + bodyH * 0.38,
  );
  ctx.stroke();

  // Right arm inner edge
  ctx.beginPath();
  ctx.moveTo(cx + shoulderW, armStartY + bodyH * 0.04);
  ctx.bezierCurveTo(
    cx + shoulderW + bodyW * 0.04, armStartY + bodyH * 0.10,
    cx + shoulderW + bodyW * 0.07, armStartY + bodyH * 0.18,
    cx + shoulderW + bodyW * 0.05, armStartY + bodyH * 0.24,
  );
  ctx.bezierCurveTo(
    cx + shoulderW + bodyW * 0.03, armStartY + bodyH * 0.30,
    cx + shoulderW - bodyW * 0.01, armStartY + bodyH * 0.34,
    cx + shoulderW - bodyW * 0.05, armStartY + bodyH * 0.36,
  );
  ctx.stroke();

  // ---- Legs ----
  const legTop = hipY;
  const legSep = bodyW * 0.03;
  const legW = bodyW * 0.12;
  const legBot = top + bodyH * 0.95;
  const kneeY = top + bodyH * 0.78;

  // Left leg outer
  ctx.beginPath();
  ctx.moveTo(cx - hipW, legTop);
  ctx.bezierCurveTo(
    cx - hipW + bodyW * 0.02, kneeY - bodyH * 0.05,
    cx - legW - legSep, kneeY,
    cx - legW - legSep, kneeY + bodyH * 0.02,
  );
  ctx.bezierCurveTo(
    cx - legW - legSep, kneeY + bodyH * 0.06,
    cx - legW - legSep + bodyW * 0.02, legBot - bodyH * 0.04,
    cx - legW - legSep + bodyW * 0.03, legBot,
  );
  ctx.stroke();

  // Left leg inner
  ctx.beginPath();
  ctx.moveTo(cx - legSep, legTop);
  ctx.bezierCurveTo(
    cx - legSep, kneeY - bodyH * 0.05,
    cx - legSep, kneeY,
    cx - legSep, kneeY + bodyH * 0.02,
  );
  ctx.lineTo(cx - legSep, legBot);
  ctx.stroke();

  // Right leg outer
  ctx.beginPath();
  ctx.moveTo(cx + hipW, legTop);
  ctx.bezierCurveTo(
    cx + hipW - bodyW * 0.02, kneeY - bodyH * 0.05,
    cx + legW + legSep, kneeY,
    cx + legW + legSep, kneeY + bodyH * 0.02,
  );
  ctx.bezierCurveTo(
    cx + legW + legSep, kneeY + bodyH * 0.06,
    cx + legW + legSep - bodyW * 0.02, legBot - bodyH * 0.04,
    cx + legW + legSep - bodyW * 0.03, legBot,
  );
  ctx.stroke();

  // Right leg inner
  ctx.beginPath();
  ctx.moveTo(cx + legSep, legTop);
  ctx.lineTo(cx + legSep, legBot);
  ctx.stroke();

  // ---- Feet ----
  const footW = bodyW * 0.06;
  // Left foot
  ctx.beginPath();
  ctx.moveTo(cx - legW - legSep + bodyW * 0.03, legBot);
  ctx.lineTo(cx - legSep, legBot);
  ctx.moveTo(cx - legW - legSep + bodyW * 0.03 - footW * 0.3, legBot + bodyH * 0.02);
  ctx.bezierCurveTo(
    cx - legW - legSep + bodyW * 0.03 - footW * 0.1, legBot + bodyH * 0.025,
    cx - legSep + footW * 0.1, legBot + bodyH * 0.025,
    cx - legSep + footW * 0.3, legBot + bodyH * 0.02,
  );
  ctx.stroke();

  // Right foot
  ctx.beginPath();
  ctx.moveTo(cx + legW + legSep - bodyW * 0.03, legBot);
  ctx.lineTo(cx + legSep, legBot);
  ctx.moveTo(cx + legW + legSep - bodyW * 0.03 + footW * 0.3, legBot + bodyH * 0.02);
  ctx.bezierCurveTo(
    cx + legW + legSep - bodyW * 0.03 + footW * 0.1, legBot + bodyH * 0.025,
    cx + legSep - footW * 0.1, legBot + bodyH * 0.025,
    cx + legSep - footW * 0.3, legBot + bodyH * 0.02,
  );
  ctx.stroke();

  // ---- Decorative cross on chest ----
  ctx.save();
  ctx.strokeStyle = '#786420';
  ctx.lineWidth = 0.8;
  ctx.shadowBlur = 0;
  const crossCx = cx;
  const crossCy = top + bodyH * 0.32;
  const crossSize = bodyW * 0.03;
  ctx.beginPath();
  ctx.moveTo(crossCx, crossCy - crossSize);
  ctx.lineTo(crossCx, crossCy + crossSize);
  ctx.moveTo(crossCx - crossSize * 0.7, crossCy - crossSize * 0.1);
  ctx.lineTo(crossCx + crossSize * 0.7, crossCy - crossSize * 0.1);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

// Returns the body bounding box in canvas coordinates
export function getBodyBounds(w: number, h: number) {
  const bodyW = w * 0.55;
  const bodyH = h * 0.85;
  const top = h * 0.05;
  const left = w * 0.5 - bodyW * 0.5;

  return { left, top, width: bodyW, height: bodyH };
}
