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
        await grain.GoOnline();
        return Ok(new { playerId });
    }

    [HttpGet("{playerId}")]
    public async Task<IActionResult> GetPlayer(string playerId)
    {
        var grain = _grainFactory.GetGrain<IPlayerGrain>(playerId);
        PlayerState playerState = await grain.GetPlayer();
        return Ok(playerState);
    }
}

public record CreatePlayerRequest(string PlayerName, string Color);