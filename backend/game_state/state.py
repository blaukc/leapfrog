from dataclasses import dataclass
import queue
from typing import Generic, TypeVar
from readerwriterlock import rwlock
import threading
import time

from game_state.player import Player
from game_state.events import Event
from utils.queue import TypedQueue


class GameState:
    pass

class Game:
    def __init__(self, game_code: str, state_update_queue: TypedQueue[tuple[str, GameState]]):
        self.game_code = game_code
        self._players: list[Player] = []
        self._start_time = time.time()
        self._last_update_time = self._start_time
        self.event_queue = TypedQueue[Event]()
        self._state_update_queue = state_update_queue

    def add_player(self, player: Player):
        self._players.append(player)

    def process_event(self, event: Event):
        print(event)

    def add_event(self, event: Event):
        self.event_queue.put(event)

    def run(self):
        while True:
            try:
                event = self.event_queue.get(timeout=1)
                self.process_event(event)
            except queue.Empty:
                continue

class GameManager:
    """
    Thread-safe state manager for handling shared state in game.
    """
    def __init__(self):
        self.lock = rwlock.RWLockWrite()
        self._state_update_queue = TypedQueue[tuple[str, GameState]]()
        self._event_queues: dict[str, TypedQueue[Event]] = {}
        self._game_threads: dict[str, threading.Thread] = {}
        self._game_states: dict[str, GameState] = {}

    def create_game_state(self, game_code: str) -> bool:
        with self.lock.gen_wlock():
            if game_code in self._game_threads:
                return False
            game = Game(game_code, self._state_update_queue)
            t = threading.Thread(target=game.run, daemon=True)
            t.start()

            self._game_threads[game_code] = t
            self._event_queues[game_code] = game.event_queue
            self._game_states[game_code] = GameState()
            return True
        
    def get_game_state(self, game_code: str) -> Game | None:
        with self.lock.gen_rlock():
            state = self._game_states.get(game_code, None)
            if state is None:
                return None
            return state

    def add_event(self, game_code: str, event: Event) -> bool:
        with self.lock.gen_rlock():
            event_queue = self._event_queues.get(game_code)
            if event_queue is None:
                return False
            event_queue.put(event)
            return True

    def run(self):
        while True:
            try:
                game_code, new_state = self._state_update_queue.get(timeout=1)
                with self.lock.gen_wlock():
                    self._game_states[game_code] = new_state
            except queue.Empty:
                continue