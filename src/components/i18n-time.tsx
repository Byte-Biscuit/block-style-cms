import { formatDateI18n } from "@/i18n/util";
import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";

interface Props {
    date: Date;
    locale: string;
    className?: string;
}

const I18NLocaleTime: React.FC<Props> = ({
    date,
    locale,
    className = "text-sm font-medium",
}) => {
    return (
        <time
            dateTime={date.toString()}
            className={`inline-flex items-center gap-1 text-gray-500 dark:text-gray-400 ${className}`}
        >
            <TodayOutlinedIcon fontSize="small" />
            {formatDateI18n(date, locale)}
        </time>
    );
};

export default I18NLocaleTime;
