import threading
import time

from game_state.player import Player


class StateManager:
    """
    Thread-safe state manager for handling shared state in game.
    We do fine grained locking at a game code level to allow multiple games to be handled.
    """
    def __init__(self, game_code: str):
        self.game_code = game_code
        self.lock = threading.Lock()
        self._players: list[Player] = []
        self._start_time = time.time()
        self._last_update_time = self._start_time

    def add_player(self, player: Player):
        with self.lock:
            self.players.append(player)