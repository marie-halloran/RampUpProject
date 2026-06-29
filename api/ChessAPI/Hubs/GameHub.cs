using Microsoft.AspNetCore.SignalR;

namespace ChessAPI.Hubs
{
    public class GameHub : Hub
    {
        public async Task SendMove(string gameId, object snapshot)
        {
            Console.WriteLine($"move received for game {gameId}");
            Console.WriteLine($"move received for game {snapshot}");
            await Clients.Others.SendAsync("ReceiveMove", snapshot);
        }
    }
}