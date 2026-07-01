import { useEffect, useState, useCallback } from 'react';
import { buildGameConnection, apiCreatePlayer, apiCreateGame, apiGetPlayer } from '../services/realtime';
import { useGame } from '../context/GameConnectionContext';
import { fromBoardSnapshot } from '../game/chessSetup';

export function useGameActions() {
  const { setGameId, setBoard, setReady, setOpponent, setGameStatus, gameId, ready, playerName, playerId, setPlayerId } = useGame();
  const [connection, setConnection] = useState(null);

  // Ensure a player grain exists for this session; creates one if needed.
  const ensurePlayer = useCallback(async (color) => {
    if (playerId) return playerId;
    const newId = await apiCreatePlayer(playerName, color);
    setPlayerId(newId);
    return newId;
  }, [playerId, playerName, setPlayerId]);

  useEffect(() => {
    const conn = buildGameConnection();

    conn.on('ReceiveMove', (snapshot) => {
      const squares = fromBoardSnapshot(snapshot);
      if (squares) setBoard(squares);
    });

    conn.on('OpponentJoined', async (opponentPlayerId) => {
      try {
        const player = await apiGetPlayer(opponentPlayerId);
        setOpponent(player);
      } catch (err) {
        console.error('Failed to fetch opponent info:', err);
      }
    });

    conn.on('PlayerLeft', () => {
      setOpponent(null);
      setGameStatus('ended');
    });

    conn
      .start()
      .then(() => {
        setConnection(conn);
        setReady(true);
      })
      .catch(console.error);

    return async () => {
      await connection.invoke('LeaveGame', gid, pid);
      setReady(false);
      setOpponent(null);
      setGameStatus('ended');
      setConnection(null);
      conn.stop();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Best-effort LeaveGame when the tab/browser is closed.
  useEffect(() => {
    const handleUnload = () => {
      if (connection && gameId && playerId) {
        connection.send('LeaveGame', gameId, playerId);
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [connection, gameId, playerId]);

  const createGame = useCallback(async () => {
    if (!connection || !ready) return;
    const pid = await ensurePlayer('white');
    const gid = await apiCreateGame(pid);
    await connection.invoke('JoinGame', gid, pid);
    setGameId(gid);
  }, [connection, ready, ensurePlayer, setGameId]);

  const joinGame = useCallback(async (joinId) => {
    if (!connection || !ready) return;
    const pid = await ensurePlayer('black');
    const { board, opponent: opponentId } = await connection.invoke('JoinGame', joinId, pid);
    const squares = fromBoardSnapshot(board);
    if (squares) setBoard(squares);
    if (opponentId) {
      const opponentInfo = await apiGetPlayer(opponentId);
      setOpponent(opponentInfo);
    }
    setGameId(joinId);
  }, [connection, ready, ensurePlayer, setBoard, setGameId, setOpponent]);

  const leaveGame = useCallback(async () => {
    if (!connection || !gameId || !playerId) return;
    await connection.invoke('LeaveGame', gameId, playerId);
    setGameStatus('ended');
  }, [connection, gameId, playerId, setGameStatus]);

  const sendMove = useCallback((snapshot) => {
    if (!connection || !ready || !gameId) return Promise.resolve();
    return connection.invoke('SendMove', gameId, snapshot);
  }, [connection, ready, gameId]);

  return { sendMove, joinGame, createGame, leaveGame };
}


