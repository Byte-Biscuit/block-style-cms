import { GitHub } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { button } from "@/lib/classes";

const GitHubIconButton = () => {
    return (
        <Tooltip title="GitHub">
            <IconButton color="inherit" className={button.icon}>
                <GitHub />
            </IconButton>
        </Tooltip>
    );
};

export default GitHubIconButton;
