import { User } from 'firebase/auth';
import { LogOut } from 'lucide-react';
import { LEVELS } from '../game/levels';
import { GameState, HudSnapshot } from '../game/types';
import { BramblePreviewCanvas } from './BramblePreviewCanvas';

interface GameModalsProps {
  gameState: GameState;
  hud: HudSnapshot;
  selectedStage: number;
  totalAcornsAllStages: number;
  bestStageAcorns: [number, number, number];
  user: User | null;
  authReady: boolean;
  isSigningIn: boolean;
  authError: string | null;
  onGoogleSignIn: () => void;
  onSignOut: () => void;
  onSelectStage: (index: number) => void;
  onStartGame: () => void;
  onResume: () => void;
  onRestartStage: () => void;
  onNextStage: () => void;
  onBackToTitle: () => void;
}

export function GameModals({
  gameState,
  hud,
  selectedStage,
  totalAcornsAllStages,
  bestStageAcorns,
  user,
  authReady,
  isSigningIn,
  authError,
  onGoogleSignIn,
  onSignOut,
  onSelectStage,
  onStartGame,
  onResume,
  onRestartStage,
  onNextStage,
  onBackToTitle,
}: GameModalsProps) {
  if (gameState === 'PLAYING') return null;

  if (gameState === 'TITLE_MENU') {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-[#132219]/45 via-[#132219]/55 to-[#0D1912]/80 backdrop-blur-[2px]">
        <div className="w-full max-w-2xl rounded-2xl bg-[#16291D]/92 border border-[#F2E0A8]/20 shadow-2xl p-6 sm:p-8 text-center max-h-[94vh] overflow-y-auto">
          <p className="text-xs font-semibold tracking-[0.26em] uppercase text-[#E6C578] mb-2">
            Storybook Forest Platformer
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-wide text-[#FAF3DF] [text-wrap:balance]">
            BRAMBLE
          </h1>
          <p className="font-display text-sm sm:text-base tracking-[0.24em] text-[#CFE0C3] mt-1">
            THE MOSSWOOD TRAIL
          </p>

          {/* Animated Character Showcase: Idle, Run, Jump */}
          <div className="mt-5 grid grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto">
            <div className="flex flex-col items-center gap-1.5">
              <div className="rounded-xl overflow-hidden border border-[#F2E0A8]/20 shadow-md">
                <BramblePreviewCanvas pose="idle" withForestBackdrop={false} />
              </div>
              <span className="text-xs font-medium text-[#DDE6D5]">Idle</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="rounded-xl overflow-hidden border border-[#F2E0A8]/20 shadow-md">
                <BramblePreviewCanvas pose="run" withForestBackdrop />
              </div>
              <span className="text-xs font-medium text-[#DDE6D5]">Run</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="rounded-xl overflow-hidden border border-[#F5C557]/55 shadow-md">
                <BramblePreviewCanvas pose="jump" withForestBackdrop />
              </div>
              <span className="text-xs font-medium text-[#F5C557]">Jump</span>
            </div>
          </div>

          {!authReady ? (
            <div className="mt-7 py-4 text-sm text-[#C6D6BD]">
              Đang kiểm tra phiên đăng nhập...
            </div>
          ) : !user ? (
            /* Mandatory Gmail / Google Sign-In Gate */
            <div className="mt-6 pt-5 border-t border-[#F2E0A8]/12 flex flex-col items-center gap-3.5">
              <p className="text-sm text-[#EAE4D2] max-w-md [text-wrap:balance]">
                Vui lòng đăng nhập bằng tài khoản Google (Gmail) để vào rừng Mosswood và lưu thành tích hạt sồi của bạn.
              </p>

              <button
                type="button"
                onClick={onGoogleSignIn}
                disabled={isSigningIn}
                className="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-white hover:bg-[#F7F8FA] active:scale-[0.99] text-[#1F1F1F] font-semibold text-sm shadow-lg border border-[#DADCE0] transition-all disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C557]"
              >
                <svg
                  className="w-5 h-5 shrink-0"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                <span>
                  {isSigningIn ? 'Đang đăng nhập...' : 'Sign in with Google'}
                </span>
              </button>

              {authError && (
                <p className="text-xs text-[#F48C8A] max-w-md">{authError}</p>
              )}
            </div>
          ) : (
            /* Signed-in State: Stage Selector & Start Game */
            <>
              <div className="mt-5 pt-4 border-t border-[#F2E0A8]/12 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs text-[#D5E2CC]">
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Player avatar'}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full border border-[#F2E0A8]/30 object-cover"
                  />
                )}
                <span className="font-semibold text-[#FAF3DF]">
                  {user.displayName || 'Hiệp sĩ Bramble'}
                </span>
                {user.email && (
                  <>
                    <span aria-hidden="true" className="text-[#F2E0A8]/30">
                      ·
                    </span>
                    <span className="text-[#B8CBB0]">{user.email}</span>
                  </>
                )}
                <span aria-hidden="true" className="text-[#F2E0A8]/30">
                  ·
                </span>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="inline-flex items-center gap-1 text-[#F5C557] hover:text-[#FFE38A] underline underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C557] rounded"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất</span>
                </button>
              </div>

              {/* Stage Selector */}
              <div className="mt-4">
                <p className="text-xs font-medium text-[#B8CBB0] mb-2">
                  Choose Stage
                </p>
                <div className="inline-flex flex-wrap justify-center gap-1.5 p-1 rounded-xl bg-[#0F1E15]/80 border border-[#F2E0A8]/10">
                  {LEVELS.map((lvl, idx) => {
                    const active = selectedStage === idx;
                    const best = bestStageAcorns[idx] ?? 0;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => onSelectStage(idx)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C557] ${
                          active
                            ? 'bg-[#E5AF47] text-[#1F1507] shadow-sm'
                            : 'text-[#D6E2CE] hover:text-white hover:bg-[#213A2A]'
                        }`}
                      >
                        {idx + 1}. {lvl.name}
                        {best > 0 ? ` (${best}/12)` : ''}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-[#C6D6BD] mt-2">
                  {LEVELS[selectedStage].subtitle}
                </p>
              </div>

              {/* Primary Start CTA */}
              <div className="mt-5 flex flex-col items-center gap-2.5">
                <button
                  type="button"
                  onClick={onStartGame}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-b from-[#E7B14A] to-[#C88B28] hover:from-[#F0BD59] hover:to-[#D59731] text-[#1F1507] font-display text-base sm:text-lg font-bold tracking-wider shadow-lg transition-transform active:scale-[0.98] whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFF3C4]"
                >
                  Start Game
                </button>
                <p className="text-xs text-[#B4C7AE]">
                  Arrow Keys or A / D to move · Space or W to jump · Touch buttons supported
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (gameState === 'PAUSED') {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-[#0D1A12]/70 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-2xl bg-[#16291D]/95 border border-[#F2E0A8]/20 shadow-2xl p-6 text-center">
          <h2 className="font-display text-2xl font-bold text-[#FAF3DF]">
            Game Paused
          </h2>
          <p className="text-sm text-[#C6D6BD] mt-1.5">
            Stage {hud.stageIndex + 1}: {hud.stageName} · Acorns {hud.acornsCollected}/{hud.totalAcorns}
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={onResume}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-b from-[#E7B14A] to-[#C88B28] text-[#1F1507] font-semibold text-sm hover:brightness-105 transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFF3C4]"
            >
              Resume
            </button>
            <button
              type="button"
              onClick={onRestartStage}
              className="w-full py-2.5 px-4 rounded-xl bg-[#223C2B] border border-[#F2E0A8]/15 text-[#EEF4E8] font-medium text-sm hover:bg-[#2C4D37] transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C557]"
            >
              Restart Stage
            </button>
            <button
              type="button"
              onClick={onBackToTitle}
              className="w-full py-2.5 px-4 rounded-xl bg-transparent text-[#C2D2B8] font-medium text-sm hover:text-white hover:bg-[#1E3526] transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C557]"
            >
              Main Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'STAGE_CLEAR') {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-[#0D1A12]/70 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-2xl bg-[#16291D]/95 border border-[#F5C557]/35 shadow-2xl p-6 sm:p-7 text-center">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#F5C557]">
            Castle Reached
          </p>
          <h2 className="font-display text-3xl font-bold text-[#FAF3DF] mt-1">
            {hud.stageName} Clear
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-3 text-left bg-[#0F1E15]/80 rounded-xl p-4 border border-[#F2E0A8]/10">
            <div>
              <p className="text-xs text-[#A8BEA0]">Acorns Gathered</p>
              <p className="text-xl font-bold text-[#F5C557] tabular-nums mt-0.5">
                {hud.acornsCollected} / {hud.totalAcorns}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#A8BEA0]">Trail Time</p>
              <p className="text-xl font-bold text-[#F5EFE0] tabular-nums mt-0.5">
                {hud.elapsedSeconds.toFixed(1)}s
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={onRestartStage}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#223C2B] border border-[#F2E0A8]/15 text-[#EEF4E8] font-medium text-sm hover:bg-[#2C4D37] transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C557]"
            >
              Replay Stage
            </button>
            <button
              type="button"
              onClick={onNextStage}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-b from-[#E7B14A] to-[#C88B28] text-[#1F1507] font-semibold text-sm hover:brightness-105 transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFF3C4]"
            >
              Next Stage
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'GAME_OVER') {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-[#0D1A12]/75 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-2xl bg-[#16291D]/95 border border-[#D94A48]/35 shadow-2xl p-6 text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#FAF3DF]">
            Trail Lost
          </h2>
          <p className="text-sm text-[#C6D6BD] mt-2">
            Bramble tumbled into the Mosswood mist after gathering{' '}
            <span className="font-semibold text-[#F5C557] tabular-nums">
              {hud.acornsCollected} / {hud.totalAcorns}
            </span>{' '}
            acorns.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={onRestartStage}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-b from-[#E7B14A] to-[#C88B28] text-[#1F1507] font-semibold text-sm hover:brightness-105 transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFF3C4]"
            >
              Play Again
            </button>
            <button
              type="button"
              onClick={onBackToTitle}
              className="w-full py-2.5 px-4 rounded-xl bg-[#223C2B] border border-[#F2E0A8]/15 text-[#EEF4E8] font-medium text-sm hover:bg-[#2C4D37] transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C557]"
            >
              Main Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // VICTORY (all stages complete)
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-[#0D1A12]/75 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-[#16291D]/95 border border-[#F5C557]/45 shadow-2xl p-6 sm:p-8 text-center">
        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-[#F5C557]">
          Quest Complete
        </p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#FAF3DF] mt-1">
          Hail, Sir Bramble
        </h2>
        <p className="text-sm text-[#C6D6BD] mt-2">
          You guided Bramble safely through all three stages of the Mosswood Trail to the Castle Keep.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 text-left bg-[#0F1E15]/80 rounded-xl p-4 border border-[#F2E0A8]/10">
          <div>
            <p className="text-xs text-[#A8BEA0]">Final Stage Acorns</p>
            <p className="text-xl font-bold text-[#F5C557] tabular-nums mt-0.5">
              {hud.acornsCollected} / {hud.totalAcorns}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#A8BEA0]">Total Collected</p>
            <p className="text-xl font-bold text-[#F5EFE0] tabular-nums mt-0.5">
              {totalAcornsAllStages} / {LEVELS.length * 12}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={onBackToTitle}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#223C2B] border border-[#F2E0A8]/15 text-[#EEF4E8] font-medium text-sm hover:bg-[#2C4D37] transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C557]"
          >
            Main Menu
          </button>
          <button
            type="button"
            onClick={onStartGame}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-b from-[#E7B14A] to-[#C88B28] text-[#1F1507] font-semibold text-sm hover:brightness-105 transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFF3C4]"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}
