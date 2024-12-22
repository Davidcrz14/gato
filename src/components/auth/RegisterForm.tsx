import React, { useState } from 'react';
import { register } from '../../services/authService';

interface RegisterFormProps {
  onSuccess: () => void;
  onLoginClick: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onLoginClick }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    try {
      const result = await register(username, password);
      if (result.success) {
        onSuccess();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Error al registrar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800/30 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-gray-700/30 w-full max-w-md">
      <h2 className="text-2xl font-bold text-purple-300 mb-6 text-center">Registro</h2>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-purple-200 mb-2">Usuario:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Elige un nombre de usuario"
            required
            minLength={3}
          />
        </div>

        <div>
          <label className="block text-purple-200 mb-2">Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Mínimo 6 caracteres"
            required
            minLength={6}
          />
        </div>

        <div>
          <label className="block text-purple-200 mb-2">Confirmar Contraseña:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Repite tu contraseña"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold transition-all
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 hover:scale-105'}`}
        >
          {isLoading ? 'Registrando...' : 'Registrarse'}
        </button>

        <button
          type="button"
          onClick={onLoginClick}
          className="w-full bg-gray-700/50 text-white py-2 rounded-lg hover:bg-gray-600/50 transition-all mt-4"
        >
          ¿Ya tienes cuenta? Inicia sesión
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
