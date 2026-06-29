namespace ChessAPI.Models;

[GenerateSerializer]
public class GameState
{
    [Id(0)]
    public string GameId { get; set; } = string.Empty;
    
    [Id(1)]
    public string Status { get; set; } = "pending";  // pending, active, ended

    [Id(2)]
    public string Board { get; set; } = string.Empty;
}