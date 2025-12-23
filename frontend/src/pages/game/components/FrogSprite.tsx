import { Box, Grid } from "@mui/material";
import type { Frog } from "../../../api/types";

interface FrogSpriteProps {
    frog: Frog;
    showName?: boolean;
}

const FrogSprite = ({ frog, showName = true }: FrogSpriteProps) => {
    return (
        <Grid height="32px" width="32px" overflow="visible">
            <div
                className="frog eyes"
                style={{
                    transform: frog.is_forward_frog
                        ? "scaleX(-1)"
                        : "scaleX(1)",
                }}></div>
            <div
                className="frog body-mask"
                style={{
                    backgroundColor: frog.color,
                    transform: frog.is_forward_frog
                        ? "scaleX(-1)"
                        : "scaleX(1)",
                }}></div>
            {/* <Box
                height="32px"
                width="32px"
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
            </Box> */}
        </Grid>
    );
};

export default FrogSprite;
