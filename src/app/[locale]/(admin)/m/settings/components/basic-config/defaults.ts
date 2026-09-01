import {
    type BasicConfig,
    DEFAULT_EXPORT_MARK,
    DEFAULT_SYSTEM_CONFIG,
} from "@/types/system-config";

export const DEFAULT_BASIC_CONFIG: BasicConfig =
    DEFAULT_SYSTEM_CONFIG.basic as BasicConfig;

export function mergeWithDefaults(initialData?: BasicConfig): BasicConfig {
    if (!initialData) {
        return DEFAULT_BASIC_CONFIG;
    }

    return {
        comment: {
            enabled:
                initialData.comment?.enabled ??
                DEFAULT_BASIC_CONFIG.comment.enabled,
            maxTotalComments:
                initialData.comment?.maxTotalComments ??
                DEFAULT_BASIC_CONFIG.comment.maxTotalComments,
            limits: {
                contentMinLength:
                    initialData.comment?.limits?.contentMinLength ??
                    DEFAULT_BASIC_CONFIG.comment.limits.contentMinLength,
                contentMaxLength:
                    initialData.comment?.limits?.contentMaxLength ??
                    DEFAULT_BASIC_CONFIG.comment.limits.contentMaxLength,
                maxLinksAllowed:
                    initialData.comment?.limits?.maxLinksAllowed ??
                    DEFAULT_BASIC_CONFIG.comment.limits.maxLinksAllowed,
            },
            moderation: {
                requireApproval:
                    initialData.comment?.moderation?.requireApproval ??
                    DEFAULT_BASIC_CONFIG.comment.moderation.requireApproval,
            },
        },
        suggestion: {
            enabled:
                initialData.suggestion?.enabled ??
                DEFAULT_BASIC_CONFIG.suggestion.enabled,
            maxTotalSuggestions:
                initialData.suggestion?.maxTotalSuggestions ??
                DEFAULT_BASIC_CONFIG.suggestion.maxTotalSuggestions,
            limits: {
                contentMinLength:
                    initialData.suggestion?.limits?.contentMinLength ??
                    DEFAULT_BASIC_CONFIG.suggestion.limits.contentMinLength,
                contentMaxLength:
                    initialData.suggestion?.limits?.contentMaxLength ??
                    DEFAULT_BASIC_CONFIG.suggestion.limits.contentMaxLength,
                maxLinksAllowed:
                    initialData.suggestion?.limits?.maxLinksAllowed ??
                    DEFAULT_BASIC_CONFIG.suggestion.limits.maxLinksAllowed,
            },
        },
        other: {
            exportMark: {
                text:
                    initialData.other?.exportMark?.text ??
                    DEFAULT_EXPORT_MARK.text,
                uppercase:
                    initialData.other?.exportMark?.uppercase ??
                    DEFAULT_EXPORT_MARK.uppercase,
            },
        },
    };
}
