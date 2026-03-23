import type { GameMode, HumanColor } from '../types/chess';
import type { Backend } from '../api/backends';

function ToggleGroup<T>({ items, selected, onChange, size = 'sm' }: {
  items: { key: string; label: string; value: T }[];
  selected: (value: T) => boolean;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
}) {
  const padding = size === 'md' ? 'px-4 py-1.5' : 'px-3 py-1';
  return (
    <div className="flex rounded-lg overflow-hidden">
      {items.map((item) => (
        <button
          key={item.key}
          onClick={() => onChange(item.value)}
          className={`${padding} text-sm font-medium transition-colors cursor-pointer ${
            selected(item.value)
              ? 'bg-gray-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-gray-200'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

interface GameControlsProps {
  gameMode: GameMode;
  humanColor: HumanColor;
  onModeChange: (mode: GameMode) => void;
  onColorChange: (color: HumanColor) => void;
  backend: Backend;
  backends: Backend[];
  onBackendChange: (backend: Backend) => void;
  whiteBackend: Backend;
  blackBackend: Backend;
  onWhiteBackendChange: (backend: Backend) => void;
  onBlackBackendChange: (backend: Backend) => void;
  autoplay: boolean;
  onAutoplayChange: (on: boolean) => void;
  depth: number;
  timeoutSeconds: number;
  onDepthChange: (depth: number) => void;
  onTimeoutChange: (seconds: number) => void;
}

const modeItems: { key: string; label: string; value: GameMode }[] = [
  { key: 'pvp', label: 'Human vs Human', value: 'pvp' },
  { key: 'pvc', label: 'Human vs Computer', value: 'pvc' },
  { key: 'cvc', label: 'Computer vs Computer', value: 'cvc' },
];

const colorItems: { key: string; label: string; value: HumanColor }[] = [
  { key: 'white', label: 'White', value: 'white' },
  { key: 'black', label: 'Black', value: 'black' },
];

function backendItems(backends: Backend[]) {
  return backends.map((b) => ({ key: b.url, label: b.label, value: b }));
}

export default function GameControls({
  gameMode,
  humanColor,
  onModeChange,
  onColorChange,
  backend,
  backends,
  onBackendChange,
  whiteBackend,
  blackBackend,
  onWhiteBackendChange,
  onBlackBackendChange,
  autoplay,
  onAutoplayChange,
  depth,
  timeoutSeconds,
  onDepthChange,
  onTimeoutChange,
}: GameControlsProps) {
  const bItems = backendItems(backends);

  return (
    <div className="flex flex-col items-center gap-2">
      <ToggleGroup
        items={modeItems}
        selected={(v) => v === gameMode}
        onChange={onModeChange}
        size="md"
      />

      {gameMode === 'cvc' && backends.length > 1 ? (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 w-12">White:</span>
            <ToggleGroup
              items={bItems}
              selected={(b) => whiteBackend.url === b.url}
              onChange={onWhiteBackendChange}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 w-12">Black:</span>
            <ToggleGroup
              items={bItems}
              selected={(b) => blackBackend.url === b.url}
              onChange={onBlackBackendChange}
            />
          </div>
        </div>
      ) : gameMode === 'pvc' && backends.length > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Engine:</span>
          <ToggleGroup
            items={bItems}
            selected={(b) => backend.url === b.url}
            onChange={onBackendChange}
          />
        </div>
      )}

      {gameMode === 'pvc' && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Play as:</span>
          <ToggleGroup
            items={colorItems}
            selected={(v) => v === humanColor}
            onChange={onColorChange}
          />
        </div>
      )}

      {gameMode === 'cvc' && (
        <button
          onClick={() => onAutoplayChange(!autoplay)}
          className={`px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer rounded-lg ${
            autoplay
              ? 'bg-green-700 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-gray-200'
          }`}
        >
          Autoplay {autoplay ? 'On' : 'Off'}
        </button>
      )}

      {gameMode !== 'pvp' && (
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-sm text-gray-400">
            Depth
            <select
              value={depth}
              onChange={(e) => onDepthChange(Number(e.target.value))}
              className="bg-gray-800 text-gray-200 text-sm rounded px-2 py-1 border border-gray-700 cursor-pointer"
            >
              {[5, 10, 15, 20, 25].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-1.5 text-sm text-gray-400">
            Timeout
            <select
              value={timeoutSeconds}
              onChange={(e) => onTimeoutChange(Number(e.target.value))}
              className="bg-gray-800 text-gray-200 text-sm rounded px-2 py-1 border border-gray-700 cursor-pointer"
            >
              {[1, 2, 3, 4, 5].map((s) => (
                <option key={s} value={s}>{s}s</option>
              ))}
            </select>
          </label>
        </div>
      )}
    </div>
  );
}
