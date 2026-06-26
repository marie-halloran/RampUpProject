import { useState } from 'react';
import Lobby from './components/Lobby';
import GameView from './components/GameView';
import './App.css';

function App() {
  const [game, setGame] = useState(null);

  return (
    <main className="app">
      {game ? (
        <GameView game={game} onLeave={() => setGame(null)} />
      ) : (
        <Lobby onGameReady={setGame} />
      )}
    </main>
  );
}

export default App;
