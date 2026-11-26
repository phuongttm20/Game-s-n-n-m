export type GameState =
  | 'TITLE_MENU'
  | 'PLAYING'
  | 'PAUSED'
  | 'STAGE_CLEAR'
  | 'GAME_OVER'
  | 'VICTORY';

export type AnimationPose = 'idle' | 'run' | 'jump' | 'fall' | 'celebrate';

export interface Platform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  kind?: 'earth' | 'timber';
  moveX?: number;
  moveY?: number;
  speed?: number;
  phase?: number;
  // Runtime computed positions
  currentX?: number;
  currentY?: number;
  prevX?: number;
  prevY?: number;
}

export interface Acorn {
  id: string;
  x: number;
  y: number;
  collected: boolean;
  bobOffset: number;
}

export interface BounceMushroom {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  bounceTimer: number;
}

export interface Hazard {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Checkpoint {
  id: string;
  x: number;
  y: number;
  activated: boolean;
}

export interface CastleGoal {
  x: number;
  y: number;
  width: number;
  height: number;
  doorX: number;
  doorY: number;
  doorWidth: number;
  doorHeight: number;
}

export interface LevelDefinition {
  id: number;
  name: string;
  subtitle: string;
  worldWidth: number;
  worldHeight: number;
  spawn: { x: number; y: number };
  platforms: Omit<Platform, 'currentX' | 'currentY' | 'prevX' | 'prevY'>[];
  acorns: Omit<Acorn, 'collected' | 'bobOffset'>[];
  mushrooms: Omit<BounceMushroom, 'bounceTimer'>[];
  hazards: Hazard[];
  checkpoints: Omit<Checkpoint, 'activated'>[];
  castle: CastleGoal;
}

export interface PlayerState {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  onGround: boolean;
  coyoteTimer: number;
  jumpBufferTimer: number;
  pose: AnimationPose;
  animTime: number;
  squashX: number;
  squashY: number;
  invulnTimer: number;
  swordSwingTimer: number;
  standingPlatformId: string | null;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  gravity?: number;
  shape?: 'circle' | 'leaf' | 'spark';
  rotation?: number;
  vr?: number;
}

export interface Firefly {
  x: number;
  y: number;
  baseY: number;
  radius: number;
  phase: number;
  speed: number;
  drift: number;
}

export interface HudSnapshot {
  acornsCollected: number;
  totalAcorns: number;
  hearts: number;
  maxHearts: number;
  progress: number;
  stageIndex: number;
  totalStages: number;
  stageName: string;
  elapsedSeconds: number;
}
