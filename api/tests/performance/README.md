# Azure Load Testing — Chess API Performance Test

## What the test does

| Dimension | Value |
|-----------|-------|
| Virtual users | **1 000** (500 threads × 2 players per thread) |
| Concurrent games | **500** |
| Move rate | ~1 move / second per player (~1 000 moves/s total at peak) |
| Test duration | **≤ 5 minutes** (60s ramp-up + ~10s setup + 200s moves + ~5s teardown ≈ 275s) |

Each JMeter thread simulates one complete game:
1. Creates two players via `POST /api/player` and a game via `POST /api/game`
2. Performs the SignalR negotiate handshake for **both** players, opening two WebSocket connections (named `conn-p1` and `conn-p2`) within the same thread
3. Sends `JoinGame` for each player to the `/game/live` hub
4. Alternates `SendMove` calls (player 1, 1 s pause, player 2, 1 s pause) for 100 iterations
5. Sends `LeaveGame` and closes both WebSocket connections

---

## Required plugin

The test uses the **jmeter-websocket-samplers** library by Peter Doornbosch
(package `eu.luminis.jmeter.wssampler`).

1. Download the latest JAR from  
   https://github.com/Luminis-Arnhem/jmeter-websocket-samplers/releases  
   (e.g. `jmeter-websocket-samplers-1.2.8.jar`)

2. **Local JMeter**: drop the JAR into `$JMETER_HOME/lib/ext/` and restart JMeter.  
   **Azure Load Testing**: upload the JAR as a *configuration file* alongside the JMX
   (the service places files in `lib/ext` automatically).

---

## Running in Azure Load Testing

### Portal

1. Open your Azure Load Testing resource → **Tests** → **Create test**.
2. Upload `chess-load-test.jmx` as the *test plan*.
3. Upload `jmeter-websocket-samplers-<version>.jar` as an *additional file*.
4. Under **Parameters**, add the following key/value pairs:

   | Name | Example value |
   |------|--------------|
   | `target_host` | `myapp.azurewebsites.net` |
   | `target_port` | `443` |
   | `scheme` | `https` |
   | `use_tls` | `true` |
   | `move_iterations` | `100` |

5. Set **Engine instances** to `1` (one engine handles 500 threads comfortably;
   increase to scale out if needed).
6. Optionally configure failure criteria (see `load-test-config.yaml`).

### CI/CD (GitHub Actions / Azure DevOps)

Use `load-test-config.yaml` with the
[Azure Load Testing GitHub Action](https://github.com/Azure/load-testing):

```yaml
- uses: Azure/load-testing@v1
  with:
    loadTestConfigFile: api/tests/performance/load-test-config.yaml
    resourceGroup: my-rg
    loadTestResource: my-load-testing-resource
```

---

## Running locally

```bash
# Requires JMeter 5.5+ and the plugin JAR in lib/ext/
jmeter -n -t chess-load-test.jmx \
  -Jtarget_host=localhost \
  -Jtarget_port=5000 \
  -Jscheme=http \
  -Juse_tls=false \
  -Jmove_iterations=100 \
  -l results.jtl \
  -e -o report/
```

---

## Timing breakdown

```
 0s – 60s   Ramp-up (500 threads start, ~8.3 threads/s)
60s – 70s   Phase 1–3: create players, game, and establish WebSocket connections
70s – 270s  Phase 4: move loop (100 × 2s per thread)
270s – 275s Phase 5: LeaveGame + close connections
```

To reduce total duration, lower `move_iterations` (each iteration = 2 s).  
To increase load without changing duration, raise `engine_instances` in the YAML.

---

## SignalR message format reference

The test uses the SignalR JSON protocol (v1). All messages are terminated with
ASCII record separator `0x1E`.

| Hub method | Arguments | Notes |
|-----------|-----------|-------|
| `JoinGame` | `[gameId, playerId]` | Returns `{ board, opponent }` via Completion message |
| `SendMove` | `[gameId, boardSnapshot]` | Broadcasts `ReceiveMove` to the other player |
| `LeaveGame` | `[gameId, playerId]` | Broadcasts `PlayerLeft`, sets game status to "ended" |
