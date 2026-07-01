public interface IGameGrain : IGrainWithStringKey   // key = gameId
{
    Task Create();
    Task UpdateBoard(string board);
    Task<string?> GetBoard();
    Task<string?> GetPlayers();

    Task AddPlayer(string playerName, string color);
    Task Close();
}