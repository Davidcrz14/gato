import bcrypt from 'bcryptjs';
import { Pool } from 'mysql2/promise';
import { RankingEntry, User } from '../types/database';

// Configuración de la conexión a MySQL
const pool: Pool = mysql.createPool({
  host: 'starmarkagency.com',
  user: 'starmark_catgame',
  password: 'CONTRASEÑAMUYLARGA',
  database: 'starmark_catgame',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Funciones de usuario
export const createUser = async (username: string, password: string): Promise<User | null> => {
  try {
    // Verificar si el usuario ya existe
    const [existingUsers] = await pool.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if ((existingUsers as any[]).length > 0) {
      return null;
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdAt = new Date().toISOString();

    const [result] = await pool.execute(
      'INSERT INTO users (username, password, createdAt) VALUES (?, ?, ?)',
      [username, hashedPassword, createdAt]
    );

    const user: User = {
      id: (result as any).insertId,
      username,
      password: hashedPassword,
      createdAt
    };

    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
};

export const validateUser = async (username: string, password: string): Promise<User | null> => {
  try {
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    const user = (users as any[])[0];
    if (user && await bcrypt.compare(password, user.password)) {
      return user as User;
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
    const playedAt = new Date().toISOString();
    await pool.execute(
      'INSERT INTO game_results (userId, difficulty, won, playedAt) VALUES (?, ?, ?, ?)',
      [userId, difficulty, won, playedAt]
    );
    return true;
  } catch (error) {
    console.error('Error saving game result:', error);
    return false;
  }
};

// Funciones de ranking
export const getRankingByDifficulty = async (difficulty: string): Promise<RankingEntry[]> => {
  try {
    const [rows] = await pool.execute(`
      SELECT
        u.username,
        COUNT(CASE WHEN gr.won = 1 THEN 1 END) as wins,
        COUNT(*) as totalGames,
        ROUND((COUNT(CASE WHEN gr.won = 1 THEN 1 END) / COUNT(*)) * 100) as winRate
      FROM users u
      JOIN game_results gr ON u.id = gr.userId
      WHERE gr.difficulty = ?
      GROUP BY u.id, u.username
      ORDER BY wins DESC, winRate DESC
      LIMIT 10
    `, [difficulty]);

    return (rows as any[]).map(row => ({
      username: row.username,
      wins: row.wins,
      totalGames: row.totalGames,
      winRate: row.winRate
    }));
  } catch (error) {
    console.error('Error getting rankings:', error);
    return [];
  }
};

// Función para limpiar caracteres especiales
export const sanitizeInput = (input: string): string => {
  return input.replace(/[^a-zA-Z0-9_]/g, '');
};
