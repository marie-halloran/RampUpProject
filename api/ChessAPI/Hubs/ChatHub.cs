using Microsoft.AspNetCore.SignalR;

namespace ChessAPI.Hubs
{
    public class ChatHub : Hub
    {
        public async Task SendMessage(string user, string message)
        {
            Console.Write("This is on the same line as ");
            Console.Write(user);
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }
    }
}