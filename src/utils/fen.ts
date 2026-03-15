import type { Board, PieceColor, PieceData, PieceType, SideToMove } from '../types/chess';
import type { ValidMovesResponse } from '../api/types';
import { coordToAlgebraic } from './squares';

export const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const INITIAL_VALID_MOVES: ValidMovesResponse = {
  fen: INITIAL_FEN,
  side_to_move: 'white',
  status: 'ongoing',
  move_count: 20,
  moves: [
    { uci: 'a2a3', san: 'a3', from: 'a2', to: 'a3', capture: false, promotion: null, castling: false, check: false },
    { uci: 'a2a4', san: 'a4', from: 'a2', to: 'a4', capture: false, promotion: null, castling: false, check: false },
    { uci: 'b2b3', san: 'b3', from: 'b2', to: 'b3', capture: false, promotion: null, castling: false, check: false },
    { uci: 'b2b4', san: 'b4', from: 'b2', to: 'b4', capture: false, promotion: null, castling: false, check: false },
    { uci: 'c2c3', san: 'c3', from: 'c2', to: 'c3', capture: false, promotion: null, castling: false, check: false },
    { uci: 'c2c4', san: 'c4', from: 'c2', to: 'c4', capture: false, promotion: null, castling: false, check: false },
    { uci: 'd2d3', san: 'd3', from: 'd2', to: 'd3', capture: false, promotion: null, castling: false, check: false },
    { uci: 'd2d4', san: 'd4', from: 'd2', to: 'd4', capture: false, promotion: null, castling: false, check: false },
    { uci: 'e2e3', san: 'e3', from: 'e2', to: 'e3', capture: false, promotion: null, castling: false, check: false },
    { uci: 'e2e4', san: 'e4', from: 'e2', to: 'e4', capture: false, promotion: null, castling: false, check: false },
    { uci: 'f2f3', san: 'f3', from: 'f2', to: 'f3', capture: false, promotion: null, castling: false, check: false },
    { uci: 'f2f4', san: 'f4', from: 'f2', to: 'f4', capture: false, promotion: null, castling: false, check: false },
    { uci: 'g2g3', san: 'g3', from: 'g2', to: 'g3', capture: false, promotion: null, castling: false, check: false },
    { uci: 'g2g4', san: 'g4', from: 'g2', to: 'g4', capture: false, promotion: null, castling: false, check: false },
    { uci: 'h2h3', san: 'h3', from: 'h2', to: 'h3', capture: false, promotion: null, castling: false, check: false },
    { uci: 'h2h4', san: 'h4', from: 'h2', to: 'h4', capture: false, promotion: null, castling: false, check: false },
    { uci: 'b1a3', san: 'Na3', from: 'b1', to: 'a3', capture: false, promotion: null, castling: false, check: false },
    { uci: 'b1c3', san: 'Nc3', from: 'b1', to: 'c3', capture: false, promotion: null, castling: false, check: false },
    { uci: 'g1f3', san: 'Nf3', from: 'g1', to: 'f3', capture: false, promotion: null, castling: false, check: false },
    { uci: 'g1h3', san: 'Nh3', from: 'g1', to: 'h3', capture: false, promotion: null, castling: false, check: false },
  ],
};

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

export function findKingSquare(board: Board, color: PieceColor): string | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p[0] === color && p[1] === 'K') {
        return coordToAlgebraic({ row: r, col: c });
      }
    }
  }
  return null;
}
