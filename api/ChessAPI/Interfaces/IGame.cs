public interface IGameGrain : IGrainWithStringKey   // key = gameId
{
    Task Create(string? status, List<string>? players);

    Task UpdateStatus(string status);

    Task<string?> GetStatus();
    Task UpdateBoard(string board);
    Task<string?> GetBoard();
    Task<List<string>> GetPlayers();
    Task AddPlayer(string playerId);
    Task RemovePlayer(string playerId);
    Task Close();
}