import Lobby from './components/Lobby';
import GameView from './components/GameView';
import { useGameConnection } from './context/GameConnectionContext';
import './App.css';

function App() {
  const { game, leaveGame } = useGameConnection();

  return (
    <main className="app">
      {game ? (
        <GameView game={game} onLeave={leaveGame} />
      ) : (
        <Lobby />
      )}
    </main>
  );
}

export default App;
