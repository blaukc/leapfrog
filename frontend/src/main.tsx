import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Home from "./pages/Home.tsx";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import { SnackbarProvider } from "notistack";
import { BrowserRouter, Route, Routes } from "react-router";
import Game from "./pages/game";
import ChooseView from "./pages/ChooseView.tsx";

const theme = createTheme({
    colorSchemes: {
        dark: true,
    },
});

createRoot(document.getElementById("root")!).render(
    <SnackbarProvider>
        <ThemeProvider theme={theme}>
            <StrictMode>
                <BrowserRouter>
                    <Routes>
                        <Route path="/leapfrog">
                            <Route index element={<Home />} />
                            <Route path=":gameCode" element={<Game />} />
                            <Route
                                path=":gameCode/choose-view"
                                element={<ChooseView />}
                            />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </StrictMode>
        </ThemeProvider>
    </SnackbarProvider>
);
