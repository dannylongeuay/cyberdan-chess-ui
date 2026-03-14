import { useRef, useCallback, type PointerEvent as ReactPointerEvent } from 'react';
import type { Board as BoardType, PieceData, SquareCoord } from '../types/chess';
import type { ValidMove } from '../api/types';
import { coordToAlgebraic } from '../utils/squares';
import { pieceColor } from '../utils/fen';
import { pieceImages } from '../assets/pieces';
import Square from './Square';

interface BoardProps {
  board: BoardType;
  activeColor: 'w' | 'b';
  selectedSquare: SquareCoord | null;
  legalMoves: ValidMove[];
  lastMove: { from: string; to: string } | null;
  checkSquare: string | null;
  onSquareClick: (coord: SquareCoord) => void;
  onDrop: (from: SquareCoord, to: SquareCoord) => void;
}

const DRAG_THRESHOLD = 5;

export default function Board({
  board,
  activeColor,
  selectedSquare,
  legalMoves,
  lastMove,
  checkSquare,
  onSquareClick,
  onDrop,
}: BoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    piece: PieceData;
    from: SquareCoord;
    startX: number;
    startY: number;
    isDragging: boolean;
    ghostEl: HTMLImageElement | null;
    pointerId: number;
  } | null>(null);

  const legalMoveSet = new Set(legalMoves.map((m) => m.to));
  const captureSet = new Set(legalMoves.filter((m) => m.capture).map((m) => m.to));

  const getSquareFromPoint = useCallback((clientX: number, clientY: number): SquareCoord | null => {
    const el = boardRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const squareSize = rect.width / 8;
    const col = Math.floor((clientX - rect.left) / squareSize);
    const row = Math.floor((clientY - rect.top) / squareSize);
    if (row < 0 || row > 7 || col < 0 || col > 7) return null;
    return { row, col };
  }, []);

  const cleanupDrag = useCallback(() => {
    const ds = dragState.current;
    if (ds?.ghostEl) {
      ds.ghostEl.remove();
    }
    dragState.current = null;
  }, []);

  const handlePointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const coord = getSquareFromPoint(e.clientX, e.clientY);
    if (!coord) return;

    const piece = board[coord.row][coord.col];
    if (piece && pieceColor(piece) === activeColor) {
      dragState.current = {
        piece,
        from: coord,
        startX: e.clientX,
        startY: e.clientY,
        isDragging: false,
        ghostEl: null,
        pointerId: e.pointerId,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }

    onSquareClick(coord);
  }, [board, activeColor, onSquareClick, getSquareFromPoint]);

  const handlePointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const ds = dragState.current;
    if (!ds) return;

    const dx = e.clientX - ds.startX;
    const dy = e.clientY - ds.startY;

    if (!ds.isDragging && Math.abs(dx) + Math.abs(dy) > DRAG_THRESHOLD) {
      ds.isDragging = true;
      // Create ghost element
      const ghost = document.createElement('img');
      ghost.src = pieceImages[ds.piece];
      ghost.style.position = 'fixed';
      ghost.style.pointerEvents = 'none';
      ghost.style.zIndex = '1000';
      const rect = boardRef.current!.getBoundingClientRect();
      const size = rect.width / 8 * 0.85;
      ghost.style.width = `${size}px`;
      ghost.style.height = `${size}px`;
      ghost.style.transform = 'translate(-50%, -50%)';
      document.body.appendChild(ghost);
      ds.ghostEl = ghost;
    }

    if (ds.isDragging && ds.ghostEl) {
      ds.ghostEl.style.left = `${e.clientX}px`;
      ds.ghostEl.style.top = `${e.clientY}px`;
    }
  }, []);

  const handlePointerUp = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const ds = dragState.current;
    if (!ds) return;

    if (ds.isDragging) {
      const toCoord = getSquareFromPoint(e.clientX, e.clientY);
      if (toCoord && (toCoord.row !== ds.from.row || toCoord.col !== ds.from.col)) {
        const toAlg = coordToAlgebraic(toCoord);
        if (legalMoveSet.has(toAlg)) {
          onDrop(ds.from, toCoord);
        }
      }
    }

    cleanupDrag();
  }, [getSquareFromPoint, legalMoveSet, onDrop, cleanupDrag]);

  return (
    <div
      className="w-full max-w-[min(90vw,85vh,640px)] rounded-lg overflow-hidden shadow-xl"
    >
      <div
        ref={boardRef}
        className="grid grid-cols-8 touch-none select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {board.map((row, r) =>
          row.map((piece, c) => {
            const alg = coordToAlgebraic({ row: r, col: c });
            const isSelected =
              selectedSquare !== null &&
              selectedSquare.row === r &&
              selectedSquare.col === c;
            const isDragSource =
              dragState.current?.isDragging === true &&
              dragState.current.from.row === r &&
              dragState.current.from.col === c;

            return (
              <Square
                key={`${r}-${c}`}
                row={r}
                col={c}
                piece={piece}
                isSelected={isSelected}
                isLegalMove={legalMoveSet.has(alg)}
                isCapture={captureSet.has(alg)}
                isLastMoveSquare={
                  lastMove !== null &&
                  (lastMove.from === alg || lastMove.to === alg)
                }
                isCheck={checkSquare === alg}
                isDragSource={isDragSource}
                showRank={c === 0}
                showFile={r === 7}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
