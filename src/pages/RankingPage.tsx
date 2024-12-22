import React, { useState } from 'react';
import RankingTable from '../components/ranking/RankingTable';

const RankingPage: React.FC = () => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('easy');

  return (
    <div className="flex-1">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          Ranking de Jugadores
        </h1>

        <div className="mb-8">
          <div className="flex justify-center gap-4">
            {['easy', 'medium', 'hard'].map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => setSelectedDifficulty(difficulty)}
                className={`
                  px-6 py-3 rounded-lg font-semibold transition-all
                  ${selectedDifficulty === difficulty
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }
                `}
              >
                {difficulty === 'easy' && 'Fácil'}
                {difficulty === 'medium' && 'Medio'}
                {difficulty === 'hard' && 'Difícil'}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-6 shadow-xl border border-gray-700/30">
          <div className="text-xl font-semibold mb-4 text-purple-300">
            Ranking - {
              selectedDifficulty === 'easy' ? 'Dificultad Fácil' :
              selectedDifficulty === 'medium' ? 'Dificultad Media' :
              'Dificultad Difícil'
            }
          </div>
          <RankingTable difficulty={selectedDifficulty} />
        </div>
      </div>
    </div>
  );
};

export default RankingPage;
