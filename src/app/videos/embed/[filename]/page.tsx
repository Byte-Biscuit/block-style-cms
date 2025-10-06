"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { VIDEO_BASE_URL } from "@/config";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

export default function EmbedVideoPage() {
    const { filename } = useParams<{ filename: string }>();
    const videoUrl = `${VIDEO_BASE_URL}/${filename}`;

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
