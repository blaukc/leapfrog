import {
    Badge,
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
import PlacingIcon from "./PlacingIcon";

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
                <Typography
                    sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        width: "125px",
                    }}>
                    {frog.name}
                </Typography>
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
                        <Badge badgeContent={legBets.length} color="primary">
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={handleLegBet}
                                disabled={legBets.length <= 0}>
                                Leg Bet
                            </Button>
                        </Badge>
                        {legBets.length > 0 && (
                            <>
                                <Grid
                                    container
                                    justifyContent="space-evenly"
                                    width="100%">
                                    <Grid alignItems="center">
                                        <PlacingIcon placing="first" />
                                        <Typography>
                                            {legBets[0].winnings[0]}
                                        </Typography>
                                    </Grid>
                                    <Grid alignItems="center">
                                        <PlacingIcon placing="second" />
                                        <Typography>
                                            {legBets[0].winnings[1]}
                                        </Typography>
                                    </Grid>
                                    <Grid alignItems="center">
                                        <PlacingIcon placing="third" />
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
