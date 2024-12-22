import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import Board from './components/Board'
import { getAIMove } from './services/geminiService'
import { getCurrentUser, logout } from './services/authService'
import { saveGameResult } from './services/databaseService'
import LoginForm from './components/auth/LoginForm'
import RegisterForm from './components/auth/RegisterForm'
import RankingPage from './pages/RankingPage'

function App() {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null))
  const [playerSymbol, setPlayerSymbol] = useState<'X' | 'O'>('X')
  const [difficulty, setDifficulty] = useState<string>('medium')
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)
  const [winner, setWinner] = useState<string | null>(null)
  const [theme, setTheme] = useState<'pink' | 'purple' | 'blue'>('purple')
  const [showLogin, setShowLogin] = useState(true)
  const [authView, setAuthView] = useState<'login' | 'register' | 'game'>('login')
  const [currentUser, setCurrentUser] = useState(getCurrentUser())

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    if (user) {
      setAuthView('game');
    }
  }, []);

  const handleGameEnd = async (winner: string | null) => {
    if (currentUser && winner) {
      await saveGameResult(
        currentUser.id,
        difficulty,
        winner === playerSymbol
      );
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setAuthView('login');
    setGameStarted(false);
  };

  const getThemeColors = () => {
    switch (theme) {
      case 'pink':
        return 'from-pink-900/50 to-purple-900/50 border-pink-700/30'
      case 'purple':
        return 'from-purple-900/50 to-indigo-900/50 border-purple-700/30'
      case 'blue':
        return 'from-blue-900/50 to-indigo-900/50 border-blue-700/30'
    }
  }

  return (
    <Router>
      <div className={`min-h-screen bg-gradient-to-br ${getThemeColors()} flex flex-col p-4`}>
        <nav className="w-full bg-gray-800/30 backdrop-blur-md p-4 rounded-xl mb-4 border border-gray-700/30">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Gato | Tres en Raya 😺
            </Link>
            <div className="flex gap-4 items-center">
              <Link to="/ranking" className="text-purple-200 hover:text-purple-300 transition-colors">
                Ranking
              </Link>
              {currentUser ? (
                <div className="flex items-center gap-4">
                  <span className="text-purple-200">
                    {currentUser.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-gray-700/50 px-4 py-2 rounded-lg hover:bg-gray-600/50 transition-all text-purple-200"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <Link
                  to="/"
                  className="bg-purple-500 px-4 py-2 rounded-lg hover:bg-purple-600 transition-all text-white"
                >
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/" element={
            <div className="flex-1 flex items-center justify-center">
              {!gameStarted ? (
                authView === 'login' ? (
                  <LoginForm
                    onSuccess={() => {
                      setCurrentUser(getCurrentUser());
                      setAuthView('game');
                    }}
                    onRegisterClick={() => setAuthView('register')}
                    onSkip={() => setAuthView('game')}
                  />
                ) : authView === 'register' ? (
                  <RegisterForm
                    onSuccess={() => {
                      setCurrentUser(getCurrentUser());
                      setAuthView('game');
                    }}
                    onLoginClick={() => setAuthView('login')}
                  />
                ) : (
                  <div className="bg-gray-800/30 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-gray-700/30 animate-fade-in">
                    <h2 className="text-2xl mb-6 text-center font-semibold text-purple-300">Configuración del Juego</h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block mb-2 text-purple-200">Elige tu símbolo:</label>
                        <select
                          className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={playerSymbol}
                          onChange={(e) => setPlayerSymbol(e.target.value as 'X' | 'O')}
                        >
                          <option value="X">X</option>
                          <option value="O">O</option>
                        </select>
                      </div>
                      <div>
                        <label className="block mb-2 text-purple-200">Dificultad:</label>
                        <select
                          className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={difficulty}
                          onChange={(e) => setDifficulty(e.target.value)}
                        >
                          <option value="easy">Fácil</option>
                          <option value="medium">Medio</option>
                          <option value="hard">Difícil</option>
                        </select>
                      </div>
                      <div>
                        <label className="block mb-2 text-purple-200">Tema:</label>
                        <div className="flex gap-2">
                          {['pink', 'purple', 'blue'].map((t) => (
                            <button
                              key={t}
                              onClick={() => setTheme(t as any)}
                              className={`flex-1 p-3 rounded-lg border transition-all ${
                                theme === t
                                  ? `bg-${t}-500/20 border-${t}-500`
                                  : 'bg-gray-700/50 border-gray-600 hover:bg-gray-600/50'
                              }`}
                            >
                              {t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:opacity-90 hover:scale-105 transition-all"
                        onClick={() => setGameStarted(true)}
                      >
                        Comenzar Juego
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div className="space-y-6 animate-fade-in">
                  <div className="text-center mb-4">
                    {winner ? (
                      <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                        {winner === 'empate' ? '¡Empate!' : `¡Ganador: ${winner}!`}
                      </div>
                    ) : (
                      <div className="text-xl text-purple-200">
                        Turno: {isPlayerTurn ? 'Jugador' : 'IA'}
                      </div>
                    )}
                  </div>
                  <Board squares={board} onClick={async (i) => {
                    if (!isPlayerTurn || board[i] || winner) return;
                    const newBoard = [...board];
                    newBoard[i] = playerSymbol;
                    setBoard(newBoard);
                    setIsPlayerTurn(false);

                    const gameWinner = calculateWinner(newBoard);
                    if (gameWinner) {
                      setWinner(gameWinner);
                      await handleGameEnd(gameWinner);
                      return;
                    }

                    try {
                      const aiSymbol = playerSymbol === 'X' ? 'O' : 'X';
                      await new Promise(resolve => setTimeout(resolve, 500));
                      const aiResponse = await getAIMove(newBoard, playerSymbol, difficulty);

                      if (!aiResponse.usedAI) {
                        console.warn('Usando lógica de respaldo - La IA no está disponible');
                      }

                      if (aiResponse.position >= 0 && aiResponse.position < 9 && !newBoard[aiResponse.position]) {
                        const aiBoard = [...newBoard];
                        aiBoard[aiResponse.position] = aiSymbol;
                        setBoard(aiBoard);

                        const finalWinner = calculateWinner(aiBoard);
                        if (finalWinner) {
                          setWinner(finalWinner);
                          await handleGameEnd(finalWinner);
                        }
                      }
                    } catch (error) {
                      console.error('Error en el turno de la IA:', error);
                    }

                    setIsPlayerTurn(true);
                  }} />
                  <div className="flex gap-3">
                    <button
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:opacity-90 hover:scale-105 transition-all"
                      onClick={() => {
                        setBoard(Array(9).fill(null));
                        setWinner(null);
                        setIsPlayerTurn(true);
                      }}
                    >
                      Nuevo Juego
                    </button>
                    <button
                      className="flex-1 bg-gray-700/50 backdrop-blur-sm text-white py-3 rounded-lg font-semibold hover:bg-gray-600/50 hover:scale-105 transition-all border border-gray-600/30"
                      onClick={() => setGameStarted(false)}
                    >
                      Configuración
                    </button>
                  </div>
                </div>
              )}
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

const calculateWinner = (squares: (string | null)[]) => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }

  if (squares.every(square => square !== null)) {
    return 'empate';
  }

  return null;
};

export default App;
