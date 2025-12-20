from dataclasses import asdict, dataclass
import queue
from typing import Generic, TypeVar
from fastapi import WebSocket
from readerwriterlock import rwlock
import threading
import time

from game_state.constants import DEFAULT_TRACK_LENGTH
from game_state.state import GameState, Player
from game_state.events import (
    BaseEvent,
    EndGameEvent,
    KickPlayerEvent,
    LegBetEvent,
    MoveFrogEvent,
    OverallBetEvent,
    PlayerJoinEvent,
    SpectatorJoinEvent,
    SpectatorTileEvent,
    StartGameEvent,
    UpdateGameSettingsEvent,
)
from utils.queue import TypedQueue


class Game:
    def __init__(
        self,
        game_code: str,
        initial_state: GameState,
        state_update_queue: TypedQueue[GameState],
    ):
        self.game_code = game_code
        self._game_state: GameState = initial_state
        self._start_time = time.time()
        self._last_update_time = self._start_time
        self.event_queue = TypedQueue[BaseEvent]()
        self._state_update_queue = state_update_queue

    def process_event(self, event: BaseEvent):
        match event:
            case PlayerJoinEvent():
                self._game_state.add_connection(
                    event.websocket_id, "player", event.player_name
                )
            case SpectatorJoinEvent():
                self._game_state.add_connection(event.websocket_id, "spectator")
            case KickPlayerEvent():
                pass
            case UpdateGameSettingsEvent():
                pass
            case StartGameEvent():
                self._game_state.reset_game()
                self._game_state.create_players()
                self._game_state.create_track()
                self._game_state.create_frogs()
                self._game_state.start_game()
                self._game_state.state = "game"
            case MoveFrogEvent():
                if self._game_state.check_turn(event.websocket_id):
                    self._game_state.move_frog(event.websocket_id)
            case LegBetEvent():
                if self._game_state.check_turn(event.websocket_id):
                    self._game_state.make_leg_bet(event.websocket_id, event.frog_idx)
            case OverallBetEvent():
                if self._game_state.check_turn(event.websocket_id):
                    self._game_state.make_overall_bet(
                        event.websocket_id, event.frog_idx, event.bet_type
                    )
            case SpectatorTileEvent():
                if self._game_state.check_turn(event.websocket_id):
                    self._game_state.place_spectator_tile(
                        event.websocket_id, event.tile_idx
                    )
            case EndGameEvent():
                self._game_state.to_lobby()

        self.push_game_state()

    def push_game_state(self):
        print(self._game_state)
        self._state_update_queue.put(self._game_state)

    def run(self):
        while True:
            try:
                event = self.event_queue.get(timeout=1)
                print("got eVENET", event)
                self.process_event(event)
            except queue.Empty:
                continue


class GameManager:
    """
    Thread-safe state manager for handling shared state in game.
    """

    def __init__(self):
        self.lock = rwlock.RWLockWrite()
        self._state_update_queue = TypedQueue[GameState]()
        self._event_queues: dict[str, TypedQueue[BaseEvent]] = {}
        self._game_threads: dict[str, threading.Thread] = {}
        self._game_states: dict[str, GameState] = {}
        self._websockets: dict[str, dict[str, WebSocket]] = {}

    def create_game_state(self, game_code: str) -> bool:
        with self.lock.gen_wlock():
            if game_code in self._game_threads:
                return False

            initial_state = GameState(game_code=game_code)
            self._game_states[game_code] = initial_state
            self._websockets[game_code] = {}

            game = Game(game_code, initial_state, self._state_update_queue)
            t = threading.Thread(target=game.run, daemon=True)
            t.start()

            self._game_threads[game_code] = t
            self._event_queues[game_code] = game.event_queue
            return True

    def get_game_state(self, game_code: str) -> GameState | None:
        with self.lock.gen_rlock():
            state = self._game_states.get(game_code, None)
            if state is None:
                return None
            return state

    def add_websocket(
        self, game_code: str, websocket_id: str, websocket: WebSocket
    ) -> bool:
        with self.lock.gen_wlock():
            if game_code not in self._websockets:
                return False
            self._websockets[game_code][websocket_id] = websocket
            return True

    def add_event(self, event: BaseEvent) -> bool:
        with self.lock.gen_rlock():
            event_queue = self._event_queues.get(event.game_code)
            if event_queue is None:
                return False
            event_queue.put(event)
            return True

    async def run(self):
        while True:
            try:
                new_state = self._state_update_queue.get(timeout=1)
                with self.lock.gen_wlock():
                    self._game_states[new_state.game_code] = new_state
                    websockets = self._websockets.get(new_state.game_code, {})
                    for websocket_id, websocket in websockets.items():
                        try:
                            print(new_state.make_websocket_response(websocket_id))
                            await websocket.send_json(
                                new_state.make_websocket_response(websocket_id)
                            )
                        except Exception:
                            continue
            except queue.Empty:
                continue
