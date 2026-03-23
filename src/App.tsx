import { useChessGame } from './hooks/useChessGame';
import Board from './components/Board';
import BoardToolbar from './components/BoardToolbar';
import EvalBar from './components/EvalBar';
import GameControls from './components/GameControls';
import GameInfo from './components/GameInfo';
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
    backend,
    backends,
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
  } = useChessGame();

  const showEvalBar = gameMode !== 'pvp' && engineEval != null;

  return (
    <div className="min-h-dvh bg-gray-900 text-white flex flex-col items-center p-4 gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Chess</h1>

      <div className="flex flex-col lg:flex-row gap-4 w-full max-w-5xl items-center lg:items-start lg:justify-center">
        {/* Board area */}
        <div className="flex flex-col w-full max-w-[min(90vw,85vh,640px)] lg:max-w-[min(70vw,85vh,640px)]">
          <div className="flex flex-col">
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
            {showEvalBar && (
              <EvalBar engineEval={engineEval} flipped={flipped} />
            )}
          </div>
          <BoardToolbar onFlip={toggleFlip} onNewGame={newGame} />
        </div>

        {/* Side panel */}
        <div className="w-full lg:w-80 bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 flex flex-col gap-3">
          <GameInfo
            sideToMove={sideToMove}
            status={gameStatus}
            isComputerThinking={isComputerThinking}
            engineEval={engineEval}
          />

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          {isLoading && !isComputerThinking && (
            <p className="text-gray-400 text-sm text-center">Thinking...</p>
          )}

          <GameControls
            gameMode={gameMode}
            humanColor={humanColor}
            onModeChange={setGameMode}
            onColorChange={setHumanColor}
            backend={backend}
            backends={backends}
            onBackendChange={setBackend}
            whiteBackend={whiteBackend}
            blackBackend={blackBackend}
            onWhiteBackendChange={setWhiteBackend}
            onBlackBackendChange={setBlackBackend}
            autoplay={autoplay}
            onAutoplayChange={setAutoplay}
            depth={depth}
            timeoutSeconds={timeoutSeconds}
            onDepthChange={setDepth}
            onTimeoutChange={setTimeoutSeconds}
          />
        </div>
      </div>

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
