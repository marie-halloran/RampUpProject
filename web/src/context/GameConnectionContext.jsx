import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { connectToGame } from '../services/realtime';

/**
 * Holds the active game and its live SignalR connection so any component in the
 * tree can read the current game, send moves, or react to opponent updates.
 *
 * Value shape:
 *   game                               — the active game descriptor, or null
 *   setGame(game)                      — set/clear the active game (null leaves)
 *   getConnection(): connection | null — the live connection ({ disconnect, sendMove })
 *   sendMove(snapshot): Promise<void>  — broadcast a board snapshot
 *   setHandlers(handlers)              — register { onOpponentJoined, onOpponentMove }
 */
const GameConnectionContext = createContext(null);

export function GameConnectionProvider({ children }) {
  const [game, setGame] = useState(null);
  const gameId = game?.gameId ?? null;
  const connectionRef = useRef(null);
  // Latest consumer handlers, read indirectly so the connection never closes
  // over stale callbacks.
  const handlersRef = useRef({});

  useEffect(() => {
    if (!gameId) return undefined;

    const connection = connectToGame(gameId, {
      onOpponentJoined: (player) => handlersRef.current.onOpponentJoined?.(player),
      onOpponentMove: (snapshot) => handlersRef.current.onOpponentMove?.(snapshot),
    });
    connectionRef.current = connection;

    return () => {
      connectionRef.current = null;
      connection.disconnect();
    };
  }, [gameId]);

  const sendMove = useCallback(
    (snapshot) => connectionRef.current?.sendMove(gameId, snapshot) ?? Promise.resolve(),
    [gameId],
  );

  const getConnection = useCallback(() => connectionRef.current, []);

  const setHandlers = useCallback((handlers) => {
    handlersRef.current = handlers ?? {};
  }, []);

  return (
    <GameConnectionContext.Provider
      value={{ game, setGame, getConnection, sendMove, setHandlers }}
    >
      {children}
    </GameConnectionContext.Provider>
  );
}

export function useGameConnection() {
  const ctx = useContext(GameConnectionContext);
  if (!ctx) {
    throw new Error('useGameConnection must be used within a GameConnectionProvider');
  }
  return ctx;
}
