/**
 * 美观的预设颜色方案 - 确保良好的对比度和视觉效果
 */
const AVATAR_COLORS = [
    { bg: "#EF4444", fg: "#FFFFFF" }, // Red
    { bg: "#F59E0B", fg: "#FFFFFF" }, // Amber
    { bg: "#10B981", fg: "#FFFFFF" }, // Emerald
    { bg: "#06B6D4", fg: "#FFFFFF" }, // Cyan
    { bg: "#3B82F6", fg: "#FFFFFF" }, // Blue
    { bg: "#8B5CF6", fg: "#FFFFFF" }, // Violet
    { bg: "#EC4899", fg: "#FFFFFF" }, // Pink
    { bg: "#F97316", fg: "#FFFFFF" }, // Orange
    { bg: "#14B8A6", fg: "#FFFFFF" }, // Teal
    { bg: "#6366F1", fg: "#FFFFFF" }, // Indigo
    { bg: "#A855F7", fg: "#FFFFFF" }, // Purple
    { bg: "#D946EF", fg: "#FFFFFF" }, // Fuchsia
    { bg: "#84CC16", fg: "#FFFFFF" }, // Lime
    { bg: "#22C55E", fg: "#FFFFFF" }, // Green
    { bg: "#0EA5E9", fg: "#FFFFFF" }, // Sky
    { bg: "#6D28D9", fg: "#FFFFFF" }, // Deep Purple
    { bg: "#DC2626", fg: "#FFFFFF" }, // Deep Red
    { bg: "#059669", fg: "#FFFFFF" }, // Deep Green
    { bg: "#0284C7", fg: "#FFFFFF" }, // Deep Blue
    { bg: "#7C3AED", fg: "#FFFFFF" }, // Deep Violet
    { bg: "#DB2777", fg: "#FFFFFF" }, // Deep Pink
    { bg: "#CA8A04", fg: "#FFFFFF" }, // Deep Yellow
    { bg: "#16A34A", fg: "#FFFFFF" }, // Deep Emerald
    { bg: "#0891B2", fg: "#FFFFFF" }, // Deep Cyan
    { bg: "#4F46E5", fg: "#FFFFFF" }, // Deep Indigo
    { bg: "#9333EA", fg: "#FFFFFF" }, // Deep Purple Alt
];

/**
 * 字符串哈希函数 - 用于确定性地生成数字
 */
function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
}

/**
 * 将任意字符映射到 A-Z 英文字母
 * 策略：
 * - 拉丁字母直接使用首字母大写
 * - 非拉丁字符（中文、日文等）通过哈希映射到 A-Z
 */
function getAvatarLetter(name: string): string {
    const trimmed = name.trim();
    if (!trimmed) {
        return "?";
    }

    // 获取第一个字符
    const firstChar = Array.from(trimmed)[0];
    if (!firstChar) {
        return "?";
    }

    // 如果是拉丁字母，直接返回大写
    if (/^[a-zA-Z]$/.test(firstChar)) {
        return firstChar.toUpperCase();
    }

    // 非拉丁字符，通过哈希映射到 A-Z
    const hash = hashString(firstChar);
    const letterIndex = hash % 26;
    return String.fromCharCode(65 + letterIndex); // 65 = 'A'
}

/**
 * 根据名称获取确定性的颜色方案
 */
function getAvatarColor(name: string): { bg: string; fg: string } {
    const hash = hashString(name);
    const colorIndex = hash % AVATAR_COLORS.length;
    return AVATAR_COLORS[colorIndex];
}

/**
 * 生成 SVG 格式的字母头像
 */
function generateLetterAvatarSvg(
    letter: string,
    size: number,
    backgroundColor: string,
    foregroundColor: string
): string {
    const fontSize = Math.floor(size * 0.5);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${backgroundColor}"/>
  <text x="50%" y="50%" fill="${foregroundColor}" font-family="system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif" font-size="${fontSize}" font-weight="600" text-anchor="middle" dominant-baseline="central">${letter}</text>
</svg>`;

    return `data:image/svg+xml;base64,${typeof btoa !== "undefined" ? btoa(svg) : Buffer.from(svg).toString("base64")}`;
}

/**
 * 生成字母头像（服务端和客户端通用）
 * @param name - 用户名称
 * @param size - 头像尺寸（默认 80px）
 * @returns SVG Data URL
 */
export function getLetterAvatar(name: string, size = 80): string {
    const letter = getAvatarLetter(name);
    const colors = getAvatarColor(name);
    return generateLetterAvatarSvg(letter, size, colors.bg, colors.fg);
}

/**
 * 服务端 MD5 哈希（使用 Node.js crypto）
 */
function md5Hash(email: string): string {
    if (typeof window === "undefined") {
        // 服务端 - 动态导入 crypto
        try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const crypto = require("crypto");
            return crypto.createHash("md5").update(email.toLowerCase().trim()).digest("hex");
        } catch {
            return "";
        }
    }
    // 客户端返回空字符串，强制使用字母头像
    return "";
}

/**
 * 客户端 MD5 哈希（使用 Web Crypto API）
 */
async function md5HashClient(email: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(email.toLowerCase().trim());
    const hashBuffer = await crypto.subtle.digest("MD5", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * 获取 Gravatar URL（服务端）
 * 使用字母头像作为默认值，当 Gravatar 不存在时显示
 * @param email - 用户邮箱
 * @param name - 用户名称（用于生成字母头像）
 * @param size - 头像尺寸
 * @returns Gravatar URL 或字母头像
 */
export function getGravatarUrl(email: string, name: string, size = 80): string {
    if (!email || typeof window !== "undefined") {
        // 没有邮箱或在客户端，直接返回字母头像
        return getLetterAvatar(name, size);
    }

    try {
        const hash = md5Hash(email);
        if (!hash) {
            return getLetterAvatar(name, size);
        }

        // 使用字母头像作为 Gravatar 的默认值
        const defaultAvatar = encodeURIComponent(getLetterAvatar(name, size));
        return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=${defaultAvatar}`;
    } catch {
        return getLetterAvatar(name, size);
    }
}

/**
 * 获取 Gravatar URL（客户端）
 * @param email - 用户邮箱
 * @param name - 用户名称
 * @param size - 头像尺寸
 * @returns Promise<Gravatar URL 或字母头像>
 */
export async function getGravatarUrlClient(
    email: string,
    name: string,
    size = 80
): Promise<string> {
    if (!email) {
        return getLetterAvatar(name, size);
    }

    try {
        const hash = await md5HashClient(email);
        if (!hash) {
            return getLetterAvatar(name, size);
        }

        const defaultAvatar = encodeURIComponent(getLetterAvatar(name, size));
        return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=${defaultAvatar}`;
    } catch {
        return getLetterAvatar(name, size);
    }
}

// 向后兼容的导出
export const getNickLetterAvatar = getLetterAvatar;
export const getNickLetterAvatarClient = async (name: string, size = 80) => getLetterAvatar(name, size);
