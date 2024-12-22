import React, { useState, useEffect } from 'react';
import { RankingEntry } from '../../types/database';
import { getRankingByDifficulty } from '../../services/databaseService';

interface RankingTableProps {
  difficulty: string;
}

const RankingTable: React.FC<RankingTableProps> = ({ difficulty }) => {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRankings = async () => {
      setIsLoading(true);
      try {
        const data = await getRankingByDifficulty(difficulty);
        setRankings(data);
      } catch (err) {
        setError('Error al cargar el ranking');
      } finally {
        setIsLoading(false);
      }
    };

    loadRankings();
  }, [difficulty]);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-center py-4">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-gray-800/30 backdrop-blur-md rounded-xl overflow-hidden">
      <div className="px-4 py-3 bg-purple-900/30 border-b border-purple-500/30">
        <h3 className="text-lg font-semibold text-purple-200">
          Ranking - Dificultad {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </h3>
      </div>

      {rankings.length === 0 ? (
        <div className="text-gray-400 text-center py-8">
          No hay jugadores registrados en este nivel de dificultad
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left bg-gray-700/30">
                <th className="px-4 py-3 text-purple-200">#</th>
                <th className="px-4 py-3 text-purple-200">Usuario</th>
                <th className="px-4 py-3 text-purple-200">Victorias</th>
                <th className="px-4 py-3 text-purple-200">Total Partidas</th>
                <th className="px-4 py-3 text-purple-200">% Victoria</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((entry, index) => (
                <tr
                  key={index}
                  className={`
                    border-t border-gray-700/30
                    ${index === 0 ? 'bg-yellow-500/10' : ''}
                    ${index === 1 ? 'bg-gray-400/10' : ''}
                    ${index === 2 ? 'bg-amber-700/10' : ''}
                    hover:bg-gray-700/30 transition-colors
                  `}
                >
                  <td className="px-4 py-3">
                    {index + 1}
                    {index < 3 && (
                      <span className="ml-1">
                        {index === 0 && '🥇'}
                        {index === 1 && '🥈'}
                        {index === 2 && '🥉'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">{entry.username}</td>
                  <td className="px-4 py-3">{entry.wins}</td>
                  <td className="px-4 py-3">{entry.totalGames}</td>
                  <td className="px-4 py-3">{entry.winRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RankingTable;
