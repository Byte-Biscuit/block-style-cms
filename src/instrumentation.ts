export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        // Check required environment variables
        if (!process.env.CMS_DATA_PATH) {
            console.error('❌ Missing required environment variable: CMS_DATA_PATH');
            console.error('Please set in .env.local file: CMS_DATA_PATH=your_data_path');
            process.exit(1);
        }

        // 捕获未处理的错误
        process.on('unhandledRejection', (reason, promise) => {
            console.error('🔴 Unhandled Rejection at:', promise);
            console.error('🔴 Reason:', reason);
        });

        process.on('uncaughtException', (error) => {
            console.error('🔴 Uncaught Exception:', error);
        });

        // 动态导入 fs 模块，只在服务端环境中使用
        const fs = await import('fs/promises');
        const { ARTICLE_DIR,
            META_DIR,
            IMAGE_DIR,
            VIDEO_DIR,
            VIDEO_THUMBNAIL_DIR,
            AUDIO_DIR,
            FILE_DIR,
            COMMENT_DIR } = await import('@/settings');

        await fs.mkdir(ARTICLE_DIR, { recursive: true });
        await fs.mkdir(META_DIR, { recursive: true });
        await fs.mkdir(IMAGE_DIR, { recursive: true });
        await fs.mkdir(VIDEO_DIR, { recursive: true });
        await fs.mkdir(VIDEO_THUMBNAIL_DIR, { recursive: true });
        await fs.mkdir(AUDIO_DIR, { recursive: true });
        await fs.mkdir(FILE_DIR, { recursive: true });
        await fs.mkdir(COMMENT_DIR, { recursive: true });
        console.log('✅ Directories initialized');
    }
}