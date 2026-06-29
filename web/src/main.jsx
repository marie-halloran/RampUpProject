import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GameConnectionProvider } from './context/GameConnectionContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GameConnectionProvider>
      <App />
    </GameConnectionProvider>
  </StrictMode>,
)
