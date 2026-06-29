using ChessAPI.Hubs;
using Microsoft.Extensions.Hosting;
using Orleans.Hosting;

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

// Orleans silo. Local clustering + in-memory grain storage for development.
// The storage provider is named "cosmos" to match [PersistentState("game", "cosmos")]
// on GameGrain; swap AddMemoryGrainStorage for AddCosmosGrainStorage in production.
builder.Host.UseOrleans(silo =>
{
    silo.UseLocalhostClustering();
    silo.AddMemoryGrainStorage("cosmos");
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
app.MapHub<GameHub>("/game");


app.MapRazorPages()
   .WithStaticAssets();

app.Run();