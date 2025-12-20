import { Grid } from "@mui/material";
import type { GameState } from "../../api/types";
import type { SendJsonMessage } from "react-use-websocket/dist/lib/types";
import { useMemo } from "react";
import GameTile from "./components/GameTile";
import PlayerInfo from "./components/PlayerInfo";
import GameActions from "./components/GameActions";
import FrogInfo from "./components/FrogInfo";
import { getPlayerId } from "../../common/utils";

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
            <Grid container justifyContent="space-between" height="150px">
                <Grid container wrap="nowrap" spacing={2} overflow="auto">
                    {gameState.player_order
                        .map((playerId) => gameState.players[playerId])
                        .map((player) => (
                            <PlayerInfo
                                player={player}
                                frogs={gameState.frogs}
                                isCurrentTurn={
                                    player.player_id === gameState.current_turn
                                }
                                isPlayer={player.player_id === playerId}
                            />
                        ))}
                </Grid>
            </Grid>
            <Grid container wrap="nowrap" spacing={1} overflow="auto">
                {gameState.track.map((tile, idx) => (
                    <GameTile
                        idx={idx === gameState.num_tiles - 1 ? "FINISH" : idx}
                        tile={tile}
                        frogs={gameState.frogs}
                    />
                ))}
            </Grid>
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
                        hasMoved={!gameState.unmoved_frogs.includes(frog.idx)}
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
            <GameActions
                sendJsonMessage={sendJsonMessage}
                gameCode={gameCode}
                websocketId={websocketId}
                unmovedFrogs={gameState.unmoved_frogs}
                isCurrentTurn={isCurrentTurn}
            />
            {/* <div>{JSON.stringify(gameState, null, 1)}</div> */}
        </Grid>
    );
};

export default GameScreen;
