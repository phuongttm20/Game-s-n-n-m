import { useEffect, useRef } from 'react';
import { drawBramble } from '../game/renderer';
import { AnimationPose } from '../game/types';

interface BramblePreviewCanvasProps {
  pose: AnimationPose;
  withForestBackdrop?: boolean;
}

export function BramblePreviewCanvas({
  pose,
  withForestBackdrop = true,
}: BramblePreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let rafId = 0;
    const startTime = performance.now();

    const renderFrame = (now: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = 148;
      const cssH = 124;

      if (canvas.width !== cssW * dpr || canvas.height !== cssH * dpr) {
        canvas.width = cssW * dpr;
        canvas.height = cssH * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, cssW, cssH);

      const elapsed = prefersReduced ? 0.35 : (now - startTime) / 1000;

      if (withForestBackdrop) {
        const bg = ctx.createLinearGradient(0, 0, 0, cssH);
        bg.addColorStop(0, '#D4E0BD');
        bg.addColorStop(0.65, '#668769');
        bg.addColorStop(1, '#2D4A35');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, cssW, cssH);

        // Soft distant tree trunks
        ctx.fillStyle = 'rgba(40, 66, 46, 0.35)';
        ctx.fillRect(14, 0, 14, cssH);
        ctx.fillRect(108, 0, 18, cssH);

        // Grassy shelf
        ctx.fillStyle = '#4B8B2C';
        ctx.fillRect(0, cssH - 22, cssW, 22);
        ctx.fillStyle = '#6CC043';
        ctx.fillRect(0, cssH - 22, cssW, 7);
      } else {
        const bg = ctx.createLinearGradient(0, 0, 0, cssH);
        bg.addColorStop(0, '#E7E4DA');
        bg.addColorStop(1, '#D3D0C4');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, cssW, cssH);
      }

      const jumpArc =
        pose === 'jump' ? Math.abs(Math.sin(elapsed * 2.8)) * -24 : 0;
      const baseY = withForestBackdrop ? cssH - 22 + jumpArc : cssH - 20 + jumpArc;

      // Ground shadow
      ctx.fillStyle = 'rgba(18, 32, 22, 0.24)';
      ctx.beginPath();
      ctx.ellipse(
        cssW / 2,
        withForestBackdrop ? cssH - 19 : cssH - 17,
        pose === 'jump' ? 14 : 20,
        4.5,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      drawBramble(ctx, {
        x: cssW / 2 + 2,
        y: baseY,
        facing: 1,
        pose,
        animTime: elapsed,
        vx: pose === 'run' ? 280 : 0,
        scale: 1.32,
      });

      ctx.restore();

      if (!prefersReduced) {
        rafId = requestAnimationFrame(renderFrame);
      }
    };

    rafId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(rafId);
  }, [pose, withForestBackdrop]);

  return (
    <canvas
      ref={canvasRef}
      className="w-[148px] h-[124px] rounded-xl block"
      aria-label={`Bramble ${pose} animation preview`}
    />
  );
}
