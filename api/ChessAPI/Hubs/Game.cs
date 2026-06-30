using Microsoft.AspNetCore.SignalR;

namespace ChessAPI.Hubs
{
    public class GameHub : Hub
    {
        private readonly IGrainFactory _grainFactory;

        public GameHub(IGrainFactory grainFactory)
        {
            _grainFactory = grainFactory;
        }

        public async Task SendMove(string gameId, object snapshot)
        {
            Console.WriteLine($"move received for game {gameId}");
            Console.WriteLine($"move received for game {snapshot}");
            var grain = _grainFactory.GetGrain<IGameGrain>(gameId);
            await grain.Update(snapshot.ToString());
            await Clients.OthersInGroup(gameId).SendAsync("ReceiveMove", snapshot);
            //Instead of just sending moves back to client right away, will send to orleans
        }

        public async Task JoinGame(string gameId)
        {

            await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
            Console.WriteLine($"game joined: {gameId}");
        }
        public async Task<string> CreateGame()
        {
            var gameId = Guid.NewGuid().ToString();
            var grain = _grainFactory.GetGrain<IGameGrain>(gameId);
            await grain.Create();
            await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
            Console.WriteLine($"game created: {gameId}");
            //Create a game grain in orleans and store the gameId there so that it can be tracked
            return gameId;
        }

        public async Task CloseGame(string gameId)
        {
            var grain = _grainFactory.GetGrain<IGameGrain>(gameId);
            await grain.Close();
            await Clients.OthersInGroup(gameId).SendAsync("GameClosed", gameId);
            //Instead of just sending moves back to client right away, will send to orleans
        }
    }
}