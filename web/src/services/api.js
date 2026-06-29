// API client for the chess backend.
//
// Game creation goes through the SignalR hub (CreateGame), so createGame here
// just delegates to the realtime layer. Joining is resolved client-side from
// the entered code; the actual hub JoinGame happens when GameView connects.

import { createGame as createGameOnServer } from './realtime';

/**
 * Create a new game. Resolves with the created game descriptor.
 * @returns {Promise<{ gameId: string, color: 'w' }>}
 */
export async function createGame() {
  const gameId = await createGameOnServer();
  return { gameId, color: 'w' };
}

/**
 * Join an existing game by id.
 * @param {string} gameId
 * @returns {Promise<{ gameId: string, color: 'b' }>}
 */
export async function joinGame(gameId) {
  const id = gameId.trim();
  if (!id) throw new Error('Game code is required');
  return { gameId: id, color: 'b' };
}
