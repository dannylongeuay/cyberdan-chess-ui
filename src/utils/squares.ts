import type { SquareCoord } from '../types/chess';

const FILES = 'abcdefgh';

/** Convert board coordinate (row 0 = rank 8) to algebraic notation (e.g. "e4"). */
export function coordToAlgebraic(coord: SquareCoord): string {
  return FILES[coord.col] + (8 - coord.row);
}

/** Convert algebraic notation (e.g. "e4") to board coordinate. */
export function algebraicToCoord(algebraic: string): SquareCoord {
  return {
    row: 8 - Number(algebraic[1]),
    col: FILES.indexOf(algebraic[0]),
  };
}

/** Returns true if the square at (row, col) is a light square. */
export function isLightSquare(row: number, col: number): boolean {
  return (row + col) % 2 === 0;
}
