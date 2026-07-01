import { Routes, Route, Navigate } from 'react-router-dom';
import Lobby from './components/Lobby';
import GameView from './components/GameView';
import { GameProvider } from './context/GameConnectionContext';
import './App.css';

function App() {
  return (
    <main className="app">
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/game" element={<GameProvider><GameView /></GameProvider>} />
        <Route path="/game/:gameId" element={<GameProvider><GameView /></GameProvider>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
}

export default App;
