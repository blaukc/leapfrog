import { Box, Grid } from "@mui/material";
import type { Frog, Tile } from "../../../api/types";
import FrogSprite from "./FrogSprite";

interface TileProps {
    idx: number;
    tile: Tile;
    frogs: Frog[];
}

const GameTile = ({ idx, tile, frogs }: TileProps) => {
    return (
        <Grid
            container
            flexDirection="column"
            height="150px"
            width="75px"
            justifyContent="flex-end"
            flexShrink={0}>
            <Box height="75px" width="75px" borderBottom={1} overflow="visible">
                <Grid
                    container
                    height="100%"
                    width="100%"
                    flexDirection="column-reverse"
                    position="relative"
                    alignItems="center"
                    overflow="visible"
                    wrap="nowrap">
                    {tile.frogs.map((frogIdx) => {
                        const frog = frogs[frogIdx];
                        return <FrogSprite frog={frog} />;
                    })}
                </Grid>
            </Box>
            <span>{idx}</span>
        </Grid>
    );
};

export default GameTile;
