import { Box, Button, ButtonGroup, Grid, Tooltip } from "@mui/material";
import type {
    Frog,
    Tile,
    SpectatorTile,
    ConnectionType,
} from "../../../api/types";
import FrogSprite from "./FrogSprite";
import { makeSpectatorTileEvent } from "../../../api/events";
import type { SendJsonMessage } from "react-use-websocket/dist/lib/types";

interface FrogStackProps {
    tile: Tile;
    frogs: Frog[];
    unmovedFrogs: number[];
}

const FrogStack = ({ tile, frogs, unmovedFrogs }: FrogStackProps) => {
    return tile.frogs.map((frogIdx, pos) => {
        const frog = frogs[frogIdx];
        return (
            <FrogSprite
                key={pos}
                frog={frog}
                zIndex={tile.frogs.length - pos}
                marginBottom={pos === 0 ? -10 : -40}
                isSleeping={!unmovedFrogs.includes(frog.idx)}
            />
        );
    });
};

interface PlaceSpectatorTileProps {
    gameCode: string;
    websocketId: string;
    sendJsonMessage: SendJsonMessage;
    tileIdx: number;
    isCurrentTurn: boolean;
}

const PlaceSpectatorTile = ({
    gameCode,
    websocketId,
    sendJsonMessage,
    tileIdx,
    isCurrentTurn,
}: PlaceSpectatorTileProps) => {
    const handleSpectatorTile = (displacement: number) => {
        sendJsonMessage(
            makeSpectatorTileEvent(
                gameCode,
                websocketId,
                tileIdx,
                displacement,
            ),
        );
    };
    return (
        <Grid container width="100%" justifyContent="center">
            <ButtonGroup
                variant="outlined"
                size="small"
                disabled={!isCurrentTurn}>
                <Button
                    onClick={() => handleSpectatorTile(-1)}
                    color="primary"
                    style={{ minWidth: "37.5px" }}>
                    -1
                </Button>
                <Button
                    onClick={() => handleSpectatorTile(1)}
                    color="primary"
                    style={{ minWidth: "37.5px" }}>
                    +1
                </Button>
            </ButtonGroup>
        </Grid>
    );
};

interface SpectatorTileProps {
    spectatorTile: SpectatorTile;
}

const SpectatorTile = ({ spectatorTile }: SpectatorTileProps) => {
    return (
        <Tooltip
            title={`This spectator tile is owned by ${spectatorTile.player_name}`}
            disableFocusListener
            enterTouchDelay={0}
            placement="top">
            <Box
                width="90%"
                sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "4px",
                    border: "1px solid",
                    borderColor: "warning.main",
                    color: "warning.main",
                }}>
                <span style={{ transform: "translateY(-2px)" }}>
                    {spectatorTile.direction === 1 ? "»»»" : "«««"}
                </span>
            </Box>
        </Tooltip>
    );
};

interface TileProps {
    gameCode: string;
    websocketId: string;
    connectionType: ConnectionType;
    sendJsonMessage: SendJsonMessage;
    idx: number | "FINISH";
    tile: Tile;
    frogs: Frog[];
    unmovedFrogs: number[];
    hasPlayerPlacedSpectatorTile: boolean;
    isCurrentTurn: boolean;
    gameState: "lobby" | "game" | "ended";
}

const GameTile = ({
    gameCode,
    websocketId,
    connectionType,
    sendJsonMessage,
    idx,
    tile,
    frogs,
    unmovedFrogs,
    hasPlayerPlacedSpectatorTile,
    isCurrentTurn,
    gameState,
}: TileProps) => {
    return (
        <Grid
            container
            flexDirection="column"
            height="225px"
            width="75px"
            justifyContent="flex-end"
            flexShrink={0}
            wrap="nowrap"
            overflow="visible">
            <Grid
                container
                height="100%"
                width="100%"
                flexDirection="column-reverse"
                position="relative"
                alignItems="center"
                overflow="visible"
                wrap="nowrap"
                borderBottom={1}
                flexGrow={1}>
                {connectionType === "player" &&
                !hasPlayerPlacedSpectatorTile &&
                gameState === "game" &&
                tile.can_spectator_tile_be_placed &&
                typeof idx === "number" ? (
                    <PlaceSpectatorTile
                        gameCode={gameCode}
                        websocketId={websocketId}
                        sendJsonMessage={sendJsonMessage}
                        tileIdx={idx}
                        isCurrentTurn={isCurrentTurn}
                    />
                ) : tile.spectator_tile ? (
                    <SpectatorTile spectatorTile={tile.spectator_tile} />
                ) : (
                    <FrogStack
                        tile={tile}
                        frogs={frogs}
                        unmovedFrogs={unmovedFrogs}
                    />
                )}
            </Grid>
            <span>{idx}</span>
        </Grid>
    );
};

export default GameTile;
