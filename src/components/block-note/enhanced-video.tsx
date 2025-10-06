import React from "react";
import { sanitizeIframeHtml } from "@/lib/sanitize-iframe";

export interface VideoBlockProps {
    content?: string;
    platform?: "upload" | "iframe";
    width?: string;
    height?: string;
    cover?: string;
    title?: string;
    alignment?: "left" | "center" | "right";
}

export interface EnhancedVideoBlockData {
    id: string;
    type: "enhancedVideo";
    props: VideoBlockProps;
}

interface EnhancedVideoProps {
    data: EnhancedVideoBlockData;
    className?: string;
    controls?: React.ReactNode;
}

export const EnhancedVideo: React.FC<EnhancedVideoProps> = ({
    data,
    className = "",
    controls = null,
}) => {
    const { props } = data;

    if (!props?.content) return null;
    const { width = "560px", height = "315px" } = props;
    let _width = width;
    let _height = height;
    if (!(width.endsWith("px") && width.endsWith("vw"))) {
        _width = `${width}px`;
        if (_width == "0px") {
            _width = "100vw";
        }
    }
    if (!(height.endsWith("px") && height.endsWith("vh"))) {
        _height = `${height}px`;
    }
    const captionText = props.title?.trim();

    const isIframeContent = props.content.includes("<iframe");

    return (
        <figure className={`w-full ${className || ""}`}>
            <div
                className={`flex w-full ${
                    props.alignment === "left"
                        ? "justify-start"
                        : props.alignment === "right"
                          ? "justify-end"
                          : "justify-center"
                }`}
            >
                <div className="relative overflow-hidden rounded-lg bg-white shadow-sm transition-shadow duration-200 hover:shadow-md dark:bg-gray-900">
                    <div className="relative">
                        {isIframeContent ? (
                            <div
                                style={{
                                    width: _width,
                                    height: _height,
                                    overflow: "hidden",
                                    lineHeight: 0,
                                }}
                                dangerouslySetInnerHTML={{
                                    __html: sanitizeIframeHtml(props.content),
                                }}
                            />
                        ) : (
                            <video
                                src={props.content}
                                controls
                                className="w-full"
                                style={{
                                    height: "auto",
                                    maxHeight: "600px",
                                }}
                                preload="metadata"
                            >
                                Your browser does not support the video element.
                            </video>
                        )}
                    </div>
                    {controls && (
                        <div className="absolute top-1 right-1 z-50">
                            {controls}
                        </div>
                    )}
                    {captionText && (
                        <figcaption className="border-t border-gray-100 bg-gray-50 px-4 py-3 text-center text-sm leading-relaxed font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            {captionText}
                        </figcaption>
                    )}
                </div>
            </div>
        </figure>
    );
};

export default EnhancedVideo;
