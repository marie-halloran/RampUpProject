using Microsoft.AspNetCore.Mvc;

namespace ChessAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GameController : ControllerBase
{
    private readonly IGrainFactory _grainFactory;

    public GameController(IGrainFactory grainFactory) => _grainFactory = grainFactory;

    [HttpPost]
    public async Task<IActionResult> CreateGame([FromBody] CreateGameRequest request)
    {
        string playerId = Guid.NewGuid().ToString();
        var playerGrain = _grainFactory.GetGrain<IPlayerGrain>(playerId);
        await playerGrain.Create(request.PlayerName, "white", playerId);

        string gameId = Guid.NewGuid().ToString();
        var gameGrain = _grainFactory.GetGrain<IGameGrain>(gameId);
        await gameGrain.Create();
        await gameGrain.AddPlayer(playerId);

        return Ok(new { gameId, playerId });
    }
}

public record CreateGameRequest(string PlayerName);