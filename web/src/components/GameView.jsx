import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ChessBoard from './ChessBoard';
import { toBoardSnapshot } from '../game/chessSetup';
import { useGame } from '../context/GameConnectionContext';
import { useGameActions } from '../hooks/useGameActions';

/**
 * Active game screen: shows the live board, player presence and move status.
 */
export default function GameView() {
  const navigate = useNavigate();
  const { gameId: urlGameId } = useParams();
  const { gameId, setGameId, board, setBoard, ready, opponent } = useGame();
  const { sendMove, joinGame, createGame } = useGameActions();
  const [lastMove, setLastMove] = useState(null);
  const [syncState, setSyncState] = useState('idle'); // idle | sending | error

  useEffect(() => {
    if (!ready) return;
    if (urlGameId) {
      joinGame(urlGameId);
    } else {
      createGame();
    }

  }, [ready, urlGameId]); 


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
          <h2>{gameId ? `Game ${gameId}` : 'Creating game…'}</h2>
          <p className="muted">{ready ? 'Connected' : 'Connecting…'}</p>
        </div>
        <button type="button" className="ghost-btn" onClick={() => navigate('/')}>
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
                <span className="dot you" /> You
              </li>
              <li>
                <span className={`dot ${opponent ? 'live' : 'waiting'}`} />
                {opponent ? opponent.name : 'Waiting for opponent…'}
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
