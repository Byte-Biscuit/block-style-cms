"use client";

import { Download as DownloadIcon } from "@mui/icons-material";
import { CircularProgress, IconButton, Tooltip } from "@mui/material";
import type React from "react";
import { useState } from "react";
import { getExportMark } from "@/app/actions/settings/export-mark";
import { downloadBlob, svgMarkupToPngBlob } from "@/lib/svg-export";

type SvgExportButtonProps = {
    svgMarkup: string;
    filename: string;
    fallbackRoot?: React.RefObject<HTMLElement | null>;
    label: string;
    errorLabel: string;
};

const SvgExportButton: React.FC<SvgExportButtonProps> = ({
    svgMarkup,
    filename,
    fallbackRoot,
    label,
    errorLabel,
}) => {
    const [busy, setBusy] = useState(false);
    const [failed, setFailed] = useState(false);

    const handleClick = async (event: React.MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();
        if (busy || !svgMarkup) return;
        setBusy(true);
        setFailed(false);
        try {
            const el = fallbackRoot?.current?.querySelector("svg");
            const fallbackSvg = el instanceof SVGSVGElement ? el : null;
            const exportMark = await getExportMark();
            const blob = await svgMarkupToPngBlob(
                svgMarkup,
                fallbackSvg,
                exportMark
            );
            downloadBlob(blob, filename);
        } catch (err) {
            console.error("SVG export failed:", err);
            setFailed(true);
        } finally {
            setBusy(false);
        }
    };

    return (
        <Tooltip title={failed ? errorLabel : label}>
            <span>
                <IconButton
                    size="small"
                    aria-label={failed ? errorLabel : label}
                    onClick={handleClick}
                    disabled={busy}
                >
                    {busy ? (
                        <CircularProgress size={16} />
                    ) : (
                        <DownloadIcon fontSize="small" />
                    )}
                </IconButton>
            </span>
        </Tooltip>
    );
};

export default SvgExportButton;
