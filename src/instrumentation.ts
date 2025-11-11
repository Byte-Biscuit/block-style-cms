export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
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
            FILE_DIR } = await import('@/config');

        await fs.mkdir(ARTICLE_DIR, { recursive: true });
        await fs.mkdir(META_DIR, { recursive: true });
        await fs.mkdir(IMAGE_DIR, { recursive: true });
        await fs.mkdir(VIDEO_DIR, { recursive: true });
        await fs.mkdir(VIDEO_THUMBNAIL_DIR, { recursive: true });
        await fs.mkdir(AUDIO_DIR, { recursive: true });
        await fs.mkdir(FILE_DIR, { recursive: true });
        console.log('✅ Directories initialized');
    }
}