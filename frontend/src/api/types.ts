import z from "zod";

export interface JoinGameResponse {
    success: boolean;
    message: string;
}

export interface HostGameResponse {
    success: boolean;
    game_code?: string;
    message: string;
}

export interface CreatePlayerResponse {
    success: boolean;
    websocket_id?: string;
    player_id?: string;
    message: string;
}

export interface CreateSpectatorResponse {
    success: boolean;
    websocket_id?: string;
    message: string;
}

export const PlayerMoveFrogUpdateSchema = z.object({
    type: z.literal("player_move_frog"),
    player_id: z.string(),
    frog_idx: z.number().int(),
    from_tile: z.number().int(),
    to_tile: z.number().int(),
});

export const PlayerLegBetUpdateSchema = z.object({
    type: z.literal("player_leg_bet"),
    player_id: z.string(),
    frog_idx: z.number().int(),
});

export const PlayerOverallBetUpdateSchema = z.object({
    type: z.literal("player_overall_bet"),
    player_id: z.string(),
    bet_type: z.enum(["winner", "loser"]),
});

export const PlayerSpectatorTileUpdateSchema = z.object({
    type: z.literal("player_spectator_tile"),
    player_id: z.string(),
    tile_idx: z.number().int(),
    direction: z.number().int(),
});

export const SpectatorTileWinningsUpdateSchema = z.object({
    type: z.literal("spectator_tile_winnings"),
    frog_idx: z.number().int(),
    from_tile: z.number().int(),
    to_tile: z.number().int(),
    player_id: z.string(),
});

export const LegBetWinningsUpdateSchema = z.object({
    type: z.literal("leg_bet_winnings"),
    player_id: z.string(),
    frog_idx: z.number().int(),
    frog_placing: z.number().int(),
    winnings: z.number().int(),
});

export const OverallBetWinningsUpdateSchema = z.object({
    type: z.literal("overall_bet_winnings"),
    player_id: z.string(),
    bet_type: z.enum(["winner", "loser"]),
    frog_idx: z.number().int(),
    winnings: z.number().int(),
});

export const EndGameUpdateSchema = z.object({
    type: z.literal("end_game_update"),
    player_id: z.string(),
    player_rankings: z.array(z.string()),
    winning_frog_idx: z.number().int(),
});

export const UpdateSchema = z.discriminatedUnion("type", [
    PlayerMoveFrogUpdateSchema,
    PlayerLegBetUpdateSchema,
    PlayerOverallBetUpdateSchema,
    PlayerSpectatorTileUpdateSchema,
    SpectatorTileWinningsUpdateSchema,
    LegBetWinningsUpdateSchema,
    OverallBetWinningsUpdateSchema,
    EndGameUpdateSchema,
]);
export type Update = z.infer<typeof UpdateSchema>;

export const ConnectionSchema = z.object({
    websocket_id: z
        .string()
        .describe("Unique websocket id for this connection."),
    // Backend uses empty string default, so keep as required string (empty allowed)
    name: z.string().describe("Optional display name (may be blank)."),
    connection_type: z
        .enum(["player", "spectator"])
        .describe("Type of the connection."),
    active: z.boolean().describe("Whether connection is currently active."),
    is_host: z.boolean().describe("Whether this connection is the host."),
});
export type Connection = z.infer<typeof ConnectionSchema>;

/* Frog and Tile related schemas */
export const FrogSchema = z.object({
    idx: z.number().int().describe("Index identifier for the frog."),
    name: z.string().describe("Frog name"),
    color: z.string().describe("Frog color"),
    start_pos: z.number().int().describe("Frog start position on track"),
    is_forward_frog: z
        .boolean()
        .describe("Whether frog moves forwards or backwards"),
    moves: z
        .array(z.number().int())
        .describe("Possible moves for this frog (list of ints)"),
});
export type Frog = z.infer<typeof FrogSchema>;

export const SpectatorTileSchema = z.object({
    player_id: z.string().describe("Player who placed the spectator tile"),
    player_name: z
        .string()
        .describe("Name of player who placed the spectator tile"),
    direction: z
        .number()
        .int()
        .describe("Direction: 1 (forward) or -1 (backward)"),
});
export type SpectatorTile = z.infer<typeof SpectatorTileSchema>;

export const TileSchema = z.object({
    // backend uses frog indices (numbers) placed on a tile
    frogs: z
        .array(z.number().int())
        .describe("Frog indices on this tile (numbers)"),
    can_spectator_tile_be_placed: z
        .boolean()
        .describe("Whether spectator tile can be placed here"),
    spectator_tile: SpectatorTileSchema.nullable().optional(),
});
export type Tile = z.infer<typeof TileSchema>;

/* Betting schemas */
export const LegBetSchema = z.object({
    frog_idx: z.number().int().describe("Index of frog being bet on"),
    winnings: z.array(z.number().int()).describe("Winnings for positions"),
});
export type LegBet = z.infer<typeof LegBetSchema>;

