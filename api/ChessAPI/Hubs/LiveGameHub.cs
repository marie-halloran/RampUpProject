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
            await gameGrain.AddPlayer(playerId);
            var players = await gameGrain.GetPlayers();
            string? opponentId = players.FirstOrDefault(id => id != playerId);
            var statusTask = players.Count >= 2
                ? gameGrain.UpdateStatus("active")
                : Task.CompletedTask;
            await Task.WhenAll(
                playerGrain.GoOnline(),
                statusTask,
                Groups.AddToGroupAsync(Context.ConnectionId, gameId)
            );
            await Clients.OthersInGroup(gameId).SendAsync("OpponentJoined", playerId);
            return new { board = currentBoard, opponent = opponentId };
        }

        public async Task LeaveGame(string gameId, string playerId)
        {
            var gameGrain = _grainFactory.GetGrain<IGameGrain>(gameId);
            var playerGrain = _grainFactory.GetGrain<IPlayerGrain>(playerId);
            await Task.WhenAll(
                gameGrain.RemovePlayer(playerId),
                playerGrain.GoOffline(),
                gameGrain.UpdateStatus("ended"),
                Groups.RemoveFromGroupAsync(Context.ConnectionId, gameId)
            );
            await Clients.OthersInGroup(gameId).SendAsync("PlayerLeft", playerId);
        }
    }
}