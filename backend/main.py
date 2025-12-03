from contextlib import asynccontextmanager
from fastapi import FastAPI
import asyncio
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Lifespan setup started")

    yield

    logger.info("Lifespan teardown completed")

app = FastAPI(lifespan=lifespan)

@app.get("/join/{game_id}")
async def join_game(game_id: str):
    return {"message": "Hello World"}
