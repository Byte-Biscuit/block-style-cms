import React from "react";
import Image from "next/image";

export interface ImageBlockProps {
    src?: string;
    alt?: string;
    caption?: string;
    width?: string;
    height?: string;
    source?: "upload" | "url" | "pexels";
    alignment?: "left" | "center" | "right";
    objectFit?: "contain" | "cover" | "fill" | "scale-down" | "none";
    maxWidth?: string;
}

export interface EnhancedImageBlockData {
    id: string;
    type: "enhancedImage";
    props: ImageBlockProps;
}

interface EnhancedImageProps {
    data: EnhancedImageBlockData;
    className?: string;
    controls?: React.ReactNode;
}

export const EnhancedImage: React.FC<EnhancedImageProps> = ({
    data,
    className = "",
    controls = null,
}) => {
    const { props } = data;

    if (!props?.src) return null;

    const width = props.width ? parseInt(props.width, 10) : 800;
    const height = props.height ? parseInt(props.height, 10) : 600;

    const captionText = props.caption?.trim();
    const altText = props.alt?.trim() || captionText || "Article image";

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
                <div
                    className="relative overflow-hidden rounded-lg bg-white shadow-sm transition-shadow duration-200 hover:shadow-md dark:bg-gray-900"
                    style={{
                        ...(width > 0 && { maxWidth: `${width}px` }),
                        width: "100%",
                    }}
                >
                    <div className="relative">
                        <Image
                            src={props.src}
                            alt={altText}
                            width={width}
                            height={height}
                            style={{
                                width: "100%",
                                height: "auto",
                                maxHeight: "600px",
                                maxWidth: "100%",
                                objectFit:
                                    (props.objectFit as React.CSSProperties["objectFit"]) ||
                                    "contain",
                            }}
                            priority={false}
                            placeholder="empty"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                        />
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

export default EnhancedImage;
