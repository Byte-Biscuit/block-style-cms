import { type ImageOptions } from '@/types/image';
/**
 * 优化 Pexels 图片 URL
 * @param url 原始 Pexels 图片 URL
 * @param options 优化选项
 * @returns 优化后的 URL
 */
export function optimizePexelsImageUrl(
    url: string,
    options: ImageOptions = {}
): string {
    const {
        width,
        height,
        quality = 85,
        autoCompress = true,
        colorSpace = 'tinysrgb',
        format,
        fit,
    } = options;

    const urlObj = new URL(url);
    const params = urlObj.searchParams;

    // 添加自动压缩
    if (autoCompress) {
        params.set('auto', 'compress');
    }
    // 添加颜色空间优化
    params.set('cs', colorSpace);
    // 设置尺寸参数
    if (width) {
        params.set('w', width.toString());
    }
    if (height) {
        params.set('h', height.toString());
    }
    // 填充方式
    if (fit) params.set("fit", fit);
    // 设置文件格式
    if (format) params.set("fm", format); // 可选：例如 'webp'，若 CDN 支持
    // 设置质量参数
    params.set('q', quality.toString());
    return urlObj.toString();
}

/**
 * 预设的优化配置
 */
export const PexelsOptimizePresets = {
    /** 缩略图优化 */
    thumbnail: {
        width: 300,
        quality: 75,
        autoCompress: true,
        colorSpace: 'tinysrgb' as const
    },
    /** 封面图片优化 */
    cover: {
        quality: 90,
        autoCompress: true,
        colorSpace: 'tinysrgb' as const
    },
    /** 高质量显示 */
    highQuality: {
        quality: 95,
        autoCompress: true,
        colorSpace: 'srgb' as const
    },
    /** 移动端优化 */
    mobile: {
        width: 400,
        quality: 70,
        autoCompress: true,
        colorSpace: 'tinysrgb' as const
    }
};

/**
 * 使用预设优化 Pexels 图片
 * @param url 原始 Pexels 图片 URL
 * @param preset 预设名称
 * @returns 优化后的 URL
 */
export function optimizePexelsImageWithPreset(
    url: string,
    preset: keyof typeof PexelsOptimizePresets
): string {
    return optimizePexelsImageUrl(url, PexelsOptimizePresets[preset]);
}
