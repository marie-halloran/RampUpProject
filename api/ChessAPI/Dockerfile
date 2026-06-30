FROM --platform=linux/amd64 mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["ChessAPI.csproj", "./"]
RUN dotnet restore "ChessAPI.csproj"

COPY . .
RUN dotnet publish "ChessAPI.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM --platform=linux/amd64 mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "ChessAPI.dll"]
