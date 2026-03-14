import { useState, useCallback, useRef, useMemo } from 'react';
import type { SquareCoord, GameStatus, SideToMove, Board, PieceColor, PromotionPiece } from '../types/chess';
import type { ValidMove, ValidMovesResponse } from '../api/types';
import { api } from '../api/client';
import { INITIAL_FEN, parseFenBoard, fenSideToMove, pieceColor } from '../utils/fen';
import { coordToAlgebraic } from '../utils/squares';

interface ChessGameState {
  board: Board;
  activeColor: PieceColor;
  sideToMove: SideToMove;
  selectedSquare: SquareCoord | null;
  legalMovesForSquare: ValidMove[];
  gameStatus: GameStatus;
  lastMove: { from: string; to: string } | null;
  checkSquare: string | null;
  pendingPromotion: { from: SquareCoord; to: SquareCoord; moves: ValidMove[] } | null;
  isLoading: boolean;
  error: string | null;
  selectSquare: (coord: SquareCoord) => void;
  handleDrop: (from: SquareCoord, to: SquareCoord) => void;
  handlePromotion: (piece: PromotionPiece) => void;
  newGame: () => void;
}

export function useChessGame(): ChessGameState {
  const [fen, setFen] = useState(INITIAL_FEN);
  const [selectedSquare, setSelectedSquare] = useState<SquareCoord | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>('ongoing');
  const [sideToMove, setSideToMove] = useState<SideToMove>('white');
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [checkSquare, setCheckSquare] = useState<string | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: SquareCoord; to: SquareCoord; moves: ValidMove[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cache valid moves per FEN
  const movesCache = useRef<{ fen: string; response: ValidMovesResponse } | null>(null);
  const [allMoves, setAllMoves] = useState<ValidMove[]>([]);

  const board = useMemo(() => parseFenBoard(fen), [fen]);
  const activeColor: PieceColor = fenSideToMove(fen) === 'white' ? 'w' : 'b';

  const legalMovesForSquare = useMemo(() => {
    if (!selectedSquare) return [];
    const fromAlg = coordToAlgebraic(selectedSquare);
    return allMoves.filter((m) => m.from === fromAlg);
  }, [selectedSquare, allMoves]);

  const fetchMoves = useCallback(async (currentFen: string): Promise<ValidMovesResponse | null> => {
    // Return cached if same position
    if (movesCache.current?.fen === currentFen) {
      return movesCache.current.response;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getValidMoves(currentFen);
      movesCache.current = { fen: currentFen, response };
      setAllMoves(response.moves);
      setGameStatus(response.status);
      setSideToMove(response.side_to_move);

      // Find if any move gives check — detect king in check
      // Actually, check is on current position, not on move result.
      // The king is in check if the opponent's last move was a checking move.
      // We detect this from the position status from the API or from the FEN.
      // For simplicity, if any of the opponent's moves result in the position
      // we handle check detection via the submit response. Already handled.

      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch moves');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitMove = useCallback(async (currentFen: string, uci: string, from: string, to: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.submitMove(currentFen, uci);
      setFen(response.fen);
      setGameStatus(response.status);
      setSideToMove(response.side_to_move);
      setSelectedSquare(null);
      setLastMove({ from, to });
      movesCache.current = null;
      setAllMoves([]);

      // Fetch moves for next position to detect check
      if (response.status === 'ongoing') {
        const nextMoves = await api.getValidMoves(response.fen);
        movesCache.current = { fen: response.fen, response: nextMoves };
        setAllMoves(nextMoves.moves);
        setGameStatus(nextMoves.status);

        // Detect check: find the king of the side to move
        const nextBoard = parseFenBoard(response.fen);
        const kingColor = response.side_to_move === 'white' ? 'w' : 'b';
        const kingType = 'K';
        let kingPos: string | null = null;
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const p = nextBoard[r][c];
            if (p && p[0] === kingColor && p[1] === kingType) {
              kingPos = coordToAlgebraic({ row: r, col: c });
            }
          }
        }

        // Check if any opponent move targets the king position
        // Actually, a simpler approach: check if the move we just made was a check
        // We can check this from the valid moves response — if status has check info
        // The move we submitted might have had check=true in the valid moves list
        // Simpler: check if the king of side_to_move is attacked
        // We'll use a heuristic: if the SAN of any previous valid move ended with +
        // Actually the API doesn't tell us directly. Let's check the SAN from submit response.
        if (response.san.includes('+') || response.san.includes('#')) {
          setCheckSquare(kingPos);
        } else {
          setCheckSquare(null);
        }
      } else {
        // Game over — check for checkmate indicator
        if (response.status === 'checkmate') {
          const nextBoard = parseFenBoard(response.fen);
          const kingColor = response.side_to_move === 'white' ? 'w' : 'b';
          let kingPos: string | null = null;
          for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
              const p = nextBoard[r][c];
              if (p && p[0] === kingColor && p[1] === 'K') {
                kingPos = coordToAlgebraic({ row: r, col: c });
              }
            }
          }
          setCheckSquare(kingPos);
        } else {
          setCheckSquare(null);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit move');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const tryMove = useCallback((from: SquareCoord, to: SquareCoord, moves: ValidMove[]) => {
    const fromAlg = coordToAlgebraic(from);
    const toAlg = coordToAlgebraic(to);
    const matchingMoves = moves.filter((m) => m.from === fromAlg && m.to === toAlg);

    if (matchingMoves.length === 0) return;

    // Check if this is a promotion move
    const promotionMoves = matchingMoves.filter((m) => m.promotion !== null);
    if (promotionMoves.length > 0) {
      setPendingPromotion({ from, to, moves: promotionMoves });
      return;
    }

    const move = matchingMoves[0];
    submitMove(fen, move.uci, move.from, move.to);
  }, [fen, submitMove]);

  const selectSquare = useCallback(async (coord: SquareCoord) => {
    if (gameStatus !== 'ongoing') return;

    const piece = board[coord.row][coord.col];
    const clickedAlg = coordToAlgebraic(coord);

    // If we have a selected square and click a legal target, make the move
    if (selectedSquare) {
      const isLegal = legalMovesForSquare.some((m) => m.to === clickedAlg);
      if (isLegal) {
        tryMove(selectedSquare, coord, legalMovesForSquare);
        return;
      }
    }

    // Click on own piece — select it
    if (piece && pieceColor(piece) === activeColor) {
      setSelectedSquare(coord);
      // Fetch moves if not cached
      const response = await fetchMoves(fen);
      if (response) {
        setAllMoves(response.moves);
      }
      return;
    }

    // Click on empty square or opponent piece (not a legal move) — deselect
    setSelectedSquare(null);
  }, [board, activeColor, selectedSquare, legalMovesForSquare, gameStatus, fen, fetchMoves, tryMove]);

  const handleDrop = useCallback((from: SquareCoord, to: SquareCoord) => {
    if (gameStatus !== 'ongoing') return;
    // The moves should already be cached from pointerdown
    if (movesCache.current?.fen === fen) {
      const fromAlg = coordToAlgebraic(from);
      const moves = movesCache.current.response.moves.filter((m) => m.from === fromAlg);
      tryMove(from, to, moves);
    }
  }, [gameStatus, fen, tryMove]);

  const handlePromotion = useCallback((piece: PromotionPiece) => {
    if (!pendingPromotion) return;
    const move = pendingPromotion.moves.find((m) => m.promotion === piece);
    if (move) {
      submitMove(fen, move.uci, move.from, move.to);
    }
    setPendingPromotion(null);
  }, [pendingPromotion, fen, submitMove]);

  const newGame = useCallback(() => {
    setFen(INITIAL_FEN);
    setSelectedSquare(null);
    setGameStatus('ongoing');
    setSideToMove('white');
    setLastMove(null);
    setCheckSquare(null);
    setPendingPromotion(null);
    setError(null);
    movesCache.current = null;
    setAllMoves([]);
  }, []);

  return {
    board,
    activeColor,
    sideToMove,
    selectedSquare,
    legalMovesForSquare,
    gameStatus,
    lastMove,
    checkSquare,
    pendingPromotion,
    isLoading,
    error,
    selectSquare,
    handleDrop,
    handlePromotion,
    newGame,
  };
}
