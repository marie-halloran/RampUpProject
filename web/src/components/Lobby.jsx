import { useState } from 'react';
import { useGameConnection } from '../context/GameConnectionContext';

/**
 * Landing screen where a player can create a new game or join an existing one
 * by entering a game code. Both actions run over the shared connection and set
 * the active game on the context.
 */
export default function Lobby() {
  const { createGame, joinGame, ready } = useGameConnection();
  const [joinCode, setJoinCode] = useState('');
  const [busy, setBusy] = useState(null); // 'create' | 'join' | null
  const [error, setError] = useState('');

  async function handleCreate() {
    setError('');
    setBusy('create');
    try {
      await createGame();
    } catch (err) {
      setError(err.message ?? 'Could not create game');
    } finally {
      setBusy(null);
    }
  }

  async function handleJoin(event) {
    event.preventDefault();
    setError('');
    setBusy('join');
    try {
      await joinGame(joinCode, { color: 'b' });
    } catch (err) {
      setError(err.message ?? 'Could not join game');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="lobby">
      <h1>♟ Chess</h1>
      <p className="muted">Create a new game or join one with a code.</p>

      <div className="lobby-cards">
        <section className="lobby-card">
          <h2>Create game</h2>
          <p className="muted">Start a new game and share the code with a friend.</p>
          <button
            type="button"
            className="primary-btn"
            onClick={handleCreate}
            disabled={busy !== null || !ready}
          >
            {busy === 'create' ? 'Creating…' : 'Create game'}
          </button>
        </section>

        <section className="lobby-card">
          <h2>Join game</h2>
          <form onSubmit={handleJoin}>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Enter game code"
              aria-label="Game code"
              maxLength={50}
            />
            <button
              type="submit"
              className="primary-btn"
              disabled={busy !== null || !ready || joinCode.trim() === ''}
            >
              {busy === 'join' ? 'Joining…' : 'Join game'}
            </button>
          </form>
        </section>
      </div>

      {error && <p className="error">{error}</p>}
    </div>
  );
}
