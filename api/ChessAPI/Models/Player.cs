[GenerateSerializer]
public class Player
{
    [Id(0)]
    public string Name { get; set; } = string.Empty;

    [Id(1)]
    public string Color { get; set; } = string.Empty; // "white" or "black"
}