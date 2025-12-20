import { Button, Grid, Typography } from "@mui/material";
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

    const connection = gameState.connections.find(
        (conn) => conn.websocket_id === websocketId
    );

    if (connection === undefined) {
        return <></>;
    }

    return (
        <Grid
            container
            flexDirection="column"
            justifyContent="center"
            height="100%"
            spacing={3}>
            {gameState.connections.filter(
                (conn) => conn.connection_type === "player"
            ).length > 0 && (
                <Grid
                    container
                    flexDirection="column"
                    alignItems="center"
                    spacing={0}>
                    <Typography>Players:</Typography>
                    {gameState.connections
                        .filter((conn) => conn.connection_type === "player")
                        .map((conn) => (
                            <Typography>{conn.name}</Typography>
                        ))}
                </Grid>
            )}
            {gameState.connections.filter(
                (conn) => conn.connection_type === "spectator"
            ).length > 0 && (
                <Grid
                    container
                    flexDirection="column"
                    alignItems="center"
                    spacing={0}>
                    <Typography>Spectators:</Typography>
                    {gameState.connections
                        .filter((conn) => conn.connection_type === "spectator")
                        .map((conn) => (
                            <Typography>{conn.name}</Typography>
                        ))}
                </Grid>
            )}
            {connection.is_host && (
                <Button
                    variant="contained"
                    color="primary"
                    style={{ width: "100%" }}
                    onClick={handleStartGame}>
                    Start Game
                </Button>
            )}
        </Grid>
    );
};

export default LobbyScreen;
