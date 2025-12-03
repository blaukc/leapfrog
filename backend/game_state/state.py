import threading
import time

from game_state.player import Player


class GameState:
    def __init__(self, game_code: str):
        self.game_code = game_code
        self.lock = threading.Lock()
        self._players: list[Player] = []
        self._start_time = time.time()
        self._last_update_time = self._start_time

    def add_player(self, player: Player):
        with self.lock:
            self._players.append(player)

class StateManager:
    """
    Thread-safe state manager for handling shared state in game.
    We do fine grained locking at a game code level to allow multiple games to be handled.
    """
    def __init__(self):
        self.lock = threading.Lock()
        self._games: dict[str, GameState] = {}

    def create_game_state(self, game_code: str) -> bool:
        with self.lock:
            if game_code in self._games:
                return False
            self._games[game_code] = GameState(game_code)
            return True
        
    def get_game_state(self, game_code: str) -> GameState | None:
        with self.lock:
            return self._games.get(game_code, None)
    
