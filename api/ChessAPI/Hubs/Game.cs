using ChessAPI.Models;
using Microsoft.AspNetCore.SignalR;
using System.Text.Json;

namespace ChessAPI.Hubs
{
    public class GameHub : Hub
    {
        private readonly IGrainFactory _grainFactory;

        public GameHub(IGrainFactory grainFactory)
        {
            _grainFactory = grainFactory;
        }

        public async Task SendMove(string gameId, JsonElement snapshot)
        {
            var gameGrain = _grainFactory.GetGrain<IGameGrain>(gameId);
            await gameGrain.UpdateBoard(snapshot.GetRawText());
            await Clients.OthersInGroup(gameId).SendAsync("ReceiveMove", snapshot);
        }

        public async Task<object> JoinGame(string gameId, string playerName)
        {
            string playerId = Guid.NewGuid().ToString();
            var playerGrain = _grainFactory.GetGrain<IPlayerGrain>(playerId);
            await playerGrain.Create(playerName, "black", playerId);

            var gameGrain = _grainFactory.GetGrain<IGameGrain>(gameId);
            var currentBoard = await gameGrain.GetBoard();
            await gameGrain.AddPlayer(playerId);
            var players = await gameGrain.GetPlayers();
            var playersInfo = new List<PlayerState>();
            foreach (var id in players)
            {
                playersInfo.Add(await _grainFactory.GetGrain<IPlayerGrain>(id).GetPlayer());
            }
            await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
            await Clients.OthersInGroup(gameId).SendAsync("OpponentJoined", new { name = playerName });
            return new { board = currentBoard, players = playersInfo };
        }

        public async Task CloseGame(string gameId)
        {
            var gameGrain = _grainFactory.GetGrain<IGameGrain>(gameId);
            await gameGrain.Close();
            await Clients.OthersInGroup(gameId).SendAsync("GameClosed", gameId);
        }
    }
}