// src/lib/services/channel-service.ts
import fs from 'fs/promises';
import path from 'path';
import { lruCacheService } from "@/lib/services/lru-cache-service";

export interface Channel {
    id: string;
    type: 'page' | 'tag';  // page: 普通页面, tag: 标签分类
    labelKey: string;       // 国际化 key
    href?: string;          // type=page 时使用
    tag?: string;           // type=tag 时使用 (格式: _channel_)
    icon?: string;                 // 可选图标
    isExternal?: boolean;          // 是否外部链接
}

export interface ChannelData {
    channels: Channel[];
}

class ChannelService {
    private configPath = path.join(process.env.CMS_DATA_PATH || 'data', 'channel.json');
    private cacheKey = 'channel_key';

    /**
     * Get all channels
     * @returns 
     */
    async getChannels(): Promise<Channel[]> {
        if (lruCacheService.has(this.cacheKey)) {
            return lruCacheService.get(this.cacheKey) as Channel[];
        }
        try {
            const fileContent = await fs.readFile(this.configPath, 'utf-8');
            const channels = JSON.parse(fileContent);
            if (channels) {
                lruCacheService.set(this.cacheKey, channels);
            }
            return channels;
        } catch (error) {
            console.error('Failed to load channel config:', error);
            return [];
        }
    }
}

export const channelService = new ChannelService();