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
        await _state.WriteStateAsync();            // persist to Cosmos
    }

    public async Task Update(string board)
    {
        if (_state.State.Status != "active")
            throw new InvalidOperationException("game is not active");
        _state.State.Board = board;
        await _state.WriteStateAsync();
    }

    public async Task Close()
    {
        _state.State.Status = "ended";
        await _state.WriteStateAsync();
        DeactivateOnIdle();
    }
}