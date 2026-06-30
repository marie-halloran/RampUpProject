using Azure.Identity;
using ChessAPI.Hubs;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Hosting;
using Orleans;
using Orleans.Configuration;
using Orleans.Hosting;
using System;
using System.Threading.Tasks;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseOrleans((context, siloBuilder) =>
{

    var local = context.HostingEnvironment.IsDevelopment();
    if (local)
    {
        siloBuilder.UseLocalhostClustering();
    }
    else
    {
        // This is the config for where cosmos will get the storage of the cluster info (ie which silo is active, which is inactive, etc)
        var credential = new DefaultAzureCredential();
        var cosmosEndpoint = context.Configuration["Orleans:CosmosEndpoint"]!;
        siloBuilder.UseCosmosClustering(options =>
        {
            options.ConfigureCosmosClient(cosmosEndpoint, credential);
            options.DatabaseName = "OrleansAlternativeDatabase";
            options.ContainerName = "OrleansClusteringAlternativeContainer";
        });
        // This is the config for where cosmos will get the storage of the grain state
        siloBuilder.AddCosmosGrainStorage(
            name: "profileStore",
            configureOptions: options =>
            {
                options.IsResourceCreationEnabled = true;
                options.DatabaseName = "OrleansAlternativeDatabase";
                options.ContainerName = "OrleansStorageAlternativeContainer";
                options.ContainerThroughputProperties = ThroughputProperties.CreateAutoscaleThroughput(1000);
                options.ConfigureCosmosClient(cosmosEndpoint, credential);
            });
    }
});

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
app.MapHub<GameHub>("/game");


app.MapRazorPages()
   .WithStaticAssets();

app.Run();