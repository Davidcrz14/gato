import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { GameResult, RankingEntry, User } from '../types/database';

const supabase = createClient(
  'https://zpffqunyntmssjfjjnji.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwZmZxdW55bnRtc3NqZmpqbmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUwMDU5ODksImV4cCI6MjA1MDU4MTk4OX0.PV-FJ75T25iWQePgplJimJb6hkVoUi9z5q84QSkvDu8'
);

// Funciones de usuario
export const createUser = async (username: string, password: string): Promise<User | null> => {
  try {
    // Verificar si el usuario ya existe
    const { data: existingUser } = await supabase
      .from('users')
      .select()
      .eq('username', username)
      .single();

    if (existingUser) {
      return null;
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const user: User = {
      id: Date.now(),
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
};

export const validateUser = async (username: string, password: string): Promise<User | null> => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select()
      .eq('username', username)
      .single();

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

    const { error } = await supabase
      .from('game_results')
      .insert([gameResult]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving game result:', error);
    return false;
  }
};

interface GameResultWithUser {
  userId: number;
  won: boolean;
  users: {
    username: string;
  };
}

// Funciones de ranking
export const getRankingByDifficulty = async (difficulty: string): Promise<RankingEntry[]> => {
  try {
    const { data: results, error } = await supabase
      .from('game_results')
      .select(`
        userId,
        won,
        users (
          username
        )
      `)
      .eq('difficulty', difficulty) as { data: GameResultWithUser[] | null, error: any };

    if (error) throw error;
    if (!results) return [];

    const userStats = new Map<number, { username: string; wins: number; total: number }>();

    results.forEach(result => {
      const userId = result.userId;
      const stats = userStats.get(userId) || {
        username: result.users.username,
        wins: 0,
        total: 0
      };

      stats.total++;
      if (result.won) stats.wins++;
      userStats.set(userId, stats);
    });

    const rankings: RankingEntry[] = Array.from(userStats.values()).map(stats => ({
      username: stats.username,
      wins: stats.wins,
      totalGames: stats.total,
      winRate: Math.round((stats.wins / stats.total) * 100)
    }));

    return rankings.sort((a, b) =>
      b.wins - a.wins || b.winRate - a.winRate
    ).slice(0, 10);
  } catch (error) {
    console.error('Error getting rankings:', error);
    return [];
  }
};

export const sanitizeInput = (input: string): string => {
  return input.replace(/[^a-zA-Z0-9_]/g, '');
};
