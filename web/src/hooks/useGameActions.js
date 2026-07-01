import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { buildGameConnection } from '../services/realtime';
import { useGame } from '../context/GameConnectionContext';
import { fromBoardSnapshot } from '../game/chessSetup';

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
      const squares = fromBoardSnapshot(snapshot);
      if (squares) setBoard(squares);
    });

    conn.on('OpponentJoined', (player) => {
      setOpponent(player);
    });

    conn
      .start()
      .then(() => {
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

  const joinGame = useCallback(
    async (joinId) => {
      if (!connection || !ready) return;
      const raw = await connection.invoke('JoinGame', joinId);
      const squares = fromBoardSnapshot(raw);
      if (squares) setBoard(squares);
      setGameId(joinId);
    },
    [connection, ready, setBoard, setGameId],
  );

  const createGame = useCallback(
    async () => {
      if (!connection || !ready) return;
      const newId = await connection.invoke('CreateGame');
      setGameId(newId);
    },
    [connection, ready, setGameId],
  );

  const sendMove = useCallback(
    (snapshot) => {
      if (!connection || !ready || !gameId) return Promise.resolve();
      return connection.invoke('SendMove', gameId, snapshot);
    },
    [connection, ready, gameId],
  );

  return { sendMove, joinGame, createGame };
}


