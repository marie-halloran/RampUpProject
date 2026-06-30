import { useEffect, useRef, useState, useCallback } from 'react';
import { buildGameConnection } from '../services/realtime';

/**
 * Manages a SignalR connection scoped to a single game.
 * Connects, joins the game group, and exposes sendMove + handler registration.
 */
export function useGameHub(gameId) {
  const [ready, setReady] = useState(false);
  const connectionRef = useRef(null);
  const handlersRef = useRef({});

  useEffect(() => {
    if (!gameId) return;

    const connection = buildGameConnection();
    connectionRef.current = connection;

    connection.on('ReceiveMove', (snapshot) => {
      handlersRef.current.onOpponentMove?.(snapshot);
    });

    connection
      .start()
      .then(() => connection.invoke('JoinGame', gameId))
      .then(() => setReady(true))
      .catch(console.error);

    return () => {
      setReady(false);
      connectionRef.current = null;
      connection.stop();
    };
  }, [gameId]);

  const sendMove = useCallback(
    (snapshot) => {
      const connection = connectionRef.current;
      if (!connection || !ready) return Promise.resolve();
      return connection.invoke('SendMove', gameId, snapshot);
    },
    [gameId, ready],
  );

  const setHandlers = useCallback((handlers) => {
    handlersRef.current = handlers ?? {};
  }, []);

  return { ready, sendMove, setHandlers };
}
