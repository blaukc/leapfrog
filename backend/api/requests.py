from pydantic import BaseModel


class JoinGameRequest(BaseModel):
    clientId: str | None


class CreatePlayerRequest(BaseModel):
    name: str
