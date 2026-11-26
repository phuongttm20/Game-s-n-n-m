import { LEVELS } from '../game/levels';
import { GameState, HudSnapshot } from '../game/types';
import { BramblePreviewCanvas } from './BramblePreviewCanvas';

interface GameModalsProps {
  gameState: GameState;
  hud: HudSnapshot;
  selectedStage: number;
  totalAcornsAllStages: number;
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
        <div className="w-full max-w-2xl rounded-2xl bg-[#16291D]/92 border border-[#F2E0A8]/20 shadow-2xl p-6 sm:p-8 text-center">
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
          <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto">
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

          {/* Stage Selector */}
          <div className="mt-6">
            <p className="text-xs font-medium text-[#B8CBB0] mb-2">
              Choose Stage
            </p>
            <div className="inline-flex flex-wrap justify-center gap-1.5 p-1 rounded-xl bg-[#0F1E15]/80 border border-[#F2E0A8]/10">
              {LEVELS.map((lvl, idx) => {
                const active = selectedStage === idx;
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
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-[#C6D6BD] mt-2.5">
              {LEVELS[selectedStage].subtitle}
            </p>
          </div>

          {/* Primary Start CTA */}
          <div className="mt-6 flex flex-col items-center gap-3">
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
