import { Button, Grid } from "@mui/material";
import type { GameState } from "../../api/types";

interface LobbyProps {
    sendJsonMessage: (message: any) => void;
    websocketId: string;
    gameCode: string;
    gameState: GameState;
}

const Lobby = ({
    sendJsonMessage,
    websocketId,
    gameCode,
    gameState,
}: LobbyProps) => {
    const handleStartGame = () => {
        sendJsonMessage({
            type: "start_game",
            websocket_id: websocketId,
            game_code: gameCode,
        });
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

export default Lobby;
