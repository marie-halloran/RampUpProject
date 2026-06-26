// API client for the chess backend.
//
// The real backend will be an Orleans (C#) service. It does not exist yet, so
// every call here is implemented as a local stub that mimics the eventual
// network contract. When the backend is ready, set VITE_API_BASE_URL and swap
// the stub bodies for real `fetch` calls — the signatures stay the same.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const USE_STUB = API_BASE_URL === '';

// Simple in-memory store so create/join behave consistently during local dev.
const stubGames = new Map();

function randomGameId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function delay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create a new game. Resolves with the created game descriptor.
 * @returns {Promise<{ gameId: string, color: 'w', players: string[] }>}
 */
export async function createGame() {
  if (USE_STUB) {
    await delay();
    const gameId = randomGameId();
    const game = { gameId, players: ['you'], color: 'w' };
    stubGames.set(gameId, game);
    return game;
  }

  const res = await fetch(`${API_BASE_URL}/games`, { method: 'POST' });
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

  if (USE_STUB) {
    await delay();
    const game = stubGames.get(id) ?? { gameId: id, players: ['host'] };
    const joined = {
      gameId: id,
      color: 'b',
      players: [...game.players, 'you'],
    };
    stubGames.set(id, joined);
    return joined;
  }

  const res = await fetch(`${API_BASE_URL}/games/${id}/join`, {
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
  if (USE_STUB) {
    await delay(80);
    // In stub mode we just log what would have been sent to Orleans.
    console.info(`[stub] move sent for game ${gameId}`, snapshot);
    return { ok: true };
  }

  const res = await fetch(`${API_BASE_URL}/games/${gameId}/moves`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(snapshot),
  });
  if (!res.ok) throw new Error(`Failed to send move (${res.status})`);
  return res.json();
}
