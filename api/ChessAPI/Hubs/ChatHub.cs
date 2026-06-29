using Microsoft.AspNetCore.SignalR;

namespace ChessAPI.Hubs
{
    public class ChatHub : Hub
    {
        public async Task SendMessage(string user, string message)
        {
            Console.WriteLine($"{user}: {message}");
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

        public async Task SendMove(string gameId, object snapshot)
        {
            Console.WriteLine($"move received for game {gameId}");
            await Clients.Others.SendAsync("ReceiveMove", snapshot);
        }
    }
}