import {
    Avatar,
    Button,
    ButtonGroup,
    Divider,
    Grid,
    Typography,
    useTheme,
} from "@mui/material";
import type { SendJsonMessage } from "react-use-websocket/dist/lib/types";
import { makeLegBetEvent, makeOverallBetEvent } from "../../../api/events";
import type { Frog, LegBet, Player } from "../../../api/types";
import FrogSprite from "./FrogSprite";

interface FrogInfoProps {
    player: Player;
    frog: Frog;
    hasMoved: boolean;
    sendJsonMessage: SendJsonMessage;
    gameCode: string;
    websocketId: string;
    legBets: LegBet[];
}

const FrogInfo = ({
    player,
    frog,
    hasMoved,
    sendJsonMessage,
    gameCode,
    websocketId,
    legBets,
}: FrogInfoProps) => {
    const theme = useTheme();

    const handleLegBet = () => {
        sendJsonMessage(makeLegBetEvent(gameCode, websocketId, frog.idx));
    };

    const handleOverallBet = (betType: "winner" | "loser") => {
        sendJsonMessage(
            makeOverallBetEvent(gameCode, websocketId, frog.idx, betType)
        );
    };

    const overallBet = player.overall_bets[frog.idx];
    const borderColor =
        overallBet === "winner"
            ? theme.palette.success.main
            : overallBet === "loser"
            ? theme.palette.error.main
            : theme.palette.grey;

    return (
        <Grid
            container
            height="250px"
            width="150px"
            border={1}
            borderRadius={5}
            flexShrink={0}
            flexDirection="column"
            justifyContent="flex-start"
            alignItems="center"
            spacing={1}
            borderColor={borderColor.toString()}>
            <Grid container flexDirection="column" alignItems="center">
                <Typography>{frog.name}</Typography>
                <FrogSprite frog={frog} showName={false} />
                <span>{hasMoved ? "moved" : "unmoved"}</span>
            </Grid>
            {frog.is_forward_frog && (
                <>
                    <Divider sx={{ width: "100%" }} />
                    <ButtonGroup
                        variant="outlined"
                        size="small"
                        disabled={player.overall_bets[frog.idx] !== "none"}>
                        <Button
                            onClick={() => handleOverallBet("winner")}
                            color="success">
                            Winner
                        </Button>
                        <Button
                            onClick={() => handleOverallBet("loser")}
                            color="error">
                            Loser
                        </Button>
                    </ButtonGroup>
                    <Divider sx={{ width: "100%" }} />
                    <Grid
                        container
                        flexDirection="column"
                        alignItems="center"
                        spacing={1.5}
                        width="100%">
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={handleLegBet}>
                            Leg Bet
                        </Button>
                        {legBets.length > 0 && (
                            <>
                                <Grid
                                    container
                                    justifyContent="space-evenly"
                                    width="100%">
                                    <Grid alignItems="center">
                                        <Avatar
                                            sx={{
                                                width: 18,
                                                height: 18,
                                                fontSize: 14,
                                                bgcolor: "#FFD700",
                                            }}>
                                            1
                                        </Avatar>
                                        <Typography>
                                            {legBets[0].winnings[0]}
                                        </Typography>
                                    </Grid>
                                    <Grid alignItems="center">
                                        <Avatar
                                            sx={{
                                                width: 18,
                                                height: 18,
                                                fontSize: 14,
                                                bgcolor: "#C0C0C0",
                                            }}>
                                            2
                                        </Avatar>
                                        <Typography>
                                            {legBets[0].winnings[1]}
                                        </Typography>
                                    </Grid>
                                    <Grid alignItems="center">
                                        <Avatar
                                            sx={{
                                                width: 18,
                                                height: 18,
                                                fontSize: 14,
                                                bgcolor: "#CD7F32",
                                            }}>
                                            3+
                                        </Avatar>
                                        <Typography>
                                            {legBets[0].winnings[2]}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </>
                        )}
                    </Grid>
                </>
            )}
        </Grid>
    );
};

export default FrogInfo;
