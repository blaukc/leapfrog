import { Grid, Typography } from "@mui/material";
import type { Player } from "../../../api/types";

interface PlayerInfoProps {
    player: Player;
    isCurrentTurn: boolean;
}

const PlayerInfo = ({ player, isCurrentTurn }: PlayerInfoProps) => {
    return (
        <Grid container flexDirection="column" alignItems="start">
            <Typography
                variant="subtitle1"
                color={isCurrentTurn ? "primary" : "none"}>
                {player.connection.name}
            </Typography>
            <Typography>Gold: {player.gold}</Typography>
            {/* Popup to see leg bets */}
        </Grid>
    );
};

export default PlayerInfo;
