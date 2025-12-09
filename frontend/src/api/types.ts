export interface JoinGameResponse {
    success: boolean;
    message: string;
}

export interface HostGameReponse {
    success: boolean;
    game_code?: string;
    message: string;
}

export interface GameState {
    state: "LOBBY" | "GAME";
}
