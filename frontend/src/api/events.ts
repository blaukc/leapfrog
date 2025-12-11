export const makeChooseViewEvent = (
    gameCode: string,
    view: "player" | "spectator"
) => {
    return {
        type: "choose_view",
        gameCode: gameCode,
        view: view,
    };
};

export const makeJoinGameEvent = (gameCode: string, name: string) => {
    return {
        type: "player_join",
        gameCode: gameCode,
        playerId: null,
        playerName: name,
    };
};
