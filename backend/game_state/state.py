from dataclasses import asdict, dataclass, field
import hashlib
import random
from typing import Literal
from game_state.constants import INITIAL_GOLD

@dataclass
class Connection:
	websocket_id: str
	name: str
	connection_type: Literal["player", "spectator"]
	active: bool = False
	is_host: bool = False

@dataclass
class Player:
	player_id: str
	connection: Connection
	gold: int = INITIAL_GOLD

@dataclass
class Frog:
	color: str

@dataclass
class Tile:
	frogs: list[Frog] = field(default_factory=list)

@dataclass
class GameState:
	game_code: str
	state: Literal["lobby", "game"] = "lobby"

	connections: list[Connection] = field(default_factory=list)
	players: dict[str, Player] = field(default_factory=dict)
	player_order: list[str] = field(default_factory=list)
	current_turn: str = ""

	track: list[Tile] = field(default_factory=list)

	def make_websocket_response(self, websocket_id: str) -> dict:
		all_websocket_ids = set([conn.websocket_id for conn in self.connections])
		spectator_websocket_ids = set([conn.websocket_id for conn in self.connections if conn.connection_type == "spectator"])
		player_websocket_ids = set([conn.websocket_id for conn in self.connections if conn.connection_type == "player"])

		if websocket_id not in all_websocket_ids:
			return {
				"type": "unknown",
				"game_state": asdict(self)
			}

		if websocket_id in spectator_websocket_ids:
			return {
				"type": "spectator",
				"game_state": asdict(self)
			}
		elif websocket_id in player_websocket_ids:
			return {
				"type": "player",
				"game_state": asdict(self)
			}
		return {
			"type": "unknown",
			"game_state": asdict(self)
		}

	def add_connection(self, websocket_id: str, connection_type: Literal["player", "spectator"], name: str = ""):
		connection = Connection(websocket_id=websocket_id, connection_type=connection_type)
		if len(filter(lambda conn: conn.connection_type == "player", self.connections)) == 0 and connection_type == "player":
			connection.is_host = True
		self.connections.append(connection)
		
	def reset_game(self):
		self.players.clear()

	def create_players(self):
		for conn in self.connections:
			if conn.connection_type == "spectator":
				continue

			player_id = hashlib.sha256(conn.websocket_id.encode()).hexdigest()[:8]
			player = Player(player_id=player_id, connection=conn)
			self.players[player_id] = player

		assert len(self.players) > 1, "Not enough players to start the game."

		player_ids = list(self.players.keys())
		self.player_order = player_ids
		random.shuffle(self.player_order)
		self.current_turn = self.player_order[0]

	def setup_track(self, length: int):
		self.track = [Tile() for _ in range(length)]
