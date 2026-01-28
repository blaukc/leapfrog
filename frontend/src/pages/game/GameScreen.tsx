import { Grid } from "@mui/material";
import type { ConnectionType, GameState } from "../../api/types";
import type { SendJsonMessage } from "react-use-websocket/dist/lib/types";
import { useEffect, useMemo, useRef } from "react";
import GameTile from "./components/GameTile";
import GameActions from "./components/GameActions";
import FrogInfo from "./components/FrogInfo";
import { getPlayerId } from "../../common/utils";
import EndGameStatsView from "./components/EndGameStatsView";
import GameHUD from "./components/GameHUD";
import { toast } from "../../api/utils";

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
    const connectionType: ConnectionType =
        gameState.connections.find((conn) => conn.websocket_id === websocketId)
            ?.connection_type || "spectator";
    const playerId = useMemo(() => getPlayerId(websocketId), [websocketId]);
    const player = gameState.players[playerId] || null;
    const isCurrentTurn = playerId === gameState.current_turn;

    const lastToastedTurnId = useRef<number | null>(null);

    useEffect(() => {
        if (
            gameState.notify_turn &&
            isCurrentTurn &&
            lastToastedTurnId.current !== gameState.turn_number
        ) {
            toast("Your turn.", "info");
        }

        lastToastedTurnId.current = gameState.turn_number;
    }, [gameState.notify_turn, gameState.turn_number, isCurrentTurn]);

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
                        key={idx}
                        gameCode={gameCode}
                        websocketId={websocketId}
                        connectionType={connectionType}
                        sendJsonMessage={sendJsonMessage}
                        idx={idx === gameState.num_tiles - 1 ? "FINISH" : idx}
                        tile={tile}
                        frogs={gameState.frogs}
                        unmovedFrogs={gameState.unmoved_frogs}
                        hasPlayerPlacedSpectatorTile={
                            connectionType === "player"
                                ? player.spectator_tile_idx != -1
                                : false
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
                            key={frog.idx}
                            player={player}
                            connectionType={connectionType}
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
            {gameState.state === "game" && connectionType === "player" && (
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
                    connectionType={connectionType}
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
