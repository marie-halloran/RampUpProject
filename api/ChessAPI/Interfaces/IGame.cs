public interface IGameGrain : IGrainWithStringKey   // key = gameId
{
    Task Create();
    Task Update(string board);
    Task<string?> GetBoard();
    Task Close();
}