import { createContext, useContext, useState } from 'react';
import { createInitialBoard } from '../game/chessSetup';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [gameId, setGameId] = useState(null);
  const [board, setBoard] = useState(() => createInitialBoard());
  const [ready, setReady] = useState(false);
  const [opponent, setOpponent] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [playerId, setPlayerId] = useState(null);
  const [gameStatus, setGameStatus] = useState('pending'); // pending | active | finished
  return (
    <GameContext.Provider value={{ gameId, setGameId, board, setBoard, ready, setReady, opponent, setOpponent, playerName, setPlayerName, playerId, setPlayerId, gameStatus, setGameStatus }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}


