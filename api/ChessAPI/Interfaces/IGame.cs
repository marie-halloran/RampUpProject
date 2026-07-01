public interface IGameGrain : IGrainWithStringKey   // key = gameId
{
    Task Create();
    Task UpdateBoard(string board);
    Task<string?> GetBoard();
    Task<List<string>> GetPlayers();

    Task AddPlayer(string playerId);
    Task Close();
}