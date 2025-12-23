import { Grid } from "@mui/material";
import type { Frog, Tile } from "../../../api/types";
import FrogSprite from "./FrogSprite";

interface TileProps {
    idx: number | "FINISH";
    tile: Tile;
    frogs: Frog[];
    unmovedFrogs: number[];
}

const GameTile = ({ idx, tile, frogs, unmovedFrogs }: TileProps) => {
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
                {tile.frogs.map((frogIdx, pos) => {
                    const frog = frogs[frogIdx];
                    return (
                        <FrogSprite
                            frog={frog}
                            zIndex={tile.frogs.length - pos}
                            marginBottom={pos === 0 ? -10 : -40}
                            isSleeping={!unmovedFrogs.includes(frog.idx)}
                        />
                    );
                })}
            </Grid>
            <span>{idx}</span>
        </Grid>
    );
};

export default GameTile;
