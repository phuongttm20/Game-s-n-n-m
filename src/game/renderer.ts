import {
  Acorn,
  AnimationPose,
  BounceMushroom,
  CastleGoal,
  Checkpoint,
  Firefly,
  Hazard,
  Particle,
  Platform,
} from './types';

export interface DrawBrambleOptions {
  x: number;
  y: number;
  facing: 1 | -1;
  pose: AnimationPose;
  animTime: number;
  vx?: number;
  vy?: number;
  squashX?: number;
  squashY?: number;
  scale?: number;
  alpha?: number;
}

export function drawBramble(
  ctx: CanvasRenderingContext2D,
  opts: DrawBrambleOptions
): void {
  const {
    x,
    y,
    facing,
    pose,
    animTime,
    vx = 0,
    vy = 0,
    squashX = 1,
    squashY = 1,
    scale = 1,
    alpha = 1,
  } = opts;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(facing * scale * squashX, scale * squashY);

  // Subtle pose-specific body offset & tilt
  let bobY = 0;
  let tilt = 0;
  let legPhase = 0;

  if (pose === 'idle') {
    bobY = Math.sin(animTime * 3.2) * 1.6;
    tilt = Math.sin(animTime * 1.6) * 0.025;
  } else if (pose === 'run') {
    legPhase = animTime * 15;
    bobY = Math.abs(Math.sin(legPhase)) * -3.8;
    tilt = 0.09 + Math.sin(legPhase * 2) * 0.03;
  } else if (pose === 'jump') {
    bobY = -2;
    tilt = -0.09;
  } else if (pose === 'fall') {
    bobY = 1;
    tilt = 0.08;
  } else if (pose === 'celebrate') {
    bobY = Math.abs(Math.sin(animTime * 8)) * -6;
    tilt = Math.sin(animTime * 8) * 0.05;
  }

  ctx.translate(0, bobY);
  ctx.rotate(tilt);

  // --- 1. Flowing Crimson Scarf Tails (behind body) ---
  const speedFactor = Math.min(1, Math.abs(vx) / 300);
  const tailStretch = pose === 'run' ? 14 + speedFactor * 12 : pose === 'jump' || pose === 'fall' ? 16 : 6;
  const wave1 = Math.sin(animTime * (pose === 'run' ? 14 : 4.2)) * (pose === 'run' ? 5.5 : 3);
  const wave2 = Math.cos(animTime * (pose === 'run' ? 12 : 3.5)) * (pose === 'run' ? 4 : 2.2);
  const airLift = pose === 'jump' ? 6 : pose === 'fall' ? -8 : 0;

  // Lower tail
  ctx.fillStyle = '#9E2A2B';
  ctx.strokeStyle = '#381B17';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-6, -18);
  ctx.quadraticCurveTo(-18 - tailStretch * 0.5, -16 + wave2 + airLift * 0.5, -24 - tailStretch, -12 + wave1 + airLift);
  ctx.quadraticCurveTo(-18 - tailStretch * 0.5, -10 + wave2 + airLift * 0.5, -5, -13);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Upper tail
  ctx.fillStyle = '#C83E3B';
  ctx.beginPath();
  ctx.moveTo(-7, -21);
  ctx.quadraticCurveTo(-20 - tailStretch * 0.5, -23 - wave1 * 0.6 + airLift * 0.6, -27 - tailStretch, -17 + wave2 + airLift);
  ctx.quadraticCurveTo(-19 - tailStretch * 0.4, -15 + wave1 * 0.4 + airLift * 0.4, -6, -15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // --- 2. Back Boot ---
  const backLegAngle =
    pose === 'run'
      ? Math.sin(legPhase + Math.PI) * 0.65
      : pose === 'jump'
      ? -0.35
      : pose === 'fall'
      ? 0.25
      : 0;
  drawBoot(ctx, -4, -5, backLegAngle, '#63311C');

  // --- 3. Spiky Hedgehog Quills ---
  ctx.fillStyle = '#314536';
  ctx.strokeStyle = '#1E2A20';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-6, -34);
  ctx.lineTo(-16, -33);
  ctx.lineTo(-12, -27);
  ctx.lineTo(-21, -24);
  ctx.lineTo(-15, -19);
  ctx.lineTo(-22, -14);
  ctx.lineTo(-15, -10);
  ctx.lineTo(-18, -5);
  ctx.lineTo(-8, -4);
  ctx.quadraticCurveTo(4, -6, 6, -24);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner quill highlights
  ctx.fillStyle = '#435C48';
  ctx.beginPath();
  ctx.moveTo(-8, -28);
  ctx.lineTo(-15, -23);
  ctx.lineTo(-9, -20);
  ctx.lineTo(-16, -14);
  ctx.lineTo(-8, -11);
  ctx.closePath();
  ctx.fill();

  // --- 4. Body & Cream-Sage Belly ---
  ctx.fillStyle = '#607D5C';
  ctx.strokeStyle = '#1E2A20';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(2, -16, 13, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Belly patch
  ctx.fillStyle = '#B8C9A6';
  ctx.beginPath();
  ctx.ellipse(6, -13, 8.5, 10, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // --- 5. Front Boot ---
  const frontLegAngle =
    pose === 'run'
      ? Math.sin(legPhase) * 0.72
      : pose === 'jump'
      ? 0.45
      : pose === 'fall'
      ? -0.2
      : 0;
  drawBoot(ctx, 5, -5, frontLegAngle, '#824227');

  // --- 6. Head & Snout ---
  ctx.fillStyle = '#73916D';
  ctx.strokeStyle = '#1E2A20';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(5, -28, 12, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Cheek / snout highlight
  ctx.fillStyle = '#B9CAA8';
  ctx.beginPath();
  ctx.ellipse(10, -26, 7.5, 6.2, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Cute round ear
  ctx.fillStyle = '#607D5C';
  ctx.beginPath();
  ctx.arc(-4, -31, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Eye (with periodic blink in idle)
  const isBlinking = pose === 'idle' && Math.sin(animTime * 1.4) > 0.97;
  if (isBlinking) {
    ctx.strokeStyle = '#1E2A20';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(6.5, -28);
    ctx.lineTo(10.5, -28);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#182119';
    ctx.beginPath();
    ctx.arc(8.5, -28.5, 2.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(9.2, -29.3, 0.85, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cute button nose at snout tip
  ctx.fillStyle = '#1E261F';
  ctx.beginPath();
  ctx.ellipse(16.8, -26.5, 2.2, 1.7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Gentle smile
  ctx.strokeStyle = '#253227';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(12.2, -24.5, 2.5, 0.15, Math.PI * 0.72);
  ctx.stroke();

  // --- 7. Acorn-Cap Helmet ---
  ctx.save();
  ctx.translate(3, -34);
  ctx.rotate(-0.06);

  // Acorn stem nub
  ctx.fillStyle = '#6D3411';
  ctx.strokeStyle = '#2B1609';
  ctx.lineWidth = 1.7;
  ctx.beginPath();
  ctx.moveTo(-2, -11);
  ctx.quadraticCurveTo(-1, -16, 2.5, -16);
  ctx.quadraticCurveTo(3.5, -13, 2, -10.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Acorn cap dome
  const capGrad = ctx.createLinearGradient(0, -12, 0, 3);
  capGrad.addColorStop(0, '#D4752E');
  capGrad.addColorStop(1, '#9E4B17');
  ctx.fillStyle = capGrad;
  ctx.beginPath();
  ctx.moveTo(-13.5, 1);
  ctx.quadraticCurveTo(-12, -12, 0.5, -12);
  ctx.quadraticCurveTo(13, -12, 13.5, 1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Glossy specular highlight on helmet
  ctx.fillStyle = 'rgba(255, 232, 190, 0.35)';
  ctx.beginPath();
  ctx.ellipse(-4, -6.5, 4.5, 2, -0.35, 0, Math.PI * 2);
  ctx.fill();

  // Helmet rim band
  ctx.fillStyle = '#7E3910';
  ctx.beginPath();
  ctx.roundRect(-14.5, -1.2, 29, 4.6, 2.2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // --- 8. Scarf Collar ---
  ctx.fillStyle = '#C83E3B';
  ctx.strokeStyle = '#381B17';
  ctx.lineWidth = 1.7;
  ctx.beginPath();
  ctx.roundRect(-8, -22.5, 21, 6.2, 3.1);
  ctx.fill();
  ctx.stroke();

  // Scarf fold accent
  ctx.strokeStyle = '#992725';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-2, -19.5);
  ctx.lineTo(8, -19.5);
  ctx.stroke();

  // --- 9. Front Paw & Twig Sword with Sprout Leaf ---
  const armBob =
    pose === 'run'
      ? Math.sin(legPhase) * 0.28
      : pose === 'jump'
      ? -0.45
      : pose === 'celebrate'
      ? -0.8 + Math.sin(animTime * 10) * 0.25
      : Math.sin(animTime * 3.2) * 0.05;

  ctx.save();
  ctx.translate(10, -16);
  ctx.rotate(armBob);

  // Twig sword
  ctx.strokeStyle = '#5D3A1F';
  ctx.lineWidth = 3.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 2);
  ctx.lineTo(13, -12);
  ctx.stroke();

  // Twig inner highlight
  ctx.strokeStyle = '#855733';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(1, 1);
  ctx.lineTo(12, -11);
  ctx.stroke();

  // Small twig fork
  ctx.strokeStyle = '#5D3A1F';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(7.5, -6);
  ctx.lineTo(11, -3);
  ctx.stroke();

  // Bright green sprout leaf at sword tip
  ctx.fillStyle = '#70B844';
  ctx.strokeStyle = '#244019';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(13, -12);
  ctx.quadraticCurveTo(18, -19, 21, -13.5);
  ctx.quadraticCurveTo(17.5, -9, 13, -12);
  ctx.fill();
  ctx.stroke();

  // Little paw holding twig
  ctx.fillStyle = '#7A9673';
  ctx.strokeStyle = '#1E2A20';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(2, 0, 3.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
  ctx.restore();
}

function drawBoot(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  angle: number,
  color: string
): void {
  ctx.save();
  ctx.translate(bx, by);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#26140C';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.roundRect(-3.5, -2, 8.5, 6.2, 2.5);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export function drawForestBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cameraX: number,
  time: number
): void {
  // 1. Warm sunlit forest sky gradient
  const skyGrad = ctx.createRadialGradient(
    width * 0.52,
    height * 0.16,
    20,
    width * 0.52,
    height * 0.35,
    Math.max(width, height) * 0.9
  );
  skyGrad.addColorStop(0, '#F7EECC');
  skyGrad.addColorStop(0.28, '#CBD9B3');
  skyGrad.addColorStop(0.62, '#6A8B6F');
  skyGrad.addColorStop(1, '#223B2B');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Distant Castle Silhouette in hazy clearing (slowest parallax)
  const castleParallax = cameraX * 0.06;
  const castleCenterX = width * 0.56 - (castleParallax % (width * 1.4)) + (castleParallax > width * 0.7 ? width * 1.4 : 0);
  drawDistantCastleSilhouette(ctx, castleCenterX, height * 0.58);

  // 3. Far Misty Tree Silhouettes
  drawTreeLayer(ctx, width, height, cameraX * 0.14, 240, '#5F7F63', '#49684E', 0.45);

  // 4. Diagonal Volumetric Sunbeams
  ctx.save();
  for (let i = 0; i < 4; i++) {
    const beamX = width * (0.2 + i * 0.22) - ((cameraX * 0.08) % 180) + Math.sin(time * 0.4 + i) * 14;
    const beamGrad = ctx.createLinearGradient(beamX, 0, beamX + 180, height * 0.85);
    beamGrad.addColorStop(0, 'rgba(255, 246, 200, 0.18)');
    beamGrad.addColorStop(0.6, 'rgba(255, 242, 185, 0.06)');
    beamGrad.addColorStop(1, 'rgba(255, 242, 185, 0)');
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(beamX - 40, 0);
    ctx.lineTo(beamX + 70, 0);
    ctx.lineTo(beamX + 270, height);
    ctx.lineTo(beamX + 80, height);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // 5. Midground Woodland Trunks & Canopy
  drawTreeLayer(ctx, width, height, cameraX * 0.3, 310, '#3D583F', '#2C4430', 0.78);

  // 6. Subtle foreground misty floor veil
  const mistGrad = ctx.createLinearGradient(0, height * 0.72, 0, height);
  mistGrad.addColorStop(0, 'rgba(24, 46, 33, 0)');
  mistGrad.addColorStop(1, 'rgba(18, 35, 25, 0.72)');
  ctx.fillStyle = mistGrad;
  ctx.fillRect(0, height * 0.72, width, height * 0.28);
}

function drawDistantCastleSilhouette(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number
): void {
  ctx.save();
  ctx.fillStyle = 'rgba(130, 155, 128, 0.42)';
  // Central keep
  ctx.fillRect(cx - 38, baseY - 115, 76, 130);
  // Central tall spire
  ctx.beginPath();
  ctx.moveTo(cx - 24, baseY - 115);
  ctx.lineTo(cx, baseY - 185);
  ctx.lineTo(cx + 24, baseY - 115);
  ctx.closePath();
  ctx.fill();
  // Left turret
  ctx.fillRect(cx - 72, baseY - 82, 34, 98);
  ctx.beginPath();
  ctx.moveTo(cx - 76, baseY - 82);
  ctx.lineTo(cx - 55, baseY - 125);
  ctx.lineTo(cx - 34, baseY - 82);
  ctx.closePath();
  ctx.fill();
  // Right turret
  ctx.fillRect(cx + 38, baseY - 90, 36, 106);
  ctx.beginPath();
  ctx.moveTo(cx + 34, baseY - 90);
  ctx.lineTo(cx + 56, baseY - 138);
  ctx.lineTo(cx + 78, baseY - 90);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawTreeLayer(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scroll: number,
  spacing: number,
  trunkColor: string,
  foliageColor: string,
  alpha: number
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  const startIdx = Math.floor(scroll / spacing) - 1;
  const count = Math.ceil(width / spacing) + 3;

  for (let i = 0; i < count; i++) {
    const idx = startIdx + i;
    const x = idx * spacing - scroll + ((idx * 73) % 55);
    const trunkWidth = 28 + Math.abs((idx * 19) % 24);

    // Trunk
    ctx.fillStyle = trunkColor;
    ctx.fillRect(x, 0, trunkWidth, height);

    // Subtle bark shadow
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(x + trunkWidth * 0.65, 0, trunkWidth * 0.35, height);

    // Overhanging leafy canopy cluster near top
    ctx.fillStyle = foliageColor;
    const canopyY = 48 + Math.abs((idx * 37) % 60);
    ctx.beginPath();
    ctx.arc(x - 12, canopyY, 44, 0, Math.PI * 2);
    ctx.arc(x + trunkWidth + 10, canopyY + 12, 48, 0, Math.PI * 2);
    ctx.arc(x + trunkWidth * 0.5, canopyY - 24, 52, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawFireflies(
  ctx: CanvasRenderingContext2D,
  fireflies: Firefly[],
  cameraX: number,
  time: number
): void {
  ctx.save();
  for (const f of fireflies) {
    const sx = f.x - cameraX * 0.65;
    if (sx < -20 || sx > ctx.canvas.width + 20) continue;
    const sy = f.baseY + Math.sin(time * f.speed + f.phase) * f.drift;
    const pulse = 0.45 + 0.55 * Math.sin(time * 2.5 + f.phase);

    ctx.fillStyle = `rgba(255, 236, 150, ${0.18 * pulse})`;
    ctx.beginPath();
    ctx.arc(sx, sy, f.radius * 3.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 248, 196, ${0.85 * pulse})`;
    ctx.beginPath();
    ctx.arc(sx, sy, f.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawPlatform(
  ctx: CanvasRenderingContext2D,
  platform: Platform
): void {
  const x = platform.currentX ?? platform.x;
  const y = platform.currentY ?? platform.y;
  const { width: w, height: h, kind = 'earth' } = platform;

  ctx.save();

  if (kind === 'timber') {
    // Vine suspension lines upward
    ctx.strokeStyle = 'rgba(42, 74, 38, 0.7)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x + 18, y);
    ctx.lineTo(x + 18, y - 160);
    ctx.moveTo(x + w - 18, y);
    ctx.lineTo(x + w - 18, y - 160);
    ctx.stroke();

    // Timber log body
    ctx.fillStyle = '#6B482F';
    ctx.strokeStyle = '#332014';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.fill();
    ctx.stroke();

    // Moss cap on timber
    ctx.fillStyle = '#5CA638';
    ctx.beginPath();
    ctx.roundRect(x + 2, y, w - 4, 10, [7, 7, 3, 3]);
    ctx.fill();

    // Grass tufts
    drawGrassTufts(ctx, x + 10, y, w - 20);
    ctx.restore();
    return;
  }

  // Earth body
  const earthGrad = ctx.createLinearGradient(0, y + 18, 0, y + h);
  earthGrad.addColorStop(0, '#4E392B');
  earthGrad.addColorStop(1, '#33241A');
  ctx.fillStyle = earthGrad;
  ctx.beginPath();
  ctx.roundRect(x, y + 8, w, h - 8, 12);
  ctx.fill();

  // Subtle oval soil pebbles
  ctx.fillStyle = 'rgba(30, 20, 14, 0.35)';
  const cols = Math.floor((w - 30) / 42);
  for (let i = 0; i < cols; i++) {
    const px = x + 26 + i * 42 + ((i % 2) * 12);
    const py = y + 48 + ((i * 19) % 24);
    if (py < y + h - 14) {
      ctx.beginPath();
      ctx.ellipse(px, py, 9, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Hanging dark green moss scallops
  ctx.fillStyle = '#4B8B2C';
  ctx.beginPath();
  ctx.roundRect(x, y + 4, w, 20, [10, 10, 4, 4]);
  ctx.fill();

  const dripStep = 28;
  const dripCount = Math.floor((w - 16) / dripStep);
  for (let i = 0; i <= dripCount; i++) {
    const dx = x + 16 + i * dripStep;
    const dripLen = 10 + ((i * 7) % 10);
    ctx.beginPath();
    ctx.roundRect(dx - 5, y + 18, 10, dripLen, 5);
    ctx.fill();
  }

  // Bright grassy top highlight rim
  ctx.fillStyle = '#6CC043';
  ctx.beginPath();
  ctx.roundRect(x, y, w, 12, [10, 10, 3, 3]);
  ctx.fill();

  // Little 'v' grass blades along top
  drawGrassTufts(ctx, x + 12, y, w - 24);

  ctx.restore();
}

function drawGrassTufts(
  ctx: CanvasRenderingContext2D,
  startX: number,
  topY: number,
  spanWidth: number
): void {
  ctx.strokeStyle = '#99DC6A';
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  const step = 22;
  for (let gx = startX; gx < startX + spanWidth; gx += step) {
    ctx.beginPath();
    ctx.moveTo(gx - 3, topY - 4);
    ctx.lineTo(gx, topY + 1);
    ctx.lineTo(gx + 3, topY - 4);
    ctx.stroke();
  }
}

export function drawAcorn(
  ctx: CanvasRenderingContext2D,
  acorn: Acorn,
  time: number
): void {
  if (acorn.collected) return;
  const bob = Math.sin(time * 3.4 + acorn.bobOffset) * 5;
  const cx = acorn.x;
  const cy = acorn.y + bob;

  ctx.save();

  // Warm golden aura glow
  const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, 28);
  glow.addColorStop(0, 'rgba(255, 224, 118, 0.72)');
  glow.addColorStop(0.55, 'rgba(242, 185, 65, 0.25)');
  glow.addColorStop(1, 'rgba(242, 185, 65, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, 28, 0, Math.PI * 2);
  ctx.fill();

  ctx.translate(cx, cy);

  // Acorn nut body
  const nutGrad = ctx.createLinearGradient(-8, -4, 8, 13);
  nutGrad.addColorStop(0, '#FFE38A');
  nutGrad.addColorStop(0.55, '#F0B23A');
  nutGrad.addColorStop(1, '#CC7E1B');
  ctx.fillStyle = nutGrad;
  ctx.strokeStyle = '#6B3D12';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-9, -2);
  ctx.quadraticCurveTo(-10, 10, 0, 14);
  ctx.quadraticCurveTo(10, 10, 9, -2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Nut highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.beginPath();
  ctx.ellipse(-3.5, 4, 2.2, 4.2, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Acorn stem
  ctx.strokeStyle = '#6B3D12';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(1.5, -14.5);
  ctx.stroke();

  // Acorn cap
  ctx.fillStyle = '#8F4D21';
  ctx.strokeStyle = '#4A250D';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-11, -2);
  ctx.quadraticCurveTo(-10, -11, 0, -11);
  ctx.quadraticCurveTo(10, -11, 11, -2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

export function drawMushroom(
  ctx: CanvasRenderingContext2D,
  mushroom: BounceMushroom
): void {
  const { x, y, width: w, height: h, bounceTimer } = mushroom;
  const squash = bounceTimer > 0 ? Math.sin(bounceTimer * Math.PI * 3) * 0.25 : 0;
  const cx = x + w / 2;
  const bottomY = y + h;

  ctx.save();
  ctx.translate(cx, bottomY);
  ctx.scale(1 + squash, 1 - squash * 0.85);

  // Stem
  ctx.fillStyle = '#EFE3C8';
  ctx.strokeStyle = '#4A3623';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.roundRect(-8, -h + 8, 16, h - 8, 4);
  ctx.fill();
  ctx.stroke();

  // Spotted cap
  const capGrad = ctx.createLinearGradient(0, -h - 4, 0, -h + 14);
  capGrad.addColorStop(0, '#E86A38');
  capGrad.addColorStop(1, '#B83D24');
  ctx.fillStyle = capGrad;
  ctx.beginPath();
  ctx.moveTo(-w / 2, -h + 13);
  ctx.quadraticCurveTo(-w / 2, -h - 4, 0, -h - 4);
  ctx.quadraticCurveTo(w / 2, -h - 4, w / 2, -h + 13);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cream spots
  ctx.fillStyle = '#FFF3D6';
  ctx.beginPath();
  ctx.arc(-9, -h + 5, 3.2, 0, Math.PI * 2);
  ctx.arc(8, -h + 6, 2.8, 0, Math.PI * 2);
  ctx.arc(0, -h + 1, 3.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawHazard(
  ctx: CanvasRenderingContext2D,
  hazard: Hazard
): void {
  const { x, y, width: w, height: h } = hazard;
  ctx.save();

  // Dark thorny vine base
  ctx.fillStyle = '#3B1E2E';
  ctx.strokeStyle = '#1E0D16';
  ctx.lineWidth = 1.6;

  const spikes = Math.max(3, Math.floor(w / 14));
  const step = w / spikes;
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  for (let i = 0; i < spikes; i++) {
    const sx = x + i * step;
    ctx.lineTo(sx + step * 0.5, y);
    ctx.lineTo(sx + step, y + h);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Crimson thorn tips for clear readability
  ctx.fillStyle = '#C94058';
  for (let i = 0; i < spikes; i++) {
    const sx = x + i * step + step * 0.5;
    ctx.beginPath();
    ctx.arc(sx, y + 3, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawCheckpoint(
  ctx: CanvasRenderingContext2D,
  cp: Checkpoint,
  time: number
): void {
  ctx.save();
  const x = cp.x;
  const y = cp.y;

  // Wooden post
  ctx.fillStyle = '#5D3D26';
  ctx.strokeStyle = '#2B1B10';
  ctx.lineWidth = 1.6;
  ctx.fillRect(x - 4, y - 54, 8, 54);
  ctx.strokeRect(x - 4, y - 54, 8, 54);

  // Crossbar
  ctx.fillRect(x - 4, y - 54, 22, 6);
  ctx.strokeRect(x - 4, y - 54, 22, 6);

  // Lantern housing
  const lx = x + 15;
  const ly = y - 42;
  if (cp.activated) {
    const pulse = 0.8 + Math.sin(time * 5) * 0.2;
    const glow = ctx.createRadialGradient(lx, ly + 4, 2, lx, ly + 4, 26);
    glow.addColorStop(0, `rgba(255, 220, 110, ${0.7 * pulse})`);
    glow.addColorStop(1, 'rgba(255, 220, 110, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(lx, ly + 4, 26, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = cp.activated ? '#FFD666' : '#6A7B6D';
  ctx.strokeStyle = '#261C14';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(lx - 6, ly - 3, 12, 15, 3);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

export function drawCastle(
  ctx: CanvasRenderingContext2D,
  castle: CastleGoal,
  time: number
): void {
  const { x, y, width: w, height: h, doorX, doorY, doorWidth, doorHeight } = castle;
  ctx.save();

  // Crenellated battlements along top
  const battlementW = 36;
  const count = Math.floor(w / (battlementW * 1.6));
  const gap = (w - count * battlementW) / (count - 1);
  ctx.fillStyle = '#B7BCAA';
  ctx.strokeStyle = '#6A7162';
  ctx.lineWidth = 2;
  for (let i = 0; i < count; i++) {
    const bx = x + i * (battlementW + gap);
    ctx.fillRect(bx, y - 24, battlementW, 28);
    ctx.strokeRect(bx, y - 24, battlementW, 28);
  }

  // Main stone castle body
  const wallGrad = ctx.createLinearGradient(x, y, x + w, y + h);
  wallGrad.addColorStop(0, '#B2B8A6');
  wallGrad.addColorStop(1, '#8C9482');
  ctx.fillStyle = wallGrad;
  ctx.strokeStyle = '#5D6556';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, [4, 4, 0, 0]);
  ctx.fill();
  ctx.stroke();

  // Subtle stone masonry lines
  ctx.strokeStyle = 'rgba(72, 80, 66, 0.22)';
  ctx.lineWidth = 1.5;
  for (let row = 1; row <= 5; row++) {
    const sy = y + row * 46;
    if (sy < y + h - 10) {
      ctx.beginPath();
      ctx.moveTo(x + 6, sy);
      ctx.lineTo(x + w - 6, sy);
      ctx.stroke();
    }
  }

  // Crimson hanging pennant banner on left side (matching screenshot 2)
  const wave = Math.sin(time * 2.5) * 3;
  ctx.fillStyle = '#C73539';
  ctx.strokeStyle = '#68191D';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(x - 10, y + 6);
  ctx.lineTo(x + 36, y + 6);
  ctx.lineTo(x + 36 + wave * 0.4, y + 84);
  ctx.lineTo(x + 13 + wave * 0.5, y + 68);
  ctx.lineTo(x - 10 + wave * 0.4, y + 84);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Dark forest archway frame
  ctx.fillStyle = '#1B3424';
  ctx.beginPath();
  ctx.roundRect(doorX - 10, doorY - 10, doorWidth + 20, doorHeight + 10, [
    (doorWidth + 20) / 2,
    (doorWidth + 20) / 2,
    0,
    0,
  ]);
  ctx.fill();

  // Arched wooden door
  const doorGrad = ctx.createLinearGradient(doorX, doorY, doorX + doorWidth, doorY);
  doorGrad.addColorStop(0, '#6E4022');
  doorGrad.addColorStop(0.5, '#593218');
  doorGrad.addColorStop(1, '#472711');
  ctx.fillStyle = doorGrad;
  ctx.beginPath();
  ctx.roundRect(doorX, doorY, doorWidth, doorHeight, [
    doorWidth / 2,
    doorWidth / 2,
    0,
    0,
  ]);
  ctx.fill();

  // Vertical wood plank seams
  ctx.strokeStyle = '#361B0A';
  ctx.lineWidth = 2;
  const planks = 4;
  for (let p = 1; p < planks; p++) {
    const px = doorX + (doorWidth / planks) * p;
    ctx.beginPath();
    ctx.moveTo(px, doorY + 14);
    ctx.lineTo(px, doorY + doorHeight);
    ctx.stroke();
  }

  // Brass doorknob
  ctx.fillStyle = '#F2C14E';
  ctx.strokeStyle = '#734F12';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(doorX + doorWidth - 20, doorY + doorHeight * 0.56, 6.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

export function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[]
): void {
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.translate(p.x, p.y);
    if (p.rotation) ctx.rotate(p.rotation);
    ctx.fillStyle = p.color;

    if (p.shape === 'leaf') {
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 1.4, p.size * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.shape === 'spark') {
      ctx.beginPath();
      ctx.moveTo(0, -p.size * 1.4);
      ctx.lineTo(p.size * 0.5, 0);
      ctx.lineTo(0, p.size * 1.4);
      ctx.lineTo(-p.size * 0.5, 0);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
