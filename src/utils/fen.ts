import type { Board, PieceColor, PieceData, PieceType, SideToMove } from '../types/chess';

export const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const PIECE_MAP: Record<string, PieceData> = {
  K: 'wK', Q: 'wQ', R: 'wR', B: 'wB', N: 'wN', P: 'wP',
  k: 'bK', q: 'bQ', r: 'bR', b: 'bB', n: 'bN', p: 'bP',
};

export function parseFenBoard(fen: string): Board {
  const ranks = fen.split(' ')[0].split('/');
  return ranks.map((rank) => {
    const row: (PieceData | null)[] = [];
    for (const ch of rank) {
      if (ch >= '1' && ch <= '8') {
        row.push(...Array<null>(Number(ch)).fill(null));
      } else {
        row.push(PIECE_MAP[ch] ?? null);
      }
    }
    return row;
  });
}

export function fenSideToMove(fen: string): SideToMove {
  return fen.split(' ')[1] === 'w' ? 'white' : 'black';
}

export function pieceColor(piece: PieceData): PieceColor {
  return piece[0] as PieceColor;
}

export function pieceType(piece: PieceData): PieceType {
  return piece[1] as PieceType;
}
