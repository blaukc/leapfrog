import z from "zod";

export interface JoinGameResponse {
    success: boolean;
    message: string;
}

export interface HostGameReponse {
    success: boolean;
    game_code?: string;
    message: string;
}

export interface CreatePlayerReponse {
    success: boolean;
    websocket_id?: string;
    message: string;
}

export interface CreateSpectatorReponse {
    success: boolean;
    websocket_id?: string;
    message: string;
}

export interface GameState {
    state: "LOBBY" | "GAME";
}

const PlayerSchema = z.object({
    player_id: z.string().describe("The unique ID of the player."),
    name: z.string().describe("The player's display name."),
    gold: z
        .number()
        .int()
        .describe("The current gold amount (defaults to INITIAL_GOLD)."),
});

const GameStateSchema = z.object({
    game_code: z.string().describe("The unique code for the game."),
    state: z.string().describe("The current state of the game."),
    views: z.record(z.string(), z.string()),
    players: z.record(z.string(), PlayerSchema),
});

export const WebsocketResponseSchema = z.object({
    websocket_id: z.string().describe("The ID of the connected client."),
    type: z.string().describe("The client type."),
    name: z.string().describe("The display name of the player."),
    game_state: GameStateSchema,
});
