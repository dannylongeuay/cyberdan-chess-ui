import type { PieceColor, PieceData, PromotionPiece } from '../types/chess';
import { pieceImages } from '../assets/pieces';

interface PromotionDialogProps {
  color: PieceColor;
  onSelect: (piece: PromotionPiece) => void;
}

const CHOICES: { piece: PromotionPiece; type: string }[] = [
  { piece: 'queen', type: 'Q' },
  { piece: 'rook', type: 'R' },
  { piece: 'bishop', type: 'B' },
  { piece: 'knight', type: 'N' },
];

export default function PromotionDialog({ color, onSelect }: PromotionDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-800 rounded-xl p-4 shadow-2xl">
        <p className="text-center text-gray-200 mb-3 font-semibold">Promote to:</p>
        <div className="flex gap-2">
          {CHOICES.map(({ piece, type }) => {
            const key = `${color}${type}` as PieceData;
            return (
              <button
                key={piece}
                onClick={() => onSelect(piece)}
                className="w-16 h-16 flex items-center justify-center rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors cursor-pointer"
              >
                <img
                  src={pieceImages[key]}
                  alt={piece}
                  className="w-12 h-12"
                  draggable={false}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
