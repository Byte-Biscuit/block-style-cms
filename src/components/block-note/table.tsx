import React from "react";
import { twColorMap, BlockData, TextContent, LinkContent } from "./meta";
import Content from "./item/content";

// Define table-specific types
export interface TableCell {
    type: "tableCell";
    content: (TextContent | LinkContent)[];
    props: {
        colspan: number;
        rowspan: number;
        backgroundColor: keyof typeof twColorMap | "default";
        textColor: keyof typeof twColorMap | "default";
        textAlignment: "left" | "center" | "right";
    };
}

export interface TableRow {
    cells: TableCell[];
}

export interface TableContent {
    type: "tableContent";
    columnWidths: (number | null)[];
    rows: TableRow[];
}
export interface TableBlockProps {
    textColor?: keyof typeof twColorMap | "default";
}

export interface TableBlockData {
    id: string;
    type: "table";
    props?: TableBlockProps;
    content?: TableContent;
    children?: BlockData[];
}

// TableCell component
const TableCell: React.FC<{
    cell: TableCell;
    isHeader?: boolean;
}> = ({ cell, isHeader = false }) => {
    const { content, props } = cell;

    const cellClasses = [
        // Use border lines between rows/cols similar to MUI table
        "border-b border-gray-200 dark:border-gray-700",
        // spacing similar to MUI basic table
        "px-6 py-4",
        // base text size/color
        "text-sm",
        // alignment from cell props
        props?.textAlignment === "center"
            ? "text-center"
            : props?.textAlignment === "right"
              ? "text-right"
              : "text-left",
        // background / text color overrides from data
        props?.backgroundColor !== "default" &&
            props?.backgroundColor &&
            twColorMap[props.backgroundColor]?.bgClass,
        props?.textColor !== "default" &&
            props?.textColor &&
            twColorMap[props.textColor]?.textClass,
        // header specific styles
        isHeader &&
            "bg-gray-50 dark:bg-gray-900 font-medium text-gray-900 dark:text-gray-100",
        !isHeader && "text-gray-700 dark:text-gray-200",
    ].filter(Boolean);

    if (isHeader) {
        return (
            <th
                scope="col"
                className={cellClasses
                    .concat([
                        "bg-gray-50 font-semibold text-gray-900 dark:bg-gray-900 dark:text-gray-100",
                    ])
                    .filter(Boolean)
                    .join(" ")}
                colSpan={props.colspan > 1 ? props.colspan : undefined}
                rowSpan={props.rowspan > 1 ? props.rowspan : undefined}
            >
                {content && content.length > 0 ? (
                    <Content items={content} />
                ) : (
                    <span className="text-gray-400 dark:text-gray-500">
                        &nbsp;
                    </span>
                )}
            </th>
        );
    }

    return (
        <td
            className={cellClasses
                .concat(["text-gray-700 dark:text-gray-200"])
                .join(" ")}
            colSpan={props.colspan > 1 ? props.colspan : undefined}
            rowSpan={props.rowspan > 1 ? props.rowspan : undefined}
        >
            {content && content.length > 0 ? (
                <Content items={content} />
            ) : (
                <span className="text-gray-400 dark:text-gray-500">&nbsp;</span>
            )}
        </td>
    );
};

// Table component
export const Table: React.FC<{
    data: TableBlockData;
    className?: string;
}> = ({ data, className }) => {
    const { props, content } = data;
    if (!content) return null;
    const { columnWidths, rows } = content;
    // Table classes (use table-fixed so <colgroup> widths are respected)
    const tableClasses = [
        "min-w-full",
        "table-fixed",
        "border-collapse",
        // we rely on outer wrapper for card background / border / shadow
        props?.textColor !== "default" &&
            props?.textColor &&
            twColorMap[props.textColor]?.textClass,
        className,
    ].filter(Boolean);

    // Generate column styles if widths are specified
    const hasAnySpecified = columnWidths.some((w) => w !== null);
    const hasAnyNull = columnWidths.some((w) => w === null);

    const colElements = (() => {
        if (!hasAnySpecified) {
            // no explicit widths at all — leave to browser (even distribution)
            return columnWidths.map((_, index) => <col key={index} />);
        }

        if (hasAnyNull) {
            // Mixed: some specified, some null -> apply px for specified, leave others unstyled
            return columnWidths.map((width, index) =>
                width !== null ? (
                    <col key={index} style={{ width: `${width}px` }} />
                ) : (
                    <col key={index} />
                )
            );
        }

        // All specified -> percentage mode
        const total = columnWidths.reduce<number>(
            (sum, w) => sum + (w ?? 0),
            0
        );
        // compute raw percentages
        const raw = columnWidths.map((w) => ((w ?? 0) / total) * 100);
        // round to 2 decimals
        const rounded = raw.map((p) => Math.round(p * 100) / 100);
        // fix rounding error by adjusting last column
        const sumRounded = rounded.reduce((s, v) => s + v, 0);
        if (rounded.length > 0) {
            rounded[rounded.length - 1] = Number(
                (rounded[rounded.length - 1] + (100 - sumRounded)).toFixed(2)
            );
        }
        return rounded.map((p, index) => (
            <col key={index} style={{ width: `${p}%` }} />
        ));
    })();

    return (
        // Outer card to mimic MUI Paper: rounded, border, subtle shadow, supports dark mode
        <div className="my-4">
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="overflow-x-auto">
                    <table className={tableClasses.join(" ")}>
                        {columnWidths.some((width) => width !== null) && (
                            <colgroup>{colElements}</colgroup>
                        )}
                        <thead>
                            {rows.length > 0 && (
                                <tr>
                                    {rows[0].cells.map((cell, cellIndex) => (
                                        <TableCell
                                            key={cellIndex}
                                            cell={cell}
                                            isHeader={true}
                                        />
                                    ))}
                                </tr>
                            )}
                        </thead>
                        <tbody>
                            {rows.slice(1).map((row, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50"
                                >
                                    {row.cells.map((cell, cellIndex) => (
                                        <TableCell
                                            key={cellIndex}
                                            cell={cell}
                                            isHeader={false}
                                        />
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Table;
