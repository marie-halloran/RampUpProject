// API client for the chess backend.
//
// The real backend will be an Orleans (C#) service. It does not exist yet, so
// every call here is implemented as a local stub that mimics the eventual
// network contract. When the backend is ready, set VITE_API_BASE_URL and swap
// the stub bodies for real `fetch` calls — the signatures stay the same.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';


function randomGameId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function delay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create a new game. Resolves with the created game descriptor.
 * @returns {Promise<{ gameId: string, sessionId: string, color: 'w', players: string[] }>}
 */
export async function createGame() {
  const res = await fetch(`${API_BASE_URL}/game`, { method: 'POST' });
  if (!res.ok) throw new Error(`Failed to create game (${res.status})`);
  return res.json();
}

/**
 * Join an existing game by id.
 * @param {string} gameId
 * @returns {Promise<{ gameId: string, color: 'w' | 'b', players: string[] }>}
 */
export async function joinGame(gameId) {
  const id = gameId.trim().toUpperCase();
  if (!id) throw new Error('Game code is required');
  const res = await fetch(`${API_BASE_URL}/game/${id}/join`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Failed to join game (${res.status})`);
  return res.json();
}

/**
 * Send a move (the full board snapshot) to the backend.
 * @param {string} gameId
 * @param {object} snapshot board snapshot from toBoardSnapshot()
 */
export async function sendMove(gameId, snapshot) {
  const res = await fetch(`${API_BASE_URL}/game/${gameId}/moves`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(snapshot),
  });
  if (!res.ok) throw new Error(`Failed to send move (${res.status})`);
  return res.json();
}
