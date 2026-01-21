export const makeStartGameEvent = (gameCode: string, websocketId: string) => {
    return {
        type: "start_game",
        gameCode: gameCode,
        websocketId: websocketId,
    };
};

export const makeMoveFrogEvent = (gameCode: string, websocketId: string) => {
    return {
        type: "move_frog",
        gameCode: gameCode,
        websocketId: websocketId,
    };
};

export const makeLegBetEvent = (
    gameCode: string,
    websocketId: string,
    frogIdx: number,
) => {
    return {
        type: "leg_bet",
        gameCode: gameCode,
        websocketId: websocketId,
        frogIdx: frogIdx,
    };
};

export const makeOverallBetEvent = (
    gameCode: string,
    websocketId: string,
    frogIdx: number,
    betType: "winner" | "loser",
) => {
    return {
        type: "overall_bet",
        gameCode: gameCode,
        websocketId: websocketId,
        frogIdx: frogIdx,
        betType: betType,
    };
};

export const makeSpectatorTileEvent = (
    gameCode: string,
    websocketId: string,
    tileIdx: number,
    displacement: number,
) => {
    return {
        type: "spectator_tile",
        gameCode: gameCode,
        websocketId: websocketId,
        tileIdx: tileIdx,
        displacement: displacement,
    };
};

export const makeResetGameEvent = (gameCode: string, websocketId: string) => {
    return {
        type: "end_game",
        gameCode: gameCode,
        websocketId: websocketId,
    };
};