export const OverallBetSchema = z.object({
    frog_idx: z.number().int().describe("Index of frog"),
    player_id: z.string().describe("Player who made the overall bet"),
});
export type OverallBet = z.infer<typeof OverallBetSchema>;

/* Player statistics schema matching backend PlayerStats dataclass */
export const PlayerStatsSchema = z.object({
    move_frog_winnings: z.number().int().default(0),

    num_leg_bets_won: z.number().int().default(0),
    leg_bet_winnings: z.number().int().default(0),
    num_leg_bets_lost: z.number().int().default(0),
    leg_bet_losses: z.number().int().default(0),

    num_overall_bets_won: z.number().int().default(0),
    overall_bet_winnings: z.number().int().default(0),
    num_overall_bets_lost: z.number().int().default(0),
    overall_bet_losses: z.number().int().default(0),

    spectator_tile_winnings: z.number().int().default(0),
    // Computed properties present on backend (may be omitted in serialized payloads)
    total_leg_bets_made: z.number().int().optional(),
    total_overall_bets_made: z.number().int().optional(),
    total_losses: z.number().int().optional(),
    bet_accuracy: z.number().optional(),
});
export type PlayerStats = z.infer<typeof PlayerStatsSchema>;

/* Player schema */
export const PlayerSchema = z.object({
    player_id: z.string().describe("The unique ID of the player."),
    connection: ConnectionSchema.describe(
        "Connection info associated with the player.",
    ),
    num_frogs: z
        .number()
        .int()
        .describe("Number of frogs owned by the player."),
    gold: z.number().int().describe("The current gold amount."),
    leg_bets: z.array(LegBetSchema).describe("Leg bets made by the player."),
    overall_bets: z
        .array(z.enum(["none", "winner", "loser"]))
        .describe("Whether player has made an overall bet per frog."),
    spectator_tile_idx: z
        .number()
        .int()
        .describe("Index of a spectator tile placed by player, -1 if none."),
    stats: PlayerStatsSchema,
});
export type Player = z.infer<typeof PlayerSchema>;

/* End game stats schema matching backend EndGameStats dataclass */
export const EndGameStatsSchema = z
    .object({
        winner: z
            .tuple([PlayerSchema, z.number().int()])
            .describe("Tuple of winning player and their score/placing"),
        placings: z
            .array(PlayerSchema)
            .describe("Players in final placing order"),
        most_leg_bets: z
            .tuple([PlayerSchema, z.number().int()])
            .describe("Player with most leg bets and count"),
        most_losses: z
            .tuple([PlayerSchema, z.number().int()])
            .describe("Player with most losses and count"),
        highest_bet_accuracy: z
            .tuple([PlayerSchema, z.number()])
            .describe(
                "Player with highest bet accuracy and the accuracy value",
            ),
        most_spectator_tile_winnings: z
            .tuple([PlayerSchema, z.number().int()])
            .describe("Player with most spectator tile winnings and amount"),
    })
    .nullable()
    .optional()
    .describe("End game stats (present when game has ended).");
export type EndGameStats = z.infer<typeof EndGameStatsSchema>;

/* Full GameState schema */
export const GameStateSchema = z.object({
    game_code: z.string().describe("The unique code for the game."),
    state: z
        .enum(["lobby", "game", "ended"])
        .describe("The current state of the game."),
    current_round: z.number().int().describe("Current round number (int)"),
    turn_number: z.number().int().describe("Current turn number (int)"),
    updates: z
        .array(UpdateSchema)
        .describe("List of updates/events from server."),
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
    notify_turn: z
        .boolean()
        .describe("Whether player should be notified of turn"),
    num_tiles: z
        .number()
        .int()
        .describe("Number of tiles (including finish tile)."),
    track: z.array(TileSchema).describe("The tiles representing the track."),
    num_frogs: z.number().int(),
    num_backward_frogs: z.number().int(),
    num_frogs_per_round: z.number().int(),
    frogs: z.array(FrogSchema).describe("List of all frogs in the game."),
    unmoved_frogs: z
        .array(z.number().int())
        .describe("Indices of frogs that haven't moved this round"),
    leg_bets: z
        .array(z.array(LegBetSchema))
        .describe("Available leg bets for current round (list of lists)"),
    overall_win_bets: z
        .array(OverallBetSchema)
        .describe("Players who bet on winners in order"),
    overall_lose_bets: z
        .array(OverallBetSchema)
        .describe("Players who bet on losers in order"),
    overall_bet_winnings: z
        .array(z.number().int())
        .describe("Winnings array used for overall bets"),
    overall_bet_loss: z.number().int(),
    end_game_stats: EndGameStatsSchema.describe(
        "Stats from the end of the game, if present.",
    ),
});
export type GameState = z.infer<typeof GameStateSchema>;

/* Websocket response wrapper (type + game_state) */
export const WebsocketResponseSchema = z.object({
    type: z
        .enum(["player", "spectator", "unknown"])
        .describe("Type of connection for this websocket."),
    game_state: GameStateSchema.describe(
        "Serialized GameState returned to the client.",
    ),
});
export type WebsocketResponse = z.infer<typeof WebsocketResponseSchema>;
