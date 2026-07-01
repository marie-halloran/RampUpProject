namespace ChessAPI.Models;

[GenerateSerializer]
public class PlayerState
{
    [Id(0)]
    public string PlayerId { get; set; } = string.Empty;
    
    [Id(1)]
    public string Name { get; set; } = string.Empty;

    [Id(2)]
    public string Color { get; set; } = string.Empty; // "white" or "black"

    [Id(3)]
    public bool IsOnline { get; set; } = false; 
}