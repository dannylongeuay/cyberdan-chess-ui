import type { PieceData } from '../../types/chess';

import wK from './wK.svg';
import wQ from './wQ.svg';
import wR from './wR.svg';
import wB from './wB.svg';
import wN from './wN.svg';
import wP from './wP.svg';
import bK from './bK.svg';
import bQ from './bQ.svg';
import bR from './bR.svg';
import bB from './bB.svg';
import bN from './bN.svg';
import bP from './bP.svg';

export const pieceImages: Record<PieceData, string> = {
  wK, wQ, wR, wB, wN, wP,
  bK, bQ, bR, bB, bN, bP,
};
