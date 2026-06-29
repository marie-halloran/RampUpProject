using ChessAPI.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();
builder.Services.AddSignalR();

builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseRouting();

app.UseCors("frontend");

app.UseAuthorization();

app.MapStaticAssets();
app.MapHub<GameHub>("/live");
app.MapPost("/game", async (HttpContext context) =>
{
    var gameId = Guid.NewGuid().ToString();
    context.Response.StatusCode = 201;
    await context.Response.WriteAsJsonAsync(new { gameId });
    //Propogate this info to cosmosdb and orleans so that the game can be created and tracked
});


app.MapRazorPages()
   .WithStaticAssets();

app.Run();