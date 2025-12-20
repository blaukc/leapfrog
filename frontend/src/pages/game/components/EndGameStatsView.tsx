import { Button, Grid, Typography } from "@mui/material";
import type { SendJsonMessage } from "react-use-websocket/dist/lib/types";
import { makeResetGameEvent } from "../../../api/events";
import type { Player, EndGameStats } from "../../../api/types";

interface EndGameStatsProps {
    sendJsonMessage: SendJsonMessage;
    gameCode: string;
    websocketId: string;
    player: Player;
    endGameStats: EndGameStats;
}

const EndGameStatsView = ({
    sendJsonMessage,
    gameCode,
    websocketId,
    player,
    endGameStats,
}: EndGameStatsProps) => {
    const handleResetGame = () => {
        sendJsonMessage(makeResetGameEvent(gameCode, websocketId));
    };

    return (
        <Grid
            container
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            spacing={1}>
            <Typography>
                {endGameStats?.winner.connection.name} has won the game.
            </Typography>
            <Typography>STATS</Typography>
            {player.connection.is_host && (
                <Button variant="outlined" onClick={handleResetGame}>
                    Reset Game
                </Button>
            )}
        </Grid>
    );
};

export default EndGameStatsView;
