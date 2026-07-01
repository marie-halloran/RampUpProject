using System.Text.Json;
using ChessAPI.Models;

public class PlayerGrain : Grain, IPlayerGrain
{
    private readonly IPersistentState<PlayerState> _state;

    public PlayerGrain([PersistentState("player", "profileStore")] IPersistentState<PlayerState> state)
        => _state = state;

    public async Task Create(string playerName, string color, string playerId)
    {
        if (_state.State.IsOnline) return;
        _state.State.PlayerId = playerId;
        _state.State.Name = playerName;
        _state.State.Color = color;
        _state.State.IsOnline = true;
        await _state.WriteStateAsync();
    }

    public async Task GoOnline()
    {
        _state.State.IsOnline = true;
        await _state.WriteStateAsync();
    }

    public async Task GoOffline()
    {
        _state.State.IsOnline = false;
        await _state.WriteStateAsync();
    }
}