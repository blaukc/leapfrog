import "./App.css";
import { useState } from "react";

import {
    Box,
    Grid,
    Button,
    TextField,
    Tabs,
    Tab,
    Typography,
} from "@mui/material";
import { hostGame, joinGame } from "../api/game";
import { useNavigate } from "react-router";
import CustomTabPanel from "../components/CustomTabPanel";
import FrogSprite from "./game/components/FrogSprite";
import { CLIENT_ID_LOCAL_STORAGE_KEY } from "../common/constants";

function App() {
    const [value, setValue] = useState(0);
    const [pin, setPin] = useState("");
    const navigate = useNavigate();

    const handleChange = (_: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const handlePinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPin(event.target.value);
    };

    const handleJoinGame = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const clientId = localStorage.getItem(CLIENT_ID_LOCAL_STORAGE_KEY);
        if (pin.length === 0) return;
        const res = await joinGame(pin, clientId);
        if (res.success) {
            if (res.is_existing_player) {
                navigate(`/leapfrog/${pin}`);
            } else {
                navigate(`/leapfrog/${pin}/choose-view`);
            }
        }
    };

    const handleHostGame = async () => {
        const res = await hostGame();
        if (res.success) {
            navigate(`/leapfrog/${res.game_code}/choose-view`);
        }
    };
    return (
        <>
            <Grid
                container
                width="300px"
                flexDirection="column"
                height="100%"
                justifyContent="center"
                alignItems="center">
                <Typography variant="h4" style={{ margin: "10px" }}>
                    leapfrog
                </Typography>
                <FrogSprite
                    frog={{
                        idx: 0,
                        name: "",
                        color: "#4CAF50",
                        is_forward_frog: true,
                        start_pos: 0,
                        moves: [],
                    }}
                />
                <Box
                    sx={{
                        borderBottom: 1,
                        borderColor: "divider",
                        width: "100%",
                        marginTop: "10px",
                    }}>
                    <Tabs
                        value={value}
                        onChange={handleChange}
                        variant="fullWidth"
                        centered>
                        <Tab label="Join" />
                        <Tab label="Host" />
                    </Tabs>
                </Box>
                <CustomTabPanel
                    value={value}
                    index={0}
                    style={{ width: "100%" }}>
                    <Grid
                        container
                        direction="column"
                        spacing={2}
                        alignItems="center"
                        justifyContent="center"
                        component="form"
                        onSubmit={handleJoinGame}
                        width="100%">
                        <TextField
                            label="Game PIN"
                            variant="outlined"
                            style={{ width: "100%" }}
                            value={pin}
                            onChange={handlePinChange}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            style={{ width: "100%" }}
                            type="submit"
                            disabled={pin.length === 0}>
                            Enter
                        </Button>
                    </Grid>
                </CustomTabPanel>
                <CustomTabPanel
                    value={value}
                    index={1}
                    style={{ width: "100%" }}>
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
                            onClick={handleHostGame}>
                            Host Game
                        </Button>
                    </Grid>
                </CustomTabPanel>
            </Grid>
        </>
    );
}

export default App;
