# leapfrog

Web based game inspired off the board game Camel Up. 

## Features Specification

### Sessions

- Users should be able to create a game instance hosted on the backend and players should be able to join using a code

### Views

- Users should be able to choose to be a player or spectator
- Players should be able to choose a controller view or regular view
- Controller view should be used if they have a wide screen that has an overall spectator view and just want to use their device as a controller

### Gameplay

- Once joined, players choose their names (should check unique)
- Host will start the game once ready
- At the start of the game, each player is given 5 gold, frogs are placed in their starting positions (random), players assigned their turn order (random)
- At each turn, players are able to
  - Bet on the leader of a leg (Win/lose some gold based on how well the frog does this leg)
  - Place spectator tile (Gain 1 gold if a frog steps on this tile, tile may be placed on any empty space, except adjacent to another spectator tile)
    - Forward tile
    - Backwards tile
  - Move a frog (Random frog will be chosen and moved)
  - Bet on the overall winner/loser (Win points at the end of the round. Correct bets get gold, wrong bets lose gold)
- At end of each round, gold is distributed back to the players
- Once the first frog crosses the finishing line, the game ends, gold is distributed and player rankings are displayed
- We are returned to the lobby, where the game can be started again 
- A game lobby should be cleared periodically once it has been a while since the last update event

## Design

- Each player/spectator should be connected to the server via a websocket
- Players can send events to the server and the server will send the state of the game to players
- Each game runs on a thread that reads from an event queue 
- Our websockets will produce to these event queues from player action events
- Updates to the game state will be published to all user websockets
- Only the event queue needs to be thread-safe, game state will only be updated by a single thread and read from by the webserver
- Game state should consist of:
  - Turn
  - Track
    - Frogs
      - Colour
      - Position
    - Spectator Tile
  - Leg Bets
  - Overall Bets
  - Players
    - Name
    - Current Bets
    - Gold