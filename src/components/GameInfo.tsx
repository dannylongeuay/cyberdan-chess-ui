import type { GameStatus, SideToMove } from '../types/chess';

interface GameInfoProps {
  sideToMove: SideToMove;
  status: GameStatus;
  isComputerThinking?: boolean;
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

export default function GameInfo({ sideToMove, status, isComputerThinking }: GameInfoProps) {
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
    </div>
  );
}
