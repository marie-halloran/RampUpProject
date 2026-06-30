using ChessAPI.Hubs;
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
        //var credential = new DefaultAzureCredential();
        siloBuilder.AddCosmosGrainStorage(
                name: "cosmosStore",
                configureOptions: options =>
                {
                    options.DatabaseName = "OrleansAlternativeDatabase";
                    options.ContainerName = "OrleansClusterAlternativeContainer";
                    options.ContainerThroughputProperties = ThroughputProperties.CreateAutoscaleThroughput(1000);
                    options.ConfigureCosmosClient("<azure-cosmos-db-nosql-connection-string>");

                });
        siloBuilder.AddCosmosGrainStorage(
            name: "profileStore",
            configureOptions: static options =>
            {
            options.IsResourceCreationEnabled = true;
            options.DatabaseName = "OrleansAlternativeDatabase";
            options.ContainerName = "OrleansStorageAlternativeContainer";
            options.ContainerThroughputProperties = ThroughputProperties.CreateAutoscaleThroughput(1000);
            options.ConfigureCosmosClient("<azure-cosmos-db-nosql-connection-string>");
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