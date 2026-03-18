interface BoardToolbarProps {
  onFlip: () => void;
  onNewGame: () => void;
}

export default function BoardToolbar({ onFlip, onNewGame }: BoardToolbarProps) {
  return (
    <div className="flex gap-2 justify-center pt-2">
      <button
        onClick={onFlip}
        aria-label="Flip board orientation"
        className="px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer bg-gray-800 text-gray-400 hover:text-gray-200 rounded-lg"
      >
        Flip Board
      </button>
      <button
        onClick={onNewGame}
        className="px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer bg-gray-800 text-gray-400 hover:text-gray-200 rounded-lg"
      >
        New Game
      </button>
    </div>
  );
}
