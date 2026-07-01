using System.Text.Json;
using ChessAPI.Models;

public class GameGrain : Grain, IGameGrain
{
    private readonly IPersistentState<GameState> _state;

    public GameGrain([PersistentState("game", "profileStore")] IPersistentState<GameState> state)
        => _state = state;

    public async Task Create(string? status, List<string>? players)
    {
        _state.State.GameId = this.GetPrimaryKeyString();
        if (status != null) _state.State.Status = status;
        _state.State.Players = players ?? new List<string>();
        await _state.WriteStateAsync();
    }

    public async Task UpdateStatus(string status)
    {
        _state.State.Status = status;
        await _state.WriteStateAsync();
    }

    public async Task<string?> GetStatus()
    {
        return _state.State.Status;
    }

    public async Task<string?> GetBoard()
    {
        return _state.State.Board;
    }

    public async Task UpdateBoard(string board)
    {
        _state.State.Board = board;
        await _state.WriteStateAsync();
    }

    public async Task AddPlayer(string playerId)
    {
        if (_state.State.Players.Contains(playerId)) return;
        _state.State.Players.Add(playerId);
        await _state.WriteStateAsync();
    }

    public async Task RemovePlayer(string playerId)
    {
        _state.State.Players.Remove(playerId);
        await _state.WriteStateAsync();
    }

    public async Task<List<string>> GetPlayers()
    {
        return _state.State.Players;

    }

    public async Task Close()
    {
        _state.State.Status = "ended";
        await _state.WriteStateAsync();
        DeactivateOnIdle();
    }
}