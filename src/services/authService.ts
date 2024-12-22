import { User } from '../types/database';
import { createUser, validateUser, sanitizeInput } from './databaseService';

const AUTH_KEY = 'game_auth';

export const login = async (username: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    // Sanitizar inputs
    const cleanUsername = sanitizeInput(username);
    if (cleanUsername !== username) {
      return { success: false, message: 'El nombre de usuario contiene caracteres no permitidos' };
    }

    // Validar longitud mínima
    if (password.length < 6) {
      return { success: false, message: 'La contraseña debe tener al menos 6 caracteres' };
    }

    const user = await validateUser(cleanUsername, password);
    if (user) {
      // Guardar en localStorage
      const authData = {
        id: user.id,
        username: user.username,
        timestamp: new Date().getTime()
      };
      localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
      return { success: true, message: '¡Bienvenido!', user };
    }
    return { success: false, message: 'Usuario o contraseña incorrectos' };
  } catch (error) {
    console.error('Error en login:', error);
    return { success: false, message: 'Error al iniciar sesión' };
  }
};

export const register = async (username: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    // Sanitizar inputs
    const cleanUsername = sanitizeInput(username);
    if (cleanUsername !== username) {
      return { success: false, message: 'El nombre de usuario contiene caracteres no permitidos' };
    }

    // Validaciones
    if (username.length < 3) {
      return { success: false, message: 'El nombre de usuario debe tener al menos 3 caracteres' };
    }
    if (password.length < 6) {
      return { success: false, message: 'La contraseña debe tener al menos 6 caracteres' };
    }

    const user = await createUser(cleanUsername, password);
    if (user) {
      // Iniciar sesión automáticamente después del registro
      const authData = {
        id: user.id,
        username: user.username,
        timestamp: new Date().getTime()
      };
      localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
      return { success: true, message: '¡Registro exitoso!', user };
    }
    return { success: false, message: 'El nombre de usuario ya existe' };
  } catch (error) {
    console.error('Error en registro:', error);
    return { success: false, message: 'Error al registrar usuario' };
  }
};

export const logout = (): void => {
  localStorage.removeItem(AUTH_KEY);
};

export const getCurrentUser = (): { id: number; username: string } | null => {
  try {
    const authData = localStorage.getItem(AUTH_KEY);
    if (authData) {
      const userData = JSON.parse(authData);
      // Verificar si los datos son recientes (30 días)
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      if (new Date().getTime() - userData.timestamp < thirtyDays) {
        return {
          id: userData.id,
          username: userData.username
        };
      }
      // Si los datos son antiguos, cerrar sesión
      logout();
    }
    return null;
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};
