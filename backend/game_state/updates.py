from dataclasses import dataclass
from typing import Literal


@dataclass
class Update:
    player_id: str


@dataclass
class PlayerMoveFrogUpdate(Update):
    frog_idx: int
    from_tile: int
    to_tile: int
    type: Literal["player_move_frog"] = "player_move_frog"


@dataclass
class PlayerLegBetUpdate(Update):
    frog_idx: int
    type: Literal["player_leg_bet"] = "player_leg_bet"


@dataclass
class PlayerOverallBetUpdate(Update):
    bet_type: Literal["winner", "loser"]
    type: Literal["player_overall_bet"] = "player_overall_bet"


@dataclass
class PlayerSpectatorTileUpdate(Update):
    tile_idx: int
    direction: int
    type: Literal["player_spectator_tile"] = "player_spectator_tile"


@dataclass
class SpectatorTileWinningsUpdate(Update):
    frog_idx: int
    from_tile: int
    to_tile: int
    type: Literal["spectator_tile_winnings"] = "spectator_tile_winnings"


@dataclass
class LegBetWinningsUpdate(Update):
    frog_idx: int
    frog_placing: int
    winnings: int
    type: Literal["leg_bet_winnings"] = "leg_bet_winnings"


@dataclass
class OverallBetWinningsUpdate(Update):
    bet_type: Literal["winner", "loser"]
    frog_idx: int
    winnings: int
    type: Literal["overall_bet_winnings"] = "overall_bet_winnings"


@dataclass
class EndGameUpdate(Update):
    player_rankings: list[str]
    winning_frog_idx: int
    type: Literal["end_game_update"] = "end_game_update"
