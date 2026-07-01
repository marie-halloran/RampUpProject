import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameConnectionContext';

export default function Lobby() {
  const navigate = useNavigate();
  const { playerName, setPlayerName } = useGame();
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  const hasName = playerName.trim() !== '';

  function handleCreate() {
    navigate('/game');
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

      <section className="lobby-card">
        <h2>Your name</h2>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          aria-label="Player name"
          maxLength={30}
        />
      </section>

      <div className="lobby-cards">
        <section className="lobby-card">
          <h2>Create game</h2>
          <p className="muted">Start a new game and share the code with a friend.</p>
          <button
            type="button"
            className="primary-btn"
            onClick={handleCreate}
            disabled={!hasName}
          >
            Create game
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
              disabled={!hasName || joinCode.trim() === ''}
            >
              Join game
            </button>
          </form>
        </section>
      </div>

      {error && <p className="error">{error}</p>}
    </div>
  );
}
