import { Search } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";

const SearchIconButton = () => {
    return (
        <Tooltip title="Search">
            <IconButton
                color="inherit"
                className="text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
                <Search />
            </IconButton>
        </Tooltip>
    );
};

export default SearchIconButton;
