import {
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Heart,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { HudSnapshot } from '../game/types';

interface GameHUDProps {
  hud: HudSnapshot;
  muted: boolean;
  showTouchControls: boolean;
  onToggleMute: () => void;
  onToggleTouchControls: () => void;
  onPause: () => void;
  onRestart: () => void;
  onMoveLeftStart: () => void;
  onMoveLeftEnd: () => void;
  onMoveRightStart: () => void;
  onMoveRightEnd: () => void;
  onJumpStart: () => void;
  onJumpEnd: () => void;
}

export function GameHUD({
  hud,
  muted,
  showTouchControls,
  onToggleMute,
  onToggleTouchControls,
  onPause,
  onRestart,
  onMoveLeftStart,
  onMoveLeftEnd,
  onMoveRightStart,
  onMoveRightEnd,
  onJumpStart,
  onJumpEnd,
}: GameHUDProps) {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 sm:p-5">
      {/* Top HUD Bar */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Acorn Counter, Hearts, Stage */}
          <div className="pointer-events-auto flex flex-wrap items-center gap-4 bg-[#172A1E]/85 backdrop-blur-md border border-[#F2E0A8]/15 rounded-xl px-4 py-2 shadow-lg">
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-3.5 h-4 rounded-b-full rounded-t-sm bg-gradient-to-b from-[#F5C557] to-[#CC7E1B] border-t-4 border-[#7E3910] shrink-0"
                aria-hidden="true"
              />
              <span className="text-xs sm:text-sm font-semibold tracking-wider text-[#F7EFD8] tabular-nums whitespace-nowrap">
                ACORNS {hud.acornsCollected} / {hud.totalAcorns}
              </span>
            </div>

            <span className="text-[#F2E0A8]/25 select-none" aria-hidden="true">
              ·
            </span>

            <div
              className="flex items-center gap-1.5"
              aria-label={`Health: ${hud.hearts} of ${hud.maxHearts} hearts`}
            >
              {Array.from({ length: hud.maxHearts }).map((_, idx) => {
                const active = idx < hud.hearts;
                return (
                  <Heart
                    key={idx}
                    className={`w-4 h-4 transition-transform duration-150 ${
                      active
                        ? 'fill-[#D94A48] text-[#D94A48] scale-100'
                        : 'fill-transparent text-[#F7EFD8]/25 scale-90'
                    }`}
                  />
                );
              })}
              <span className="ml-1 text-xs font-medium text-[#D5E0CA] tabular-nums">
                {hud.hearts}/{hud.maxHearts}
              </span>
            </div>

            <span className="hidden md:inline text-[#F2E0A8]/25 select-none" aria-hidden="true">
              ·
            </span>

            <span className="hidden md:inline text-xs font-medium text-[#CFE0C3] whitespace-nowrap">
              Stage {hud.stageIndex + 1} of {hud.totalStages}: {hud.stageName}
            </span>
          </div>

          {/* Right: Action Controls */}
          <div className="pointer-events-auto flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onToggleTouchControls}
              title={showTouchControls ? 'Hide on-screen buttons' : 'Show on-screen buttons'}
              aria-label={showTouchControls ? 'Hide on-screen buttons' : 'Show on-screen buttons'}
              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C557] ${
                showTouchControls
                  ? 'bg-[#2C4B35]/90 border-[#F5C557]/50 text-[#F5C557]'
                  : 'bg-[#172A1E]/85 border-[#F2E0A8]/15 text-[#E5EBD9] hover:bg-[#233D2C]'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onToggleMute}
              title={muted ? 'Unmute audio' : 'Mute audio'}
              aria-label={muted ? 'Unmute audio' : 'Mute audio'}
              className="w-10 h-10 rounded-xl bg-[#172A1E]/85 border border-[#F2E0A8]/15 text-[#E5EBD9] hover:bg-[#233D2C] flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C557]"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onRestart}
              title="Restart stage (R)"
              aria-label="Restart stage"
              className="w-10 h-10 rounded-xl bg-[#172A1E]/85 border border-[#F2E0A8]/15 text-[#E5EBD9] hover:bg-[#233D2C] flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C557]"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onPause}
              title="Pause game (P)"
              aria-label="Pause game"
              className="w-10 h-10 rounded-xl bg-[#172A1E]/85 border border-[#F2E0A8]/15 text-[#E5EBD9] hover:bg-[#233D2C] flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C557]"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Trail Progress Bar */}
        <div className="w-full max-w-md mx-auto">
          <div className="h-1.5 w-full rounded-full bg-[#132219]/60 overflow-hidden border border-[#F2E0A8]/10">
            <div
              className="h-full bg-gradient-to-r from-[#D5942A] to-[#F7D06B] transition-[width] duration-150 ease-out"
              style={{ width: `${Math.round(hud.progress * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Hint & Controls */}
      <div className="flex flex-col gap-3">
        <p className="text-center text-xs sm:text-sm font-medium text-[#F7F1DF]/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.65)]">
          {showTouchControls
            ? 'Hold an arrow to move · Tap JUMP to leap'
            : 'Use Arrow Keys or A / D to move · Space or W to leap · P to pause'}
        </p>

        {showTouchControls && (
          <div className="flex items-end justify-between gap-4 pb-1">
            {/* Left / Right Arrows */}
            <div className="pointer-events-auto flex items-center gap-3">
              <button
                type="button"
                aria-label="Move left"
                onPointerDown={(e) => {
                  e.preventDefault();
                  onMoveLeftStart();
                }}
                onPointerUp={onMoveLeftEnd}
                onPointerLeave={onMoveLeftEnd}
                onPointerCancel={onMoveLeftEnd}
                className="w-16 h-16 sm:w-[68px] sm:h-[68px] rounded-2xl bg-[#1D3526]/80 active:bg-[#2E523B] border border-[#F2E0A8]/25 text-[#F7EFD8] flex items-center justify-center shadow-lg transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C557]"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>

              <button
                type="button"
                aria-label="Move right"
                onPointerDown={(e) => {
                  e.preventDefault();
                  onMoveRightStart();
                }}
                onPointerUp={onMoveRightEnd}
                onPointerLeave={onMoveRightEnd}
                onPointerCancel={onMoveRightEnd}
                className="w-16 h-16 sm:w-[68px] sm:h-[68px] rounded-2xl bg-[#1D3526]/80 active:bg-[#2E523B] border border-[#F2E0A8]/25 text-[#F7EFD8] flex items-center justify-center shadow-lg transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C557]"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>

            {/* Golden JUMP Button */}
            <button
              type="button"
              aria-label="Jump"
              onPointerDown={(e) => {
                e.preventDefault();
                onJumpStart();
              }}
              onPointerUp={onJumpEnd}
              onPointerLeave={onJumpEnd}
              onPointerCancel={onJumpEnd}
              className="pointer-events-auto px-7 sm:px-9 h-16 sm:h-[68px] rounded-2xl bg-gradient-to-b from-[#E5AF47] to-[#C88B28] active:from-[#D49A35] active:to-[#B57B1E] border border-[#FFE39E]/45 text-[#221708] font-display text-lg sm:text-xl font-bold tracking-wider shadow-[0_8px_24px_rgba(0,0,0,0.38)] transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFF3C4]"
            >
              JUMP
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
