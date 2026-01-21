import asyncio
from dataclasses import asdict, dataclass
import logging
import queue
from fastapi import WebSocket
from readerwriterlock import rwlock
import threading
import time

from game_state.state import GameState
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


logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


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

    async def process_event(self, event: BaseEvent):
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

        self._last_update_time = time.time()
        await self.push_game_state()

    async def push_game_state(self):
        logger.info(f"Updating game state: ${self.game_code}")
        await self._state_update_queue.put(self._game_state)

    async def run(self):
        while True:
            try:
                event = await self.event_queue.get()
                logger.info(f"Event ${event.type} received in game ${self.game_code}")
                await self.process_event(event)
            except queue.Empty:
                continue


class GameManager:
    """
    Thread-safe state manager for handling shared state in game.
    """

    def __init__(self):
        self.lock = asyncio.Lock()
        self._state_update_queue = TypedQueue[GameState]()
        self._games: dict[str, Game] = {}
        self._game_tasks: dict[str, asyncio.Task] = {}
        self._game_states: dict[str, GameState] = {}
        self._websockets: dict[str, dict[str, WebSocket]] = {}

    async def create_game_state(self, game_code: str) -> bool:
        async with self.lock:
            if game_code in self._game_tasks:
                return False

            initial_state = GameState(game_code=game_code)
            self._game_states[game_code] = initial_state
            self._websockets[game_code] = {}

            game = Game(game_code, initial_state, self._state_update_queue)
            game_task = asyncio.create_task(game.run())

            self._game_tasks[game_code] = game_task
            self._games[game_code] = game
            return True

    async def get_game_state(self, game_code: str) -> GameState | None:
        async with self.lock:
            state = self._game_states.get(game_code, None)
            if state is None:
                return None
            return state

    async def add_websocket(
        self, game_code: str, websocket_id: str, websocket: WebSocket
    ) -> bool:
        async with self.lock:
            if game_code not in self._websockets:
                return False
            self._websockets[game_code][websocket_id] = websocket
            return True

    async def add_event(self, event: BaseEvent) -> bool:
        async with self.lock:
            game = self._games.get(event.game_code)
            if game is None:
                return False
            await game.event_queue.put(event)
            return True

    async def _purge_game(self, game_code: str) -> None:
        """
        This should always be called under a function that has a write lock to the GameManager.
        """
        logger.info(f"Stopping game task ${game_code}")
        game_task = self._game_tasks[game_code]
        game_task.cancel()
        logger.info(f"Purging game ${game_code}")
        del self._game_tasks[game_code]
        del self._game_states[game_code]
        logger.info(f"Closing web sockets in game ${game_code}")
        websockets = self._websockets[game_code]
        for ws in websockets.values():
            await ws.close()
        del self._games[game_code]
        logger.info(f"Purged game ${game_code}")

    async def _purge_games(self, inactive_threshold: float) -> None:
        async with self.lock:
            current_time = time.time()
            for game_code, game_object in list(self._games.items()):
                if game_object._last_update_time < current_time - inactive_threshold:
                    await self._purge_game(game_code)

    async def purge_games(
        self, interval: int = 5 * 60, inactive_threshold: float = 60 * 60
    ):
        while True:
            await self._purge_games(inactive_threshold)
            await asyncio.sleep(interval)

    async def run(self):
        while True:
            await asyncio.sleep(0.01)
            try:
                new_state = await self._state_update_queue.get()
                async with self.lock:
                    self._game_states[new_state.game_code] = new_state
                    websockets = self._websockets.get(new_state.game_code, {})
                    for websocket_id, websocket in websockets.items():
                        try:
                            print(
                                "websocket response: ",
                                new_state.make_websocket_response(websocket_id),
                            )
                            await websocket.send_json(
                                new_state.make_websocket_response(websocket_id)
                            )
                        except Exception:
                            continue
            except queue.Empty:
                continue
