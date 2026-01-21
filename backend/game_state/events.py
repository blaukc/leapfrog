from typing import Literal
from pydantic import BaseModel, Field, TypeAdapter


class BaseEvent(BaseModel):
    type: str = Field(..., description="Type of the event")
    game_code: str = Field(
        ..., description="Code of the game associated with the event", alias="gameCode"
    )
    websocket_id: str = Field(
        None,
        description="ID of the player sending the event, if applicable",
        alias="websocketId",
    )

    model_config = {
        "populate_by_name": True,
    }


class PlayerJoinEvent(BaseEvent):
    type: Literal["player_join"] = "player_join"
    player_name: str = Field(
        ..., description="Name of the player joining the game", alias="playerName"
    )


class SpectatorJoinEvent(BaseEvent):
    type: Literal["spectator_join"] = "spectator_join"


class KickPlayerEvent(BaseEvent):
    type: Literal["kick_player"] = "kick_player"
    player_id: str = Field(
        ..., description="ID of the player to be kicked", alias="playerId"
    )


class UpdateGameSettingsEvent(BaseEvent):
    type: Literal["update_game_settings"] = "update_game_settings"
    settings: dict = Field(..., description="New game settings")


class StartGameEvent(BaseEvent):
    type: Literal["start_game"] = "start_game"


class MoveFrogEvent(BaseEvent):
    type: Literal["move_frog"] = "move_frog"


class LegBetEvent(BaseEvent):
    type: Literal["leg_bet"] = "leg_bet"
    frog_idx: int = Field(
        ..., description="Index of the frog to bet on", alias="frogIdx"
    )


class OverallBetEvent(BaseEvent):
    type: Literal["overall_bet"] = "overall_bet"
    frog_idx: int = Field(
        ..., description="Index of the frog to bet on", alias="frogIdx"
    )
    bet_type: Literal["winner", "loser"] = Field(
        ..., description="Type of overall bet", alias="betType"
    )


class SpectatorTileEvent(BaseEvent):
    type: Literal["spectator_tile"] = "spectator_tile"
    tile_idx: int = Field(
        ..., description="Index of the tile to place spectator tile", alias="tileIdx"
    )
    displacement: int = Field(
        ..., description="Displacement for frog landing on this tile"
    )


class EndGameEvent(BaseEvent):
    type: Literal["end_game"] = "end_game"


Event = (
    PlayerJoinEvent
    | SpectatorJoinEvent
    | KickPlayerEvent
    | UpdateGameSettingsEvent
    | StartGameEvent
    | MoveFrogEvent
    | LegBetEvent
    | OverallBetEvent
    | SpectatorTileEvent
    | EndGameEvent
)
EventAdapter = TypeAdapter(Event)
