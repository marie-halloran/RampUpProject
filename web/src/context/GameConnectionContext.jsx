import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';
import { connectToGame } from '../services/realtime';

/**
 * Holds the live SignalR connection for the active game so any component in the
 * tree can send moves or react to opponent updates without re-connecting.
 *
 * Value shape:
 *   sendMove(snapshot): Promise<void>  — broadcast a board snapshot
 *   setHandlers(handlers)              — register { onOpponentJoined, onOpponentMove }
 */
const GameConnectionContext = createContext(null);

export function GameConnectionProvider({ gameId, children }) {
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

  const setHandlers = useCallback((handlers) => {
    handlersRef.current = handlers ?? {};
  }, []);

  return (
    <GameConnectionContext.Provider value={{ sendMove, setHandlers }}>
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
