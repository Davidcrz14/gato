import { FC } from 'react';
import Square from './Square';

interface BoardProps {
  squares: (string | null)[];
  onClick: (i: number) => void;
}

const Board: FC<BoardProps> = ({ squares, onClick }) => {
  return (
    <div className="board-grid animate-fade-in transform hover:scale-[1.02] transition-transform duration-300">
      <div className="grid grid-cols-3 gap-3 p-3 w-80">
        {squares.map((square, i) => (
          <Square
            key={i}
            value={square}
            onClick={() => onClick(i)}
          />
        ))}
      </div>
    </div>
  );
};

export default Board;
