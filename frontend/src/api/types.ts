export interface JoinGameResponse {
    success: boolean;
    message: string;
}

export interface HostGameReponse {
    success: boolean;
    gameCode?: string;
    message: string;
}
