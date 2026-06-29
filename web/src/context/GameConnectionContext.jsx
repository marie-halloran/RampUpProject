import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { buildGameConnection } from '../services/realtime';

/**
 * Holds ONE persistent SignalR connection for the whole session plus the active
 * game. Creating/joining a game are invokes on that single connection, so the
 * socket is never opened-then-closed and changing games never reconnects.
 *
 * Value shape:
 *   game                               — the active game descriptor, or null
 *   ready                              — whether the connection is established
 *   createGame(): Promise<string>      — create a game; sets it active, returns id
 *   joinGame(id, extra?): Promise<void>— join a game by id; sets it active
 *   leaveGame()                        — clear the active game (stays connected)
 *   sendMove(snapshot): Promise<void>  — broadcast a board snapshot
 *   setHandlers(handlers)              — register { onOpponentJoined, onOpponentMove }
 */
const GameConnectionContext = createContext(null);

export function GameConnectionProvider({ children }) {
  const [game, setGame] = useState(null);
  const [ready, setReady] = useState(false);
  const connectionRef = useRef(null);
  // Latest consumer handlers, read indirectly so the connection never closes
  // over stale callbacks.
  const handlersRef = useRef({});

  // Open a single connection for the lifetime of the provider.
  useEffect(() => {
    const connection = buildGameConnection();
    connectionRef.current = connection;

    connection.on('ReceiveMove', (snapshot) =>
      handlersRef.current.onOpponentMove?.(snapshot),
    );

    let cancelled = false;
    connection
      .start()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('SignalR connection failed:', err);
      });

    return () => {
      cancelled = true;
      connectionRef.current = null;
      setReady(false);
      connection.stop();
    };
  }, []);

  const createGame = useCallback(async () => {
    const connection = connectionRef.current;
    if (!connection) throw new Error('Not connected to server');
    const gameId = await connection.invoke('CreateGame');
    setGame({ gameId, color: 'w' });
    return gameId;
  }, []);

  const joinGame = useCallback(async (id, extra = {}) => {
    const connection = connectionRef.current;
    if (!connection) throw new Error('Not connected to server');
    const trimmed = id?.trim();
    if (!trimmed) throw new Error('Game code is required');
    await connection.invoke('JoinGame', trimmed);
    setGame({ gameId: trimmed, ...extra });
  }, []);

  const leaveGame = useCallback(() => setGame(null), []);

  const sendMove = useCallback(
    (snapshot) => {
      const connection = connectionRef.current;
      if (!connection || !game) return Promise.resolve();
      return connection.invoke('SendMove', game.gameId, snapshot);
    },
    [game],
  );

  const setHandlers = useCallback((handlers) => {
    handlersRef.current = handlers ?? {};
  }, []);

  return (
    <GameConnectionContext.Provider
      value={{ game, ready, createGame, joinGame, leaveGame, sendMove, setHandlers }}
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
