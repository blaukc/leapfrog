from game_state.constants import INITIAL_GOLD


class Player:
    def __init__(self, player_id: str, name: str):
        self.player_id = player_id
        self.name = name
        self.gold = INITIAL_GOLD