import { FC } from 'react';

interface SquareProps {
  value: string | null;
  onClick: () => void;
}

const Square: FC<SquareProps> = ({ value, onClick }) => {
  const getSymbolColor = () => {
    if (value === 'X') return 'text-pink-400';
    if (value === 'O') return 'text-purple-400';
    return 'text-gray-400';
  };

  return (
    <button
      className={`
        w-24 h-24
        bg-gray-800/50
        backdrop-blur-sm
        border-2 border-gray-700/50
        rounded-xl
        text-4xl font-bold
        ${getSymbolColor()}
        transition-all duration-300
        hover:bg-gray-700/50
        hover:border-gray-600
        hover:scale-105
        focus:outline-none
        focus:ring-2
        focus:ring-purple-500/50
        active:scale-95
        animate-fade-in
        shadow-lg
        flex items-center justify-center
      `}
      onClick={onClick}
    >
      {value && (
        <span className="animate-slide-in inline-block">
          {value}
        </span>
      )}
    </button>
  );
};

export default Square;
