interface NewGameButtonProps {
  onClick: () => void;
}

export default function NewGameButton({ onClick }: NewGameButtonProps) {
  return (
    <button
      onClick={onClick}
      className="mt-4 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-medium transition-colors cursor-pointer"
    >
      New Game
    </button>
  );
}
