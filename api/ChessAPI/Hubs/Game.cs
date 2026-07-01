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
            Console.WriteLine($"move received for game {gameId}");
            var grain = _grainFactory.GetGrain<IGameGrain>(gameId);
            await grain.Update(snapshot.GetRawText());
            await Clients.OthersInGroup(gameId).SendAsync("ReceiveMove", snapshot);
        }

        public async Task<string?> JoinGame(string gameId)
        {
            //Just a listener right now
            var grain = _grainFactory.GetGrain<IGameGrain>(gameId);
            var currentBoard = await grain.GetBoard();
            await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
            await Clients.OthersInGroup(gameId).SendAsync("OpponentJoined", new { name = "Opponent" }); // notify the creator
            return currentBoard;
        }
        public async Task<string> CreateGame()
        {
            string gameId = Guid.NewGuid().ToString();
            IGameGrain grain = _grainFactory.GetGrain<IGameGrain>(gameId);
            await grain.Create();
            await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
            //Create a game grain in orleans and store the gameId there so that it can be tracked
            return gameId;
        }

        public async Task CloseGame(string gameId)
        {
            IGameGrain grain = _grainFactory.GetGrain<IGameGrain>(gameId);
            await grain.Close();
            await Clients.OthersInGroup(gameId).SendAsync("GameClosed", gameId);
            //Instead of just sending moves back to client right away, will send to orleans
        }
    }
}