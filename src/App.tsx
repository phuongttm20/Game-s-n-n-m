import { onAuthStateChanged, User } from 'firebase/auth';
import { useCallback, useEffect, useRef, useState } from 'react';
import { GameHUD } from './components/GameHUD';
import { GameModals } from './components/GameModals';
import {
  auth,
  loadOrCreatePlayerProgress,
  savePlayerProgress,
  signInWithGoogle,
  signOutPlayer,
} from './firebase';
import { LEVELS } from './game/levels';
import {
  drawAcorn,
  drawBramble,
  drawCastle,
  drawCheckpoint,
  drawFireflies,
  drawForestBackground,
  drawMushroom,
  drawParticles,
  drawPlatform,
  drawHazard,
} from './game/renderer';
import { soundEngine } from './game/sound';
import {
  Acorn,
  BounceMushroom,
  Checkpoint,
  Firefly,
  GameState,
  HudSnapshot,
  LevelDefinition,
  Particle,
  Platform,
  PlayerState,
} from './game/types';

const WORLD_HEIGHT = 720;
const GRAVITY = 1950;
const MOVE_SPEED = 310;
const JUMP_VELOCITY = -745;
const BOUNCE_VELOCITY = -1020;
const MAX_FALL_SPEED = 980;
const COYOTE_TIME = 0.11;
const JUMP_BUFFER_TIME = 0.13;
const MAX_HEARTS = 3;

interface RuntimeWorld {
  level: LevelDefinition;
  platforms: Platform[];
  acorns: Acorn[];
  mushrooms: BounceMushroom[];
  checkpoints: Checkpoint[];
  player: PlayerState;
  particles: Particle[];
  fireflies: Firefly[];
  respawnPoint: { x: number; y: number };
  hearts: number;
  acornCombo: number;
  elapsedSeconds: number;
  cameraX: number;
  time: number;
  celebratingTimer: number;
}

function createFireflies(worldWidth: number): Firefly[] {
  const list: Firefly[] = [];
  const count = Math.floor(worldWidth / 75);
  for (let i = 0; i < count; i++) {
    const baseY = 90 + ((i * 97) % 460);
    list.push({
      x: (i * 83) % worldWidth,
      y: baseY,
      baseY,
      radius: 1.8 + (i % 3) * 0.7,
      phase: i * 0.9,
      speed: 0.9 + (i % 4) * 0.35,
      drift: 12 + (i % 5) * 4,
    });
  }
  return list;
}

