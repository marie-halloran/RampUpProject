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

        public async Task<string> CreatePlayer(string playerName, string color)
        {
            string playerId = Guid.NewGuid().ToString();
            var playerGrain = _grainFactory.GetGrain<IPlayerGrain>(playerId);
            await playerGrain.Create(playerName, color, playerId);
            return playerId;
        }

        public async Task SendMove(string gameId, JsonElement snapshot)
        {
            var gameGrain = _grainFactory.GetGrain<IGameGrain>(gameId);
            await gameGrain.UpdateBoard(snapshot.GetRawText());
            await Clients.OthersInGroup(gameId).SendAsync("ReceiveMove", snapshot);
        }

        public async Task<object> JoinGame(string gameId, string playerName)
        {
            var playerId = await CreatePlayer(playerName, "black");

            var gameGrain = _grainFactory.GetGrain<IGameGrain>(gameId);
            var currentBoard = await gameGrain.GetBoard();
            await gameGrain.AddPlayer(playerId);
            var players = await gameGrain.GetPlayers();
            List<PlayerState> playersInfo = new List<PlayerState>();
            foreach (string p1 in players) {   
                playersInfo.Add(await _grainFactory.GetGrain<IPlayerGrain>(p1).GetPlayer());
            }
            await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
            await Clients.OthersInGroup(gameId).SendAsync("OpponentJoined", new { name = playerName });
            return new { board = currentBoard, players = playersInfo };
        }
        public async Task<string> CreateGame(string playerName)
        {

            //TODO move this code to a separate endpoint
            string playerId = await CreatePlayer(playerName, "white");

            string gameId = Guid.NewGuid().ToString();
            IGameGrain gameGrain = _grainFactory.GetGrain<IGameGrain>(gameId);
            await gameGrain.Create();
            await gameGrain.AddPlayer(playerId);


            await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
            //Create a game grain in orleans and store the gameId there so that it can be tracked
            return gameId;
        }

        public async Task CloseGame(string gameId)
        {
            IGameGrain gameGrain = _grainFactory.GetGrain<IGameGrain>(gameId);
            await gameGrain.Close();
            await Clients.OthersInGroup(gameId).SendAsync("GameClosed", gameId);
            //Instead of just sending moves back to client right away, will send to orleans
        }
    }
}