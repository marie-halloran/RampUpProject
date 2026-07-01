using ChessAPI.Models;
public interface IPlayerGrain : IGrainWithStringKey   // key = gameId
{
    Task Create(string playerName, string color, string playerId);
    Task<PlayerState> GetPlayer();
    Task GoOnline();
    Task GoOffline();
}