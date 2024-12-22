import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyCrvjrOWFWQF7dqey9udoqFgd9CTTnNXZ4';
const genAI = new GoogleGenerativeAI(API_KEY);

interface GameMove {
  position: number;
  usedAI: boolean;
}

export const getAIMove = async (
  board: (string | null)[],
  playerSymbol: 'X' | 'O',
  difficulty: string
): Promise<GameMove> => {
  const aiSymbol = playerSymbol === 'X' ? 'O' : 'X';

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Crear una representación visual del tablero para la IA
    const boardDisplay = `
    ${board[0] || '_'}|${board[1] || '_'}|${board[2] || '_'}
    ${board[3] || '_'}|${board[4] || '_'}|${board[5] || '_'}
    ${board[6] || '_'}|${board[7] || '_'}|${board[8] || '_'}`;

    // Analizar el estado actual del juego
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // horizontales
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // verticales
      [0, 4, 8], [2, 4, 6]             // diagonales
    ];

    // Encontrar líneas potenciales
    const potentialLines = lines.map(line => ({
      line,
      aiCount: line.filter(pos => board[pos] === aiSymbol).length,
      playerCount: line.filter(pos => board[pos] === playerSymbol).length,
      emptyCount: line.filter(pos => board[pos] === null).length
    }));

    const gameAnalysis = {
      aiThreats: potentialLines.filter(l => l.aiCount === 2 && l.emptyCount === 1),
      playerThreats: potentialLines.filter(l => l.playerCount === 2 && l.emptyCount === 1),
      aiOpportunities: potentialLines.filter(l => l.aiCount === 1 && l.emptyCount === 2),
      playerOpportunities: potentialLines.filter(l => l.playerCount === 1 && l.emptyCount === 2)
    };

    const prompt = `Eres una IA experta en tres en raya con años de experiencia. Analiza cuidadosamente este tablero y encuentra la jugada óptima.

    ESTADO ACTUAL DEL TABLERO:
    ${boardDisplay}

    ANÁLISIS DETALLADO:
    - Soy: '${aiSymbol}', Oponente: '${playerSymbol}'
    - Dificultad: ${difficulty}
    - Amenazas inmediatas de victoria para mí: ${gameAnalysis.aiThreats.length}
    - Amenazas inmediatas del oponente: ${gameAnalysis.playerThreats.length}
    - Oportunidades potenciales para mí: ${gameAnalysis.aiOpportunities.length}
    - Oportunidades potenciales del oponente: ${gameAnalysis.playerOpportunities.length}

    REGLAS ESTRATÉGICAS CRÍTICAS:
    1. Victoria inmediata: Si puedo ganar en este turno, DEBO hacerlo
    2. Bloqueo crítico: Si el oponente puede ganar en su próximo turno, DEBO bloquearlo
    3. Control del centro: La posición 4 (centro) es estratégicamente vital
    4. Dominio de esquinas: Las posiciones 0,2,6,8 (esquinas) son más valiosas que los lados
    5. Evitar trampas: No permitir que el oponente cree una bifurcación

    ESTRATEGIAS POR DIFICULTAD:
    ${difficulty === 'hard' ? `
    MODO DIFÍCIL - Estrategia Avanzada:
    - Priorizar crear bifurcaciones (dos amenazas simultáneas)
    - Bloquear TODAS las oportunidades del oponente
    - Si el oponente tiene esquinas opuestas, tomar un lado
    - Si tengo el centro, priorizar esquinas opuestas
    - Anticipar y prevenir jugadas de trampa del oponente
    - NO permitir que el oponente cree situaciones de doble amenaza` :
    difficulty === 'medium' ? `
    MODO MEDIO - Estrategia Básica:
    - Bloquear amenazas obvias
    - Intentar crear líneas propias
    - Preferir centro y esquinas` : `
    MODO FÁCIL - Estrategia Simple:
    - Jugar en cualquier posición válida
    - No requiere análisis profundo`}

    POSICIONES DISPONIBLES: ${board.map((cell, i) => cell === null ? i : '').filter(Boolean).join(', ')}

    INSTRUCCIÓN FINAL: Analiza el tablero según las reglas anteriores y devuelve SOLO EL NÚMERO de la mejor posición (0-8).
    NO des explicaciones, NO escribas texto adicional, SOLO EL NÚMERO.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const moveText = response.text().trim();
    console.log('Respuesta de Gemini:', moveText);

    const move = parseInt(moveText, 10);

    // Verificar si la jugada es válida
    if (!isNaN(move) && move >= 0 && move <= 8 && board[move] === null) {
      return { position: move, usedAI: true };
    }

    throw new Error('Respuesta de IA inválida');

  } catch (error) {
    console.error('Error al consultar a Gemini:', error);

    // Lógica de respaldo para cuando la IA falla
    const priorityPositions = [4, 0, 2, 6, 8, 1, 3, 5, 7];
    const fallbackMove = priorityPositions.find(pos => board[pos] === null) ?? board.findIndex(cell => cell === null);

    return {
      position: fallbackMove,
      usedAI: false
    };
  }
};
