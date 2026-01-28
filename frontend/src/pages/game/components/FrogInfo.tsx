import {
    Badge,
    Button,
    ButtonGroup,
    Divider,
    Grid,
    IconButton,
    Tooltip,
    Typography,
    useTheme,
} from "@mui/material";
import InfoOutlineIcon from "@mui/icons-material/InfoOutline";
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
    isCurrentTurn: boolean;
}

const OVERALL_BET_SUMMARY = `Predict the race winner or loser to earn 8, 5, 3, 2, or 1 Gold based on how early you placed your bet. 
Correct guesses pay out according to your position in the deck, while any incorrect guess results in a 1 Gold penalty.`;
const LEG_BET_SUMMARY = `Bet on a frog to lead the leg: finishing 1st or 2nd pays out, but any lower rank incurs a -1 penalty. 
Payouts diminish (e.g., from 5 to 2 for 1st place) as more bets are taken, rewarding those who commit earlier.`;

const FrogInfo = ({
    player,
    frog,
    hasMoved,
    sendJsonMessage,
    gameCode,
    websocketId,
    legBets,
    isCurrentTurn,
}: FrogInfoProps) => {
    const theme = useTheme();

    const handleLegBet = () => {
        sendJsonMessage(makeLegBetEvent(gameCode, websocketId, frog.idx));
    };

    const handleOverallBet = (betType: "winner" | "loser") => {
        sendJsonMessage(
            makeOverallBetEvent(gameCode, websocketId, frog.idx, betType),
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
            spacing={0.5}
            borderColor={borderColor.toString()}
            bgcolor={hasMoved ? "rgba(211, 211, 211, 0.2)" : ""}>
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
                <FrogSprite
                    frog={frog}
                    showName={false}
                    isSleeping={hasMoved}
                />
            </Grid>
            {frog.is_forward_frog && (
                <>
                    <Divider sx={{ width: "100%" }} />
                    <Grid
                        container
                        alignItems="center"
                        width="100%"
                        justifyContent="center"
                        gap="5px">
                        <Typography>Overall Bet</Typography>
                        <Tooltip
                            disableFocusListener
                            title={OVERALL_BET_SUMMARY}
                            enterTouchDelay={0}>
                            <IconButton size="small" style={{ padding: 0 }}>
                                <InfoOutlineIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                    <ButtonGroup
                        variant="outlined"
                        size="small"
                        disabled={
                            player.overall_bets[frog.idx] !== "none" ||
                            !isCurrentTurn
                        }>
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
                                disabled={
                                    legBets.length <= 0 || !isCurrentTurn
                                }>
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
                                    <Tooltip
                                        disableFocusListener
                                        title={LEG_BET_SUMMARY}
                                        enterTouchDelay={0}>
                                        <IconButton
                                            size="small"
                                            style={{ padding: 0 }}>
                                            <InfoOutlineIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
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
