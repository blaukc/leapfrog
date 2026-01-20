import { Badge, Button, Grid, IconButton, Tooltip } from "@mui/material";
import InfoOutlineIcon from "@mui/icons-material/InfoOutline";
import type { SendJsonMessage } from "react-use-websocket/dist/lib/types";
import { makeMoveFrogEvent } from "../../../api/events";

interface GameActionsProps {
    sendJsonMessage: SendJsonMessage;
    gameCode: string;
    websocketId: string;
    unmovedFrogs: number[];
    isCurrentTurn: boolean;
}

const MOVE_FROG_SUMMARY = `Move a random frog 1–3 steps; frogs move in the direction they face, carrying any frogs stacked on top with them. 
This action earns you 1 Gold immediately and brings the current leg closer to its conclusion.`;

const GameActions = ({
    sendJsonMessage,
    gameCode,
    websocketId,
    unmovedFrogs,
    isCurrentTurn,
}: GameActionsProps) => {
    const handleMoveFrog = () => {
        sendJsonMessage(makeMoveFrogEvent(gameCode, websocketId));
    };

    return (
        <Grid container justifyContent="center" paddingBottom="20px">
            <Badge
                badgeContent={`${7 - unmovedFrogs.length}/5`}
                color="primary">
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleMoveFrog}
                    disabled={!isCurrentTurn}>
                    <Grid
                        container
                        justifyContent="center"
                        alignItems="center"
                        gap="5px">
                        MOVE FROG
                        <Tooltip title={MOVE_FROG_SUMMARY}>
                            <IconButton size="small" style={{ padding: 0 }}>
                                <InfoOutlineIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                </Button>
            </Badge>
        </Grid>
    );
};

export default GameActions;
