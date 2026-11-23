type MediumIconProps = {
    size?: number | string;
    className?: string;
};

/** Medium three-ellipse logo (shared by contact / menu / export). */
export default function MediumIcon({
    size = "1em",
    className = "",
}: MediumIconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1044 593"
            width={size}
            height={size}
            fill="currentColor"
            aria-hidden="true"
            className={className}
        >
            <ellipse cx="294.5" cy="296.5" rx="294.5" ry="296.5" />
            <ellipse cx="764.5" cy="296.5" rx="147.5" ry="279" />
            <ellipse cx="992" cy="296.5" rx="52" ry="250" />
        </svg>
    );
}
