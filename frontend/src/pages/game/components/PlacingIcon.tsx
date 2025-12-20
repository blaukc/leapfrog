import { Avatar } from "@mui/material";

interface PlacingIconProps {
    placing: "first" | "second" | "third";
}

const PlacingIcon = ({ placing }: PlacingIconProps) => {
    const text = placing === "first" ? "1" : placing === "second" ? "2" : "3+";
    const color =
        placing === "first"
            ? "#FFD700"
            : placing === "second"
            ? "#C0C0C0"
            : "#CD7F32";
    return (
        <Avatar
            sx={{
                width: 18,
                height: 18,
                fontSize: 14,
                bgcolor: color,
            }}>
            {text}
        </Avatar>
    );
};

export default PlacingIcon;
