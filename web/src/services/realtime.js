// Realtime connection for live multiplayer.
//
// Builds a single SignalR connection to the ChessAPI GameHub (mapped at /game).
// Lifecycle (start/stop), event handlers, and hub invokes (CreateGame,
// JoinGame, SendMove) are owned by GameConnectionContext so the whole session
// shares one connection.
//
// Base URL comes from VITE_API_BASE_URL.

import {
  HubConnectionBuilder,
  HttpTransportType,
  LogLevel,
} from '@microsoft/signalr';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Build a connection to the game hub. The caller starts, wires handlers,
 * invokes hub methods, and stops it.
 *
 * @returns {import('@microsoft/signalr').HubConnection}
 */
export function buildGameConnection() {
  return new HubConnectionBuilder()
    .withUrl(`${API_BASE_URL}/game`, {
      transport: HttpTransportType.WebSockets,
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Information)
    .build();
}

/**
 * Create a new game via a short-lived connection. Returns the new gameId.
 */
export async function createNewGame() {
  const connection = buildGameConnection();
  await connection.start();
  try {
    return await connection.invoke('CreateGame');
  } finally {
    await connection.stop();
  }
}

