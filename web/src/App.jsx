import { Routes, Route, Navigate } from 'react-router-dom';
import Lobby from './components/Lobby';
import GameView from './components/GameView';
import { GameProvider } from './context/GameConnectionContext';
import './App.css';

function App() {
  return (
    <GameProvider>
      <main className="app">
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/game" element={<GameView />} />
          <Route path="/game/:gameId" element={<GameView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </GameProvider>
  );
}

export default App;
