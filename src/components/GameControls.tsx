import type { GameMode, HumanColor } from '../types/chess';

interface GameControlsProps {
  gameMode: GameMode;
  humanColor: HumanColor;
  onModeChange: (mode: GameMode) => void;
  onColorChange: (color: HumanColor) => void;
}

export default function GameControls({
  gameMode,
  humanColor,
  onModeChange,
  onColorChange,
}: GameControlsProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex rounded-lg overflow-hidden">
        <button
          onClick={() => onModeChange('pvp')}
          className={`px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
            gameMode === 'pvp'
              ? 'bg-gray-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-gray-200'
          }`}
        >
          Human vs Human
        </button>
        <button
          onClick={() => onModeChange('pvc')}
          className={`px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
            gameMode === 'pvc'
              ? 'bg-gray-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-gray-200'
          }`}
        >
          Human vs Computer
        </button>
      </div>

      {gameMode === 'pvc' && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Play as:</span>
          <div className="flex rounded-lg overflow-hidden">
            <button
              onClick={() => onColorChange('white')}
              className={`px-3 py-1 text-sm font-medium transition-colors cursor-pointer ${
                humanColor === 'white'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              White
            </button>
            <button
              onClick={() => onColorChange('black')}
              className={`px-3 py-1 text-sm font-medium transition-colors cursor-pointer ${
                humanColor === 'black'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              Black
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
