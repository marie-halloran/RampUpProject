// Realtime connection for live multiplayer.
//
// Connects to the local ChessAPI SignalR hub (ChatHub mapped at /chatHub).
// This is a minimal "is it wired up?" integration: when you open a game we
// join the hub, announce ourselves with SendMessage, and surface any
// ReceiveMessage broadcasts back through the existing handler shape.
//
// Base URL comes from VITE_API_BASE_URL.

import {
  HubConnectionBuilder,
  HttpTransportType,
  LogLevel,
} from '@microsoft/signalr';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function buildConnection() {
  return new HubConnectionBuilder()
    .withUrl(`${API_BASE_URL}/game`, {
      transport: HttpTransportType.WebSockets,
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Information)
    .build();
}

/**
 * Create a new game on the server and resolve with its id.
 * Opens a short-lived connection just to invoke the hub's CreateGame.
 *
 * @returns {Promise<string>} the new gameId
 */
export async function createGame() {
  const connection = buildConnection();
  await connection.start();
  try {
    return await connection.invoke('CreateGame');
  } finally {
    await connection.stop();
  }
}

/**
 * Subscribe to live updates for a game.
 *
 * @param {string} gameId
 * @param {{
 *   onOpponentJoined?: (player: { name: string, color: 'w' | 'b' }) => void,
 *   onOpponentMove?: (snapshot: object) => void,
 *   onMessage?: (user: string, message: string) => void,
 * }} handlers
 * @returns {{ disconnect: () => void, send: (message: string) => void }}
 */
export function connectToGame(gameId, handlers = {}) {
  const connection = buildConnection();

  // GameHub broadcasts ReceiveMove(snapshot) to the other clients.
  connection.on('ReceiveMove', (snapshot) => {
    handlers.onOpponentMove?.(snapshot);
  });

  connection
    .start()
    .then(() => connection.invoke('JoinGame', gameId))
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error('SignalR connection failed:', err);
    });

  return {
    disconnect: () => connection.stop(),
    sendMove: (id, snapshot) =>
      connection.state === 'Connected'
        ? connection.invoke('SendMove', id, snapshot)
        : Promise.resolve(),
  };
}
