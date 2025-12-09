import { CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast, WS_URL } from "./api/utils";
import useWebSocket, { ReadyState } from "react-use-websocket";

function Game() {
    const navigate = useNavigate();
    const params = useParams();
    const gameCode = params.gameCode;
    const [shouldConnect, setShouldConnect] = useState(true);
    const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
        WS_URL,
        {
            onOpen: () => {
                toast("Connected", "success");
            },
            onClose: () => {
                toast("Disconnected", "error");
            },
        },
        shouldConnect
    );

    useEffect(() => {
        return () => {
            setShouldConnect(false);
        };
    }, []);

    const connectionStatus = {
        [ReadyState.CONNECTING]: "Connecting",
        [ReadyState.OPEN]: "Open",
        [ReadyState.CLOSING]: "Closing",
        [ReadyState.CLOSED]: "Closed",
        [ReadyState.UNINSTANTIATED]: "Uninstantiated",
    }[readyState];

    if (gameCode === undefined || connectionStatus === "Closed") {
        navigate("/leapfrog");
        return;
    }

    if (connectionStatus === "Connecting" || connectionStatus === "Closing") {
        return <CircularProgress />;
    } else if (connectionStatus === "Open") {
        return "noice";
    } else {
        return <CircularProgress />;
    }
}

export default Game;
