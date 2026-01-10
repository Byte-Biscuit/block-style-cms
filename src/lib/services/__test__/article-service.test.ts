import { fileURLToPath } from "url";
import path from "path";
import { describe, it, vi } from "vitest"


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// mock 必须在导入使用该模块之前执行
vi.mock('@/config', () => ({
    ARTICLE_DIR: path.join(__dirname, "..", "..", "..", "data", "articles"),
    META_DIR: path.join(__dirname, "..", "..", "..", "data", "meta")
}));

//The test run did not record any output.
const { articleService } = await import("../article-service");

describe("article-service", () => {
    it("Get Artilce Meata", () => {
        const articleMetadataFile = articleService.getMetadataFile();
        console.log("articleMetadataFile", articleMetadataFile);
    });
    it("Get latest articles", async () => {
        let locale = "en-US";
        let articles = await articleService.getArticlesByLocale(locale, 20);
        console.log(`Latest articles in ${locale}:`, articles.length);
        locale = "zh-TW";
        articles = await articleService.getArticlesByLocale(locale, 20);
        console.log(`Latest articles in ${locale}:`, articles.length);
        locale = "zh-CN";
        articles = await articleService.getArticlesByLocale(locale, 20);
        console.log(`Latest articles in ${locale}:`, articles.length);
        locale = "error";
        articles = await articleService.getArticlesByLocale(locale, 20);
        console.log(`Latest articles in ${locale}:`, articles.length);
    })
});
