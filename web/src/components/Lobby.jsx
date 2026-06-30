import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createNewGame } from '../services/realtime';


export default function Lobby() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [busy, setBusy] = useState(null); // 'create' | null
  const [error, setError] = useState('');

  async function handleCreate() {
    setError('');
    setBusy('create');
    try {
      const gameId = await createNewGame();
      navigate(`/game/${gameId}`);
    } catch (err) {
      setError(err.message ?? 'Could not create game');
    } finally {
      setBusy(null);
    }
  }

  function handleJoin(event) {
    event.preventDefault();
    const trimmed = joinCode.trim();
    if (trimmed) navigate(`/game/${trimmed}`);
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
            disabled={busy !== null}
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
              disabled={joinCode.trim() === ''}
            >
              {'Join game'}
            </button>
          </form>
        </section>
      </div>

      {error && <p className="error">{error}</p>}
    </div>
  );
}
