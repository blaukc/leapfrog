import { Button, Grid } from "@mui/material";
import type { SendJsonMessage } from "react-use-websocket/dist/lib/types";
import { makeMoveFrogEvent } from "../../../api/events";

interface GameActionsProps {
    sendJsonMessage: SendJsonMessage;
    gameCode: string;
    websocketId: string;
}

const GameActions = ({
    sendJsonMessage,
    gameCode,
    websocketId,
}: GameActionsProps) => {
    const handleMoveFrog = () => {
        sendJsonMessage(makeMoveFrogEvent(gameCode, websocketId));
    };

    return (
        <Grid container justifyContent="space-evenly" padding="2em">
            <Button
                variant="contained"
                color="primary"
                onClick={handleMoveFrog}>
                Move Frog
            </Button>
        </Grid>
    );
};

export default GameActions;
