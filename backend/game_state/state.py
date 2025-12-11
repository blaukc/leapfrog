from dataclasses import asdict, dataclass, field
from typing import Literal
from game_state.constants import INITIAL_GOLD

@dataclass
class Player:
	player_id: str
	websocket_id: str
	active: bool
	name: str
	is_host: bool = False
	gold: int = INITIAL_GOLD

@dataclass
class GameState:
	game_code: str
	state: str = "lobby"
	players: dict[str, Player] = field(default_factory=dict)
	spectators: list[str] = field(default_factory=list)

	def make_websocket_response(self, websocket_id: str) -> dict:
		if websocket_id in self.spectators:
			return {
				"websocket_id": websocket_id,
				"type": "spectator",
				"name": "",
				"game_state": asdict(self)
			}
		if (player := next((player for player in self.players.values() if player.websocket_id == websocket_id), None)) is not None:
			return {
				"websocket_id": websocket_id,
				"type": "player",
				"name": player.name,
				"game_state": asdict(self)
			}
		return {
			"websocket_id": websocket_id,
			"type": "unknown",
			"name": "",
			"game_state": asdict(self)
		}
		
	def add_player(self, player: Player):
		if len(self.players) == 0:
			player.is_host = True
		self.players[player.player_id] = player