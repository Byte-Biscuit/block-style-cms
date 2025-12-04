import React from "react";
import {
    type DefaultStyleSchema,
    type DefaultInlineContentSchema,
    type TableCell,
    type InlineContent,
    type TableCellProps,
} from "@blocknote/core";
import {type LocalBlock as Block } from "@/block-note/schema";
import { getBlockClasses } from "@/lib/style-classes";
import Content from "./item/content";

export type TableBlock = Extract<Block, { type: "table" }>;
export type TableContent = TableBlock["content"];
export type TableRow = TableBlock["content"]["rows"][number];

// Cell can be either InlineContent[] or TableCell
type CellData =
    | InlineContent<DefaultInlineContentSchema, DefaultStyleSchema>[]
    | TableCell<DefaultInlineContentSchema, DefaultStyleSchema>;

// Type guard: check if cell is a TableCell object
const isTableCell = (
    cell: CellData
): cell is TableCell<DefaultInlineContentSchema, DefaultStyleSchema> => {
    return (
        typeof cell === "object" &&
        cell !== null &&
        !Array.isArray(cell) &&
        "type" in cell &&
        cell.type === "tableCell"
    );
};

// TableCell component
const TableCellRender: React.FC<{
    cell: TableCell<DefaultInlineContentSchema, DefaultStyleSchema> | InlineContent<DefaultInlineContentSchema, DefaultStyleSchema>[];
    isHeader?: boolean;
}> = ({ cell, isHeader = false }) => {
    // Parse cell data: can be either a TableCell object or InlineContent[] array
    let content: InlineContent<
        DefaultInlineContentSchema,
        DefaultStyleSchema
    >[] = [];
    let props: Partial<TableCellProps> = {};

    if (isTableCell(cell)) {
        content = cell.content ?? [];
        props = cell.props ?? {};
    } else {
        content = cell;
    }
    const {
        colspan = 1,
        rowspan = 1,
    } = props as TableCellProps;
    let updateProps=props;
    if ((colspan > 1||rowspan>1) && props.textAlignment) {
        updateProps={...props, textAlignment: "center"};
    }
    const classes=getBlockClasses(updateProps,
        "px-2 py-2 text-sm",
        "border-b border-r border-gray-200 dark:border-gray-700",
        isHeader ? "py-3 font-semibold text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-gray-100" : "text-gray-700 dark:text-gray-200",
    );

    if (isHeader) {
        return (
            <th
                scope="col"
                className={classes}
                colSpan={colspan > 1 ? colspan : undefined}
                rowSpan={rowspan > 1 ? rowspan : undefined}
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
            className={classes}
                colSpan={colspan > 1 ? colspan : undefined}
                rowSpan={rowspan > 1 ? rowspan : undefined}
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
export const TableRender: React.FC<{
    block: TableBlock;
    className?: string;
}> = ({ block, className }) => {
    const { props, content } = block;
    if (!content) return null;
    const { columnWidths, rows } = content;
    const classes=getBlockClasses(props,"min-w-full","table-fixed","border-collapse",className)

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
            <div className="overflow-hidden rounded-lg border-t border-l border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="overflow-x-auto">
                    <table className={classes}>
                        {columnWidths.some((width) => width !== null) && (
                            <colgroup>{colElements}</colgroup>
                        )}
                        <thead>
                            {rows.length > 0 && (
                                <tr>
                                    {rows[0].cells.map((cell, cellIndex) => (
                                        <TableCellRender
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
                                        <TableCellRender
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

export default TableRender;
