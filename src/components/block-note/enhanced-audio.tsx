import React from "react";

export interface AudioBlockProps {
    content?: string;
    platform?: "upload" | "url";
    title?: string;
    artist?: string;
    alignment?: "left" | "center" | "right";
}

export interface EnhancedAudioBlockData {
    id: string;
    type: "enhancedAudio";
    props: AudioBlockProps;
}

interface EnhancedAudioProps {
    data: EnhancedAudioBlockData;
    className?: string;
    controls?: React.ReactNode;
}

export const EnhancedAudio: React.FC<EnhancedAudioProps> = ({
    data,
    className = "",
    controls = null,
}) => {
    const { props } = data;

    if (!props?.content) return null;

    let captionText = props.title?.trim();
    const artist = props.artist?.trim();
    if (captionText && artist) {
        captionText = `${captionText} - ${artist}`;
    }

    return (
        <figure className={`w-full ${className || ""}`}>
            {controls && (
                <div className="absolute -top-3 right-5 z-50">{controls}</div>
            )}
            <audio src={props.content} controls className="w-full rounded-lg" />
            {captionText && (
                <figcaption className="py-0.3 text-center text-sm leading-relaxed font-medium text-gray-600 dark:text-gray-300">
                    {captionText}
                </figcaption>
            )}
        </figure>
    );
};

export default EnhancedAudio;
