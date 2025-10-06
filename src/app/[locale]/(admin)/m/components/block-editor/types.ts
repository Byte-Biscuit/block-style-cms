
import {
    type Block,
    type PartialBlock,
    type BlockSchemaFromSpecs,
    defaultBlockSpecs,
} from "@blocknote/core";
import {
    EnhancedImageBlockSpec,
    ENHANCED_IMAGE_BLOCK_TYPE,
} from "@/blockn/enhanced-image-block";
import {
    EnhancedVideoBlockSpec,
    ENHANCED_VIDEO_BLOCK_TYPE,
} from "@/blockn/enhanced-video-block";
import {
    EnhancedAudioBlockSpec,
    ENHANCED_AUDIO_BLOCK_TYPE,
} from "@/blockn/enhanced-audio-block";
import {
    EnhancedFileBlockSpec,
    ENHANCED_FILE_BLOCK_TYPE,
} from "@/blockn/enhanced-file-block";
import {
    MermaidBlockSpec,
    MERMAID_BLOCK_TYPE,
} from "@/blockn/mermaid-block";

type BlockSpecs = typeof defaultBlockSpecs & {
    [ENHANCED_IMAGE_BLOCK_TYPE]: typeof EnhancedImageBlockSpec;
    [ENHANCED_VIDEO_BLOCK_TYPE]: typeof EnhancedVideoBlockSpec,
    [ENHANCED_AUDIO_BLOCK_TYPE]: typeof EnhancedAudioBlockSpec,
    [ENHANCED_FILE_BLOCK_TYPE]: typeof EnhancedFileBlockSpec,
    [MERMAID_BLOCK_TYPE]: typeof MermaidBlockSpec,
}
export type EnhancedBlock = Block<BlockSchemaFromSpecs<BlockSpecs>>;
export type EnhancedPartialBlock = PartialBlock<BlockSchemaFromSpecs<BlockSpecs>>;