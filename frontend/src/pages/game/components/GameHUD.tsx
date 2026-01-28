import { Box, Grid, Tab, Tabs, useMediaQuery, useTheme } from "@mui/material";
import GameUpdates from "./GameUpdates";
import PlayerInfo from "./PlayerInfo";
import type { GameState } from "../../../api/types";
import CustomTabPanel from "../../../components/CustomTabPanel";
import { useState } from "react";
import PeopleIcon from "@mui/icons-material/People";
import NotesIcon from "@mui/icons-material/Notes";

interface GameHUDProps {
    gameState: GameState;
    playerId: string | null;
}

const GameHUD = ({ gameState, playerId }: GameHUDProps) => {
    const theme = useTheme();
    const isDesktop = !useMediaQuery(theme.breakpoints.down("lg"));
    const [value, setValue] = useState(0);

    const handleChange = (_: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };
    return isDesktop ? (
        <>
            <Grid
                container
                wrap="nowrap"
                spacing={2}
                overflow="auto"
                flexGrow={1}>
                {gameState.player_order
                    .map((playerId) => gameState.players[playerId])
                    .map((player) => (
                        <PlayerInfo
                            key={player.connection.websocket_id}
                            player={player}
                            frogs={gameState.frogs}
                            isCurrentTurn={
                                player.player_id === gameState.current_turn
                            }
                            isPlayer={player.player_id === playerId}
                        />
                    ))}
            </Grid>
            <GameUpdates
                updates={gameState.updates}
                players={gameState.players}
                frogs={gameState.frogs}
                maxWidth={"450px"}
            />
        </>
    ) : (
        <Box
            sx={{
                flexGrow: 1,
                display: "flex",
                height: "100%",
            }}>
            <Tabs
                orientation="vertical"
                variant="scrollable"
                value={value}
                onChange={handleChange}
                aria-label="Vertical tabs example"
                sx={{ borderRight: 1, borderColor: "divider", minWidth: 60 }}>
                <Tab icon={<PeopleIcon />} sx={{ padding: 0, minWidth: 60 }} />
                <Tab icon={<NotesIcon />} sx={{ padding: 0, minWidth: 60 }} />
            </Tabs>
            <CustomTabPanel value={value} index={0} padding={1}>
                <Grid
                    container
                    wrap="nowrap"
                    spacing={2}
                    overflow="auto"
                    height="100%"
                    maxWidth="calc(100vw - 60px)">
                    {gameState.player_order
                        .map((playerId) => gameState.players[playerId])
                        .map((player) => (
                            <PlayerInfo
                                key={player.connection.websocket_id}
                                player={player}
                                frogs={gameState.frogs}
                                isCurrentTurn={
                                    player.player_id === gameState.current_turn
                                }
                                isPlayer={player.player_id === playerId}
                            />
                        ))}
                </Grid>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1} padding={1}>
                <GameUpdates
                    updates={gameState.updates}
                    players={gameState.players}
                    frogs={gameState.frogs}
                    width={"100%"}
                />
            </CustomTabPanel>
        </Box>
    );
};

export default GameHUD;
