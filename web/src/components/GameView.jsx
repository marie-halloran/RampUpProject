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
  const { ...gameState } = useGame();
  const { sendMove, joinGame, createGame, leaveGame } = useGameActions();
  const [lastMove, setLastMove] = useState(null);
  const [syncState, setSyncState] = useState('idle'); // idle | sending | error

  useEffect(() => {
    if (!gameState.ready) return;
    if (urlGameId) {
      joinGame(urlGameId);
    } else {
      createGame();
    }

  }, [gameState.ready, urlGameId]); 


  async function handleMove(nextBoard, move) {
    gameState.setBoard(nextBoard);
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
          <h2>{gameState.gameId ? `Game ${gameState.gameId}` : 'Creating game…'}</h2>
          <p className="muted">{gameState.ready ? 'Connected' : 'Connecting…'}</p>
        </div>
        <button type="button" className="ghost-btn" onClick={async () => { await leaveGame(); navigate('/'); }}>
          Leave game
        </button>
      </header>

      <div className="game-body">
        <ChessBoard board={gameState.board} onMove={handleMove} />

        <aside className="game-sidebar">
          <section>
            <h3>Players</h3>
            <ul className="player-list">
              <li>
                <span className="dot you" /> {gameState.playerName || 'You'}
              </li>
              <li>
                <span className={`dot ${gameState.gameStatus === 'ended' ? 'ended' : gameState.opponent ? 'live' : 'waiting'}`} />
                {gameState.gameStatus === 'ended' ? 'Opponent Left' : gameState.opponent ? gameState.opponent.name : 'Waiting for opponent…'}
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
