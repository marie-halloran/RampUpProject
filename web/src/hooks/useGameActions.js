import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { buildGameConnection } from '../services/realtime';
import { useGame } from '../context/GameConnectionContext';

/**
 * Connects to the game hub once on mount.
 * Reads an optional joinId from router state; if present calls JoinGame,
 * otherwise calls CreateGame. Updates gameId, board, ready, and opponent
 * in GameContext directly.
 */
export function useGameActions() {
  const { setGameId, setBoard, setReady, setOpponent, gameId, ready } = useGame();
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    const conn = buildGameConnection();

    conn.on('ReceiveMove', (snapshot) => {
      if (snapshot?.squares) setBoard(snapshot.squares);
    });

    conn.on('OpponentJoined', (player) => {
      setOpponent(player);
    });

    conn
      .start()
      .then(async () => {
        if (gameId) {
          const board = await conn.invoke('JoinGame', gameId);
          setBoard(board.squares);
          setGameId(gameId);
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
      setOpponent(null);
      setConnection(null);
      conn.stop(); //Disconnects from the game hub when the component unmounts or the effect is cleaned up
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sendMove = useCallback(
    (snapshot) => {
      if (!connection || !ready || !gameId) return Promise.resolve();
      return connection.invoke('SendMove', gameId, snapshot);
    },
    [connection, ready, gameId],
  );

  return { sendMove };
}


