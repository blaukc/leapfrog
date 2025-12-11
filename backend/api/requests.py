from pydantic import BaseModel

class CreatePlayerRequest(BaseModel):
    name: str