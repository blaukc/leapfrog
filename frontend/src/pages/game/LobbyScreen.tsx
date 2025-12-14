import { Button, Grid } from "@mui/material";
import type { GameState } from "../../api/types";
import { makeStartGameEvent } from "../../api/events";
import type { SendJsonMessage } from "react-use-websocket/dist/lib/types";

interface LobbyScreenProps {
    sendJsonMessage: SendJsonMessage;
    websocketId: string;
    gameCode: string;
    gameState: GameState;
}

const LobbyScreen = ({
    sendJsonMessage,
    websocketId,
    gameCode,
    gameState,
}: LobbyScreenProps) => {
    const handleStartGame = () => {
        sendJsonMessage(makeStartGameEvent(gameCode, websocketId));
    };

    return (
        <Grid>
            <div>{JSON.stringify(gameState, null, 2)}</div>
            <Button
                variant="contained"
                color="primary"
                style={{ width: "100%" }}
                onClick={handleStartGame}>
                Start Game
            </Button>
        </Grid>
    );
};

export default LobbyScreen;
