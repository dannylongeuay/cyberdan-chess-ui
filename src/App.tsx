import { useChessGame } from './hooks/useChessGame';
import Board from './components/Board';
import GameInfo from './components/GameInfo';
import NewGameButton from './components/NewGameButton';
import PromotionDialog from './components/PromotionDialog';

function App() {
  const {
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
  } = useChessGame();

  return (
    <div className="min-h-dvh bg-gray-900 text-white flex flex-col items-center justify-center p-4 gap-2">
      <h1 className="text-2xl font-bold tracking-tight">Chess</h1>

      <GameInfo sideToMove={sideToMove} status={gameStatus} />

      <Board
        board={board}
        activeColor={activeColor}
        selectedSquare={selectedSquare}
        legalMoves={legalMovesForSquare}
        lastMove={lastMove}
        checkSquare={checkSquare}
        onSquareClick={selectSquare}
        onDrop={handleDrop}
      />

      <div className="h-6 flex items-center justify-center">
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {isLoading && <p className="text-gray-400 text-sm">Thinking...</p>}
      </div>

      <NewGameButton onClick={newGame} />

      {pendingPromotion && (
        <PromotionDialog
          color={activeColor}
          onSelect={handlePromotion}
        />
      )}
    </div>
  );
}

export default App;