function buildRuntimeWorld(level: LevelDefinition): RuntimeWorld {
  return {
    level,
    platforms: level.platforms.map((p) => ({
      ...p,
      currentX: p.x,
      currentY: p.y,
      prevX: p.x,
      prevY: p.y,
    })),
    acorns: level.acorns.map((a, i) => ({
      ...a,
      collected: false,
      bobOffset: i * 0.7,
    })),
    mushrooms: level.mushrooms.map((m) => ({
      ...m,
      bounceTimer: 0,
    })),
    checkpoints: level.checkpoints.map((c) => ({
      ...c,
      activated: false,
    })),
    player: {
      x: level.spawn.x,
      y: level.spawn.y,
      width: 34,
      height: 44,
      vx: 0,
      vy: 0,
      facing: 1,
      onGround: false,
      coyoteTimer: 0,
      jumpBufferTimer: 0,
      pose: 'idle',
      animTime: 0,
      squashX: 1,
      squashY: 1,
      invulnTimer: 0,
      swordSwingTimer: 0,
      standingPlatformId: null,
    },
    particles: [],
    fireflies: createFireflies(level.worldWidth),
    respawnPoint: { ...level.spawn },
    hearts: MAX_HEARTS,
    acornCombo: 0,
    elapsedSeconds: 0,
    cameraX: 0,
    time: 0,
    celebratingTimer: 0,
  };
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const gameStateRef = useRef<GameState>('TITLE_MENU');

  const [selectedStage, setSelectedStage] = useState<number>(0);
  const stageIndexRef = useRef<number>(0);

  const [muted, setMuted] = useState<boolean>(false);
  const [showTouchControls, setShowTouchControls] = useState<boolean>(true);
  const [stageAcornScores, setStageAcornScores] = useState<[number, number, number]>([
    0, 0, 0,
  ]);
  const stageAcornScoresRef = useRef<[number, number, number]>([0, 0, 0]);
  const highestStageUnlockedRef = useRef<number>(0);

  const [user, setUser] = useState<User | null>(null);
  const userRef = useRef<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const worldRef = useRef<RuntimeWorld>(buildRuntimeWorld(LEVELS[0]));

  const [hud, setHud] = useState<HudSnapshot>({
    acornsCollected: 0,
    totalAcorns: LEVELS[0].acorns.length,
    hearts: MAX_HEARTS,
    maxHearts: MAX_HEARTS,
    progress: 0,
    stageIndex: 0,
    totalStages: LEVELS.length,
    stageName: LEVELS[0].name,
    elapsedSeconds: 0,
  });

  const inputRef = useRef({
    left: false,
    right: false,
    jumpHeld: false,
    jumpJustPressed: false,
  });

  const setStateSynced = useCallback((next: GameState) => {
    gameStateRef.current = next;
    setGameState(next);
  }, []);

  const syncHudFromWorld = useCallback((w: RuntimeWorld, idx: number) => {
    const collected = w.acorns.filter((a) => a.collected).length;
    const progress = Math.max(
      0,
      Math.min(1, w.player.x / Math.max(1, w.level.castle.doorX))
    );
    setHud({
      acornsCollected: collected,
      totalAcorns: w.acorns.length,
      hearts: w.hearts,
      maxHearts: MAX_HEARTS,
      progress,
      stageIndex: idx,
      totalStages: LEVELS.length,
      stageName: w.level.name,
      elapsedSeconds: w.elapsedSeconds,
    });
  }, []);

  const loadStage = useCallback(
    (idx: number, nextState: GameState) => {
      const safeIdx = Math.max(0, Math.min(LEVELS.length - 1, idx));
      stageIndexRef.current = safeIdx;
      setSelectedStage(safeIdx);
      const fresh = buildRuntimeWorld(LEVELS[safeIdx]);
      worldRef.current = fresh;
      inputRef.current = {
        left: false,
        right: false,
        jumpHeld: false,
        jumpJustPressed: false,
      };
      syncHudFromWorld(fresh, safeIdx);
      setStateSynced(nextState);
    },
    [setStateSynced, syncHudFromWorld]
  );

  const handleStartGame = useCallback(() => {
    if (!userRef.current) return;
    soundEngine.unlock();
    loadStage(selectedStage, 'PLAYING');
  }, [loadStage, selectedStage]);

  const handleRestartStage = useCallback(() => {
    if (!userRef.current) {
      setStateSynced('TITLE_MENU');
      return;
    }
    soundEngine.unlock();
    loadStage(stageIndexRef.current, 'PLAYING');
  }, [loadStage, setStateSynced]);

  const handleNextStage = useCallback(() => {
    if (!userRef.current) {
      setStateSynced('TITLE_MENU');
      return;
    }
    soundEngine.unlock();
    const nextIdx = stageIndexRef.current + 1;
    if (nextIdx < LEVELS.length) {
      loadStage(nextIdx, 'PLAYING');
    } else {
      setStateSynced('VICTORY');
    }
  }, [loadStage, setStateSynced]);

  const handleBackToTitle = useCallback(() => {
    loadStage(stageIndexRef.current, 'TITLE_MENU');
  }, [loadStage]);

  const handleGoogleSignIn = useCallback(async () => {
    setAuthError(null);
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      const message =
        err instanceof Error && err.message.includes('popup-closed-by-user')
          ? 'Bạn đã đóng cửa sổ đăng nhập Google. Vui lòng thử lại.'
          : 'Không thể đăng nhập bằng Google. Vui lòng cho phép popup và thử lại.';
      setAuthError(message);
    } finally {
      setIsSigningIn(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOutPlayer();
    setStateSynced('TITLE_MENU');
  }, [setStateSynced]);

  // Listen to Firebase Auth state & load user progress from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      userRef.current = nextUser;
      setUser(nextUser);
      setAuthReady(true);

      if (!nextUser) {
        const emptyScores: [number, number, number] = [0, 0, 0];
        stageAcornScoresRef.current = emptyScores;
        highestStageUnlockedRef.current = 0;
        setStageAcornScores(emptyScores);
        setStateSynced('TITLE_MENU');
        return;
      }

      try {
        const progress = await loadOrCreatePlayerProgress(nextUser);
        stageAcornScoresRef.current = progress.bestStageAcorns;
        highestStageUnlockedRef.current = progress.highestStageUnlocked;
        setStageAcornScores(progress.bestStageAcorns);
      } catch (err) {
        console.error('Failed to load player progress:', err);
      }
    });

    return () => unsubscribe();
  }, [setStateSynced]);

  const handleToggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      soundEngine.setMuted(next);
      return next;
    });
  }, []);

  const triggerJumpPress = useCallback(() => {
    soundEngine.unlock();
    inputRef.current.jumpHeld = true;
    inputRef.current.jumpJustPressed = true;
  }, []);

  const triggerJumpRelease = useCallback(() => {
    inputRef.current.jumpHeld = false;
  }, []);

  // Keyboard bindings
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        inputRef.current.left = true;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        inputRef.current.right = true;
      } else if (
        e.code === 'Space' ||
        e.code === 'ArrowUp' ||
        e.code === 'KeyW'
      ) {
        if (gameStateRef.current === 'PLAYING') {
          e.preventDefault();
          if (!e.repeat) {
            triggerJumpPress();
          }
        }
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        if (gameStateRef.current === 'PLAYING') {
          setStateSynced('PAUSED');
        } else if (gameStateRef.current === 'PAUSED') {
          setStateSynced('PLAYING');
        }
      } else if (e.code === 'KeyR') {
        if (
          gameStateRef.current === 'PLAYING' ||
          gameStateRef.current === 'PAUSED'
        ) {
          handleRestartStage();
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        inputRef.current.left = false;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        inputRef.current.right = false;
      } else if (
        e.code === 'Space' ||
        e.code === 'ArrowUp' ||
        e.code === 'KeyW'
      ) {
        triggerJumpRelease();
      }
    };

    const onBlur = () => {
      inputRef.current.left = false;
      inputRef.current.right = false;
      inputRef.current.jumpHeld = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [handleRestartStage, setStateSynced, triggerJumpPress, triggerJumpRelease]);

  // Main 60fps Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let lastTime = performance.now();
    let hudSyncAccumulator = 0;

    const spawnBurst = (
      w: RuntimeWorld,
      x: number,
      y: number,
      count: number,
      colors: string[],
      shape: Particle['shape'] = 'circle',
      speedScale = 1
    ) => {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
        const speed = (65 + Math.random() * 140) * speedScale;
        w.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 60,
          size: 2.5 + Math.random() * 3.5,
          color: colors[i % colors.length],
          alpha: 1,
          life: 0,
          maxLife: 0.45 + Math.random() * 0.35,
          gravity: 340,
          shape,
          rotation: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 8,
        });
      }
    };

    const hurtOrRespawn = (w: RuntimeWorld) => {
      if (w.player.invulnTimer > 0) return;
      soundEngine.playHurt();
      w.hearts -= 1;
      spawnBurst(
        w,
        w.player.x + w.player.width / 2,
        w.player.y + w.player.height / 2,
        12,
        ['#D94A48', '#F2E0A8', '#70B844'],
        'leaf'
      );

      if (w.hearts <= 0) {
        syncHudFromWorld(w, stageIndexRef.current);
        setStateSynced('GAME_OVER');
        return;
      }

      w.player.x = w.respawnPoint.x;
      w.player.y = w.respawnPoint.y - 12;
      w.player.vx = 0;
      w.player.vy = 0;
      w.player.onGround = false;
      w.player.invulnTimer = 1.4;
      w.player.standingPlatformId = null;
      syncHudFromWorld(w, stageIndexRef.current);
    };

    const stepPhysics = (w: RuntimeWorld, dt: number) => {
      w.time += dt;

      // Update moving platforms
      for (const plat of w.platforms) {
        plat.prevX = plat.currentX ?? plat.x;
        plat.prevY = plat.currentY ?? plat.y;
        const phase = plat.phase ?? 0;
        const speed = plat.speed ?? 1.5;
        plat.currentX =
          plat.x + (plat.moveX ? Math.sin(w.time * speed + phase) * plat.moveX : 0);
        plat.currentY =
          plat.y + (plat.moveY ? Math.sin(w.time * speed + phase) * plat.moveY : 0);
      }

      // If celebrating at castle door, animate celebration before showing modal
      if (w.celebratingTimer > 0) {
        w.celebratingTimer -= dt;
        w.player.pose = 'celebrate';
        w.player.animTime += dt;
        if (w.celebratingTimer <= 0) {
          const collected = w.acorns.filter((a) => a.collected).length;
          const idx = stageIndexRef.current;
          const nextUnlocked = Math.max(
            highestStageUnlockedRef.current,
            Math.min(LEVELS.length - 1, idx + 1)
          );
          highestStageUnlockedRef.current = nextUnlocked;

          const prevScores = stageAcornScoresRef.current;
          const updated: [number, number, number] = [
            prevScores[0] ?? 0,
            prevScores[1] ?? 0,
            prevScores[2] ?? 0,
          ];
          updated[idx] = Math.max(updated[idx], collected);
          stageAcornScoresRef.current = updated;
          setStageAcornScores(updated);

          if (userRef.current) {
            void savePlayerProgress(userRef.current, {
              bestStageAcorns: updated,
              highestStageUnlocked: nextUnlocked,
            }).catch((err) => {
              console.error('Failed to save player progress:', err);
            });
          }

          syncHudFromWorld(w, idx);
          if (idx >= LEVELS.length - 1) {
            setStateSynced('VICTORY');
          } else {
            setStateSynced('STAGE_CLEAR');
          }
        }
        return;
      }

      w.elapsedSeconds += dt;
      const p = w.player;
      p.animTime += dt;
      if (p.invulnTimer > 0) p.invulnTimer = Math.max(0, p.invulnTimer - dt);

      // Carry player with standing moving platform
      if (p.onGround && p.standingPlatformId) {
        const plat = w.platforms.find((pl) => pl.id === p.standingPlatformId);
        if (plat) {
          const dx = (plat.currentX ?? plat.x) - (plat.prevX ?? plat.x);
          const dy = (plat.currentY ?? plat.y) - (plat.prevY ?? plat.y);
          p.x += dx;
          p.y += dy;
        }
      }

      // Horizontal input
      const dir = (inputRef.current.right ? 1 : 0) - (inputRef.current.left ? 1 : 0);
      const targetVx = dir * MOVE_SPEED;
      const accel = p.onGround ? 2400 : 1650;
      if (p.vx < targetVx) {
        p.vx = Math.min(targetVx, p.vx + accel * dt);
      } else if (p.vx > targetVx) {
        p.vx = Math.max(targetVx, p.vx - accel * dt);
      }
      if (dir !== 0) {
        p.facing = dir > 0 ? 1 : -1;
      }

      // Timers for Coyote Time & Jump Buffer
      if (p.onGround) {
        p.coyoteTimer = COYOTE_TIME;
      } else {
        p.coyoteTimer = Math.max(0, p.coyoteTimer - dt);
      }

      if (inputRef.current.jumpJustPressed) {
        p.jumpBufferTimer = JUMP_BUFFER_TIME;
        inputRef.current.jumpJustPressed = false;
      } else {
        p.jumpBufferTimer = Math.max(0, p.jumpBufferTimer - dt);
      }

      // Execute Jump
      if (p.jumpBufferTimer > 0 && p.coyoteTimer > 0) {
        p.vy = JUMP_VELOCITY;
        p.onGround = false;
        p.coyoteTimer = 0;
        p.jumpBufferTimer = 0;
        p.standingPlatformId = null;
        p.squashX = 0.84;
        p.squashY = 1.18;
        soundEngine.playJump();
        spawnBurst(
          w,
          p.x + p.width / 2,
          p.y + p.height,
          5,
          ['#DDE7CC', '#70B844'],
          'circle',
          0.55
        );
      }

      // Variable jump height when button released early
      if (!inputRef.current.jumpHeld && p.vy < -220) {
        p.vy += GRAVITY * 1.45 * dt;
      }

      // Gravity
      p.vy = Math.min(MAX_FALL_SPEED, p.vy + GRAVITY * dt);

      // Horizontal integration + world bounds
      p.x += p.vx * dt;
      if (p.x < 8) {
        p.x = 8;
        p.vx = 0;
      }
      if (p.x + p.width > w.level.worldWidth - 8) {
        p.x = w.level.worldWidth - 8 - p.width;
        p.vx = 0;
      }

      // Horizontal collision against solid earth platforms
      for (const plat of w.platforms) {
        if (plat.kind === 'timber') continue;
        const px = plat.currentX ?? plat.x;
        const py = plat.currentY ?? plat.y;
        if (
          p.x < px + plat.width &&
          p.x + p.width > px &&
          p.y + 6 < py + plat.height &&
          p.y + p.height - 6 > py
        ) {
          if (p.vx > 0) {
            p.x = px - p.width;
            p.vx = 0;
          } else if (p.vx < 0) {
            p.x = px + plat.width;
            p.vx = 0;
          }
        }
      }

      // Vertical integration + one-way / solid top landing
      const wasOnGround = p.onGround;
      const prevBottom = p.y + p.height;
      p.y += p.vy * dt;
      p.onGround = false;
      p.standingPlatformId = null;

      for (const plat of w.platforms) {
        const px = plat.currentX ?? plat.x;
        const py = plat.currentY ?? plat.y;
        const horizOverlap = p.x + p.width - 4 > px && p.x + 4 < px + plat.width;

        if (!horizOverlap) continue;

        // Landing on top surface
        if (
          p.vy >= 0 &&
          prevBottom <= py + 14 &&
          p.y + p.height >= py
        ) {
          p.y = py - p.height;
          if (!wasOnGround && p.vy > 180) {
            p.squashX = 1.18;
            p.squashY = 0.84;
            soundEngine.playLand();
            spawnBurst(
              w,
              p.x + p.width / 2,
              p.y + p.height,
              4,
              ['#82C656', '#C8B899'],
              'circle',
              0.4
            );
          }
          p.vy = 0;
          p.onGround = true;
          p.standingPlatformId = plat.id;
        } else if (
          plat.kind !== 'timber' &&
          p.vy < 0 &&
          p.y <= py + plat.height &&
          p.y + p.height > py + plat.height
        ) {
          // Bonk underside of thick earth platforms
          p.y = py + plat.height;
          p.vy = 0;
        }
      }

      // Recover squash & stretch smoothly
      p.squashX += (1 - p.squashX) * Math.min(1, dt * 14);
      p.squashY += (1 - p.squashY) * Math.min(1, dt * 14);

      // Update animation pose
      if (!p.onGround) {
        p.pose = p.vy < 40 ? 'jump' : 'fall';
      } else if (Math.abs(p.vx) > 22) {
        p.pose = 'run';
      } else {
        p.pose = 'idle';
      }

      // Bounce Mushrooms
      for (const m of w.mushrooms) {
        if (m.bounceTimer > 0) {
          m.bounceTimer = Math.max(0, m.bounceTimer - dt * 2.2);
        }
        const hitX = p.x + p.width > m.x && p.x < m.x + m.width;
        const hitY = p.y + p.height >= m.y && p.y + p.height <= m.y + m.height + 16;
        if (hitX && hitY && p.vy >= -40) {
          p.vy = BOUNCE_VELOCITY;
          p.onGround = false;
          p.standingPlatformId = null;
          p.squashX = 0.78;
          p.squashY = 1.24;
          m.bounceTimer = 1;
          soundEngine.playBounce();
          spawnBurst(
            w,
            m.x + m.width / 2,
            m.y,
            8,
            ['#F5C557', '#E86A38', '#FFF3D6'],
            'spark',
            0.8
          );
        }
      }

      // Collect Acorns
      const pcx = p.x + p.width / 2;
      const pcy = p.y + p.height / 2;
      for (const acorn of w.acorns) {
        if (acorn.collected) continue;
        const dx = pcx - acorn.x;
        const dy = pcy - acorn.y;
        if (dx * dx + dy * dy < 32 * 32) {
          acorn.collected = true;
          soundEngine.playAcorn(w.acornCombo);
          w.acornCombo += 1;
          spawnBurst(
            w,
            acorn.x,
            acorn.y,
            10,
            ['#FFE38A', '#F5C557', '#FFFFFF'],
            'spark',
            0.9
          );
          syncHudFromWorld(w, stageIndexRef.current);
        }
      }

      // Checkpoints
      for (const cp of w.checkpoints) {
        if (!cp.activated && Math.abs(pcx - cp.x) < 34 && Math.abs(p.y + p.height - cp.y) < 60) {
          cp.activated = true;
          w.respawnPoint = { x: cp.x - p.width / 2, y: cp.y - p.height };
          soundEngine.playCheckpoint();
          spawnBurst(
            w,
            cp.x + 15,
            cp.y - 38,
            12,
            ['#FFD666', '#FFF3C4', '#82C656'],
            'spark',
            0.85
          );
        }
      }

      // Thorny Bramble Hazards
      for (const hz of w.level.hazards) {
        if (
          p.x + p.width - 6 > hz.x &&
          p.x + 6 < hz.x + hz.width &&
          p.y + p.height - 2 > hz.y + 4 &&
          p.y < hz.y + hz.height
        ) {
          hurtOrRespawn(w);
          break;
        }
      }

      // Pitfall check
      if (p.y > WORLD_HEIGHT + 90) {
        hurtOrRespawn(w);
      }

      // Castle Door Goal check
      const door = w.level.castle;
      if (
        p.x + p.width > door.doorX + 12 &&
        p.x < door.doorX + door.doorWidth - 12 &&
        p.y + p.height >= door.doorY + 20
      ) {
        w.celebratingTimer = 1.05;
        p.vx = 0;
        p.vy = 0;
        soundEngine.playVictory();
        spawnBurst(
          w,
          door.doorX + door.doorWidth / 2,
          door.doorY + door.doorHeight * 0.4,
          24,
          ['#F5C557', '#C83E3B', '#70B844', '#FFF3C4'],
          'leaf',
          1.35
        );
      }
    };

    const stepParticles = (w: RuntimeWorld, dt: number) => {
      for (let i = w.particles.length - 1; i >= 0; i--) {
        const pt = w.particles[i];
        pt.life += dt;
        if (pt.life >= pt.maxLife) {
          w.particles.splice(i, 1);
          continue;
        }
        pt.vy += (pt.gravity ?? 0) * dt;
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        if (pt.rotation !== undefined && pt.vr !== undefined) {
          pt.rotation += pt.vr * dt;
        }
        pt.alpha = 1 - pt.life / pt.maxLife;
      }
    };

    const loop = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(0.035, Math.max(0.001, rawDt));

      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetW = Math.max(1, Math.floor(rect.width * dpr));
      const targetH = Math.max(1, Math.floor(rect.height * dpr));

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      const w = worldRef.current;
      const state = gameStateRef.current;

      if (state === 'PLAYING') {
        stepPhysics(w, dt);
        stepParticles(w, dt);
        hudSyncAccumulator += dt;
        if (hudSyncAccumulator >= 0.08) {
          hudSyncAccumulator = 0;
          syncHudFromWorld(w, stageIndexRef.current);
        }
      } else if (state === 'TITLE_MENU') {
        // Gentle idle backdrop motion on Title Screen
        w.time += dt;
        w.cameraX = (Math.sin(w.time * 0.12) + 1) * 220;
      } else {
        // Keep fireflies and particles softly settling
        w.time += dt * 0.4;
        stepParticles(w, dt * 0.5);
      }

      // Compute camera projection
      const cssW = rect.width;
      const cssH = rect.height;
      const worldScale = cssH / WORLD_HEIGHT;
      const visibleWorldW = cssW / Math.max(0.25, worldScale);

      if (state === 'PLAYING') {
        const targetCamX = Math.max(
          0,
          Math.min(
            w.level.worldWidth - visibleWorldW,
            w.player.x - visibleWorldW * 0.36
          )
        );
        w.cameraX += (targetCamX - w.cameraX) * Math.min(1, dt * 7.5);
      }

      // Draw frame
      ctx.save();
      ctx.scale(dpr, dpr);

      // 1. Forest Background in CSS pixels
      drawForestBackground(ctx, cssW, cssH, w.cameraX, w.time);
      drawFireflies(ctx, w.fireflies, w.cameraX, w.time);

      // 2. World Layer scaled cleanly to WORLD_HEIGHT
      ctx.save();
      ctx.scale(worldScale, worldScale);
      ctx.translate(-w.cameraX, 0);

      // Castle behind platforms/character
      drawCastle(ctx, w.level.castle, w.time);

      // Platforms
      for (const plat of w.platforms) {
        const px = plat.currentX ?? plat.x;
        if (px + plat.width < w.cameraX - 80 || px > w.cameraX + visibleWorldW + 80) {
          continue;
        }
        drawPlatform(ctx, plat);
      }

      // Checkpoints
      for (const cp of w.checkpoints) {
        drawCheckpoint(ctx, cp, w.time);
      }

      // Hazards
      for (const hz of w.level.hazards) {
        drawHazard(ctx, hz);
      }

      // Mushrooms
      for (const m of w.mushrooms) {
        drawMushroom(ctx, m);
      }

      // Golden Acorns
      for (const acorn of w.acorns) {
        drawAcorn(ctx, acorn, w.time);
      }

      // Bramble Character (blink softly during invulnerability)
      if (state !== 'TITLE_MENU') {
        const invulnBlink =
          w.player.invulnTimer > 0 && Math.floor(w.time * 16) % 2 === 0;
        drawBramble(ctx, {
          x: w.player.x + w.player.width / 2,
          y: w.player.y + w.player.height,
          facing: w.player.facing,
          pose: w.player.pose,
          animTime: w.player.animTime,
          vx: w.player.vx,
          vy: w.player.vy,
          squashX: w.player.squashX,
          squashY: w.player.squashY,
          scale: 1.32,
          alpha: invulnBlink ? 0.45 : 1,
        });
      }

      // Particles
      drawParticles(ctx, w.particles);

      ctx.restore();
      ctx.restore();

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [setStateSynced, syncHudFromWorld]);

  const totalAcornsAllStages = stageAcornScores.reduce((acc, v) => acc + v, 0);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#132219]">
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        aria-label="Bramble: The Mosswood Trail game canvas"
      />

      {gameState === 'PLAYING' && user && (
        <GameHUD
          hud={hud}
          muted={muted}
          showTouchControls={showTouchControls}
          onToggleMute={handleToggleMute}
          onToggleTouchControls={() => setShowTouchControls((v) => !v)}
          onPause={() => setStateSynced('PAUSED')}
          onRestart={handleRestartStage}
          onMoveLeftStart={() => {
            soundEngine.unlock();
            inputRef.current.left = true;
          }}
          onMoveLeftEnd={() => {
            inputRef.current.left = false;
          }}
          onMoveRightStart={() => {
            soundEngine.unlock();
            inputRef.current.right = true;
          }}
          onMoveRightEnd={() => {
            inputRef.current.right = false;
          }}
          onJumpStart={triggerJumpPress}
          onJumpEnd={triggerJumpRelease}
        />
      )}

      <GameModals
        gameState={gameState}
        hud={hud}
        selectedStage={selectedStage}
        totalAcornsAllStages={totalAcornsAllStages}
        bestStageAcorns={stageAcornScores}
        user={user}
        authReady={authReady}
        isSigningIn={isSigningIn}
        authError={authError}
        onGoogleSignIn={handleGoogleSignIn}
        onSignOut={handleSignOut}
        onSelectStage={(idx) => loadStage(idx, 'TITLE_MENU')}
        onStartGame={handleStartGame}
        onResume={() => setStateSynced('PLAYING')}
        onRestartStage={handleRestartStage}
        onNextStage={handleNextStage}
        onBackToTitle={handleBackToTitle}
      />
    </main>
  );
}
