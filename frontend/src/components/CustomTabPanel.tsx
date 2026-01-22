import { Box } from "@mui/material";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
    padding?: number;
    style?: React.CSSProperties;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, padding = 3, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}>
            {value === index && (
                <Box sx={{ p: padding, height: "100%" }}>{children}</Box>
            )}
        </div>
    );
}

export default CustomTabPanel;
