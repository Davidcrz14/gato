export interface User {
  id: number;
  username: string;
  password: string; // Será almacenado como hash
  createdAt: string;
}
i
export interface GameResult {
  id: number;
  userId: number;
  difficulty: 'easy' | 'medium' | 'hard';
  won: boolean;
  playedAt: string;
}

export interface RankingEntry {
  username: string;
  wins: number;
  totalGames: number;
  winRate: number;
}
