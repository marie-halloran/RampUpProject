// Realtime connection for live multiplayer.
//
// Hub connection + REST helpers for player/game API.
// Base URL comes from VITE_API_BASE_URL.

import {
  HubConnectionBuilder,
  HttpTransportType,
  LogLevel,
} from '@microsoft/signalr';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function buildGameConnection() {
  return new HubConnectionBuilder()
    .withUrl(`${API_BASE_URL}/game/live`, {
      transport: HttpTransportType.WebSockets,
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Information)
    .build();
}

export async function apiCreatePlayer(playerName, color) {
  const res = await fetch(`${API_BASE_URL}/api/player`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerName, color }),
  });
  if (!res.ok) throw new Error('Failed to create player');
  const { playerId } = await res.json();
  return playerId;
}

export async function apiCreateGame(playerId) {
  const res = await fetch(`${API_BASE_URL}/api/game`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId }),
  });
  if (!res.ok) throw new Error('Failed to create game');
  const { gameId } = await res.json();
  return gameId;
}

export async function apiGetPlayer(playerId) {
  const res = await fetch(`${API_BASE_URL}/api/player/${playerId}`);
  if (!res.ok) throw new Error('Failed to get player');
  return res.json();
}

