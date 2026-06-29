// Realtime connection for live multiplayer.
//
// Connects to the local ChessAPI SignalR hub (ChatHub mapped at /chatHub).
// This is a minimal "is it wired up?" integration: when you open a game we
// join the hub, announce ourselves with SendMessage, and surface any
// ReceiveMessage broadcasts back through the existing handler shape.
//
// Base URL defaults to the local backend; override with VITE_API_BASE_URL.

import {
  HubConnectionBuilder,
  HttpTransportType,
  LogLevel,
} from '@microsoft/signalr';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5242';

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
  const connection = new HubConnectionBuilder()
    .withUrl(`${API_BASE_URL}/chatHub`, {
      transport: HttpTransportType.WebSockets,
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Information)
    .build();

  // ChatHub broadcasts ReceiveMessage(user, message) to every client.
  connection.on('ReceiveMessage', (user, message) => {
    handlers.onMessage?.(user, message);

    // Treat a "joined" announcement as opponent presence for the game UI.
    if (typeof message === 'string' && message.startsWith('joined:')) {
      handlers.onOpponentJoined?.({ name: user, color: 'b' });
    }
  });

  // ChatHub broadcasts ReceiveMove(snapshot) to the other clients.
  connection.on('ReceiveMove', (snapshot) => {
    handlers.onOpponentMove?.(snapshot);
  });

  connection
    .start()
    .then(() => connection.invoke('SendMessage', 'you', `joined:${gameId}`))
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error('SignalR connection failed:', err);
    });

  return {
    disconnect: () => connection.stop(),
    send: (message) =>
      connection.state === 'Connected'
        ? connection.invoke('SendMessage', 'you', message)
        : Promise.resolve(),
    sendMove: (gameId, snapshot) =>
      connection.state === 'Connected'
        ? connection.invoke('SendMove', gameId, snapshot)
        : Promise.resolve(),
  };
}
