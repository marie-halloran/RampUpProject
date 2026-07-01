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
        string gameId = Guid.NewGuid().ToString();
        var gameGrain = _grainFactory.GetGrain<IGameGrain>(gameId);
        await gameGrain.Create(status: "pending", players: new List<string> { request.PlayerId });
        return Ok(new { gameId });
    }
}

public record CreateGameRequest(string PlayerId);