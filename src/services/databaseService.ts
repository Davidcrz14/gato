import Dexie, { Table } from 'dexie';
import { User, GameResult, RankingEntry } from '../types/database';
import bcrypt from 'bcryptjs';

class GameDatabase extends Dexie {
  users!: Table<User>;
  gameResults!: Table<GameResult>;

  constructor() {
    super('GameDatabase');
    this.version(1).stores({
      users: '++id, username, password, createdAt',
      gameResults: '++id, userId, difficulty, won, playedAt'
    });
  }
}

const db = new GameDatabase();

// Funciones de usuario
export const createUser = async (username: string, password: string): Promise<User | null> => {
  try {
    // Verificar si el usuario ya existe
    const existingUser = await db.users.where('username').equals(username).first();
    if (existingUser) {
      return null;
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const user: User = {
      id: Date.now(), // Usar timestamp como ID
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    await db.users.add(user);
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
};

export const validateUser = async (username: string, password: string): Promise<User | null> => {
  try {
    const user = await db.users.where('username').equals(username).first();
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  } catch (error) {
    console.error('Error validating user:', error);
    return null;
  }
};

// Funciones de juego
export const saveGameResult = async (userId: number, difficulty: string, won: boolean): Promise<boolean> => {
  try {
    const gameResult: GameResult = {
      id: Date.now(),
      userId,
      difficulty: difficulty as 'easy' | 'medium' | 'hard',
      won,
      playedAt: new Date().toISOString()
    };

    await db.gameResults.add(gameResult);
    return true;
  } catch (error) {
    console.error('Error saving game result:', error);
    return false;
  }
};

// Funciones de ranking
export const getRankingByDifficulty = async (difficulty: string): Promise<RankingEntry[]> => {
  try {
    const allResults = await db.gameResults
      .where('difficulty')
      .equals(difficulty)
      .toArray();

    const userResults = new Map<number, { wins: number; total: number }>();

    // Agrupar resultados por usuario
    allResults.forEach(result => {
      const stats = userResults.get(result.userId) || { wins: 0, total: 0 };
      stats.total++;
      if (result.won) stats.wins++;
      userResults.set(result.userId, stats);
    });

    // Obtener nombres de usuario y calcular estadísticas
    const rankings: RankingEntry[] = [];
    for (const [userId, stats] of userResults.entries()) {
      const user = await db.users.get(userId);
      if (user) {
        rankings.push({
          username: user.username,
          wins: stats.wins,
          totalGames: stats.total,
          winRate: Math.round((stats.wins / stats.total) * 100)
        });
      }
    }

    // Ordenar por victorias y winRate
    return rankings.sort((a, b) =>
      b.wins - a.wins || b.winRate - a.winRate
    ).slice(0, 10);
  } catch (error) {
    console.error('Error getting rankings:', error);
    return [];
  }
};

// Función para limpiar caracteres especiales
export const sanitizeInput = (input: string): string => {
  return input.replace(/[^a-zA-Z0-9_]/g, '');
};
