import bcrypt from 'bcryptjs';
import { equalTo, get, orderByChild, push, query, ref, set } from 'firebase/database';
import { db } from '../config/firebase';
import { GameResult, RankingEntry, User } from '../types/database';

// Funciones de usuario
export const createUser = async (username: string, password: string): Promise<User | null> => {
  try {
    // Verificar si el usuario ya existe
    const usersRef = ref(db, 'users');
    const snapshot = await get(query(usersRef, orderByChild('username'), equalTo(username)));

    if (snapshot.exists()) {
      return null;
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: User = {
      id: Date.now(),
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    await set(ref(db, `users/${newUser.id}`), newUser);
    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
};

export const validateUser = async (username: string, password: string): Promise<User | null> => {
  try {
    const usersRef = ref(db, 'users');
    const snapshot = await get(query(usersRef, orderByChild('username'), equalTo(username)));

    if (!snapshot.exists()) return null;

    const users = Object.values(snapshot.val()) as User[];
    const user = users[0];

    if (await bcrypt.compare(password, user.password)) {
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

    const newGameRef = push(ref(db, 'gameResults'));
    await set(newGameRef, gameResult);
    return true;
  } catch (error) {
    console.error('Error saving game result:', error);
    return false;
  }
};

// Funciones de ranking
export const getRankingByDifficulty = async (difficulty: string): Promise<RankingEntry[]> => {
  try {
    const gameResultsRef = ref(db, 'gameResults');
    const usersRef = ref(db, 'users');

    const [gameSnapshot, usersSnapshot] = await Promise.all([
      get(query(gameResultsRef, orderByChild('difficulty'), equalTo(difficulty))),
      get(usersRef)
    ]);

    const users = usersSnapshot.val() || {};
    const gameResults = gameSnapshot.val() || {};

    const userStats = new Map<number, { wins: number; total: number }>();

    // Agrupar resultados por usuario
    Object.values(gameResults).forEach((result: any) => {
      if (result && typeof result === 'object') {
        const gameResult = result as GameResult;
        const stats = userStats.get(gameResult.userId) || { wins: 0, total: 0 };
        stats.total++;
        if (gameResult.won) stats.wins++;
        userStats.set(gameResult.userId, stats);
      }
    });

    // Crear ranking
    const rankings: RankingEntry[] = [];
    userStats.forEach((stats, userId) => {
      const user = users[userId];
      if (user) {
        rankings.push({
          username: user.username,
          wins: stats.wins,
          totalGames: stats.total,
          winRate: Math.round((stats.wins / stats.total) * 100)
        });
      }
    });

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
