import { Box, Grid } from "@mui/material";
import type { Frog } from "../../../api/types";
import { useState } from "react";

interface FrogSpriteProps {
    frog: Frog;
    showName?: boolean;
    isSleeping?: boolean;
    zIndex?: number;
    marginBottom?: number;
}

const FrogSprite = ({
    frog,
    showName = true,
    isSleeping = false,
    zIndex = 1,
    marginBottom = -10,
}: FrogSpriteProps) => {
    const [isVisible, setIsVisible] = useState<boolean>(false);

    return (
        <Grid
            height="64px"
            width="64px"
            overflow="visible"
            position="relative"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            style={{ marginBottom: marginBottom, zIndex }}
            flexShrink={0}>
            <div
                className={`frog eyes${isSleeping ? "-sleeping" : ""}`}
                style={{
                    transform: frog.is_forward_frog
                        ? "scaleX(-1)"
                        : "scaleX(1)",
                }}></div>
            <div
                className={`frog body-mask${isSleeping ? "-sleeping" : ""}`}
                style={{
                    backgroundColor: frog.color,
                    transform: frog.is_forward_frog
                        ? "scaleX(-1)"
                        : "scaleX(1)",
                }}></div>
            <Box
                height="64px"
                width="64px"
                position="relative"
                // bgcolor={`${frog.color}`}
                overflow="visible">
                {showName && isVisible && (
                    <span
                        style={{
                            fontSize: "12px",
                            position: "absolute",
                            left: "50%",
                            top: "20px",
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
