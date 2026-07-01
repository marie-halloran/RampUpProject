import { createContext, useContext, useState } from 'react';
import { createInitialBoard } from '../game/chessSetup';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [gameId, setGameId] = useState(null);
  const [board, setBoard] = useState(() => createInitialBoard());
  const [ready, setReady] = useState(false);
  const [opponent, setOpponent] = useState(null);
  return (
    <GameContext.Provider value={{ gameId, setGameId, board, setBoard, ready, setReady, opponent, setOpponent }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}


