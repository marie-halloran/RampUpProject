using System.Text.Json;
using ChessAPI.Models;

public class GameGrain : Grain, IGameGrain
{
    private readonly IPersistentState<GameState> _state;

    public GameGrain([PersistentState("game", "profileStore")] IPersistentState<GameState> state)
        => _state = state;

    public async Task Create()
    {
        if (_state.State.Status == "active") return;
        _state.State.GameId = this.GetPrimaryKeyString();
        _state.State.Status = "active";
        await _state.WriteStateAsync();
    }

    public async Task<string?> GetBoard()
    {
        return _state.State.Board;
    }

    public async Task UpdateBoard(string board)
    {
        if (_state.State.Status != "active")
            throw new InvalidOperationException("game is not active");
        _state.State.Board = board;
        await _state.WriteStateAsync();
    }

    public async Task AddPlayer(string playerName, string color)
    {
        if (_state.State.Status != "active")
            throw new InvalidOperationException("game is not active");
        _state.State.Players.Add(new Player { Name = playerName, Color = color });
        await _state.WriteStateAsync();
    }

    public async Task<string?> GetPlayers()
    {
        return JsonSerializer.Serialize(_state.State.Players);
    }

    public async Task Close()
    {
        _state.State.Status = "ended";
        await _state.WriteStateAsync();
        DeactivateOnIdle();
    }
}