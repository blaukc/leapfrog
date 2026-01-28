from contextlib import asynccontextmanager
import random
import re
from fastapi import APIRouter, Depends, FastAPI, Response, WebSocket, status
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import logging
import threading
import uuid

import starlette

from api.requests import CreatePlayerRequest, JoinGameRequest
from game_state.events import Event, EventAdapter, PlayerJoinEvent, SpectatorJoinEvent
from game_state.game import GameManager


logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Lifespan setup started")

    manager = GameManager()
    app.state.state_manager = manager
    game_loop_task = asyncio.create_task(manager.run())
    purge_task = asyncio.create_task(manager.purge_games())

    logger.info("Lifespan setup completed")

    yield

    logger.info("Lifespan teardown started")

    game_loop_task.cancel()
    purge_task.cancel()

    try:
        await asyncio.gather(game_loop_task, purge_task, return_exceptions=True)
    except asyncio.CancelledError:
        pass

    if hasattr(app.state, "state_manager"):
        del app.state.state_manager

    logger.info("Lifespan teardown completed")


app = FastAPI(lifespan=lifespan)

import os

# Determine CORS origins via ALLOWED_ORIGINS env var (comma separated). Fall back to common dev origins.
_allowed = os.environ.get("ALLOWED_ORIGINS")
if _allowed:
    origins = [s.strip() for s in _allowed.split(",") if s.strip()]
else:
    origins = [
        "http://localhost",
        "http://localhost:3000",  # Common React dev port
        "http://localhost:5173",  # Common Vite dev port (matching your error)
        "http://127.0.0.1:5173",
        "http://127.0.0.1",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow the specific origins defined above
    allow_credentials=True,  # Allow cookies/authorization headers
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)


prefix_router = APIRouter(prefix="/leapfrog")


def get_state_manager() -> GameManager | None:
    if hasattr(app.state, "state_manager"):
        return app.state.state_manager
    raise RuntimeError("State managers not initialized")


@prefix_router.post("/game/{game_code}/join", status_code=status.HTTP_200_OK)
async def join_game(
    game_code: str,
    payload: JoinGameRequest,
    response: Response,
    state_manager: GameManager = Depends(get_state_manager),
):
    if await state_manager.get_game_state(game_code) is None:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {
            "success": False,
            "is_existing_player": False,
            "message": f"Game code {game_code} does not exist",
        }

    if payload.clientId is not None and await state_manager.is_websocket_exist(
        game_code, payload.clientId
    ):
        return {
            "success": True,
            "is_existing_player": True,
            "message": f"Rejoined game {game_code} successfully",
        }

    return {
        "success": True,
        "is_existing_player": False,
        "message": f"Joined game {game_code} successfully",
    }


@prefix_router.post("/host", status_code=status.HTTP_201_CREATED)
async def host_game(
    response: Response, state_manager: GameManager = Depends(get_state_manager)
):
    """Creates a new game and returns the game code. Fails if unable to generate a unique game_code after num_tries"""
    num_tries = 5
    while num_tries > 0:
        game_code = f"{random.randint(0, 999999):06d}"
        if await state_manager.create_game_state(game_code):
            break

        num_tries -= 1
    else:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return {"success": False, "message": "Could not generate unique game code"}

    return {
        "success": True,
        "game_code": f"{game_code}",
        "message": "Game created successfully",
    }


@prefix_router.post("/game/{game_code}/create-player", status_code=status.HTTP_200_OK)
async def create_player(
    game_code: str,
    payload: CreatePlayerRequest,
    response: Response,
    state_manager: GameManager = Depends(get_state_manager),
):
    if not re.match(
        r"^[ \w!@#$%^&*()\-=[\]{};':\"\\|,.<>/?]{1,15}$", payload.name, re.ASCII
    ):
        return {
            "success": False,
            "message": f"Invalid name. Use 1-15 standard keyboard characters.",
        }

    game_state = await state_manager.get_game_state(game_code)
    if game_state is None:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"success": False, "message": f"Game code {game_code} does not exist"}

    if game_state.state != "lobby":
        return {"success": False, "message": "Game is currently ongoing."}

    websocket_id = str(uuid.uuid4())[:8]
    await state_manager.add_event(
        PlayerJoinEvent(
            game_code=game_code, websocket_id=websocket_id, player_name=payload.name
        )
    )
    return {
        "success": True,
        "websocket_id": websocket_id,
        "message": f"Player {payload.name} has joined game sucessfully.",
    }


@prefix_router.post(
    "/game/{game_code}/create-spectator", status_code=status.HTTP_200_OK
)
async def create_spectator(
    game_code: str,
    response: Response,
    state_manager: GameManager = Depends(get_state_manager),
):
    if await state_manager.get_game_state(game_code) is not None:
        websocket_id = str(uuid.uuid4())[:8]
        await state_manager.add_event(
            SpectatorJoinEvent(gameCode=game_code, websocket_id=websocket_id)
        )
        return {
            "success": True,
            "websocket_id": websocket_id,
            "message": f"Spectator has joined game sucessfully.",
        }

    response.status_code = status.HTTP_404_NOT_FOUND
    return {"success": False, "message": f"Game code {game_code} does not exist"}


async def send_game_state(
    websocket: WebSocket, state_manager: GameManager, game_code: str, websocket_id: str
):
    game_state = await state_manager.get_game_state(game_code)
    if game_state is None:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    print("ws", game_state)
    await websocket.send_json(game_state.make_websocket_response(websocket_id))


@prefix_router.websocket("/game/{game_code}")
async def game_websocket(
    websocket: WebSocket,
    game_code: str,
    state_manager: GameManager = Depends(get_state_manager),
):
    if websocket.query_params.get("websocket_id") is None:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    websocket_id = websocket.query_params["websocket_id"]
    await websocket.accept()
    await state_manager.add_websocket(
        game_code=game_code, websocket_id=websocket_id, websocket=websocket
    )

    await send_game_state(websocket, state_manager, game_code, websocket_id)

    while True:
        try:
            event_dict = await websocket.receive_json()
        except starlette.websockets.WebSocketDisconnect:
            logger.info(f"Player {websocket_id} disconnected normally.")
            return
        try:
            print(event_dict)
            parsed_event: Event = EventAdapter.validate_python(
                event_dict, by_alias=True
            )
            print(parsed_event)
            parsed_event.websocket_id = websocket_id
            await state_manager.add_event(parsed_event)
        except Exception as e:
            logger.error(f"Failed to parse event: {e}")
            continue


app.include_router(prefix_router)
