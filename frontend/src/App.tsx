import "./App.css";
import { useState } from "react";

import { Box, Grid, Button, TextField, Tabs, Tab } from "@mui/material";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

function App() {
    const [value, setValue] = useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
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
                        justifyContent="center">
                        <TextField
                            label="Game PIN"
                            variant="outlined"
                            style={{ width: "100%" }}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            style={{ width: "100%" }}>
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
                            style={{ width: "100%" }}>
                            Host Game
                        </Button>
                    </Grid>
                </CustomTabPanel>
            </Box>
        </>
    );
}

export default App;
