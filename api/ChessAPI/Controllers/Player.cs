using ChessAPI.Models;
using Microsoft.AspNetCore.Mvc;

namespace ChessAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlayerController : ControllerBase
{
    private readonly IGrainFactory _grainFactory;

    public PlayerController(IGrainFactory grainFactory) => _grainFactory = grainFactory;

    [HttpPost]
    public async Task<IActionResult> CreatePlayer([FromBody] CreatePlayerRequest request)
    {
        string playerId = Guid.NewGuid().ToString();
        var grain = _grainFactory.GetGrain<IPlayerGrain>(playerId);
        await grain.Create(request.PlayerName, request.Color, playerId);
        return Ok(new { playerId });
    }
}

public record CreatePlayerRequest(string PlayerName, string Color);