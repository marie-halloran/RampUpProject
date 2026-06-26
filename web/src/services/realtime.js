// Realtime connection for live multiplayer.
//
// The production version will connect to the Orleans backend over SignalR or a
// WebSocket to stream the opponent's presence and moves. Until that exists,
// this stub simulates an opponent joining shortly after you open a game so the
// "live user" UI can be developed and demoed end-to-end.

const USE_STUB = (import.meta.env.VITE_API_BASE_URL ?? '') === '';

/**
 * Subscribe to live updates for a game.
 *
 * @param {string} gameId
 * @param {{
 *   onOpponentJoined?: (player: { name: string, color: 'w' | 'b' }) => void,
 *   onOpponentMove?: (snapshot: object) => void,
 * }} handlers
 * @returns {{ disconnect: () => void }}
 */
export function connectToGame(gameId, handlers = {}) {
  if (USE_STUB) {
    // Simulate a second player joining the live game after a short delay.
    const timer = setTimeout(() => {
      handlers.onOpponentJoined?.({ name: 'Opponent', color: 'b' });
    }, 1500);

    return {
      disconnect: () => clearTimeout(timer),
    };
  }

  // Placeholder for the real SignalR/WebSocket wiring.
  // const connection = new HubConnectionBuilder()...
  return { disconnect: () => {} };
}
