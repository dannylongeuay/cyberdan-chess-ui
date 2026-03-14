import type { PieceData } from '../types/chess';
import { isLightSquare } from '../utils/squares';
import Piece from './Piece';

interface SquareProps {
  row: number;
  col: number;
  piece: PieceData | null;
  isSelected: boolean;
  isLegalMove: boolean;
  isCapture: boolean;
  isLastMoveSquare: boolean;
  isCheck: boolean;
  isDragSource: boolean;
  showRank: boolean;   // col === 0
  showFile: boolean;   // row === 7
}

export default function Square({
  row,
  col,
  piece,
  isSelected,
  isLegalMove,
  isCapture,
  isLastMoveSquare,
  isCheck,
  isDragSource,
  showRank,
  showFile,
}: SquareProps) {
  const light = isLightSquare(row, col);
  const bgColor = light ? 'bg-board-light' : 'bg-board-dark';
  const coordColor = light ? 'text-board-dark' : 'text-board-light';

  return (
    <div
      className={`relative aspect-square flex items-center justify-center ${bgColor} transition-colors duration-150`}
      data-row={row}
      data-col={col}
    >
      {/* Last move highlight */}
      {isLastMoveSquare && (
        <div className="absolute inset-0 bg-highlight-lastmove" />
      )}

      {/* Selected highlight */}
      {isSelected && (
        <div className="absolute inset-0 bg-highlight-selected" />
      )}

      {/* Check highlight */}
      {isCheck && (
        <div className="absolute inset-0 bg-highlight-check rounded-full" />
      )}

      {/* Piece */}
      {piece && <Piece piece={piece} isDragging={isDragSource} />}

      {/* Legal move indicator */}
      {isLegalMove && !isCapture && (
        <div className="absolute w-[33%] h-[33%] rounded-full bg-legal-move" />
      )}

      {/* Capture indicator */}
      {isLegalMove && isCapture && (
        <div className="absolute inset-[8%] rounded-full border-[4px] border-legal-move" />
      )}

      {/* Rank label (left edge) */}
      {showRank && (
        <span className={`absolute top-0.5 left-1 text-[0.65rem] font-bold leading-none ${coordColor} select-none`}>
          {8 - row}
        </span>
      )}

      {/* File label (bottom edge) */}
      {showFile && (
        <span className={`absolute bottom-0.5 right-1 text-[0.65rem] font-bold leading-none ${coordColor} select-none`}>
          {'abcdefgh'[col]}
        </span>
      )}
    </div>
  );
}
