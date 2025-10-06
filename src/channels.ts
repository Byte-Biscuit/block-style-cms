/**
 * 导航配置管理
 * 统一管理所有导航链接和国际化键
 */

// 导航项类型定义
export interface Channel {
    id: string;                    // 唯一标识符
    href: string;                  // 链接路径（不国际化）
    labelKey: string;              // 国际化键名
    icon?: string;                 // 可选图标
    isExternal?: boolean;          // 是否外部链接
    requireAuth?: boolean;         // 是否需要登录
    mobileOnly?: boolean;          // 仅移动端显示
    desktopOnly?: boolean;         // 仅桌面端显示
}

// 主导航配置
export const channels: Channel[] = [
    {
        id: 'ai',
        href: '/channel/ai',
        labelKey: 'ai',
    },
    {
        id: 'instant',
        href: '/channel/instant',
        labelKey: 'instant',
    },
    {
        id: 'education',
        href: '/channel/education',
        labelKey: 'education',
    },
    {
        id: 'tags',
        href: '/channel/tags',
        labelKey: 'tags',
    },
    {
        id: 'about',
        href: '/channel/about',
        labelKey: 'about',
    },
] as const;
