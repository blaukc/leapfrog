import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import { SnackbarProvider } from "notistack";

const theme = createTheme({
    colorSchemes: {
        dark: true,
    },
});

createRoot(document.getElementById("root")!).render(
    <SnackbarProvider>
        <ThemeProvider theme={theme}>
            <StrictMode>
                <App />
            </StrictMode>
        </ThemeProvider>
    </SnackbarProvider>
);
