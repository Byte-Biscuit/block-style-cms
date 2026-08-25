"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import React from "react";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

export default function EmbedVideoPage() {
    const { filename } = useParams<{ filename: string }>();
    const videoUrl = `/videos/${filename}`;

    return (
        <ReactPlayer
            src={videoUrl}
            controls
            style={{
                width: "100%",
                height: "100%",
                borderRadius: 0,
                position: "absolute",
                inset: 0,
            }}
        />
    );
}
