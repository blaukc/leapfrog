import { Badge, Button, Grid } from "@mui/material";
import type { SendJsonMessage } from "react-use-websocket/dist/lib/types";
import { makeMoveFrogEvent } from "../../../api/events";

interface GameActionsProps {
    sendJsonMessage: SendJsonMessage;
    gameCode: string;
    websocketId: string;
    unmovedFrogs: number[];
}

const GameActions = ({
    sendJsonMessage,
    gameCode,
    websocketId,
    unmovedFrogs,
}: GameActionsProps) => {
    const handleMoveFrog = () => {
        sendJsonMessage(makeMoveFrogEvent(gameCode, websocketId));
    };

    return (
        <Grid container justifyContent="space-evenly" padding="2em">
            <Badge
                badgeContent={`${7 - unmovedFrogs.length}/5`}
                color="primary">
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleMoveFrog}>
                    Move Frog
                </Button>
            </Badge>
        </Grid>
    );
};

export default GameActions;
