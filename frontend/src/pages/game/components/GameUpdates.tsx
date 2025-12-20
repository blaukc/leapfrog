import { Grid, Typography } from "@mui/material";
import type { Frog, Player, Update } from "../../../api/types";

interface GameUpdatesProps {
    updates: Update[];
    players: Record<string, Player>;
    frogs: Frog[];
}

const GameUpdates = ({ updates, players, frogs }: GameUpdatesProps) => {
    const getColoredFrogName = (frog_idx: number) => {
        const frog = frogs[frog_idx];
        return <span style={{ color: frog.color }}>{frog.name}</span>;
    };

    const formatUpdate = (update: Update) => {
        switch (update.type) {
            case "player_move_frog": {
                const player = players[update.player_id];
                const name = player.connection.name;
                return (
                    <Typography variant="body2" textAlign="left">
                        {`${name} moved `}
                        {getColoredFrogName(update.frog_idx)}
                        {` from tile ${update.from_tile} to tile ${update.to_tile} and gained 1 gold.`}
                    </Typography>
                );
            }
            case "player_leg_bet": {
                const player = players[update.player_id];
                const name = player.connection.name;
                return (
                    <Typography variant="body2" textAlign="left">
                        {`${name} placed a leg bet on `}
                        {getColoredFrogName(update.frog_idx)}
                        {"."}
                    </Typography>
                );
            }
            case "player_overall_bet": {
                const player = players[update.player_id];
                const name = player.connection.name;
                return (
                    <Typography variant="body2" textAlign="left">
                        {`${name} placed an overall bet.`}
                    </Typography>
                );
            }
            case "player_spectator_tile": {
                const player = players[update.player_id];
                const name = player.connection.name;
                return (
                    <Typography variant="body2" textAlign="left">
                        {`${name} placed a ${update.direction > 0 ? "+" : ""}${
                            update.direction
                        } spectator tile on tile ${update.tile_idx}.`}
                    </Typography>
                );
            }
            case "leg_bet_winnings": {
                const player = players[update.player_id];
                const name = player.connection.name;
                return (
                    <Typography variant="body2" textAlign="left">
                        {`${name} ${
                            update.winnings > 0 ? "won" : "lost"
                        } ${Math.abs(update.winnings)} gold from a leg bet on `}
                        {getColoredFrogName(update.frog_idx)}
                        {"."}
                    </Typography>
                );
            }
            case "overall_bet_winnings": {
                const player = players[update.player_id];
                const name = player.connection.name;
                return (
                    <Typography variant="body2" textAlign="left">
                        {`${name} ${
                            update.winnings > 0 ? "won" : "lost"
                        } ${Math.abs(update.winnings)} gold from an overall ${
                            update.bet_type
                        } bet on `}
                        {getColoredFrogName(update.frog_idx)}
                        {"."}
                    </Typography>
                );
            }
            case "end_game_update": {
                const winner = players[update.player_rankings[0]];
                const name = winner.connection.name;
                return (
                    <Typography
                        variant="body2"
                        textAlign="left">{`The game has ended, ${name} has won the game!`}</Typography>
                );
            }
            default:
                return "Unknown game update.";
        }
    };

    return (
        <Grid
            container
            flexDirection="column-reverse"
            alignItems="start"
            justifyContent="flex-start"
            height="100%"
            overflow="auto"
            wrap="nowrap"
            width="400px">
            {[...updates].reverse().map((update) => formatUpdate(update))}
        </Grid>
    );
};

export default GameUpdates;
