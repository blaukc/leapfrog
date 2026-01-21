from dataclasses import asdict, dataclass, field
import hashlib
import random
from typing import Literal
from game_state.updates import (
    EndGameUpdate,
    LegBetWinningsUpdate,
    OverallBetWinningsUpdate,
    PlayerLegBetUpdate,
    PlayerMoveFrogUpdate,
    PlayerOverallBetUpdate,
    PlayerSpectatorTileUpdate,
    SpectatorTileWinningsUpdate,
    Update,
)
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
    is_forward_frog: bool
    moves: list[int] = field(default_factory=list)


@dataclass
class SpectatorTile:
    player_id: str
    player_name: str
    direction: int


@dataclass
class Tile:
    frogs: list[int] = field(default_factory=list)
    can_spectator_tile_be_placed: bool = True
    spectator_tile: SpectatorTile | None = None

    @property
    def has_frogs(self) -> bool:
        return len(self.frogs) > 0

    def place_frog(self, frog_idx: int):
        self.frogs.append(frog_idx)

    def place_spectator_tile(
        self,
        player_id: str,
        player_name: str,
        direction: Literal["forward", "backward"],
    ):
        self.spectator_tile = SpectatorTile(
            player_id, player_name, 1 if direction == "forward" else -1
        )

    @property
    def has_spectator_tile(self) -> bool:
        return self.spectator_tile is not None


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
    num_frogs: int
    gold: int = INITIAL_GOLD
    leg_bets: list[LegBet] = field(default_factory=list)
    # whether a player has made a overall bet for a frog
    overall_bets: list[Literal["none", "loser", "winner"]] = field(init=False)
    spectator_tile_idx: int = -1

    def __post_init__(self):
        self.overall_bets = ["none"] * self.num_frogs

    def add_leg_bet(self, leg_bet: LegBet):
        self.leg_bets.append(leg_bet)

    def clear_leg_bets(self):
        self.leg_bets.clear()

    def has_made_overall_bet(self, frog_idx: int) -> bool:
        return self.overall_bets[frog_idx] != "none"

    def make_overall_bet(self, frog_idx: int, bet_type: Literal["winner", "loser"]):
        self.overall_bets[frog_idx] = bet_type

    @property
    def has_spectator_tile(self) -> bool:
        return self.spectator_tile_idx != -1

    def place_spectator_tile(self, tile_idx: int):
        self.spectator_tile_idx = tile_idx

    def clear_spectator_tile(self):
        self.spectator_tile_idx = -1


@dataclass
class EndGameStats:
    winner: Player


