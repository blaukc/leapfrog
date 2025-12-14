from dataclasses import asdict, dataclass, field
import hashlib
import random
from typing import Literal
from game_state.constants import (
    DEFAULT_BACKWARD_FROG_MOVES,
    DEFAULT_FROG_MOVES,
    FROG_COLORS,
    FROG_NAMES,
    INITIAL_GOLD,
)


@dataclass
class Connection:
    websocket_id: str
    name: str
    connection_type: Literal["player", "spectator"]
    active: bool = False
    is_host: bool = False


@dataclass
class Frog:
    idx: int
    name: str
    color: str
    start_pos: int
    moves: list[int] = field(default_factory=list)


@dataclass
class Tile:
    frogs: list[int] = field(default_factory=list)
    has_spectator_tile: bool = False

    def place_frog(self, frog_idx: int):
        self.frogs.append(frog_idx)

    def place_spectator_tile(self):
        self.has_spectator_tile = True

    def remove_spectator_tile(self):
        self.has_spectator_tile = False


@dataclass
class LegBet:
    frog_idx: int
    winnings: list[int]


@dataclass
class OverallBet:
    frog_idx: int
    player_id: str


@dataclass
class Player:
    player_id: str
    connection: Connection
    gold: int = INITIAL_GOLD
    leg_bets: list[LegBet] = field(default_factory=list)


@dataclass
class GameState:
    game_code: str
    state: Literal["lobby", "game"] = "lobby"
    current_round: int = 0

    connections: list[Connection] = field(default_factory=list)
    players: dict[str, Player] = field(default_factory=dict)
    player_order: list[str] = field(default_factory=list)
    current_turn: str = ""

    num_tiles: int = 16 + 1  # including finish tile
    track: list[Tile] = field(default_factory=list)

    num_frogs: int = 5
    num_backward_frogs: int = 2
    num_frogs_per_round: int = 5
    frogs: list[Frog] = field(default_factory=list)
    unmoved_frogs: list[int] = field(default_factory=list)
    # available leg bets for the current round
    leg_bets: list[list[LegBet]] = field(default_factory=list)
    # players that have made overall bets in order of when the bet was made
    overall_bets: list[OverallBet] = field(default_factory=list)

    def make_websocket_response(self, websocket_id: str) -> dict:
        all_websocket_ids = set([conn.websocket_id for conn in self.connections])
        spectator_websocket_ids = set(
            [
                conn.websocket_id
                for conn in self.connections
                if conn.connection_type == "spectator"
            ]
        )
        player_websocket_ids = set(
            [
                conn.websocket_id
                for conn in self.connections
                if conn.connection_type == "player"
            ]
        )

        if websocket_id not in all_websocket_ids:
            return {"type": "unknown", "game_state": asdict(self)}

        if websocket_id in spectator_websocket_ids:
            return {"type": "spectator", "game_state": asdict(self)}
        elif websocket_id in player_websocket_ids:
            return {"type": "player", "game_state": asdict(self)}
        return {"type": "unknown", "game_state": asdict(self)}

    def add_connection(
        self,
        websocket_id: str,
        connection_type: Literal["player", "spectator"],
        name: str = "",
    ):
        connection = Connection(
            websocket_id=websocket_id, name=name, connection_type=connection_type
        )
        if (
            len(
                list(
                    filter(
                        lambda conn: conn.connection_type == "player", self.connections
                    )
                )
            )
            == 0
            and connection_type == "player"
        ):
            connection.is_host = True
        self.connections.append(connection)

    def reset_game(self):
        self.players.clear()

    def _get_frog_position(self, frog_idx: int) -> tuple[int, int]:
        assert frog_idx < len(self.frogs), "Invalid frog index"
        for tile_idx, tile in enumerate(self.track):
            if frog_idx in tile.frogs:
                return tile_idx, tile.frogs.index(frog_idx)
        raise ValueError("Frog not found on track")

    def _move_frog(self, frog_idx: int) -> None:
        frog = self.frogs[frog_idx]
        move_distance = random.choice(frog.moves)
        current_tile, tile_pos = self._get_frog_position(frog_idx)

        frog_pile = self.track[current_tile].frogs[tile_pos:]
        self.track[current_tile].frogs = self.track[current_tile].frogs[:tile_pos]

        next_tile = min(current_tile + move_distance, self.num_tiles)
        self.track[next_tile].frogs.extend(frog_pile)
        return next_tile

    def create_players(self):
        for conn in self.connections:
            if conn.connection_type == "spectator":
                continue

            player_id = hashlib.sha256(conn.websocket_id.encode()).hexdigest()[:8]
            player = Player(player_id=player_id, connection=conn)
            self.players[player_id] = player

        # assert len(self.players) > 1, "Not enough players to start the game."

        player_ids = list(self.players.keys())
        self.player_order = player_ids
        random.shuffle(self.player_order)
        self.current_turn = self.player_order[0]

    def create_track(self, length: int):
        self.track = [Tile() for _ in range(length)]

    def create_frogs(self):
        frog_names_copy, frog_colors_copy = list(FROG_NAMES), list(FROG_COLORS)

        random.shuffle(frog_names_copy)
        random.shuffle(frog_colors_copy)

        for i in range(self.num_frogs):
            self.frogs.append(
                Frog(
                    idx=i,
                    name=frog_names_copy[i],
                    color=frog_colors_copy[i],
                    start_pos=0,
                    moves=DEFAULT_FROG_MOVES,
                )
            )

        for i in range(self.num_backward_frogs):
            j = i + self.num_frogs
            self.frogs.append(
                Frog(
                    idx=j,
                    name=frog_names_copy[j],
                    color=frog_colors_copy[j],
                    start_pos=self.num_tiles - 1,
                    moves=DEFAULT_BACKWARD_FROG_MOVES,
                )
            )

    def initialize_frog_position(self):
        random_frog_iter = iter(random.sample(self.frogs, len(self.frogs)))
        for frog in random_frog_iter:
            # place frog
            self.track[frog.start_pos].place_frog(frog.idx)

            self._move_frog(frog.idx)

    def end_game(self):
        pass

    def move_frog(self):
        next_frog_idx = random.choice(self.unmoved_frogs)
        self.unmoved_frogs.remove(next_frog_idx)
        moved_to_tile = self._move_frog(next_frog_idx)

        if moved_to_tile == self.num_tiles - 1:
            self.end_game()

        if (
            len(self.unmoved_frogs)
            <= self.num_frogs + self.num_backward_frogs - self.num_frogs_per_round
        ):
            # next round
            pass
