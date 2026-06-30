import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChessBoard from './ChessBoard';
import { createInitialBoard, toBoardSnapshot } from '../game/chessSetup';
import { useGameConnection } from '../context/GameConnectionContext';

/**
 * Active game screen: shows the live board, player presence and move status.
 */
export default function GameView() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { game } = useGameConnection();
  const color = game?.color ?? 'w';
  const [board, setBoard] = useState(() => createInitialBoard());
  const [opponent, setOpponent] = useState(null);
  const [lastMove, setLastMove] = useState(null);
  const [syncState, setSyncState] = useState('idle'); // idle | sending | error
  const { sendMove, setHandlers, leaveGame } = useGameConnection();

  // Route live updates for this game (opponent presence + moves) into local state.
  useEffect(() => {
    setHandlers({
      onOpponentJoined: (player) => setOpponent(player),
      onOpponentMove: (snapshot) => {
        if (snapshot?.squares) setBoard(snapshot.squares);
      },
    });
    return () => setHandlers({});
  }, [setHandlers]);

  async function handleMove(nextBoard, move) {
    setBoard(nextBoard);
    setLastMove(move);
    setSyncState('sending');
    try {
      await sendMove(toBoardSnapshot(nextBoard));
      setSyncState('idle');
    } catch {
      setSyncState('error');
    }
  }

  return (
    <div className="game-view">
      <header className="game-header">
        <div>
          <h2>Game {gameId}</h2>
          <p className="muted">
            You are playing {color === 'w' ? 'White' : 'Black'}
          </p>
        </div>
        <button type="button" className="ghost-btn" onClick={() => { leaveGame(); navigate('/'); }}>
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
