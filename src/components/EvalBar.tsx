import type { EngineEval } from '../types/chess';

interface EvalBarProps {
  engineEval: EngineEval | null | undefined;
  flipped: boolean;
}

function sigmoid(score: number): number {
  return 50 + 50 * (2 / (1 + Math.exp(-score / 400)) - 1);
}

function formatScore(centipawns: number): string {
  const pawns = Math.abs(centipawns) / 100;
  return pawns.toFixed(1);
}

export default function EvalBar({ engineEval, flipped }: EvalBarProps) {
  const isNeutral = !engineEval || engineEval.source === 'book';
  const whitePercent = isNeutral ? 50 : sigmoid(engineEval.score);

  // White region on left, black on right; invert when flipped
  const leftPercent = flipped ? 100 - whitePercent : whitePercent;

  const label = isNeutral ? '0.0' : formatScore(engineEval.score);
  const labelOnWhiteSide = isNeutral || engineEval.score >= 0;
  // Position label near the edge of the winning side
  const labelAtLeft = flipped ? !labelOnWhiteSide : labelOnWhiteSide;

  return (
    <div className="h-6 w-full rounded-b-lg overflow-hidden flex flex-row relative select-none">
      {/* White region (left) */}
      <div
        className="bg-gray-200 transition-all duration-500 ease-out"
        style={{ flexBasis: `${leftPercent}%` }}
      />
      {/* Black region (right) */}
      <div
        className="bg-gray-800 transition-all duration-500 ease-out"
        style={{ flexBasis: `${100 - leftPercent}%` }}
      />
      {/* Score label */}
      <span
        className={`absolute top-1/2 -translate-y-1/2 text-[10px] font-bold leading-none ${
          labelAtLeft ? 'left-1.5 text-gray-800' : 'right-1.5 text-gray-400'
        }`}
      >
        {label}
      </span>
    </div>
  );
}
