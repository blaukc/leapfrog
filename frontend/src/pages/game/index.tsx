import { CircularProgress } from "@mui/material";
import { useNavigate, useParams } from "react-router";
import { toast, getWsUrl } from "../../api/utils";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { WebsocketResponseSchema } from "../../api/types";
import LobbyScreen from "./LobbyScreen";
import GameScreen from "./GameScreen";
import { CLIENT_ID_LOCAL_STORAGE_KEY } from "../../common/constants";

function Game() {
    const navigate = useNavigate();
    const params = useParams();
    const gameCode = params.gameCode;
    const clientId = localStorage.getItem(CLIENT_ID_LOCAL_STORAGE_KEY);

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
        },
    );

    if (clientId === null) {
        navigate(`/leapfrog/${gameCode}/choose-view`);
        return;
    }

    if (lastJsonMessage === null) {
        return <CircularProgress />;
    }

    const parseRes = WebsocketResponseSchema.safeParse(lastJsonMessage);
    if (!parseRes.success) {
        console.error("Failed to parse websocket message:", parseRes.error);
        toast("Received malformed message from server", "error");
        return;
    }

    const gameState = parseRes.data.game_state;

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
        if (gameState.state === "lobby") {
            return (
                <LobbyScreen
                    sendJsonMessage={sendJsonMessage}
                    websocketId={clientId}
                    gameCode={gameCode}
                    gameState={gameState}
                />
            );
        } else if (gameState.state === "game" || gameState.state === "ended") {
            return (
                <GameScreen
                    sendJsonMessage={sendJsonMessage}
                    websocketId={clientId}
                    gameCode={gameCode}
                    gameState={gameState}
                />
            );
        } else {
            return <div>Unknown game state</div>;
        }
    } else {
        return <CircularProgress />;
    }
}

export default Game;
