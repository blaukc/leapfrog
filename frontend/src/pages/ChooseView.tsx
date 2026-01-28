import { useState } from "react";
import { Box, Button, Grid, Tab, Tabs, TextField } from "@mui/material";
import CustomTabPanel from "../components/CustomTabPanel";
import { useNavigate, useParams } from "react-router";
import { createPlayer, createSpectator } from "../api/game";
import { CLIENT_ID_LOCAL_STORAGE_KEY } from "../common/constants";
import { toast } from "../api/utils";

const validateName = (name: string): boolean => {
    const nameRegex = /^[a-zA-Z0-9 !@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{1,15}$/;
    return nameRegex.test(name);
};

function ChooseView() {
    const [value, setValue] = useState(0);
    const [playerName, setPlayerName] = useState("");
    const params = useParams();
    const gameCode = params.gameCode!;
    const navigate = useNavigate();

    const handleChange = (_: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const handlePlayerNameChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        setPlayerName(event.target.value);
    };

    const handleCreatePlayer = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();
        if (playerName.length === 0) return;
        if (!validateName(playerName)) {
            toast(
                "Invalid name. Use 1-15 standard English keyboard characters.",
                "error",
            );
            return;
        }
        const res = await createPlayer(gameCode, playerName);
        if (res.success && res.websocket_id) {
            localStorage.setItem(CLIENT_ID_LOCAL_STORAGE_KEY, res.websocket_id);
            navigate(`/leapfrog/${gameCode}`);
        } else {
            navigate(`/leapfrog`);
        }
    };

    const handleCreateSpectator = async () => {
        const res = await createSpectator(gameCode);
        if (res.success && res.websocket_id) {
            localStorage.setItem(CLIENT_ID_LOCAL_STORAGE_KEY, res.websocket_id);
            navigate(`/leapfrog/${gameCode}`);
        } else {
            navigate(`/leapfrog`);
        }
    };

    return (
        <Grid
            container
            width="300px"
            flexDirection="column"
            height="100%"
            justifyContent="center">
            <Box
                sx={{
                    borderBottom: 1,
                    borderColor: "divider",
                    width: "100%",
                }}>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    variant="fullWidth"
                    centered>
                    <Tab label="Play" />
                    <Tab label="Spectate" />
                </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
                <Grid
                    container
                    direction="column"
                    spacing={2}
                    alignItems="center"
                    justifyContent="center"
                    component="form"
                    onSubmit={handleCreatePlayer}>
                    <TextField
                        label="Name"
                        variant="outlined"
                        style={{ width: "100%" }}
                        value={playerName}
                        onChange={handlePlayerNameChange}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        style={{ width: "100%" }}
                        type="submit"
                        disabled={playerName.length === 0}>
                        Join as Player
                    </Button>
                </Grid>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
                <Grid
                    container
                    direction="column"
                    spacing={2}
                    alignItems="center"
                    justifyContent="center">
                    <Button
                        variant="contained"
                        color="primary"
                        style={{ width: "100%" }}
                        onClick={handleCreateSpectator}>
                        Join as Spectator
                    </Button>
                </Grid>
            </CustomTabPanel>
        </Grid>
    );
}

export default ChooseView;
