import { useEffect, useRef, useState } from 'react';
import ChessBoard from './ChessBoard';
import { createInitialBoard, toBoardSnapshot } from '../game/chessSetup';
import { sendMove } from '../services/api';
import { connectToGame } from '../services/realtime';

/**
 * Active game screen: shows the live board, player presence and move status.
 */
export default function GameView({ game, onLeave }) {
  const [board, setBoard] = useState(() => createInitialBoard());
  const [opponent, setOpponent] = useState(null);
  const [lastMove, setLastMove] = useState(null);
  const [syncState, setSyncState] = useState('idle'); // idle | sending | error
  const connectionRef = useRef(null);

  // Subscribe to live updates for this game (opponent presence + moves).
  useEffect(() => {
    const connection = connectToGame(game.gameId, {
      onOpponentJoined: (player) => setOpponent(player),
      onOpponentMove: (snapshot) => {
        if (snapshot?.squares) setBoard(snapshot.squares);
      },
    });
    connectionRef.current = connection;
    return () => {
      connectionRef.current = null;
      connection.disconnect();
    };
  }, [game.gameId]);

  async function handleMove(nextBoard, move) {
    setBoard(nextBoard);
    setLastMove(move);
    setSyncState('sending');

    // Broadcast the move over the live connection (no-op until connected).
    connectionRef.current?.send(`move:${move.from}-${move.to}`);

    try {
      await sendMove(game.gameId, toBoardSnapshot(nextBoard));
      setSyncState('idle');
    } catch {
      setSyncState('error');
    }
  }

  return (
    <div className="game-view">
      <header className="game-header">
        <div>
          <h2>Game {game.gameId}</h2>
          <p className="muted">
            You are playing {game.color === 'w' ? 'White' : 'Black'}
          </p>
        </div>
        <button type="button" className="ghost-btn" onClick={onLeave}>
          Leave game
        </button>
      </header>

      <div className="game-body">
        <ChessBoard board={board} onMove={handleMove} />

        <aside className="game-sidebar">
          <section>
            <h3>Players</h3>
            <ul className="player-list">
              <li>
                <span className="dot you" /> You ({game.color === 'w' ? 'White' : 'Black'})
              </li>
              <li>
                <span className={`dot ${opponent ? 'live' : 'waiting'}`} />
                {opponent ? `${opponent.name} (Black)` : 'Waiting for opponent…'}
              </li>
            </ul>
          </section>

          <section>
            <h3>Last move</h3>
            <p className="muted">
              {lastMove ? `${lastMove.piece}: ${lastMove.from} → ${lastMove.to}` : 'No moves yet'}
            </p>
          </section>

          <section>
            <h3>Sync</h3>
            <p className={`sync sync-${syncState}`}>
              {syncState === 'sending' && 'Sending move…'}
              {syncState === 'idle' && 'In sync'}
              {syncState === 'error' && 'Failed to reach server'}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
