export type PieceColor = 'w' | 'b';
export type PieceType = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P';
export type PieceData = `${PieceColor}${PieceType}`;
export type PromotionPiece = 'queen' | 'rook' | 'bishop' | 'knight';

export interface SquareCoord {
  row: number; // 0 = rank 8 (top), 7 = rank 1 (bottom)
  col: number; // 0 = a-file, 7 = h-file
}

/** 8x8 board array. null = empty square. */
export type Board = (PieceData | null)[][];

export type GameStatus =
  | 'ongoing'
  | 'checkmate'
  | 'stalemate'
  | 'fifty_move_rule'
  | 'insufficient_material';

export type SideToMove = 'white' | 'black';

export type GameMode = 'pvp' | 'pvc';
export type HumanColor = 'white' | 'black';