@dataclass
class GameState:
    game_code: str
    state: Literal["lobby", "game", "ended"] = "lobby"
    current_round: int = 0
    updates: list[Update] = field(default_factory=list)

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
    overall_win_bets: list[OverallBet] = field(default_factory=list)
    overall_lose_bets: list[OverallBet] = field(default_factory=list)
    overall_bet_winnings: tuple[int] = (8, 5, 3, 2, 1)
    overall_bet_loss: int = 1

    end_game_stats: EndGameStats | None = field(default=None)

    @property
    def forward_frogs(self) -> list[Frog]:
        return [frog for frog in self.frogs if frog.start_pos == 0]

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
        self.frogs.clear()
        self.updates.clear()
        self.unmoved_frogs.clear()
        self.end_game_stats = None
        self.leg_bets.clear()
        self.overall_win_bets.clear()
        self.overall_lose_bets.clear()

    @staticmethod
    def _get_player_id(websocket_id: str):
        return hashlib.sha256(websocket_id.encode()).hexdigest()[:8]

    @property
    def frog_order(self) -> list[int]:
        frog_order = []
        for tile in reversed(self.track):
            for frog_idx in reversed(tile.frogs):
                frog = self.frogs[frog_idx]
                if frog.is_forward_frog:
                    frog_order.append(frog_idx)
        return frog_order

    def _reset_spectator_tiles(self):
        for tile in self.track:
            tile.spectator_tile = None
        for player in self.players.values():
            player.clear_spectator_tile()

    def _update_spectator_tile_availability(self):
        for idx, tile in enumerate(self.track):
            if idx == 0 or idx == self.num_tiles - 1:
                # first and last tile
                tile.can_spectator_tile_be_placed = False
            elif tile.has_spectator_tile or len(tile.frogs) > 0:
                # there is something already there
                tile.can_spectator_tile_be_placed = False
            elif (
                self.track[idx - 1].has_spectator_tile
                or self.track[idx + 1].has_spectator_tile
            ):
                # there are spectator tiles on the left and right
                tile.can_spectator_tile_be_placed = False
            else:
                tile.can_spectator_tile_be_placed = True

    def _next_turn(self):
        if self.current_turn == "":
            self.current_turn = self.player_order[0]
            return

        self._update_spectator_tile_availability()

        num_players = len(self.players)
        next_idx = (self.player_order.index(self.current_turn) + 1) % num_players
        self.current_turn = self.player_order[next_idx]

    def _calculate_leg_bets(self):
        for player in self.players.values():
            for leg_bet in player.leg_bets:
                frog_pos = self.frog_order.index(leg_bet.frog_idx)
                player.gold += leg_bet.winnings[frog_pos]
                self.updates.append(
                    LegBetWinningsUpdate(
                        player_id=player.player_id,
                        frog_idx=leg_bet.frog_idx,
                        frog_placing=frog_pos,
                        winnings=leg_bet.winnings[frog_pos],
                    )
                )

    def _calculate_overall_bets(
        self, target_frog: int, bet_type: Literal["winner", "loser"]
    ):
        bets = self.overall_win_bets if bet_type == "winner" else self.overall_lose_bets
        i = 0
        for bet in bets:
            player = self.players[bet.player_id]
            if bet.frog_idx != target_frog:
                player.gold -= self.overall_bet_loss
                self.updates.append(
                    OverallBetWinningsUpdate(
                        player_id=bet.player_id,
                        bet_type=bet_type,
                        frog_idx=bet.frog_idx,
                        winnings=self.overall_bet_loss * -1,
                    )
                )
                continue
            # if there are more than 5 players, they all get the last winning amt
            winnings = self.overall_bet_winnings[
                min(len(self.overall_bet_winnings) - 1, i)
            ]
            player.gold += winnings
            i += 1
            self.updates.append(
                OverallBetWinningsUpdate(
                    player_id=bet.player_id,
                    bet_type=bet_type,
                    frog_idx=bet.frog_idx,
                    winnings=winnings,
                )
            )

    def _make_leg_bet_payouts(self, idx: int) -> list[int]:
        if idx == 0:
            return [5, 3] + [-1] * (self.num_frogs - 2)
        elif idx == 1:
            return [3, 2] + [-1] * (self.num_frogs - 2)
        else:
            return [2, 1] + [-1] * (self.num_frogs - 2)

    def _reset_leg_bets(self):
        self.leg_bets = [
            [
                LegBet(frog_idx=frog.idx, winnings=self._make_leg_bet_payouts(i))
                for i in range(5)
            ]
            for frog in self.forward_frogs
        ]

        for player in self.players.values():
            player.clear_leg_bets()

    def _next_round(self):
        self.unmoved_frogs = [frog.idx for frog in self.frogs]
        self.current_round += 1

        self._calculate_leg_bets()
        self._reset_leg_bets()

        self._reset_spectator_tiles()
        self._update_spectator_tile_availability()

    def _calculate_winner(self, winning_frog_idx: int):
        sorted_players = list(self.players.values())
        sorted_players.sort(key=lambda p: p.gold, reverse=True)
        self.updates.append(
            EndGameUpdate(
                player_id="",
                player_rankings=[player.player_id for player in sorted_players],
                winning_frog_idx=winning_frog_idx,
            )
        )
        self.end_game_stats = EndGameStats(winner=sorted_players[0])

    def _end_game(self):
        self._calculate_leg_bets()
        winning_frog, losing_frog = self.frog_order[0], self.frog_order[-1]
        self._calculate_overall_bets(winning_frog, "winner")
        self._calculate_overall_bets(losing_frog, "loser")

        self._calculate_winner(winning_frog)
        self.current_turn = ""
        self.state = "ended"

    def _get_frog_position(self, frog_idx: int) -> tuple[int, int]:
        assert frog_idx < len(self.frogs), "Invalid frog index"
        for tile_idx, tile in enumerate(self.track):
            if frog_idx in tile.frogs:
                return tile_idx, tile.frogs.index(frog_idx)
        raise ValueError("Frog not found on track")

    def _move_frog(self, frog_idx: int, move_distance: int | None = None) -> int:
        frog = self.frogs[frog_idx]
        if move_distance is None:
            move_distance = random.choice(frog.moves)
        current_tile, tile_pos = self._get_frog_position(frog_idx)

        frog_pile = self.track[current_tile].frogs[tile_pos:]
        self.track[current_tile].frogs = self.track[current_tile].frogs[:tile_pos]

        next_tile = min(current_tile + move_distance, self.num_tiles - 1)
        next_tile = max(next_tile, 0)
        self.track[next_tile].frogs.extend(frog_pile)
        return next_tile

    def _use_spectator_tile(self, from_tile: int) -> int:
        tile = self.track[from_tile]
        assert tile.has_frogs, "There needs to be frogs to use spectator tile"

        if not tile.has_spectator_tile:
            return from_tile

        bottom_frog = tile.frogs[0]
        moved_to_tile = self._move_frog(bottom_frog, tile.spectator_tile.direction)
        player_id = tile.spectator_tile.player_id
        self.players[player_id].gold += 1

        self.updates.append(
            SpectatorTileWinningsUpdate(
                frog_idx=bottom_frog,
                from_tile=from_tile,
                to_tile=moved_to_tile,
                player_id=player_id,
            )
        )

        return moved_to_tile

    def _initialize_frog_position(self):
        random_frog_iter = iter(random.sample(self.frogs, len(self.frogs)))
        for frog in random_frog_iter:
            # place frog
            self.track[frog.start_pos].place_frog(frog.idx)

            self._move_frog(frog.idx)

    def check_turn(self, websocket_id: str) -> bool:
        player_id = self._get_player_id(websocket_id)
        return player_id == self.current_turn

    def move_frog(self, websocket_id: str):
        player_id = self._get_player_id(websocket_id)

        next_frog_idx = random.choice(self.unmoved_frogs)
        self.unmoved_frogs.remove(next_frog_idx)

        from_tile, _ = self._get_frog_position(next_frog_idx)
        moved_to_tile = self._move_frog(next_frog_idx)
        self.updates.append(
            PlayerMoveFrogUpdate(
                player_id=player_id,
                frog_idx=next_frog_idx,
                from_tile=from_tile,
                to_tile=moved_to_tile,
            )
        )

        # We only need to check once as the following tile is guaranteed to not have a spectator tile
        moved_to_tile = self._use_spectator_tile(moved_to_tile)

        self.players[player_id].gold += 1

        self._next_turn()

        if moved_to_tile == self.num_tiles - 1:
            self._end_game()
            return

        if (
            len(self.unmoved_frogs)
            <= self.num_frogs + self.num_backward_frogs - self.num_frogs_per_round
        ):
            self._next_round()

    def create_players(self):
        for conn in self.connections:
            if conn.connection_type == "spectator":
                continue

            player_id = self._get_player_id(conn.websocket_id)
            player = Player(
                player_id=player_id, connection=conn, num_frogs=self.num_frogs
            )
            self.players[player_id] = player

        # assert len(self.players) > 1, "Not enough players to start the game."

        player_ids = list(self.players.keys())
        self.player_order = player_ids
        random.shuffle(self.player_order)
        self.current_turn = self.player_order[0]

    def create_track(self):
        self.track = [Tile() for _ in range(self.num_tiles)]

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
                    is_forward_frog=True,
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
                    is_forward_frog=False,
                    moves=DEFAULT_BACKWARD_FROG_MOVES,
                )
            )

    def make_leg_bet(self, websocket_id: str, frog_idx: int):
        player_id = self._get_player_id(websocket_id)
        player = self.players[player_id]

        leg_bets = self.leg_bets[frog_idx]
        assert len(leg_bets) > 0

        leg_bet = self.leg_bets[frog_idx][0]
        self.leg_bets[frog_idx] = self.leg_bets[frog_idx][1:]

        player.add_leg_bet(leg_bet)

        self.updates.append(PlayerLegBetUpdate(player_id=player_id, frog_idx=frog_idx))

        self._next_turn()

    def make_overall_bet(
        self, websocket_id: str, frog_idx: int, bet_type: Literal["winner", "loser"]
    ):
        player_id = self._get_player_id(websocket_id)
        player = self.players[player_id]
        assert player.overall_bets[frog_idx] == "none"

        overall_bet = OverallBet(frog_idx, player_id)
        if bet_type == "winner":
            self.overall_win_bets.append(overall_bet)
        else:
            self.overall_lose_bets.append(overall_bet)
        player.make_overall_bet(frog_idx, bet_type)

        self.updates.append(
            PlayerOverallBetUpdate(player_id=player_id, bet_type=bet_type)
        )

        self._next_turn()

    def is_valid_spectator_tile_placement(self, tile_idx: int) -> bool:
        """
        There can only be one spectator tile at each tile
        There cannot be a spectator tile within 1 tile of the placement
        There cannot be a frog on the placement
        There cannot be a spectator tile one the last tile (finish line)
        """
        placement_tile = self.track[tile_idx]
        if placement_tile.has_frogs:
            return False

        if placement_tile.has_spectator_tile:
            return False

        if tile_idx == self.num_tiles - 1:
            return False

        next_tile = self.track[tile_idx + 1] if tile_idx + 1 < self.num_tiles else None
        if next_tile is not None and next_tile.has_spectator_tile:
            return False

        prev_tile = self.track[tile_idx - 1] if tile_idx - 1 > 0 else None
        if prev_tile is not None and prev_tile.has_spectator_tile:
            return False

        return True

    def place_spectator_tile(
        self,
        websocket_id: str,
        tile_idx: int,
        direction: Literal["forward", "backward"],
    ):
        player_id = self._get_player_id(websocket_id)
        player = self.players[player_id]
        assert not player.has_spectator_tile
        assert self.is_valid_spectator_tile_placement(tile_idx)

        self.track[tile_idx].place_spectator_tile(
            player_id, player.connection.name, direction
        )
        player.place_spectator_tile(tile_idx)

        self.updates.append(
            PlayerSpectatorTileUpdate(
                player_id=player_id,
                tile_idx=tile_idx,
                direction=1 if direction == "forward" else -1,
            )
        )

        self._next_turn()

    def start_game(self):
        self._initialize_frog_position()
        self._next_round()

    def to_lobby(self):
        self.state = "lobby"
