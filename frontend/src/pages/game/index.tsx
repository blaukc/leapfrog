import { CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast, getWsUrl } from "../../api/utils";
import useWebSocket, { ReadyState } from "react-use-websocket";

function Game() {
    const navigate = useNavigate();
    const params = useParams();
    const gameCode = params.gameCode;
    const clientId = localStorage.getItem("client_id");

    const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
        getWsUrl(gameCode!),
        {
            queryParams: {
                websocket_id: clientId ?? "",
            },
            onOpen: () => {
                toast("Connected", "success");
            },
            onClose: () => {
                toast("Disconnected", "error");
            },
        }
    );

    if (clientId === null) {
        navigate(`/leapfrog/${gameCode}/choose-view`);
        return;
    }

    const connectionStatus = {
        [ReadyState.CONNECTING]: "Connecting",
        [ReadyState.OPEN]: "Open",
        [ReadyState.CLOSING]: "Closing",
        [ReadyState.CLOSED]: "Closed",
        [ReadyState.UNINSTANTIATED]: "Uninstantiated",
    }[readyState];

    console.log(connectionStatus);

    if (gameCode === undefined || connectionStatus === "Closed") {
        navigate("/leapfrog");
        return;
    } else if (
        connectionStatus === "Connecting" ||
        connectionStatus === "Closing"
    ) {
        return <CircularProgress />;
    } else if (connectionStatus === "Open") {
        return <>{JSON.stringify(lastJsonMessage, null, 2)}</>;
    } else {
        return <CircularProgress />;
    }
}

export default Game;
