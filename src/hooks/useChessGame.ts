import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import type { SquareCoord, GameStatus, SideToMove, Board, PieceColor, PromotionPiece, GameMode, HumanColor, EngineEval } from '../types/chess';
import type { ValidMove, ValidMovesResponse, SubmitMoveResponse } from '../api/types';
import { api } from '../api/client';
import { BACKENDS, DEFAULT_BACKEND, type Backend } from '../api/backends';
import { INITIAL_FEN, INITIAL_VALID_MOVES, parseFenBoard, fenSideToMove, pieceColor, findKingSquare, positionKey } from '../utils/fen';
import { coordToAlgebraic } from '../utils/squares';

/** Minimum delay before a computer move appears, to avoid jarring instant moves */
const COMPUTER_MOVE_DELAY_MS = 750;

/** Delay before auto-restarting a CvC game */
const AUTOPLAY_DELAY_MS = 2500;

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
  gameMode: GameMode;
  humanColor: HumanColor;
  isComputerThinking: boolean;
  engineEval: EngineEval | null;
  flipped: boolean;
  toggleFlip: () => void;
  setGameMode: (mode: GameMode) => void;
  setHumanColor: (color: HumanColor) => void;
  backend: Backend;
  backends: Backend[];
  setBackend: (backend: Backend) => void;
  whiteBackend: Backend;
  blackBackend: Backend;
  setWhiteBackend: (backend: Backend) => void;
  setBlackBackend: (backend: Backend) => void;
  autoplay: boolean;
  setAutoplay: (on: boolean) => void;
  depth: number;
  setDepth: (depth: number) => void;
  timeoutSeconds: number;
  setTimeoutSeconds: (seconds: number) => void;
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
  const [gameMode, setGameModeState] = useState<GameMode>('pvp');
  const [humanColor, setHumanColorState] = useState<HumanColor>('white');
  const [isComputerThinking, setIsComputerThinking] = useState(false);
  const [engineEval, setEngineEval] = useState<EngineEval | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [backend, setBackendState] = useState<Backend>(DEFAULT_BACKEND);
  const [whiteBackend, setWhiteBackendState] = useState<Backend>(BACKENDS[0]);
  const [blackBackend, setBlackBackendState] = useState<Backend>(BACKENDS[1] ?? BACKENDS[0]);
  const [autoplay, setAutoplayState] = useState(false);
  const [depth, setDepth] = useState(20);
  const [timeoutSeconds, setTimeoutSeconds] = useState(2);

  // Refs so the computer-move effect reads current values without re-triggering
  const depthRef = useRef(depth);
  const timeoutSecondsRef = useRef(timeoutSeconds);
  depthRef.current = depth;
  timeoutSecondsRef.current = timeoutSeconds;

  // Track position history for threefold repetition detection
  const positionHistory = useRef<Map<string, number>>(
    new Map([[positionKey(INITIAL_FEN), 1]])
  );

  // Cache valid moves per FEN
  const movesCache = useRef<{ fen: string; response: ValidMovesResponse } | null>(
    { fen: INITIAL_FEN, response: INITIAL_VALID_MOVES }
  );
  const [allMoves, setAllMoves] = useState<ValidMove[]>(INITIAL_VALID_MOVES.moves);

  const computerColor: SideToMove | null = gameMode === 'pvc'
    ? (humanColor === 'white' ? 'black' : 'white')
    : null;

  const board = useMemo(() => parseFenBoard(fen), [fen]);
  const activeColor: PieceColor = fenSideToMove(fen) === 'white' ? 'w' : 'b';

  const legalMovesForSquare = useMemo(() => {
    if (!selectedSquare) return [];
    const fromAlg = coordToAlgebraic(selectedSquare);
    return allMoves.filter((m) => m.from === fromAlg);
  }, [selectedSquare, allMoves]);

  const applyMoveResponse = useCallback((response: SubmitMoveResponse) => {
    setFen(response.fen);
    setSideToMove(response.side_to_move);

    // Detect threefold repetition
    const key = positionKey(response.fen);
    const count = (positionHistory.current.get(key) ?? 0) + 1;
    positionHistory.current.set(key, count);
    if (count >= 3) {
      setGameStatus('threefold_repetition');
    } else {
      setGameStatus(response.status);
    }
    setSelectedSquare(null);
    setLastMove({ from: response.from, to: response.to });
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

    if (response.san.includes('+') || response.san.includes('#')) {
      const nextBoard = parseFenBoard(response.fen);
      const kingColor = response.side_to_move === 'white' ? 'w' : 'b';
      setCheckSquare(findKingSquare(nextBoard, kingColor));
    } else {
      setCheckSquare(null);
    }
  }, []);

  const submitMove = useCallback(async (currentFen: string, uci: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.submitMove(backend.url, currentFen, uci);
      applyMoveResponse(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit move');
    } finally {
      setIsLoading(false);
    }
  }, [applyMoveResponse, backend.url]);

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
    submitMove(fen, move.uci);
  }, [fen, submitMove]);

  const selectSquare = useCallback((coord: SquareCoord) => {
    if (gameMode === 'cvc') return;
    if (isComputerThinking) return;
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
  }, [board, activeColor, selectedSquare, legalMovesForSquare, gameStatus, tryMove, isComputerThinking, gameMode]);

  const handleDrop = useCallback((from: SquareCoord, to: SquareCoord) => {
    if (gameMode === 'cvc') return;
    if (isComputerThinking) return;
    if (gameStatus !== 'ongoing') return;
    // The moves should already be cached from pointerdown
    if (movesCache.current?.fen === fen) {
      const fromAlg = coordToAlgebraic(from);
      const moves = movesCache.current.response.moves.filter((m) => m.from === fromAlg);
      tryMove(from, to, moves);
    }
  }, [isComputerThinking, gameStatus, fen, tryMove, gameMode]);

  const handlePromotion = useCallback((piece: PromotionPiece) => {
    if (!pendingPromotion) return;
    const move = pendingPromotion.moves.find((m) => m.promotion === piece);
    if (move) {
      submitMove(fen, move.uci);
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
    setIsComputerThinking(false);
    setEngineEval(null);
    movesCache.current = { fen: INITIAL_FEN, response: INITIAL_VALID_MOVES };
    setAllMoves(INITIAL_VALID_MOVES.moves);
    positionHistory.current = new Map([[positionKey(INITIAL_FEN), 1]]);
  }, []);

  const toggleFlip = useCallback(() => {
    setFlipped((prev) => !prev);
  }, []);

  const setGameMode = useCallback((mode: GameMode) => {
    setGameModeState(mode);
    if (mode === 'pvp' || mode === 'cvc') {
      setFlipped(false);
    } else {
      setFlipped(humanColor === 'black');
    }
    if (mode !== 'cvc') {
      setAutoplayState(false);
    }
    newGame();
  }, [newGame, humanColor]);

  const setHumanColor = useCallback((color: HumanColor) => {
    setHumanColorState(color);
    setFlipped(color === 'black');
    newGame();
  }, [newGame]);

  const setBackend = useCallback((b: Backend) => {
    setBackendState(b);
    newGame();
  }, [newGame]);

  const setWhiteBackend = useCallback((b: Backend) => {
    setWhiteBackendState(b);
    newGame();
  }, [newGame]);

  const setBlackBackend = useCallback((b: Backend) => {
    setBlackBackendState(b);
    newGame();
  }, [newGame]);

  const setAutoplay = useCallback((on: boolean) => {
    setAutoplayState(on);
  }, []);

  // Computer auto-move effect
  useEffect(() => {
    if (gameMode !== 'pvc' && gameMode !== 'cvc') return;
    if (gameStatus !== 'ongoing') return;
    if (gameMode === 'pvc' && sideToMove !== computerColor) return;

    const moveBackendUrl = gameMode === 'cvc'
      ? (sideToMove === 'white' ? whiteBackend.url : blackBackend.url)
      : backend.url;

    const abortController = new AbortController();
    setIsComputerThinking(true);
    setError(null);

    let delayTimerId: ReturnType<typeof setTimeout>;
    const minDelay = new Promise<void>((resolve) => {
      delayTimerId = setTimeout(resolve, COMPUTER_MOVE_DELAY_MS);
    });

    Promise.all([api.submitBestMove(moveBackendUrl, fen, depthRef.current, timeoutSecondsRef.current * 1000, abortController.signal), minDelay])
      .then(([response]) => {
        if (abortController.signal.aborted) return;

        applyMoveResponse(response);

        if (gameMode === 'cvc') {
          // In CvC, normalize eval to white's perspective
          const sign = sideToMove === 'white' ? 1 : -1;
          setEngineEval({ depth: response.depth, score: sign * response.score, nodes: response.nodes, source: response.source });
        } else {
          // Negate score: engine reports from its own perspective,
          // but we display from the human's perspective
          setEngineEval({ depth: response.depth, score: -response.score, nodes: response.nodes, source: response.source });
        }
      })
      .catch((err) => {
        if (abortController.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Engine move failed');
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setIsComputerThinking(false);
        }
      });

    return () => {
      abortController.abort();
      clearTimeout(delayTimerId);
      setIsComputerThinking(false);
    };
  }, [gameMode, gameStatus, sideToMove, computerColor, fen, applyMoveResponse, backend.url, whiteBackend.url, blackBackend.url]);

  // Autoplay effect: restart game after completion in CvC mode
  useEffect(() => {
    if (!autoplay || gameMode !== 'cvc' || gameStatus === 'ongoing') return;

    const timerId = setTimeout(() => {
      newGame();
    }, AUTOPLAY_DELAY_MS);

    return () => clearTimeout(timerId);
  }, [autoplay, gameMode, gameStatus, newGame]);

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
    gameMode,
    humanColor,
    isComputerThinking,
    engineEval,
    flipped,
    toggleFlip,
    setGameMode,
    setHumanColor,
    backend,
    backends: BACKENDS,
    setBackend,
    whiteBackend,
    blackBackend,
    setWhiteBackend,
    setBlackBackend,
    autoplay,
    setAutoplay,
    depth,
    setDepth,
    timeoutSeconds,
    setTimeoutSeconds,
  };
}
