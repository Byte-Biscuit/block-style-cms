import {
    BlockNoteSchema,
    createCodeBlockSpec,
    defaultBlockSpecs,
} from "@blocknote/core";
import {
    ENHANCED_AUDIO_BLOCK_TYPE,
    ENHANCED_FILE_BLOCK_TYPE,
    ENHANCED_IMAGE_BLOCK_TYPE,
    ENHANCED_VIDEO_BLOCK_TYPE,
    EnhancedAudioBlockSpec,
    EnhancedFileBlockSpec,
    EnhancedImageBlockSpec,
    EnhancedVideoBlockSpec,
    MERMAID_BLOCK_TYPE,
    MermaidBlockSpec,
    SVG_BLOCK_TYPE,
    SvgBlockSpec,
} from "@/block-note/block";
import { CODE_BLOCK_SUPPORTED_LANGUAGES } from "@/block-note/code-block-languages";
import { syntaxHighlighter } from "@/block-note/syntax-highlighter";

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

export const extensions = [syntaxHighlighter];

export const schema = BlockNoteSchema.create({
    blockSpecs: {
        ...restDefaultBlockSpecs,
        codeBlock: createCodeBlockSpec({
            indentLineWithTab: true,
            // Keep current behavior: when no language is set, render as plain
            // text (no syntax highlighting from Prism/React).
            defaultLanguage: "text",
            supportedLanguages: CODE_BLOCK_SUPPORTED_LANGUAGES,
        }),
        // Local custom block specs
        [ENHANCED_AUDIO_BLOCK_TYPE]: EnhancedAudioBlockSpec,
        [ENHANCED_FILE_BLOCK_TYPE]: EnhancedFileBlockSpec,
        [ENHANCED_VIDEO_BLOCK_TYPE]: EnhancedVideoBlockSpec,
        [ENHANCED_IMAGE_BLOCK_TYPE]: EnhancedImageBlockSpec,
        [MERMAID_BLOCK_TYPE]: MermaidBlockSpec,
        [SVG_BLOCK_TYPE]: SvgBlockSpec,
    },
});

// Export the Block type from the schema
export type LocalBlock = typeof schema.Block;

// Export the schema instance for use in other parts of the application
export default schema;
