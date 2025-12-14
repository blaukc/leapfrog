import { Button, Grid } from "@mui/material";
import type { GameState } from "../../api/types";
import {
    makeLegBetEvent,
    makeMoveFrogEvent,
    makeOverallBetEvent,
    makeSpectatorTileEvent,
} from "../../api/events";
import type { SendJsonMessage } from "react-use-websocket/dist/lib/types";
import { useState } from "react";

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
    const [legBetFrogIdx, setLegBetFrogIdx] = useState(-1);
    const [overallBetFrogIdx, setOverallBetFrogIdx] = useState(-1);
    const [spectatorTileIdx, setSpectatorTileIdx] = useState(-1);

    const handleMoveFrog = () => {
        sendJsonMessage(makeMoveFrogEvent(gameCode, websocketId));
    };

    const handleLegBet = () => {
        sendJsonMessage(makeLegBetEvent(gameCode, websocketId, legBetFrogIdx));
    };

    const handleOverallBet = () => {
        sendJsonMessage(
            makeOverallBetEvent(gameCode, websocketId, overallBetFrogIdx)
        );
    };

    const handleSpectatorTile = () => {
        sendJsonMessage(
            makeSpectatorTileEvent(gameCode, websocketId, spectatorTileIdx)
        );
    };

    return (
        <Grid>
            <div>{JSON.stringify(gameState, null, 2)}</div>
            <Button
                variant="contained"
                color="primary"
                style={{ width: "100%" }}
                onClick={handleMoveFrog}>
                Move Frog
            </Button>
            <Button
                variant="contained"
                color="primary"
                style={{ width: "100%" }}
                onClick={handleLegBet}>
                Leg Bet
            </Button>
            <Button
                variant="contained"
                color="primary"
                style={{ width: "100%" }}
                onClick={handleOverallBet}>
                Overall Bet
            </Button>
            <Button
                variant="contained"
                color="primary"
                style={{ width: "100%" }}
                onClick={handleSpectatorTile}>
                Spectator Tile
            </Button>
        </Grid>
    );
};

export default GameScreen;
