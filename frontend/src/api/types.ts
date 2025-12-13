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

export const ConnectionSchema = z.object({
    websocket_id: z
        .string()
        .describe("Unique websocket id for this connection."),
    name: z
        .string()
        .optional()
        .describe("Optional display name (may be blank)."),
    connection_type: z
        .enum(["player", "spectator"])
        .describe("Type of the connection."),
    active: z.boolean().describe("Whether connection is currently active."),
    is_host: z.boolean().describe("Whether this connection is the host."),
});
export type Connection = z.infer<typeof ConnectionSchema>;

// Player schema (maps player_id -> Player)
export const PlayerSchema = z.object({
    player_id: z.string().describe("The unique ID of the player."),
    connection: ConnectionSchema.describe(
        "Connection info associated with the player."
    ),
    gold: z
        .number()
        .int()
        .describe("The current gold amount (defaults to INITIAL_GOLD)."),
});
export type Player = z.infer<typeof PlayerSchema>;

// Frog and Tile types for the game track
export const FrogSchema = z.object({
    color: z.string().describe("Frog color"),
});
export const TileSchema = z.object({
    frogs: z.array(FrogSchema).describe("Frogs on this tile"),
});
export type Tile = z.infer<typeof TileSchema>;

// Full GameState schema
export const GameStateSchema = z.object({
    game_code: z.string().describe("The unique code for the game."),
    state: z.enum(["lobby", "game"]).describe("The current state of the game."),
    connections: z
        .array(ConnectionSchema)
        .describe("All connection objects (players and spectators)."),
    players: z
        .record(z.string(), PlayerSchema)
        .describe("Player map keyed by player_id."),
    player_order: z
        .array(z.string())
        .describe("Order of players by player_id."),
    current_turn: z
        .string()
        .describe("player_id for current turn (empty string when no one)."),
    track: z.array(TileSchema).describe("The tiles representing the track."),
});
export type GameState = z.infer<typeof GameStateSchema>;

// Websocket response wrapper (type + game_state)
export const WebsocketResponseSchema = z.object({
    type: z
        .enum(["player", "spectator", "unknown"])
        .describe("Type of connection for this websocket."),
    game_state: GameStateSchema.describe(
        "Serialized GameState returned to the client."
    ),
});
export type WebsocketResponse = z.infer<typeof WebsocketResponseSchema>;
