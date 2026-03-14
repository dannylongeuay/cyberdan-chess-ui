import type { PieceData } from '../types/chess';
import { pieceImages } from '../assets/pieces';

interface PieceProps {
  piece: PieceData;
  isDragging?: boolean;
}

export default function Piece({ piece, isDragging }: PieceProps) {
  return (
    <img
      src={pieceImages[piece]}
      alt={piece}
      className="w-[85%] h-[85%] pointer-events-none select-none"
      style={{ opacity: isDragging ? 0.3 : 1 }}
      draggable={false}
    />
  );
}
