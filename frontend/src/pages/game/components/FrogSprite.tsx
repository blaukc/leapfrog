import { Box, Grid } from "@mui/material";
import type { Frog } from "../../../api/types";

interface FrogSpriteProps {
    frog: Frog;
    showName?: boolean;
}

const FrogSprite = ({ frog, showName = true }: FrogSpriteProps) => {
    return (
        <Grid height="25px" width="25px" overflow="visible">
            <Box
                height="25px"
                width="25px"
                position="relative"
                bgcolor={`${frog.color}`}
                overflow="visible">
                {showName && (
                    <span
                        style={{
                            fontSize: "12px",
                            position: "absolute",
                            left: "50%",
                            top: "-5px",
                            transform: "translateX(-50%)",
                            whiteSpace: "nowrap",
                            zIndex: 1,
                        }}>
                        {frog.name}
                    </span>
                )}
            </Box>
        </Grid>
    );
};

export default FrogSprite;
