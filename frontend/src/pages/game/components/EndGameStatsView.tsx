import { Button, Grid, Typography } from "@mui/material";
import type { SendJsonMessage } from "react-use-websocket/dist/lib/types";
import { makeResetGameEvent } from "../../../api/events";
import type { Player, EndGameStats, ConnectionType } from "../../../api/types";

interface EndGameStatsProps {
    connectionType: ConnectionType;
    sendJsonMessage: SendJsonMessage;
    gameCode: string;
    websocketId: string;
    player: Player;
    endGameStats: EndGameStats;
}

const EndGameStatsView = ({
    connectionType,
    sendJsonMessage,
    gameCode,
    websocketId,
    player,
    endGameStats,
}: EndGameStatsProps) => {
    const handleResetGame = () => {
        sendJsonMessage(makeResetGameEvent(gameCode, websocketId));
    };

    if (!endGameStats) {
        return <></>;
    }

    return (
        <Grid
            container
            flexDirection="column"
            justifyContent="center"
            alignItems="center">
            <Typography variant="h6">
                {endGameStats.winner[0].connection.name} has won the game.
            </Typography>
            {connectionType === "player" && (
                <>
                    {" "}
                    <Typography variant="subtitle1">Player Stats</Typography>
                    <Typography variant="subtitle2">
                        Gold earned from moving frogs:{" "}
                        {player.stats.move_frog_winnings}
                    </Typography>
                    <Typography variant="subtitle2">
                        Gold won from leg bets: {player.stats.leg_bet_winnings}
                    </Typography>
                    <Typography variant="subtitle2">
                        Gold lost from leg bets: {player.stats.leg_bet_losses}
                    </Typography>
                    <Typography variant="subtitle2">
                        Gold won from overall bets:{" "}
                        {player.stats.overall_bet_winnings}
                    </Typography>
                    <Typography variant="subtitle2">
                        Gold lost from overall bets:{" "}
                        {player.stats.overall_bet_losses}
                    </Typography>
                    <Typography variant="subtitle2">
                        Gold won from spectator tiles:{" "}
                        {player.stats.spectator_tile_winnings}
                    </Typography>
                </>
            )}
            <Typography variant="subtitle1">Game Stats</Typography>
            <Typography variant="subtitle2">
                Highest Bet Accuracy:{" "}
                {endGameStats.highest_bet_accuracy[0].connection.name} (
                {endGameStats.highest_bet_accuracy[1]})
            </Typography>
            <Typography variant="subtitle2">
                Most Losses: {endGameStats.most_losses[0].connection.name} (
                {endGameStats.most_losses[1]})
            </Typography>
            <Typography variant="subtitle2">
                Most Leg Bets: {endGameStats.most_leg_bets[0].connection.name} (
                {endGameStats.most_leg_bets[1]})
            </Typography>
            <Typography variant="subtitle2">
                Most Spectator Tile Winnings:{" "}
                {endGameStats.most_spectator_tile_winnings[0].connection.name} (
                {endGameStats.most_spectator_tile_winnings[1]})
            </Typography>
            {connectionType === "player" && player.connection.is_host && (
                <Button
                    variant="outlined"
                    onClick={handleResetGame}
                    style={{ margin: "5px" }}>
                    Reset Game
                </Button>
            )}
        </Grid>
    );
};

export default EndGameStatsView;
