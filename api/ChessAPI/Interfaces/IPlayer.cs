public interface IPlayerGrain : IGrainWithStringKey   // key = gameId
{
    Task Create(string playerName, string color, string playerId);

    Task GoOnline();
    Task GoOffline();
}