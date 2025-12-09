from contextlib import asynccontextmanager
import random
from fastapi import Depends, FastAPI, Response, WebSocket, status
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import logging
import threading

from game_state.events import PlayerJoinEvent
from game_state.state import GameManager

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Lifespan setup started")
    
    app.state.state_manager = GameManager()
    t_state_manager = threading.Thread(target=app.state.state_manager.run, daemon=True)
    t_state_manager.start()

    logger.info("Lifespan setup completed")

    yield

    logger.info("Lifespan teardown started")
    if hasattr(app.state, "state_manager"):
        del app.state.state_manager

    t_state_manager.join(timeout=1)
    logger.info("Lifespan teardown completed")

app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost",
    "http://localhost:3000",  # Common React dev port
    "http://localhost:5173",  # Common Vite dev port (matching your error)
    "http://127.0.0.1:5173",
    "http://127.0.0.1"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,              # Allow the specific origins defined above
    allow_credentials=True,             # Allow cookies/authorization headers
    allow_methods=["*"],                # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],                # Allow all headers
)

def get_state_manager() -> GameManager | None:
    if hasattr(app.state, "state_manager"):
        return app.state.state_manager
    raise RuntimeError("State managers not initialized")

@app.get("/join/{game_code}", status_code=status.HTTP_200_OK)
async def join_game(game_code: str, response: Response, state_manager: GameManager = Depends(get_state_manager)):
    if state_manager.get_game_state(game_code) is not None:
        return {"success": True, "message": f"Joined game {game_code} successfully"}

    response.status_code = status.HTTP_404_NOT_FOUND
    return {"success": False, "message": f"Game code {game_code} does not exist"}

@app.post("/host", status_code=status.HTTP_201_CREATED)
async def host_game(response: Response, state_manager: GameManager = Depends(get_state_manager)):
    """Creates a new game and returns the game code. Fails if unable to generate a unique game_code after num_tries"""
    num_tries = 5
    while num_tries > 0:
        game_code = f"{random.randint(0, 999999):06d}"
        if state_manager.create_game_state(game_code):
            state_manager.add_event(game_code, PlayerJoinEvent())
            break
            
        num_tries -= 1
    else:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return {"success": False, "message": "Could not generate unique game code"}

    return {"success": True, "game_code": f"{game_code}", "message": "Game created successfully"}

@app.websocket("/game")
async def game_websocket(websocket: WebSocket):
    await websocket.accept()
    while True:
        json = await websocket.receive_json()
        print(json)