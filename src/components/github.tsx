import { GitHub } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { button } from "@/lib/classes";
import Link from "@/components/link";

const GitHubIconButton = () => {
    return (
        <Tooltip title="GitHub">
            <Link href="https://github.com/Byte-Biscuit/block-style-cms">
                <IconButton color="inherit" className={button.icon}>
                    <GitHub />
                </IconButton>
            </Link>
        </Tooltip>
    );
};

export default GitHubIconButton;
