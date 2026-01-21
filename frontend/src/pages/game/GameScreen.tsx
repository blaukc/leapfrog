import { Grid } from "@mui/material";
import type { GameState } from "../../api/types";
import type { SendJsonMessage } from "react-use-websocket/dist/lib/types";
import { useMemo } from "react";
import GameTile from "./components/GameTile";
import GameActions from "./components/GameActions";
import FrogInfo from "./components/FrogInfo";
import { getPlayerId } from "../../common/utils";
import EndGameStatsView from "./components/EndGameStatsView";
import GameHUD from "./components/GameHUD";

interface GameScreenProps {
    sendJsonMessage: SendJsonMessage;
    websocketId: string;
    gameCode: string;
    gameState: GameState;
}

const GameScreen = ({
    sendJsonMessage,
    websocketId,
    gameCode,
    gameState,
}: GameScreenProps) => {
    const playerId = useMemo(() => getPlayerId(websocketId), [websocketId]);
    const player = gameState.players[playerId];
    const isCurrentTurn = playerId === gameState.current_turn;

    return (
        <Grid
            container
            flexDirection="column"
            justifyContent="space-between"
            wrap="nowrap"
            height="100%">
            <Grid
                container
                justifyContent="space-between"
                height="200px"
                wrap="nowrap">
                <GameHUD gameState={gameState} playerId={playerId} />
            </Grid>
            <Grid container wrap="nowrap" spacing={1} overflow="auto">
                {gameState.track.map((tile, idx) => (
                    <GameTile
                        gameCode={gameCode}
                        websocketId={websocketId}
                        sendJsonMessage={sendJsonMessage}
                        idx={idx === gameState.num_tiles - 1 ? "FINISH" : idx}
                        tile={tile}
                        frogs={gameState.frogs}
                        unmovedFrogs={gameState.unmoved_frogs}
                        hasPlayerPlacedSpectatorTile={
                            player.spectator_tile_idx != -1
                        }
                        isCurrentTurn={isCurrentTurn}
                        gameState={gameState.state}
                    />
                ))}
            </Grid>
            {gameState.state === "game" && (
                <Grid
                    container
                    justifyContent="space-evenly"
                    overflow="auto"
                    wrap="nowrap"
                    spacing={2}>
                    {gameState.frogs.map((frog) => (
                        <FrogInfo
                            player={player}
                            isCurrentTurn={isCurrentTurn}
                            frog={frog}
                            hasMoved={
                                !gameState.unmoved_frogs.includes(frog.idx)
                            }
                            sendJsonMessage={sendJsonMessage}
                            gameCode={gameCode}
                            websocketId={websocketId}
                            legBets={
                                frog.is_forward_frog
                                    ? gameState.leg_bets[frog.idx]
                                    : []
                            }
                        />
                    ))}
                </Grid>
            )}
            {gameState.state === "game" && (
                <GameActions
                    sendJsonMessage={sendJsonMessage}
                    gameCode={gameCode}
                    websocketId={websocketId}
                    unmovedFrogs={gameState.unmoved_frogs}
                    isCurrentTurn={isCurrentTurn}
                />
            )}
            {gameState.state === "ended" && (
                <EndGameStatsView
                    sendJsonMessage={sendJsonMessage}
                    gameCode={gameCode}
                    websocketId={websocketId}
                    player={player}
                    endGameStats={gameState.end_game_stats}
                />
            )}
        </Grid>
    );
};

export default GameScreen;
