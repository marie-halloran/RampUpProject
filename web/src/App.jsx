import { useState } from 'react';
import Lobby from './components/Lobby';
import GameView from './components/GameView';
import { GameConnectionProvider } from './context/GameConnectionContext';
import './App.css';

function App() {
  const [game, setGame] = useState(null);

  return (
    <main className="app">
      {game ? (
        <GameConnectionProvider key={game.gameId} gameId={game.gameId}>
          <GameView game={game} onLeave={() => setGame(null)} />
        </GameConnectionProvider>
      ) : (
        <Lobby onGameReady={setGame} />
      )}
    </main>
  );
}

export default App;
