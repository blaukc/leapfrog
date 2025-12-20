import { Grid, Typography } from "@mui/material";
import type { Frog, Player } from "../../../api/types";
import PlacingIcon from "./PlacingIcon";

interface PlayerInfoProps {
    player: Player;
    frogs: Frog[];
    isCurrentTurn: boolean;
    isPlayer: boolean;
}

const PlayerInfo = ({
    player,
    frogs,
    isCurrentTurn,
    isPlayer,
}: PlayerInfoProps) => {
    const accumulatedWinnings = new Map<number, number[]>();
    player.leg_bets.forEach((legBet) => {
        if (!accumulatedWinnings.has(legBet.frog_idx)) {
            accumulatedWinnings.set(legBet.frog_idx, [0, 0, 0]);
        }
        const currWinnings = accumulatedWinnings.get(legBet.frog_idx)!;
        accumulatedWinnings.set(
            legBet.frog_idx,
            currWinnings.map((cw, idx) => cw + legBet.winnings[idx])
        );
    });

    return (
        <Grid container flexDirection="column" alignItems="start" width="150px">
            <Typography
                variant="subtitle1"
                color={isCurrentTurn ? "primary" : "none"}
                sx={{ textDecoration: isPlayer ? "underline" : "none" }}>
                {player.connection.name}
            </Typography>
            <Typography variant="body2">Gold: {player.gold}</Typography>
            {accumulatedWinnings.size > 0 && (
                <table style={{ borderSpacing: "10px 0px" }}>
                    <tr>
                        <th></th>
                        <th>
                            <PlacingIcon placing="first" />
                        </th>
                        <th>
                            <PlacingIcon placing="second" />
                        </th>
                        <th>
                            <PlacingIcon placing="third" />
                        </th>
                    </tr>
                    {[...accumulatedWinnings].map(([frogIdx, winnings]) => {
                        const frog = frogs[frogIdx];
                        return (
                            <tr>
                                <td>
                                    <div
                                        style={{
                                            height: 10,
                                            width: 10,
                                            backgroundColor: frog.color,
                                        }}></div>
                                </td>
                                <td>{winnings[0]}</td>
                                <td>{winnings[1]}</td>
                                <td>{winnings[2]}</td>
                            </tr>
                        );
                    })}
                </table>
            )}
        </Grid>
    );
};

export default PlayerInfo;
