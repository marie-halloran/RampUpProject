import { Routes, Route, Navigate } from 'react-router-dom';
import Lobby from './components/Lobby';
import GameView from './components/GameView';
import './App.css';

function App() {
  return (
    <main className="app">
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/game/:gameId" element={<GameView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
}

export default App;
