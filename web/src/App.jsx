import Lobby from './components/Lobby';
import GameView from './components/GameView';
import { useGameConnection } from './context/GameConnectionContext';
import './App.css';

function App() {
  const { game, setGame } = useGameConnection();

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
