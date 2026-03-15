import { useState, useCallback, useRef, useMemo } from 'react';
import type { SquareCoord, GameStatus, SideToMove, Board, PieceColor, PromotionPiece } from '../types/chess';
import type { ValidMove, ValidMovesResponse } from '../api/types';
import { api } from '../api/client';
import { INITIAL_FEN, INITIAL_VALID_MOVES, parseFenBoard, fenSideToMove, pieceColor, findKingSquare } from '../utils/fen';
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
  const movesCache = useRef<{ fen: string; response: ValidMovesResponse } | null>(
    { fen: INITIAL_FEN, response: INITIAL_VALID_MOVES }
  );
  const [allMoves, setAllMoves] = useState<ValidMove[]>(INITIAL_VALID_MOVES.moves);

  const board = useMemo(() => parseFenBoard(fen), [fen]);
  const activeColor: PieceColor = fenSideToMove(fen) === 'white' ? 'w' : 'b';

  const legalMovesForSquare = useMemo(() => {
    if (!selectedSquare) return [];
    const fromAlg = coordToAlgebraic(selectedSquare);
    return allMoves.filter((m) => m.from === fromAlg);
  }, [selectedSquare, allMoves]);

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
      movesCache.current = {
        fen: response.fen,
        response: {
          fen: response.fen,
          side_to_move: response.side_to_move,
          status: response.status,
          move_count: response.move_count,
          moves: response.moves,
        },
      };
      setAllMoves(response.moves);

      // Detect check/checkmate from the SAN notation returned by the API
      if (response.san.includes('+') || response.san.includes('#')) {
        const nextBoard = parseFenBoard(response.fen);
        const kingColor = response.side_to_move === 'white' ? 'w' : 'b';
        setCheckSquare(findKingSquare(nextBoard, kingColor));
      } else {
        setCheckSquare(null);
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

  const selectSquare = useCallback((coord: SquareCoord) => {
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

    // Click on own piece — select it (moves are already pre-populated)
    if (piece && pieceColor(piece) === activeColor) {
      setSelectedSquare(coord);
      return;
    }

    // Click on empty square or opponent piece (not a legal move) — deselect
    setSelectedSquare(null);
  }, [board, activeColor, selectedSquare, legalMovesForSquare, gameStatus, tryMove]);

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
    movesCache.current = { fen: INITIAL_FEN, response: INITIAL_VALID_MOVES };
    setAllMoves(INITIAL_VALID_MOVES.moves);
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
