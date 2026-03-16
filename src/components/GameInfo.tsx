import type { GameStatus, SideToMove, EngineEval } from '../types/chess';

interface GameInfoProps {
  sideToMove: SideToMove;
  status: GameStatus;
  isComputerThinking?: boolean;
  engineEval?: EngineEval | null;
}

function statusMessage(status: GameStatus, sideToMove: SideToMove): string {
  switch (status) {
    case 'ongoing':
      return `${sideToMove === 'white' ? 'White' : 'Black'} to move`;
    case 'checkmate': {
      const winner = sideToMove === 'white' ? 'Black' : 'White';
      return `Checkmate! ${winner} wins`;
    }
    case 'stalemate':
      return 'Stalemate — Draw';
    case 'fifty_move_rule':
      return 'Draw — Fifty-move rule';
    case 'insufficient_material':
      return 'Draw — Insufficient material';
  }
}

function formatScore(centipawns: number): string {
  const pawns = centipawns / 100;
  return pawns >= 0 ? `+${pawns.toFixed(2)}` : pawns.toFixed(2);
}

export default function GameInfo({ sideToMove, status, isComputerThinking, engineEval }: GameInfoProps) {
  const isGameOver = status !== 'ongoing';
  const message = statusMessage(status, sideToMove);

  return (
    <div className="text-center py-3">
      {isComputerThinking ? (
        <p className="text-lg font-semibold text-gray-400">Computer is thinking...</p>
      ) : (
        <p className={`text-lg font-semibold ${isGameOver ? 'text-yellow-400' : 'text-gray-200'}`}>
          {message}
        </p>
      )}
      {engineEval && !isGameOver && (
        <p className="text-sm text-gray-400 mt-1">
          {engineEval.source === 'book'
            ? 'Book move'
            : `Eval: ${formatScore(engineEval.score)} | Depth: ${engineEval.depth}`}
        </p>
      )}
    </div>
  );
}
