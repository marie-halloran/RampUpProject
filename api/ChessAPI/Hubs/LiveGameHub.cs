using ChessAPI.Models;
using Microsoft.AspNetCore.SignalR;
using System.Text.Json;

namespace ChessAPI.Hubs
{
    public class LiveGameHub : Hub
    {
        private readonly IGrainFactory _grainFactory;

        public LiveGameHub(IGrainFactory grainFactory)
        {
            _grainFactory = grainFactory;
        }

        public async Task SendMove(string gameId, JsonElement snapshot)
        {
            var gameGrain = _grainFactory.GetGrain<IGameGrain>(gameId);
            await gameGrain.UpdateBoard(snapshot.GetRawText());
            await Clients.OthersInGroup(gameId).SendAsync("ReceiveMove", snapshot);
        }

        public async Task<object> JoinGame(string gameId, string playerId)
        {
            var gameGrain = _grainFactory.GetGrain<IGameGrain>(gameId);
            var playerGrain = _grainFactory.GetGrain<IPlayerGrain>(playerId);
            string? currentBoard = await gameGrain.GetBoard();
            string? opponentId = (await gameGrain.GetPlayers()).FirstOrDefault(id => id != playerId);
            await playerGrain.GoOnline();
            await gameGrain.AddPlayer(playerId);
            await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
            await Clients.OthersInGroup(gameId).SendAsync("OpponentJoined", playerId);
            return new { board = currentBoard, opponent = opponentId  };
        }

        public async Task LeaveGame(string gameId, string playerId)
        {
            var gameGrain = _grainFactory.GetGrain<IGameGrain>(gameId);
            var playerGrain = _grainFactory.GetGrain<IPlayerGrain>(playerId);
            await gameGrain.RemovePlayer(playerId);
            await playerGrain.GoOffline();
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, gameId);
            await Clients.OthersInGroup(gameId).SendAsync("PlayerLeft", playerId);
        }
    }
}