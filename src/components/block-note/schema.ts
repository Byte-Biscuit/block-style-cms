import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import {
    EnhancedAudioBlockSpec, ENHANCED_AUDIO_BLOCK_TYPE,
    EnhancedFileBlockSpec, ENHANCED_FILE_BLOCK_TYPE,
    EnhancedVideoBlockSpec, ENHANCED_VIDEO_BLOCK_TYPE,
    EnhancedImageBlockSpec, ENHANCED_IMAGE_BLOCK_TYPE,
    MermaidBlockSpec, MERMAID_BLOCK_TYPE
} from "@/block-note/block";

// Exclude the default media blocks and use custom enhanced versions instead
const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    image: _defaultImage,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    audio: _defaultAudio,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    file: _defaultFile,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    video: _defaultVideo,
    ...restDefaultBlockSpecs
} = defaultBlockSpecs;

export const schema = BlockNoteSchema.create({
    blockSpecs: {
        ...restDefaultBlockSpecs,
        // Local custom block specs
        [ENHANCED_AUDIO_BLOCK_TYPE]: EnhancedAudioBlockSpec,
        [ENHANCED_FILE_BLOCK_TYPE]: EnhancedFileBlockSpec,
        [ENHANCED_VIDEO_BLOCK_TYPE]: EnhancedVideoBlockSpec,
        [ENHANCED_IMAGE_BLOCK_TYPE]: EnhancedImageBlockSpec,
        [MERMAID_BLOCK_TYPE]: MermaidBlockSpec,
    },
});

export type LocalBlock = typeof schema.Block;

