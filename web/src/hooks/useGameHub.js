import { useEffect, useRef, useState, useCallback } from 'react';
import { buildGameConnection } from '../services/realtime';

/**
 * Manages a SignalR connection scoped to a single game.
 * If initialGameId is provided, joins that game. Otherwise calls CreateGame
 * and exposes the assigned gameId once the server responds.
 * The connection object is stored in state and returned for callers that need it.
 */
export function useGameHub(initialGameId) {
  const [ready, setReady] = useState(false);
  const [connection, setConnection] = useState(null);
  const [gameId, setGameId] = useState(initialGameId ?? null);
  const handlersRef = useRef({});

  useEffect(() => {
    const conn = buildGameConnection();

    conn.on('ReceiveMove', (snapshot) => {
      handlersRef.current.onOpponentMove?.(snapshot);
    });

    conn.on('OpponentJoined', (player) => {
      handlersRef.current.onOpponentJoined?.(player);
    });

    conn
      .start()
      .then(async () => {
        if (initialGameId) {
          await conn.invoke('JoinGame', initialGameId);
        } else {
          const newId = await conn.invoke('CreateGame');
          setGameId(newId);
        }
        setConnection(conn);
        setReady(true);
      })
      .catch(console.error);

    return () => {
      setReady(false);
      setConnection(null);
      conn.stop();
    };
  }, []); // intentionally runs once on mount

  const sendMove = useCallback(
    (snapshot) => {
      if (!connection || !ready || !gameId) return Promise.resolve();
      return connection.invoke('SendMove', gameId, snapshot);
    },
    [connection, gameId, ready],
  );

  const setHandlers = useCallback((handlers) => {
    handlersRef.current = handlers ?? {};
  }, []);

  return { ready, connection, gameId, sendMove, setHandlers };
}
