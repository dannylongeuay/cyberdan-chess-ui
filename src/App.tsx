import { useChessGame } from './hooks/useChessGame';
import Board from './components/Board';
import GameControls from './components/GameControls';
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
    gameMode,
    humanColor,
    isComputerThinking,
    engineEval,
    flipped,
    toggleFlip,
    setGameMode,
    setHumanColor,
  } = useChessGame();

  return (
    <div className="min-h-dvh bg-gray-900 text-white flex flex-col items-center justify-center p-4 gap-2">
      <h1 className="text-2xl font-bold tracking-tight">Chess</h1>

      <GameInfo sideToMove={sideToMove} status={gameStatus} isComputerThinking={isComputerThinking} engineEval={engineEval} />

      <Board
        board={board}
        activeColor={activeColor}
        selectedSquare={selectedSquare}
        legalMoves={legalMovesForSquare}
        lastMove={lastMove}
        checkSquare={checkSquare}
        onSquareClick={selectSquare}
        onDrop={handleDrop}
        flipped={flipped}
      />

      <button
        onClick={toggleFlip}
        aria-label="Flip board orientation"
        className="px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer bg-gray-800 text-gray-400 hover:text-gray-200 rounded-lg"
      >
        Flip Board
      </button>

      <div className="h-6 flex items-center justify-center">
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {isLoading && !isComputerThinking && <p className="text-gray-400 text-sm">Thinking...</p>}
      </div>

      <GameControls
        gameMode={gameMode}
        humanColor={humanColor}
        onModeChange={setGameMode}
        onColorChange={setHumanColor}
      />

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
