from contextlib import asynccontextmanager
import random
from fastapi import Depends, FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import logging

from game_state.state_manager import StateManager

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Lifespan setup started")
    
    app.state.state_managers: dict[str, StateManager] = {}

    yield

    if hasattr(app.state, "state_managers"):
        del app.state.state_managers

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

def get_state_managers() -> dict[str, StateManager] | None:
    if hasattr(app.state, "state_managers"):
        return app.state.state_managers
    raise RuntimeError("State managers not initialized")

@app.get("/join/{game_id}")
async def join_game(game_id: str):
    return {"success": True}

@app.post("/host", status_code=status.HTTP_201_CREATED)
async def host_game(response: Response, state_managers: dict[str, StateManager] = Depends(get_state_managers)):
    """Creates a new game and returns the game code. Fails if unable to generate a unique game_code after num_tries"""
    num_tries = 5
    while num_tries > 0:
        game_code = f"{random.randint(0, 999999):06d}"
        if game_code not in state_managers:
            state_managers[game_code] = StateManager(game_code)
            break
            
        num_tries -= 1
    else:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return {"error": "Could not generate unique game code"}

    return {"game_code": f"{game_code}"}