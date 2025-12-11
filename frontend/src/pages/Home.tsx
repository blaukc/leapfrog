import "./App.css";
import { useState } from "react";

import { Box, Grid, Button, TextField, Tabs, Tab } from "@mui/material";
import { hostGame, joinGame } from "../api/game";
import { useNavigate } from "react-router";
import CustomTabPanel from "../components/CustomTabPanel";

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
        if (pin.length === 0) return;
        const res = await joinGame(pin);
        if (res.success) {
            navigate(`/leapfrog/${pin}/choose-view`);
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
            <Box style={{ width: "300px", margin: "auto" }}>
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
                        <Tab label="Join" />
                        <Tab label="Host" />
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
                        onSubmit={handleJoinGame}>
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
                            onClick={handleHostGame}>
                            Host Game
                        </Button>
                    </Grid>
                </CustomTabPanel>
            </Box>
        </>
    );
}

export default App;
